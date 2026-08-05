
const euro = n => new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(Number(n)||0);
const items = document.querySelector('#items');
const tpl = document.querySelector('#itemTemplate');

function recalc(){
  let subtotal=0;
  document.querySelectorAll('.item').forEach(row=>{
    const q=parseFloat(row.querySelector('.cantidad').value)||0;
    const p=parseFloat(row.querySelector('.precio').value)||0;
    const amount=q*p; subtotal+=amount;
    row.querySelector('.importe').value=euro(amount);
  });
  const travel=parseFloat(document.querySelector('#desplazamiento').value)||0;
  document.querySelector('#subtotal').textContent=euro(subtotal);
  document.querySelector('#travelTotal').textContent=euro(travel);
  document.querySelector('#total').textContent=euro(subtotal+travel);
}
function addItem(){
  const node=tpl.content.cloneNode(true);
  const row=node.querySelector('.item');
  row.addEventListener('input',recalc);
  row.querySelector('.remove').addEventListener('click',()=>{row.remove();recalc()});
  items.appendChild(node); recalc();
}
document.querySelector('#addBtn').onclick=addItem;
document.querySelector('#desplazamiento').addEventListener('input',recalc);
document.querySelector('#printBtn').onclick=()=>window.print();
document.querySelector('#newBtn').onclick=()=>{ if(confirm('¿Crear un presupuesto nuevo?')) location.reload(); };
document.querySelector('#shareBtn').onclick=async()=>{
  const cliente=document.querySelector('#cliente').value||'Cliente';
  const total=document.querySelector('#total').textContent;
  const text=`Presupuesto PintaPro · Pinturas Decodl SL\nCliente: ${cliente}\nTotal: ${total}`;
  if(navigator.share){ try{await navigator.share({title:'Presupuesto PintaPro',text})}catch(e){} }
  else { await navigator.clipboard.writeText(text); alert('Resumen copiado.'); }
};
addItem();
