
(() => {
  const API_URL=String(window.EDUGESTION_CONFIG?.API_URL||'').trim();
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data=null;
  let subjectFilter='';
  let periodFilter='';
  let currentCedula='';
  let currentCodigo='';
  let autoRefreshTimer=null;
  let gradeQuestionActivity=null;

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

  function gradoNumeroPortal_(valor){
    const m=String(valor||'').match(/\d+/);
    return m?Number(m[0]):0;
  }

  function materiasEsperadasPortal_(){
    const cursos=Array.isArray(data?.alumno?.cursos)?data.alumno.cursos:[];
    const grados=[...new Set(cursos.map(c=>gradoNumeroPortal_(c.ano)).filter(Boolean))];
    const tieneSegundoOCuarto=grados.some(g=>g===2||g===4);
    return tieneSegundoOCuarto
      ? ['Educación Física','Orientación y Convivencia']
      : ['Educación Física'];
  }

  function buildFilters(){
    const esperadas=materiasEsperadasPortal_();
    const presentes=[...new Set([
      ...(data?.actividades||[]).map(x=>String(x.materia||'').trim()),
      ...(data?.materias||[]).map(x=>String(x.materia||'').trim()),
      ...((data?.resumen?.asistencia?.materias)||[]).map(x=>String(x.materia||'').trim())
    ].filter(Boolean))];

    // Regla institucional del profesor Eliu Flores:
    // 2.º y 4.º año ven Educación Física + Orientación y Convivencia.
    // Los demás años ven únicamente Educación Física.
    const permitidas=new Set(esperadas.map(x=>x.toLocaleLowerCase('es')));
    const subjects=[...new Set([
      ...esperadas,
      ...presentes.filter(x=>permitidas.has(x.toLocaleLowerCase('es')))
    ])];

    const periods=[...new Set((data?.actividades||[]).map(x=>String(x.lapso||'')).filter(Boolean))];
    $('rep-filter-subject').innerHTML='<option value="">Todas las materias</option>'+subjects.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
    $('rep-filter-period').innerHTML='<option value="">Todos los lapsos</option>'+periods.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
    const teacherSel=$('rep-meeting-teacher');
    if(teacherSel){
      const teachers=Array.isArray(data?.docentesReunion)?data.docentesReunion:[];
      teacherSel.innerHTML='<option value="">Selecciona el profesor</option>'+teachers.map(t=>`<option value="${esc(t.idProfesor)}">${esc(t.docente||'Docente')} · ${esc(t.materia||'Materia')}</option>`).join('');
    }
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

    renderNextActionsV82(r,as,proximo);
    $('rep-last-update').textContent=new Date().toLocaleString('es-VE',{dateStyle:'short',timeStyle:'short'});
    renderAlert();
  }


  function renderNextActionsV82(r,as,proximo){
    const host=$('rep-next-actions-list');if(!host)return;
    const items=[];
    if(Number(r?.noEntregadas||0)>0){
      items.push({icon:'⚠️',title:'Revisar actividades no entregadas',text:`Hay ${Number(r.noEntregadas||0)} actividad(es) sin entregar.`});
    }
    if(Number(r?.pendientes||0)>0){
      items.push({icon:'📝',title:'Revisar actividades pendientes',text:`Hay ${Number(r.pendientes||0)} actividad(es) pendiente(s) de entrega o corrección.`});
    }
    if(Number(as?.porcentaje||0)>0 && Number(as.porcentaje)<80){
      items.push({icon:'📅',title:'Atender la asistencia',text:`La asistencia registrada es ${Number(as.porcentaje||0)}%.`});
    }
    if(proximo?.fechaCompromiso){
      items.push({icon:'🤝',title:'Próximo compromiso',text:`Fecha acordada: ${proximo.fechaCompromiso}.`});
    }
    if(!items.length){
      items.push({icon:'✅',title:'Sin alertas prioritarias',text:'Mantenga la revisión periódica del portal y la comunicación con el docente.'});
    }
    host.innerHTML=items.slice(0,4).map(x=>`<article><span>${x.icon}</span><div><strong>${esc(x.title)}</strong><small>${esc(x.text)}</small></div></article>`).join('');
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


  function notaDisponible(x){
    return !(x?.notaFinal===''||x?.notaFinal===null||x?.notaFinal===undefined);
  }

  function estadoConfirmacionNota(x){
    const e=String(x?.confirmacionNota?.estado||'').toUpperCase();
    if(e==='VISTA_CONFIRMADA')return '<span class="rep-grade-read is-confirmed">✓ Nota vista por el representante</span>';
    if(e==='CONSULTA')return '<span class="rep-grade-read is-question">? Consulta enviada al docente</span>';
    return '';
  }

  function accionesNotaHTML(x){
    if(!notaDisponible(x)||!x?.claveEvaluacion)return '';
    const est=String(x?.confirmacionNota?.estado||'').toUpperCase();
    return `<div class="rep-grade-actions">
      <button type="button" class="rep-grade-confirm ${est==='VISTA_CONFIRMADA'?'is-done':''}" data-grade-confirm="${esc(x.claveEvaluacion)}" ${est==='VISTA_CONFIRMADA'?'disabled':''}>${est==='VISTA_CONFIRMADA'?'✓ Confirmado':'✓ Confirmo que vi la nota'}</button>
      <button type="button" class="rep-grade-question" data-grade-question="${esc(x.claveEvaluacion)}">💬 Tengo una duda con esta nota</button>
      ${estadoConfirmacionNota(x)}
    </div>`;
  }

  function buscarActividadPorClave(clave){
    return (data?.actividades||[]).find(x=>String(x.claveEvaluacion||'')===String(clave||''));
  }

  async function confirmarVistaNota(clave){
    const x=buscarActividadPorClave(clave);if(!x)return;
    try{
      const r=await api('confirmarVistaNotaRepresentante',{cedula:currentCedula,codigo:currentCodigo,claveEvaluacion:clave});
      x.confirmacionNota={estado:'VISTA_CONFIRMADA',actualizadoEn:r.actualizadoEn||'',problema:''};
      renderActivities();
    }catch(e){window.alert(e?.message||'No fue posible confirmar la lectura de la nota.');}
  }

  function abrirConsultaNota(clave){
    const x=buscarActividadPorClave(clave);if(!x)return;
    gradeQuestionActivity=x;
    $('rep-grade-question-info').innerHTML=`<strong>${esc(data?.alumno?.nombre||'Estudiante')}</strong><span>${esc(x.materia||'')} · ${esc(x.actividad||'Evaluación')}</span><span>Nota: <b>${esc(x.notaFinal)} / ${Number(x.puntos||0)}</b></span><span>Docente: ${esc(x.docente||'')}</span>`;
    $('rep-grade-question-text').value=x?.confirmacionNota?.problema||'';
    $('rep-grade-question-modal').classList.remove('hidden');
    setTimeout(()=>$('rep-grade-question-text')?.focus(),50);
  }

  function cerrarConsultaNota(){
    $('rep-grade-question-modal')?.classList.add('hidden');
    gradeQuestionActivity=null;
  }

  function whatsappNumero(raw){
    let d=String(raw||'').replace(/\D/g,'');
    if(/^0\d{10}$/.test(d))d='58'+d.slice(1);
    return d;
  }

  async function registrarConsultaNota(){
    const x=gradeQuestionActivity;if(!x)return;
    const problema=String($('rep-grade-question-text')?.value||'').trim();
    if(!problema){window.alert('Escribe brevemente cuál es la duda o problema con la calificación.');return;}
    const btn=$('rep-grade-question-whatsapp');
    btn.disabled=true;btn.textContent='Registrando…';
    try{
      const r=await api('registrarConsultaNotaRepresentante',{cedula:currentCedula,codigo:currentCodigo,claveEvaluacion:x.claveEvaluacion,problema});
      x.confirmacionNota={estado:'CONSULTA',actualizadoEn:r.actualizadoEn||'',problema};
      const w=r?.whatsapp||{};
      const mensaje=[
        'Buenas. Soy el representante de '+String(w.alumno||data?.alumno?.nombre||'el estudiante')+'.',
        'Tengo una consulta sobre una evaluación de '+String(w.materia||x.materia||'')+'.',
        'Evaluación: '+String(w.actividad||x.actividad||''),
        'Nota registrada: '+String(w.nota??x.notaFinal)+' / '+String(w.puntos??x.puntos),
        'Mi duda o problema: '+problema,
        'Agradezco por favor indicarme el motivo de esta calificación y la orientación correspondiente.'
      ].join('\n');
      const numero=whatsappNumero(w.telefono||x.telefonoDocente||'');
      cerrarConsultaNota();
      renderActivities();
      if(numero){window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`,'_blank','noopener');}
      else{
        try{await navigator.clipboard.writeText(mensaje);}catch(_){}
        window.alert('La consulta quedó registrada, pero el docente no tiene un número de WhatsApp registrado en EduGestión. El mensaje fue preparado para copiarlo y enviarlo por otro medio.');
      }
    }catch(e){window.alert(e?.message||'No fue posible registrar la consulta.');}
    finally{if(btn){btn.disabled=false;btn.textContent='Registrar y abrir WhatsApp';}}
  }

  function bindGradeActions(){
    document.querySelectorAll('[data-grade-confirm]').forEach(b=>b.addEventListener('click',()=>confirmarVistaNota(b.dataset.gradeConfirm)));
    document.querySelectorAll('[data-grade-question]').forEach(b=>b.addEventListener('click',()=>abrirConsultaNota(b.dataset.gradeQuestion)));
  }

  function renderActivities(){
    const rows=filteredActivities();
    $('rep-activities-body').innerHTML=rows.map(x=>`<tr>
      <td><strong>${esc(x.materia)}</strong><br><small>${esc(x.docente||'')}</small></td>
      <td>${esc(x.actividad)}</td>
      <td>${esc(x.fechaPlanificada||'—')}</td>
      <td><span class="status ${estadoClass(x.estadoEntrega)}">${esc(x.estadoEntrega||'Pendiente')}</span></td>
      <td><div class="rep-grade-cell"><strong>${x.notaFinal===''||x.notaFinal==null?'Pendiente':`${esc(x.notaFinal)} / ${Number(x.puntos||0)}`}</strong>${accionesNotaHTML(x)}</div></td>
      <td>${data?.visibilidad?.recuperaciones===false?'Oculto por el docente':(x.notaRecuperacion===''||x.notaRecuperacion==null?'—':esc(x.notaRecuperacion))}</td>
    </tr>`).join('')||'<tr><td colspan="6" class="rep-empty">No hay actividades para mostrar.</td></tr>';
    bindGradeActions();
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

    let detalle=(data?.asistenciaDetalle||[]);
    if(subjectFilter)detalle=detalle.filter(x=>x.materia===subjectFilter);
    const body=$('rep-attendance-detail');
    if(body)body.innerHTML=detalle.map(x=>`<tr>
      <td>${esc(x.fecha||'—')}</td><td><strong>${esc(x.materia||'')}</strong></td><td>${esc(x.docente||'')}</td>
      <td><span class="status ${estadoClass(x.estado)}">${esc(x.estado||'')}</span></td>
    </tr>`).join('')||'<tr><td colspan="4" class="rep-empty">No hay registros de asistencia para mostrar.</td></tr>';
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


  function estadoReunionClaseV87(estado){
    const e=String(estado||'PENDIENTE').toUpperCase();
    if(e==='CONFIRMADA')return 'is-confirmed';
    if(e==='CANCELADA')return 'is-cancelled';
    return 'is-pending';
  }

  function renderMeetingsV87(){
    const host=$('rep-meeting-list');if(!host)return;
    const rows=Array.isArray(data?.solicitudesReunion)?data.solicitudesReunion:[];
    if(!rows.length){
      host.innerHTML='<div class="rep-empty">Todavía no has solicitado reuniones con los docentes.</div>';
      return;
    }
    host.innerHTML=rows.map(r=>{
      const estado=String(r.estado||'PENDIENTE').toUpperCase();
      const confirmada=estado==='CONFIRMADA';
      return `<article class="rep-meeting-card ${estadoReunionClaseV87(estado)}">
        <div class="rep-meeting-card-top">
          <div><strong>${esc(r.docente||'Docente')}</strong><span>${esc(r.materia||'')}</span></div>
          <b>${confirmada?'Cita confirmada':'Cita por confirmar'}</b>
        </div>
        <p>${esc(r.motivo||'')}</p>
        <div class="rep-meeting-dates">
          <span><small>Fecha solicitada</small><strong>${esc(r.fechaSolicitada||'—')} · ${esc(r.horaSolicitada||'—')}</strong></span>
          <span><small>${confirmada?'Fecha confirmada':'Estado'}</small><strong>${confirmada?`${esc(r.fechaConfirmada||'—')} · ${esc(r.horaConfirmada||'—')}`:'Esperando confirmación del docente'}</strong></span>
        </div>
        ${r.respuestaDocente?`<div class="rep-meeting-response"><small>Mensaje del docente</small><strong>${esc(r.respuestaDocente)}</strong></div>`:''}
      </article>`;
    }).join('');
  }

  async function solicitarReunionV87(e){
    e?.preventDefault?.();
    const idProfesor=$('rep-meeting-teacher')?.value||'';
    const fechaSolicitada=$('rep-meeting-date')?.value||'';
    const horaSolicitada=$('rep-meeting-time')?.value||'';
    const motivo=String($('rep-meeting-reason')?.value||'').trim();
    const msg=$('rep-meeting-message');
    if(!idProfesor||!fechaSolicitada||!horaSolicitada||!motivo){
      if(msg){msg.textContent='Completa profesor, día, hora y motivo.';msg.className='rep-meeting-message is-error';}
      return;
    }
    const btn=$('rep-meeting-submit');if(btn){btn.disabled=true;btn.textContent='Enviando solicitud…';}
    try{
      const r=await api('solicitarReunionRepresentante',{cedula:currentCedula,codigo:currentCodigo,idProfesor,fechaSolicitada,horaSolicitada,motivo});
      if(msg){msg.textContent=r?.message||'Solicitud enviada. Cita por confirmar.';msg.className='rep-meeting-message is-success';}
      $('rep-meeting-reason').value='';
      const nuevo=await api('consultaRepresentantePublica',{cedula:currentCedula,codigo:currentCodigo});
      data=nuevo;buildFilters();renderAll();setView('reunion');
    }catch(err){
      if(msg){msg.textContent=err?.message||'No se pudo enviar la solicitud.';msg.className='rep-meeting-message is-error';}
    }finally{if(btn){btn.disabled=false;btn.textContent='Solicitar reunión';}}
  }

  function aplicarVisibilidadV81(){
    const v=data?.visibilidad||{};
    const map={
      calificaciones:v.notas!==false,
      asistencia:v.asistencia!==false,
      pendientes:v.pendientes!==false,
      compromisos:v.compromisos!==false
    };
    document.querySelectorAll('.rep-tabs button').forEach(b=>{
      const key=b.dataset.view;
      if(key==='calificaciones')b.classList.toggle('hidden',!map.calificaciones);
      if(key==='asistencia')b.classList.toggle('hidden',!map.asistencia);
      if(key==='pendientes')b.classList.toggle('hidden',!map.pendientes);
      if(key==='compromisos')b.classList.toggle('hidden',!map.compromisos);
    });
    $('rep-view-calificaciones')?.classList.toggle('privacy-hidden',!map.calificaciones);
    $('rep-view-asistencia')?.classList.toggle('privacy-hidden',!map.asistencia);
    $('rep-view-pendientes')?.classList.toggle('privacy-hidden',!map.pendientes);
    $('rep-view-compromisos')?.classList.toggle('privacy-hidden',!map.compromisos);
  }


  let weeklyActivities=[];

  function semanaEtiquetaV810(n){
    const num=Number(n||0);const ord=['','Primera semana','Segunda semana','Tercera semana','Cuarta semana','Quinta semana','Sexta semana','Séptima semana','Octava semana','Novena semana','Décima semana'];
    return ord[num]||`Semana ${num||''}`;
  }

  async function cargarActividadesSemanalesV810(silencioso=false){
    if(!currentCedula||!currentCodigo)return;
    const host=$('rep-weekly-activities');
    if(host&&!silencioso)host.innerHTML='<div class="rep-empty">Cargando actividades semanales…</div>';
    try{
      const r=await api('obtenerActividadesSemanalesRepresentante',{cedula:currentCedula,codigo:currentCodigo});
      weeklyActivities=Array.isArray(r?.actividades)?r.actividades:[];
      construirFiltrosSemanalesV810();
      renderActividadesSemanalesV810();
    }catch(e){
      if(host)host.innerHTML=`<div class="rep-empty">${esc(e?.message||'No fue posible cargar las actividades de la semana.')}</div>`;
    }
  }

  function construirFiltrosSemanalesV810(){
    const sel=$('rep-week-filter'); if(!sel)return;
    const actual=sel.value;
    const nums=[...new Set(weeklyActivities.map(x=>Number(x.semana||0)).filter(Boolean))].sort((a,b)=>a-b);
    sel.innerHTML='<option value="">Todas las semanas</option>'+nums.map(n=>`<option value="${n}">${esc(semanaEtiquetaV810(n))}</option>`).join('');
    if(nums.includes(Number(actual)))sel.value=actual;
    else if(nums.length)sel.value=String(nums[nums.length-1]);
  }

  function imagenSemanalUrlV810(x){return String(x.imagenUrl||x.urlImagen||'').trim();}
  function descargaSemanalUrlV810(x){return String(x.descargaUrl||x.imagenUrl||'').trim();}

  function imprimirActividadSemanalV810(id){
    const x=weeklyActivities.find(a=>String(a.id)===String(id));if(!x)return;
    const img=imagenSemanalUrlV810(x);const w=window.open('','_blank');if(!w)return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(x.titulo||'Actividad semanal')}</title><style>body{font-family:Arial;padding:22px;color:#234}h1{font-size:20px;margin:0 0 6px}.meta{font-size:12px;color:#667;margin-bottom:15px}img{display:block;max-width:100%;max-height:76vh;margin:auto;object-fit:contain;border:1px solid #ddd}.note{font-size:12px;margin-top:12px}</style></head><body><h1>${esc(x.titulo||'Actividad semanal')}</h1><div class="meta">${esc(semanaEtiquetaV810(x.semana))} · ${esc(x.area||'')} · ${esc(x.ano||'')} Sección ${esc(x.seccion||'')}</div>${img?`<img src="${esc(img)}" alt="Actividad semanal">`:''}<div class="note">${esc(x.descripcion||'')}</div><script>window.onload=()=>setTimeout(()=>window.print(),500);<\/script></body></html>`);w.document.close();
  }
  window.imprimirActividadSemanalV810=imprimirActividadSemanalV810;

  function renderActividadesSemanalesV810(){
    const host=$('rep-weekly-activities');if(!host)return;
    const sem=Number($('rep-week-filter')?.value||0);const area=String($('rep-week-area')?.value||'');
    let rows=weeklyActivities.slice().filter(x=>(!sem||Number(x.semana)===sem)&&(!area||String(x.area)===area));
    rows.sort((a,b)=>Number(a.semana||0)-Number(b.semana||0)||String(a.area||'').localeCompare(String(b.area||''),'es'));
    if(!rows.length){host.innerHTML='<div class="rep-empty good-empty">No se han publicado actividades para la selección indicada.</div>';return;}
    host.innerHTML=rows.map(x=>{const img=imagenSemanalUrlV810(x),down=descargaSemanalUrlV810(x);return `<article class="rep-week-card">
      <header><div><span>${esc(semanaEtiquetaV810(x.semana))}</span><strong>${esc(x.area||'Actividad')}</strong></div><small>${esc(x.fechaInicio||'')}${x.fechaFin?' al '+esc(x.fechaFin):''}</small></header>
      <h3>${esc(x.titulo||'Actividad de la semana')}</h3>
      ${img?`<button type="button" class="rep-week-image" data-week-open="${esc(img)}"><img src="${esc(img)}" alt="${esc(x.titulo||'Actividad semanal')}" loading="lazy"></button>`:'<div class="rep-week-noimage">Imagen no disponible</div>'}
      ${x.descripcion?`<p>${esc(x.descripcion)}</p>`:''}
      <div class="rep-week-actions">
        ${img?`<a href="${esc(img)}" target="_blank" rel="noopener">👁 Ver grande</a><a href="${esc(img)}" target="_blank" rel="noopener">💾 Guardar imagen</a>`:''}
        ${down?`<a href="${esc(down)}" target="_blank" rel="noopener">⬇ Descargar</a>`:''}
        <button type="button" data-week-print="${esc(x.id)}">🖨 Imprimir</button>
      </div></article>`}).join('');
    host.querySelectorAll('[data-week-open]').forEach(b=>b.addEventListener('click',()=>window.open(b.dataset.weekOpen,'_blank','noopener')));
    host.querySelectorAll('[data-week-print]').forEach(b=>b.addEventListener('click',()=>imprimirActividadSemanalV810(b.dataset.weekPrint)));
  }

  function renderAll(){
    aplicarVisibilidadV81();
    renderSummaryCards();
    renderSubjects();
    renderActivities();
    renderPending();
    renderGrades();
    renderAttendance();
    renderCommitments();
    renderMeetingsV87();
    if(weeklyActivities.length) renderActividadesSemanalesV810();
    const meetingDate=$('rep-meeting-date');if(meetingDate)meetingDate.min=new Date().toISOString().slice(0,10);
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


  async function refrescarPortal(silencioso=false){
    if(!currentCedula||!currentCodigo)return;
    try{
      const nuevo=await api('consultaRepresentantePublica',{cedula:currentCedula,codigo:currentCodigo});
      data=nuevo;
      buildFilters();
      renderAll();
      if(!silencioso)window.alert('Información académica actualizada.');
    }catch(e){if(!silencioso)window.alert(e?.message||'No se pudo actualizar la información.');}
  }

  function iniciarActualizacionAutomatica(){
    if(autoRefreshTimer)clearInterval(autoRefreshTimer);
    autoRefreshTimer=setInterval(()=>refrescarPortal(true),60000);
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
      currentCedula=cedula;currentCodigo=codigo;
      iniciarActualizacionAutomatica();
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
  $('rep-refresh')?.addEventListener('click',()=>refrescarPortal(false));
  $('rep-grade-question-close')?.addEventListener('click',cerrarConsultaNota);
  $('rep-grade-question-cancel')?.addEventListener('click',cerrarConsultaNota);
  $('rep-grade-question-whatsapp')?.addEventListener('click',registrarConsultaNota);
  $('rep-grade-question-modal')?.addEventListener('click',e=>{if(e.target===e.currentTarget)cerrarConsultaNota();});
  $('rep-meeting-form')?.addEventListener('submit',solicitarReunionV87);

  $('rep-logout')?.addEventListener('click',()=>{
    data=null;subjectFilter='';periodFilter='';currentCedula='';currentCodigo='';if(autoRefreshTimer){clearInterval(autoRefreshTimer);autoRefreshTimer=null;}
    $('rep-dashboard').classList.add('hidden');
    $('rep-login-view').classList.remove('hidden');
    $('rep-codigo').value='';
    window.scrollTo({top:0,behavior:'smooth'});
  });


  document.addEventListener('DOMContentLoaded',()=>{
    $('rep-week-filter')?.addEventListener('change',renderActividadesSemanalesV810);
    $('rep-week-area')?.addEventListener('change',renderActividadesSemanalesV810);
    $('rep-week-refresh')?.addEventListener('click',()=>cargarActividadesSemanalesV810());
    document.querySelector('[data-view="semanales"]')?.addEventListener('click',()=>cargarActividadesSemanalesV810(true));
  });
})();
