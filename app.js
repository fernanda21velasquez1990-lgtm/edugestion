// ==========================================================================
// CONFIGURACIÓN: URL DE GOOGLE APPS SCRIPT
// ==========================================================================
const API_URL = "https://script.google.com/macros/s/AKfycby1ey7sg2VurvRbzWsa03heZ-i7ctMkvrBUC_9ifjpULmAgDPIFCh17I1lxE4-KnThZ/exec"; 

// Variables globales de sesión
let profesorActual = null;
let alumnosSeccion = [];
let planificacionesMateria = [];
let horariosProfesor = [];
let asistenciaTemporal = {};

// ==========================================================================
// ELEMENTOS DEL DOM
// ==========================================================================
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const whatsappInput = document.getElementById('whatsapp-input');
const btnLogin = document.getElementById('btn-login');
const loginError = document.getElementById('login-error');

// Barra del Profesor
const profesorName = document.getElementById('profesor-name');
const profesorMateria = document.getElementById('profesor-materia');
const btnLogout = document.getElementById('btn-logout');

// Botones de Pestañas
const tabAsistencia = document.getElementById('tab-asistencia');
const tabPlanificacion = document.getElementById('tab-planificacion');
const tabActas = document.getElementById('tab-actas');
const tabHorario = document.getElementById('tab-horario');

// Secciones contenedoras
const sectionAsistencia = document.getElementById('section-asistencia');
const sectionPlanificacion = document.getElementById('section-planificacion');
const sectionActas = document.getElementById('section-actas');
const sectionHorario = document.getElementById('section-horario');

// Elementos de Asistencia
const selectFiltroAno = document.getElementById('select-filtro-ano');
const selectFiltroSeccion = document.getElementById('select-filtro-seccion');
const selectFiltroTurno = document.getElementById('select-filtro-turno');
const btnCargarListaFiltrada = document.getElementById('btn-cargar-lista-filtrada');
const asistenciaInfo = document.getElementById('asistencia-info');
const contadorAsistencia = document.getElementById('contador-asistencia');
const listaAlumnosAsistencia = document.getElementById('lista-alumnos-asistencia');
const btnGuardarAsistencia = document.getElementById('btn-guardar-asistencia');

// Elementos del Generador de Clases de Hoy
const boxClasesHoy = document.getElementById('box-clases-hoy');
const listaBotonesClasesHoy = document.getElementById('lista-botones-clases-hoy');

// Elementos del Informe
const panelInformeAsistencia = document.getElementById('panel-informe-asistencia');
const countReportPresentes = document.getElementById('count-report-presentes');
const countReportInasistentes = document.getElementById('count-report-inasistentes');
const reportPresentesList = document.getElementById('report-presentes-list');
const reportInasistentesList = document.getElementById('report-inasistentes-list');
const informeMeta = document.getElementById('informe-meta');
const btnInformeImprimir = document.getElementById('btn-informe-imprimir');
const btnInformeWhatsapp = document.getElementById('btn-informe-whatsapp');

// Elementos de Planificación y Calificaciones
const formPlanificacion = document.getElementById('form-planificacion');
const selectEvaluacion = document.getElementById('select-evaluacion');
const listaAlumnosNotas = document.getElementById('lista-alumnos-notas');
const btnEnviarNotas = document.getElementById('btn-enviar-notes');

// Elementos de Actas
const actaSelectAlumno = document.getElementById('acta-select-alumno');
const actaRepresentante = document.getElementById('acta-representante');
const formActas = document.getElementById('form-actas');
const btnActaImprimir = document.getElementById('btn-acta-imprimir');
const btnActaWhatsapp = document.getElementById('btn-acta-whatsapp');

// Elementos de Horario
const formHorario = document.getElementById('form-horario');
const listaTablaHorarios = document.getElementById('lista-tabla-horarios');

// ==========================================================================
// SISTEMA DE NAVEGACIÓN ENTRE PESTAÑAS (TABS)
// ==========================================================================
function cambiarPestana(activaTab, activaSection) {
  [tabAsistencia, tabPlanificacion, tabActas, tabHorario].forEach(tab => {
    tab.className = "py-3 rounded-xl font-bold text-xs sm:text-sm text-center text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1.5";
  });
  [sectionAsistencia, sectionPlanificacion, sectionActas, sectionHorario].forEach(sec => sec.classList.add('hidden'));

  activaTab.className = "py-3 rounded-xl font-bold text-xs sm:text-sm text-center bg-indigo-50 text-indigo-700 flex items-center justify-center gap-1.5";
  activaSection.classList.remove('hidden');
}

tabAsistencia.addEventListener('click', () => {
  cambiarPestana(tabAsistencia, sectionAsistencia);
  detectarClaseAutomatica();
});
tabPlanificacion.addEventListener('click', () => {
  cambiarPestana(tabPlanificacion, sectionPlanificacion);
  cargarPlanificaciones();
});
tabActas.addEventListener('click', async () => {
  cambiarPestana(tabActas, sectionActas);
  // 🔥 MEJORA: Forzamos la carga de alumnos de la sección actual antes de llenar el select
  await asegurarYAlimentarAlumnosActas();
});
tabHorario.addEventListener('click', () => {
  cambiarPestana(tabHorario, sectionHorario);
  cargarHorariosRegistrados();
});

// ==========================================================================
// INICIO DE SESIÓN
// ==========================================================================
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const telefono = whatsappInput.value.trim();
  if (!telefono) return;

  btnLogin.disabled = true;
  btnLogin.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> <span>Verificando...</span>`;
  loginError.classList.add('hidden');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'loginProfesor', telefono: telefono })
    });
    const data = await response.json();

    if (data.status === 'success') {
      profesorActual = data.profesor;
      irAlDashboard();
    } else {
      mostrarError(data.message || 'Número de WhatsApp no registrado.');
    }
  } catch (error) {
    console.error(error);
    mostrarError('Error de conexión con el servidor.');
  } finally {
    btnLogin.disabled = false;
    btnLogin.innerHTML = `<span>Ingresar al Sistema</span> <i class="fa-solid fa-arrow-right-to-bracket"></i>`;
  }
});

function mostrarError(mensaje) {
  loginError.textContent = mensaje;
  loginError.classList.remove('hidden');
}

async function irAlDashboard() {
  loginScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');

  profesorName.textContent = profesorActual.nombre;
  profesorMateria.textContent = `${profesorActual.materia}`;

  await cargarHorariosParaDeteccion();
  detectarClaseAutomatica();
}

// ==========================================================================
// MÓDULO A: ASISTENCIA TÁCTIL (P e I) Y DETECTOR DE CLASES
// ==========================================================================

async function cargarHorariosParaDeteccion() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'obtenerHorarios', idProfesor: profesorActual.id })
    });
    const data = await response.json();
    if (data.status === 'success') {
      horariosProfesor = data.horarios;
    }
  } catch (e) { console.error(e); }
}

function formatearHoraLimpia(horaStr) {
  if (!horaStr) return "--:--";
  let h = horaStr.toString().trim();
  if (h.includes("T")) h = h.split("T")[1];
  if (h.includes(" ")) {
    const segmentos = h.split(" ");
    const encontrado = segmentos.find(s => s.includes(":"));
    if (encontrado) h = encontrado;
  }
  const partes = h.split(":");
  if (partes.length >= 2) {
    let hora = partes[0].padStart(2, '0');
    let minuto = partes[1].padStart(2, '0');
    if (hora.length > 2) hora = hora.substring(hora.length - 2);
    return `${hora}:${minuto}`;
  }
  return h.substring(0, 5);
}

function detectarClaseAutomatica() {
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
  const diaHoy = diasSemana[new Date().getDay()];

  const clasesDeHoy = horariosProfesor.filter(h => {
    const diaNormalizado = h.dia.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const hoyNormalizado = diaHoy.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    return diaNormalizado === hoyNormalizado;
  });

  if (clasesDeHoy.length > 0) {
    boxClasesHoy.classList.remove('hidden');
    listaBotonesClasesHoy.innerHTML = '';
    
    clasesDeHoy.forEach(clase => {
      const hIn = formatearHoraLimpia(clase.horaInicio);
      const hFi = formatearHoraLimpia(clase.horaFin);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bg-white hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-4 py-2 rounded-xl transition duration-150 shadow-sm flex items-center gap-1.5';
      btn.innerHTML = `<i class="fa-solid fa-play text-indigo-500"></i> ${clase.ano} "${clase.seccion}" • [${hIn} - ${hFi}] (${clase.turno})`;
      
      btn.addEventListener('click', () => {
        selectFiltroAno.value = clase.ano;
        selectFiltroSeccion.value = clase.seccion;
        selectFiltroTurno.value = clase.turno;
        cargarAlumnosDeSeccion();
      });
      listaBotonesClasesHoy.appendChild(btn);
    });
  } else {
    boxClasesHoy.classList.add('hidden');
  }
}

btnCargarListaFiltrada.addEventListener('click', async () => {
  btnCargarListaFiltrada.disabled = true;
  btnCargarListaFiltrada.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i>`;
  await cargarAlumnosDeSeccion();
  btnCargarListaFiltrada.disabled = false;
  btnCargarListaFiltrada.innerHTML = `<i class="fa-solid fa-users-viewfinder"></i> Cargar Alumnos`;
});

async function cargarAlumnosDeSeccion() {
  const ano = selectFiltroAno.value;
  const seccion = selectFiltroSeccion.value;
  const turno = selectFiltroTurno.value;

  asistenciaInfo.textContent = `Asistencia: ${ano} - Sección ${seccion} (${turno})`;
  panelInformeAsistencia.classList.add('hidden');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'obtenerAlumnos', seccion: seccion, turno: turno })
    });
    const data = await response.json();
    if (data.status === 'success') {
      alumnosSeccion = data.alumnos.filter(alumno => {
        const alumnoAno = (alumno.ano || "1ero").toString().trim().toUpperCase();
        return alumnoAno === ano.trim().toUpperCase();
      });
      
      contadorAsistencia.textContent = `Total: ${alumnosSeccion.length}`;
      renderizarListaAsistenciaTactil(alumnosSeccion);
    }
  } catch (e) { console.error("Error al cargar alumnos", e); }
}

function renderizarListaAsistenciaTactil(alumnos) {
  listaAlumnosAsistencia.innerHTML = '';
  asistenciaTemporal = {};

  if (alumnos.length === 0) {
    listaAlumnosAsistencia.innerHTML = `
      <div class="py-12 text-center text-gray-400">
        <i class="fa-solid fa-folder-open text-3xl mb-2"></i>
        <p class="text-sm font-semibold">No hay alumnos para esta sección.</p>
      </div>
    `;
    return;
  }

  alumnos.forEach((alumno) => {
    asistenciaTemporal[alumno.id] = "Presente";

    const item = document.createElement('div');
    item.className = 'py-4 flex items-center justify-between gap-4 border-b border-gray-100';
    item.id = `item-alumno-${alumno.id}`;

    item.innerHTML = `
      <div>
        <div class="text-sm font-bold text-gray-900">${alumno.nombre}</div>
        <div class="text-xs text-gray-400">Representante: ${alumno.representante}</div>
      </div>
      <div class="flex gap-1.5">
        <button type="button" onclick="marcarEstado('${alumno.id}', 'Presente')" id="btn-p-${alumno.id}" class="w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center transition bg-green-500 text-white shadow-sm">P</button>
        <button type="button" onclick="marcarEstado('${alumno.id}', 'Ausente')" id="btn-i-${alumno.id}" class="w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center transition bg-gray-100 text-gray-400">I</button>
      </div>
    `;
    listaAlumnosAsistencia.appendChild(item);
  });
}

window.marcarEstado = function(idAlumno, estado) {
  asistenciaTemporal[idAlumno] = estado;
  const btnP = document.getElementById(`btn-p-${idAlumno}`);
  const btnI = document.getElementById(`btn-i-${idAlumno}`);
  if (estado === "Presente") {
    btnP.className = "w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center transition bg-green-500 text-white shadow-sm";
    btnI.className = "w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center transition bg-gray-100 text-gray-400";
  } else {
    btnP.className = "w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center transition bg-gray-100 text-gray-400";
    btnI.className = "w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center transition bg-red-500 text-white shadow-sm";
  }
};

btnGuardarAsistencia.addEventListener('click', async () => {
  if (alumnosSeccion.length === 0) return;
  btnGuardarAsistencia.disabled = true;
  btnGuardarAsistencia.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Guardando...`;

  const asistenciasData = [];
  for (const idAlumno in asistenciaTemporal) {
    asistenciasData.push({ idAlumno: idAlumno, estado: asistenciaTemporal[idAlumno] });
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'guardarAsistencia', idProfesor: profesorActual.id, materia: profesorActual.materia, asistencias: asistenciasData })
    });
    const data = await response.json();
    if (data.status === 'success') {
      alert('¡Asistencia registrada con éxito!');
      mostrarInformeDeAsistencia();
    }
  } catch (e) { alert('Error de conexión.'); }
  finally {
    btnGuardarAsistencia.disabled = false;
    btnGuardarAsistencia.innerHTML = `Guardar Asistencia del Día`;
  }
});

function mostrarInformeDeAsistencia() {
  reportPresentesList.innerHTML = '';
  reportInasistentesList.innerHTML = '';
  let listPresentes = [];
  let listInasistentes = [];

  alumnosSeccion.forEach(alumno => {
    const estado = asistenciaTemporal[alumno.id];
    if (estado === "Presente") {
      listPresentes.push(alumno.nombre);
      const li = document.createElement('li');
      li.textContent = alumno.nombre;
      reportPresentesList.appendChild(li);
    } else {
      listInasistentes.push(alumno.nombre);
      const li = document.createElement('li');
      li.textContent = alumno.nombre;
      reportInasistentesList.appendChild(li);
    }
  });

  countReportPresentes.textContent = listPresentes.length;
  countReportInasistentes.textContent = listInasistentes.length;
  informeMeta.textContent = `Sección: ${selectFiltroAno.value} "${selectFiltroSeccion.value}" • Fecha: ${new Date().toLocaleDateString()}`;
  panelInformeAsistencia.classList.remove('hidden');
}

// ==========================================================================
// MÓDULO B: PLANIFICACIÓN Y CALIFICACIONES
// ==========================================================================
formPlanificacion.addEventListener('submit', async (e) => {
  e.preventDefault();
  const actividad = document.getElementById('plan-actividad').value.trim();
  const puntos = document.getElementById('plan-puntos').value;
  const fecha = document.getElementById('plan-fecha').value;

  const btn = document.getElementById('btn-guardar-plan');
  btn.disabled = true;
  btn.textContent = "Guardando...";

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'guardarPlanificacion', idProfesor: profesorActual.id, materia: profesorActual.materia, actividad: actividad, puntos: puntos, fecha: fecha })
    });
    const data = await response.json();
    if (data.status === 'success') {
      alert('¡Planificación guardada con éxito!');
      formPlanificacion.reset();
      await cargarPlanificaciones();
    }
  } catch (err) { alert('Error al guardar.'); }
  finally {
    btn.disabled = false;
    btn.textContent = "Guardar Planificación";
  }
});

async function cargarPlanificaciones() {
  selectEvaluacion.innerHTML = '<option value="">-- Selecciona una Evaluación --</option>';
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'obtenerPlanificaciones', idProfesor: profesorActual.id, materia: profesorActual.materia })
    });
    const data = await response.json();
    if (data.status === 'success') {
      planificacionesMateria = data.planificaciones;
      planificacionesMateria.forEach(plan => {
        const opt = document.createElement('option');
        opt.value = plan.id;
        opt.textContent = `${plan.actividad} (${plan.puntos} pts) - ${plan.fecha}`;
        selectEvaluacion.appendChild(opt);
      });
    }
  } catch (err) { console.error(err); }
}

// ==========================================================================
// MÓDULO C: ACTAS DE INCIDENCIA (CARGA INTELIGENTE AUTOMÁTICA)
// ==========================================================================

async function asegurarYAlimentarAlumnosActas() {
  actaSelectAlumno.innerHTML = '<option value="">-- Buscando alumnos de tu sección... --</option>';
  
  // Si la lista local está vacía, hacemos una consulta rápida usando la sección por defecto del profesor
  if (alumnosSeccion.length === 0 && profesorActual) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'obtenerAlumnos', seccion: profesorActual.seccion, turno: profesorActual.turno })
      });
      const data = await response.json();
      if (data.status === 'success') {
        alumnosSeccion = data.alumnos;
      }
    } catch (e) { console.error(e); }
  }

  // Llenar el menú desplegable visual
  actaSelectAlumno.innerHTML = '<option value="">-- Selecciona el Alumno --</option>';
  if (alumnosSeccion.length === 0) {
    actaSelectAlumno.innerHTML = '<option value="">No hay alumnos registrados en tu sección</option>';
    return;
  }

  alumnosSeccion.forEach(alumno => {
    const opt = document.createElement('option');
    opt.value = alumno.id;
    opt.textContent = `${alumno.nombre} (${alumno.ano || '1ero'} Año - Sec: ${alumno.seccion})`;
    actaSelectAlumno.appendChild(opt);
  });
}

actaSelectAlumno.addEventListener('change', () => {
  const alumno = alumnosSeccion.find(a => a.id === actaSelectAlumno.value);
  actaRepresentante.value = alumno ? alumno.representante : '';
});

formActas.addEventListener('submit', async (e) => {
  e.preventDefault();
  const alumno = alumnosSeccion.find(a => a.id === actaSelectAlumno.value);
  if (!alumno) return alert('Por favor, selecciona un alumno.');

  const motivo = document.getElementById('acta-motivo').value.trim();
  const incidencia = document.getElementById('acta-incidencia').value.trim();

  const btn = document.getElementById('btn-acta-guardar');
  btn.disabled = true;
  btn.textContent = "Guardando...";

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'guardarActa',
        idAlumno: alumno.id,
        nombreAlumno: alumno.nombre,
        representante: alumno.representante,
        idProfesor: profesorActual.id,
        nombreProfesor: profesorActual.nombre,
        materia: profesorActual.materia,
        motivo: motivo,
        incidencia: incidencia
      })
    });
    const data = await response.json();
    if (data.status === 'success') {
      alert('¡Acta guardada con éxito! Copia directa enviada al correo del Director.');
      formActas.reset();
      actaRepresentante.value = '';
    }
  } catch(err) { alert('Error al registrar acta.'); }
  finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Guardar y Mandar Correo`;
  }
});

btnActaImprimir.addEventListener('click', () => {
  const alumno = alumnosSeccion.find(a => a.id === actaSelectAlumno.value);
  const motivo = document.getElementById('acta-motivo').value.trim();
  const incidencia = document.getElementById('acta-incidencia').value.trim();

  if (!alumno || !motivo || !incidencia) {
    alert('Por favor, rellena todos los campos antes de imprimir el acta.');
    return;
  }

  const ventImp = window.open('', '_blank');
  ventImp.document.write(`
    <html>
      <head>
        <title>Acta de Incidencia - ${alumno.nombre}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; padding: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 40px; }
          .box { border: 1px solid #000; padding: 15px; min-height: 160px; margin: 20px 0; white-space: pre-wrap; }
          .signatures { display: flex; justify-content: space-between; margin-top: 80px; }
          .line { width: 40%; border-top: 1px solid #000; text-align: center; padding-top: 5px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>UNIDAD EDUCATIVA PORTAL GESTIÓN</h2>
          <h3>ACTA ESCOLAR DE INCIDENCIA SANCIONATORIA</h3>
          <p>Fecha de emisión: ${new Date().toLocaleDateString()}</p>
        </div>
        <p><strong>Profesor que Reporta:</strong> ${profesorActual.nombre} (${profesorActual.materia})</p>
        <p><strong>Estudiante:</strong> ${alumno.nombre} | <strong>Año:</strong> ${alumno.ano || '1ero'} | <strong>Sección:</strong> ${alumno.seccion}</p>
        <p><strong>Representante Legal:</strong> ${alumno.representante}</p>
        <p style="color:red;"><strong>Motivo de la Sanción / Reporte:</strong> ${motivo}</p>
        
        <h3>DESCRIPCIÓN DE LOS HECHOS ESCRITA POR EL DOCENTE</h3>
        <div class="box">${incidencia}</div>

        <div class="signatures">
          <div class="line">Firma del Profesor<br>${profesorActual.nombre}</div>
          <div class="line">Firma del Representante Legal</div>
        </div>
      </body>
    </html>
  `);
  ventImp.document.close();
  ventImp.print();
});

btnActaWhatsapp.addEventListener('click', () => {
  const alumno = alumnosSeccion.find(a => a.id === actaSelectAlumno.value);
  const motivo = document.getElementById('acta-motivo').value.trim();
  const incidencia = document.getElementById('acta-incidencia').value.trim();

  if (!alumno || !motivo || !incidencia) {
    alert('Rellena todos los campos antes de enviar por WhatsApp.');
    return;
  }

  const mensajeWA = encodeURIComponent(
    `*⚠️ NOTIFICACIÓN DE ACTA ESCOLAR*\n\n` +
    `*Estimado Director,*\n` +
    `He emitido un acta formal de incidencia con los siguientes datos:\n\n` +
    `• *Estudiante:* ${alumno.nombre}\n` +
    `• *Año y Sección:* ${alumno.ano || '1ero'} - "${alumno.seccion}"\n` +
    `• *Representante:* ${alumno.representante}\n` +
    `• *Profesor:* ${profesorActual.nombre}\n` +
    `• *Materia:* ${profesorActual.materia}\n\n` +
    `*Motivo:* _${motivo}_\n\n` +
    `*Hechos Reportados:*\n` +
    `"${incidencia}"`
  );

  window.open(`https://api.whatsapp.com/send?text=${mensajeWA}`, '_blank');
});

// ==========================================================================
// MÓDULO D: GESTIÓN DE HORARIOS SEMANALES
// ==========================================================================
formHorario.addEventListener('submit', async (e) => {
  e.preventDefault();
  const dia = document.getElementById('horario-dia').value;
  const horaInicio = document.getElementById('horario-hora-inicio').value;
  const horaFin = document.getElementById('horario-hora-fin').value;
  const ano = document.getElementById('horario-ano').value;
  const seccion = document.getElementById('horario-seccion').value;
  const turno = document.getElementById('horario-turno').value;

  const btn = document.getElementById('btn-guardar-horario');
  btn.disabled = true;
  btn.textContent = "Registrando...";

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'guardarHorario', idProfesor: profesorActual.id, dia: dia, horaInicio: horaInicio, horaFin: horaFin, ano: ano, seccion: seccion, turno: turno })
    });
    const data = await response.json();
    if (data.status === 'success') {
      alert('¡Bloque de horario agregado correctamente!');
      formHorario.reset();
      await cargarHorariosParaDeteccion();
      await cargarHorariosRegistrados();
      detectarClaseAutomatica();
    }
  } catch (err) { alert('Error al registrar bloque.'); }
  finally {
    btn.disabled = false;
    btn.textContent = "Guardar Bloque de Horario";
  }
});

async function cargarHorariosRegistrados() {
  listaTablaHorarios.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-gray-400"><i class="fa-solid fa-spinner animate-spin text-indigo-600 mb-2"></i> Cargando...</td></tr>`;
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'obtenerHorarios', idProfesor: profesorActual.id })
    });
    const data = await response.json();
    if (data.status === 'success' && data.horarios.length > 0) {
      listaTablaHorarios.innerHTML = '';
      const ordenDias = { "Lunes": 1, "Martes": 2, "Miercoles": 3, "Jueves": 4, "Viernes": 5 };
      data.horarios.sort((a, b) => ordenDias[a.dia] - ordenDias[b.dia]);

      data.horarios.forEach(h => {
        const hIn = formatearHoraLimpia(h.horaInicio);
        const hFi = formatearHoraLimpia(h.horaFin);
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50';
        tr.innerHTML = `
          <td class="px-6 py-4 font-bold text-gray-800">${h.dia}</td>
          <td class="px-6 py-4 text-center font-semibold text-indigo-600">${hIn} - ${hFi}</td>
          <td class="px-6 py-4 text-center font-semibold text-gray-700">${h.ano} "${h.seccion}"</td>
          <td class="px-6 py-4 text-center text-gray-500">${h.turno}</td>
        `;
        listaTablaHorarios.appendChild(tr);
      });
    } else {
      listaTablaHorarios.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-gray-400">No tienes bloques registrados aún.</td></tr>`;
    }
  } catch (e) { console.error(e); }
}

// ==========================================================================
// CERRAR SESIÓN
// ==========================================================================
btnLogout.addEventListener('click', () => {
  profesorActual = null;
  alumnosSeccion = [];
  planificacionesMateria = [];
  asistenciaTemporal = {};
  whatsappInput.value = '';
  dashboardScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
});