let balance=1000;
const fmt=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
function play(name){
 const toast=document.getElementById('toast');
 toast.textContent=`🎮 ${name}: demonstração visual em breve! Nenhuma aposta real foi feita.`;
 toast.classList.add('show');
 setTimeout(()=>toast.classList.remove('show'),3200);
}
document.getElementById('balance').textContent=fmt(balance);
