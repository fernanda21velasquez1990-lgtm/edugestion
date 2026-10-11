
(() => {
  const API_URL=String(window.EDUGESTION_CONFIG?.API_URL||'').trim();
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data=null;

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

  function render(){
    const a=data.alumno||{},r=data.resumen||{},as=r.asistencia||{};
    $('rep-student-name').textContent=a.nombre||'Estudiante';
    const cursos=(a.cursos||[]).map(c=>`${c.ano} · Sección ${c.seccion} · ${c.turno==='Manana'?'Mañana':c.turno}`).join(' | ');
    $('rep-student-meta').textContent=`C.I.: ${a.cedula||'—'}${cursos?` · ${cursos}`:''}`;
    $('rep-representative').textContent=a.representante?`Representante: ${a.representante}`:'Representante: no registrado';

    $('rep-kpi-subjects').textContent=r.materias||0;
    $('rep-kpi-activities').textContent=r.actividades||0;
    $('rep-kpi-delivered').textContent=r.entregadas||0;
    $('rep-kpi-missing').textContent=r.noEntregadas||0;
    $('rep-kpi-pending').textContent=r.pendientes||0;
    $('rep-kpi-attendance').textContent=`${as.porcentaje||0}%`;

    const subjects=$('rep-subjects');
    subjects.innerHTML=(data.materias||[]).map(m=>`<article class="rep-subject-card ${m.alerta?'is-alert':''}">
      <header><h3>${esc(m.materia)}</h3><span>${Number(m.puntosObtenidos||0)}/${Number(m.puntosPlanificados||0)} pts</span></header>
      <div class="rep-subject-stats">
        <div><b>${m.actividades||0}</b><small>Actividades</small></div>
        <div><b>${m.entregadas||0}</b><small>Entregadas</small></div>
        <div><b>${m.noEntregadas||0}</b><small>No entregadas</small></div>
        <div><b>${m.porcentaje||0}%</b><small>Rendimiento</small></div>
      </div>
      <div class="rep-progress"><span style="width:${Math.max(0,Math.min(100,Number(m.porcentaje||0)))}%"></span></div>
      ${m.alerta?'<p style="margin:9px 0 0;font-size:9px;font-weight:900;color:#a75c20">Atención: tiene 2 o más actividades sin entregar.</p>':''}
    </article>`).join('')||'<div class="rep-empty">Todavía no hay evaluaciones registradas.</div>';

    renderActivities(data.actividades||[]);

    const attendance=$('rep-attendance-subjects');
    attendance.innerHTML=(data.asistenciaPorMateria||[]).map(m=>{
      const pct=m.total?Math.round(((Number(m.presentes||0)+Number(m.tardanzas||0))/m.total)*100):0;
      return `<article class="rep-subject-card"><header><h3>${esc(m.materia)}</h3><span>${pct}% asistencia</span></header>
        <div class="rep-subject-stats"><div><b>${m.presentes||0}</b><small>Presentes</small></div><div><b>${m.ausentes||0}</b><small>Ausentes</small></div><div><b>${m.tardanzas||0}</b><small>Tardanzas</small></div><div><b>${m.justificadas||0}</b><small>Justificadas</small></div></div>
        <div class="rep-progress"><span style="width:${pct}%"></span></div></article>`;
    }).join('')||'<div class="rep-empty">Todavía no hay asistencia registrada.</div>';

    const commitments=$('rep-commitments');
    commitments.innerHTML=(data.compromisos||[]).map(c=>`<article class="rep-commitment">
      <span><strong>${esc(c.materia||'Seguimiento')}</strong><small>${esc(c.fechaRegistro||'')}</small></span>
      <div><strong>${esc(c.compromiso||'Compromiso académico')}</strong><span>${c.fechaCompromiso?`Fecha acordada: ${esc(c.fechaCompromiso)}`:''}${c.resultado?` · Resultado: ${esc(c.resultado)}`:''}</span></div>
      <span class="rep-commitment-state ${String(c.estado).toUpperCase()==='RESUELTO'?'done':'pending'}">${esc(c.estado||'PENDIENTE')}</span>
    </article>`).join('')||'<div class="rep-empty">No hay compromisos académicos registrados.</div>';

    $('rep-privacy').textContent=data.privacidad||'';
  }

  function renderActivities(list){
    const q=String($('rep-activity-search')?.value||'').toLowerCase();
    const rows=(list||[]).filter(x=>!q||`${x.materia} ${x.actividad} ${x.estadoEntrega}`.toLowerCase().includes(q));
    $('rep-activities-body').innerHTML=rows.map(x=>`<tr>
      <td><strong>${esc(x.materia)}</strong><br><small>${esc(x.docente||'')}</small></td>
      <td>${esc(x.actividad)}</td>
      <td>${esc(x.fechaPlanificada||'—')}</td>
      <td><span class="status ${estadoClass(x.estadoEntrega)}">${esc(x.estadoEntrega||'Pendiente')}</span></td>
      <td>${x.notaFinal===''||x.notaFinal==null?'Pendiente':`${esc(x.notaFinal)} / ${Number(x.puntos||0)}`}</td>
      <td>${x.notaRecuperacion===''||x.notaRecuperacion==null?'—':esc(x.notaRecuperacion)}</td>
    </tr>`).join('')||'<tr><td colspan="6" class="rep-empty">No hay actividades para mostrar.</td></tr>';
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
      $('rep-login-view').classList.add('hidden');
      $('rep-dashboard').classList.remove('hidden');
      render();setView('resumen');window.scrollTo({top:0,behavior:'smooth'});
    }catch(error){
      err.textContent=error.message||'No fue posible ingresar.';
      err.classList.remove('hidden');
    }finally{btn.disabled=false;btn.textContent='Consultar información';}
  });

  document.querySelectorAll('.rep-tabs button').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  $('rep-activity-search')?.addEventListener('input',()=>data&&renderActivities(data.actividades||[]));
  $('rep-logout')?.addEventListener('click',()=>{
    data=null;$('rep-dashboard').classList.add('hidden');$('rep-login-view').classList.remove('hidden');
    $('rep-codigo').value='';window.scrollTo({top:0,behavior:'smooth'});
  });
})();
