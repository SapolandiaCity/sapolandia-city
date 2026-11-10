create extension if not exists "pgcrypto";

do $$ begin create type public.app_role as enum ('user','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.ticket_status as enum ('open','pending','closed'); exception when duplicate_object then null; end $$;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username) between 3 and 32),
  full_name text check (char_length(full_name) <= 80),
  avatar_url text,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_role_idx on public.profiles(role);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare base text; final text; n int := 0;
begin
  base := coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1), 'jogador');
  base := regexp_replace(lower(base), '[^a-z0-9_]', '', 'g');
  if char_length(base) < 3 then base := 'jogador'; end if;
  base := left(base, 24); final := base;
  while exists (select 1 from public.profiles where username = final) loop
    n := n + 1; final := base || n::text;
  end loop;
  insert into public.profiles (id, username, full_name)
  values (new.id, final, new.raw_user_meta_data->>'full_name');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
drop trigger if exists profiles_updated on public.profiles;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, icon text,
  sort_order int not null default 0, created_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text not null, description text,
  category_id uuid references public.categories(id) on delete set null,
  cover_url text, active boolean not null default true,
  featured boolean not null default false, sort_order int not null default 0,
  plays int not null default 0, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists games_category_idx on public.games(category_id);
drop trigger if exists games_updated on public.games;
create trigger games_updated before update on public.games for each row execute function public.set_updated_at();

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  created_at timestamptz not null default now(), unique (user_id, game_id)
);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  game_slug text not null,
  result text not null check (result in ('win','loss','draw')),
  score int not null default 0, created_at timestamptz not null default now()
);
create index if not exists sessions_user_idx on public.game_sessions(user_id, created_at desc);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null, subtitle text, image_url text, link_url text,
  active boolean not null default true, sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key, value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null, email text not null, subject text not null, message text not null,
  status public.ticket_status not null default 'open',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
drop trigger if exists tickets_updated on public.support_tickets;
create trigger tickets_updated before update on public.support_tickets for each row execute function public.set_updated_at();

create table if not exists public.audit_logs (
  id bigserial primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_email text, action text not null, entity text, entity_id text,
  metadata jsonb, created_at timestamptz not null default now()
);

alter table public.profiles        enable row level security;
alter table public.categories      enable row level security;
alter table public.games           enable row level security;
alter table public.favorites       enable row level security;
alter table public.game_sessions   enable row level security;
alter table public.banners         enable row level security;
alter table public.site_settings   enable row level security;
alter table public.support_tickets enable row level security;
alter table public.audit_logs      enable row level security;

create policy "profiles_select_self_or_admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_self" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_admin_all" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "categories_read" on public.categories for select using (true);
create policy "categories_admin_write" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "games_read_active" on public.games for select using (active = true or public.is_admin());
create policy "games_admin_write" on public.games for all using (public.is_admin()) with check (public.is_admin());
create policy "banners_read_active" on public.banners for select using (active = true or public.is_admin());
create policy "banners_admin_write" on public.banners for all using (public.is_admin()) with check (public.is_admin());
create policy "settings_read" on public.site_settings for select using (true);
create policy "settings_admin_write" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

create policy "favorites_own_select" on public.favorites for select using (user_id = auth.uid());
create policy "favorites_own_insert" on public.favorites for insert with check (user_id = auth.uid());
create policy "favorites_own_delete" on public.favorites for delete using (user_id = auth.uid());

create policy "sessions_own_select" on public.game_sessions for select using (user_id = auth.uid() or public.is_admin());
create policy "sessions_own_insert" on public.game_sessions for insert with check (user_id = auth.uid());

create policy "tickets_own_select" on public.support_tickets for select using (user_id = auth.uid() or public.is_admin());
create policy "tickets_insert_any" on public.support_tickets for insert with check (user_id is null or user_id = auth.uid());
create policy "tickets_admin_update" on public.support_tickets for update using (public.is_admin()) with check (public.is_admin());

create policy "logs_admin_read" on public.audit_logs for select using (public.is_admin());
create policy "logs_auth_insert" on public.audit_logs for insert with check (auth.uid() is not null and actor_id = auth.uid());

create or replace function public.bump_game_plays(game_slug text) returns void
language sql security definer set search_path = public as $$
  update public.games set plays = plays + 1 where slug = game_slug;
$$;

insert into storage.buckets (id, name, public) values ('avatars','avatars', true) on conflict (id) do nothing;
create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_own_write" on storage.objects for insert with check (bucket_id = 'avatars' and owner = auth.uid());
create policy "avatars_own_update" on storage.objects for update using (bucket_id = 'avatars' and owner = auth.uid());

insert into public.categories (slug, name, icon, sort_order) values
  ('slots','Slots','sparkles',1),('arcade','Arcade','gamepad-2',2),('crash','Crash','trending-up',3),
  ('roleta','Roleta','circle-dot',4),('cartas','Cartas','layers',5),('rapidos','Jogos rápidos','zap',6),
  ('animais','Jogos de animais','paw-print',7)
on conflict (slug) do nothing;

insert into public.games (slug, title, description, category_id, featured, sort_order)
select v.slug, v.title, v.description, c.id, v.featured, v.ord from (values
  ('coelho','Coelho','Escolha a toca certa e multiplique suas fichas.','animais', true, 1),
  ('rato','Rato','Cave o queijo sem cair na armadilha.','animais', false, 2),
  ('touro','Touro','Pare a barra no centro e domine o touro.','rapidos', true, 3),
  ('tigre','Tigre','Repita a sequência do rugido.','animais', false, 4),
  ('dragao','Dragão','Duelo de dados contra o dragão.','cartas', true, 5),
  ('roleta','Roleta','Gire a roda e descubra o multiplicador.','roleta', true, 6),
  ('slots','Slots','Três rolos, símbolos iguais, prêmio.','slots', true, 7),
  ('crash','Crash','Retire antes do estouro.','crash', true, 8)
) as v(slug, title, description, cat, featured, ord)
join public.categories c on c.slug = v.cat
on conflict (slug) do nothing;

insert into public.site_settings (key, value) values
  ('general', '{"siteName":"Sapolandia Play","tagline":"Jogue grátis. Sem dinheiro real.","supportEmail":"suporte@sapolandia.play"}'::jsonb)
on conflict (key) do nothing;

-- Promover admin depois de criar a conta:
-- update public.profiles set role = 'admin' where username = 'SEU_USUARIO';
