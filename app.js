const euro = n => new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(Number(n)||0);
const items = document.querySelector('#items');
const tpl = document.querySelector('#itemTemplate');
const KEY='pintapro-presupuesto';

function data(){
  return {
    cliente:document.querySelector('#cliente').value,
    telefono:document.querySelector('#telefono').value,
    direccion:document.querySelector('#direccion').value,
    km:document.querySelector('#km').value,
    desplazamiento:document.querySelector('#desplazamiento').value,
    notas:document.querySelector('#notas').value,
    trabajos:[...document.querySelectorAll('.item')].map(row=>({
      concepto:row.querySelector('.concepto').value,
      cantidad:row.querySelector('.cantidad').value,
      unidad:row.querySelector('.unidad').value,
      precio:row.querySelector('.precio').value
    }))
  };
}
function save(){ localStorage.setItem(KEY,JSON.stringify(data())); }
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
  const km=parseFloat(document.querySelector('#km').value)||0;
  document.querySelector('#travelHint').style.fontWeight=km>=50?'700':'400';
  document.querySelector('#travelHint').style.color=km>=50?'#b45309':'#6b7280';
  save();
}
function addItem(d={}){
  const node=tpl.content.cloneNode(true);
  const row=node.querySelector('.item');
  row.querySelector('.concepto').value=d.concepto||'Pintura paredes/techos';
  row.querySelector('.cantidad').value=d.cantidad??0;
  row.querySelector('.unidad').value=d.unidad||'m²';
  row.querySelector('.precio').value=d.precio??0;
  row.addEventListener('input',recalc);
  row.addEventListener('change',recalc);
  row.querySelector('.remove').addEventListener('click',()=>{
    row.remove();
    if(!document.querySelector('.item')) addItem();
    recalc();
  });
  items.appendChild(node); recalc();
}
function restore(){
  try{
    const d=JSON.parse(localStorage.getItem(KEY));
    if(!d){addItem();return;}
    document.querySelector('#cliente').value=d.cliente||'';
    document.querySelector('#telefono').value=d.telefono||'';
    document.querySelector('#direccion').value=d.direccion||'';
    document.querySelector('#km').value=d.km||0;
    document.querySelector('#desplazamiento').value=d.desplazamiento||0;
    document.querySelector('#notas').value=d.notas||'';
    (d.trabajos?.length?d.trabajos:[{}]).forEach(addItem);
  }catch(e){addItem();}
}
function resumen(){
  const d=data();
  const trabajos=d.trabajos.map((x,i)=>{
    const imp=(parseFloat(x.cantidad)||0)*(parseFloat(x.precio)||0);
    return `${i+1}. ${x.concepto}: ${x.cantidad||0} ${x.unidad} × ${euro(x.precio)} = ${euro(imp)}`;
  }).join('\n');
  return `Presupuesto PintaPro · Pinturas Deco DLSL
Cliente: ${d.cliente||'Sin indicar'}
${d.telefono?`Teléfono: ${d.telefono}\n`:''}${d.direccion?`Dirección: ${d.direccion}\n`:''}
${trabajos}
${Number(d.desplazamiento)>0?`\nDesplazamiento: ${euro(d.desplazamiento)}`:''}
TOTAL: ${document.querySelector('#total').textContent}
${d.notas?`\nObservaciones: ${d.notas}`:''}`;
}
document.querySelector('#addBtn').onclick=()=>addItem();
['cliente','telefono','direccion','km','desplazamiento','notas'].forEach(id=>document.querySelector('#'+id).addEventListener('input',recalc));
document.querySelector('#printBtn').onclick=()=>window.print();
document.querySelector('#newBtn').onclick=()=>{if(confirm('¿Crear un presupuesto nuevo? Se borrarán los datos actuales.')){localStorage.removeItem(KEY);location.reload();}};
document.querySelector('#shareBtn').onclick=async()=>{
  const text=resumen();
  if(navigator.share){try{await navigator.share({title:'Presupuesto PintaPro',text});return}catch(e){if(e.name==='AbortError')return}}
  try{await navigator.clipboard.writeText(text);alert('Resumen completo copiado.')}catch(e){alert('No se pudo copiar automáticamente.')}
};
restore();
