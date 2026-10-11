
(() => {
  const API_URL=String(window.EDUGESTION_CONFIG?.API_URL||'').trim();
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data=null;
  let subjectFilter='';
  let periodFilter='';

  async function api(action,payload={}){
    if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/i.test(API_URL)) throw new Error('El portal todavía no está conectado con el servidor.');
    const r=await fetch(API_URL,{method:'POST',body:JSON.stringify({...payload,action}),redirect:'follow'});
    if(!r.ok)throw new Error(`Error de conexión ${r.status}`);
    const text=await r.text();
    let out;try{out=JSON.parse(text)}catch(_){throw new Error('El servidor devolvió una respuesta no válida.');}
    if(out.status!=='success')throw new Error(out.message||'No fue posible consultar la información.');
    return out;
  }

  function setView(name){
    document.querySelectorAll('.rep-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
    document.querySelectorAll('.rep-view').forEach(v=>v.classList.add('hidden'));
    $(`rep-view-${name}`)?.classList.remove('hidden');
  }

  function estadoClass(e){
    if(e==='Entrego'||e==='Tardia')return 'ok';
    if(e==='No entrego')return 'no';
    if(e==='Justificada')return 'just';
    return 'wait';
  }

  function filteredActivities(){
    const q=String($('rep-activity-search')?.value||'').toLowerCase();
    return (data?.actividades||[]).filter(x=>{
      if(subjectFilter && x.materia!==subjectFilter)return false;
      if(periodFilter && String(x.lapso||'')!==periodFilter)return false;
      if(q && !`${x.materia} ${x.actividad} ${x.estadoEntrega}`.toLowerCase().includes(q))return false;
      return true;
    });
  }

  function buildFilters(){
    const subjects=[...new Set((data?.actividades||[]).map(x=>String(x.materia||'')).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
    const periods=[...new Set((data?.actividades||[]).map(x=>String(x.lapso||'')).filter(Boolean))];
    $('rep-filter-subject').innerHTML='<option value="">Todas las materias</option>'+subjects.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
    $('rep-filter-period').innerHTML='<option value="">Todos los lapsos</option>'+periods.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
  }

  function renderAlert(){
    const missing=Number(data?.resumen?.noEntregadas||0);
    const pending=Number(data?.resumen?.pendientes||0);
    const box=$('rep-alert-banner');
    if(!box)return;
    if(missing>=2){
      box.classList.remove('hidden');
      box.innerHTML=`<i>⚠️</i><div><strong>Atención académica</strong><span>El estudiante tiene ${missing} actividades sin entregar${pending?` y ${pending} pendiente(s)`:''}. Revise la sección “Pendientes” y contacte al docente si necesita orientación.</span></div>`;
    }else{
      box.classList.add('hidden');
      box.innerHTML='';
    }
  }

  function renderSummaryCards(){
    const a=data.alumno||{},r=data.resumen||{},as=r.asistencia||{};
    $('rep-student-name').textContent=a.nombre||'Estudiante';
    $('rep-student-avatar').textContent=(a.nombre||'E').trim().charAt(0).toUpperCase();
    const cursos=(a.cursos||[]).map(c=>`${c.ano} · Sección ${c.seccion} · ${c.turno==='Manana'?'Mañana':c.turno}`).join(' | ');
    $('rep-student-meta').textContent=`C.I.: ${a.cedula||'—'}${cursos?` · ${cursos}`:''}`;
    $('rep-representative').textContent=a.representante?`Representante: ${a.representante}`:'Representante: no registrado';

    $('rep-kpi-subjects').textContent=r.materias||0;
    $('rep-kpi-activities').textContent=r.actividades||0;
    $('rep-kpi-delivered').textContent=r.entregadas||0;
    $('rep-kpi-missing').textContent=r.noEntregadas||0;
    $('rep-kpi-pending').textContent=r.pendientes||0;
    $('rep-kpi-attendance').textContent=`${as.porcentaje||0}%`;

    const materias=data?.materias||[];
    const puntosObtenidos=Math.round(materias.reduce((s,m)=>s+Number(m.puntosObtenidos||0),0)*100)/100;
    const puntosPlanificados=Math.round(materias.reduce((s,m)=>s+Number(m.puntosPlanificados||0),0)*100)/100;
    const proximo=(data?.compromisos||[])
      .filter(c=>String(c.estado||'').toUpperCase()==='PENDIENTE'&&c.fechaCompromiso)
      .sort((x,y)=>String(x.fechaCompromiso).localeCompare(String(y.fechaCompromiso)))[0];

    $('rep-family-delivered').textContent=r.entregadas||0;
    $('rep-family-pending').textContent=r.pendientes||0;
    $('rep-family-missing').textContent=r.noEntregadas||0;
    $('rep-family-points').textContent=puntosPlanificados?`${puntosObtenidos}/${puntosPlanificados}`:'—';
    $('rep-family-attendance').textContent=`${as.porcentaje||0}%`;
    $('rep-family-next').textContent=proximo?.fechaCompromiso||'Sin fecha';

    const status=$('rep-family-status-text');
    if(status){
      if(Number(r.noEntregadas||0)>=3)status.textContent='Requiere atención inmediata: existen varias actividades sin entregar.';
      else if(Number(r.noEntregadas||0)>=2)status.textContent='Requiere seguimiento: existen 2 o más actividades sin entregar.';
      else if(Number(r.pendientes||0)>0)status.textContent='Tiene actividades pendientes de entrega o corrección.';
      else status.textContent='Sin alertas académicas importantes en este momento.';
    }

    $('rep-last-update').textContent=new Date().toLocaleString('es-VE',{dateStyle:'short',timeStyle:'short'});
    renderAlert();
  }

  function renderSubjects(){
    const host=$('rep-subjects');
    let materias=(data?.materias||[]);
    if(subjectFilter)materias=materias.filter(m=>m.materia===subjectFilter);
    host.innerHTML=materias.map(m=>`<article class="rep-subject-card ${m.alerta?'is-alert':''}">
      <header><h3>${esc(m.materia)}</h3><span>${Number(m.puntosObtenidos||0)}/${Number(m.puntosPlanificados||0)} pts</span></header>
      <div class="rep-subject-stats">
        <div><b>${m.actividades||0}</b><small>Actividades</small></div>
        <div><b>${m.entregadas||0}</b><small>Entregadas</small></div>
        <div><b>${m.noEntregadas||0}</b><small>No entregadas</small></div>
        <div><b>${m.porcentaje||0}%</b><small>Rendimiento</small></div>
      </div>
      <div class="rep-progress"><span style="width:${Math.max(0,Math.min(100,Number(m.porcentaje||0)))}%"></span></div>
      ${m.alerta?'<p class="rep-card-alert">Atención: tiene 2 o más actividades sin entregar.</p>':''}
    </article>`).join('')||'<div class="rep-empty">Todavía no hay evaluaciones registradas.</div>';
  }

  function renderActivities(){
    const rows=filteredActivities();
    $('rep-activities-body').innerHTML=rows.map(x=>`<tr>
      <td><strong>${esc(x.materia)}</strong><br><small>${esc(x.docente||'')}</small></td>
      <td>${esc(x.actividad)}</td>
      <td>${esc(x.fechaPlanificada||'—')}</td>
      <td><span class="status ${estadoClass(x.estadoEntrega)}">${esc(x.estadoEntrega||'Pendiente')}</span></td>
      <td>${x.notaFinal===''||x.notaFinal==null?'Pendiente':`${esc(x.notaFinal)} / ${Number(x.puntos||0)}`}</td>
      <td>${x.notaRecuperacion===''||x.notaRecuperacion==null?'—':esc(x.notaRecuperacion)}</td>
    </tr>`).join('')||'<tr><td colspan="6" class="rep-empty">No hay actividades para mostrar.</td></tr>';
  }

  function renderPending(){
    const host=$('rep-pending-list');
    const list=(data?.actividades||[]).filter(x=>{
      if(subjectFilter && x.materia!==subjectFilter)return false;
      if(periodFilter && String(x.lapso||'')!==periodFilter)return false;
      return x.estadoEntrega==='No entrego'||x.estadoEntrega==='Pendiente';
    });
    host.innerHTML=list.map(x=>`<article class="rep-pending-card ${x.estadoEntrega==='No entrego'?'is-missing':'is-pending'}">
      <div>
        <span>${esc(x.materia)}</span>
        <strong>${esc(x.actividad)}</strong>
        <small>${esc(x.fechaPlanificada||'Sin fecha')}</small>
      </div>
      <span class="status ${estadoClass(x.estadoEntrega)}">${esc(x.estadoEntrega)}</span>
    </article>`).join('')||'<div class="rep-empty good-empty">No hay actividades pendientes o sin entregar con los filtros actuales.</div>';
  }

  function renderGrades(){
    const host=$('rep-grades-grid');
    let materias=(data?.materias||[]);
    if(subjectFilter)materias=materias.filter(m=>m.materia===subjectFilter);
    host.innerHTML=materias.map(m=>`<article class="rep-grade-card">
      <div class="rep-grade-top"><div><span>${esc(m.materia)}</span><strong>${Number(m.puntosObtenidos||0)} / ${Number(m.puntosPlanificados||0)} pts</strong></div><b>${Number(m.porcentaje||0)}%</b></div>
      <div class="rep-progress"><span style="width:${Math.max(0,Math.min(100,Number(m.porcentaje||0)))}%"></span></div>
      <small>${m.entregadas||0} entregadas · ${m.noEntregadas||0} no entregadas · ${m.pendientes||0} pendientes</small>
    </article>`).join('')||'<div class="rep-empty">No hay calificaciones disponibles.</div>';
  }

  function renderAttendance(){
    const host=$('rep-attendance-subjects');
    let rows=(data?.asistenciaPorMateria||[]);
    if(subjectFilter)rows=rows.filter(m=>m.materia===subjectFilter);
    host.innerHTML=rows.map(m=>{
      const pct=m.total?Math.round(((Number(m.presentes||0)+Number(m.tardanzas||0))/m.total)*100):0;
      return `<article class="rep-subject-card"><header><h3>${esc(m.materia)}</h3><span>${pct}% asistencia</span></header>
        <div class="rep-subject-stats"><div><b>${m.presentes||0}</b><small>Presentes</small></div><div><b>${m.ausentes||0}</b><small>Ausentes</small></div><div><b>${m.tardanzas||0}</b><small>Tardanzas</small></div><div><b>${m.justificadas||0}</b><small>Justificadas</small></div></div>
        <div class="rep-progress"><span style="width:${pct}%"></span></div></article>`;
    }).join('')||'<div class="rep-empty">Todavía no hay asistencia registrada.</div>';
  }

  function renderCommitments(){
    const host=$('rep-commitments');
    let rows=(data?.compromisos||[]);
    if(subjectFilter)rows=rows.filter(c=>c.materia===subjectFilter);
    host.innerHTML=rows.map(c=>`<article class="rep-commitment">
      <span><strong>${esc(c.materia||'Seguimiento')}</strong><small>${esc(c.fechaRegistro||'')}</small></span>
      <div><strong>${esc(c.compromiso||'Compromiso académico')}</strong><span>${c.fechaCompromiso?`Fecha acordada: ${esc(c.fechaCompromiso)}`:''}${c.resultado?` · Resultado: ${esc(c.resultado)}`:''}</span></div>
      <span class="rep-commitment-state ${String(c.estado).toUpperCase()==='RESUELTO'?'done':'pending'}">${esc(c.estado||'PENDIENTE')}</span>
    </article>`).join('')||'<div class="rep-empty">No hay compromisos académicos registrados.</div>';
  }

  function renderAll(){
    renderSummaryCards();
    renderSubjects();
    renderActivities();
    renderPending();
    renderGrades();
    renderAttendance();
    renderCommitments();
    $('rep-privacy').textContent=data.privacidad||'';
  }

  function printSummary(){
    if(!data)return;
    const a=data.alumno||{},r=data.resumen||{},as=r.asistencia||{};
    const materias=(data.materias||[]).map(m=>`<tr><td>${esc(m.materia)}</td><td>${m.entregadas||0}</td><td>${m.noEntregadas||0}</td><td>${Number(m.puntosObtenidos||0)}/${Number(m.puntosPlanificados||0)}</td><td>${m.porcentaje||0}%</td></tr>`).join('');
    const w=window.open('','_blank');if(!w)return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Resumen académico</title><style>body{font-family:Arial;padding:28px;color:#223}h1{font-size:20px;margin-bottom:4px}p{font-size:11px;color:#555}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:10px}th,td{border:1px solid #bbb;padding:7px;text-align:left}th{background:#f2f4f6}.k{display:flex;gap:10px;flex-wrap:wrap}.k span{border:1px solid #ccc;border-radius:8px;padding:8px 10px;font-size:10px}</style></head><body><h1>EduGestión · Resumen académico familiar</h1><p><b>${esc(a.nombre||'')}</b> · C.I. ${esc(a.cedula||'')}</p><p>Representante: ${esc(a.representante||'')}</p><div class="k"><span>Actividades: ${r.actividades||0}</span><span>Entregadas: ${r.entregadas||0}</span><span>No entregadas: ${r.noEntregadas||0}</span><span>Asistencia: ${as.porcentaje||0}%</span></div><table><thead><tr><th>Materia</th><th>Entregadas</th><th>No entregadas</th><th>Puntos</th><th>Rendimiento</th></tr></thead><tbody>${materias}</tbody></table><script>window.onload=()=>window.print();<\/script></body></html>`);
    w.document.close();
  }

  $('rep-login-form')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const cedula=String($('rep-cedula').value||'').trim();
    const codigo=String($('rep-codigo').value||'').replace(/\D/g,'').slice(0,6);
    const btn=$('rep-login-btn'),err=$('rep-login-error');
    err.classList.add('hidden');err.textContent='';
    btn.disabled=true;btn.textContent='Consultando…';
    try{
      data=await api('consultaRepresentantePublica',{cedula,codigo});
      subjectFilter='';periodFilter='';
      $('rep-login-view').classList.add('hidden');
      $('rep-dashboard').classList.remove('hidden');
      buildFilters();
      renderAll();
      setView('resumen');
      window.scrollTo({top:0,behavior:'smooth'});
    }catch(error){
      err.textContent=error.message||'No fue posible ingresar.';
      err.classList.remove('hidden');
    }finally{
      btn.disabled=false;
      btn.textContent='Consultar información';
    }
  });

  document.querySelectorAll('.rep-tabs button').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  $('rep-activity-search')?.addEventListener('input',renderActivities);
  $('rep-filter-subject')?.addEventListener('change',e=>{subjectFilter=e.target.value;renderAll();});
  $('rep-filter-period')?.addEventListener('change',e=>{periodFilter=e.target.value;renderAll();});
  $('rep-print')?.addEventListener('click',printSummary);
  $('rep-logout')?.addEventListener('click',()=>{
    data=null;subjectFilter='';periodFilter='';
    $('rep-dashboard').classList.add('hidden');
    $('rep-login-view').classList.remove('hidden');
    $('rep-codigo').value='';
    window.scrollTo({top:0,behavior:'smooth'});
  });
})();
