const symbols=['🐯','🪙','🍀','💎','🔔','🐉'];let credits=1000,spinning=false;
const balance=document.querySelector('#balance'),reels=[...document.querySelectorAll('.reel')],result=document.querySelector('#result'),button=document.querySelector('#spin'),bet=document.querySelector('#bet');
const money=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
function render(){balance.textContent=money(credits)}
button.addEventListener('click',()=>{if(spinning)return;let stake=Number(bet.value);if(credits<stake){result.textContent='Saldo insuficiente. Recarregue a página para reiniciar os créditos.';return}
spinning=true;button.disabled=true;credits-=stake;render();result.textContent='Girando...';reels.forEach(r=>r.classList.add('spin'));
setTimeout(()=>{const out=reels.map(()=>symbols[Math.floor(Math.random()*symbols.length)]);reels.forEach((r,i)=>{r.textContent=out[i];r.classList.remove('spin')});
let m=0;if(out.every(x=>x==='🐯'))m=10;else if(out.every(x=>x==='🪙'))m=5;else if(out.every(x=>x===out[0]))m=3;else if(out[0]===out[1]||out[1]===out[2]||out[0]===out[2])m=1.5;
if(m){let prize=Math.floor(stake*m);credits+=prize;result.textContent=`🎉 ${out.join(' ')} — ganhou ${money(prize)} (${m}x)!`}else result.textContent=`${out.join(' ')} — não foi dessa vez. Tente novamente!`;
render();spinning=false;button.disabled=false},1100)});render();