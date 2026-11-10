import type { ComponentType } from 'react'
import { Coelho, Rato, Touro, Tigre, Dragao, Roleta, Slots, Crash } from '@/pages/games'

export interface GameMeta {
  slug: string
  title: string
  description: string
  category: string
  component: ComponentType
}

export const GAME_REGISTRY: Record<string, GameMeta> = {
  coelho: { slug: 'coelho', title: 'Coelho', description: 'Escolha a toca certa e multiplique suas fichas.', category: 'animais', component: Coelho },
  rato: { slug: 'rato', title: 'Rato', description: 'Cave o queijo sem cair na armadilha.', category: 'animais', component: Rato },
  touro: { slug: 'touro', title: 'Touro', description: 'Pare a barra no centro e domine o touro.', category: 'rapidos', component: Touro },
  tigre: { slug: 'tigre', title: 'Tigre', description: 'Repita a sequência do rugido.', category: 'animais', component: Tigre },
  dragao: { slug: 'dragao', title: 'Dragão', description: 'Duelo de dados contra o dragão.', category: 'cartas', component: Dragao },
  roleta: { slug: 'roleta', title: 'Roleta', description: 'Gire a roda e descubra o multiplicador.', category: 'roleta', component: Roleta },
  slots: { slug: 'slots', title: 'Slots', description: 'Três rolos, símbolos iguais, prêmio.', category: 'slots', component: Slots },
  crash: { slug: 'crash', title: 'Crash', description: 'Retire antes do estouro.', category: 'crash', component: Crash },
}

export const GAME_LIST = Object.values(GAME_REGISTRY)
