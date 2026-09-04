/* EDUGESTION_GUIDE_TABS_FIX_V3_20260724 */
/* EDUGESTION_GUIDE_FIX_V2_20260724 */
/* EDUGESTION_DIRECTOR_ALUMNOS_SECCION_V2_20260724 */
const API_URL = String(window.EDUGESTION_CONFIG?.API_URL || '').trim();
const SESSION_KEY = 'edugestion_session_v2';

    let profesorActual = null;
    let sessionToken = '';
    let alumnosSeccion = [];
    let alumnosFiltradosActas = [];
    let horariosProfesor = [];
    let asistenciaTemporal = {};
    let estadisticasAlumnos = {};
    let actaTipoActual = 'incidencia';
    let planesProfesor = [];
    let seccionPlanViendo = null;
    let acumuladoPonderacion = [];
    const porcentajesTablaPonderacion = [5, 10, 15, 20, 25, 30, 35, 40, 60, 70];
    let asistenciaClaseActiva = null;
    let agendaCargaId = 0;
    const agendaResumenCache = new Map();

    // --- DOM Elements ---
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const btnTogglePassword = document.getElementById('btn-toggle-password');
    const btnLogin = document.getElementById('btn-login');
    const loginError = document.getElementById('login-error');
    const profesorName = document.getElementById('profesor-name');
    const profesorMateria = document.getElementById('profesor-materia');
    const btnLogout = document.getElementById('btn-logout');
    const btnChangePassword = document.getElementById('btn-change-password');
    const passwordModal = document.getElementById('password-modal');
    const formChangePassword = document.getElementById('form-change-password');
    const currentPasswordInput = document.getElementById('current-password-input');
    const newPasswordInput = document.getElementById('new-password-input');
    const confirmPasswordInput = document.getElementById('confirm-password-input');
    const btnSavePassword = document.getElementById('btn-save-password');
    const pageTitle = document.getElementById('page-title');
    const pageDescription = document.getElementById('page-description');
    const currentDate = document.getElementById('current-date');
    const toastContainer = document.getElementById('toast-container');

    const tabAsistencia = document.getElementById('tab-asistencia');
    const tabPlanificacion = document.getElementById('tab-planificacion');
    const tabActas = document.getElementById('tab-actas');
    const tabRegistro = document.getElementById('tab-registro');
    const tabHorario = document.getElementById('tab-horario');
    const tabCalendario = document.getElementById('tab-calendario');

    const sectionAsistencia = document.getElementById('section-asistencia');
    const sectionPlanificacion = document.getElementById('section-planificacion');
    const sectionActas = document.getElementById('section-actas');
    const sectionRegistro = document.getElementById('section-registro');
    const sectionHorario = document.getElementById('section-horario');
    const sectionCalendario = document.getElementById('section-calendario');

    // Asistencia
    const selectFiltroAno = document.getElementById('select-filtro-ano');
    const selectFiltroSeccion = document.getElementById('select-filtro-seccion');
    const selectFiltroTurno = document.getElementById('select-filtro-turno');
    const btnCargarListaFiltrada = document.getElementById('btn-cargar-lista-filtrada');
    const btnGuardarAsistencia = document.getElementById('btn-guardar-asistencia');
    const asistenciaInfo = document.getElementById('asistencia-info');
    const contadorAsistencia = document.getElementById('contador-asistencia');
    const listaAlumnosAsistencia = document.getElementById('lista-alumnos-asistencia');
    const fechaAsistencia = document.getElementById('fecha-asistencia');
    const fechaAgendaClases = document.getElementById('fecha-agenda-clases');
    const btnAgendaHoy = document.getElementById('btn-agenda-hoy');
    const agendaTotalClases = document.getElementById('agenda-total-clases');
    const agendaClasesCompletadas = document.getElementById('agenda-clases-completadas');
    const agendaClasesPendientes = document.getElementById('agenda-clases-pendientes');
    const nombreDiaAgenda = document.getElementById('nombre-dia-agenda');
    const agendaClasesDia = document.getElementById('agenda-clases-dia');
    const buscarAlumnoAsistencia = document.getElementById('buscar-alumno-asistencia');
    const btnTodosPresentes = document.getElementById('btn-todos-presentes');
    const btnTodosAusentes = document.getElementById('btn-todos-ausentes');
    const asistenciaSubtitulo = document.getElementById('asistencia-subtitulo');
   
    // Stats
    const statPresentes = document.getElementById('stat-presentes');
    const statAusentes = document.getElementById('stat-ausentes');
    const barPresentes = document.getElementById('bar-presentes');
    const barAusentes = document.getElementById('bar-ausentes');
    const porcentajeAsistencia = document.getElementById('porcentaje-asistencia');
    const selectActaRapida = document.getElementById('select-acta-rapida');

    // Planificación
    const formPlanificacion = document.getElementById('form-planificacion');
    const menuSeccionesPlan = document.getElementById('menu-secciones-planificacion');
    const panelFormPlan = document.getElementById('panel-form-planificacion');
    const panelListaPlan = document.getElementById('panel-lista-planificacion');
    const tablaBodyPlan = document.getElementById('tabla-body-planificacion');
    const tituloPlan = document.getElementById('titulo-plan-seccion');
    const subtituloPlan = document.getElementById('subtitulo-plan-seccion');
    const badgeTotalPlan = document.getElementById('badge-total-puntos');
    const accionesPlan = document.getElementById('acciones-planificacion');
    const gridCalendario = document.getElementById('grid-calendario');
    const mesCalendario = document.getElementById('mes-calendario');
    const btnPlanPdf = document.getElementById('btn-plan-pdf');
    const btnPlanWhatsapp = document.getElementById('btn-plan-whatsapp');
    const resumenDiaCalendario = document.getElementById('resumen-dia-calendario');
    const resumenDiaTitulo = document.getElementById('resumen-dia-titulo');
    const ponderacionNota = document.getElementById('ponderacion-nota');
    const ponderacionPorcentaje = document.getElementById('ponderacion-porcentaje');
    const ponderacionResultado = document.getElementById('ponderacion-resultado');
    const btnAgregarPonderacion = document.getElementById('btn-agregar-ponderacion');
    const btnLimpiarPonderacion = document.getElementById('btn-limpiar-ponderacion');
    const ponderacionTotalPorcentaje = document.getElementById('ponderacion-total-porcentaje');
    const ponderacionPorcentajeRestante = document.getElementById('ponderacion-porcentaje-restante');
    const ponderacionNotaAcumulada = document.getElementById('ponderacion-nota-acumulada');
    const ponderacionEstado = document.getElementById('ponderacion-estado');
    const ponderacionContador = document.getElementById('ponderacion-contador');
    const ponderacionLista = document.getElementById('ponderacion-lista');
    const ponderacionTablaHead = document.getElementById('ponderacion-tabla-head');
    const ponderacionTablaBody = document.getElementById('ponderacion-tabla-body');

    // Actas
    const actaFiltroAno = document.getElementById('acta-filtro-ano');
    const actaFiltroSeccion = document.getElementById('acta-filtro-seccion');
    const actaFiltroTurno = document.getElementById('acta-filtro-turno');
    const actaSelectAlumno = document.getElementById('acta-select-alumno');
    const formActas = document.getElementById('form-actas');
   
    // Horarios
    const formHorario = document.getElementById('form-horario');
    const menuSeccionesHorario = document.getElementById('menu-secciones-horario');
    const panelFormHorario = document.getElementById('panel-form-horario');
    const panelListaHorario = document.getElementById('panel-lista-horario');
    const tablaBodyHorario = document.getElementById('tabla-body-horario');
    const subtituloHorario = document.getElementById('subtitulo-horario-seccion');
    const horarioVisualSemana = document.getElementById('horario-visual-semana');

    const nativeAlert = window.alert.bind(window);

    function escaparHTML(valor = '') {
      return String(valor).replace(/[&<>'"]/g, caracter => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
      }[caracter]));
    }

    function storageGet(clave, valorPredeterminado = null) {
      try {
        const valor = window.localStorage.getItem(clave);
        return valor === null ? valorPredeterminado : valor;
      } catch (error) {
        console.warn('Almacenamiento local no disponible:', error);
        return valorPredeterminado;
      }
    }

    function storageSet(clave, valor) {
      try {
        window.localStorage.setItem(clave, valor);
        return true;
      } catch (error) {
        console.warn('No se pudo guardar en el almacenamiento local:', error);
        return false;
      }
    }

    function mostrarToast(mensaje, tipo = 'info', titulo = '') {
      if (!toastContainer) return nativeAlert(String(mensaje));
      const textos = {
        success: ['Proceso completado', 'fa-circle-check'],
        error: ['No se pudo completar', 'fa-circle-xmark'],
        warning: ['Atención', 'fa-triangle-exclamation'],
        info: ['Información', 'fa-circle-info']
      };
      const [tituloBase, icono] = textos[tipo] || textos.info;
      const toast = document.createElement('div');
      toast.className = `app-toast app-toast--${tipo}`;
      toast.innerHTML = `
        <span class="app-toast__icon"><i class="fa-solid ${icono}"></i></span>
        <div><strong>${escaparHTML(titulo || tituloBase)}</strong><span>${escaparHTML(mensaje)}</span></div>
        <button type="button" aria-label="Cerrar notificación"><i class="fa-solid fa-xmark"></i></button>`;
      const cerrar = () => {
        if (toast.classList.contains('is-leaving')) return;
        toast.classList.add('is-leaving');
        setTimeout(() => toast.remove(), 210);
      };
      toast.querySelector('button').addEventListener('click', cerrar);
      toastContainer.appendChild(toast);
      setTimeout(cerrar, tipo === 'error' ? 6500 : 4200);
    }

    window.alert = function(mensaje) {
      const texto = String(mensaje || '');
      const normalizado = texto.toLowerCase();
      const tipo = normalizado.includes('error') || normalizado.includes('no se pudo')
        ? 'error'
        : normalizado.includes('selecciona') || normalizado.includes('debes') || normalizado.includes('por favor')
          ? 'warning'
          : 'success';
      mostrarToast(texto, tipo);
    };

    function apiConfigurada() {
      return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/i.test(API_URL);
    }

    function sessionGet() {
      try {
        const valor = window.sessionStorage.getItem(SESSION_KEY);
        return valor ? JSON.parse(valor) : null;
      } catch (error) {
        return null;
      }
    }

    function sessionSet(datos) {
      try {
        window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(datos));
      } catch (error) {
        console.warn('No fue posible conservar la sesión en esta pestaña:', error);
      }
    }

    function sessionClear() {
      try { window.sessionStorage.removeItem(SESSION_KEY); } catch (error) {}
    }

    async function apiRequest(action, data = {}, requiereSesion = true) {
      if (!apiConfigurada()) {
        const error = new Error('El servidor seguro todavía no está configurado. Abre config.js y pega la URL /exec de Google Apps Script.');
        error.code = 'API_NOT_CONFIGURED';
        throw error;
      }

      const payload = { ...data, action };
      if (requiereSesion) {
        if (!sessionToken) {
          const error = new Error('La sesión no está disponible. Ingresa nuevamente.');
          error.code = 'SESSION_REQUIRED';
          throw error;
        }
        payload.token = sessionToken;
      }

      const respuesta = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        redirect: 'follow'
      });
      if (!respuesta.ok) throw new Error(`Error de conexión HTTP ${respuesta.status}`);

      const texto = await respuesta.text();
      let resultado;
      try {
        resultado = JSON.parse(texto);
      } catch (error) {
        throw new Error('El servidor devolvió una respuesta que no se pudo interpretar. Revisa el despliegue de Google Apps Script.');
      }

      if (resultado.status !== 'success') {
        const error = new Error(resultado.message || 'El servidor rechazó la operación.');
        error.code = resultado.code || 'SERVER_ERROR';
        if (['SESSION_EXPIRED', 'SESSION_REQUIRED', 'UNAUTHORIZED'].includes(error.code)) {
          cerrarSesionLocal(false);
        }
        throw error;
      }
      return resultado;
    }

    function aplicarPerfilDocente(profesor) {
      profesorActual = profesor;
      profesorName.textContent = profesorActual.nombre || 'Docente';
      profesorMateria.textContent = profesorActual.materia || 'Sin materia asignada';
      document.title = `EduGestión | ${profesorActual.nombre || 'Portal docente'}`;
      actaFiltroSeccion.value = profesorActual.seccion || 'A';
      actaFiltroTurno.value = (profesorActual.turno === 'Manana' || profesorActual.turno === 'Mañana') ? 'Manana' : 'Tarde';
      cargarAcumuladoPonderacion();
      loginScreen.classList.add('hidden');
      dashboardScreen.classList.remove('hidden');
    }

    function cerrarSesionLocal(mostrarMensaje = true) {
      profesorActual = null;
      sessionToken = '';
      alumnosSeccion = [];
      alumnosFiltradosActas = [];
      planesProfesor = [];
      horariosProfesor = [];
      asistenciaTemporal = {};
      sessionClear();
      dashboardScreen.classList.add('hidden');
      loginScreen.classList.remove('hidden');
      loginForm.reset();
      document.title = 'EduGestión | Portal docente';
      if (mostrarMensaje) mostrarToast('La sesión se cerró correctamente.', 'info', 'Sesión finalizada');
    }

    async function cargarDatosPersistentes() {
      if (!profesorActual) return;
      try {
        const datos = await apiRequest('obtenerDatosIniciales');
        planesProfesor = Array.isArray(datos.planes) ? datos.planes : [];
        horariosProfesor = Array.isArray(datos.horarios) ? datos.horarios : [];
        actualizarUIPlanificacion();
        actualizarUIHorario();
        await renderAgendaAsistencia();

        const inputInst = document.getElementById('input-institucion');
        if (inputInst && datos.institucion) {
          inputInst.value = datos.institucion;
          storageSet('nombreInstitucion', datos.institucion);
        }

        const f = storageGet('filtros_asistencia_' + profesorActual.id);
        if (f) {
          try {
            const obj = JSON.parse(f);
            selectFiltroAno.value = obj.a;
            selectFiltroSeccion.value = obj.s;
            selectFiltroTurno.value = obj.t;
          } catch (error) {}
        }
      } catch (error) {
        console.error('No se pudieron cargar los datos del docente:', error);
        mostrarToast(error.message, 'error', 'No se cargaron los datos');
      }
    }

    async function iniciarSesion(datos, mensajeBienvenida = true) {
      sessionToken = datos.token;
      aplicarPerfilDocente(datos.profesor);
      sessionSet({ token: sessionToken, profesor: datos.profesor });
      await cargarDatosPersistentes();
      if (mensajeBienvenida) {
        mostrarToast(`Bienvenido/a, ${profesorActual.nombre || 'docente'}.`, 'success', 'Sesión iniciada');
      }
    }

    async function restaurarSesion() {
      const guardada = sessionGet();
      if (!guardada?.token || !apiConfigurada()) return;
      sessionToken = guardada.token;
      try {
        const datos = await apiRequest('validarSesion');
        await iniciarSesion({ token: sessionToken, profesor: datos.profesor }, false);
      } catch (error) {
        sessionToken = '';
        sessionClear();
      }
    }

    window.addEventListener('DOMContentLoaded', async () => {
      const hoy = new Date();
      const hoyISO = fechaISOAsistencia(hoy);
      fechaAsistencia.value = hoyISO;
      if (fechaAgendaClases) fechaAgendaClases.value = hoyISO;
      if (currentDate) {
        currentDate.textContent = new Intl.DateTimeFormat('es-ES', {
          weekday: 'short', day: '2-digit', month: 'short'
        }).format(hoy).replace('.', '');
      }

      const inputInst = document.getElementById('input-institucion');
      if (inputInst) {
        inputInst.value = storageGet('nombreInstitucion', '') || '';
        inputInst.addEventListener('input', () => storageSet('nombreInstitucion', inputInst.value));
      }
      if (!apiConfigurada()) {
        loginError.textContent = 'Falta configurar el servidor seguro. Sigue el archivo PASO_A_PASO_INSTALACION.md.';
        loginError.classList.remove('hidden');
      }
      await restaurarSesion();
    });

    if (btnTogglePassword) {
      btnTogglePassword.addEventListener('click', () => {
        const mostrar = passwordInput.type === 'password';
        passwordInput.type = mostrar ? 'text' : 'password';
        btnTogglePassword.innerHTML = `<i class="fa-regular ${mostrar ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
      });
    }

    // ====== LOGIN SEGURO POR USUARIO Y CONTRASEÑA ======
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usuario = usernameInput.value.trim().toLowerCase();
      const clave = passwordInput.value;
      if (!usuario || !clave) return;

      btnLogin.disabled = true;
      btnLogin.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin"></i><span>Verificando acceso...</span>';
      loginError.classList.add('hidden');
      loginError.textContent = '';

      try {
        const datos = await apiRequest('loginProfesor', { usuario, clave }, false);
        await iniciarSesion(datos);
        passwordInput.value = '';
      } catch (error) {
        console.error('Error de inicio de sesión:', error);
        loginError.textContent = error.message || 'No fue posible iniciar sesión.';
        loginError.classList.remove('hidden');
      } finally {
        btnLogin.disabled = false;
        btnLogin.innerHTML = '<span>Ingresar al sistema</span><i class="fa-solid fa-arrow-right"></i>';
      }
    });

    function cambiarPestana(activaTab, activaSection) {
      document.querySelectorAll('#app-nav .nav-item').forEach(tab => {
        tab.classList.remove('is-active');
        tab.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('#app-main > section').forEach(sec => sec.classList.add('hidden'));

      activaTab.classList.add('is-active');
      activaTab.setAttribute('aria-selected', 'true');
      activaSection.classList.remove('hidden');
      if (pageTitle) pageTitle.textContent = activaTab.dataset.title || activaTab.textContent.trim();
      if (pageDescription) pageDescription.textContent = activaTab.dataset.description || '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    tabAsistencia.addEventListener('click', async () => {
      cambiarPestana(tabAsistencia, sectionAsistencia);
      await renderAgendaAsistencia();
    });
    tabPlanificacion.addEventListener('click', () => { cambiarPestana(tabPlanificacion, sectionPlanificacion); actualizarUIPlanificacion(); });
    tabActas.addEventListener('click', async () => { cambiarPestana(tabActas, sectionActas); setFechaHoraActas(); await filtrarAlumnosParaActas(); });
    tabRegistro.addEventListener('click', () => { cambiarPestana(tabRegistro, sectionRegistro); });
    tabHorario.addEventListener('click', () => { cambiarPestana(tabHorario, sectionHorario); actualizarUIHorario(); });

    // ====== CALENDARIO ESCOLAR 2026-2027 ======
    const calendarioMes = document.getElementById('calendario-mes');
    const calendarioImagen = document.getElementById('calendario-imagen');
    const calendarioTituloMes = document.getElementById('calendario-titulo-mes');
    const calendarioAnterior = document.getElementById('calendario-anterior');
    const calendarioSiguiente = document.getElementById('calendario-siguiente');
    const calendarioMesesRapidos = document.getElementById('calendario-meses-rapidos');
    const schoolReminder = document.getElementById('school-reminder');
    const schoolReminderLabel = document.getElementById('school-reminder-label');
    const schoolReminderText = document.getElementById('school-reminder-text');
    const schoolReminderOpen = document.getElementById('school-reminder-open');
    const calendarioCrearIA = document.getElementById('calendario-crear-ia');
    const calendarioCrearIASecundario = document.getElementById('calendario-crear-ia-secundario');
    const calendarioIAEfemeride = document.getElementById('calendario-ia-efemeride');

    const mesesCalendarioEscolar = [
      { nombre: 'Septiembre', ano: 2026, archivo: 'mes-02.jpg' },
      { nombre: 'Octubre', ano: 2026, archivo: 'mes-03.jpg' },
      { nombre: 'Noviembre', ano: 2026, archivo: 'mes-04.jpg' },
      { nombre: 'Diciembre', ano: 2026, archivo: 'mes-05.jpg' },
      { nombre: 'Enero', ano: 2027, archivo: 'mes-06.jpg' },
      { nombre: 'Febrero', ano: 2027, archivo: 'mes-07.jpg' },
      { nombre: 'Marzo', ano: 2027, archivo: 'mes-08.jpg' },
      { nombre: 'Abril', ano: 2027, archivo: 'mes-09.jpg' },
      { nombre: 'Mayo', ano: 2027, archivo: 'mes-10.jpg' },
      { nombre: 'Junio', ano: 2027, archivo: 'mes-11.jpg' },
      { nombre: 'Julio', ano: 2027, archivo: 'mes-12.jpg' },

      { nombre: 'Agosto', ano: 2027, archivo: 'mes-13.jpg' }
    ];

    // Efemérides tomadas del calendario escolar 2026-2027 adjunto.
    const recordatoriosEscolares = {
      '2026-09-03':'Natalicio de Alberto Arvelo Torrealba (1905)',
      '2026-09-05':'Día Internacional de la Mujer Indígena (1983)',
      '2026-09-06':'Simón Bolívar escribe la Carta de Jamaica (1815)',
      '2026-09-08':'Día Internacional de la Alfabetización (1967)',
      '2026-09-09':'Día Mundial de la Agricultura',
      '2026-09-10':'Natalicio de Luis Razetti (1862)',
      '2026-09-11':'Natalicio de Jacinto Convit (1913)',
      '2026-09-14':'Fundación de la OPEP (1960)',
      '2026-09-15':'Natalicio de Mario Briceño Iragorry (1897)',
      '2026-09-16':'Día Internacional de la Preservación de la Capa de Ozono',
      '2026-09-19':'Natalicio de José Félix Ribas (1775) / Natalicio de Paulo Freire (1921)',
      '2026-09-20':'Día de la Educación Intercultural Bilingüe (1979)',
      '2026-09-21':'Natalicio de Matea Bolívar (1773) / Día Internacional de la Paz (1981)',
      '2026-09-23':'Día Internacional de las Lenguas de Señas (2017)',
      '2026-09-25':'Natalicio de Luisa Cáceres de Arismendi (1799)',
      '2026-09-29':'Natalicio de Miguel de Cervantes Saavedra (1547)',
      '2026-10-01':'Día Nacional del Cacao (2015)',
      '2026-10-02':'Día Internacional de la No Violencia (2007)',
      '2026-10-04':'Día Mundial de los Animales (1929)',
      '2026-10-05':'Natalicio de Teresa de la Parra (1889) / Día Internacional de la Educación Vial / Día Mundial de los Docentes (1994)',
      '2026-10-06':'Día Internacional de la Geodiversidad (2022) / Día Mundial del Hábitat (1985)',
      '2026-10-11':'Día Internacional de la Niña (2011)',
      '2026-10-12':'Día de la Resistencia Indígena (1492) / Natalicio de Cipriano Castro (1858)',
      '2026-10-13':'El Libertador escribe «Mi delirio sobre el Chimborazo» (1822) / Día Internacional para la Reducción de Riesgos de Desastres (1989)',
      '2026-10-14':'Simón Bolívar recibe en Caracas el título de Libertador (1813)',
      '2026-10-16':'Día Mundial de la Alimentación (1980)',
      '2026-10-17':'Día Internacional de la Erradicación de la Pobreza (1992)',
      '2026-10-18':'Natalicio de Josefa Joaquina Sánchez (1765)',
      '2026-10-21':'Día Mundial del Ahorro Energético',
      '2026-10-23':'Juana Ramírez es ingresada al Panteón Nacional (2015)',
      '2026-10-24':'Natalicio de Rafael Urdaneta (1788)',
      '2026-10-26':'Natalicio de José Gregorio Hernández (1864)',
      '2026-10-27':'La mujer venezolana vota por primera vez (1946)',
      '2026-10-28':'Natalicio de Simón Rodríguez (1769) / Inauguración del Panteón Nacional (1875) / Día Nacional de la Alfabetización (2005)',
      '2026-10-29':'Día Nacional de la Semilla Campesina (2005) / Día Nacional de la Prevención del Embarazo en Adolescentes',
      '2026-10-30':'El Libertador Simón Bolívar recibe la Espada del Perú (1825)',
      '2026-10-31':'Natalicio del cantautor Alí Primera (1941)',
      '2026-11-01':'Día Mundial de la Ecología',
      '2026-11-06':'Día Internacional contra la Violencia y el Acoso Escolar',
      '2026-11-07':'Día del Obrero Educacional / Natalicio de Luis Bigott (1938)',
      '2026-11-10':'Día Mundial de la Ciencia para la Paz y el Desarrollo (2002)',
      '2026-11-13':'Día Nacional del Teatro',
      '2026-11-14':'Natalicio de José Antonio Anzoátegui (1789)',
      '2026-11-16':'Día Mundial de la Tolerancia / Día Internacional del Patrimonio Mundial',
      '2026-11-17':'Día Internacional de las y los Estudiantes',
      '2026-11-18':'Día Nacional de la Alimentación',
      '2026-11-19':'Día Internacional para la Prevención del Abuso Contra los Niños, Niñas y Adolescentes',
      '2026-11-20':'Decreto del Libertador que incorpora la octava estrella a la bandera nacional por la provincia de Guayana (1817) / Convención Internacional sobre los Derechos del Niño y la Niña (1989)',
      '2026-11-21':'Día del Estudiante Venezolano',
      '2026-11-25':'Día Internacional para la Eliminación de la Violencia Contra la Mujer',
      '2026-11-29':'Natalicio de Andrés Bello (1781)',
      '2026-12-01':'Declaratoria de los carnavales del Callao como Patrimonio Inmaterial de la Humanidad / Día Mundial de la Lucha contra el SIDA',
      '2026-12-02':'Día Internacional de la Abolición de la Esclavitud',
      '2026-12-03':'Día Internacional de las Personas con Discapacidad',
      '2026-12-05':'Batalla de Araure (1813) / Declaratoria de la Parranda de San Pedro como Patrimonio Inmaterial de la Humanidad',
      '2026-12-06':'Declaratoria de los Diablos Danzantes de Corpus Christi como Patrimonio Inmaterial de la Humanidad',
      '2026-12-08':'Día Nacional de Guaicaipuro, Cacicas y Caciques Heroicos',
      '2026-12-09':'Batalla de Ayacucho (1824)',
      '2026-12-10':'Batalla de Santa Inés (1859) / Día de la Declaración Universal de los Derechos Humanos / Promulgación de la LOPNNA',
      '2026-12-12':'Natalicio de Luis Caballero Mejías (1903)',
      '2026-12-13':'Firma de la Convención de los Derechos de las Personas con Discapacidad (2006)',
      '2026-12-14':'La mujer venezolana vota por primera vez en elecciones presidenciales (1947)',
      '2026-12-15':'Manifiesto de Cartagena (1812) / Natalicio de Cristóbal Rojas (1857)',
      '2026-12-17':'Siembra del Libertador Simón Bolívar (1830)',
      '2026-12-18':'Inicio de la Segunda Expedición de Los Cayos (1816)',
      '2026-12-19':'Decreto conservacionista de Chuquisaca del Libertador Simón Bolívar (1825)',
      '2026-12-22':'Natalicio de Teresa Carreño (1853)',
      '2026-12-24':'Noche Buena',
      '2026-12-25':'Día de Navidad',
      '2026-12-27':'Natalicio de Manuela Sáenz (1797) / Antonio José de Sucre recibe el grado de Mariscal de Ayacucho (1824)',
      '2026-12-31':'Fin de Año',
      '2027-01-01':'Año Nuevo',
      '2027-01-04':'Día Mundial del Braille (2018)',
      '2027-01-06':'Día Nacional del Deporte',
      '2027-01-12':'Natalicio de Juana Ramírez «La Avanzadora» (1790)',
      '2027-01-15':'Día del Maestro y la Maestra',
      '2027-01-21':'Llegada de José Martí a Caracas (1881)',
      '2027-01-23':'Natalicio de José Francisco Bermúdez (1782)',
      '2027-01-24':'Día Mundial de la Cultura Africana y Afrodescendiente / Día Internacional de la Educación',
      '2027-01-26':'Día Mundial de la Educación Ambiental',
      '2027-01-30':'Día Escolar de la No Violencia y la Paz / Natalicio de Juan Antonio Pérez Bonalde (1846)',
      '2027-02-01':'Natalicio de Ezequiel Zamora (1817) / Natalicio de Cecilio Acosta (1818)',
      '2027-02-02':'Paradura del Niño Jesús / Día de la Candelaria / Día Nacional de las Muñecas y Muñecos de Trapo de Venezuela',
      '2027-02-03':'Natalicio de Antonio José de Sucre (1795)',
      '2027-02-04':'Día de la Dignidad Nacional / Día Mundial de la Lucha contra el Cáncer',
      '2027-02-06':'Natalicio de Fabricio Ojeda (1929)',
      '2027-02-08':'Asueto de Carnaval',
      '2027-02-09':'Asueto de Carnaval',
      '2027-02-11':'Día Internacional de la Mujer y la Niña en las Ciencias',
      '2027-02-12':'Batalla de la Victoria (1814) / Día Nacional de la Juventud / Batalla de Calabozo (1818)',
      '2027-02-13':'Día Mundial de la Radio',
      '2027-02-14':'Día Mundial de la Energía / Día del amor y la amistad',
      '2027-02-15':'Instalación del Congreso de Angostura (1819)',
      '2027-02-17':'Acuerdo de Ginebra entre Venezuela y el Reino Unido por la Guayana Esequiba (1966)',
      '2027-02-18':'Natalicio de Humberto Fernández-Morán (1924)',
      '2027-02-20':'Grito de la Federación en Coro (1859) / Natalicio de Juan Vicente Torrealba (1917)',
      '2027-02-27':'Rebelión popular “El Caracazo” (1989) / Día Nacional de los Derechos Humanos en Venezuela',
      '2027-02-28':'Natalicio de José María España (1761) / Primera Batalla de San Mateo (1814)',
      '2027-03-01':'Natalicio de Belén San Juan (1917)',
      '2027-03-02':'Instalación del Primer Congreso de Venezuela (1811)',
      '2027-03-04':'Natalicio de Pío Tamayo (1898)',
      '2027-03-05':'Día Mundial de la Eficiencia Energética',
      '2027-03-07':'Ley de Banderas, Himno y Escudo Nacional de la República Bolivariana de Venezuela (2006)',
      '2027-03-08':'Día Internacional de la Mujer',
      '2027-03-09':'Incorporación de la octava estrella en la Bandera Nacional (2006)',
      '2027-03-10':'Natalicio de José María Vargas (1786)',
      '2027-03-12':'Día del Profesor de Educación Física',
      '2027-03-14':'Natalicio de Luis Beltrán Prieto Figueroa (1902) / Día Internacional de la Matemática',
      '2027-03-15':'Declaratoria del Joropo como patrimonio nacional (2014)',
      '2027-03-18':'Día de las Niñas, Niños y Jóvenes Indígenas',
      '2027-03-19':'Día Nacional del Artesano y la Artesana / Día Nacional de la Llaneridad',
      '2027-03-21':'Día Internacional por la Eliminación de la Discriminación Racial / Día Mundial de la Poesía',
      '2027-03-22':'Día Mundial del Agua',
      '2027-03-24':'Decreto de la Abolición de la Esclavitud en el territorio venezolano (1854)',
      '2027-03-25':'Asueto de Semana Santa / Segunda Batalla de San Mateo (1814) / Natalicio de Leonardo Infante (1798)',
      '2027-03-26':'Asueto de Semana Santa / Día Mundial del Clima',
      '2027-03-27':'Día Internacional de Teatro',
      '2027-03-28':'Natalicio de Francisco de Miranda (1750) / Día Nacional del Patrimonio',
      '2027-03-30':'Natalicio de Pedro Camejo (1790)',
      '2027-03-31':'Batalla de Bocachica (1814) / Primera expedición de Los Cayos (1816)',
      '2027-04-01':'Promulgación de la LOPNNA (2000)',
      '2027-04-02':'Día Mundial de Concienciación sobre el Autismo / Natalicio de Ana María Campos (1796)',
      '2027-04-03':'Creación de la Guayana Esequiba (2024)',
      '2027-04-04':'Día Nacional del Cuatro (2024)',
      '2027-04-06':'Día Internacional del Deporte para el Desarrollo de la Paz',
      '2027-04-07':'Día Mundial de la Salud / Conmemoración de la Batalla de Bomboná (1822)',
      '2027-04-15':'Descubrimiento del primer campo petrolero Mene Grande (1914)',
      '2027-04-16':'Repatriación de la Abuela Kueka (2020)',
      '2027-04-17':'Día de la Unión de Naciones Suramericanas (UNASUR)',
      '2027-04-19':'Creación de la Junta de Gobierno autónoma de Caracas (1810)',
      '2027-04-21':'Día Mundial de la Creatividad e Innovación',
      '2027-04-22':'Día Internacional de la Tierra',
      '2027-04-23':'Día Mundial del Libro, del Derecho de Autor e Idioma Español',
      '2027-04-25':'Natalicio de Rafael Rangel (1877) / Día Internacional de la Lucha Contra el Maltrato Infantil / Día Nacional del Ajedrez Escolar / Natalicio de José Leonardo Chirino (1754)',
      '2027-04-28':'Natalicio de Manuel Piar (1774)',
      '2027-04-29':'Día Internacional de la Danza',
      '2027-05-01':'Día Internacional del Trabajador y la Trabajadora',
      '2027-05-02':'Día Mundial Contra el Acoso Escolar',
      '2027-05-03':'Celebración de la Cruz de Mayo',
      '2027-05-10':'Alzamiento de José Leonardo Chirino y José Caridad González / Día Nacional de la Afrovenezolanidad / Natalicio de Armando Reverón',
      '2027-05-14':'Simón Bolívar emprende la Campaña Admirable desde Cúcuta (1813) / Natalicio de César Rengifo (1915)',
      '2027-05-15':'Día Internacional de la Familia',
      '2027-05-17':'Natalicio de Aquiles Nazoa (1920)',
      '2027-05-18':'Natalicio de Josefa Camejo (1791) / Día Internacional de los Museos',
      '2027-05-22':'Día Internacional de la Diversidad Biológica',
      '2027-05-23':'Simón Bolívar es proclamado Libertador en Mérida / Día Nacional Escolar para la Prevención del VIH-SIDA / Símbolos naturales de Venezuela',
      '2027-05-24':'Conmemoración de la Batalla de Pichincha (1822)',
      '2027-05-25':'Levantamiento de Andresote / Gloria al bravo pueblo como Himno Nacional / Día Mundial de África / Día Nacional del Cimarronaje',
      '2027-05-27':'Uso oficial de los idiomas indígenas en Venezuela (2002)',
      '2027-05-28':'Día Internacional del Juego',
      '2027-05-29':'Decreto del araguaney como árbol nacional de Venezuela (1948)',
      '2027-05-31':'Día Internacional de No Fumar / Día Nacional del Árbol',
      '2027-06-02':'El Libertador decreta en Carúpano la abolición de la esclavitud (1816)',
      '2027-06-05':'Día Mundial de la Conservación y el Ambiente / Natalicio de Jesús Soto (1923)',
      '2027-06-10':'Natalicio de Antonio Ricaurte (1786)',
      '2027-06-12':'Día Internacional Contra el Trabajo Infantil',
      '2027-06-13':'Natalicio de José Antonio Páez (1790) / Día del Tamunangue',
      '2027-06-15':'Decreto de Guerra a Muerte (1813)',
      '2027-06-16':'Natalicio de Arturo Michelena (1863)',
      '2027-06-17':'Día Mundial Contra la Lucha de la Desertificación y la Sequía',
      '2027-06-18':'Batalla de Agua de Obispo (1813)',
      '2027-06-21':'Fundación de Curiepe, primer pueblo de negros libres en Venezuela',
      '2027-06-22':'Instalación del Congreso Anfictiónico de Panamá / Día de la Unidad Latinoamericana',
      '2027-06-24':'Batalla de Carabobo (1821) / Parranda de San Juan Bautista',
      '2027-06-26':'Día Internacional de la Preservación de los Bosques Tropicales / Lucha Contra el Uso Indebido y el Tráfico Ilícito de Drogas',
      '2027-06-27':'Fundación del Correo del Orinoco (1818)',
      '2027-06-28':'Natalicio de Leonardo Infante (1798)',
      '2027-06-29':'Entrada triunfal del Libertador a Caracas después de la Batalla de Carabobo / Parranda de San Pedro',
      '2027-06-30':'Soberanía absoluta de Venezuela sobre la Isla de Aves (1865)',
      '2027-07-02':'Batalla de Niquitao (1813)',
      '2027-07-03':'Natalicio de José María Baralt (1810)',
      '2027-07-05':'Declaración de la Independencia de Venezuela (1811)',
      '2027-07-06':'Natalicio del Almirante Luis Brión (1782)',
      '2027-07-07':'Inicio de la Emigración de Oriente (1814) / Día Mundial del Cacao',
      '2027-07-10':'Natalicio de Argelia Laya (1926)',
      '2027-07-11':'Natalicio del pintor Juan Lovera (1776)',
      '2027-07-15':'Natalicio de Argimiro Gabaldón (1919)',
      '2027-07-19':'Día del Niño y la Niña',
      '2027-07-22':'Batalla de los Horcones (1813)',
      '2027-07-24':'Natalicio del Libertador Simón Bolívar (1783) / Batalla Naval del Lago de Maracaibo (1823)',
      '2027-07-25':'Natalicio de Santiago Mariño (1788) / Fundación de Caracas (1567) / Día Internacional de la Mujer Afrodescendiente',
      '2027-07-26':'Día Mundial de la Conservación de Manglares',
      '2027-07-28':'Natalicio del presidente Hugo Chávez Frías (1954)',
      '2027-07-30':'Día Mundial Contra la Trata de Personas',
      '2027-07-31':'Batalla de Taguanes (1813) / Batalla de Matasiete (1817) / Día Mundial de las y los Guardaparques y Guardabosques',
      '2027-08-02':'Natalicio de Rómulo Gallegos (1884) / Día del Trabajador y la Trabajadora Cultural',
      '2027-08-03':'Día de la Bandera Nacional / Expedición libertadora de Francisco de Miranda en la Vela de Coro (1806)',
      '2027-08-06':'Natalicio de Andrés Eloy Blanco (1896) / Batalla de Junín (1824)',
      '2027-08-07':'Batalla de Boyacá (1819)',
      '2027-08-09':'Día Internacional de los Pueblos Indígenas',
      '2027-08-12':'Día Internacional de la Juventud',
      '2027-08-13':'Natalicio de Henri Pittier (1857)',
      '2027-08-15':'Juramento del Libertador Simón Bolívar en el Monte Sacro (1805) / Promulgación de la Ley Orgánica de Educación (2009)',
      '2027-08-17':'Día Mundial del Peatón',
      '2027-08-19':'Natalicio de Luis Mariano Rivera (1906)',
      '2027-08-22':'Creación del INCE (hoy Inces) por iniciativa de Luis Beltrán Prieto Figueroa (1959)',
      '2027-08-24':'Día Internacional de los Parques Nacionales'
    };

    function claveFechaLocal(fecha = new Date()) {
      const y = fecha.getFullYear();
      const m = String(fecha.getMonth() + 1).padStart(2, '0');
      const d = String(fecha.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    function indiceEscolarDesdeFecha(fecha = new Date()) {
      const y = fecha.getFullYear();
      const m = fecha.getMonth();
      if (y === 2026 && m >= 8) return m - 8;
      if (y === 2027 && m <= 7) return m + 4;
      return 0;
    }

    function efemerideEscolarDeHoy() {
      const hoy = new Date();
      const clave = claveFechaLocal(hoy);
      return { hoy, clave, texto: recordatoriosEscolares[clave] || '' };
    }

    function actualizarActividadIACalendario() {
      if (!calendarioIAEfemeride) return;
      const { hoy, texto } = efemerideEscolarDeHoy();
      const fechaBonita = new Intl.DateTimeFormat('es-VE', { day:'numeric', month:'long' }).format(hoy);
      calendarioIAEfemeride.textContent = texto
        ? `${fechaBonita}: ${texto}`
        : `${fechaBonita}: no hay una efeméride específica destacada; Gemini puede preparar una actividad escolar general.`;
    }

    function crearActividadIADesdeCalendario() {
      const { hoy, texto } = efemerideEscolarDeHoy();
      const fechaBonita = new Intl.DateTimeFormat('es-VE', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(hoy);
      const tema = texto || 'la jornada escolar de hoy';
      const prompt = `Crea una actividad didáctica breve, práctica y atractiva para estudiantes de primaria relacionada con ${tema}. Fecha: ${fechaBonita}. Organízala con: título, objetivo, materiales sencillos, inicio, desarrollo, cierre y 3 preguntas de reflexión. Usa lenguaje claro para docentes y no realices búsqueda web.`;
      const tabIA = document.getElementById('tab-gemini');
      const inputIA = document.getElementById('gemini-input');
      const formIA = document.getElementById('gemini-form');
      if (!tabIA || !inputIA || !formIA) {
        if (typeof mostrarToast === 'function') mostrarToast('No se pudo abrir el Asistente IA.', 'warning', 'Calendario');
        return;
      }
      tabIA.click();
      inputIA.value = prompt;
      setTimeout(() => {
        inputIA.focus();
        if (typeof formIA.requestSubmit === 'function') formIA.requestSubmit();
        else formIA.dispatchEvent(new Event('submit', { bubbles:true, cancelable:true }));
      }, 180);
    }

    function renderRecordatorioEscolar() {
      if (!schoolReminderText || !schoolReminderLabel) return;
      const hoy = new Date();
      const clave = claveFechaLocal(hoy);
      const dentroPeriodo = (hoy.getFullYear() === 2026 && hoy.getMonth() >= 8) || (hoy.getFullYear() === 2027 && hoy.getMonth() <= 7);
      const texto = recordatoriosEscolares[clave];
      const fechaBonita = new Intl.DateTimeFormat('es-VE', { weekday:'long', day:'numeric', month:'long' }).format(hoy);
      schoolReminderLabel.textContent = `Recordatorio escolar · ${fechaBonita}`;
      if (texto) {
        schoolReminderText.textContent = texto;
        schoolReminder?.classList.add('has-event');
      } else if (dentroPeriodo) {
        schoolReminderText.textContent = 'Hoy no hay una efeméride específica destacada en el calendario escolar oficial.';
        schoolReminder?.classList.remove('has-event');
      } else {
        schoolReminderText.textContent = 'Consulta las fechas y efemérides del calendario escolar 2026-2027.';
        schoolReminder?.classList.remove('has-event');
      }
    }

    function indiceMesEscolarActual() {
      const hoy = new Date();
      const mes = hoy.getMonth();
      const ano = hoy.getFullYear();
      if (ano === 2026 && mes >= 8) return mes - 8;
      if (ano === 2027 && mes <= 7) return mes + 4;
      return 0;
    }

    function renderCalendarioEscolar(indice = 0) {
      const max = mesesCalendarioEscolar.length - 1;
      const seguro = Math.max(0, Math.min(max, Number(indice) || 0));
      const mes = mesesCalendarioEscolar[seguro];
      if (calendarioMes) calendarioMes.value = String(seguro);
      if (calendarioTituloMes) calendarioTituloMes.textContent = `${mes.nombre} ${mes.ano}`;
      if (calendarioImagen) {
        calendarioImagen.src = `assets/calendario/${mes.archivo}`;
        calendarioImagen.alt = `Calendario escolar de ${mes.nombre.toLowerCase()} de ${mes.ano}`;
      }
      calendarioAnterior?.toggleAttribute('disabled', seguro === 0);
      calendarioSiguiente?.toggleAttribute('disabled', seguro === max);
      calendarioMesesRapidos?.querySelectorAll('button').forEach((boton, i) => {
        boton.classList.toggle('is-active', i === seguro);
        boton.setAttribute('aria-pressed', i === seguro ? 'true' : 'false');
      });
    }

    function crearAccesosMesesCalendario() {
      if (!calendarioMesesRapidos || calendarioMesesRapidos.children.length) return;
      mesesCalendarioEscolar.forEach((mes, indice) => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.innerHTML = `<strong>${mes.nombre.slice(0, 3)}</strong><span>${mes.ano}</span>`;
        boton.title = `${mes.nombre} ${mes.ano}`;
        boton.addEventListener('click', () => renderCalendarioEscolar(indice));
        calendarioMesesRapidos.appendChild(boton);
      });
    }

    function abrirCalendarioEscolar() {
      crearAccesosMesesCalendario();
      if (!calendarioMes?.dataset.inicializado) {
        renderCalendarioEscolar(indiceMesEscolarActual());
        if (calendarioMes) calendarioMes.dataset.inicializado = '1';
      } else {
        renderCalendarioEscolar(Number(calendarioMes.value || 0));
      }
    }

    calendarioMes?.addEventListener('change', () => renderCalendarioEscolar(Number(calendarioMes.value)));
    calendarioAnterior?.addEventListener('click', () => renderCalendarioEscolar(Number(calendarioMes?.value || 0) - 1));
    calendarioSiguiente?.addEventListener('click', () => renderCalendarioEscolar(Number(calendarioMes?.value || 0) + 1));
    calendarioCrearIA?.addEventListener('click', crearActividadIADesdeCalendario);
    calendarioCrearIASecundario?.addEventListener('click', crearActividadIADesdeCalendario);
    tabCalendario?.addEventListener('click', () => {
      cambiarPestana(tabCalendario, sectionCalendario);
      abrirCalendarioEscolar();
    });
    schoolReminderOpen?.addEventListener('click', () => {
      cambiarPestana(tabCalendario, sectionCalendario);
      crearAccesosMesesCalendario();
      renderCalendarioEscolar(indiceEscolarDesdeFecha(new Date()));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    renderRecordatorioEscolar();
    actualizarActividadIACalendario();
    function abrirModalClave() {
      if (!passwordModal) return;
      passwordModal.classList.remove('hidden');
      passwordModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      setTimeout(() => currentPasswordInput?.focus(), 50);
    }

    function cerrarModalClave() {
      if (!passwordModal) return;
      passwordModal.classList.add('hidden');
      passwordModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      formChangePassword?.reset();
    }

    btnChangePassword?.addEventListener('click', abrirModalClave);
    passwordModal?.querySelectorAll('[data-close-password-modal="true"]').forEach(elemento => {
      elemento.addEventListener('click', cerrarModalClave);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && passwordModal && !passwordModal.classList.contains('hidden')) cerrarModalClave();
    });

    formChangePassword?.addEventListener('submit', async event => {
      event.preventDefault();
      const claveActual = currentPasswordInput.value;
      const claveNueva = newPasswordInput.value;
      const confirmacion = confirmPasswordInput.value;
      if (claveNueva !== confirmacion) {
        return mostrarToast('Las nuevas contraseñas no coinciden.', 'warning', 'Revisa la confirmación');
      }
      if (claveNueva.length < 8) {
        return mostrarToast('La nueva contraseña debe tener al menos 8 caracteres.', 'warning', 'Contraseña muy corta');
      }

      btnSavePassword.disabled = true;
      btnSavePassword.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin"></i> Guardando...';
      try {
        await apiRequest('cambiarClave', { claveActual, claveNueva });
        cerrarModalClave();
        cerrarSesionLocal(false);
        loginError.textContent = 'La contraseña fue actualizada. Ingresa con tu nueva contraseña.';
        loginError.classList.remove('hidden');
        usernameInput.focus();
      } catch (error) {
        mostrarToast(error.message, 'error', 'No se cambió la contraseña');
      } finally {
        btnSavePassword.disabled = false;
        btnSavePassword.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar nueva contraseña';
      }
    });

    btnLogout.onclick = async () => {
      try { if (sessionToken) await apiRequest('logout'); } catch (error) {}
      cerrarModalClave();
      cerrarSesionLocal(true);
    };

    // ====== LÓGICA DE ASISTENCIA DASHBOARD ======
    function normalizarTextoAsistencia(valor = '') {
      return String(valor)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
    }

    function fechaISOAsistencia(fecha) {
      const objeto = fecha instanceof Date ? fecha : new Date(fecha);
      if (Number.isNaN(objeto.getTime())) return '';
      return `${objeto.getFullYear()}-${String(objeto.getMonth() + 1).padStart(2, '0')}-${String(objeto.getDate()).padStart(2, '0')}`;
    }

    function fechaLocalAsistencia(valor) {
      const partes = String(valor || '').split('-').map(Number);
      if (partes.length !== 3 || partes.some(numero => !Number.isFinite(numero))) return null;
      return new Date(partes[0], partes[1] - 1, partes[2], 12, 0, 0);
    }

    function turnoAsistencia(valor) {
      const normalizado = normalizarTextoAsistencia(valor);
      return normalizado.includes('manana') ? 'Manana' : normalizado.includes('tarde') ? 'Tarde' : String(valor || '');
    }

    function claveClaseAgenda(clase, fecha = '') {
      return [
        fecha,
        clase?.id || '',
        clase?.ano || '',
        clase?.seccion || '',
        turnoAsistencia(clase?.turno),
        formatearHoraLimpia(clase?.horaInicio),
        formatearHoraLimpia(clase?.horaFin)
      ].join('|');
    }

    function claveRegistroAgenda(clase, fecha) {
      return [
        fecha,
        profesorActual?.materia || '',
        clase?.ano || '',
        clase?.seccion || '',
        turnoAsistencia(clase?.turno)
      ].join('|');
    }

    function clasesHorarioParaFecha(fechaISO) {
      const fecha = fechaLocalAsistencia(fechaISO);
      if (!fecha) return [];
      const dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
      const diaBuscado = normalizarTextoAsistencia(dias[fecha.getDay()]);
      return horariosProfesor
        .filter(clase => normalizarTextoAsistencia(clase.dia) === diaBuscado)
        .sort((a, b) => String(a.horaInicio || '').localeCompare(String(b.horaInicio || ''))
          || String(a.ano || '').localeCompare(String(b.ano || ''), 'es')
          || String(a.seccion || '').localeCompare(String(b.seccion || ''), 'es'));
    }

    function textoDiaAgenda(fechaISO) {
      const fecha = fechaLocalAsistencia(fechaISO);
      if (!fecha) return '—';
      const texto = fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: 'long'
      });
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    async function obtenerResumenClaseAgenda(clase, fechaISO, forzar = false) {
      const clave = claveRegistroAgenda(clase, fechaISO);
      if (!forzar && agendaResumenCache.has(clave)) return agendaResumenCache.get(clave);

      try {
        const turno = turnoAsistencia(clase.turno);
        const [datosAlumnos, registro] = await Promise.all([
          apiRequest('obtenerAlumnos', {
            ano: clase.ano,
            seccion: clase.seccion,
            turno
          }),
          apiRequest('obtenerAsistencia', {
            ano: clase.ano,
            seccion: clase.seccion,
            turno,
            fecha: fechaISO,
            materia: profesorActual.materia
          })
        ]);

        const alumnos = Array.isArray(datosAlumnos.alumnos) ? datosAlumnos.alumnos : [];
        const asistencia = registro.asistencia && typeof registro.asistencia === 'object'
          ? registro.asistencia
          : {};
        let presentes = 0;
        let ausentes = 0;

        alumnos.forEach(alumno => {
          const estado = asistencia[alumno.id];
          if (estado === 'Ausente') ausentes += 1;
          else if (estado === 'Presente') presentes += 1;
        });

        const existe = Boolean(registro.existe);
        const resumen = {
          existe,
          total: alumnos.length,
          presentes: existe ? presentes : 0,
          ausentes: existe ? ausentes : 0,
          error: false
        };
        agendaResumenCache.set(clave, resumen);
        return resumen;
      } catch (error) {
        console.error('No se pudo consultar el estado de la clase:', error);
        return { existe: false, total: 0, presentes: 0, ausentes: 0, error: true };
      }
    }

    function estadoTextoAgenda(resumen) {
      if (resumen.error) return { clase: 'is-error', texto: 'Sin conexión' };
      if (resumen.existe) return { clase: 'is-complete', texto: 'Registrada' };
      return { clase: 'is-pending', texto: 'Pendiente' };
    }

    function marcarClaseActivaAgenda() {
      const activa = asistenciaClaseActiva?.clave || '';
      document.querySelectorAll('[data-agenda-clase]').forEach(elemento => {
        elemento.classList.toggle('is-selected', elemento.dataset.agendaClase === activa);
      });
      document.querySelectorAll('[data-menu-clase]').forEach(elemento => {
        const seleccionada = elemento.dataset.menuClase === activa;
        elemento.classList.toggle('ring-2', seleccionada);
        elemento.classList.toggle('ring-blue-300', seleccionada);
        elemento.classList.toggle('bg-blue-50', seleccionada);
      });
    }

    async function abrirClaseDesdeAgenda(clase, fechaISO) {
      const turno = turnoAsistencia(clase.turno);
      asistenciaClaseActiva = {
        clave: claveClaseAgenda(clase, fechaISO),
        fecha: fechaISO,
        ano: clase.ano,
        seccion: clase.seccion,
        turno,
        horaInicio: clase.horaInicio,
        horaFin: clase.horaFin
      };

      selectFiltroAno.value = clase.ano;
      selectFiltroSeccion.value = clase.seccion;
      selectFiltroTurno.value = turno;
      fechaAsistencia.value = fechaISO;
      if (fechaAgendaClases) fechaAgendaClases.value = fechaISO;
      marcarClaseActivaAgenda();
      await cargarAlumnosDeSeccion();
      document.querySelector('.attendance-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderMenuSeccionesAgenda(clasesConResumen, fechaISO) {
      const box = document.getElementById('box-clases-hoy');
      const lista = document.getElementById('lista-botones-clases-hoy');
      if (!box || !lista) return;

      box.classList.remove('hidden');
      lista.innerHTML = '';

      if (!clasesConResumen.length) {
        lista.innerHTML = '<div class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-[11px] font-bold text-slate-400">No hay clases en el horario para esta fecha.</div>';
        return;
      }

      clasesConResumen.forEach(({ clase, resumen }) => {
        const estado = estadoTextoAgenda(resumen);
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.dataset.menuClase = claveClaseAgenda(clase, fechaISO);
        boton.className = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50';
        boton.innerHTML = `
          <span class="flex items-start justify-between gap-2">
            <span class="min-w-0">
              <strong class="block truncate text-xs font-black text-slate-700">${escaparHTML(clase.ano)} · Sección ${escaparHTML(clase.seccion)}</strong>
              <small class="mt-1 block text-[10px] font-bold text-slate-400">${escaparHTML(formatearHoraLimpia(clase.horaInicio))}–${escaparHTML(formatearHoraLimpia(clase.horaFin))} · ${escaparHTML(turnoAsistencia(clase.turno) === 'Manana' ? 'Mañana' : clase.turno)}</small>
            </span>
            <span class="rounded-full px-2 py-1 text-[9px] font-black ${resumen.existe ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${escaparHTML(estado.texto)}</span>
          </span>
          <span class="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span>${resumen.total} estudiantes</span>
            <span>${resumen.existe ? `${resumen.presentes} P · ${resumen.ausentes} A` : 'Abrir lista →'}</span>
          </span>`;
        boton.addEventListener('click', () => abrirClaseDesdeAgenda(clase, fechaISO));
        lista.appendChild(boton);
      });

      marcarClaseActivaAgenda();
    }

    function renderTarjetasAgenda(clasesConResumen, fechaISO) {
      if (!agendaClasesDia) return;
      agendaClasesDia.innerHTML = '';

      if (!clasesConResumen.length) {
        agendaClasesDia.innerHTML = `
          <div class="attendance-agenda-empty">
            <i class="fa-solid fa-calendar-xmark"></i>
            <div><strong>Sin clases programadas</strong><p>No hay bloques registrados en Horario para ${escaparHTML(textoDiaAgenda(fechaISO))}.</p></div>
          </div>`;
        return;
      }

      clasesConResumen.forEach(({ clase, resumen }) => {
        const estado = estadoTextoAgenda(resumen);
        const tarjeta = document.createElement('button');
        tarjeta.type = 'button';
        tarjeta.dataset.agendaClase = claveClaseAgenda(clase, fechaISO);
        tarjeta.className = `attendance-class-card ${estado.clase}`;
        tarjeta.innerHTML = `
          <span class="attendance-class-card__topline">
            <span class="attendance-class-card__time"><i class="fa-regular fa-clock"></i>${escaparHTML(formatearHoraLimpia(clase.horaInicio))}–${escaparHTML(formatearHoraLimpia(clase.horaFin))}</span>
            <span class="attendance-class-card__status">${escaparHTML(estado.texto)}</span>
          </span>
          <strong class="attendance-class-card__course">${escaparHTML(clase.ano)} · Sección “${escaparHTML(clase.seccion)}”</strong>
          <span class="attendance-class-card__meta"><i class="fa-solid fa-book-open-reader"></i>${escaparHTML(profesorActual?.materia || 'Materia')} · ${escaparHTML(turnoAsistencia(clase.turno) === 'Manana' ? 'Mañana' : clase.turno)}</span>
          <span class="attendance-class-card__numbers">
            <span><b>${resumen.presentes}</b><small>Presentes</small></span>
            <span><b>${resumen.ausentes}</b><small>Ausentes</small></span>
            <span><b>${resumen.total}</b><small>Estudiantes</small></span>
          </span>
          <span class="attendance-class-card__action"><span>${resumen.existe ? 'Consultar o editar' : 'Registrar asistencia'}</span><i class="fa-solid fa-arrow-right"></i></span>`;
        tarjeta.addEventListener('click', () => abrirClaseDesdeAgenda(clase, fechaISO));
        agendaClasesDia.appendChild(tarjeta);
      });

      marcarClaseActivaAgenda();
    }

    async function renderAgendaAsistencia({ forzar = false } = {}) {
      if (!fechaAgendaClases || !agendaClasesDia) return;
      const fechaISO = fechaAgendaClases.value || fechaISOAsistencia(new Date());
      fechaAgendaClases.value = fechaISO;
      const cargaActual = ++agendaCargaId;
      const clases = clasesHorarioParaFecha(fechaISO);

      if (nombreDiaAgenda) nombreDiaAgenda.textContent = textoDiaAgenda(fechaISO);
      if (agendaTotalClases) agendaTotalClases.textContent = String(clases.length);
      if (agendaClasesCompletadas) agendaClasesCompletadas.textContent = '0';
      if (agendaClasesPendientes) agendaClasesPendientes.textContent = String(clases.length);

      if (!clases.length) {
        renderTarjetasAgenda([], fechaISO);
        renderMenuSeccionesAgenda([], fechaISO);
        return;
      }

      agendaClasesDia.innerHTML = clases.map(() => `
        <div class="attendance-class-card is-loading">
          <span class="attendance-card-skeleton"></span>
          <span class="attendance-card-skeleton"></span>
          <span class="attendance-card-skeleton"></span>
        </div>`).join('');

      const resultados = await Promise.all(clases.map(async clase => ({
        clase,
        resumen: await obtenerResumenClaseAgenda(clase, fechaISO, forzar)
      })));

      if (cargaActual !== agendaCargaId) return;

      const completadas = resultados.filter(item => item.resumen.existe).length;
      if (agendaClasesCompletadas) agendaClasesCompletadas.textContent = String(completadas);
      if (agendaClasesPendientes) agendaClasesPendientes.textContent = String(Math.max(0, clases.length - completadas));
      renderTarjetasAgenda(resultados, fechaISO);
      renderMenuSeccionesAgenda(resultados, fechaISO);
    }

    if (fechaAgendaClases) {
      fechaAgendaClases.addEventListener('change', async () => {
        asistenciaClaseActiva = null;
        fechaAsistencia.value = fechaAgendaClases.value;
        await renderAgendaAsistencia();
      });
    }

    btnAgendaHoy?.addEventListener('click', async () => {
      const hoy = fechaISOAsistencia(new Date());
      fechaAgendaClases.value = hoy;
      fechaAsistencia.value = hoy;
      asistenciaClaseActiva = null;
      await renderAgendaAsistencia();
    });

    buscarAlumnoAsistencia?.addEventListener('input', renderAsistencia);

    const ESTADOS_ASISTENCIA = Object.freeze(['Presente', 'Ausente', 'Tardanza', 'Justificada']);

    function normalizarEstadoAsistencia(valor) {
      const texto = String(valor || '').trim().toLowerCase();
      if (texto === 'ausente') return 'Ausente';
      if (texto === 'tardanza' || texto === 'tarde') return 'Tardanza';
      if (texto === 'justificada' || texto === 'justificado' || texto === 'ausencia justificada') return 'Justificada';
      return 'Presente';
    }

    function aplicarEstadoMasivo(estado) {
      if (!ESTADOS_ASISTENCIA.includes(estado)) return;
      alumnosSeccion.forEach(alumno => { asistenciaTemporal[alumno.id] = estado; });
      renderAsistencia();
      actualizarStatsSeccion();
    }

    function asegurarBotonesMasivosAvanzados() {
      const contenedor = btnTodosPresentes?.parentElement;
      if (!contenedor || document.getElementById('btn-todos-tardanza')) return;

      const tardanza = document.createElement('button');
      tardanza.type = 'button';
      tardanza.id = 'btn-todos-tardanza';
      tardanza.className = 'attendance-bulk-extra attendance-bulk-extra--late';
      tardanza.innerHTML = '<i class="fa-solid fa-clock"></i><span>Todos con tardanza</span>';
      tardanza.addEventListener('click', () => aplicarEstadoMasivo('Tardanza'));

      const justificada = document.createElement('button');
      justificada.type = 'button';
      justificada.id = 'btn-todos-justificada';
      justificada.className = 'attendance-bulk-extra attendance-bulk-extra--justified';
      justificada.innerHTML = '<i class="fa-solid fa-file-circle-check"></i><span>Todos justificados</span>';
      justificada.addEventListener('click', () => aplicarEstadoMasivo('Justificada'));

      contenedor.appendChild(tardanza);
      contenedor.appendChild(justificada);
    }

    asegurarBotonesMasivosAvanzados();

    btnTodosPresentes?.addEventListener('click', () => {
      aplicarEstadoMasivo('Presente');
    });

    btnTodosAusentes?.addEventListener('click', () => {
      aplicarEstadoMasivo('Ausente');
    });

    btnCargarListaFiltrada.onclick = cargarAlumnosDeSeccion;
   
    async function cargarAlumnosDeSeccion() {
      const a = selectFiltroAno.value;
      const s = selectFiltroSeccion.value;
      const t = turnoAsistencia(selectFiltroTurno.value);
      const fechaTrabajo = fechaAsistencia.value || fechaAgendaClases?.value || fechaISOAsistencia(new Date());
      selectFiltroTurno.value = t;
      fechaAsistencia.value = fechaTrabajo;
      if (fechaAgendaClases && fechaAgendaClases.value !== fechaTrabajo) fechaAgendaClases.value = fechaTrabajo;
      if (profesorActual) storageSet('filtros_asistencia_' + profesorActual.id, JSON.stringify({ a, s, t }));

      const claseHorario = clasesHorarioParaFecha(fechaTrabajo).find(clase =>
        clase.ano === a
        && clase.seccion === s
        && turnoAsistencia(clase.turno) === t
      );
      if (claseHorario) {
        asistenciaClaseActiva = {
          clave: claveClaseAgenda(claseHorario, fechaTrabajo),
          fecha: fechaTrabajo,
          ano: a,
          seccion: s,
          turno: t,
          horaInicio: claseHorario.horaInicio,
          horaFin: claseHorario.horaFin
        };
      } else {
        asistenciaClaseActiva = {
          clave: '',
          fecha: fechaTrabajo,
          ano: a,
          seccion: s,
          turno: t,
          horaInicio: '',
          horaFin: ''
        };
      }

      asistenciaInfo.textContent = `Lista: ${a} - Secc "${s}"`;
      if (asistenciaSubtitulo) asistenciaSubtitulo.textContent = 'Cargando estudiantes y registro guardado…';
      listaAlumnosAsistencia.innerHTML = '<div class="py-8 text-center"><i class="fa-solid fa-spinner animate-spin text-3xl text-indigo-500 mb-2"></i><p>Cargando lista...</p></div>';

      try {
        const [d, registro] = await Promise.all([
          apiRequest('obtenerAlumnos', { ano: a, seccion: s, turno: t }),
          apiRequest('obtenerAsistencia', {
            ano: a,
            seccion: s,
            turno: t,
            fecha: fechaTrabajo,
            materia: profesorActual.materia
          })
        ]);
        alumnosSeccion = Array.isArray(d.alumnos) ? d.alumnos : [];
        asistenciaTemporal = registro.asistencia && typeof registro.asistencia === 'object' ? { ...registro.asistencia } : {};
        estadisticasAlumnos = {};
        if (buscarAlumnoAsistencia) buscarAlumnoAsistencia.value = '';
        contadorAsistencia.textContent = `${alumnosSeccion.length} Alumnos`;
        alumnosSeccion.forEach(al => {
          estadisticasAlumnos[al.id] = { faltasSemana: 0, faltasMes: 0 };
          asistenciaTemporal[al.id] = normalizarEstadoAsistencia(asistenciaTemporal[al.id]);
        });
        renderAsistencia();
        actualizarStatsSeccion();
        llenarSelectActaRapida();
        if (asistenciaSubtitulo) {
          const fechaLegible = fechaLocalAsistencia(fechaTrabajo)?.toLocaleDateString('es-ES') || fechaTrabajo;
          asistenciaSubtitulo.textContent = registro.existe
            ? `Asistencia guardada · ${fechaLegible} · Puedes consultarla o corregirla`
            : `Registro pendiente · ${fechaLegible} · Guarda al finalizar`;
        }
        marcarClaseActivaAgenda();
        if (registro.existe) mostrarToast('Se cargó la asistencia que ya estaba guardada para esta fecha.', 'info', 'Registro recuperado');
      } catch (e) {
        console.error('Error al cargar estudiantes o asistencia:', e);
        listaAlumnosAsistencia.innerHTML = '<p class="text-center text-red-500 py-6">No fue posible cargar la lista.</p>';
        if (asistenciaSubtitulo) asistenciaSubtitulo.textContent = 'No fue posible cargar esta sección.';
      }
    }

    fechaAsistencia.addEventListener('change', async () => {
      if (fechaAgendaClases) fechaAgendaClases.value = fechaAsistencia.value;
      asistenciaClaseActiva = null;
      await renderAgendaAsistencia();
      if (profesorActual && (alumnosSeccion.length || selectFiltroAno.value)) await cargarAlumnosDeSeccion();
    });

    function renderAsistencia() {
      listaAlumnosAsistencia.innerHTML = '';
      if (alumnosSeccion.length === 0) {
        listaAlumnosAsistencia.innerHTML = '<div class="py-10 text-center text-gray-400"><i class="fa-solid fa-user-slash text-3xl mb-3 text-gray-300"></i><p class="text-sm font-semibold">No hay estudiantes registrados en esta sección.</p></div>';
        contadorAsistencia.textContent = '0 Alumnos';
        statPresentes.textContent = '0';
        statAusentes.textContent = '0';
        porcentajeAsistencia.textContent = '0%';
        barPresentes.style.width = '0%';
        barAusentes.style.width = '0%';
        actualizarResumenEstadosExtra({ tardanzas: 0, justificadas: 0 });
        return;
      }

      alumnosSeccion.forEach(alumno => {
        asistenciaTemporal[alumno.id] = normalizarEstadoAsistencia(asistenciaTemporal[alumno.id]);
      });

      const termino = normalizarTextoAsistencia(buscarAlumnoAsistencia?.value || '');
      const visibles = termino
        ? alumnosSeccion.filter(alumno => normalizarTextoAsistencia(`${alumno.nombre || ''} ${alumno.cedula || ''}`).includes(termino))
        : alumnosSeccion;

      contadorAsistencia.textContent = termino
        ? `${visibles.length}/${alumnosSeccion.length} Alumnos`
        : `${alumnosSeccion.length} Alumnos`;

      if (!visibles.length) {
        listaAlumnosAsistencia.innerHTML = '<div class="py-10 text-center text-gray-400"><i class="fa-solid fa-magnifying-glass text-3xl mb-3 text-gray-300"></i><p class="text-sm font-semibold">No hay coincidencias en esta sección.</p></div>';
        return;
      }

      const configuracionEstados = {
        Presente: { icono: 'fa-check', texto: 'PRES', clase: 'is-present' },
        Ausente: { icono: 'fa-xmark', texto: 'AUS', clase: 'is-absent' },
        Tardanza: { icono: 'fa-clock', texto: 'TARD', clase: 'is-late' },
        Justificada: { icono: 'fa-file-circle-check', texto: 'JUST', clase: 'is-justified' }
      };

      visibles.forEach((al, indice) => {
        const idDom = `alumno-${String(al.id).replace(/[^a-zA-Z0-9_-]/g, '-')}-${indice}`;
        const nombre = escaparHTML(al.nombre || 'Estudiante');
        const cedula = escaparHTML(al.cedula || 'Sin cédula');
        const estadoInicial = normalizarEstadoAsistencia(asistenciaTemporal[al.id]);
        const botones = ESTADOS_ASISTENCIA.map(estado => {
          const cfg = configuracionEstados[estado];
          const activo = estadoInicial === estado ? ` ${cfg.clase}` : '';
          const idBoton = `${estado.charAt(0).toLowerCase()}-${idDom}`;
          return `<button id="${idBoton}" type="button" class="attendance-state-button${activo}" data-attendance-state="${estado}" aria-label="Marcar ${estado.toLowerCase()} a ${nombre}"><i class="fa-solid ${cfg.icono}"></i><span>${cfg.texto}</span></button>`;
        }).join('');

        const d = document.createElement('div');
        d.className = 'attendance-student-row attendance-student-row--advanced';
        d.innerHTML = `<div class="flex items-center gap-3 min-w-0"><div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black shadow-sm flex-shrink-0">${nombre.charAt(0).toUpperCase()}</div><div class="min-w-0"><p class="text-sm font-bold text-gray-800 truncate">${nombre}</p><div class="flex flex-wrap items-center gap-2 mt-1"><span class="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-bold">C.I: ${cedula}</span><span class="attendance-current-state attendance-current-state--${estadoInicial.toLowerCase()}">${escaparHTML(estadoInicial)}</span></div></div></div><div class="attendance-state-grid">${botones}</div>`;
        d.querySelectorAll('[data-attendance-state]').forEach(boton => {
          boton.addEventListener('click', () => setA(al.id, boton.dataset.attendanceState, idDom));
        });
        listaAlumnosAsistencia.appendChild(d);
      });
    }

    window.setA = function(id, est, idDom = id) {
      const estado = normalizarEstadoAsistencia(est);
      asistenciaTemporal[id] = estado;
      const fila = document.getElementById(`p-${idDom}`)?.closest('.attendance-student-row--advanced')
        || document.querySelector(`#${CSS.escape(String(estado.charAt(0).toLowerCase() + '-' + idDom))}`)?.closest('.attendance-student-row--advanced');
      if (fila) {
        fila.querySelectorAll('[data-attendance-state]').forEach(boton => {
          boton.classList.remove('is-present', 'is-absent', 'is-late', 'is-justified');
          if (boton.dataset.attendanceState === estado) {
            const mapa = { Presente: 'is-present', Ausente: 'is-absent', Tardanza: 'is-late', Justificada: 'is-justified' };
            boton.classList.add(mapa[estado]);
          }
        });
        const etiqueta = fila.querySelector('.attendance-current-state');
        if (etiqueta) {
          etiqueta.className = `attendance-current-state attendance-current-state--${estado.toLowerCase()}`;
          etiqueta.textContent = estado;
        }
      } else {
        renderAsistencia();
      }
      actualizarStatsSeccion();
    }

    function asegurarResumenEstadosExtra() {
      let contenedor = document.getElementById('attendance-extra-stats');
      if (contenedor) return contenedor;

      // Inserta los estados adicionales dentro del bloque de estadísticas del
      // resumen lateral. Así nunca quedan flotando sobre la lista o el acta.
      const bloqueEstadisticas = statAusentes?.closest('.space-y-3')
        || statPresentes?.closest('.space-y-3');
      if (!bloqueEstadisticas) return null;

      contenedor = document.createElement('div');
      contenedor.id = 'attendance-extra-stats';
      contenedor.className = 'attendance-extra-stats';
      contenedor.innerHTML = '<article><span class="attendance-extra-stats__icon attendance-extra-stats__icon--late"><i class="fa-solid fa-clock"></i></span><div><small>Tardanzas</small><strong id="stat-tardanzas">0</strong></div></article><article><span class="attendance-extra-stats__icon attendance-extra-stats__icon--justified"><i class="fa-solid fa-file-circle-check"></i></span><div><small>Justificadas</small><strong id="stat-justificadas">0</strong></div></article>';
      bloqueEstadisticas.appendChild(contenedor);
      return contenedor;
    }

    function actualizarResumenEstadosExtra({ tardanzas, justificadas }) {
      asegurarResumenEstadosExtra();
      const tard = document.getElementById('stat-tardanzas');
      const just = document.getElementById('stat-justificadas');
      if (tard) tard.textContent = String(tardanzas || 0);
      if (just) just.textContent = String(justificadas || 0);
    }

    function actualizarStatsSeccion() {
      const total = alumnosSeccion.length;
      if (total === 0) {
        statPresentes.textContent = '0';
        statAusentes.textContent = '0';
        porcentajeAsistencia.textContent = '0%';
        barPresentes.style.width = '0%';
        barAusentes.style.width = '0%';
        actualizarResumenEstadosExtra({ tardanzas: 0, justificadas: 0 });
        return;
      }
      let presentes = 0;
      let ausentes = 0;
      let tardanzas = 0;
      let justificadas = 0;
      alumnosSeccion.forEach(alumno => {
        const estado = normalizarEstadoAsistencia(asistenciaTemporal[alumno.id]);
        asistenciaTemporal[alumno.id] = estado;
        if (estado === 'Ausente') ausentes += 1;
        else if (estado === 'Tardanza') tardanzas += 1;
        else if (estado === 'Justificada') justificadas += 1;
        else presentes += 1;
      });
      statPresentes.textContent = presentes;
      statAusentes.textContent = ausentes;
      actualizarResumenEstadosExtra({ tardanzas, justificadas });
      const asistenciaEfectiva = presentes + tardanzas;
      const noAsistencia = ausentes + justificadas;
      const pctPresentes = Math.round((asistenciaEfectiva / total) * 100);
      const pctAusentes = Math.round((noAsistencia / total) * 100);
      barPresentes.style.width = `${pctPresentes}%`;
      barAusentes.style.width = `${pctAusentes}%`;
      porcentajeAsistencia.textContent = `${pctPresentes}%`;
      if (pctPresentes >= 80) porcentajeAsistencia.className = 'text-xl font-black text-green-500';
      else if (pctPresentes >= 50) porcentajeAsistencia.className = 'text-xl font-black text-orange-500';
      else porcentajeAsistencia.className = 'text-xl font-black text-red-500';
    }

    function llenarSelectActaRapida() {
      selectActaRapida.innerHTML = '<option value="">-- Selecciona el estudiante --</option>';
      const ordenados = [...alumnosSeccion].sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
      ordenados.forEach(al => {
        const opt = document.createElement('option');
        opt.value = al.id;
        opt.textContent = al.nombre;
        selectActaRapida.appendChild(opt);
      });
    }

    window.generarActaInasistenciaRapida = async function() {
        const idAlumno = selectActaRapida.value;
        if(!idAlumno) return alert('Selecciona un estudiante para emitir el acta.');
        const alumno = alumnosSeccion.find(a => a.id.toString() === idAlumno);
        if (!alumno) return alert('No fue posible identificar al estudiante seleccionado.');

        cambiarPestana(tabActas, sectionActas);
        actaFiltroAno.value = selectFiltroAno.value;
        actaFiltroSeccion.value = selectFiltroSeccion.value;
        actaFiltroTurno.value = selectFiltroTurno.value;
        await filtrarAlumnosParaActas();
        actaSelectAlumno.value = idAlumno;
        actaSelectAlumno.dispatchEvent(new Event('change'));
        cambiarTipoActa('inasistencia', document.getElementById('btn-acta-inasistencia'));

        const inputFechas = document.getElementById('acta-inasistencia-fechas');
        const txtMotivo = document.getElementById('acta-inasistencia-motivo');
        const fechaLegible = fechaAsistencia.value
          ? new Date(`${fechaAsistencia.value}T12:00:00`).toLocaleDateString('es-ES')
          : new Date().toLocaleDateString('es-ES');
        const estadoActual = asistenciaTemporal[idAlumno] || 'Sin registrar';
        if(inputFechas) inputFechas.value = `Registro del ${fechaLegible}: ${estadoActual}.`;
        if(txtMotivo) txtMotivo.value = `Se deja constancia del registro de asistencia del estudiante ${alumno.nombre} correspondiente al ${fechaLegible}. Complete este campo con los antecedentes y observaciones verificadas antes de generar el documento final.`;
        mostrarToast('Se preparó el acta con la fecha y el estudiante seleccionados.', 'info', 'Borrador listo');
    }

    if(btnGuardarAsistencia) {
      btnGuardarAsistencia.addEventListener('click', async () => {
        if(Object.keys(asistenciaTemporal).length === 0) return alert('Busca una lista primero.');
        if (!fechaAsistencia.value) return alert('Selecciona la fecha de asistencia.');
        btnGuardarAsistencia.disabled = true;
        btnGuardarAsistencia.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin mr-1"></i> Guardando asistencia...';
        try {
          const payload = { materia: profesorActual.materia, ano: selectFiltroAno.value, seccion: selectFiltroSeccion.value, turno: selectFiltroTurno.value, fecha: fechaAsistencia.value, asistencia: asistenciaTemporal, origen: 'Web', modificadoPor: profesorActual.nombre || profesorActual.usuario || 'Docente' };
          await apiRequest('guardarAsistencia', payload);
          agendaResumenCache.delete(claveRegistroAgenda({
            ano: selectFiltroAno.value,
            seccion: selectFiltroSeccion.value,
            turno: selectFiltroTurno.value
          }, fechaAsistencia.value));
          if (asistenciaSubtitulo) asistenciaSubtitulo.textContent = `Asistencia guardada · ${fechaLocalAsistencia(fechaAsistencia.value)?.toLocaleDateString('es-ES') || fechaAsistencia.value}`;
          await renderAgendaAsistencia({ forzar: true });
          mostrarToast('La asistencia del día quedó registrada correctamente.', 'success', 'Asistencia guardada');
        } catch(e) {
          console.error('Error al guardar asistencia:', e);
          mostrarToast('Verifica tu conexión e inténtalo nuevamente.', 'error', 'No se guardó la asistencia');
        } finally {
          btnGuardarAsistencia.disabled = false;
          btnGuardarAsistencia.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Guardar Asistencia del Día';
        }
      });
    }

    // ====== COLOR GLOBAL POR AÑO ======
    function getColorAno(ano) {
      const a = String(ano || '').toLowerCase();
      if(a.includes("1")) return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500', hex: 'bg-blue-500', shadow: 'shadow-blue-200' };
      if(a.includes("2")) return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-500', hex: 'bg-emerald-500', shadow: 'shadow-emerald-200' };
      if(a.includes("3")) return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-500', hex: 'bg-purple-500', shadow: 'shadow-purple-200' };
      if(a.includes("4")) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-500', hex: 'bg-orange-500', shadow: 'shadow-orange-200' };
      if(a.includes("5")) return { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-500', hex: 'bg-rose-500', shadow: 'shadow-rose-200' };
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-500', hex: 'bg-gray-500', shadow: 'shadow-gray-200' };
    }

    // ====== LÓGICA DE PLANIFICACIÓN ======
    function fechaLocalDesdeISO(valor) {
      const partes = String(valor || '').split('-').map(Number);
      if (partes.length !== 3 || partes.some(n => !Number.isFinite(n))) return null;
      return new Date(partes[0], partes[1] - 1, partes[2]);
    }

    function fechaISODesdeLocal(fecha) {
      return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    }

    function getColorSeccion(seccion) {
      const clave = String(seccion || 'A').trim().toUpperCase();
      const colores = {
        A: { key: 'a', label: 'Sección A', solid: '#2563eb', soft: '#dbeafe', ink: '#1d4ed8' },
        B: { key: 'b', label: 'Sección B', solid: '#10b981', soft: '#d1fae5', ink: '#047857' },
        C: { key: 'c', label: 'Sección C', solid: '#a855f7', soft: '#f3e8ff', ink: '#7e22ce' }
      };
      return colores[clave] || { key: 'otro', label: `Sección ${clave}`, solid: '#f59e0b', soft: '#fef3c7', ink: '#b45309' };
    }

    let calendarioPlanFecha = new Date();
    let calendarioDiaSeleccionado = null;

    const gridCalendarioAmpliado = document.getElementById('grid-calendario-ampliado');
    const mesCalendarioAmpliado = document.getElementById('mes-calendario-ampliado');
    const modalCalendarioPlan = document.getElementById('modal-calendario-planificacion');
    const detalleDiaCalendario = document.getElementById('detalle-dia-calendario');
    const detalleDiaEtiqueta = document.getElementById('detalle-dia-etiqueta');
    const detalleDiaFecha = document.getElementById('detalle-dia-fecha');
    const statPlanTotal = document.getElementById('stat-plan-total');
    const statPlanSecciones = document.getElementById('stat-plan-secciones');
    const statPlanProxima = document.getElementById('stat-plan-proxima');

    window.mostrarFormularioPlan = function(fechaSugerida = '') {
      panelListaPlan.classList.add('hidden');
      accionesPlan.classList.add('hidden');
      panelFormPlan.classList.remove('hidden');
      seccionPlanViendo = null;
      if (fechaSugerida) document.getElementById('plan-fecha').value = fechaSugerida;
      setTimeout(() => document.getElementById('plan-actividad')?.focus(), 40);
    };

    function renderMenuPlanificacion() {
      menuSeccionesPlan.innerHTML = '';
      if (planesProfesor.length === 0) {
        menuSeccionesPlan.innerHTML = '<div class="planning-empty-mini"><i class="fa-regular fa-calendar-xmark"></i><p>Aún no hay secciones planificadas.</p></div>';
        return;
      }
      const mapa = new Map();
      planesProfesor.forEach(p => {
        const key = `${p.ano}-${p.seccion}`;
        if (!mapa.has(key)) mapa.set(key, { key, ano: p.ano, seccion: p.seccion, cantidad: 0, puntos: 0 });
        const item = mapa.get(key);
        item.cantidad += 1;
        item.puntos += Number(p.puntos || 0);
      });
      [...mapa.values()].sort((a, b) => a.key.localeCompare(b.key)).forEach(sec => {
        const color = getColorSeccion(sec.seccion);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `planning-section-button planning-section-button--${color.key}`;
        btn.innerHTML = `<span class="planning-section-button__mark">${escaparHTML(sec.seccion)}</span><span class="planning-section-button__copy"><strong>${escaparHTML(sec.ano)} - Sección “${escaparHTML(sec.seccion)}”</strong><small>${sec.cantidad} evaluación${sec.cantidad === 1 ? '' : 'es'} · ${sec.puntos} pts</small></span><i class="fa-solid fa-chevron-right"></i>`;
        btn.addEventListener('click', () => mostrarListaPlan(sec.ano, sec.seccion));
        menuSeccionesPlan.appendChild(btn);
      });
    }

    window.mostrarListaPlan = function(ano, seccion) {
      panelFormPlan.classList.add('hidden');
      panelListaPlan.classList.remove('hidden');
      accionesPlan.classList.remove('hidden');
      seccionPlanViendo = { ano, seccion };
      tituloPlan.textContent = 'Plan de Evaluación';
      subtituloPlan.textContent = `${ano} - Sección “${seccion}”`;
      tablaBodyPlan.innerHTML = '';
      const filtrados = planesProfesor.filter(p => p.ano === ano && p.seccion === seccion).sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
      let suma = 0;
      if (filtrados.length === 0) {
        tablaBodyPlan.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-gray-400 text-xs">No hay evaluaciones cargadas.</td></tr>';
      } else {
        filtrados.forEach((p, index) => {
          suma += Number(p.puntos || 0);
          const fecha = fechaLocalDesdeISO(p.fecha);
          const fechaStr = fecha ? fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : escaparHTML(p.fecha);
          const color = getColorSeccion(p.seccion);
          const tr = document.createElement('tr');
          tr.innerHTML = `<td class="px-4 py-3 font-semibold text-gray-800"><span class="planning-table-date">${fechaStr}</span></td><td class="px-4 py-3 text-gray-600"><span class="planning-table-section planning-table-section--${color.key}">${escaparHTML(p.seccion)}</span>${escaparHTML(p.actividad || 'Evaluación')}</td><td class="px-4 py-3 text-center font-black text-indigo-600">${escaparHTML(p.puntos || 0)}</td><td class="px-4 py-3 text-center no-pdf"><button type="button" class="text-red-400 hover:text-red-600 transition" aria-label="Eliminar evaluación"><i class="fa-solid fa-trash-can"></i></button></td>`;
          tr.querySelector('button').addEventListener('click', () => eliminarPlanLocal(index, ano, seccion));
          tablaBodyPlan.appendChild(tr);
        });
      }
      badgeTotalPlan.textContent = `Total: ${suma} pts`;
      badgeTotalPlan.className = suma > 100
        ? 'bg-red-100 text-red-800 px-3 py-1.5 rounded-lg font-black text-sm border border-red-200'
        : 'bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-lg font-black text-sm border border-indigo-200';
    };

    window.eliminarPlanLocal = async function(indexReal, ano, seccion) {
      if (!confirm('¿Eliminar esta evaluación?')) return;
      const filtrado = planesProfesor.filter(p => p.ano === ano && p.seccion === seccion).sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
      const plan = filtrado[indexReal];
      if (!plan?.id) return mostrarToast('No se encontró el identificador de la evaluación.', 'error');
      try {
        await apiRequest('eliminarPlanificacion', { id: plan.id });
        planesProfesor = planesProfesor.filter(p => p.id !== plan.id);
        actualizarUIPlanificacion();
        const quedan = planesProfesor.some(p => p.ano === ano && p.seccion === seccion);
        if (quedan) mostrarListaPlan(ano, seccion); else mostrarFormularioPlan();
        mostrarToast('La evaluación fue eliminada del registro del docente.', 'success', 'Evaluación eliminada');
      } catch (error) {
        mostrarToast(error.message, 'error', 'No se eliminó la evaluación');
      }
    };

    function evaluacionesDelDia(fechaISO) {
      return planesProfesor.filter(p => String(p.fecha) === fechaISO).sort((a, b) => String(a.seccion).localeCompare(String(b.seccion)) || String(a.actividad).localeCompare(String(b.actividad), 'es'));
    }

    function nombresMes(fecha) {
      return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(fecha);
    }

    function construirCeldaCalendario(fecha, mesVisible, ampliado = false) {
      const iso = fechaISODesdeLocal(fecha);
      const eventos = evaluacionesDelDia(iso);
      const hoyISO = fechaISODesdeLocal(new Date());
      const fueraMes = fecha.getMonth() !== mesVisible;
      const seleccionada = calendarioDiaSeleccionado === iso;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `planning-calendar-day${ampliado ? ' planning-calendar-day--full' : ''}${fueraMes ? ' is-outside' : ''}${iso === hoyISO ? ' is-today' : ''}${seleccionada ? ' is-selected' : ''}${eventos.length ? ' has-events' : ''}`;
      btn.dataset.fecha = iso;
      btn.setAttribute('aria-label', `${fecha.toLocaleDateString('es-ES')} · ${eventos.length} evaluaciones`);
      const limite = ampliado ? 4 : 2;
      const badges = eventos.slice(0, limite).map(p => {
        const color = getColorSeccion(p.seccion);
        return `<span class="planning-eval-chip planning-eval-chip--${color.key}" title="${escaparHTML(p.actividad || 'Evaluación')}"><b>${escaparHTML(p.seccion)}</b><em>${escaparHTML(p.actividad || 'Evaluación')}</em></span>`;
      }).join('');
      const restantes = eventos.length > limite ? `<span class="planning-eval-more">+${eventos.length - limite} más</span>` : '';
      btn.innerHTML = `<span class="planning-calendar-day__number">${fecha.getDate()}</span><span class="planning-calendar-day__events">${badges}${restantes}</span>`;
      btn.addEventListener('click', () => seleccionarDiaCalendario(iso, false));
      return btn;
    }

    function renderUnaCuadriculaCalendario(contenedor, fechaBase, ampliado = false) {
      if (!contenedor) return;
      contenedor.innerHTML = '';
      const primerDia = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), 1);
      const inicio = new Date(primerDia);
      inicio.setDate(1 - primerDia.getDay());
      for (let i = 0; i < 42; i += 1) {
        const fecha = new Date(inicio);
        fecha.setDate(inicio.getDate() + i);
        contenedor.appendChild(construirCeldaCalendario(fecha, fechaBase.getMonth(), ampliado));
      }
    }

    function renderDetalleDia(fechaISO) {
      if (!detalleDiaCalendario || !detalleDiaEtiqueta || !detalleDiaFecha) return;
      const fecha = fechaLocalDesdeISO(fechaISO);
      if (!fecha) return;
      const eventos = evaluacionesDelDia(fechaISO);
      detalleDiaEtiqueta.textContent = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
      detalleDiaFecha.textContent = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
      detalleDiaCalendario.innerHTML = '';
      if (!eventos.length) {
        detalleDiaCalendario.innerHTML = `<div class="planning-calendar-empty"><i class="fa-regular fa-calendar-plus"></i><p>No hay evaluaciones programadas para este día.</p><button type="button" id="btn-nueva-evaluacion-dia">Programar evaluación</button></div>`;
        detalleDiaCalendario.querySelector('#btn-nueva-evaluacion-dia').addEventListener('click', () => {
          cerrarCalendarioPlanificacion();
          mostrarFormularioPlan(fechaISO);
        });
        return;
      }
      eventos.forEach(p => {
        const color = getColorSeccion(p.seccion);
        const item = document.createElement('button');
        item.type = 'button';
        item.className = `planning-calendar-detail-item planning-calendar-detail-item--${color.key}`;
        item.innerHTML = `<span class="planning-calendar-detail-item__section">${escaparHTML(p.seccion)}</span><span><strong>${escaparHTML(p.actividad || 'Evaluación')}</strong><small>${escaparHTML(p.ano)} · ${escaparHTML(p.puntos || 0)} puntos</small></span><i class="fa-solid fa-arrow-right"></i>`;
        item.addEventListener('click', () => {
          cerrarCalendarioPlanificacion();
          mostrarListaPlan(p.ano, p.seccion);
        });
        detalleDiaCalendario.appendChild(item);
      });
      const nuevo = document.createElement('button');
      nuevo.type = 'button';
      nuevo.className = 'planning-calendar-add-day';
      nuevo.innerHTML = '<i class="fa-solid fa-plus"></i> Agregar otra evaluación este día';
      nuevo.addEventListener('click', () => {
        cerrarCalendarioPlanificacion();
        mostrarFormularioPlan(fechaISO);
      });
      detalleDiaCalendario.appendChild(nuevo);
    }

    function seleccionarDiaCalendario(fechaISO, abrirModal = false) {
      calendarioDiaSeleccionado = fechaISO;
      const fecha = fechaLocalDesdeISO(fechaISO);
      if (fecha) calendarioPlanFecha = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      renderCalendario();
      renderDetalleDia(fechaISO);
      renderResumenDiaCompacto(fechaISO);
      if (abrirModal) abrirCalendarioPlanificacion();
    }

    function renderResumenDiaCompacto(fechaISO = calendarioDiaSeleccionado) {
      if (!resumenDiaCalendario || !resumenDiaTitulo) return;
      const fecha = fechaLocalDesdeISO(fechaISO);
      resumenDiaCalendario.innerHTML = '';
      if (!fecha) {
        resumenDiaTitulo.textContent = 'Selecciona una fecha';
        resumenDiaCalendario.innerHTML = '<div class="planning-upcoming-empty"><i class="fa-regular fa-hand-pointer"></i><span>Haz clic en un día del calendario para ver lo programado.</span></div>';
        return;
      }

      resumenDiaTitulo.textContent = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
      const eventos = evaluacionesDelDia(fechaISO);
      if (!eventos.length) {
        const vacio = document.createElement('div');
        vacio.className = 'planning-day-empty';
        vacio.innerHTML = '<i class="fa-regular fa-calendar-plus"></i><div><strong>Sin evaluaciones</strong><span>No hay actividades programadas para este día.</span></div><button type="button">Programar</button>';
        vacio.querySelector('button').addEventListener('click', () => {
          mostrarFormularioPlan(fechaISO);
          panelFormPlan?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        resumenDiaCalendario.appendChild(vacio);
        return;
      }

      eventos.forEach(p => {
        const color = getColorSeccion(p.seccion);
        const item = document.createElement('button');
        item.type = 'button';
        item.className = `planning-day-item planning-day-item--${color.key}`;
        item.innerHTML = `<span class="planning-day-item__section">${escaparHTML(p.seccion)}</span><span class="planning-day-item__copy"><strong>${escaparHTML(p.actividad || 'Evaluación')}</strong><small>${escaparHTML(p.ano)} · ${escaparHTML(p.puntos || 0)} puntos</small></span><i class="fa-solid fa-arrow-right"></i>`;
        item.addEventListener('click', () => {
          mostrarListaPlan(p.ano, p.seccion);
          panelListaPlan?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        resumenDiaCalendario.appendChild(item);
      });
    }

    function actualizarStatsPlanificacion() {
      if (statPlanTotal) statPlanTotal.textContent = String(planesProfesor.length);
      const secciones = new Set(planesProfesor.map(p => `${p.ano}-${p.seccion}`));
      if (statPlanSecciones) statPlanSecciones.textContent = String(secciones.size);
      if (statPlanProxima) {
        const hoyISO = fechaISODesdeLocal(new Date());
        const siguiente = [...planesProfesor].filter(p => String(p.fecha) >= hoyISO).sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)))[0];
        if (!siguiente) statPlanProxima.textContent = 'Sin fecha';
        else {
          const fecha = fechaLocalDesdeISO(siguiente.fecha);
          statPlanProxima.textContent = fecha ? fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '') : siguiente.fecha;
        }
      }
    }

    function renderCalendario() {
      const nombre = nombresMes(calendarioPlanFecha);
      if (mesCalendario) mesCalendario.textContent = nombre;
      if (mesCalendarioAmpliado) mesCalendarioAmpliado.textContent = nombre;
      renderUnaCuadriculaCalendario(gridCalendario, calendarioPlanFecha, false);
      renderUnaCuadriculaCalendario(gridCalendarioAmpliado, calendarioPlanFecha, true);
      if (calendarioDiaSeleccionado) renderDetalleDia(calendarioDiaSeleccionado);
    }

    function moverMesCalendario(delta) {
      calendarioPlanFecha = new Date(calendarioPlanFecha.getFullYear(), calendarioPlanFecha.getMonth() + delta, 1);
      renderCalendario();
    }

    function irAHoyCalendario() {
      const hoy = new Date();
      calendarioPlanFecha = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      calendarioDiaSeleccionado = fechaISODesdeLocal(hoy);
      renderCalendario();
      renderDetalleDia(calendarioDiaSeleccionado);
      renderResumenDiaCompacto(calendarioDiaSeleccionado);
    }

    function abrirCalendarioPlanificacion() {
      if (!modalCalendarioPlan) return;
      modalCalendarioPlan.classList.remove('hidden');
      modalCalendarioPlan.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (!calendarioDiaSeleccionado) calendarioDiaSeleccionado = fechaISODesdeLocal(new Date());
      renderCalendario();
      renderDetalleDia(calendarioDiaSeleccionado);
    }

    function cerrarCalendarioPlanificacion() {
      if (!modalCalendarioPlan) return;
      modalCalendarioPlan.classList.add('hidden');
      modalCalendarioPlan.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }

    document.getElementById('btn-cal-prev')?.addEventListener('click', () => moverMesCalendario(-1));
    document.getElementById('btn-cal-next')?.addEventListener('click', () => moverMesCalendario(1));
    document.getElementById('btn-cal-hoy')?.addEventListener('click', irAHoyCalendario);
    document.getElementById('btn-cal-ampliar')?.addEventListener('click', abrirCalendarioPlanificacion);
    document.getElementById('btn-cal-modal-prev')?.addEventListener('click', () => moverMesCalendario(-1));
    document.getElementById('btn-cal-modal-next')?.addEventListener('click', () => moverMesCalendario(1));
    document.getElementById('btn-cal-modal-hoy')?.addEventListener('click', irAHoyCalendario);
    modalCalendarioPlan?.querySelectorAll('[data-close-calendar="true"]').forEach(el => el.addEventListener('click', cerrarCalendarioPlanificacion));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && modalCalendarioPlan && !modalCalendarioPlan.classList.contains('hidden')) cerrarCalendarioPlanificacion();
    });

    function actualizarUIPlanificacion() {
      if (!calendarioDiaSeleccionado) calendarioDiaSeleccionado = fechaISODesdeLocal(new Date());
      renderMenuPlanificacion();
      renderCalendario();
      renderResumenDiaCompacto(calendarioDiaSeleccionado);
      actualizarStatsPlanificacion();
      renderCalculadoraPonderacion();
    }

    function numeroPonderacion(valor) {
      const numero = Number(String(valor ?? '').replace(',', '.'));
      return Number.isFinite(numero) ? numero : 0;
    }

    function formatoPonderacion(valor, decimales = 2) {
      return numeroPonderacion(valor).toLocaleString('es-ES', {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales
      });
    }

    function claveAcumuladoPonderacion() {
      return `edugestion_ponderacion_${profesorActual?.id || 'local'}`;
    }

    function guardarAcumuladoPonderacion() {
      storageSet(claveAcumuladoPonderacion(), JSON.stringify(acumuladoPonderacion));
    }

    function cargarAcumuladoPonderacion() {
      const guardado = storageGet(claveAcumuladoPonderacion(), '[]');
      try {
        const datos = JSON.parse(guardado || '[]');
        acumuladoPonderacion = Array.isArray(datos)
          ? datos.filter(item => Number.isFinite(Number(item.nota)) && Number.isFinite(Number(item.porcentaje)))
          : [];
      } catch (error) {
        acumuladoPonderacion = [];
      }
      renderCalculadoraPonderacion();
    }

    function aportePonderadoActual() {
      const nota = numeroPonderacion(ponderacionNota?.value);
      const porcentaje = numeroPonderacion(ponderacionPorcentaje?.value);
      return nota * porcentaje / 100;
    }

    function actualizarResultadoPonderacion() {
      if (!ponderacionResultado) return;
      const notaTexto = String(ponderacionNota?.value || '').trim();
      const porcentajeTexto = String(ponderacionPorcentaje?.value || '').trim();
      const nota = numeroPonderacion(notaTexto);
      const porcentaje = numeroPonderacion(porcentajeTexto);
      const valido = notaTexto !== '' && porcentajeTexto !== '' && nota >= 0 && nota <= 20 && porcentaje > 0 && porcentaje <= 100;
      ponderacionResultado.textContent = valido ? formatoPonderacion(aportePonderadoActual()) : '0,00';
      if (btnAgregarPonderacion) btnAgregarPonderacion.disabled = !valido;
    }

    function renderTablaReferenciaPonderacion() {
      if (!ponderacionTablaHead || !ponderacionTablaBody) return;
      ponderacionTablaHead.innerHTML = `<tr><th>Calif.</th>${porcentajesTablaPonderacion.map(p => `<th>${p}%</th>`).join('')}</tr>`;
      ponderacionTablaBody.innerHTML = '';
      for (let nota = 1; nota <= 20; nota += 1) {
        const fila = document.createElement('tr');
        fila.innerHTML = `<th>${nota}</th>${porcentajesTablaPonderacion.map(p => `<td>${formatoPonderacion(nota * p / 100, 2)}</td>`).join('')}`;
        ponderacionTablaBody.appendChild(fila);
      }
    }

    function eliminarItemPonderacion(indice) {
      acumuladoPonderacion.splice(indice, 1);
      guardarAcumuladoPonderacion();
      renderCalculadoraPonderacion();
    }

    function renderCalculadoraPonderacion() {
      actualizarResultadoPonderacion();
      renderTablaReferenciaPonderacion();
      if (!ponderacionLista) return;

      const porcentajeTotal = acumuladoPonderacion.reduce((total, item) => total + numeroPonderacion(item.porcentaje), 0);
      const notaTotal = acumuladoPonderacion.reduce((total, item) => total + numeroPonderacion(item.aporte), 0);
      const restante = 100 - porcentajeTotal;

      if (ponderacionTotalPorcentaje) ponderacionTotalPorcentaje.textContent = `${formatoPonderacion(porcentajeTotal, porcentajeTotal % 1 ? 2 : 0)}%`;
      if (ponderacionPorcentajeRestante) ponderacionPorcentajeRestante.textContent = `${formatoPonderacion(Math.max(0, restante), Math.abs(restante) % 1 ? 2 : 0)}%`;
      if (ponderacionNotaAcumulada) ponderacionNotaAcumulada.textContent = formatoPonderacion(notaTotal);
      if (ponderacionContador) ponderacionContador.textContent = `${acumuladoPonderacion.length} registro${acumuladoPonderacion.length === 1 ? '' : 's'}`;

      if (ponderacionEstado) {
        const porcentajeCompleto = Math.abs(porcentajeTotal - 100) < 0.0001;
        ponderacionEstado.className = porcentajeTotal > 100.0001 ? 'is-error' : porcentajeCompleto ? 'is-success' : 'is-info';
        ponderacionEstado.innerHTML = porcentajeTotal > 100.0001
          ? `<i class="fa-solid fa-triangle-exclamation"></i> La ponderación supera el 100% por ${formatoPonderacion(porcentajeTotal - 100)}%.`
          : porcentajeCompleto
            ? '<i class="fa-solid fa-circle-check"></i> Distribución completa: la ponderación suma exactamente 100%.'
            : `<i class="fa-solid fa-circle-info"></i> Aún puedes distribuir ${formatoPonderacion(restante)}% de la calificación.`;
      }

      ponderacionLista.innerHTML = '';
      if (!acumuladoPonderacion.length) {
        ponderacionLista.innerHTML = '<div class="planning-ponderation__empty"><i class="fa-regular fa-rectangle-list"></i><span>Aún no has agregado cálculos.</span></div>';
        return;
      }

      acumuladoPonderacion.forEach((item, indice) => {
        const fila = document.createElement('div');
        fila.className = 'planning-ponderation__history-item';
        fila.innerHTML = `<span class="planning-ponderation__history-number">${indice + 1}</span><span><strong>Nota ${formatoPonderacion(item.nota)}</strong><small>${formatoPonderacion(item.porcentaje)}% de ponderación</small></span><b>${formatoPonderacion(item.aporte)}</b><button type="button" aria-label="Eliminar cálculo"><i class="fa-solid fa-trash-can"></i></button>`;
        fila.querySelector('button').addEventListener('click', () => eliminarItemPonderacion(indice));
        ponderacionLista.appendChild(fila);
      });
    }

    ponderacionNota?.addEventListener('input', actualizarResultadoPonderacion);
    ponderacionPorcentaje?.addEventListener('input', actualizarResultadoPonderacion);
    btnAgregarPonderacion?.addEventListener('click', () => {
      const notaTexto = String(ponderacionNota?.value || '').trim();
      const porcentajeTexto = String(ponderacionPorcentaje?.value || '').trim();
      const nota = numeroPonderacion(notaTexto);
      const porcentaje = numeroPonderacion(porcentajeTexto);
      if (notaTexto === '') return mostrarToast('Escribe la calificación obtenida.', 'warning', 'Falta la nota');
      if (porcentajeTexto === '') return mostrarToast('Escribe el porcentaje de ponderación.', 'warning', 'Falta el porcentaje');
      if (nota < 0 || nota > 20) return mostrarToast('La calificación debe estar entre 0 y 20.', 'warning', 'Revisa la nota');
      if (porcentaje <= 0 || porcentaje > 100) return mostrarToast('El porcentaje debe ser mayor que 0 y no superar 100.', 'warning', 'Revisa el porcentaje');
      acumuladoPonderacion.push({ nota, porcentaje, aporte: nota * porcentaje / 100 });
      guardarAcumuladoPonderacion();
      if (ponderacionNota) ponderacionNota.value = '';
      if (ponderacionPorcentaje) ponderacionPorcentaje.value = '';
      renderCalculadoraPonderacion();
      ponderacionNota?.focus();
    });
    btnLimpiarPonderacion?.addEventListener('click', () => {
      if (!acumuladoPonderacion.length) return;
      if (!confirm('¿Limpiar todos los cálculos de ponderación?')) return;
      acumuladoPonderacion = [];
      guardarAcumuladoPonderacion();
      renderCalculadoraPonderacion();
    });

    cargarAcumuladoPonderacion();

    formPlanificacion.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btnPlan = document.getElementById('btn-guardar-plan');
      const objPlan = {
        ano: document.getElementById('plan-ano').value,
        seccion: document.getElementById('plan-seccion').value,
        actividad: document.getElementById('plan-actividad').value.trim(),
        puntos: document.getElementById('plan-puntos').value,
        fecha: document.getElementById('plan-fecha').value
      };
      const acumulado = planesProfesor.filter(p => p.ano === objPlan.ano && p.seccion === objPlan.seccion).reduce((total, p) => total + Number(p.puntos || 0), 0) + Number(objPlan.puntos || 0);
      if (acumulado > 100 && !confirm(`La planificación sumará ${acumulado} puntos. ¿Deseas continuar?`)) return;
      btnPlan.disabled = true;
      btnPlan.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin"></i> Guardando...';
      try {
        const resultado = await apiRequest('guardarPlanificacion', objPlan);
        planesProfesor.push(resultado.plan || objPlan);
        const fechaNueva = fechaLocalDesdeISO(objPlan.fecha);
        if (fechaNueva) calendarioPlanFecha = new Date(fechaNueva.getFullYear(), fechaNueva.getMonth(), 1);
        calendarioDiaSeleccionado = objPlan.fecha;
        formPlanificacion.reset();
        actualizarUIPlanificacion();
        mostrarListaPlan(objPlan.ano, objPlan.seccion);
        mostrarToast('La evaluación quedó guardada y ya aparece en el calendario.', 'success', 'Evaluación programada');
      } catch (error) {
        console.error('No se guardó la planificación:', error);
        mostrarToast(error.message, 'error', 'No se guardó la evaluación');
      } finally {
        btnPlan.disabled = false;
        btnPlan.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Evaluación';
      }
    });

    btnPlanPdf.addEventListener('click', () => {
        if(!seccionPlanViendo) return; document.querySelectorAll('.no-pdf').forEach(el => el.style.display = 'none');
        const elemento = document.getElementById('contenido-pdf-plan'); const institucion = document.getElementById('input-institucion').value || "U.E. PORTAL GESTIÓN";
        const institucionSegura = escaparHTML(institucion.toUpperCase());
        const docenteSeguro = escaparHTML(profesorActual.nombre || 'Docente');
        const anoSeguro = escaparHTML(seccionPlanViendo.ano || '');
        const seccionSegura = escaparHTML(seccionPlanViendo.seccion || '');
        const wrapPdf = document.createElement('div'); wrapPdf.style.padding = '40px'; wrapPdf.style.fontFamily = 'Arial, sans-serif';
        wrapPdf.innerHTML = `<div style="text-align:center; border-bottom:2px solid #000; padding-bottom:15px; margin-bottom:20px;"><h2 style="margin:0; font-size:22px;">${institucionSegura}</h2><h3 style="margin:5px 0 0 0; color:#555;">PLAN DE EVALUACIÓN</h3><p style="margin:5px 0 0 0;"><strong>Docente:</strong> ${docenteSeguro}</p><p style="margin:5px 0 0 0; font-weight:bold;">Año: ${anoSeguro} - Sección: "${seccionSegura}"</p></div>${elemento.outerHTML}<div style="margin-top:50px; text-align:center; font-weight:bold; border-top:1px solid #000; width:40%; padding-top:10px; margin-left:auto; margin-right:auto;">Firma del Docente</div>`;
        btnPlanPdf.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Generando...';
        html2pdf().set({ margin: 0.5, filename: `Plan_${seccionPlanViendo.ano}_Sec_${seccionPlanViendo.seccion}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } }).from(wrapPdf).save().then(() => { document.querySelectorAll('.no-pdf').forEach(el => el.style.display = ''); btnPlanPdf.innerHTML = '<i class="fa-solid fa-file-pdf text-lg"></i> Guardar en PDF'; });
    });

    // ====== LÓGICA DE HORARIO ======
    window.mostrarFormularioHorario = function() {
      panelListaHorario.classList.add('hidden'); panelFormHorario.classList.remove('hidden');
    }

    function renderMenuHorario() {
      menuSeccionesHorario.innerHTML = '';
      if(horariosProfesor.length === 0) { menuSeccionesHorario.innerHTML = '<p class="text-xs text-center text-gray-400 mt-4">Sin bloques registrados.</p>'; return; }
     
      const secUnicas = {};
      horariosProfesor.forEach(h => {
        const key = `${h.ano}-${h.seccion}`;
        if(!secUnicas[key]) secUnicas[key] = { ano: h.ano, seccion: h.seccion, dias: new Set() };
        secUnicas[key].dias.add(String(h.dia || '').substring(0,2)); // Agrega Lu, Ma, Mi...
      });

      const order = Object.keys(secUnicas).sort();
      order.forEach(k => {
        const sec = secUnicas[k]; const color = getColorAno(sec.ano);
        const diasArr = Array.from(sec.dias).join(', ');
        const btn = document.createElement('button'); btn.type = "button";
        btn.className = `w-full text-left px-4 py-3 rounded-xl mb-2 border-l-4 shadow-sm transition hover:opacity-80 bg-white border border-gray-100 ${color.border} flex justify-between items-center`;
        btn.innerHTML = `<div><p class="font-bold text-sm text-gray-700">${escaparHTML(sec.ano)} "${escaparHTML(sec.seccion)}"</p><p class="text-[10px] font-bold text-gray-400 uppercase">${escaparHTML(diasArr)}</p></div> <i class="fa-solid fa-chevron-right text-xs text-gray-400"></i>`;
        btn.onclick = () => mostrarListaHorario(sec.ano, sec.seccion);
        menuSeccionesHorario.appendChild(btn);
      });
    }

    function formatearHoraLimpia(str) { if (!str) return "--:--"; let h = str.toString().trim(); if (h.includes("T")) h = h.split("T")[1]; if (h.includes(" ")) { const segs = h.split(" "); const f = segs.find(s => s.includes(":")); if (f) h = f; } return h.substring(0,5); }

    window.mostrarListaHorario = function(ano, seccion) {
      panelFormHorario.classList.add('hidden'); panelListaHorario.classList.remove('hidden');
      subtituloHorario.textContent = `${ano} - Sección "${seccion}"`; tablaBodyHorario.innerHTML = '';
     
      const diasOrden = {"Lunes":1, "Martes":2, "Miercoles":3, "Miércoles":3, "Jueves":4, "Viernes":5};
      const filtrados = horariosProfesor.filter(h => h.ano === ano && h.seccion === seccion)
                        .sort((a,b) => (diasOrden[a.dia] || 9) - (diasOrden[b.dia] || 9) || String(a.horaInicio || '').localeCompare(String(b.horaInicio || '')));
     
      if(filtrados.length === 0){ tablaBodyHorario.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-400 text-xs">No hay bloques.</td></tr>'; }
      else {
        filtrados.forEach((h, index) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td class="px-4 py-3 font-bold text-gray-800">${escaparHTML(h.dia)}</td><td class="px-4 py-3 text-center text-gray-600 font-semibold">${escaparHTML(formatearHoraLimpia(h.horaInicio))} - ${escaparHTML(formatearHoraLimpia(h.horaFin))}</td><td class="px-4 py-3 text-center text-gray-500">${escaparHTML(h.turno)}</td><td class="px-4 py-3 text-center"><button type="button" class="text-red-400 hover:text-red-600 transition" aria-label="Eliminar bloque"><i class="fa-solid fa-trash-can"></i></button></td>`;
          tr.querySelector('button').addEventListener('click', () => eliminarHorarioLocal(index, ano, seccion));
          tablaBodyHorario.appendChild(tr);
        });
      }
    }

    window.eliminarHorarioLocal = async function(indexReal, ano, seccion) {
      if (!confirm('¿Eliminar este bloque del horario?')) return;
      const diasOrden = {"Lunes":1, "Martes":2, "Miercoles":3, "Miércoles":3, "Jueves":4, "Viernes":5};
      const filtrado = horariosProfesor.filter(h => h.ano === ano && h.seccion === seccion).sort((a,b) => (diasOrden[a.dia] || 9) - (diasOrden[b.dia] || 9) || String(a.horaInicio || '').localeCompare(String(b.horaInicio || '')));
      const horario = filtrado[indexReal];
      if (!horario?.id) return mostrarToast('No se encontró el identificador del bloque.', 'error');
      try {
        await apiRequest('eliminarHorario', { id: horario.id });
        horariosProfesor = horariosProfesor.filter(h => h.id !== horario.id);
        actualizarUIHorario();
        mostrarListaHorario(ano, seccion);
        detectarClaseAutomatica();
        mostrarToast('El bloque fue eliminado del horario del docente.', 'success', 'Horario actualizado');
      } catch (error) {
        mostrarToast(error.message, 'error', 'No se eliminó el bloque');
      }
    }

    function renderHorarioVisual() {
      horarioVisualSemana.innerHTML = '';
      if(horariosProfesor.length === 0) { horarioVisualSemana.innerHTML = '<p class="text-xs text-center text-gray-400 mt-4">Agrega bloques para ver tu semana.</p>'; return; }
     
      const dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];
     
      dias.forEach(dia => {
          const bloquesDia = horariosProfesor.filter(h => String(h.dia || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === dia.toLowerCase())
                                             .sort((a,b) => String(a.horaInicio || '').localeCompare(String(b.horaInicio || '')));
          if(bloquesDia.length > 0) {
              const diaContainer = document.createElement('div');
              diaContainer.innerHTML = `<h5 class="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2 bg-indigo-50 px-2 py-1 rounded-md inline-block">${dia === 'Miercoles' ? 'Miércoles' : dia}</h5>`;
             
              const listaBloques = document.createElement('div'); listaBloques.className = "space-y-2 mb-4 pl-1";
              bloquesDia.forEach(b => {
                  const color = getColorAno(b.ano);
                  listaBloques.innerHTML += `
                    <div class="flex items-center bg-white p-2 rounded-xl shadow-sm border-l-4 ${color.border} border-t border-r border-b border-gray-100">
                       <div class="w-1/3 text-[10px] font-black text-gray-500">${escaparHTML(formatearHoraLimpia(b.horaInicio))}<br>${escaparHTML(formatearHoraLimpia(b.horaFin))}</div>
                       <div class="w-2/3 pl-2 border-l border-gray-100">
                          <p class="text-xs font-black ${color.text}">${escaparHTML(b.ano)} "${escaparHTML(b.seccion)}"</p>
                       </div>
                    </div>`;
              });
              diaContainer.appendChild(listaBloques);
              horarioVisualSemana.appendChild(diaContainer);
          }
      });
    }

    function actualizarUIHorario() { renderMenuHorario(); renderHorarioVisual(); }

    formHorario.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-guardar-horario');
      const obj = { dia: document.getElementById('horario-dia').value, horaInicio: document.getElementById('horario-hora-inicio').value, horaFin: document.getElementById('horario-hora-fin').value, ano: document.getElementById('horario-ano').value, seccion: document.getElementById('horario-seccion').value, turno: document.getElementById('horario-turno').value };
      if (obj.horaInicio >= obj.horaFin) return alert('La hora de salida debe ser posterior a la hora de entrada.');
      const existeChoque = horariosProfesor.some(h => h.dia === obj.dia && h.turno === obj.turno && obj.horaInicio < h.horaFin && obj.horaFin > h.horaInicio);
      if (existeChoque && !confirm('Este bloque se cruza con otro horario registrado. ¿Deseas guardarlo de todos modos?')) return;

      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin"></i> Guardando...';
      try {
        const resultado = await apiRequest('guardarHorario', obj);
        horariosProfesor.push(resultado.horario || obj);
        formHorario.reset();
        actualizarUIHorario();
        mostrarListaHorario(obj.ano, obj.seccion);
        detectarClaseAutomatica();
        mostrarToast('El bloque quedó guardado en la cuenta del docente.', 'success', 'Horario guardado');
      } catch (error) {
        console.error('No se guardó el horario:', error);
        mostrarToast(error.message, 'error', 'No se guardó el bloque');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Bloque';
      }
    });

    function detectarClaseAutomatica() {
      renderAgendaAsistencia();
    }

    // ====== LÓGICA DE ACTAS Y CORREO ======
    function generarNumeroActa() { const fecha = new Date(); document.getElementById('acta-numero-generado').value = `ACT-${fecha.getFullYear()}${String(fecha.getMonth()+1).padStart(2,'0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`; }
    function setFechaHoraActas() { const now = new Date(); document.getElementById('acta-fecha-global').value = now.toISOString().split('T')[0]; document.getElementById('acta-hora-global').value = now.toTimeString().substring(0,5); generarNumeroActa(); }
    window.cambiarTipoActa = function(tipo, botonPresionado) {
      actaTipoActual = tipo; generarNumeroActa(); document.querySelectorAll('.btn-acta-menu').forEach(b => { b.className = "btn-acta-menu w-full text-left px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 font-bold text-sm border-l-4 border-transparent transition"; });
      const colores = { 'reunion': 'border-blue-500', 'padres': 'border-green-500', 'incidencia': 'border-red-500', 'compromiso': 'border-orange-500', 'seguimiento': 'border-purple-500', 'orientacion': 'border-cyan-500', 'inasistencia': 'border-teal-500', 'accidente': 'border-rose-500', 'calificaciones': 'border-amber-500', 'mediacion': 'border-fuchsia-500' };
      botonPresionado.className = `btn-acta-menu w-full text-left px-3 py-2.5 rounded-xl bg-gray-800 text-white font-bold text-sm border-l-4 ${colores[tipo] || 'border-gray-900'} shadow-md transition`;
      document.getElementById('acta-titulo-dinamico').value = botonPresionado.innerText.trim();
      document.querySelectorAll('.acta-plantilla').forEach(el => el.classList.add('hidden')); document.getElementById('plantilla-' + tipo).classList.remove('hidden');
    };

    function generarContenidoHTML(alumno, diaSel, hInc, mot, inc, institucion) {
        const institucionSegura = escaparHTML(institucion || 'Unidad Educativa');
        const tituloSeguro = escaparHTML(document.getElementById('acta-titulo-dinamico').value || 'Acta');
        const fechaSegura = escaparHTML(document.getElementById('acta-fecha-global').value || '');
        const nombreAlumno = escaparHTML(alumno.nombre || 'Estudiante');
        const seccionAlumno = escaparHTML(alumno.seccion || actaFiltroSeccion.value || '');
        const representante = escaparHTML(alumno.representante || 'Sin representante registrado');
        const telefono = escaparHTML(alumno.telefonoRepresentante || 'S/N');
        const docente = escaparHTML(profesorActual.nombre || 'Docente');
        const materia = escaparHTML(profesorActual.materia || '');
        const motivoSeguro = escaparHTML(mot || 'Reporte general');
        const incidenciaSegura = escaparHTML(inc || 'Sin descripción');

        let contenidoDesarrollo = `<div style="margin-bottom: 30px;"><p style="font-size: 16px;"><strong>MOTIVO DE LA SANCIÓN:</strong> <u style="color: #b42318;">${motivoSeguro}</u></p></div><h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">DESCRIPCIÓN DE LOS HECHOS:</h3><div style="border: 1px solid #ccc; padding: 20px; min-height: 150px; background-color: #f9f9f9; white-space: pre-wrap;">${incidenciaSegura}</div>`;
        if(actaTipoActual === 'inasistencia') {
          const txtFechas = escaparHTML(document.getElementById('acta-inasistencia-fechas').value || 'Sin fechas indicadas');
          const txtMotivo = escaparHTML(document.getElementById('acta-inasistencia-motivo').value || 'Sin observaciones');
          contenidoDesarrollo = `<div style="margin-bottom: 30px;"><p style="font-size: 16px;"><strong>REPORTE DE FALTAS:</strong> <u style="color: #0f766e;">${txtFechas}</u></p></div><h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">OBSERVACIONES DEL DOCENTE:</h3><div style="border: 1px solid #ccc; padding: 20px; min-height: 150px; background-color: #f9f9f9; white-space: pre-wrap;">${txtMotivo}</div>`;
        }
        return `<div style="font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: auto;"><div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;"><h2 style="margin: 0; font-size: 24px;">${institucionSegura.toUpperCase()}</h2><h3 style="margin: 10px 0 0 0; color: #555;">${tituloSeguro}</h3><p style="margin: 5px 0 0 0; color: #777;">Fecha de Emisión: ${fechaSegura}</p></div><div style="margin-bottom: 20px;"><p><strong>Estudiante involucrado:</strong> ${nombreAlumno} (${escaparHTML(actaFiltroAno.value)} - Sección ${seccionAlumno})</p><p><strong>Representante legal:</strong> ${representante} | <strong>Contacto:</strong> +${telefono}</p><p><strong>Docente a cargo:</strong> ${docente} (${materia})</p></div>${contenidoDesarrollo}<div style="display: flex; justify-content: space-between; margin-top: 80px;"><div style="width: 40%; border-top: 1px solid #000; text-align: center; padding-top: 10px; font-weight: bold;">Firma del docente<br><br>${docente}</div><div style="width: 40%; border-top: 1px solid #000; text-align: center; padding-top: 10px; font-weight: bold;">Firma del representante<br><br>${representante}</div></div></div>`;
    }

    async function dispararCorreo(alumno, titulo, mensaje) {
      const email = alumno.emailRepresentante || alumno.correoRepresentante || alumno.email || '';
      if (!email || !String(email).includes('@')) return false;
      try {
        const resultado = await apiRequest('enviarCorreo', {
          idAlumno: alumno.id,
          titulo,
          fecha: new Date().toLocaleDateString(),
          mensaje
        });
        return Boolean(resultado.enviado);
      } catch (error) {
        console.warn('No se pudo enviar el correo del acta:', error);
        return false;
      }
    }

    formActas.addEventListener('submit', async (e) => {
      e.preventDefault();
      const alumno = alumnosFiltradosActas.find(a => a.id.toString() === actaSelectAlumno.value.toString());
      if (!alumno) return alert('Selecciona un alumno.');
      const btn = document.getElementById('btn-acta-guardar');
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin mr-1"></i> Generando PDF...`;

      const institucion = document.getElementById('input-institucion').value || "UNIDAD EDUCATIVA PORTAL GESTIÓN";
      let mot = "Reporte General";
      let inc = "Detalles registrados.";
      if(actaTipoActual === 'incidencia') {
        mot = document.getElementById('acta-motivo').value.trim();
        inc = document.getElementById('acta-incidencia').value.trim();
        if (!mot || !inc) {
          btn.disabled = false;
          btn.innerHTML = `<i class="fa-solid fa-file-pdf"></i> Generar Doc Final y PDF`;
          return alert('Completa el motivo y la descripción de la incidencia.');
        }
      } else if (actaTipoActual === 'inasistencia') {
        mot = "Inasistencias: " + document.getElementById('acta-inasistencia-fechas').value.trim();
        inc = document.getElementById('acta-inasistencia-motivo').value.trim();
      }

      const elementoEstructura = document.createElement('div');
      elementoEstructura.innerHTML = generarContenidoHTML(alumno, 'No aplica', 'No aplica', mot, inc, institucion);
      const nombreArchivo = String(alumno.nombre || 'Estudiante').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]+/g, '_');
      const opt = { margin: 0.5, filename: `Acta_${actaTipoActual}_${nombreArchivo}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };

      try {
        await html2pdf().set(opt).from(elementoEstructura).save();
        const correoEnviado = await dispararCorreo(alumno, document.getElementById('acta-titulo-dinamico').value, inc);
        try {
          await apiRequest('registrarActa', {
            idAlumno: alumno.id,
            tipo: actaTipoActual,
            titulo: document.getElementById('acta-titulo-dinamico').value,
            fecha: document.getElementById('acta-fecha-global').value,
            mensaje: inc
          });
        } catch (error) {
          console.warn('El PDF se generó, pero no se pudo registrar el acta en el servidor:', error);
        }
        if (correoEnviado) mostrarToast('El PDF fue generado y el correo del representante fue enviado.', 'success', 'Acta completada');
        else mostrarToast('El PDF fue generado. No se envió correo porque no hay una dirección válida registrada.', 'success', 'Acta descargada');
        formActas.reset();
        setFechaHoraActas();
      } catch(e) {
        console.error('Error al generar el acta:', e);
        mostrarToast('No fue posible generar el PDF. Revisa los datos e inténtalo nuevamente.', 'error', 'Error al generar el acta');
      } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-file-pdf"></i> Generar Doc Final y PDF`;
      }
    });

    async function filtrarAlumnosParaActas() {
      actaSelectAlumno.innerHTML = '<option value="">Buscando estudiantes...</option>';
      const a = actaFiltroAno.value; const s = actaFiltroSeccion.value; let t = actaFiltroTurno.value; if (t === "Mañana" || t === "Manana") t = "Manana";
      try { const d = await apiRequest('obtenerAlumnos', { ano: a, seccion: s, turno: t }); if (d.status === 'success') { alumnosFiltradosActas = Array.isArray(d.alumnos) ? d.alumnos : []; actaSelectAlumno.innerHTML = '<option value="">-- Selecciona el Alumno --</option>'; if (alumnosFiltradosActas.length === 0) return; alumnosFiltradosActas.forEach(al => { const opt = document.createElement('option'); opt.value = al.id; opt.textContent = al.nombre; actaSelectAlumno.appendChild(opt); }); } } catch(e) { actaSelectAlumno.innerHTML = '<option value="">Error</option>'; }
    }

    actaSelectAlumno.addEventListener('change', () => {
      const alumno = alumnosFiltradosActas.find(a => a.id.toString() === actaSelectAlumno.value.toString());
      if (alumno) { document.getElementById('acta-txt-representante').textContent = alumno.representante; document.getElementById('acta-txt-whatsapp').textContent = alumno.telefonoRepresentante ? `+${alumno.telefonoRepresentante}` : "Sin número"; document.getElementById('acta-firma-nombres').value = `${alumno.representante} / ${profesorActual.nombre}`; }
    });

    actaFiltroAno.addEventListener('change', filtrarAlumnosParaActas); actaFiltroSeccion.addEventListener('change', filtrarAlumnosParaActas); actaFiltroTurno.addEventListener('change', filtrarAlumnosParaActas);

    const formRegistroManual = document.getElementById('form-registro-manual');
    formRegistroManual.addEventListener('submit', async (e) => {
      e.preventDefault(); const btn = document.getElementById('btn-registrar-matriz'); btn.disabled = true; btn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> Registrando...`;
      let turnoSel = document.getElementById('reg-turno').value; if (turnoSel === "Mañana" || turnoSel === "Manana") turnoSel = "Manana";
      const payload = {
        action: 'registrarAlumno',
        nombre: document.getElementById('reg-nombre').value.trim(),
        cedula: document.getElementById('reg-cedula').value.trim(),
        ano: document.getElementById('reg-ano').value,
        seccion: document.getElementById('reg-seccion').value,
        turno: turnoSel,
        repite: document.getElementById('reg-repite').value,
        materiaPendiente: document.getElementById('reg-pendiente').value.trim(),
        direccion: document.getElementById('reg-direccion').value.trim(),
        representante: document.getElementById('reg-representante').value.trim(),
        telefonoRep: document.getElementById('reg-telefono-rep').value.trim(),
        emailRep: document.getElementById('reg-email-rep').value.trim(),
        practicaDeporte: document.getElementById('reg-practica-deporte').value,
        deporte: document.getElementById('reg-deporte').value.trim(),
        tieneHermanosInstitucion: document.getElementById('reg-tiene-hermanos').value,
        hermanosInstitucion: document.getElementById('reg-hermanos').value.trim(),
        tieneAlergia: document.getElementById('reg-tiene-alergia').value,
        alergias: document.getElementById('reg-alergias').value.trim(),
        observaciones: document.getElementById('reg-observaciones').value.trim()
      };
      try {
        delete payload.action;
        const data = await apiRequest('registrarAlumno', payload);
        mostrarToast(data.message || 'El estudiante fue registrado correctamente.', 'success', 'Estudiante registrado');
        formRegistroManual.reset(); actualizarRegistroInteractivo();
      } catch (err) {
        console.error('Error al registrar estudiante:', err);
        mostrarToast('Verifica la conexión e inténtalo nuevamente.', 'error', 'No se registró el estudiante');
      } finally { btn.disabled = false; btn.innerHTML = `<i class="fa-solid fa-user-plus"></i> Registrar Alumno`; }
    });


    // Registro interactivo de estudiantes
    const regInteractiveIds = [
      'reg-nombre','reg-cedula','reg-ano','reg-seccion','reg-turno','reg-direccion',
      'reg-representante','reg-telefono-rep','reg-email-rep','reg-practica-deporte',
      'reg-deporte','reg-tiene-hermanos','reg-hermanos','reg-tiene-alergia',
      'reg-alergias','reg-observaciones'
    ];

    function toggleRegistroCondicional(selectId, fieldId, inputId) {
      const select = document.getElementById(selectId);
      const field = document.getElementById(fieldId);
      const input = document.getElementById(inputId);
      if (!select || !field || !input) return;
      const visible = select.value === 'Si';
      field.classList.toggle('is-hidden', !visible);
      input.required = visible;
      if (!visible) input.value = '';
    }

    function actualizarRegistroInteractivo() {
      toggleRegistroCondicional('reg-practica-deporte', 'field-reg-deporte', 'reg-deporte');
      toggleRegistroCondicional('reg-tiene-hermanos', 'field-reg-hermanos', 'reg-hermanos');
      toggleRegistroCondicional('reg-tiene-alergia', 'field-reg-alergia', 'reg-alergias');

      const nombre = document.getElementById('reg-nombre')?.value.trim() || 'Nuevo estudiante';
      const anoText = document.getElementById('reg-ano')?.selectedOptions?.[0]?.textContent?.trim() || '1er Año';
      const seccion = document.getElementById('reg-seccion')?.value || 'A';
      const turno = document.getElementById('reg-turno')?.selectedOptions?.[0]?.textContent?.trim() || 'Mañana';
      const representante = document.getElementById('reg-representante')?.value.trim() || 'No registrado';
      const deporte = document.getElementById('reg-practica-deporte')?.value === 'Si'
        ? (document.getElementById('reg-deporte')?.value.trim() || 'Por especificar')
        : 'No practica';
      const hermanos = document.getElementById('reg-tiene-hermanos')?.value === 'Si'
        ? (document.getElementById('reg-hermanos')?.value.trim() || 'Sí, por especificar')
        : 'No';
      const alergias = document.getElementById('reg-tiene-alergia')?.value === 'Si'
        ? (document.getElementById('reg-alergias')?.value.trim() || 'Sí, por especificar')
        : 'No registradas';

      const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
      };

      setText('student-preview-name', nombre);
      setText('student-preview-course', `${anoText} · Sección ${seccion} · ${turno}`);
      setText('student-preview-representative', representante);
      setText('student-preview-sport', deporte);
      setText('student-preview-siblings', hermanos);
      setText('student-preview-allergies', alergias);

      const fields = regInteractiveIds
        .map(id => document.getElementById(id))
        .filter(Boolean)
        .filter(el => !el.closest('.student-conditional-field') || !el.closest('.student-conditional-field').classList.contains('is-hidden'));

      const completed = fields.filter(el => String(el.value || '').trim() !== '').length;
      const percent = fields.length ? Math.round((completed / fields.length) * 100) : 0;
      const bar = document.getElementById('student-form-progress-bar');
      const value = document.getElementById('student-form-progress-value');
      if (bar) bar.style.width = `${percent}%`;
      if (value) value.textContent = `${percent}%`;
    }

    regInteractiveIds.forEach(id => {
      const field = document.getElementById(id);
      if (!field) return;
      field.addEventListener('input', actualizarRegistroInteractivo);
      field.addEventListener('change', actualizarRegistroInteractivo);
    });

    const btnLimpiarRegistro = document.getElementById('btn-limpiar-registro');
    if (btnLimpiarRegistro) {
      btnLimpiarRegistro.addEventListener('click', () => {
        formRegistroManual.reset();
        actualizarRegistroInteractivo();
        document.getElementById('reg-nombre')?.focus();
      });
    }

    actualizarRegistroInteractivo();

    // ==========================================
    // FASE 5: INTEGRACIÓN CON WHATSAPP (BOTONES CORREGIDOS)
    // ==========================================

    // 1. WhatsApp para Planificación (Mensaje general)
    if (btnPlanWhatsapp) {
        btnPlanWhatsapp.addEventListener('click', () => {
            if (!seccionPlanViendo) return alert('Debes seleccionar y estar viendo un plan de evaluación primero.');
           
            const filtrados = planesProfesor.filter(p => p.ano === seccionPlanViendo.ano && p.seccion === seccionPlanViendo.seccion)
                                            .sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
           
            if (filtrados.length === 0) return alert('No hay evaluaciones para compartir.');

            let texto = `*PLAN DE EVALUACIÓN - ${seccionPlanViendo.ano} "${seccionPlanViendo.seccion}"*\n`;
            texto += `Materia: ${profesorActual.materia}\n`;
            texto += `Docente: ${profesorActual.nombre}\n\n`;
           
            filtrados.forEach(p => {
                const [y, m, d] = p.fecha.split('-');
                texto += `🔸 *${d}/${m}* - ${p.actividad} (${p.puntos} pts)\n`;
            });
            texto += `\n_Por favor tomar nota de las fechas. ¡Saludos!_`;
           
            const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
            window.open(url, '_blank');
        });
    }

    // 2. WhatsApp para Actas de Incidencia (Mensaje directo al representante)
    const btnActaWhatsappOriginal = document.getElementById('btn-acta-whatsapp');
    if (btnActaWhatsappOriginal) {
        btnActaWhatsappOriginal.addEventListener('click', () => {
            const idAlumno = actaSelectAlumno.value;
            if (!idAlumno) return alert('Por favor, selecciona un estudiante en el formulario primero.');
           
            const alumno = alumnosFiltradosActas.find(a => a.id.toString() === idAlumno.toString());
            if (!alumno) return alert('Error al cargar datos del alumno.');
           
            // CORRECCIÓN: Convertir a String para evitar que el .replace o .trim fallen
            const telefono = String(alumno.telefonoRepresentante || "");
            if (telefono.trim() === '') return alert('Este estudiante no tiene número de representante registrado.');
           
            const numeroLimpio = telefono.replace(/\D/g, '');
            const tipoActaNombre = document.getElementById('acta-titulo-dinamico').value;
           
            let mensaje = `*NOTIFICACIÓN EDUCATIVA URGENTE*\n`;
            mensaje += `Saludos estimado/a *${alumno.representante}*.\n\n`;
            mensaje += `Nos comunicamos de la institución para informarle que se ha generado un reporte tipo: *${tipoActaNombre}* para el estudiante *${alumno.nombre}*.\n\n`;
           
            if (actaTipoActual === 'inasistencia') {
                const resumenFaltas = document.getElementById('acta-inasistencia-fechas').value;
                if (resumenFaltas) mensaje += `*Motivo:* ${resumenFaltas}\n\n`;
            }

            mensaje += `Por favor, comuníquese con el docente ${profesorActual.nombre} o diríjase a la institución a la brevedad posible para mayor información.\n\n`;
            mensaje += `_Atentamente: Control de Estudios y Docentes._`;
           
            const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
            window.open(url, '_blank');
        });
    }

/* =====================================================
   EDUGESTIÓN · VINCULACIÓN SEGURA CON TELEGRAM
   Genera un código temporal de 6 dígitos desde la cuenta
   autenticada del docente. No contiene tokens ni secretos.
   ===================================================== */
(() => {
  const TELEGRAM_UI = {
    buttonId: 'btn-telegram-link',
    modalId: 'telegram-link-modal',
    titleId: 'telegram-link-title',
    contentId: 'telegram-link-content',
    closeSelector: '[data-close-telegram-link="true"]'
  };

  let telegramCountdownTimer = null;

  function escapeTelegramUi(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function telegramButton() {
    return document.getElementById(TELEGRAM_UI.buttonId);
  }

  function telegramModal() {
    return document.getElementById(TELEGRAM_UI.modalId);
  }

  function setTelegramButtonState(state = 'unknown') {
    const button = telegramButton();
    if (!button) return;
    button.dataset.telegramState = state;
    button.classList.toggle('is-linked', state === 'linked');
    button.classList.toggle('is-pending', state === 'pending');
    button.title = state === 'linked'
      ? 'Telegram vinculado'
      : state === 'pending'
        ? 'Código de Telegram pendiente'
        : 'Vincular Telegram';
    button.setAttribute('aria-label', button.title);
  }

  function stopTelegramCountdown() {
    if (telegramCountdownTimer) {
      clearInterval(telegramCountdownTimer);
      telegramCountdownTimer = null;
    }
  }

  function closeTelegramModal() {
    const modal = telegramModal();
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('telegram-modal-open');
    stopTelegramCountdown();
  }

  function openTelegramModalShell() {
    const modal = telegramModal();
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('telegram-modal-open');
    setTimeout(() => modal.querySelector(TELEGRAM_UI.closeSelector)?.focus(), 40);
  }

  function setTelegramModalContent(html, title = 'Telegram docente') {
    const titleNode = document.getElementById(TELEGRAM_UI.titleId);
    const contentNode = document.getElementById(TELEGRAM_UI.contentId);
    if (titleNode) titleNode.textContent = title;
    if (contentNode) contentNode.innerHTML = html;
  }

  function showTelegramLoading(message = 'Consultando tu vinculación…') {
    setTelegramModalContent(`
      <div class="telegram-link-loading">
        <i class="fa-solid fa-circle-notch fa-spin"></i>
        <p>${escapeTelegramUi(message)}</p>
      </div>
    `);
  }

  function showTelegramError(error) {
    const message = error?.message || 'No fue posible completar la operación.';
    setTelegramButtonState('unknown');
    setTelegramModalContent(`
      <div class="telegram-link-message is-error">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <div>
          <strong>No se pudo conectar con Telegram</strong>
          <p>${escapeTelegramUi(message)}</p>
        </div>
      </div>
      <div class="telegram-link-actions">
        <button class="telegram-secondary-button" id="telegram-retry-status" type="button">
          <i class="fa-solid fa-rotate-right"></i> Reintentar
        </button>
      </div>
    `);
    document.getElementById('telegram-retry-status')?.addEventListener('click', loadTelegramStatus);
  }

  function linkedTelegramView(data = {}) {
    const name = data.telegramNombre || data.telegramUsuario || 'Cuenta de Telegram';
    const username = data.telegramUsuario ? `@${String(data.telegramUsuario).replace(/^@/, '')}` : '';
    setTelegramButtonState('linked');
    setTelegramModalContent(`
      <div class="telegram-link-success-icon"><i class="fa-brands fa-telegram"></i></div>
      <div class="telegram-link-centered">
        <span class="telegram-link-badge is-linked"><i class="fa-solid fa-circle-check"></i> Cuenta vinculada</span>
        <h3>${escapeTelegramUi(name)}</h3>
        ${username ? `<p class="telegram-link-username">${escapeTelegramUi(username)}</p>` : ''}
        <p>Este Telegram ya puede consultar clases y registrar asistencia en nombre del docente autenticado.</p>
      </div>
      <div class="telegram-link-security-note">
        <i class="fa-solid fa-shield-halved"></i>
        <span>La contraseña de EduGestión nunca se comparte con Telegram.</span>
      </div>
      <div class="telegram-link-actions">
        <button class="telegram-secondary-button" id="telegram-refresh-status" type="button">
          <i class="fa-solid fa-rotate"></i> Actualizar estado
        </button>
        <button class="telegram-danger-button" id="telegram-unlink-account" type="button">
          <i class="fa-solid fa-link-slash"></i> Desvincular
        </button>
      </div>
    `, 'Telegram vinculado');
    document.getElementById('telegram-refresh-status')?.addEventListener('click', loadTelegramStatus);
    document.getElementById('telegram-unlink-account')?.addEventListener('click', unlinkTelegramAccount);
  }

  function unlinkedTelegramView() {
    setTelegramButtonState('unknown');
    setTelegramModalContent(`
      <div class="telegram-link-intro-icon"><i class="fa-brands fa-telegram"></i></div>
      <div class="telegram-link-centered">
        <span class="telegram-link-badge"><i class="fa-solid fa-link"></i> Sin vincular</span>
        <h3>Conecta tu cuenta docente</h3>
        <p>Generaremos un código temporal de seis dígitos. El código vence en 10 minutos y solo puede utilizarse una vez.</p>
      </div>
      <ol class="telegram-link-steps">
        <li><span>1</span><p>Pulsa <b>Generar código</b>.</p></li>
        <li><span>2</span><p>Abre el bot <b>EduGestion Asistencia</b> en Telegram.</p></li>
        <li><span>3</span><p>Envía <code>/vincular CÓDIGO</code>.</p></li>
      </ol>
      <div class="telegram-link-actions is-single">
        <button class="telegram-primary-button" id="telegram-generate-code" type="button">
          <i class="fa-solid fa-key"></i> Generar código temporal
        </button>
      </div>
    `, 'Vincular Telegram');
    document.getElementById('telegram-generate-code')?.addEventListener('click', generateTelegramCode);
  }

  function startTelegramCountdown(minutes = 10) {
    stopTelegramCountdown();
    const deadline = Date.now() + Math.max(1, Number(minutes) || 10) * 60 * 1000;
    const label = document.getElementById('telegram-code-countdown');

    const update = () => {
      const remaining = Math.max(0, deadline - Date.now());
      const totalSeconds = Math.ceil(remaining / 1000);
      const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
      const ss = String(totalSeconds % 60).padStart(2, '0');
      if (label) label.textContent = `${mm}:${ss}`;
      if (remaining <= 0) {
        stopTelegramCountdown();
        setTelegramButtonState('unknown');
        const generateButton = document.getElementById('telegram-regenerate-code');
        if (generateButton) generateButton.disabled = false;
        const status = document.getElementById('telegram-code-status');
        if (status) status.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i> El código venció. Genera uno nuevo.';
      }
    };
    update();
    telegramCountdownTimer = setInterval(update, 1000);
  }

  async function copyTelegramCommand(command) {
    try {
      await navigator.clipboard.writeText(command);
    } catch (error) {
      const area = document.createElement('textarea');
      area.value = command;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    const button = document.getElementById('telegram-copy-command');
    if (button) {
      const previous = button.innerHTML;
      button.innerHTML = '<i class="fa-solid fa-check"></i> Copiado';
      setTimeout(() => { button.innerHTML = previous; }, 1600);
    }
    if (typeof mostrarToast === 'function') {
      mostrarToast('Comando copiado. Pégalo en el bot de Telegram.', 'success', 'Código listo');
    }
  }

  function codeTelegramView(data) {
    const code = String(data.codigo || '').replace(/\D/g, '');
    const command = `/vincular ${code}`;
    setTelegramButtonState('pending');
    setTelegramModalContent(`
      <div class="telegram-link-code-header">
        <span class="telegram-link-badge is-pending"><i class="fa-solid fa-hourglass-half"></i> Código temporal</span>
        <p id="telegram-code-status"><i class="fa-regular fa-clock"></i> Vence en <b id="telegram-code-countdown">10:00</b></p>
      </div>
      <div class="telegram-link-code" aria-label="Código temporal de Telegram">${escapeTelegramUi(code)}</div>
      <div class="telegram-link-command">
        <code>${escapeTelegramUi(command)}</code>
        <button id="telegram-copy-command" type="button" title="Copiar comando">
          <i class="fa-regular fa-copy"></i> Copiar
        </button>
      </div>
      <div class="telegram-link-security-note">
        <i class="fa-solid fa-mobile-screen-button"></i>
        <span>Abre <b>EduGestion Asistencia</b> en Telegram y envía el comando copiado.</span>
      </div>
      <div class="telegram-link-actions">
        <button class="telegram-secondary-button" id="telegram-check-link" type="button">
          <i class="fa-solid fa-rotate"></i> Ya lo envié, verificar
        </button>
        <button class="telegram-primary-button" id="telegram-regenerate-code" type="button">
          <i class="fa-solid fa-key"></i> Generar otro
        </button>
      </div>
    `, 'Código de vinculación');

    document.getElementById('telegram-copy-command')?.addEventListener('click', () => copyTelegramCommand(command));
    document.getElementById('telegram-check-link')?.addEventListener('click', loadTelegramStatus);
    document.getElementById('telegram-regenerate-code')?.addEventListener('click', generateTelegramCode);
    startTelegramCountdown(data.expiraEnMinutos || 10);
  }

  async function loadTelegramStatus() {
    if (!sessionToken) return;
    showTelegramLoading();
    try {
      const data = await apiRequest('estadoTelegram');
      if (data.vinculado) linkedTelegramView(data);
      else unlinkedTelegramView();
    } catch (error) {
      showTelegramError(error);
    }
  }

  async function generateTelegramCode() {
    showTelegramLoading('Generando un código seguro…');
    try {
      const data = await apiRequest('crearCodigoTelegram');
      if (data.vinculado) linkedTelegramView(data);
      else codeTelegramView(data);
    } catch (error) {
      showTelegramError(error);
    }
  }

  async function unlinkTelegramAccount() {
    const confirmed = window.confirm('¿Desvincular este Telegram de tu cuenta docente? El bot dejará de acceder a tus clases y asistencias.');
    if (!confirmed) return;
    showTelegramLoading('Desvinculando Telegram…');
    try {
      const data = await apiRequest('desvincularTelegram');
      setTelegramButtonState('unknown');
      unlinkedTelegramView();
      if (typeof mostrarToast === 'function') {
        mostrarToast(data.message || 'Telegram fue desvinculado.', 'success', 'Cuenta actualizada');
      }
    } catch (error) {
      showTelegramError(error);
    }
  }

  async function openTelegramLinkModal() {
    openTelegramModalShell();
    await loadTelegramStatus();
  }

  function createTelegramLinkUi() {
    if (telegramButton()) return;
    const changePasswordButton = document.getElementById('btn-change-password');
    const headerActions = changePasswordButton?.parentElement;
    if (!headerActions) return;

    const button = document.createElement('button');
    button.id = TELEGRAM_UI.buttonId;
    button.type = 'button';
    button.className = 'logout-button telegram-link-button';
    button.title = 'Vincular Telegram';
    button.setAttribute('aria-label', 'Vincular Telegram');
    button.innerHTML = '<i class="fa-brands fa-telegram"></i><span class="telegram-link-indicator" aria-hidden="true"></span>';
    headerActions.insertBefore(button, changePasswordButton);
    button.addEventListener('click', openTelegramLinkModal);

    const modal = document.createElement('div');
    modal.id = TELEGRAM_UI.modalId;
    modal.className = 'telegram-link-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="telegram-link-modal__backdrop" data-close-telegram-link="true"></div>
      <section class="telegram-link-modal__card" role="dialog" aria-modal="true" aria-labelledby="${TELEGRAM_UI.titleId}">
        <button class="telegram-link-modal__close" type="button" data-close-telegram-link="true" aria-label="Cerrar">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="telegram-link-modal__brand"><i class="fa-brands fa-telegram"></i></div>
        <h2 id="${TELEGRAM_UI.titleId}">Telegram docente</h2>
        <div id="${TELEGRAM_UI.contentId}" class="telegram-link-modal__content"></div>
      </section>`;
    document.body.appendChild(modal);

    modal.querySelectorAll(TELEGRAM_UI.closeSelector).forEach((node) => {
      node.addEventListener('click', closeTelegramModal);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) closeTelegramModal();
    });

    if (typeof dashboardScreen !== 'undefined' && dashboardScreen) {
      const observer = new MutationObserver(() => {
        const loggedIn = !dashboardScreen.classList.contains('hidden') && Boolean(sessionToken);
        if (loggedIn) loadTelegramStatus().catch(() => {});
        else setTelegramButtonState('unknown');
      });
      observer.observe(dashboardScreen, { attributes: true, attributeFilter: ['class'] });
      if (!dashboardScreen.classList.contains('hidden') && sessionToken) loadTelegramStatus().catch(() => {});
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createTelegramLinkUi, { once: true });
  } else {
    createTelegramLinkUi();
  }

/* =========================================================
   PANEL DEL DIRECTOR — SOLO LECTURA
   ========================================================= */
  const DIRECTOR_IDS = {
    tab: 'tab-historial-administrativo',
    section: 'section-historial-administrativo'
  };
  let datosDirector = null;
  let vistaDirector = 'resumen';
  let filtroDocenteDirector = '';
  let busquedaDirector = '';
  let seccionDirector = '';
  let alumnoDirector = '';

  function h(valor = '') {
    return String(valor).replace(/[&<>'"]/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
    }[c]));
  }

  function esDirector() {
    return String(profesorActual?.rol || '').toLowerCase() === 'director';
  }

  function crearPanelDirector() {
    if (document.getElementById(DIRECTOR_IDS.tab)) return;
    const planificacionTab = document.getElementById('tab-planificacion');
    const geminiTab = document.getElementById('tab-gemini');
    const nav = document.getElementById('app-nav') || planificacionTab?.parentElement || geminiTab?.parentElement || document.querySelector('.app-sidebar nav');
    const main = document.getElementById('app-main') || document.getElementById('section-planificacion')?.parentElement || document.querySelector('main');
    if (!nav || !main) return;

    const tab = document.createElement('button');
    tab.id = DIRECTOR_IDS.tab;
    tab.type = 'button';
    tab.className = 'nav-item director-only-nav';
    tab.setAttribute('aria-selected', 'false');
    tab.dataset.title = 'Panel de dirección';
    tab.dataset.description = 'Consulta institucional consolidada y de solo lectura.';
    tab.innerHTML = '<i class="fa-solid fa-building-shield"></i><span>Historial administrativo</span>';
    nav.appendChild(tab);

    const section = document.createElement('section');
    section.id = DIRECTOR_IDS.section;
    section.className = 'hidden director-dashboard';
    section.innerHTML = `
      <header class="platform-hero director-hero">
        <div class="platform-hero__copy">
          <span class="platform-hero__eyebrow"><i class="fa-solid fa-lock"></i> Acceso exclusivo de dirección</span>
          <h2>Panel administrativo institucional</h2>
          <p>Supervisa la actividad académica de todos los docentes sin modificar ningún registro.</p>
          <div class="platform-hero__badges">
            <span><i class="fa-solid fa-eye"></i> Solo lectura</span>
            <span><i class="fa-solid fa-users-gear"></i> Todos los docentes</span>
            <span><i class="fa-solid fa-shield-halved"></i> Acceso restringido</span>
          </div>
        </div>
        <div class="platform-hero__icon"><i class="fa-solid fa-chart-line"></i></div>
      </header>

      <section class="director-toolbar">
        <div class="director-toolbar__identity">
          <span><i class="fa-solid fa-user-tie"></i></span>
          <div><small>Cuenta autorizada</small><strong id="director-account-name">Dirección</strong></div>
        </div>
        <div class="director-toolbar__filters">
          <label><span>Docente</span><select id="director-filter-teacher"><option value="">Todos los docentes</option></select></label>
          <label class="director-search"><span>Buscar</span><div><i class="fa-solid fa-magnifying-glass"></i><input id="director-search" type="search" placeholder="Docente, estudiante, materia o sección"></div></label>
          <button id="director-refresh" type="button"><i class="fa-solid fa-rotate"></i><span>Actualizar</span></button>
        </div>
      </section>

      <nav class="director-view-tabs" aria-label="Vistas del panel director">
        <button class="is-active" data-director-view="resumen" type="button"><i class="fa-solid fa-gauge-high"></i><span>Resumen</span></button>
        <button data-director-view="docentes" type="button"><i class="fa-solid fa-chalkboard-user"></i><span>Docentes</span></button>
        <button data-director-view="asistencia" type="button"><i class="fa-solid fa-user-check"></i><span>Asistencia</span></button>
        <button data-director-view="notas" type="button"><i class="fa-solid fa-square-poll-vertical"></i><span>Notas y evaluaciones</span></button>
        <button data-director-view="estudiantes" type="button"><i class="fa-solid fa-users"></i><span>Estudiantes</span></button>
        <button data-director-view="horarios" type="button"><i class="fa-solid fa-calendar-week"></i><span>Horarios</span></button>
        <button data-director-view="actas" type="button"><i class="fa-solid fa-file-signature"></i><span>Actas</span></button>
        <button data-director-view="auditoria" type="button"><i class="fa-solid fa-clock-rotate-left"></i><span>Auditoría</span></button>
      </nav>

      <div id="director-loading" class="director-state">
        <i class="fa-solid fa-circle-notch fa-spin"></i>
        <strong>Cargando información institucional…</strong>
        <span>Consultando los registros de todos los docentes.</span>
      </div>
      <div id="director-content" class="director-content hidden"></div>
    `;
    main.appendChild(section);

    tab.addEventListener('click', abrirPanelDirector);
    section.querySelector('#director-refresh')?.addEventListener('click', () => cargarPanelDirector(true));
    section.querySelector('#director-filter-teacher')?.addEventListener('change', event => {
      filtroDocenteDirector = event.target.value;
      busquedaDirector = '';
      seccionDirector = '';
      alumnoDirector = '';
      const input = document.getElementById('director-search');
      if (input) input.value = '';
      renderPanelDirector();
    });
    section.querySelector('#director-search')?.addEventListener('input', event => {
      busquedaDirector = String(event.target.value || '').trim().toLowerCase();
      renderPanelDirector();
    });
    section.querySelectorAll('[data-director-view]').forEach(button => {
      button.addEventListener('click', () => {
        vistaDirector = button.dataset.directorView;
        section.querySelectorAll('[data-director-view]').forEach(b => b.classList.toggle('is-active', b === button));
        renderPanelDirector();
      });
    });
  }

  function aplicarAccesoPorRol() {
    crearPanelDirector();
    const director = esDirector();
    document.body.classList.toggle('director-session', director);
    document.querySelectorAll('#app-nav .nav-item').forEach(item => {
      const soloDirector = item.id === DIRECTOR_IDS.tab;
      item.classList.toggle('role-hidden', director ? !soloDirector : soloDirector);
    });
    document.querySelectorAll('#app-main > section').forEach(section => {
      if (director && section.id !== DIRECTOR_IDS.section) section.classList.add('hidden');
    });
    const sidebarLabel = document.querySelector('.sidebar-label');
    const portalLabel = document.querySelector('.sidebar-brand__text small');
    if (sidebarLabel) sidebarLabel.textContent = director ? 'Supervisión institucional' : 'Espacio de trabajo';
    if (portalLabel) portalLabel.textContent = director ? 'Panel de dirección' : 'Portal docente';
    if (profesorMateria) profesorMateria.textContent = director ? 'Acceso institucional · Solo lectura' : (profesorActual?.materia || 'Sin materia asignada');
    if (director) {
      document.getElementById('director-account-name').textContent = profesorActual?.nombre || 'Dirección';
      abrirPanelDirector();
    }
  }

  async function abrirPanelDirector() {
    if (!esDirector()) {
      mostrarToast('Esta sección es exclusiva de la dirección.', 'warning', 'Acceso restringido');
      return;
    }
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('is-active');
      item.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('#app-main > section').forEach(section => section.classList.add('hidden'));
    document.getElementById(DIRECTOR_IDS.tab)?.classList.add('is-active');
    document.getElementById(DIRECTOR_IDS.tab)?.setAttribute('aria-selected', 'true');
    document.getElementById(DIRECTOR_IDS.section)?.classList.remove('hidden');
    if (pageTitle) pageTitle.textContent = 'Panel de dirección';
    if (pageDescription) pageDescription.textContent = 'Consulta consolidada de todos los docentes · acceso de solo lectura.';
    window.scrollTo({top: 0, behavior: 'smooth'});
    await cargarPanelDirector(false);
  }

  async function cargarPanelDirector(forzar = false) {
    if (!esDirector() || (datosDirector && !forzar)) {
      renderPanelDirector();
      return;
    }
    const loading = document.getElementById('director-loading');
    const content = document.getElementById('director-content');
    const refresh = document.getElementById('director-refresh');
    loading?.classList.remove('hidden');
    content?.classList.add('hidden');
    refresh?.classList.add('is-loading');
    try {
      datosDirector = await apiRequest('obtenerPanelDirector');
      llenarFiltroDocentes();
      renderPanelDirector();
      if (forzar) mostrarToast('La información institucional fue actualizada.', 'success', 'Panel actualizado');
    } catch (error) {
      if (content) {
        content.innerHTML = `<div class="director-empty"><i class="fa-solid fa-triangle-exclamation"></i><strong>No se pudo cargar el panel</strong><span>${h(error.message || 'Error de conexión.')}</span></div>`;
        content.classList.remove('hidden');
      }
      mostrarToast(error.message || 'No se pudo cargar la información.', 'error', 'Panel no disponible');
    } finally {
      loading?.classList.add('hidden');
      refresh?.classList.remove('is-loading');
    }
  }

  function llenarFiltroDocentes() {
    const select = document.getElementById('director-filter-teacher');
    if (!select || !datosDirector) return;
    const actual = select.value;
    select.innerHTML = '<option value="">Todos los docentes</option>' +
      (datosDirector.docentes || []).map(d => `<option value="${h(d.id)}">${h(d.nombre)} · ${h(d.materia)}</option>`).join('');
    if ([...select.options].some(o => o.value === actual)) select.value = actual;
  }

  function filtrar(lista, campos = []) {
    return (lista || []).filter(item => {
      if (filtroDocenteDirector && String(item.idProfesor || item.id) !== filtroDocenteDirector) return false;
      if (!busquedaDirector) return true;
      const bolsa = campos.map(c => String(item[c] || '')).join(' ').toLowerCase();
      return bolsa.includes(busquedaDirector);
    });
  }

  function metric(icon, value, label, note = '') {
    return `<article class="director-metric"><span><i class="fa-solid ${icon}"></i></span><div><strong>${h(value)}</strong><small>${h(label)}</small>${note ? `<em>${h(note)}</em>` : ''}</div></article>`;
  }

  function tabla(headers, rows, empty = 'No hay registros para los filtros seleccionados.') {
    if (!rows.length) return `<div class="director-empty"><i class="fa-solid fa-inbox"></i><strong>Sin resultados</strong><span>${h(empty)}</span></div>`;
    return `<div class="director-table-wrap"><table class="director-table"><thead><tr>${headers.map(x => `<th>${h(x)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  }


  function docenteSeleccionado() {
    if (!datosDirector || !filtroDocenteDirector) return null;
    return (datosDirector.docentes || []).find(d => String(d.id) === String(filtroDocenteDirector)) || null;
  }

  function obtenerSeccionesDocente(idDocente) {
    const fuentes = []
      .concat(datosDirector?.estudiantes || [])
      .concat(datosDirector?.horarios || [])
      .concat(datosDirector?.evaluaciones || [])
      .filter(x => String(x.idProfesor || '') === String(idDocente));

    const mapa = new Map();
    fuentes.forEach(x => {
      const ano = String(x.ano || '').trim();
      const seccion = String(x.seccion || '').trim();
      const turno = String(x.turno || '').trim();
      if (!ano && !seccion) return;
      const clave = `${ano}|${seccion}|${turno}`;
      if (!mapa.has(clave)) mapa.set(clave, { ano, seccion, turno });
    });
    return [...mapa.values()].sort((a,b) =>
      `${a.ano}-${a.seccion}-${a.turno}`.localeCompare(`${b.ano}-${b.seccion}-${b.turno}`, 'es')
    );
  }

  function contextoDocenteHtml() {
    const d = docenteSeleccionado();
    if (!d) {
      return `<section class="director-selection-help">
        <span><i class="fa-solid fa-hand-pointer"></i></span>
        <div><strong>Selecciona un docente para consultar su información</strong>
        <p>Usa el selector superior o pulsa “Ver información” en una tarjeta. Después navega por Estudiantes, Asistencia, Notas, Horarios, Actas y Auditoría.</p></div>
      </section>`;
    }

    const secciones = obtenerSeccionesDocente(d.id);
    return `<section class="director-selected-teacher">
      <div class="director-selected-teacher__profile">
        <span>${h((d.nombre || 'D').charAt(0))}</span>
        <div>
          <small>Docente seleccionado</small>
          <h3>${h(d.nombre)}</h3>
          <p>${h(d.materia || 'Sin materia')} · @${h(d.usuario || '')}</p>
        </div>
        <em class="${d.activo ? 'is-active' : 'is-inactive'}">${d.activo ? 'Cuenta activa' : 'Cuenta inactiva'}</em>
      </div>
      <div class="director-selected-teacher__summary">
        <div><i class="fa-solid fa-users"></i><strong>${h(d.estudiantes)}</strong><small>Estudiantes</small></div>
        <div><i class="fa-solid fa-user-check"></i><strong>${h(d.porcentajeAsistencia)}%</strong><small>Asistencia</small></div>
        <div><i class="fa-solid fa-square-poll-vertical"></i><strong>${h(d.evaluaciones)}</strong><small>Evaluaciones</small></div>
        <div><i class="fa-solid fa-calendar-week"></i><strong>${h(d.bloquesHorario)}</strong><small>Bloques</small></div>
      </div>
      <div class="director-selected-teacher__sections">
        <strong><i class="fa-solid fa-school"></i> Secciones asignadas</strong>
        <div>${secciones.length
          ? secciones.map(s => `<button type="button" data-director-section="${h(`${s.ano}|${s.seccion}|${s.turno}`)}"><span>${h(s.ano || 'Curso')} ${h(s.seccion)}</span><small>${h(s.turno || 'Sin turno')}</small></button>`).join('')
          : '<span class="director-no-sections">No hay secciones registradas para este docente.</span>'}
        </div>
      </div>
    </section>`;
  }

  function filtrarPorSeccionTemporal(lista, clave) {
    if (!clave) return lista;
    const [ano, seccion, turno] = String(clave).split('|');
    return (lista || []).filter(x =>
      String(x.ano || '') === ano &&
      String(x.seccion || '') === seccion &&
      String(x.turno || '') === turno
    );
  }

  function horarioInteractivoHtml(items) {
    if (!items.length) return `<div class="director-empty"><i class="fa-solid fa-calendar-xmark"></i><strong>Sin horario registrado</strong><span>El docente seleccionado todavía no tiene bloques de horario.</span></div>`;
    const ordenDias = ['Lunes','Martes','Miércoles','Miercoles','Jueves','Viernes','Sábado','Sabado','Domingo'];
    const dias = [...new Set(items.map(x => String(x.dia || 'Sin día')))].sort((a,b) => {
      const ia = ordenDias.indexOf(a), ib = ordenDias.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    return `<div class="director-schedule-board">${dias.map(dia => {
      const bloques = items.filter(x => String(x.dia || 'Sin día') === dia)
        .sort((a,b) => String(a.horaInicio || '').localeCompare(String(b.horaInicio || '')));
      return `<article class="director-schedule-day">
        <header><i class="fa-solid fa-calendar-day"></i><strong>${h(dia)}</strong><small>${bloques.length} bloque${bloques.length === 1 ? '' : 's'}</small></header>
        <div>${bloques.map(x => `<section>
          <time>${h(x.horaInicio)} – ${h(x.horaFin)}</time>
          <strong>${h(x.ano)} ${h(x.seccion)}</strong>
          <span>${h(x.turno)}${x.materia ? ` · ${h(x.materia)}` : ''}</span>
        </section>`).join('')}</div>
      </article>`;
    }).join('')}</div>`;
  }


  function normalizarClaveAlumno(item = {}) {
    const cedula = String(item.cedula || '').replace(/\D/g, '');
    if (cedula) return `cedula:${cedula}`;
    const nombre = String(item.nombre || item.alumno || '').trim().toLowerCase();
    const ano = String(item.ano || '').trim().toLowerCase();
    const seccion = String(item.seccion || '').trim().toLowerCase();
    return `nombre:${nombre}|${ano}|${seccion}`;
  }

  function fechaValida(valor) {
    if (!valor) return null;
    const texto = String(valor).trim();
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(texto) ? texto : null;
    if (iso) {
      const d = new Date(`${iso}T12:00:00`);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const partes = texto.split(/[\/\-]/).map(Number);
    if (partes.length === 3) {
      const [a,b,c] = partes;
      const d = a > 1900 ? new Date(a,b-1,c,12) : new Date(c,b-1,a,12);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(texto);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function dentroDeDias(fecha, dias) {
    const d = fechaValida(fecha);
    if (!d) return false;
    const ahora = new Date();
    const inicio = new Date(ahora);
    inicio.setHours(0,0,0,0);
    inicio.setDate(inicio.getDate() - (dias - 1));
    return d >= inicio && d <= ahora;
  }

  function registrosAlumno(lista, alumno) {
    const clave = normalizarClaveAlumno(alumno);
    return (lista || []).filter(item => {
      if (alumno.id && item.idAlumno && String(item.idAlumno) === String(alumno.id)) return true;
      return normalizarClaveAlumno({
        cedula: item.cedula,
        nombre: item.alumno || item.nombre,
        ano: item.ano,
        seccion: item.seccion
      }) === clave;
    });
  }

  function resumenAsistenciaAlumno(alumno) {
    const registros = registrosAlumno(datosDirector?.asistencia || [], alumno);
    const contar = lista => {
      const total = lista.length;
      const presentes = lista.filter(r => String(r.estado || '').toLowerCase() === 'presente').length;
      const tardanzas = lista.filter(r => String(r.estado || '').toLowerCase() === 'tardanza').length;
      const ausentes = lista.filter(r => String(r.estado || '').toLowerCase() === 'ausente').length;
      const justificadas = lista.filter(r => ['justificada','justificado'].includes(String(r.estado || '').toLowerCase())).length;
      const efectivas = presentes + tardanzas;
      return {
        total, presentes, tardanzas, ausentes, justificadas,
        porcentaje: total ? Math.round((efectivas / total) * 1000) / 10 : 0
      };
    };
    return {
      total: contar(registros),
      semana: contar(registros.filter(r => dentroDeDias(r.fecha, 7))),
      mes: contar(registros.filter(r => dentroDeDias(r.fecha, 30))),
      registros
    };
  }

  function resumenNotasAlumno(alumno) {
    const notas = registrosAlumno(datosDirector?.calificaciones || [], alumno);
    const porMateria = new Map();
    notas.forEach(n => {
      const materia = String(n.materia || 'Sin materia');
      const nota = Number(n.nota);
      const maxima = Number(n.notaMaxima || 20);
      if (!Number.isFinite(nota) || !Number.isFinite(maxima) || maxima <= 0) return;
      if (!porMateria.has(materia)) porMateria.set(materia, []);
      porMateria.get(materia).push({nota, maxima, porcentaje: nota / maxima * 100, fecha:n.fecha, actividad:n.actividad});
    });
    const materias = [...porMateria.entries()].map(([materia, items]) => ({
      materia,
      promedio: Math.round(items.reduce((s,x)=>s+x.porcentaje,0) / items.length * 10) / 10,
      evaluaciones: items.length
    })).sort((a,b)=>a.materia.localeCompare(b.materia,'es'));
    const promedio = materias.length
      ? Math.round(materias.reduce((s,x)=>s+x.promedio,0) / materias.length * 10) / 10
      : null;
    return { notas, materias, promedio };
  }

  function riesgoAlumno(alumno) {
    const asistencia = resumenAsistenciaAlumno(alumno);
    const actas = registrosAlumno(datosDirector?.actas || [], alumno);
    const notas = resumenNotasAlumno(alumno);
    let puntos = 0;
    if (asistencia.mes.total && asistencia.mes.porcentaje < 80) puntos += 3;
    else if (asistencia.mes.total && asistencia.mes.porcentaje < 90) puntos += 1;
    puntos += Math.min(actas.length * 2, 6);
    if (notas.promedio !== null && notas.promedio < 60) puntos += 3;
    return {
      puntos,
      nivel: puntos >= 6 ? 'Alto' : puntos >= 3 ? 'Medio' : 'Bajo',
      asistencia,
      actas,
      notas
    };
  }

  function alumnosDeSeccion(clave) {
    const [ano,seccion,turno] = String(clave || '').split('|');
    return (datosDirector?.estudiantes || []).filter(a => {
      if (filtroDocenteDirector && String(a.idProfesor || '') !== String(filtroDocenteDirector)) return false;
      return String(a.ano || '') === ano && String(a.seccion || '') === seccion && String(a.turno || '') === turno;
    });
  }

  function detalleAlumnoHtml(alumno) {
    const asistencia = resumenAsistenciaAlumno(alumno);
    const notas = resumenNotasAlumno(alumno);
    const actas = registrosAlumno(datosDirector?.actas || [], alumno);
    const materias = [...new Set(
      (datosDirector?.asistencia || [])
        .filter(r => registrosAlumno([r], alumno).length)
        .map(r => String(r.materia || '').trim())
        .filter(Boolean)
    )].sort((a,b)=>a.localeCompare(b,'es'));
    const riesgo = riesgoAlumno(alumno);

    const materiasNotas = notas.materias.length
      ? notas.materias.map(m => `<article><strong>${h(m.materia)}</strong><span>${h(m.promedio)}%</span><small>${h(m.evaluaciones)} evaluaciones</small><progress max="100" value="${Number(m.promedio)||0}"></progress></article>`).join('')
      : `<div class="student-no-data"><i class="fa-solid fa-circle-info"></i><span>No hay calificaciones registradas todavía. El promedio aparecerá cuando se use la hoja Calificaciones.</span></div>`;

    return `<section class="director-student-detail">
      <header>
        <div class="director-student-detail__identity">
          <span>${h((alumno.nombre || 'A').charAt(0))}</span>
          <div><small>Ficha de seguimiento</small><h3>${h(alumno.nombre)}</h3><p>${h(alumno.ano)} ${h(alumno.seccion)} · ${h(alumno.turno)}</p></div>
        </div>
        <div class="director-risk director-risk--${riesgo.nivel.toLowerCase()}"><small>Nivel de seguimiento</small><strong>${h(riesgo.nivel)}</strong></div>
        <button type="button" data-close-student-detail><i class="fa-solid fa-xmark"></i></button>
      </header>

      <div class="director-student-overview">
        <article><i class="fa-solid fa-calendar-week"></i><strong>${h(asistencia.semana.porcentaje)}%</strong><small>Asistencia semanal</small><em>${asistencia.semana.ausentes} ausencias</em></article>
        <article><i class="fa-solid fa-calendar-days"></i><strong>${h(asistencia.mes.porcentaje)}%</strong><small>Asistencia mensual</small><em>${asistencia.mes.ausentes} ausencias</em></article>
        <article><i class="fa-solid fa-chart-simple"></i><strong>${notas.promedio === null ? '—' : `${h(notas.promedio)}%`}</strong><small>Promedio general</small><em>${notas.notas.length} notas</em></article>
        <article><i class="fa-solid fa-file-circle-exclamation"></i><strong>${h(actas.length)}</strong><small>Actas registradas</small><em>${actas.length ? 'Requiere revisión' : 'Sin actas'}</em></article>
      </div>

      <div class="director-student-columns">
        <section class="director-card director-card--inner">
          <header><div><span><i class="fa-solid fa-user-check"></i></span><div><h3>Asistencia reciente</h3><p>Últimas marcaciones del estudiante.</p></div></div><small>${asistencia.total.total} registros</small></header>
          ${tabla(['Fecha','Materia','Estado'], asistencia.registros.slice(0,18).map(r => `<tr><td>${h(r.fecha)}</td><td>${h(r.materia || '—')}</td><td><span class="director-status director-status--${h(String(r.estado||'').toLowerCase())}">${h(r.estado)}</span></td></tr>`), 'No hay asistencia registrada.')}
        </section>

        <section class="director-card director-card--inner">
          <header><div><span><i class="fa-solid fa-square-poll-vertical"></i></span><div><h3>Rendimiento por materia</h3><p>Promedios disponibles en el sistema.</p></div></div><small>${materias.length} materias</small></header>
          <div class="director-subject-performance">${materiasNotas}</div>
        </section>
      </div>

      <div class="director-student-columns">
        <section class="director-card director-card--inner">
          <header><div><span><i class="fa-solid fa-file-signature"></i></span><div><h3>Actas y comportamiento</h3><p>Antecedentes registrados por los docentes.</p></div></div><small>${actas.length} actas</small></header>
          ${tabla(['Fecha','Docente','Tipo','Motivo'], actas.map(a => `<tr><td>${h(a.fecha)}</td><td>${h(a.docente)}</td><td><span class="director-status is-info">${h(a.tipo)}</span></td><td>${h(a.titulo || a.mensaje || '—')}</td></tr>`), 'Este estudiante no tiene actas registradas.')}
        </section>

        <section class="director-card director-card--inner">
          <header><div><span><i class="fa-solid fa-address-book"></i></span><div><h3>Representante</h3><p>Información para seguimiento familiar.</p></div></div></header>
          <div class="director-representative">
            <div><small>Nombre</small><strong>${h(alumno.representante || 'No registrado')}</strong></div>
            <div><small>Teléfono</small><strong>${h(alumno.telefonoRepresentante || 'No registrado')}</strong></div>
            <div><small>Correo</small><strong>${h(alumno.emailRepresentante || 'No registrado')}</strong></div>
            <div><small>Observaciones</small><strong>${h(alumno.observaciones || 'Sin observaciones')}</strong></div>
          </div>
        </section>
      </div>
    </section>`;
  }

  function renderPanelDirector() {
    const content = document.getElementById('director-content');
    if (!content || !datosDirector) return;
    content.classList.remove('hidden');
    const r = datosDirector.resumen || {};
    let html = '';
    const contexto = contextoDocenteHtml();

    if (vistaDirector === 'resumen') {
      const docentes = filtrar(datosDirector.docentes, ['nombre','materia','usuario','seccion','turno']);
      html = `
        <section class="director-metrics">
          ${metric('fa-chalkboard-user', r.docentes || 0, 'Docentes registrados', `${r.docentesActivos || 0} activos`)}
          ${metric('fa-users', r.estudiantes || 0, 'Estudiantes registrados')}
          ${metric('fa-user-check', `${r.porcentajeAsistencia || 0}%`, 'Asistencia institucional', `${r.registrosAsistencia || 0} marcaciones`)}
          ${metric('fa-square-poll-vertical', r.evaluaciones || 0, 'Evaluaciones planificadas')}
          ${metric('fa-calendar-week', r.horarios || 0, 'Bloques de horario')}
          ${metric('fa-file-signature', r.actas || 0, 'Actas registradas')}
        </section>
        <section class="director-card">
          <header><div><span><i class="fa-solid fa-chart-column"></i></span><div><h3>Rendimiento por docente</h3><p>Resumen comparativo de actividad académica.</p></div></div><small>Solo lectura</small></header>
          <div class="director-teacher-grid">
            ${docentes.map(d => `
              <article class="director-teacher-card">
                <div class="director-teacher-card__head"><span>${h((d.nombre || 'D').charAt(0))}</span><div><strong>${h(d.nombre)}</strong><small>${h(d.materia || 'Sin materia')}</small></div><em class="${d.activo ? 'is-active' : 'is-inactive'}">${d.activo ? 'Activo' : 'Inactivo'}</em></div>
                <div class="director-progress"><div><span>Asistencia</span><strong>${h(d.porcentajeAsistencia)}%</strong></div><progress max="100" value="${Number(d.porcentajeAsistencia) || 0}"></progress></div>
                <dl><div><dt>Estudiantes</dt><dd>${h(d.estudiantes)}</dd></div><div><dt>Evaluaciones</dt><dd>${h(d.evaluaciones)}</dd></div><div><dt>Horario</dt><dd>${h(d.bloquesHorario)}</dd></div><div><dt>Actas</dt><dd>${h(d.actas)}</dd></div></dl>
                <button type="button" data-open-teacher="${h(d.id)}"><i class="fa-solid fa-eye"></i> Ver información</button>
              </article>`).join('') || '<div class="director-empty"><span>No hay docentes para mostrar.</span></div>'}
          </div>
        </section>`;
    }

    if (vistaDirector === 'docentes') {
      const items = filtrar(datosDirector.docentes, ['nombre','materia','usuario','email','seccion','turno']);
      html = `<section class="director-card"><header><div><span><i class="fa-solid fa-chalkboard-user"></i></span><div><h3>Directorio de docentes</h3><p>Cuentas y actividad institucional.</p></div></div><small>${items.length} docentes</small></header>
      ${tabla(['Docente','Asignación','Estudiantes','Asistencia','Evaluaciones','Actividad'], items.map(d => `<tr><td><strong>${h(d.nombre)}</strong><small>@${h(d.usuario)}</small></td><td>${h(d.materia)}<small>${h(d.seccion)} · ${h(d.turno)}</small></td><td>${h(d.estudiantes)}</td><td><strong>${h(d.porcentajeAsistencia)}%</strong><small>${h(d.registrosAsistencia)} registros</small></td><td>${h(d.evaluaciones)}<small>${h(d.puntosPlanificados)} puntos</small></td><td>${d.activo ? '<span class="director-status is-ok">Activo</span>' : '<span class="director-status is-off">Inactivo</span>'}</td></tr>`))}</section>`;
    }

    if (vistaDirector === 'asistencia') {
      const items = filtrar(datosDirector.asistencia, ['docente','alumno','materia','ano','seccion','turno','estado','fecha']);
      html = `<section class="director-card"><header><div><span><i class="fa-solid fa-user-check"></i></span><div><h3>Control de asistencia por docente</h3><p>Marcaciones consolidadas de toda la institución.</p></div></div><small>${items.length} registros</small></header>
      ${tabla(['Fecha','Docente','Estudiante','Clase','Estado'], items.slice(0,500).map(x => `<tr><td>${h(x.fecha)}</td><td><strong>${h(x.docente)}</strong><small>${h(x.materia)}</small></td><td>${h(x.alumno)}</td><td>${h(x.ano)} · ${h(x.seccion)} · ${h(x.turno)}</td><td><span class="director-status director-status--${h(String(x.estado || '').toLowerCase())}">${h(x.estado)}</span></td></tr>`))}</section>`;
    }

    if (vistaDirector === 'notas') {
      const items = filtrar(datosDirector.evaluaciones, ['docente','actividad','ano','seccion','fecha','puntos']);
      html = `<section class="director-card"><header><div><span><i class="fa-solid fa-square-poll-vertical"></i></span><div><h3>Control de notas y evaluaciones</h3><p>Consulta las evaluaciones y ponderaciones planificadas por cada docente. Este panel no modifica calificaciones.</p></div></div><small>${items.length} evaluaciones</small></header>
      ${tabla(['Fecha','Docente','Curso / sección','Evaluación','Ponderación'], items.slice(0,500).map(x => `<tr><td>${h(x.fecha)}</td><td><strong>${h(x.docente)}</strong></td><td>${h(x.ano)} · ${h(x.seccion)}</td><td>${h(x.actividad)}</td><td><strong>${h(x.puntos)} puntos</strong></td></tr>`), 'Todavía no existen evaluaciones planificadas.')}</section>`;
    }

    if (vistaDirector === 'estudiantes') {
      const todos = filtrar(datosDirector.estudiantes, ['docente','nombre','cedula','ano','seccion','turno','representante']);
      const grupos = new Map();
      todos.forEach(a => {
        const key = `${a.ano || ''}|${a.seccion || ''}|${a.turno || ''}`;
        if (!grupos.has(key)) grupos.set(key, []);
        grupos.get(key).push(a);
      });

      const ranking = todos.map(a => ({alumno:a, ...riesgoAlumno(a)}));
      const mejorAsistencia = [...ranking]
        .filter(x => x.asistencia.mes.total > 0)
        .sort((a,b)=>b.asistencia.mes.porcentaje-a.asistencia.mes.porcentaje)
        .slice(0,5);
      const seguimiento = [...ranking]
        .filter(x => x.puntos > 0)
        .sort((a,b)=>b.puntos-a.puntos)
        .slice(0,8);
      const conActas = ranking.filter(x => x.actas.length > 0).sort((a,b)=>b.actas.length-a.actas.length);

      let cuerpo = '';
      if (!seccionDirector) {
        cuerpo = `
          <section class="director-student-dashboard">
            <div class="director-student-dashboard__top">
              <article class="director-card">
                <header><div><span><i class="fa-solid fa-trophy"></i></span><div><h3>Top de asistencia mensual</h3><p>Estudiantes con mejor asistencia registrada.</p></div></div></header>
                <div class="director-ranking">${mejorAsistencia.length ? mejorAsistencia.map((x,i)=>`<button type="button" data-open-student="${h(normalizarClaveAlumno(x.alumno))}"><em>${i+1}</em><span><strong>${h(x.alumno.nombre)}</strong><small>${h(x.alumno.ano)} ${h(x.alumno.seccion)}</small></span><b>${h(x.asistencia.mes.porcentaje)}%</b></button>`).join('') : '<div class="student-no-data">No hay asistencia mensual suficiente.</div>'}</div>
              </article>
              <article class="director-card">
                <header><div><span><i class="fa-solid fa-triangle-exclamation"></i></span><div><h3>Requieren seguimiento</h3><p>Ausencias, bajo promedio o actas registradas.</p></div></div></header>
                <div class="director-ranking director-ranking--risk">${seguimiento.length ? seguimiento.map(x=>`<button type="button" data-open-student="${h(normalizarClaveAlumno(x.alumno))}"><em>${h(x.nivel)}</em><span><strong>${h(x.alumno.nombre)}</strong><small>${x.actas.length} actas · ${x.asistencia.mes.ausentes} ausencias</small></span><b>${x.notas.promedio === null ? '—' : `${h(x.notas.promedio)}%`}</b></button>`).join('') : '<div class="student-no-data">No hay estudiantes con alertas actuales.</div>'}</div>
              </article>
            </div>

            <section class="director-card">
              <header><div><span><i class="fa-solid fa-school"></i></span><div><h3>Alumnos por sección</h3><p>Primero selecciona una sección para ver todos sus estudiantes.</p></div></div><small>${grupos.size} secciones</small></header>
              <div class="director-section-grid director-section-grid--students">
                ${[...grupos.entries()].map(([key, alumnos]) => {
                  const [ano,seccion,turno] = key.split('|');
                  const alertas = alumnos.filter(a=>riesgoAlumno(a).puntos>0).length;
                  return `<button class="director-section-card director-section-card--large" type="button" data-select-section="${h(key)}">
                    <span><i class="fa-solid fa-people-group"></i></span>
                    <div><strong>${h(ano || 'Curso')} ${h(seccion)}</strong><small>${h(turno || 'Sin turno')}</small></div>
                    <em>${alumnos.length} alumnos</em>
                    <b>${alertas ? `${alertas} alertas` : 'Sin alertas'}</b>
                    <i class="fa-solid fa-chevron-right"></i>
                  </button>`;
                }).join('') || '<div class="director-empty">No existen secciones para este docente.</div>'}
              </div>
            </section>

            <section class="director-card">
              <header><div><span><i class="fa-solid fa-file-circle-exclamation"></i></span><div><h3>Alumnos con actas</h3><p>Lista prioritaria para seguimiento con representantes.</p></div></div><small>${conActas.length} estudiantes</small></header>
              ${tabla(['Estudiante','Sección','Actas','Asistencia mensual','Representante'], conActas.map(x=>`<tr data-open-student-row="${h(normalizarClaveAlumno(x.alumno))}"><td><strong>${h(x.alumno.nombre)}</strong><small>${h(x.alumno.cedula || 'Sin cédula')}</small></td><td>${h(x.alumno.ano)} ${h(x.alumno.seccion)} · ${h(x.alumno.turno)}</td><td><span class="director-status is-info">${h(x.actas.length)} actas</span></td><td>${h(x.asistencia.mes.porcentaje)}%</td><td>${h(x.alumno.representante || 'No registrado')}<small>${h(x.alumno.telefonoRepresentante || '')}</small></td></tr>`), 'No hay estudiantes con actas.')}
            </section>
          </section>`;
      } else {
        const alumnos = alumnosDeSeccion(seccionDirector);
        const [ano,seccion,turno] = seccionDirector.split('|');
        cuerpo = `
          <section class="director-card">
            <header>
              <div><span><i class="fa-solid fa-users"></i></span><div><h3>${h(ano)} ${h(seccion)} · ${h(turno)}</h3><p>Selecciona un estudiante para abrir su ficha completa.</p></div></div>
              <button class="director-back-button" type="button" data-back-sections><i class="fa-solid fa-arrow-left"></i> Volver a secciones</button>
            </header>
            <div class="director-student-grid">
              ${alumnos.map(a => {
                const r = riesgoAlumno(a);
                return `<button type="button" class="director-student-card" data-open-student="${h(normalizarClaveAlumno(a))}">
                  <span>${h((a.nombre||'A').charAt(0))}</span>
                  <div><strong>${h(a.nombre)}</strong><small>${h(a.cedula || 'Sin cédula')}</small></div>
                  <dl><div><dt>Mes</dt><dd>${h(r.asistencia.mes.porcentaje)}%</dd></div><div><dt>Promedio</dt><dd>${r.notas.promedio === null ? '—' : `${h(r.notas.promedio)}%`}</dd></div><div><dt>Actas</dt><dd>${h(r.actas.length)}</dd></div></dl>
                  <em class="risk-${r.nivel.toLowerCase()}">${h(r.nivel)}</em>
                </button>`;
              }).join('') || '<div class="director-empty">No hay alumnos en esta sección.</div>'}
            </div>
          </section>`;
      }

      if (alumnoDirector) {
        const alumno = todos.find(a => normalizarClaveAlumno(a) === alumnoDirector);
        if (alumno) cuerpo += detalleAlumnoHtml(alumno);
      }

      html = cuerpo;
    }

    if (vistaDirector === 'horarios') {
      const items = filtrar(datosDirector.horarios, ['docente','dia','horaInicio','horaFin','ano','seccion','turno','materia']);
      html = `<section class="director-card">
        <header><div><span><i class="fa-solid fa-calendar-week"></i></span><div><h3>Horario completo del docente</h3><p>Agenda semanal con días, horas, cursos, secciones y turnos.</p></div></div><small>${items.length} bloques</small></header>
        ${horarioInteractivoHtml(items)}
      </section>`;
    }

    if (vistaDirector === 'actas') {
      const items = filtrar(datosDirector.actas, ['docente','alumno','tipo','titulo','fecha']);
      html = `<section class="director-card"><header><div><span><i class="fa-solid fa-file-signature"></i></span><div><h3>Historial de actas</h3><p>Documentos generados por todos los docentes.</p></div></div><small>${items.length} actas</small></header>
      ${tabla(['Fecha','Docente','Estudiante','Tipo','Título'], items.slice(0,500).map(x => `<tr><td>${h(x.fecha)}</td><td>${h(x.docente)}</td><td>${h(x.alumno)}</td><td><span class="director-status is-info">${h(x.tipo)}</span></td><td>${h(x.titulo)}</td></tr>`))}</section>`;
    }

    if (vistaDirector === 'auditoria') {
      const items = filtrar(datosDirector.auditoria, ['docente','actorNombre','alumno','accion','origen','estadoAnterior','estadoNuevo']);
      html = `<section class="director-card"><header><div><span><i class="fa-solid fa-clock-rotate-left"></i></span><div><h3>Auditoría administrativa</h3><p>Cambios de asistencia realizados desde la web y Telegram.</p></div></div><small>${items.length} movimientos</small></header>
      ${tabla(['Fecha y hora','Docente','Estudiante','Origen','Cambio'], items.slice(0,600).map(x => `<tr><td>${h(x.registradoEn)}</td><td><strong>${h(x.docente)}</strong><small>${h(x.actorNombre || '')}</small></td><td>${h(x.alumno)}</td><td>${h(x.origen)}</td><td>${h(x.estadoAnterior || '—')} → <strong>${h(x.estadoNuevo || '—')}</strong></td></tr>`))}</section>`;
    }

    content.innerHTML = contexto + html;

    content.querySelectorAll('[data-director-section]').forEach(button => {
      button.addEventListener('click', () => {
        const clave = button.dataset.directorSection;
        const [ano, seccion, turno] = String(clave || '').split('|');
        busquedaDirector = `${ano} ${seccion} ${turno}`.trim().toLowerCase();
        const input = document.getElementById('director-search');
        if (input) input.value = `${ano} ${seccion} ${turno}`.trim();
        vistaDirector = 'estudiantes';
        document.querySelectorAll('[data-director-view]').forEach(b => b.classList.toggle('is-active', b.dataset.directorView === 'estudiantes'));
        renderPanelDirector();
      });
    });


    content.querySelectorAll('[data-select-section]').forEach(button => {
      button.addEventListener('click', () => {
        seccionDirector = button.dataset.selectSection || '';
        alumnoDirector = '';
        renderPanelDirector();
      });
    });

    content.querySelectorAll('[data-back-sections]').forEach(button => {
      button.addEventListener('click', () => {
        seccionDirector = '';
        alumnoDirector = '';
        renderPanelDirector();
      });
    });

    content.querySelectorAll('[data-open-student], [data-open-student-row]').forEach(element => {
      element.addEventListener('click', () => {
        alumnoDirector = element.dataset.openStudent || element.dataset.openStudentRow || '';
        const alumno = (datosDirector?.estudiantes || []).find(a => normalizarClaveAlumno(a) === alumnoDirector);
        if (alumno) seccionDirector = `${alumno.ano || ''}|${alumno.seccion || ''}|${alumno.turno || ''}`;
        renderPanelDirector();
        setTimeout(() => document.querySelector('.director-student-detail')?.scrollIntoView({behavior:'smooth',block:'start'}), 50);
      });
    });

    content.querySelectorAll('[data-close-student-detail]').forEach(button => {
      button.addEventListener('click', () => {
        alumnoDirector = '';
        renderPanelDirector();
      });
    });

    content.querySelectorAll('[data-open-teacher]').forEach(button => {
      button.addEventListener('click', () => {
        filtroDocenteDirector = button.dataset.openTeacher;
        const select = document.getElementById('director-filter-teacher');
        if (select) select.value = filtroDocenteDirector;
        vistaDirector = 'estudiantes';
        document.querySelectorAll('[data-director-view]').forEach(b => b.classList.toggle('is-active', b.dataset.directorView === 'estudiantes'));
        renderPanelDirector();
      });
    });
  }

  crearPanelDirector();

  const originalAplicarPerfil = aplicarPerfilDocente;
  aplicarPerfilDocente = function(profesor) {
    originalAplicarPerfil(profesor);
    aplicarAccesoPorRol();
  };

  const originalCargarDatos = cargarDatosPersistentes;
  cargarDatosPersistentes = async function() {
    if (esDirector()) {
      await cargarPanelDirector(false);
      return;
    }
    return originalCargarDatos();
  };

  window.addEventListener('DOMContentLoaded', () => {
    crearPanelDirector();
    if (profesorActual) aplicarAccesoPorRol();
  });




/* =========================================================
   BIBLIOTECA DIGITAL — RECURSOS, ARCHIVOS Y APUNTES
   ========================================================= */
(() => {
  const LIB_IDS = { tab: 'tab-biblioteca', section: 'section-biblioteca' };
  let bibliotecaDatos = null;
  let bibliotecaFiltro = 'Todos';
  let bibliotecaBusqueda = '';

  const escLib = valor => String(valor ?? '').replace(/[&<>'"]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));

  function crearBibliotecaDigital() {
    if (document.getElementById(LIB_IDS.tab)) return;
    const nav = document.getElementById('app-nav');
    const main = document.getElementById('app-main');
    if (!nav || !main) return;

    const tab = document.createElement('button');
    tab.id = LIB_IDS.tab;
    tab.type = 'button';
    tab.className = 'nav-item';
    tab.setAttribute('aria-selected', 'false');
    tab.dataset.title = 'Biblioteca digital';
    tab.dataset.description = 'Libros, cursos, enlaces, archivos y apuntes para tus clases.';
    tab.innerHTML = '<i class="fa-solid fa-book-open-reader"></i><span>Biblioteca digital</span>';

    const directorTab = nav.querySelector('#tab-historial-administrativo');
    if (directorTab) nav.insertBefore(tab, directorTab);
    else nav.appendChild(tab);

    const section = document.createElement('section');
    section.id = LIB_IDS.section;
    section.className = 'hidden digital-library';
    section.innerHTML = `
      <header class="platform-hero library-hero">
        <div class="platform-hero__copy">
          <span class="platform-hero__eyebrow"><i class="fa-solid fa-books"></i> Centro personal de recursos docentes</span>
          <h2>Biblioteca digital</h2>
          <p>Guarda libros, cursos, archivos, enlaces y apuntes. Investiga temas para preparar clases sin perder tus fuentes.</p>
          <div class="platform-hero__badges">
            <span><i class="fa-brands fa-google"></i> Búsqueda académica</span>
            <span><i class="fa-brands fa-youtube"></i> Videos educativos</span>
            <span><i class="fa-brands fa-google-drive"></i> Archivos en Drive</span>
          </div>
        </div>
        <div class="platform-hero__icon"><i class="fa-solid fa-book-atlas"></i></div>
      </header>

      <section class="library-search-hub">
        <div class="library-search-card library-search-card--google">
          <span><i class="fa-brands fa-google"></i></span>
          <div><strong>Buscar información en Google</strong><small>Artículos, guías, documentos y actividades.</small></div>
          <form id="library-google-form"><input id="library-google-query" type="search" placeholder="Ej.: sistema solar para primer año"><button type="submit"><i class="fa-solid fa-magnifying-glass"></i> Buscar</button></form>
        </div>
        <div class="library-search-card library-search-card--youtube">
          <span><i class="fa-brands fa-youtube"></i></span>
          <div><strong>Buscar clases y cursos en YouTube</strong><small>Videos, experimentos y explicaciones educativas.</small></div>
          <form id="library-youtube-form"><input id="library-youtube-query" type="search" placeholder="Ej.: curso de educación física escolar"><button type="submit"><i class="fa-solid fa-play"></i> Buscar</button></form>
        </div>
      </section>

      <section id="library-ai-tools" class="library-panel" style="margin-top:1rem">
        <header><span><i class="fa-solid fa-wand-magic-sparkles"></i></span><div><h3>Trabajar un recurso con Gemini</h3><p>Usa un apunte guardado o pega un fragmento de texto para resumir, explicar, crear preguntas, actividades o una guía de estudio.</p></div></header>
        <div style="display:grid;grid-template-columns:1fr 220px;gap:.75rem;align-items:start">
          <label class="library-field" style="margin:0"><span>Contenido para trabajar con IA</span><textarea id="library-ai-content" rows="5" maxlength="12000" placeholder="Pega aquí un texto, apunte o fragmento del recurso. También puedes pulsar ‘Usar con IA’ en una tarjeta."></textarea></label>
          <div style="display:flex;flex-direction:column;gap:.65rem">
            <label class="library-field" style="margin:0"><span>Acción</span><select id="library-ai-action"><option value="resumir">Resumir contenido</option><option value="explicar">Explicar de forma sencilla</option><option value="preguntas">Crear preguntas</option><option value="actividad">Crear actividad</option><option value="guia">Preparar guía de estudio</option></select></label>
            <button id="library-ai-send" type="button" style="border:0;border-radius:14px;padding:.85rem 1rem;background:#4f46e5;color:#fff;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.5rem"><i class="fa-solid fa-sparkles"></i> Enviar a Gemini</button>
            <small style="color:#64748b;line-height:1.35">Modo gratuito: Gemini trabaja solo con el texto que tú le das. No abre enlaces ni lee archivos automáticamente.</small>
          </div>
        </div>
      </section>

      <section class="library-summary" id="library-summary"></section>

      <section class="library-workspace">
        <aside class="library-tools">
          <section class="library-panel">
            <header><span><i class="fa-solid fa-plus"></i></span><div><h3>Agregar material</h3><p>Guárdalo únicamente en tu cuenta.</p></div></header>
            <div class="library-action-grid">
              <button type="button" data-library-open-form="link"><i class="fa-solid fa-link"></i><span>Guardar enlace</span></button>
              <button type="button" data-library-open-form="file"><i class="fa-solid fa-file-arrow-up"></i><span>Subir archivo</span></button>
              <button type="button" data-library-open-form="note"><i class="fa-solid fa-note-sticky"></i><span>Nuevo apunte</span></button>
            </div>
          </section>

          <section class="library-panel">
            <header><span><i class="fa-solid fa-filter"></i></span><div><h3>Organizar</h3><p>Filtra tu colección.</p></div></header>
            <div class="library-filter-list">
              <button class="is-active" data-library-filter="Todos"><i class="fa-solid fa-layer-group"></i><span>Todos</span></button>
              <button data-library-filter="Favoritos"><i class="fa-solid fa-star"></i><span>Favoritos</span></button>
              <button data-library-filter="Archivo"><i class="fa-solid fa-file-pdf"></i><span>Archivos</span></button>
              <button data-library-filter="Enlace"><i class="fa-solid fa-link"></i><span>Enlaces</span></button>
              <button data-library-filter="Apunte"><i class="fa-solid fa-pen-to-square"></i><span>Apuntes</span></button>
              <button data-library-filter="Predeterminados"><i class="fa-solid fa-landmark"></i><span>Material oficial</span></button>
            </div>
          </section>
        </aside>

        <div class="library-main">
          <section class="library-collection-header">
            <div><span><i class="fa-solid fa-folder-open"></i></span><div><h3>Mi colección docente</h3><p>Material disponible para preparar tus clases.</p></div></div>
            <div class="library-collection-actions">
              <label><i class="fa-solid fa-magnifying-glass"></i><input id="library-local-search" type="search" placeholder="Buscar por título, área o etiqueta"></label>
              <button id="library-refresh" type="button"><i class="fa-solid fa-rotate"></i></button>
            </div>
          </section>
          <div id="library-content" class="library-grid">
            <div class="library-loading"><i class="fa-solid fa-circle-notch fa-spin"></i><strong>Cargando tu biblioteca…</strong></div>
          </div>
        </div>
      </section>

      <div id="library-modal" class="library-modal hidden" aria-hidden="true">
        <div class="library-modal__backdrop" data-library-close></div>
        <section class="library-modal__card" role="dialog" aria-modal="true" aria-labelledby="library-modal-title">
          <header><div><span id="library-modal-icon"><i class="fa-solid fa-plus"></i></span><div><small>Biblioteca digital</small><h3 id="library-modal-title">Agregar material</h3></div></div><button type="button" data-library-close><i class="fa-solid fa-xmark"></i></button></header>
          <form id="library-resource-form">
            <input id="library-form-type" type="hidden" value="Enlace">
            <div class="library-form-grid">
              <label class="library-field library-field--wide"><span>Título *</span><input id="library-title" required maxlength="160" placeholder="Nombre del libro, curso o apunte"></label>
              <label class="library-field"><span>Categoría</span><select id="library-category"><option>Libro y documento</option><option>Curso</option><option>Actividad</option><option>Normativa</option><option>Material pedagógico</option><option>Investigación</option><option>General</option></select></label>
              <label class="library-field"><span>Área</span><input id="library-area" maxlength="80" placeholder="Ej.: Ciencias Naturales"></label>
              <label class="library-field library-field--wide"><span>Descripción</span><textarea id="library-description" rows="3" maxlength="600" placeholder="¿Para qué usarás este material?"></textarea></label>
              <label class="library-field library-field--wide" id="library-url-field"><span>Enlace *</span><input id="library-url" type="url" placeholder="https://..."></label>
              <label class="library-field library-field--wide hidden" id="library-file-field"><span>Archivo *</span><input id="library-file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"><small>PDF, Word, PowerPoint o TXT. Máximo 10 MB.</small></label>
              <label class="library-field library-field--wide hidden" id="library-note-field"><span>Contenido del apunte *</span><textarea id="library-note" rows="8" maxlength="12000" placeholder="Escribe ideas, resumen de clase, referencias o actividades…"></textarea></label>
              <label class="library-field library-field--wide"><span>Etiquetas</span><input id="library-tags" maxlength="160" placeholder="Ej.: primer año, experimento, evaluación"></label>
              <label class="library-check"><input id="library-favorite" type="checkbox"><span><i class="fa-solid fa-star"></i> Guardar como favorito</span></label>
            </div>
            <footer><button type="button" data-library-close>Cancelar</button><button id="library-save" type="submit"><i class="fa-solid fa-cloud-arrow-up"></i><span>Guardar material</span></button></footer>
          </form>
        </section>
      </div>
    `;
    main.appendChild(section);

    tab.addEventListener('click', abrirBiblioteca);
    section.querySelector('#library-google-form')?.addEventListener('submit', e => abrirBusqueda(e, 'google'));
    section.querySelector('#library-youtube-form')?.addEventListener('submit', e => abrirBusqueda(e, 'youtube'));
    section.querySelector('#library-resource-form')?.addEventListener('submit', guardarRecurso);
    section.querySelector('#library-refresh')?.addEventListener('click', () => cargarBiblioteca(true));
    section.querySelector('#library-ai-send')?.addEventListener('click', enviarBibliotecaAGemini);
    section.querySelector('#library-local-search')?.addEventListener('input', e => {
      bibliotecaBusqueda = String(e.target.value || '').trim().toLowerCase();
      renderBiblioteca();
    });
    section.querySelectorAll('[data-library-filter]').forEach(btn => btn.addEventListener('click', () => {
      bibliotecaFiltro = btn.dataset.libraryFilter;
      section.querySelectorAll('[data-library-filter]').forEach(b => b.classList.toggle('is-active', b === btn));
      renderBiblioteca();
    }));
    section.querySelectorAll('[data-library-open-form]').forEach(btn => btn.addEventListener('click', () => abrirFormulario(btn.dataset.libraryOpenForm)));
    section.querySelectorAll('[data-library-close]').forEach(btn => btn.addEventListener('click', cerrarFormulario));
  }

  function abrirBusqueda(event, motor) {
    event.preventDefault();
    const input = document.getElementById(motor === 'google' ? 'library-google-query' : 'library-youtube-query');
    const tema = String(input?.value || '').trim();
    if (!tema) {
      mostrarToast('Escribe un tema para realizar la búsqueda.', 'warning', 'Tema requerido');
      input?.focus();
      return;
    }
    const url = motor === 'google'
      ? `https://www.google.com/search?q=${encodeURIComponent(tema + ' material educativo')}`
      : `https://www.youtube.com/results?search_query=${encodeURIComponent(tema + ' clase educativa')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function abrirBiblioteca() {
    if (String(profesorActual?.rol || '').toLowerCase() === 'director') {
      mostrarToast('La biblioteca digital pertenece a las cuentas docentes.', 'warning', 'Acceso docente');
      return;
    }
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('is-active');
      item.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('#app-main > section').forEach(s => s.classList.add('hidden'));
    document.getElementById(LIB_IDS.tab)?.classList.add('is-active');
    document.getElementById(LIB_IDS.tab)?.setAttribute('aria-selected', 'true');
    document.getElementById(LIB_IDS.section)?.classList.remove('hidden');
    if (pageTitle) pageTitle.textContent = 'Biblioteca digital';
    if (pageDescription) pageDescription.textContent = 'Libros, cursos, enlaces, archivos y apuntes para tus clases.';
    window.scrollTo({top:0,behavior:'smooth'});
    await cargarBiblioteca(false);
  }

  async function cargarBiblioteca(forzar = false) {
    if (bibliotecaDatos && !forzar) {
      renderBiblioteca();
      return;
    }
    const content = document.getElementById('library-content');
    const refresh = document.getElementById('library-refresh');
    if (content) content.innerHTML = '<div class="library-loading"><i class="fa-solid fa-circle-notch fa-spin"></i><strong>Cargando tu biblioteca…</strong></div>';
    refresh?.classList.add('is-loading');
    try {
      bibliotecaDatos = await apiRequest('obtenerBiblioteca');
      renderBiblioteca();
    } catch (error) {
      if (content) content.innerHTML = `<div class="library-empty"><i class="fa-solid fa-triangle-exclamation"></i><strong>No se pudo cargar la biblioteca</strong><span>${escLib(error.message)}</span></div>`;
      mostrarToast(error.message || 'No se pudo cargar la biblioteca.', 'error', 'Biblioteca no disponible');
    } finally {
      refresh?.classList.remove('is-loading');
    }
  }

  function renderResumen() {
    const target = document.getElementById('library-summary');
    if (!target || !bibliotecaDatos) return;
    const r = bibliotecaDatos.resumen || {};
    target.innerHTML = `
      <article><span><i class="fa-solid fa-book"></i></span><div><strong>${r.total || 0}</strong><small>Recursos propios</small></div></article>
      <article><span><i class="fa-solid fa-file-arrow-up"></i></span><div><strong>${r.archivos || 0}</strong><small>Archivos en Drive</small></div></article>
      <article><span><i class="fa-solid fa-link"></i></span><div><strong>${r.enlaces || 0}</strong><small>Enlaces guardados</small></div></article>
      <article><span><i class="fa-solid fa-note-sticky"></i></span><div><strong>${r.apuntes || 0}</strong><small>Apuntes digitales</small></div></article>
      <article><span><i class="fa-solid fa-star"></i></span><div><strong>${r.favoritos || 0}</strong><small>Favoritos</small></div></article>`;
  }

  function recursosFiltrados() {
    if (!bibliotecaDatos) return [];
    const propios = (bibliotecaDatos.recursos || []).map(x => ({...x, predeterminado:false}));
    const defaults = (bibliotecaDatos.predeterminados || []).map(x => ({...x, predeterminado:true}));
    let items = [...defaults, ...propios];

    if (bibliotecaFiltro === 'Favoritos') items = items.filter(x => x.favorito);
    else if (bibliotecaFiltro === 'Predeterminados') items = items.filter(x => x.predeterminado);
    else if (bibliotecaFiltro !== 'Todos') items = items.filter(x => x.tipo === bibliotecaFiltro);

    if (bibliotecaBusqueda) {
      items = items.filter(x => [x.titulo,x.categoria,x.area,x.descripcion,x.etiquetas,x.apunte,x.fuente]
        .join(' ').toLowerCase().includes(bibliotecaBusqueda));
    }
    return items;
  }

  function iconoRecurso(recurso) {
    if (recurso.predeterminado) return 'fa-landmark';
    if (recurso.tipo === 'Archivo') return recurso.mimeType === 'application/pdf' ? 'fa-file-pdf' : 'fa-file';
    if (recurso.tipo === 'Apunte') return 'fa-note-sticky';
    if (recurso.categoria === 'Curso') return 'fa-graduation-cap';
    return 'fa-link';
  }

  function renderBiblioteca() {
    renderResumen();
    const content = document.getElementById('library-content');
    if (!content || !bibliotecaDatos) return;
    const items = recursosFiltrados();
    if (!items.length) {
      content.innerHTML = '<div class="library-empty"><i class="fa-solid fa-folder-open"></i><strong>No hay recursos en esta vista</strong><span>Agrega un enlace, sube un archivo o crea un apunte.</span></div>';
      return;
    }

    content.innerHTML = items.map(r => `
      <article class="library-resource ${r.predeterminado ? 'is-default' : ''}">
        <header>
          <span><i class="fa-solid ${iconoRecurso(r)}"></i></span>
          <div><small>${escLib(r.categoria || r.tipo)}</small><h4>${escLib(r.titulo)}</h4></div>
          ${r.predeterminado ? '<em>Recomendado</em>' : `<button type="button" data-library-favorite="${escLib(r.id)}" class="${r.favorito ? 'is-active' : ''}" title="Favorito"><i class="fa-solid fa-star"></i></button>`}
        </header>
        <p>${escLib(r.descripcion || (r.tipo === 'Apunte' ? String(r.apunte || '').slice(0,180) : 'Recurso disponible para tus clases.'))}</p>
        <div class="library-resource__meta">
          ${r.area ? `<span><i class="fa-solid fa-shapes"></i>${escLib(r.area)}</span>` : ''}
          ${r.fuente ? `<span><i class="fa-solid fa-building-columns"></i>${escLib(r.fuente)}</span>` : ''}
          ${r.archivoNombre ? `<span><i class="fa-solid fa-paperclip"></i>${escLib(r.archivoNombre)}</span>` : ''}
        </div>
        ${r.tipo === 'Apunte' ? `<details><summary>Leer apunte completo</summary><div>${escLib(r.apunte).replace(/\n/g,'<br>')}</div></details>` : ''}
        <footer>
          ${r.url ? `<a href="${escLib(r.url)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square"></i>${r.tipo === 'Archivo' ? 'Abrir archivo' : 'Consultar recurso'}</a>` : '<span></span>'}
          <button type="button" data-library-ai="${escLib(r.id || r.titulo || '')}" data-library-ai-default="${r.predeterminado ? '1' : '0'}" title="Usar este recurso con Gemini"><i class="fa-solid fa-wand-magic-sparkles"></i></button>
          ${r.predeterminado ? '' : `<button type="button" data-library-delete="${escLib(r.id)}"><i class="fa-solid fa-trash"></i></button>`}
        </footer>
      </article>`).join('');

    content.querySelectorAll('[data-library-favorite]').forEach(btn => btn.addEventListener('click', () => alternarFavorito(btn.dataset.libraryFavorite)));
    content.querySelectorAll('[data-library-delete]').forEach(btn => btn.addEventListener('click', () => eliminarRecurso(btn.dataset.libraryDelete)));
    content.querySelectorAll('[data-library-ai]').forEach(btn => btn.addEventListener('click', () => cargarRecursoEnIA(btn.dataset.libraryAi, btn.dataset.libraryAiDefault === '1')));
  }

  function encontrarRecursoBiblioteca(id, predeterminado = false) {
    if (!bibliotecaDatos) return null;
    const lista = predeterminado ? (bibliotecaDatos.predeterminados || []) : (bibliotecaDatos.recursos || []);
    return lista.find(x => String(x.id || x.titulo || '') === String(id || '')) || null;
  }

  function textoRecursoParaIA(recurso) {
    if (!recurso) return '';
    const partes = [];
    if (recurso.titulo) partes.push(`Título: ${recurso.titulo}`);
    if (recurso.area) partes.push(`Área: ${recurso.area}`);
    if (recurso.categoria) partes.push(`Categoría: ${recurso.categoria}`);
    if (recurso.descripcion) partes.push(`Descripción: ${recurso.descripcion}`);
    if (recurso.apunte) partes.push(`Contenido del apunte:
${recurso.apunte}`);
    if (recurso.etiquetas) partes.push(`Etiquetas: ${recurso.etiquetas}`);
    return partes.join('\n\n').trim();
  }

  function cargarRecursoEnIA(id, predeterminado = false) {
    const recurso = encontrarRecursoBiblioteca(id, predeterminado);
    if (!recurso) return mostrarToast('No se pudo cargar ese recurso.', 'warning', 'Biblioteca con IA');
    const textarea = document.getElementById('library-ai-content');
    if (!textarea) return;
    textarea.value = textoRecursoParaIA(recurso);
    textarea.focus();
    document.getElementById('library-ai-tools')?.scrollIntoView({behavior:'smooth', block:'center'});
    const aviso = recurso.tipo === 'Apunte' ? 'Apunte cargado. Ya puedes trabajarlo con Gemini.' : 'Se cargaron los datos guardados. Para trabajar el contenido completo, pega también un fragmento del documento o enlace.';
    mostrarToast(aviso, 'success', 'Biblioteca con IA');
  }

  function enviarBibliotecaAGemini() {
    const contenido = String(document.getElementById('library-ai-content')?.value || '').trim();
    const accion = String(document.getElementById('library-ai-action')?.value || 'resumir');
    if (!contenido) { mostrarToast('Pega un texto o usa un recurso antes de consultar Gemini.', 'warning', 'Biblioteca con IA'); return; }
    const instrucciones = {
      resumir:'Resume el contenido en español, de forma clara y fiel. Organiza las ideas principales y no inventes información que no esté en el texto.',
      explicar:'Explica el contenido en español con lenguaje sencillo para estudiantes. Puedes usar ejemplos, pero distingue los ejemplos de la información original.',
      preguntas:'Crea preguntas de comprensión y repaso basadas únicamente en el contenido e incluye respuestas sugeridas.',
      actividad:'Crea una actividad educativa práctica basada en el contenido, con objetivo, materiales, inicio, desarrollo, cierre y evaluación formativa.',
      guia:'Prepara una guía de estudio con conceptos clave, resumen por puntos, preguntas de repaso y una actividad final.'
    };
    const prompt = `${instrucciones[accion] || instrucciones.resumir}\n\nContenido proporcionado por el docente:\n${contenido}\n\nTrabaja únicamente con este material. Si falta información, indícalo claramente. No realices búsqueda web.`;
    const tabIA=document.getElementById('tab-gemini'), inputIA=document.getElementById('gemini-input'), formIA=document.getElementById('gemini-form');
    if (!tabIA || !inputIA || !formIA) return mostrarToast('No se pudo abrir el Asistente IA.', 'warning', 'Biblioteca con IA');
    tabIA.click(); inputIA.value=prompt;
    setTimeout(() => { inputIA.focus(); if (typeof formIA.requestSubmit === 'function') formIA.requestSubmit(); else formIA.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); }, 180);
  }

  function abrirFormulario(modo) {
    const modal = document.getElementById('library-modal');
    const type = document.getElementById('library-form-type');
    const title = document.getElementById('library-modal-title');
    const urlField = document.getElementById('library-url-field');
    const fileField = document.getElementById('library-file-field');
    const noteField = document.getElementById('library-note-field');
    const form = document.getElementById('library-resource-form');
    form?.reset();

    const config = {
      link: ['Enlace','Guardar enlace o curso'],
      file: ['Archivo','Subir libro o material'],
      note: ['Apunte','Crear apunte digital']
    }[modo] || ['Enlace','Agregar material'];

    if (type) type.value = config[0];
    if (title) title.textContent = config[1];
    urlField?.classList.toggle('hidden', modo !== 'link');
    fileField?.classList.toggle('hidden', modo !== 'file');
    noteField?.classList.toggle('hidden', modo !== 'note');
    document.getElementById('library-url')?.toggleAttribute('required', modo === 'link');
    document.getElementById('library-file')?.toggleAttribute('required', modo === 'file');
    document.getElementById('library-note')?.toggleAttribute('required', modo === 'note');
    const area = document.getElementById('library-area');
    if (area) area.value = profesorActual?.materia || '';

    modal?.classList.remove('hidden');
    modal?.setAttribute('aria-hidden','false');
    document.body.classList.add('library-modal-open');
    setTimeout(() => document.getElementById('library-title')?.focus(), 50);
  }

  function cerrarFormulario() {
    const modal = document.getElementById('library-modal');
    modal?.classList.add('hidden');
    modal?.setAttribute('aria-hidden','true');
    document.body.classList.remove('library-modal-open');
  }

  function archivoBase64(file) {
    return new Promise((resolve,reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
      reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
      reader.readAsDataURL(file);
    });
  }

  async function guardarRecurso(event) {
    event.preventDefault();
    const tipo = document.getElementById('library-form-type')?.value || 'Enlace';
    const save = document.getElementById('library-save');
    const payload = {
      tipo,
      titulo: document.getElementById('library-title')?.value.trim(),
      categoria: document.getElementById('library-category')?.value,
      area: document.getElementById('library-area')?.value.trim(),
      descripcion: document.getElementById('library-description')?.value.trim(),
      etiquetas: document.getElementById('library-tags')?.value.trim(),
      url: document.getElementById('library-url')?.value.trim(),
      apunte: document.getElementById('library-note')?.value.trim(),
      favorito: document.getElementById('library-favorite')?.checked
    };

    save?.classList.add('is-loading');
    save?.setAttribute('disabled','disabled');
    try {
      if (tipo === 'Archivo') {
        const file = document.getElementById('library-file')?.files?.[0];
        if (!file) throw new Error('Selecciona un archivo.');
        if (file.size > 10 * 1024 * 1024) throw new Error('El archivo supera el límite de 10 MB.');
        payload.archivoNombre = file.name;
        payload.mimeType = file.type || 'application/octet-stream';
        payload.base64 = await archivoBase64(file);
        await apiRequest('subirArchivoBiblioteca', payload);
      } else {
        await apiRequest('guardarRecursoBiblioteca', payload);
      }
      cerrarFormulario();
      bibliotecaDatos = null;
      await cargarBiblioteca(true);
      mostrarToast('El material quedó guardado en tu biblioteca.', 'success', 'Biblioteca actualizada');
    } catch (error) {
      mostrarToast(error.message || 'No se pudo guardar el material.', 'error', 'No se guardó');
    } finally {
      save?.classList.remove('is-loading');
      save?.removeAttribute('disabled');
    }
  }

  async function alternarFavorito(id) {
    try {
      await apiRequest('alternarFavoritoBiblioteca', {id});
      bibliotecaDatos = null;
      await cargarBiblioteca(true);
    } catch (error) {
      mostrarToast(error.message, 'error', 'No se actualizó');
    }
  }

  async function eliminarRecurso(id) {
    if (!window.confirm('¿Eliminar este recurso de tu biblioteca?')) return;
    try {
      await apiRequest('eliminarRecursoBiblioteca', {id});
      bibliotecaDatos = null;
      await cargarBiblioteca(true);
      mostrarToast('Recurso eliminado.', 'success');
    } catch (error) {
      mostrarToast(error.message, 'error', 'No se eliminó');
    }
  }

  crearBibliotecaDigital();
  window.addEventListener('DOMContentLoaded', crearBibliotecaDigital);


/* =========================================================
   ASISTENCIA DEL PROFESOR
   ========================================================= */
(() => {
  const IDS = { tab:'tab-asistencia-docente', section:'section-asistencia-docente' };
  let dataAsistenciaDocente = null;

  const escAD = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const horasTexto = minutos => {
    const n = Math.max(0, Number(minutos) || 0);
    const h = Math.floor(n / 60);
    const m = n % 60;
    return `${h} h ${String(m).padStart(2,'0')} min`;
  };

  function crearSeccion() {
    if (document.getElementById(IDS.tab)) return;
    const nav = document.getElementById('app-nav');
    const main = document.getElementById('app-main');
    if (!nav || !main) return;

    const tab = document.createElement('button');
    tab.id = IDS.tab;
    tab.type = 'button';
    tab.className = 'nav-item';
    tab.setAttribute('aria-selected','false');
    tab.dataset.title = 'Mi asistencia laboral';
    tab.dataset.description = 'Registra tu llegada, salida, ausencias y horas trabajadas.';
    tab.innerHTML = '<i class="fa-solid fa-business-time"></i><span>Mi asistencia laboral</span>';

    const horario = nav.querySelector('#tab-horario');
    if (horario?.nextSibling) nav.insertBefore(tab, horario.nextSibling);
    else nav.appendChild(tab);

    const section = document.createElement('section');
    section.id = IDS.section;
    section.className = 'hidden teacher-work-attendance';
    section.innerHTML = `
      <header class="platform-hero teacher-attendance-hero">
        <div class="platform-hero__copy">
          <span class="platform-hero__eyebrow"><i class="fa-solid fa-fingerprint"></i> Registro personal del docente</span>
          <h2>Mi asistencia laboral</h2>
          <p>Registra la hora de llegada, la hora de salida o informa una ausencia. Consulta tus días y horas trabajadas.</p>
          <div class="platform-hero__badges">
            <span><i class="fa-solid fa-clock"></i> Llegada y salida</span>
            <span><i class="fa-solid fa-calendar-check"></i> Resumen semanal y mensual</span>
            <span><i class="fa-brands fa-telegram"></i> Disponible en Telegram</span>
          </div>
        </div>
        <div class="platform-hero__icon"><i class="fa-solid fa-user-clock"></i></div>
      </header>

      <section class="teacher-clock-card">
        <div class="teacher-clock-card__date"><small>Fecha y hora actual</small><strong id="teacher-clock-date">—</strong><time id="teacher-clock-time">--:--:--</time></div>
        <div class="teacher-clock-card__status" id="teacher-attendance-status"><i class="fa-solid fa-circle-info"></i><div><small>Estado de hoy</small><strong>Sin registro</strong><span>Registra tu llegada o una ausencia.</span></div></div>
        <div class="teacher-clock-actions">
          <button id="teacher-register-arrival" type="button"><i class="fa-solid fa-right-to-bracket"></i><span><strong>Registrar llegada</strong><small>Guardar la hora actual</small></span></button>
          <button id="teacher-register-exit" type="button"><i class="fa-solid fa-right-from-bracket"></i><span><strong>Registrar salida</strong><small>Calcular horas trabajadas</small></span></button>
          <button id="teacher-register-absence" type="button"><i class="fa-solid fa-user-xmark"></i><span><strong>No asistiré</strong><small>Informar el motivo</small></span></button>
        </div>
      </section>

      <section class="teacher-hours-summary" id="teacher-hours-summary"></section>

      <section class="teacher-attendance-layout">
        <section class="teacher-attendance-panel">
          <header><div><span><i class="fa-solid fa-chart-column"></i></span><div><h3>Horas de clase registradas</h3><p>Promedios calculados con tus entradas y salidas.</p></div></div></header>
          <div id="teacher-hours-chart" class="teacher-hours-chart"></div>
        </section>
        <section class="teacher-attendance-panel">
          <header><div><span><i class="fa-solid fa-clock-rotate-left"></i></span><div><h3>Historial reciente</h3><p>Últimos registros de asistencia laboral.</p></div></div></header>
          <div id="teacher-attendance-history"></div>
        </section>
      </section>

      <div class="teacher-absence-modal hidden" id="teacher-absence-modal" aria-hidden="true">
        <div class="teacher-absence-modal__backdrop" data-close-teacher-absence></div>
        <form class="teacher-absence-modal__card" id="teacher-absence-form">
          <header><span><i class="fa-solid fa-user-xmark"></i></span><div><small>Registro de ausencia</small><h3>¿Por qué no asistirás?</h3></div><button type="button" data-close-teacher-absence><i class="fa-solid fa-xmark"></i></button></header>
          <label><span>Fecha</span><input id="teacher-absence-date" type="date" required></label>
          <label><span>Motivo *</span><textarea id="teacher-absence-reason" rows="5" maxlength="600" required placeholder="Ej.: reposo médico, emergencia familiar, trámite institucional…"></textarea></label>
          <footer><button type="button" data-close-teacher-absence>Cancelar</button><button type="submit"><i class="fa-solid fa-floppy-disk"></i> Guardar ausencia</button></footer>
        </form>
      </div>
    `;
    main.appendChild(section);

    tab.addEventListener('click', abrir);
    section.querySelector('#teacher-register-arrival')?.addEventListener('click', registrarLlegada);
    section.querySelector('#teacher-register-exit')?.addEventListener('click', registrarSalida);
    section.querySelector('#teacher-register-absence')?.addEventListener('click', abrirAusencia);
    section.querySelector('#teacher-absence-form')?.addEventListener('submit', guardarAusencia);
    section.querySelectorAll('[data-close-teacher-absence]').forEach(b => b.addEventListener('click', cerrarAusencia));
    iniciarReloj();
  }

  function iniciarReloj() {
    const tick = () => {
      const ahora = new Date();
      const date = document.getElementById('teacher-clock-date');
      const time = document.getElementById('teacher-clock-time');
      if (date) date.textContent = ahora.toLocaleDateString('es-VE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
      if (time) time.textContent = ahora.toLocaleTimeString('es-VE',{hour12:false});
    };
    tick();
    setInterval(tick,1000);
  }

  async function abrir() {
    if (String(profesorActual?.rol || '').toLowerCase() === 'director') return;
    document.querySelectorAll('.nav-item').forEach(i => { i.classList.remove('is-active'); i.setAttribute('aria-selected','false'); });
    document.querySelectorAll('#app-main > section').forEach(s => s.classList.add('hidden'));
    document.getElementById(IDS.tab)?.classList.add('is-active');
    document.getElementById(IDS.tab)?.setAttribute('aria-selected','true');
    document.getElementById(IDS.section)?.classList.remove('hidden');
    if (pageTitle) pageTitle.textContent = 'Mi asistencia laboral';
    if (pageDescription) pageDescription.textContent = 'Entradas, salidas, ausencias y horas trabajadas.';
    window.scrollTo({top:0,behavior:'smooth'});
    await cargar(true);
  }

  async function cargar(forzar=false) {
    if (dataAsistenciaDocente && !forzar) return render();
    try {
      dataAsistenciaDocente = await apiRequest('obtenerAsistenciaDocente');
      render();
    } catch (error) {
      mostrarToast(error.message || 'No se pudo cargar la asistencia docente.','error','Error');
    }
  }

  function render() {
    if (!dataAsistenciaDocente) return;
    const hoy = dataAsistenciaDocente.hoy || {};
    const status = document.getElementById('teacher-attendance-status');
    const llegada = document.getElementById('teacher-register-arrival');
    const salida = document.getElementById('teacher-register-exit');
    const ausencia = document.getElementById('teacher-register-absence');

    if (hoy.estado === 'Ausente') {
      status.className = 'teacher-clock-card__status is-absent';
      status.innerHTML = `<i class="fa-solid fa-user-xmark"></i><div><small>Estado de hoy</small><strong>Ausente</strong><span>${escAD(hoy.motivoAusencia || 'Motivo registrado')}</span></div>`;
    } else if (hoy.horaSalida) {
      status.className = 'teacher-clock-card__status is-complete';
      status.innerHTML = `<i class="fa-solid fa-circle-check"></i><div><small>Jornada completada</small><strong>${escAD(hoy.horaLlegada)} – ${escAD(hoy.horaSalida)}</strong><span>${horasTexto(hoy.minutosTrabajados)}</span></div>`;
    } else if (hoy.horaLlegada) {
      status.className = 'teacher-clock-card__status is-present';
      status.innerHTML = `<i class="fa-solid fa-person-walking-arrow-right"></i><div><small>Entrada registrada</small><strong>Desde las ${escAD(hoy.horaLlegada)}</strong><span>Registra tu salida al finalizar.</span></div>`;
    } else {
      status.className = 'teacher-clock-card__status';
      status.innerHTML = '<i class="fa-solid fa-circle-info"></i><div><small>Estado de hoy</small><strong>Sin registro</strong><span>Registra tu llegada o una ausencia.</span></div>';
    }

    if (llegada) llegada.disabled = Boolean(hoy.horaLlegada || hoy.estado === 'Ausente');
    if (salida) salida.disabled = Boolean(!hoy.horaLlegada || hoy.horaSalida || hoy.estado === 'Ausente');
    if (ausencia) ausencia.disabled = Boolean(hoy.horaLlegada || hoy.estado === 'Ausente');

    const r = dataAsistenciaDocente.resumen || {};
    const summary = document.getElementById('teacher-hours-summary');
    if (summary) summary.innerHTML = [
      ['fa-sun',r.dia,'Hoy'],
      ['fa-calendar-week',r.semana,'Esta semana'],
      ['fa-calendar-days',r.mes,'Este mes']
    ].map(([icon,x,label]) => `<article><span><i class="fa-solid ${icon}"></i></span><div><small>${label}</small><strong>${Number(x?.horas||0).toFixed(1)} h</strong><em>${x?.diasTrabajados||0} días · Promedio ${Number(x?.promedioHorasDia||0).toFixed(1)} h/día</em></div></article>`).join('');

    const chart = document.getElementById('teacher-hours-chart');
    if (chart) {
      const max = Math.max(1, ...(dataAsistenciaDocente.registros||[]).slice(0,7).map(x=>Number(x.minutosTrabajados||0)));
      chart.innerHTML = (dataAsistenciaDocente.registros||[]).filter(x=>x.estado==='Presente').slice(0,7).reverse().map(x => `<article><div><span>${escAD(x.fecha)}</span><strong>${horasTexto(x.minutosTrabajados)}</strong></div><progress max="${max}" value="${Number(x.minutosTrabajados||0)}"></progress></article>`).join('') || '<div class="teacher-attendance-empty">Aún no hay jornadas completas para graficar.</div>';
    }

    const history = document.getElementById('teacher-attendance-history');
    if (history) history.innerHTML = (dataAsistenciaDocente.registros||[]).slice(0,12).map(x => `<article class="${x.estado==='Ausente'?'is-absent':''}"><span><i class="fa-solid ${x.estado==='Ausente'?'fa-user-xmark':'fa-user-clock'}"></i></span><div><strong>${escAD(x.fecha)} · ${escAD(x.estado)}</strong><small>${x.estado==='Ausente'?escAD(x.motivoAusencia):`${escAD(x.horaLlegada||'—')} – ${escAD(x.horaSalida||'Pendiente')}`}</small></div><em>${x.estado==='Ausente'?'0 h':horasTexto(x.minutosTrabajados)}</em></article>`).join('') || '<div class="teacher-attendance-empty">No hay registros todavía.</div>';
  }

  async function accion(action, mensaje) {
    try {
      await apiRequest(action);
      dataAsistenciaDocente = null;
      await cargar(true);
      mostrarToast(mensaje,'success','Registro guardado');
    } catch(error) {
      mostrarToast(error.message || 'No se pudo guardar.','error','Error');
    }
  }
  function registrarLlegada(){ accion('registrarLlegadaDocente','Hora de llegada registrada.'); }
  function registrarSalida(){ accion('registrarSalidaDocente','Hora de salida registrada.'); }

  function abrirAusencia(){
    const modal=document.getElementById('teacher-absence-modal');
    const date=document.getElementById('teacher-absence-date');
    if(date) date.value=new Date().toISOString().slice(0,10);
    modal?.classList.remove('hidden'); modal?.setAttribute('aria-hidden','false');
  }
  function cerrarAusencia(){
    const modal=document.getElementById('teacher-absence-modal');
    modal?.classList.add('hidden'); modal?.setAttribute('aria-hidden','true');
  }
  async function guardarAusencia(e){
    e.preventDefault();
    try {
      await apiRequest('registrarAusenciaDocente',{
        fecha:document.getElementById('teacher-absence-date')?.value,
        motivo:document.getElementById('teacher-absence-reason')?.value.trim()
      });
      cerrarAusencia(); dataAsistenciaDocente=null; await cargar(true);
      mostrarToast('Ausencia registrada.','success','Registro guardado');
    } catch(error){ mostrarToast(error.message,'error','No se guardó'); }
  }

  crearSeccion();
  window.addEventListener('DOMContentLoaded',crearSeccion);
})();


})();


})();

/* EDUGESTION_AUDIT_PANEL_V1_START */
(() => {
  const IDS = Object.freeze({
    tab: 'tab-auditoria',
    section: 'section-auditoria',
    body: 'auditoria-tabla-body',
    cards: 'auditoria-mobile-list',
    search: 'auditoria-buscar',
    date: 'auditoria-fecha',
    origin: 'auditoria-origen',
    sectionFilter: 'auditoria-seccion',
    count: 'auditoria-conteo',
    empty: 'auditoria-vacio',
    loading: 'auditoria-cargando'
  });

  let registrosAuditoria = [];
  let cargandoAuditoria = false;

  function htmlSeguro(valor = '') {
    if (typeof escaparHTML === 'function') return escaparHTML(valor);
    return String(valor).replace(/[&<>'"]/g, caracter => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[caracter]));
  }

  function crearInterfazAuditoria() {
    if (document.getElementById(IDS.tab) || document.getElementById(IDS.section)) return;
    const tabHorarioExistente = document.getElementById('tab-horario');
    const navegacion = tabHorarioExistente?.parentElement;
    const principal = document.getElementById('app-main');
    if (!navegacion || !principal) return;

    const tab = document.createElement('button');
    tab.id = IDS.tab;
    tab.type = 'button';
    tab.className = 'nav-item';
    tab.setAttribute('aria-selected', 'false');
    tab.dataset.title = 'Auditoría de asistencia';
    tab.dataset.description = 'Consulta quién modificó cada registro, desde dónde y qué estado cambió.';
    tab.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i><span>Auditoría</span>';
    tabHorarioExistente.insertAdjacentElement('afterend', tab);

    const section = document.createElement('section');
    section.id = IDS.section;
    section.className = 'hidden max-w-[1400px] mx-auto space-y-6 audit-panel';
    section.innerHTML = `
      <section class="audit-hero">
        <div>
          <span class="audit-eyebrow"><i class="fa-solid fa-shield-halved"></i> Trazabilidad segura</span>
          <h2>Historial de cambios de asistencia</h2>
          <p>Revisa las modificaciones realizadas desde EduGestión Web y desde el bot de Telegram.</p>
        </div>
        <div class="audit-hero__actions">
          <button id="auditoria-exportar" type="button" class="audit-button audit-button--secondary">
            <i class="fa-solid fa-file-csv"></i> Exportar CSV
          </button>
          <button id="auditoria-actualizar" type="button" class="audit-button audit-button--primary">
            <i class="fa-solid fa-rotate"></i> Actualizar
          </button>
        </div>
      </section>

      <section class="audit-metrics" aria-label="Resumen de auditoría">
        <article class="audit-metric audit-metric--total">
          <span><i class="fa-solid fa-list-check"></i></span>
          <div><strong id="auditoria-total">0</strong><small>Cambios registrados</small></div>
        </article>
        <article class="audit-metric audit-metric--web">
          <span><i class="fa-solid fa-display"></i></span>
          <div><strong id="auditoria-web">0</strong><small>Desde la web</small></div>
        </article>
        <article class="audit-metric audit-metric--telegram">
          <span><i class="fa-brands fa-telegram"></i></span>
          <div><strong id="auditoria-telegram">0</strong><small>Desde Telegram</small></div>
        </article>
        <article class="audit-metric audit-metric--today">
          <span><i class="fa-regular fa-calendar-check"></i></span>
          <div><strong id="auditoria-hoy">0</strong><small>Cambios de hoy</small></div>
        </article>
      </section>

      <section class="audit-filter-card">
        <div class="audit-filter-card__title">
          <div>
            <span><i class="fa-solid fa-filter"></i></span>
            <div><strong>Filtros del historial</strong><small>Combina criterios para localizar un cambio específico.</small></div>
          </div>
          <button id="auditoria-limpiar" type="button"><i class="fa-solid fa-eraser"></i> Limpiar filtros</button>
        </div>
        <div class="audit-filters">
          <label class="audit-search audit-field--wide">
            <span>Buscar</span>
            <div><i class="fa-solid fa-magnifying-glass"></i><input id="${IDS.search}" type="search" placeholder="Estudiante, materia, docente o acción"></div>
          </label>
          <label class="audit-field">
            <span>Fecha de asistencia</span>
            <input id="${IDS.date}" type="date">
          </label>
          <label class="audit-field">
            <span>Origen</span>
            <select id="${IDS.origin}">
              <option value="">Todos</option>
              <option value="Web">Web</option>
              <option value="Telegram">Telegram</option>
            </select>
          </label>
          <label class="audit-field">
            <span>Sección</span>
            <select id="${IDS.sectionFilter}"><option value="">Todas</option></select>
          </label>
        </div>
      </section>

      <section class="audit-history-card">
        <div class="audit-history-card__header">
          <div>
            <span class="audit-history-icon"><i class="fa-solid fa-timeline"></i></span>
            <div><h3>Movimientos registrados</h3><p>Del más reciente al más antiguo.</p></div>
          </div>
          <span id="${IDS.count}" class="audit-count">0 registros</span>
        </div>

        <div id="${IDS.loading}" class="audit-status hidden">
          <i class="fa-solid fa-circle-notch fa-spin"></i><strong>Cargando historial…</strong>
          <span>Consultando los cambios guardados en la institución.</span>
        </div>
        <div id="${IDS.empty}" class="audit-status hidden">
          <i class="fa-solid fa-inbox"></i><strong>No hay resultados</strong>
          <span>Cambia los filtros o registra una modificación de asistencia.</span>
        </div>

        <div class="audit-table-wrap">
          <table class="audit-table">
            <thead><tr><th>Fecha y hora</th><th>Estudiante y clase</th><th>Origen y responsable</th><th>Cambio realizado</th></tr></thead>
            <tbody id="${IDS.body}"></tbody>
          </table>
        </div>
        <div id="${IDS.cards}" class="audit-mobile-list"></div>
      </section>`;
    principal.appendChild(section);

    tab.addEventListener('click', abrirAuditoria);
    ['tab-asistencia', 'tab-planificacion', 'tab-actas', 'tab-registro', 'tab-horario', 'tab-calendario'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', cerrarAuditoria, { capture: true });
    });
    document.getElementById('auditoria-actualizar')?.addEventListener('click', () => cargarAuditoria(true));
    document.getElementById('auditoria-exportar')?.addEventListener('click', exportarAuditoriaCsv);
    document.getElementById('auditoria-limpiar')?.addEventListener('click', limpiarFiltrosAuditoria);
    [IDS.search, IDS.date, IDS.origin, IDS.sectionFilter].forEach(id => {
      const control = document.getElementById(id);
      control?.addEventListener(id === IDS.search ? 'input' : 'change', renderAuditoria);
    });
  }

  function cerrarAuditoria() {
    document.getElementById(IDS.tab)?.classList.remove('is-active');
    document.getElementById(IDS.tab)?.setAttribute('aria-selected', 'false');
    document.getElementById(IDS.section)?.classList.add('hidden');
  }

  async function abrirAuditoria() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('is-active');
      item.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('#app-main > section').forEach(item => item.classList.add('hidden'));
    const tab = document.getElementById(IDS.tab);
    const section = document.getElementById(IDS.section);
    tab?.classList.add('is-active');
    tab?.setAttribute('aria-selected', 'true');
    section?.classList.remove('hidden');
    if (typeof pageTitle !== 'undefined' && pageTitle) pageTitle.textContent = 'Auditoría de asistencia';
    if (typeof pageDescription !== 'undefined' && pageDescription) pageDescription.textContent = 'Consulta quién modificó cada registro, desde dónde y qué estado cambió.';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await cargarAuditoria(false);
  }

  function mostrarEstadoAuditoria(tipo) {
    const loading = document.getElementById(IDS.loading);
    const empty = document.getElementById(IDS.empty);
    loading?.classList.toggle('hidden', tipo !== 'loading');
    empty?.classList.toggle('hidden', tipo !== 'empty');
  }

  async function cargarAuditoria(forzar = false) {
    if (cargandoAuditoria || (registrosAuditoria.length && !forzar)) {
      renderAuditoria();
      return;
    }
    if (typeof sessionToken === 'undefined' || !sessionToken) {
      mostrarEstadoAuditoria('empty');
      return;
    }
    cargandoAuditoria = true;
    mostrarEstadoAuditoria('loading');
    document.getElementById('auditoria-actualizar')?.classList.add('is-loading');
    try {
      const respuesta = await apiRequest('obtenerAuditoriaAsistencia', { limite: 300 });
      registrosAuditoria = Array.isArray(respuesta.auditoria) ? respuesta.auditoria : [];
      llenarSeccionesAuditoria();
      actualizarMetricasAuditoria();
      renderAuditoria();
      if (forzar && typeof mostrarToast === 'function') mostrarToast('El historial se actualizó correctamente.', 'success', 'Auditoría actualizada');
    } catch (error) {
      console.error('No se pudo cargar la auditoría:', error);
      registrosAuditoria = [];
      renderAuditoria();
      if (typeof mostrarToast === 'function') mostrarToast(error.message || 'No se pudo consultar el historial.', 'error', 'Error de auditoría');
    } finally {
      cargandoAuditoria = false;
      document.getElementById('auditoria-actualizar')?.classList.remove('is-loading');
    }
  }

  function llenarSeccionesAuditoria() {
    const select = document.getElementById(IDS.sectionFilter);
    if (!select) return;
    const actual = select.value;
    const opciones = [...new Set(registrosAuditoria.map(r => `${r.ano || ''}|${r.seccion || ''}|${r.turno || ''}`))]
      .filter(valor => valor !== '||')
      .sort((a, b) => a.localeCompare(b, 'es'));
    select.innerHTML = '<option value="">Todas</option>' + opciones.map(valor => {
      const [ano, seccion, turno] = valor.split('|');
      return `<option value="${htmlSeguro(valor)}">${htmlSeguro(ano)} · Sección ${htmlSeguro(seccion)} · ${htmlSeguro(turno)}</option>`;
    }).join('');
    if (opciones.includes(actual)) select.value = actual;
  }

  function hoyIsoAuditoria() {
    const ahora = new Date();
    const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function actualizarMetricasAuditoria() {
    const hoy = hoyIsoAuditoria();
    const total = registrosAuditoria.length;
    const web = registrosAuditoria.filter(r => String(r.origen || '').toLowerCase() === 'web').length;
    const telegram = registrosAuditoria.filter(r => String(r.origen || '').toLowerCase() === 'telegram').length;
    const delDia = registrosAuditoria.filter(r => String(r.registradoEn || '').slice(0, 10) === hoy).length;
    const asignar = (id, valor) => { const nodo = document.getElementById(id); if (nodo) nodo.textContent = String(valor); };
    asignar('auditoria-total', total);
    asignar('auditoria-web', web);
    asignar('auditoria-telegram', telegram);
    asignar('auditoria-hoy', delDia);
  }

  function registrosFiltradosAuditoria() {
    const texto = String(document.getElementById(IDS.search)?.value || '').trim().toLowerCase();
    const fecha = String(document.getElementById(IDS.date)?.value || '');
    const origen = String(document.getElementById(IDS.origin)?.value || '');
    const seccion = String(document.getElementById(IDS.sectionFilter)?.value || '');
    return registrosAuditoria.filter(registro => {
      if (fecha && String(registro.fecha || '') !== fecha) return false;
      if (origen && String(registro.origen || '') !== origen) return false;
      if (seccion && `${registro.ano || ''}|${registro.seccion || ''}|${registro.turno || ''}` !== seccion) return false;
      if (texto) {
        const bolsa = [registro.alumno, registro.materia, registro.docente, registro.actorNombre, registro.accion, registro.estadoAnterior, registro.estadoNuevo]
          .map(valor => String(valor || '').toLowerCase()).join(' ');
        if (!bolsa.includes(texto)) return false;
      }
      return true;
    });
  }

  function claseEstadoAuditoria(estado) {
    const normalizado = String(estado || '').toLowerCase();
    if (normalizado === 'presente') return 'is-present';
    if (normalizado === 'ausente') return 'is-absent';
    if (normalizado === 'tardanza') return 'is-late';
    if (normalizado === 'justificada') return 'is-justified';
    return 'is-neutral';
  }

  function iconoOrigenAuditoria(origen) {
    return String(origen || '').toLowerCase() === 'telegram' ? 'fa-brands fa-telegram' : 'fa-solid fa-display';
  }

  function fechaHoraAuditoria(valor) {
    const texto = String(valor || '').trim();
    if (!texto) return { fecha: '—', hora: '' };
    const partes = texto.replace('T', ' ').split(' ');
    const fecha = partes[0] || texto;
    const hora = (partes[1] || '').slice(0, 8);
    const [ano, mes, dia] = fecha.split('-');
    return { fecha: dia && mes && ano ? `${dia}/${mes}/${ano}` : fecha, hora };
  }

  function renderAuditoria() {
    const body = document.getElementById(IDS.body);
    const cards = document.getElementById(IDS.cards);
    if (!body || !cards) return;
    const registros = registrosFiltradosAuditoria();
    const count = document.getElementById(IDS.count);
    if (count) count.textContent = `${registros.length} ${registros.length === 1 ? 'registro' : 'registros'}`;
    mostrarEstadoAuditoria(registros.length ? 'ready' : 'empty');

    body.innerHTML = registros.map(registro => {
      const momento = fechaHoraAuditoria(registro.registradoEn);
      const anterior = htmlSeguro(registro.estadoAnterior || 'Sin registro');
      const nuevo = htmlSeguro(registro.estadoNuevo || 'Sin registro');
      return `<tr>
        <td><strong>${htmlSeguro(momento.fecha)}</strong><small>${htmlSeguro(momento.hora)}</small><span>Asistencia: ${htmlSeguro(registro.fecha || '—')}</span></td>
        <td><strong>${htmlSeguro(registro.alumno || 'Estudiante')}</strong><small>${htmlSeguro(registro.materia || 'Materia')}</small><span>${htmlSeguro(registro.ano || '')} · Sección ${htmlSeguro(registro.seccion || '')} · ${htmlSeguro(registro.turno || '')}</span></td>
        <td><span class="audit-origin audit-origin--${String(registro.origen || '').toLowerCase()}"><i class="${iconoOrigenAuditoria(registro.origen)}"></i>${htmlSeguro(registro.origen || 'Web')}</span><strong>${htmlSeguro(registro.actorNombre || registro.docente || 'Docente')}</strong><small>${htmlSeguro(registro.accion || 'Actualización')}</small></td>
        <td><div class="audit-change"><span class="audit-state ${claseEstadoAuditoria(registro.estadoAnterior)}">${anterior}</span><i class="fa-solid fa-arrow-right"></i><span class="audit-state ${claseEstadoAuditoria(registro.estadoNuevo)}">${nuevo}</span></div></td>
      </tr>`;
    }).join('');

    cards.innerHTML = registros.map(registro => {
      const momento = fechaHoraAuditoria(registro.registradoEn);
      return `<article class="audit-mobile-card">
        <div class="audit-mobile-card__top"><div><strong>${htmlSeguro(registro.alumno || 'Estudiante')}</strong><span>${htmlSeguro(registro.materia || '')}</span></div><span class="audit-origin audit-origin--${String(registro.origen || '').toLowerCase()}"><i class="${iconoOrigenAuditoria(registro.origen)}"></i>${htmlSeguro(registro.origen || 'Web')}</span></div>
        <div class="audit-mobile-card__class">${htmlSeguro(registro.ano || '')} · Sección ${htmlSeguro(registro.seccion || '')} · ${htmlSeguro(registro.turno || '')}</div>
        <div class="audit-change"><span class="audit-state ${claseEstadoAuditoria(registro.estadoAnterior)}">${htmlSeguro(registro.estadoAnterior || 'Sin registro')}</span><i class="fa-solid fa-arrow-right"></i><span class="audit-state ${claseEstadoAuditoria(registro.estadoNuevo)}">${htmlSeguro(registro.estadoNuevo || 'Sin registro')}</span></div>
        <footer><span><i class="fa-regular fa-clock"></i>${htmlSeguro(momento.fecha)} ${htmlSeguro(momento.hora)}</span><span>${htmlSeguro(registro.actorNombre || registro.docente || 'Docente')}</span></footer>
      </article>`;
    }).join('');
  }

  function limpiarFiltrosAuditoria() {
    [IDS.search, IDS.date, IDS.origin, IDS.sectionFilter].forEach(id => {
      const control = document.getElementById(id);
      if (control) control.value = '';
    });
    renderAuditoria();
  }

  function exportarAuditoriaCsv() {
    const registros = registrosFiltradosAuditoria();
    if (!registros.length) {
      if (typeof mostrarToast === 'function') mostrarToast('No hay registros para exportar.', 'warning', 'Exportación vacía');
      return;
    }
    const columnas = ['registradoEn', 'fecha', 'alumno', 'materia', 'ano', 'seccion', 'turno', 'origen', 'actorNombre', 'accion', 'estadoAnterior', 'estadoNuevo'];
    const escaparCsv = valor => `"${String(valor ?? '').replace(/"/g, '""')}"`;
    const csv = [columnas.join(','), ...registros.map(r => columnas.map(c => escaparCsv(r[c])).join(','))].join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = `Auditoria_Asistencia_${hoyIsoAuditoria()}.csv`;
    document.body.appendChild(enlace);
    enlace.click();
    URL.revokeObjectURL(enlace.href);
    enlace.remove();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', crearInterfazAuditoria, { once: true });
  else crearInterfazAuditoria();
})();
/* EDUGESTION_AUDIT_PANEL_V1_END */

/* EDUGESTION_STATS_PANEL_V1_START */
(() => {
  const IDS = Object.freeze({
    tab: 'tab-estadisticas',
    section: 'section-estadisticas',
    from: 'estadisticas-desde',
    to: 'estadisticas-hasta',
    classFilter: 'estadisticas-seccion',
    search: 'estadisticas-buscar',
    apply: 'estadisticas-aplicar',
    clear: 'estadisticas-limpiar',
    refresh: 'estadisticas-actualizar',
    export: 'estadisticas-exportar',
    pdf: 'estadisticas-pdf',
    share: 'estadisticas-compartir',
    print: 'estadisticas-imprimir',
    studentsBody: 'estadisticas-alumnos-body',
    studentsCards: 'estadisticas-alumnos-cards',
    sectionsBody: 'estadisticas-secciones-body',
    dates: 'estadisticas-fechas',
    loading: 'estadisticas-cargando',
    empty: 'estadisticas-vacio',
    studentCount: 'estadisticas-conteo-alumnos'
  });

  let estadisticasData = null;
  let cargando = false;
  let catalogoSecciones = [];
  let informeCompartirPendiente = null;
  const INFORME_HISTORIAL_MAX = 100;
  let historialInformesTelegram = [];
  let historialInformesCargando = false;

  function leerHistorialInformesTelegram() {
    return Array.isArray(historialInformesTelegram)
      ? historialInformesTelegram.slice(0, INFORME_HISTORIAL_MAX)
      : [];
  }

  function normalizarRegistroInformeServidor(item = {}) {
    return {
      id: String(item.id || ''),
      fechaIso: String(item.registradoEn || item.fechaIso || ''),
      archivo: String(item.archivo || 'Informe de asistencia.pdf'),
      periodo: String(item.periodo || 'Periodo seleccionado'),
      seccion: String(item.seccion || 'Todas las secciones'),
      estado: String(item.estado || 'enviado').toLowerCase() === 'error' ? 'error' : 'enviado',
      destino: String(item.destino || ''),
      mensajeId: String(item.mensajeId || ''),
      tamanoBytes: Number(item.tamanoBytes || 0),
      codigo: String(item.codigo || ''),
      mensaje: String(item.detalle || item.mensaje || '')
    };
  }

  async function cargarHistorialInformesTelegram({ silencioso = false } = {}) {
    if (historialInformesCargando || !String(sessionToken || '').trim()) return;
    historialInformesCargando = true;
    const contenedor = document.getElementById('stats-share-history-list');
    if (contenedor && !silencioso) {
      contenedor.innerHTML = '<div class="stats-share-history-empty"><i class="fa-solid fa-circle-notch fa-spin"></i><span>Cargando historial del servidor…</span></div>';
    }
    try {
      const respuesta = await apiRequest('obtenerHistorialInformes', { limite: INFORME_HISTORIAL_MAX });
      historialInformesTelegram = Array.isArray(respuesta.historial)
        ? respuesta.historial.map(normalizarRegistroInformeServidor)
        : [];
      renderHistorialInformesTelegram();
    } catch (error) {
      console.error('No se pudo cargar el historial de informes:', error);
      if (contenedor) {
        contenedor.innerHTML = '<div class="stats-share-history-empty"><i class="fa-solid fa-triangle-exclamation"></i><span>No se pudo consultar el historial del servidor.</span></div>';
      }
      if (!silencioso && typeof mostrarToast === 'function') {
        mostrarToast(error.message || 'No se pudo consultar el historial.', 'error', 'Historial no disponible');
      }
    } finally {
      historialInformesCargando = false;
    }
  }

  function fechaHoraHistorial(valor) {
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return 'Sin fecha';
    return fecha.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function fechaIsoLocalHistorial(valor) {
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return '';
    const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function filtrosHistorialTelegram() {
    return {
      texto: String(document.getElementById('stats-history-search')?.value || '').trim().toLowerCase(),
      estado: String(document.getElementById('stats-history-status')?.value || ''),
      fecha: String(document.getElementById('stats-history-date')?.value || '')
    };
  }

  function historialFiltradoTelegram() {
    const filtros = filtrosHistorialTelegram();
    return leerHistorialInformesTelegram().filter(item => {
      const textoItem = `${item.archivo || ''} ${item.periodo || ''} ${item.seccion || ''} ${item.destino || ''} ${item.mensaje || ''}`.toLowerCase();
      if (filtros.texto && !textoItem.includes(filtros.texto)) return false;
      if (filtros.estado && String(item.estado || '') !== filtros.estado) return false;
      if (filtros.fecha && fechaIsoLocalHistorial(item.fechaIso) !== filtros.fecha) return false;
      return true;
    });
  }

  function actualizarResumenHistorialTelegram() {
    const historial = leerHistorialInformesTelegram();
    const enviados = historial.filter(item => item.estado === 'enviado').length;
    const errores = historial.filter(item => item.estado === 'error').length;
    const asignar = (id, valor) => { const nodo = document.getElementById(id); if (nodo) nodo.textContent = String(valor); };
    asignar('stats-history-total', historial.length);
    asignar('stats-history-sent', enviados);
    asignar('stats-history-errors', errores);
  }

  async function eliminarRegistroHistorialTelegram(id) {
    if (!id || !confirm('¿Eliminar este registro del historial del servidor?')) return;
    try {
      await apiRequest('eliminarRegistroInforme', { id });
      historialInformesTelegram = historialInformesTelegram.filter(item => String(item.id) !== String(id));
      renderHistorialInformesTelegram();
      if (typeof mostrarToast === 'function') mostrarToast('El registro fue eliminado del servidor.', 'success', 'Registro eliminado');
    } catch (error) {
      if (typeof mostrarToast === 'function') mostrarToast(error.message || 'No se pudo eliminar el registro.', 'error', 'No se eliminó');
    }
  }

  async function limpiarHistorialInformesTelegram() {
    if (!confirm('¿Eliminar todo tu historial de informes guardado en el servidor?')) return;
    try {
      await apiRequest('limpiarHistorialInformes');
      historialInformesTelegram = [];
      renderHistorialInformesTelegram();
      if (typeof mostrarToast === 'function') mostrarToast('El historial del servidor fue eliminado.', 'success', 'Historial limpio');
    } catch (error) {
      if (typeof mostrarToast === 'function') mostrarToast(error.message || 'No se pudo limpiar el historial.', 'error', 'No se eliminó');
    }
  }

  async function reenviarRegistroHistorialTelegram(id) {
    const registro = leerHistorialInformesTelegram().find(item => String(item.id) === String(id));
    if (!registro || !informeCompartirPendiente) return;
    if (typeof mostrarToast === 'function') mostrarToast('Se reenviará el informe que está preparado actualmente.', 'info', 'Reenvío iniciado');
    await enviarInformeTelegramVinculado();
  }

  function renderHistorialInformesTelegram() {
    const contenedor = document.getElementById('stats-share-history-list');
    if (!contenedor) return;
    const historialCompleto = leerHistorialInformesTelegram();
    const historial = historialFiltradoTelegram();
    actualizarResumenHistorialTelegram();
    const contador = document.getElementById('stats-history-visible-count');
    if (contador) contador.textContent = `${historial.length} de ${historialCompleto.length}`;
    if (!historial.length) {
      contenedor.innerHTML = '<div class="stats-share-history-empty"><i class="fa-regular fa-folder-open"></i><span>No hay registros que coincidan con los filtros seleccionados.</span></div>';
      return;
    }
    contenedor.innerHTML = historial.map(item => {
      const enviado = item.estado === 'enviado';
      return `<article class="stats-share-history-item ${enviado ? 'is-sent' : 'is-error'}" data-history-id="${seguro(item.id || '')}">
        <span class="stats-share-history-icon"><i class="fa-solid ${enviado ? 'fa-circle-check' : 'fa-circle-xmark'}"></i></span>
        <div class="stats-share-history-copy"><strong>${seguro(item.archivo || 'Informe de asistencia.pdf')}</strong><small>${seguro(fechaHoraHistorial(item.fechaIso))} · ${seguro(item.periodo || 'Periodo seleccionado')}</small><em>${seguro(item.seccion || 'Todas las secciones')} · ${seguro(item.destino || item.mensaje || (enviado ? 'Telegram vinculado' : 'No enviado'))}</em></div>
        <b>${enviado ? 'Enviado' : 'Error'}</b>
        <div class="stats-share-history-actions">
          <button type="button" data-history-action="resend" data-history-id="${seguro(item.id || '')}" title="Reenviar el informe actual"><i class="fa-solid fa-paper-plane"></i><span>Reenviar</span></button>
          <button type="button" data-history-action="delete" data-history-id="${seguro(item.id || '')}" title="Eliminar registro del servidor"><i class="fa-solid fa-trash-can"></i><span>Eliminar</span></button>
        </div>
      </article>`;
    }).join('');
  }

  function mostrarResultadoEnvioTelegram(datos = {}) {
    const panel = document.getElementById('stats-share-result');
    if (!panel) return;
    panel.className = 'stats-share-result is-success';
    panel.innerHTML = `<span><i class="fa-solid fa-circle-check"></i></span><div><strong>Informe enviado correctamente</strong><small>El PDF fue entregado a ${seguro(datos.destino || 'Telegram vinculado')}.</small><em>${seguro(fechaHoraHistorial(datos.sentAt || new Date().toISOString()))}</em></div>`;
    panel.classList.remove('hidden');
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  const seguro = (valor = '') => {
    if (typeof escaparHTML === 'function') return escaparHTML(valor);
    return String(valor).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  };

  const numero = valor => Number.isFinite(Number(valor)) ? Number(valor) : 0;
  const porcentaje = valor => `${numero(valor).toLocaleString('es-ES', { maximumFractionDigits: 2 })}%`;
  const clasePorcentaje = valor => numero(valor) >= 90 ? 'is-high' : numero(valor) >= 70 ? 'is-medium' : 'is-low';

  function hoyIso() {
    const ahora = new Date();
    const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function primerDiaMesIso() {
    const ahora = new Date();
    const local = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const ajustada = new Date(local.getTime() - local.getTimezoneOffset() * 60000);
    return ajustada.toISOString().slice(0, 10);
  }

  function fechaLegible(valor) {
    const partes = String(valor || '').split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : String(valor || '—');
  }

  function crearInterfazEstadisticas() {
    if (document.getElementById(IDS.tab) || document.getElementById(IDS.section)) return;
    const tabAuditoria = document.getElementById('tab-auditoria');
    const tabHorario = document.getElementById('tab-horario');
    const referencia = tabAuditoria || tabHorario;
    const navegacion = referencia?.parentElement;
    const principal = document.getElementById('app-main');
    if (!navegacion || !principal) return;

    const tab = document.createElement('button');
    tab.id = IDS.tab;
    tab.type = 'button';
    tab.className = 'nav-item';
    tab.setAttribute('aria-selected', 'false');
    tab.dataset.title = 'Estadísticas de asistencia';
    tab.dataset.description = 'Analiza asistencia, tardanzas, ausencias y justificaciones por periodo.';
    tab.innerHTML = '<i class="fa-solid fa-chart-column"></i><span>Estadísticas</span>';
    referencia.insertAdjacentElement('afterend', tab);

    const section = document.createElement('section');
    section.id = IDS.section;
    section.className = 'hidden max-w-[1400px] mx-auto space-y-6 stats-panel';
    section.innerHTML = `
      <section class="stats-hero">
        <div>
          <span class="stats-eyebrow"><i class="fa-solid fa-chart-line"></i> Informe de asistencia</span>
          <h2>Estadísticas e informes</h2>
          <p>Consulta indicadores por periodo, estudiante y sección con datos sincronizados de EduGestión.</p>
        </div>
        <div class="stats-hero__actions">
          <button id="${IDS.export}" type="button" class="stats-button stats-button--secondary"><i class="fa-solid fa-file-csv"></i> Exportar CSV</button>
          <button id="${IDS.pdf}" type="button" class="stats-button stats-button--secondary stats-button--pdf"><i class="fa-solid fa-file-pdf"></i> Generar PDF</button>
          <button id="${IDS.share}" type="button" class="stats-button stats-button--secondary stats-button--share"><i class="fa-solid fa-share-nodes"></i> Compartir PDF</button>
          <button id="${IDS.print}" type="button" class="stats-button stats-button--secondary"><i class="fa-solid fa-print"></i> Imprimir</button>
          <button id="${IDS.refresh}" type="button" class="stats-button stats-button--primary"><i class="fa-solid fa-rotate"></i> Actualizar</button>
        </div>
      </section>

      <section class="stats-filter-card">
        <div class="stats-filter-card__title">
          <div><span><i class="fa-solid fa-sliders"></i></span><div><strong>Periodo y filtros</strong><small>Selecciona el rango que deseas analizar.</small></div></div>
          <button id="${IDS.clear}" type="button"><i class="fa-solid fa-eraser"></i> Restablecer</button>
        </div>
        <div class="stats-filters">
          <label class="stats-field"><span>Desde</span><input id="${IDS.from}" type="date"></label>
          <label class="stats-field"><span>Hasta</span><input id="${IDS.to}" type="date"></label>
          <label class="stats-field stats-field--wide"><span>Sección</span><select id="${IDS.classFilter}"><option value="">Todas las secciones</option></select></label>
          <label class="stats-search stats-field--wide"><span>Buscar estudiante</span><div><i class="fa-solid fa-magnifying-glass"></i><input id="${IDS.search}" type="search" placeholder="Nombre del estudiante"></div></label>
          <button id="${IDS.apply}" type="button" class="stats-apply"><i class="fa-solid fa-filter-circle-dollar"></i> Aplicar filtros</button>
        </div>
      </section>

      <section id="${IDS.loading}" class="stats-status hidden"><i class="fa-solid fa-circle-notch fa-spin"></i><strong>Calculando estadísticas…</strong><span>Estamos procesando los registros de asistencia.</span></section>
      <section id="${IDS.empty}" class="stats-status hidden"><i class="fa-solid fa-chart-simple"></i><strong>No hay registros en este periodo</strong><span>Prueba otro rango de fechas o una sección diferente.</span></section>

      <section class="stats-metrics" aria-label="Indicadores principales">
        <article class="stats-metric stats-metric--total"><span><i class="fa-solid fa-clipboard-list"></i></span><div><strong id="stats-total">0</strong><small>Registros</small></div></article>
        <article class="stats-metric stats-metric--present"><span><i class="fa-solid fa-user-check"></i></span><div><strong id="stats-presentes">0</strong><small>Presentes</small></div></article>
        <article class="stats-metric stats-metric--absent"><span><i class="fa-solid fa-user-xmark"></i></span><div><strong id="stats-ausentes">0</strong><small>Ausentes</small></div></article>
        <article class="stats-metric stats-metric--late"><span><i class="fa-solid fa-clock"></i></span><div><strong id="stats-tardanzas">0</strong><small>Tardanzas</small></div></article>
        <article class="stats-metric stats-metric--justified"><span><i class="fa-solid fa-file-circle-check"></i></span><div><strong id="stats-justificadas">0</strong><small>Justificadas</small></div></article>
        <article class="stats-metric stats-metric--rate"><span><i class="fa-solid fa-percent"></i></span><div><strong id="stats-porcentaje">0%</strong><small>Asistencia efectiva</small></div></article>
      </section>

      <section class="stats-overview-grid">
        <article class="stats-score-card">
          <div class="stats-card-title"><span><i class="fa-solid fa-gauge-high"></i></span><div><h3>Indicadores del periodo</h3><p>La asistencia efectiva suma presentes y tardanzas.</p></div></div>
          <div class="stats-score-row"><div><strong>Asistencia efectiva</strong><small>Presentes + tardanzas</small></div><span id="stats-score-asistencia">0%</span></div>
          <div class="stats-progress"><span id="stats-bar-asistencia"></span></div>
          <div class="stats-score-row"><div><strong>Cumplimiento registrado</strong><small>Incluye ausencias justificadas</small></div><span id="stats-score-cumplimiento">0%</span></div>
          <div class="stats-progress stats-progress--violet"><span id="stats-bar-cumplimiento"></span></div>
          <div class="stats-breakdown" id="stats-breakdown"></div>
        </article>

        <article class="stats-daily-card">
          <div class="stats-card-title"><span><i class="fa-regular fa-calendar-days"></i></span><div><h3>Evolución por fecha</h3><p>Distribución diaria de los estados registrados.</p></div></div>
          <div id="${IDS.dates}" class="stats-daily-list"></div>
        </article>
      </section>

      <section class="stats-table-card">
        <div class="stats-table-card__header"><div><span><i class="fa-solid fa-graduation-cap"></i></span><div><h3>Rendimiento por estudiante</h3><p>Ordenado alfabéticamente.</p></div></div><span id="${IDS.studentCount}" class="stats-count">0 estudiantes</span></div>
        <div class="stats-table-wrap"><table class="stats-table"><thead><tr><th>Estudiante</th><th>Clase</th><th>P</th><th>A</th><th>T</th><th>J</th><th>Asistencia</th><th>Cumplimiento</th></tr></thead><tbody id="${IDS.studentsBody}"></tbody></table></div>
        <div id="${IDS.studentsCards}" class="stats-mobile-list"></div>
      </section>

      <section class="stats-table-card">
        <div class="stats-table-card__header"><div><span><i class="fa-solid fa-people-roof"></i></span><div><h3>Resumen por sección</h3><p>Comparación de cursos y turnos.</p></div></div></div>
        <div class="stats-table-wrap"><table class="stats-table"><thead><tr><th>Sección</th><th>Registros</th><th>Presentes</th><th>Ausentes</th><th>Tardanzas</th><th>Justificadas</th><th>Asistencia</th></tr></thead><tbody id="${IDS.sectionsBody}"></tbody></table></div>
      </section>`;
    principal.appendChild(section);
    crearModalCompartirInforme();

    document.getElementById(IDS.from).value = primerDiaMesIso();
    document.getElementById(IDS.to).value = hoyIso();

    tab.addEventListener('click', abrirEstadisticas);
    ['tab-asistencia', 'tab-planificacion', 'tab-actas', 'tab-registro', 'tab-horario', 'tab-calendario', 'tab-auditoria'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', cerrarEstadisticas, { capture: true });
    });
    document.getElementById(IDS.apply)?.addEventListener('click', () => cargarEstadisticas(true));
    document.getElementById(IDS.refresh)?.addEventListener('click', () => cargarEstadisticas(true, true));
    document.getElementById(IDS.clear)?.addEventListener('click', restablecerFiltros);
    document.getElementById(IDS.export)?.addEventListener('click', exportarCsv);
    document.getElementById(IDS.pdf)?.addEventListener('click', generarPdfProfesional);
    document.getElementById(IDS.share)?.addEventListener('click', prepararCompartirPdfProfesional);
    document.getElementById(IDS.print)?.addEventListener('click', imprimirInforme);
    document.getElementById(IDS.search)?.addEventListener('input', renderEstadisticas);
  }

  function cerrarEstadisticas() {
    document.getElementById(IDS.tab)?.classList.remove('is-active');
    document.getElementById(IDS.tab)?.setAttribute('aria-selected', 'false');
    document.getElementById(IDS.section)?.classList.add('hidden');
  }

  async function abrirEstadisticas() {
    document.querySelectorAll('.nav-item').forEach(item => { item.classList.remove('is-active'); item.setAttribute('aria-selected', 'false'); });
    document.querySelectorAll('#app-main > section').forEach(item => item.classList.add('hidden'));
    document.getElementById(IDS.tab)?.classList.add('is-active');
    document.getElementById(IDS.tab)?.setAttribute('aria-selected', 'true');
    document.getElementById(IDS.section)?.classList.remove('hidden');
    if (typeof pageTitle !== 'undefined' && pageTitle) pageTitle.textContent = 'Estadísticas de asistencia';
    if (typeof pageDescription !== 'undefined' && pageDescription) pageDescription.textContent = 'Analiza asistencia, tardanzas, ausencias y justificaciones por periodo.';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await cargarEstadisticas(false);
  }

  function estadoVista(tipo) {
    document.getElementById(IDS.loading)?.classList.toggle('hidden', tipo !== 'loading');
    document.getElementById(IDS.empty)?.classList.toggle('hidden', tipo !== 'empty');
  }

  function filtrosServidor() {
    const valorSeccion = String(document.getElementById(IDS.classFilter)?.value || '');
    const [ano = '', seccion = '', turno = ''] = valorSeccion.split('|');
    return {
      fechaDesde: String(document.getElementById(IDS.from)?.value || ''),
      fechaHasta: String(document.getElementById(IDS.to)?.value || ''),
      ano,
      seccion,
      turno
    };
  }

  async function cargarEstadisticas(forzar = false, notificar = false) {
    if (cargando) return;
    if (estadisticasData && !forzar) { renderEstadisticas(); return; }
    if (typeof sessionToken === 'undefined' || !sessionToken) { estadoVista('empty'); return; }
    cargando = true;
    estadoVista('loading');
    document.getElementById(IDS.refresh)?.classList.add('is-loading');
    document.getElementById(IDS.apply)?.classList.add('is-loading');
    try {
      const respuesta = await apiRequest('obtenerEstadisticasAsistencia', filtrosServidor());
      estadisticasData = respuesta;
      if (!catalogoSecciones.length || !String(document.getElementById(IDS.classFilter)?.value || '')) {
        catalogoSecciones = Array.isArray(respuesta.porSeccion) ? respuesta.porSeccion.map(item => ({ ...item })) : [];
        llenarSecciones();
      }
      renderEstadisticas();
      if (notificar && typeof mostrarToast === 'function') mostrarToast('Los indicadores se actualizaron correctamente.', 'success', 'Estadísticas actualizadas');
    } catch (error) {
      console.error('No se pudieron cargar las estadísticas:', error);
      estadisticasData = null;
      renderEstadisticas();
      if (typeof mostrarToast === 'function') mostrarToast(error.message || 'No se pudieron consultar las estadísticas.', 'error', 'Error de estadísticas');
    } finally {
      cargando = false;
      document.getElementById(IDS.refresh)?.classList.remove('is-loading');
      document.getElementById(IDS.apply)?.classList.remove('is-loading');
    }
  }

  function llenarSecciones() {
    const select = document.getElementById(IDS.classFilter);
    if (!select) return;
    const actual = select.value;
    const opciones = catalogoSecciones.map(item => `${item.ano || ''}|${item.seccion || ''}|${item.turno || ''}`)
      .filter((valor, indice, arreglo) => valor !== '||' && arreglo.indexOf(valor) === indice)
      .sort((a, b) => a.localeCompare(b, 'es'));
    select.innerHTML = '<option value="">Todas las secciones</option>' + opciones.map(valor => {
      const [ano, seccion, turno] = valor.split('|');
      return `<option value="${seguro(valor)}">${seguro(ano)} · Sección ${seguro(seccion)} · ${seguro(turno)}</option>`;
    }).join('');
    if (opciones.includes(actual)) select.value = actual;
  }

  function asignar(id, valor) {
    const nodo = document.getElementById(id);
    if (nodo) nodo.textContent = String(valor);
  }

  function alumnosFiltrados() {
    const alumnos = Array.isArray(estadisticasData?.porAlumno) ? estadisticasData.porAlumno : [];
    const texto = String(document.getElementById(IDS.search)?.value || '').trim().toLowerCase();
    if (!texto) return alumnos;
    return alumnos.filter(item => [item.alumno, item.ano, item.seccion, item.turno].some(valor => String(valor || '').toLowerCase().includes(texto)));
  }

  function renderEstadisticas() {
    const resumen = estadisticasData?.resumen || null;
    const total = numero(resumen?.total);
    estadoVista(total ? 'ready' : 'empty');

    asignar('stats-total', total);
    asignar('stats-presentes', numero(resumen?.presentes));
    asignar('stats-ausentes', numero(resumen?.ausentes));
    asignar('stats-tardanzas', numero(resumen?.tardanzas));
    asignar('stats-justificadas', numero(resumen?.justificadas));
    asignar('stats-porcentaje', porcentaje(resumen?.porcentajeAsistencia));
    asignar('stats-score-asistencia', porcentaje(resumen?.porcentajeAsistencia));
    asignar('stats-score-cumplimiento', porcentaje(resumen?.porcentajeCumplimiento));

    const barAsistencia = document.getElementById('stats-bar-asistencia');
    const barCumplimiento = document.getElementById('stats-bar-cumplimiento');
    if (barAsistencia) barAsistencia.style.width = `${Math.max(0, Math.min(100, numero(resumen?.porcentajeAsistencia)))}%`;
    if (barCumplimiento) barCumplimiento.style.width = `${Math.max(0, Math.min(100, numero(resumen?.porcentajeCumplimiento)))}%`;

    const breakdown = document.getElementById('stats-breakdown');
    if (breakdown) breakdown.innerHTML = `
      <span><i class="is-present"></i>Presentes <b>${numero(resumen?.presentes)}</b></span>
      <span><i class="is-absent"></i>Ausentes <b>${numero(resumen?.ausentes)}</b></span>
      <span><i class="is-late"></i>Tardanzas <b>${numero(resumen?.tardanzas)}</b></span>
      <span><i class="is-justified"></i>Justificadas <b>${numero(resumen?.justificadas)}</b></span>`;

    renderFechas();
    renderAlumnos();
    renderSecciones();
  }

  function renderFechas() {
    const contenedor = document.getElementById(IDS.dates);
    if (!contenedor) return;
    const fechas = Array.isArray(estadisticasData?.porFecha) ? estadisticasData.porFecha : [];
    if (!fechas.length) {
      contenedor.innerHTML = '<div class="stats-mini-empty"><i class="fa-regular fa-calendar-xmark"></i><span>Sin datos diarios en el periodo.</span></div>';
      return;
    }
    contenedor.innerHTML = [...fechas].reverse().slice(0, 10).map(item => {
      const total = Math.max(1, numero(item.total));
      const ancho = Math.max(4, Math.min(100, numero(item.porcentajeAsistencia)));
      return `<article class="stats-daily-item">
        <div><strong>${seguro(fechaLegible(item.fecha))}</strong><small>${numero(item.total)} registros · ${numero(item.tardanzas)} tardanzas</small></div>
        <div class="stats-daily-bar"><span style="width:${ancho}%"></span></div>
        <b>${porcentaje(item.porcentajeAsistencia)}</b>
      </article>`;
    }).join('');
  }

  function renderAlumnos() {
    const body = document.getElementById(IDS.studentsBody);
    const cards = document.getElementById(IDS.studentsCards);
    if (!body || !cards) return;
    const alumnos = alumnosFiltrados();
    asignar(IDS.studentCount, `${alumnos.length} ${alumnos.length === 1 ? 'estudiante' : 'estudiantes'}`);
    body.innerHTML = alumnos.map(item => `<tr>
      <td><strong>${seguro(item.alumno || 'Estudiante')}</strong><small>${numero(item.total)} registros</small></td>
      <td><strong>${seguro(item.ano || '')} · ${seguro(item.seccion || '')}</strong><small>${seguro(item.turno || '')}</small></td>
      <td><span class="stats-state is-present">${numero(item.presentes)}</span></td>
      <td><span class="stats-state is-absent">${numero(item.ausentes)}</span></td>
      <td><span class="stats-state is-late">${numero(item.tardanzas)}</span></td>
      <td><span class="stats-state is-justified">${numero(item.justificadas)}</span></td>
      <td><span class="stats-rate ${clasePorcentaje(item.porcentajeAsistencia)}">${porcentaje(item.porcentajeAsistencia)}</span></td>
      <td><span class="stats-rate ${clasePorcentaje(item.porcentajeCumplimiento)}">${porcentaje(item.porcentajeCumplimiento)}</span></td>
    </tr>`).join('');
    cards.innerHTML = alumnos.map(item => `<article class="stats-mobile-card">
      <header><div><strong>${seguro(item.alumno || 'Estudiante')}</strong><span>${seguro(item.ano || '')} · Sección ${seguro(item.seccion || '')} · ${seguro(item.turno || '')}</span></div><b class="stats-rate ${clasePorcentaje(item.porcentajeAsistencia)}">${porcentaje(item.porcentajeAsistencia)}</b></header>
      <div class="stats-mobile-states"><span class="is-present">P ${numero(item.presentes)}</span><span class="is-absent">A ${numero(item.ausentes)}</span><span class="is-late">T ${numero(item.tardanzas)}</span><span class="is-justified">J ${numero(item.justificadas)}</span></div>
      <footer><span>${numero(item.total)} registros</span><span>Cumplimiento: ${porcentaje(item.porcentajeCumplimiento)}</span></footer>
    </article>`).join('');
  }

  function renderSecciones() {
    const body = document.getElementById(IDS.sectionsBody);
    if (!body) return;
    const secciones = Array.isArray(estadisticasData?.porSeccion) ? estadisticasData.porSeccion : [];
    body.innerHTML = secciones.map(item => `<tr>
      <td><strong>${seguro(item.ano || '')} · Sección ${seguro(item.seccion || '')}</strong><small>${seguro(item.turno || '')}</small></td>
      <td>${numero(item.total)}</td><td>${numero(item.presentes)}</td><td>${numero(item.ausentes)}</td><td>${numero(item.tardanzas)}</td><td>${numero(item.justificadas)}</td>
      <td><span class="stats-rate ${clasePorcentaje(item.porcentajeAsistencia)}">${porcentaje(item.porcentajeAsistencia)}</span></td>
    </tr>`).join('');
  }

  function restablecerFiltros() {
    document.getElementById(IDS.from).value = primerDiaMesIso();
    document.getElementById(IDS.to).value = hoyIso();
    document.getElementById(IDS.classFilter).value = '';
    document.getElementById(IDS.search).value = '';
    estadisticasData = null;
    cargarEstadisticas(true);
  }

  function exportarCsv() {
    const alumnos = alumnosFiltrados();
    if (!alumnos.length) {
      if (typeof mostrarToast === 'function') mostrarToast('No hay datos para exportar.', 'warning', 'Exportación vacía');
      return;
    }
    const columnas = ['alumno', 'ano', 'seccion', 'turno', 'total', 'presentes', 'ausentes', 'tardanzas', 'justificadas', 'porcentajeAsistencia', 'porcentajeCumplimiento'];
    const escaparCsv = valor => `"${String(valor ?? '').replace(/"/g, '""')}"`;
    const csv = [columnas.join(','), ...alumnos.map(item => columnas.map(c => escaparCsv(item[c])).join(','))].join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = `Estadisticas_Asistencia_${String(document.getElementById(IDS.from)?.value || '')}_${String(document.getElementById(IDS.to)?.value || '')}.csv`;
    document.body.appendChild(enlace);
    enlace.click();
    URL.revokeObjectURL(enlace.href);
    enlace.remove();
  }

  function nombreInstitucionReporte() {
    const campo = document.getElementById('input-institucion');
    const guardado = typeof storageGet === 'function' ? storageGet('nombreInstitucion', '') : '';
    return String(campo?.value || guardado || 'UNIDAD EDUCATIVA EDUGESTIÓN').trim();
  }

  function fechaHoraReporte() {
    return new Date().toLocaleString('es-BO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function estadoTextoFiltro() {
    const select = document.getElementById(IDS.classFilter);
    return select?.selectedOptions?.[0]?.textContent?.trim() || 'Todas las secciones';
  }

  function filaEstadoPdf(etiqueta, valor, clase) {
    return `<div class="stats-pdf-kpi ${clase}"><span>${seguro(etiqueta)}</span><strong>${seguro(valor)}</strong></div>`;
  }

  function construirReportePdf() {
    const resumen = estadisticasData?.resumen || {};
    const alumnos = alumnosFiltrados();
    const secciones = Array.isArray(estadisticasData?.porSeccion) ? estadisticasData.porSeccion : [];
    const fechas = Array.isArray(estadisticasData?.porFecha) ? estadisticasData.porFecha : [];
    const desde = String(document.getElementById(IDS.from)?.value || '');
    const hasta = String(document.getElementById(IDS.to)?.value || '');
    const docente = String(profesorActual?.nombre || document.getElementById('profesor-name')?.textContent || 'Docente').trim();
    const materia = String(profesorActual?.materia || document.getElementById('profesor-materia')?.textContent || 'Materia').trim();
    const institucion = nombreInstitucionReporte();
    const total = numero(resumen.total);

    const reporte = document.createElement('article');
    reporte.className = 'stats-pdf-report';
    reporte.setAttribute('aria-hidden', 'true');
    reporte.innerHTML = `
      <header class="stats-pdf-header">
        <div class="stats-pdf-brand"><span>EG</span></div>
        <div class="stats-pdf-heading">
          <p>${seguro(institucion.toUpperCase())}</p>
          <h1>INFORME DE ASISTENCIA</h1>
          <small>Reporte estadístico del periodo seleccionado</small>
        </div>
        <div class="stats-pdf-folio"><b>EDUGESTIÓN</b><span>Emitido: ${seguro(fechaHoraReporte())}</span></div>
      </header>

      <section class="stats-pdf-meta">
        <div><span>Docente</span><strong>${seguro(docente)}</strong></div>
        <div><span>Materia</span><strong>${seguro(materia)}</strong></div>
        <div><span>Periodo</span><strong>${seguro(fechaLegible(desde))} al ${seguro(fechaLegible(hasta))}</strong></div>
        <div><span>Sección analizada</span><strong>${seguro(estadoTextoFiltro())}</strong></div>
      </section>

      <section class="stats-pdf-summary">
        ${filaEstadoPdf('Registros', total, 'is-total')}
        ${filaEstadoPdf('Presentes', numero(resumen.presentes), 'is-present')}
        ${filaEstadoPdf('Ausentes', numero(resumen.ausentes), 'is-absent')}
        ${filaEstadoPdf('Tardanzas', numero(resumen.tardanzas), 'is-late')}
        ${filaEstadoPdf('Justificadas', numero(resumen.justificadas), 'is-justified')}
        ${filaEstadoPdf('Asistencia efectiva', porcentaje(resumen.porcentajeAsistencia), 'is-rate')}
      </section>

      <section class="stats-pdf-section stats-pdf-two-columns">
        <div>
          <h2>Indicadores del periodo</h2>
          <div class="stats-pdf-indicator"><span>Asistencia efectiva</span><strong>${seguro(porcentaje(resumen.porcentajeAsistencia))}</strong><div><i style="width:${Math.max(0, Math.min(100, numero(resumen.porcentajeAsistencia)))}%"></i></div><small>Presentes + tardanzas sobre el total de registros.</small></div>
          <div class="stats-pdf-indicator is-violet"><span>Cumplimiento registrado</span><strong>${seguro(porcentaje(resumen.porcentajeCumplimiento))}</strong><div><i style="width:${Math.max(0, Math.min(100, numero(resumen.porcentajeCumplimiento)))}%"></i></div><small>Incluye las ausencias justificadas.</small></div>
        </div>
        <div>
          <h2>Resumen de estados</h2>
          <table class="stats-pdf-compact-table"><tbody>
            <tr><th>Presente</th><td>${numero(resumen.presentes)}</td><td>${total ? porcentaje(numero(resumen.presentes) * 100 / total) : '0%'}</td></tr>
            <tr><th>Ausente</th><td>${numero(resumen.ausentes)}</td><td>${total ? porcentaje(numero(resumen.ausentes) * 100 / total) : '0%'}</td></tr>
            <tr><th>Tardanza</th><td>${numero(resumen.tardanzas)}</td><td>${total ? porcentaje(numero(resumen.tardanzas) * 100 / total) : '0%'}</td></tr>
            <tr><th>Justificada</th><td>${numero(resumen.justificadas)}</td><td>${total ? porcentaje(numero(resumen.justificadas) * 100 / total) : '0%'}</td></tr>
          </tbody></table>
        </div>
      </section>

      <section class="stats-pdf-section">
        <h2>Detalle por estudiante</h2>
        <table class="stats-pdf-table">
          <thead><tr><th>Estudiante</th><th>Clase</th><th>P</th><th>A</th><th>T</th><th>J</th><th>Asistencia</th><th>Cumplimiento</th></tr></thead>
          <tbody>${alumnos.length ? alumnos.map(item => `<tr>
            <td><strong>${seguro(item.alumno || 'Estudiante')}</strong><small>${numero(item.total)} registros</small></td>
            <td>${seguro(item.ano || '')} · ${seguro(item.seccion || '')}<small>${seguro(item.turno || '')}</small></td>
            <td>${numero(item.presentes)}</td><td>${numero(item.ausentes)}</td><td>${numero(item.tardanzas)}</td><td>${numero(item.justificadas)}</td>
            <td><b>${seguro(porcentaje(item.porcentajeAsistencia))}</b></td><td><b>${seguro(porcentaje(item.porcentajeCumplimiento))}</b></td>
          </tr>`).join('') : '<tr><td colspan="8">No hay estudiantes para los filtros seleccionados.</td></tr>'}</tbody>
        </table>
      </section>

      <section class="stats-pdf-section">
        <h2>Resumen por sección</h2>
        <table class="stats-pdf-table">
          <thead><tr><th>Sección</th><th>Registros</th><th>Presentes</th><th>Ausentes</th><th>Tardanzas</th><th>Justificadas</th><th>Asistencia</th></tr></thead>
          <tbody>${secciones.length ? secciones.map(item => `<tr>
            <td><strong>${seguro(item.ano || '')} · Sección ${seguro(item.seccion || '')}</strong><small>${seguro(item.turno || '')}</small></td>
            <td>${numero(item.total)}</td><td>${numero(item.presentes)}</td><td>${numero(item.ausentes)}</td><td>${numero(item.tardanzas)}</td><td>${numero(item.justificadas)}</td><td><b>${seguro(porcentaje(item.porcentajeAsistencia))}</b></td>
          </tr>`).join('') : '<tr><td colspan="7">No hay secciones en el periodo.</td></tr>'}</tbody>
        </table>
      </section>

      <section class="stats-pdf-section stats-pdf-dates">
        <h2>Evolución por fecha</h2>
        <div>${fechas.length ? [...fechas].reverse().slice(0, 16).map(item => `<article><span>${seguro(fechaLegible(item.fecha))}</span><div><i style="width:${Math.max(1, Math.min(100, numero(item.porcentajeAsistencia)))}%"></i></div><strong>${seguro(porcentaje(item.porcentajeAsistencia))}</strong></article>`).join('') : '<p>Sin datos diarios.</p>'}</div>
      </section>

      <section class="stats-pdf-note">
        <strong>Criterio de lectura</strong>
        <p>La asistencia efectiva considera los estados Presente y Tardanza. El cumplimiento registrado también incorpora las ausencias justificadas. Este informe refleja los datos disponibles en EduGestión al momento de su emisión.</p>
      </section>

      <section class="stats-pdf-signatures">
        <div><span></span><strong>${seguro(docente)}</strong><small>Firma del docente</small></div>
        <div><span></span><strong>Dirección / Secretaría</strong><small>Firma y sello institucional</small></div>
      </section>

      <footer class="stats-pdf-footer"><span>Generado por EduGestión</span><span>${seguro(institucion)}</span></footer>`;
    return reporte;
  }

  function nombreArchivoInformePdf() {
    const desde = String(document.getElementById(IDS.from)?.value || 'inicio');
    const hasta = String(document.getElementById(IDS.to)?.value || 'fin');
    return `Informe_Asistencia_Horizontal_${desde}_${hasta}.pdf`;
  }

  function mensajeCompartirInforme() {
    const desde = fechaLegible(document.getElementById(IDS.from)?.value || '');
    const hasta = fechaLegible(document.getElementById(IDS.to)?.value || '');
    const docente = String(window.profesorActual?.nombre || window.usuarioActual?.nombre || 'Docente');
    const materia = String(window.profesorActual?.materia || window.usuarioActual?.materia || '');
    return `Comparto el informe de asistencia de ${docente}${materia ? ` (${materia})` : ''}, correspondiente al periodo ${desde} al ${hasta}.`;
  }

  function opcionesPdfProfesional(reporte, archivo) {
    const anchoCaptura = Math.max(1123, Math.ceil(reporte.scrollWidth || reporte.getBoundingClientRect().width));
    const altoCaptura = Math.max(794, Math.ceil(reporte.scrollHeight || reporte.getBoundingClientRect().height));
    return {
      margin: [6, 6, 8, 6],
      filename: archivo,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        letterRendering: true,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        windowWidth: anchoCaptura,
        windowHeight: altoCaptura
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape', compress: true },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.stats-pdf-kpi', '.stats-pdf-signatures'] }
    };
  }

  async function crearPdfProfesionalBlob() {
    const reporte = construirReportePdf();
    const hostPdf = document.createElement('div');
    hostPdf.className = 'stats-pdf-render-host';
    hostPdf.setAttribute('aria-hidden', 'true');
    hostPdf.appendChild(reporte);

    const scrollAnterior = { x: window.scrollX, y: window.scrollY };
    document.body.appendChild(hostPdf);
    window.scrollTo(0, 0);
    const archivo = nombreArchivoInformePdf();

    try {
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const worker = html2pdf().set(opcionesPdfProfesional(reporte, archivo)).from(reporte).toPdf();
      const blob = await worker.outputPdf('blob');
      return { blob, archivo };
    } finally {
      hostPdf.remove();
      window.scrollTo(scrollAnterior.x, scrollAnterior.y);
    }
  }

  function descargarBlobPdf(blob, archivo) {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = archivo;
    enlace.style.display = 'none';
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  async function generarPdfProfesional() {
    if (!numero(estadisticasData?.resumen?.total)) {
      if (typeof mostrarToast === 'function') mostrarToast('No hay datos para generar el informe.', 'warning', 'Informe vacío');
      return;
    }
    if (typeof html2pdf !== 'function') {
      if (typeof mostrarToast === 'function') mostrarToast('La librería de PDF no está disponible. Recarga la página e inténtalo nuevamente.', 'error', 'PDF no disponible');
      return;
    }

    const boton = document.getElementById(IDS.pdf);
    const contenidoAnterior = boton?.innerHTML || '';
    if (boton) {
      boton.disabled = true;
      boton.classList.add('is-loading');
      boton.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Generando…';
    }

    try {
      const { blob, archivo } = await crearPdfProfesionalBlob();
      descargarBlobPdf(blob, archivo);
      if (typeof mostrarToast === 'function') mostrarToast('El informe PDF se generó correctamente.', 'success', 'Informe descargado');
    } catch (error) {
      console.error('No se pudo generar el informe PDF:', error);
      if (typeof mostrarToast === 'function') mostrarToast(error.message || 'No se pudo generar el PDF.', 'error', 'Error de PDF');
    } finally {
      if (boton) {
        boton.disabled = false;
        boton.classList.remove('is-loading');
        boton.innerHTML = contenidoAnterior;
      }
    }
  }

  function crearModalCompartirInforme() {
    // Reconstruye el modal para evitar que quede en pantalla una versión antigua sin el botón directo.
    document.getElementById('stats-share-modal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'stats-share-modal';
    modal.className = 'stats-share-modal hidden';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'stats-share-title');
    modal.innerHTML = `
      <div class="stats-share-dialog">
        <button id="stats-share-close" class="stats-share-close" type="button" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
        <div class="stats-share-heading"><span><i class="fa-solid fa-share-nodes"></i></span><div><h3 id="stats-share-title">Compartir informe PDF</h3><p id="stats-share-file">Informe preparado</p></div></div>
        <div id="stats-share-result" class="stats-share-result hidden"></div>
        <button id="stats-share-direct-telegram" class="stats-share-direct-telegram" type="button"><i class="fa-brands fa-telegram"></i><span><strong>Enviar a mi Telegram vinculado</strong><small>EduGestión enviará este PDF directamente al chat vinculado.</small></span></button>
        <button id="stats-share-native" class="stats-share-native" type="button"><i class="fa-solid fa-mobile-screen-button"></i><span><strong>Compartir archivo</strong><small>Envía el PDF como archivo adjunto desde tu dispositivo.</small></span></button>
        <div class="stats-share-divider"><span>O usa un acceso rápido</span></div>
        <div class="stats-share-channels">
          <button type="button" data-share-channel="whatsapp"><i class="fa-brands fa-whatsapp"></i><span>WhatsApp</span></button>
          <button type="button" data-share-channel="telegram"><i class="fa-brands fa-telegram"></i><span>Telegram</span></button>
          <button type="button" data-share-channel="email"><i class="fa-solid fa-envelope"></i><span>Correo</span></button>
        </div>
        <p class="stats-share-help">En computadora, los accesos rápidos descargan primero el PDF. Luego debes adjuntarlo manualmente en el mensaje abierto.</p>
        <div class="stats-share-footer">
          <button id="stats-share-download" type="button"><i class="fa-solid fa-download"></i> Descargar PDF</button>
          <button id="stats-share-copy" type="button"><i class="fa-regular fa-copy"></i> Copiar mensaje</button>
        </div>
        <section class="stats-share-history" aria-labelledby="stats-share-history-title">
          <div class="stats-share-history-head">
            <div><span>Panel de control · Fase 2.0</span><h4 id="stats-share-history-title">Historial completo de envíos</h4></div>
            <div class="stats-history-head-actions"><button id="stats-history-refresh" type="button" title="Actualizar desde el servidor"><i class="fa-solid fa-rotate"></i> Actualizar</button><button id="stats-history-clear" type="button" title="Eliminar todo el historial"><i class="fa-solid fa-trash-can"></i> Limpiar</button></div>
          </div>
          <div class="stats-share-history-summary">
            <article><strong id="stats-history-total">0</strong><span>Total</span></article>
            <article class="is-sent"><strong id="stats-history-sent">0</strong><span>Enviados</span></article>
            <article class="is-error"><strong id="stats-history-errors">0</strong><span>Errores</span></article>
          </div>
          <div class="stats-share-history-filters">
            <label><span>Buscar</span><div><i class="fa-solid fa-magnifying-glass"></i><input id="stats-history-search" type="search" placeholder="Archivo, periodo o sección"></div></label>
            <label><span>Estado</span><select id="stats-history-status"><option value="">Todos</option><option value="enviado">Enviados</option><option value="error">Errores</option></select></label>
            <label><span>Fecha</span><input id="stats-history-date" type="date"></label>
            <button id="stats-history-reset" type="button"><i class="fa-solid fa-eraser"></i> Restablecer</button>
          </div>
          <div class="stats-share-history-count"><span>Registros visibles</span><b id="stats-history-visible-count">0 de 0</b></div>
          <div id="stats-share-history-list" class="stats-share-history-list"></div>
          <p class="stats-share-history-note"><i class="fa-solid fa-circle-info"></i> El historial se guarda en el servidor y estará disponible desde cualquier dispositivo. “Reenviar” envía nuevamente el informe que está preparado en el modal.</p>
        </section>
      </div>`;
    document.body.appendChild(modal);

    document.getElementById('stats-share-close')?.addEventListener('click', cerrarModalCompartirInforme);
    document.getElementById('stats-share-direct-telegram')?.addEventListener('click', enviarInformeTelegramVinculado);
    document.getElementById('stats-share-native')?.addEventListener('click', compartirArchivoNativo);
    document.getElementById('stats-share-download')?.addEventListener('click', descargarInformeCompartirPendiente);
    document.getElementById('stats-share-copy')?.addEventListener('click', copiarMensajeInforme);
    document.getElementById('stats-history-refresh')?.addEventListener('click', () => cargarHistorialInformesTelegram());
    document.getElementById('stats-history-clear')?.addEventListener('click', limpiarHistorialInformesTelegram);
    ['stats-history-search', 'stats-history-status', 'stats-history-date'].forEach(id => {
      document.getElementById(id)?.addEventListener(id === 'stats-history-search' ? 'input' : 'change', renderHistorialInformesTelegram);
    });
    document.getElementById('stats-history-reset')?.addEventListener('click', () => {
      const search = document.getElementById('stats-history-search');
      const status = document.getElementById('stats-history-status');
      const date = document.getElementById('stats-history-date');
      if (search) search.value = '';
      if (status) status.value = '';
      if (date) date.value = '';
      renderHistorialInformesTelegram();
    });
    document.getElementById('stats-share-history-list')?.addEventListener('click', async evento => {
      const boton = evento.target.closest('[data-history-action]');
      if (!boton) return;
      const id = boton.dataset.historyId;
      if (boton.dataset.historyAction === 'delete') eliminarRegistroHistorialTelegram(id);
      if (boton.dataset.historyAction === 'resend') await reenviarRegistroHistorialTelegram(id);
    });
    modal.querySelectorAll('[data-share-channel]').forEach(boton => boton.addEventListener('click', () => abrirCanalCompartirInforme(boton.dataset.shareChannel)));
    modal.addEventListener('click', evento => { if (evento.target === modal) cerrarModalCompartirInforme(); });
  }

  function abrirModalCompartirInforme() {
    // Si el navegador conservó un modal de una fase anterior, lo reemplaza automáticamente.
    if (!document.getElementById('stats-share-direct-telegram')) {
      crearModalCompartirInforme();
    }
    const modal = document.getElementById('stats-share-modal');
    if (!modal || !informeCompartirPendiente) return;
    const nombre = document.getElementById('stats-share-file');
    if (nombre) nombre.textContent = informeCompartirPendiente.archivo;
    const resultado = document.getElementById('stats-share-result');
    if (resultado) { resultado.className = 'stats-share-result hidden'; resultado.innerHTML = ''; }
    renderHistorialInformesTelegram();
    cargarHistorialInformesTelegram({ silencioso: historialInformesTelegram.length > 0 });
    const nativo = document.getElementById('stats-share-native');
    const puedeCompartir = Boolean(navigator.share && navigator.canShare?.({ files: [informeCompartirPendiente.file] }));
    nativo?.classList.toggle('hidden', !puedeCompartir);
    modal.classList.remove('hidden');
    document.body.classList.add('stats-share-open');
  }

  function cerrarModalCompartirInforme() {
    document.getElementById('stats-share-modal')?.classList.add('hidden');
    document.body.classList.remove('stats-share-open');
  }

  async function prepararCompartirPdfProfesional() {
    if (!numero(estadisticasData?.resumen?.total)) {
      if (typeof mostrarToast === 'function') mostrarToast('No hay datos para compartir.', 'warning', 'Informe vacío');
      return;
    }
    if (typeof html2pdf !== 'function') {
      if (typeof mostrarToast === 'function') mostrarToast('La librería de PDF no está disponible.', 'error', 'PDF no disponible');
      return;
    }
    const boton = document.getElementById(IDS.share);
    const contenidoAnterior = boton?.innerHTML || '';
    if (boton) {
      boton.disabled = true;
      boton.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Preparando…';
    }
    try {
      const { blob, archivo } = await crearPdfProfesionalBlob();
      const file = new File([blob], archivo, { type: 'application/pdf', lastModified: Date.now() });
      informeCompartirPendiente = {
        blob,
        file,
        archivo,
        titulo: 'Informe de asistencia — EduGestión',
        mensaje: mensajeCompartirInforme()
      };
      abrirModalCompartirInforme();
    } catch (error) {
      console.error('No se pudo preparar el informe para compartir:', error);
      if (typeof mostrarToast === 'function') mostrarToast(error.message || 'No se pudo preparar el PDF.', 'error', 'Error al compartir');
    } finally {
      if (boton) {
        boton.disabled = false;
        boton.innerHTML = contenidoAnterior;
      }
    }
  }

  function endpointEnvioInformeTelegram() {
    const host = String(window.location.hostname || '').toLowerCase();
    return host === '127.0.0.1' || host === 'localhost'
      ? 'https://edugestion-a2xh.vercel.app/api/informe'
      : '/api/informe';
  }

  function periodoInformeCompartido() {
    const desde = document.getElementById(IDS.from)?.value || '';
    const hasta = document.getElementById(IDS.to)?.value || '';
    return desde && hasta ? `${desde} al ${hasta}` : desde || hasta || 'Periodo seleccionado';
  }

  function seccionInformeCompartido() {
    const control = document.getElementById(IDS.classFilter);
    if (!control?.value) return 'Todas las secciones';
    return control.options?.[control.selectedIndex]?.textContent?.trim() || control.value;
  }

  async function enviarInformeTelegramVinculado() {
    if (!informeCompartirPendiente) return;
    if (!String(sessionToken || '').trim()) {
      if (typeof mostrarToast === 'function') mostrarToast('Tu sesión docente no está disponible. Inicia sesión nuevamente.', 'error', 'Sesión requerida');
      return;
    }

    const boton = document.getElementById('stats-share-direct-telegram');
    const contenidoAnterior = boton?.innerHTML || '';
    if (boton) {
      boton.disabled = true;
      boton.classList.add('is-loading');
      boton.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><span><strong>Enviando al Telegram vinculado…</strong><small>No cierres esta ventana.</small></span>';
    }

    try {
      const formulario = new FormData();
      formulario.append('token', String(sessionToken));
      formulario.append('pdf', informeCompartirPendiente.file, informeCompartirPendiente.archivo);
      formulario.append('archivo', informeCompartirPendiente.archivo);
      formulario.append('mensaje', `${informeCompartirPendiente.mensaje}

Archivo enviado directamente desde EduGestión.`);
      formulario.append('periodo', periodoInformeCompartido());
      formulario.append('seccion', seccionInformeCompartido());

      const respuesta = await fetch(endpointEnvioInformeTelegram(), {
        method: 'POST',
        body: formulario
      });
      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok || datos.ok !== true) {
        const error = new Error(datos.error || 'No se pudo enviar el informe por Telegram.');
        error.code = datos.code || 'REPORT_SEND_ERROR';
        throw error;
      }

      await cargarHistorialInformesTelegram({ silencioso: true });
      mostrarResultadoEnvioTelegram(datos);
      const destino = datos.destino ? ` a ${datos.destino}` : '';
      if (typeof mostrarToast === 'function') mostrarToast(`El PDF fue enviado${destino}.`, 'success', 'Informe enviado');
      if (datos.warning && typeof mostrarToast === 'function') {
        setTimeout(() => mostrarToast(datos.warning, 'warning', 'Aviso de auditoría'), 450);
      }
    } catch (error) {
      console.error('No se pudo enviar el informe al Telegram vinculado:', error);
      let mensaje = error.message || 'No se pudo enviar el informe por Telegram.';
      if (error.code === 'TELEGRAM_NOT_LINKED') mensaje = 'Tu cuenta docente no tiene un Telegram vinculado. Vincúlalo desde el botón superior de Telegram.';
      if (error.code === 'PDF_TOO_LARGE') mensaje = 'El PDF es demasiado pesado. Reduce el periodo o utiliza Descargar PDF.';
      if (error.code === 'SESSION_REQUIRED' || error.code === 'UNAUTHORIZED') mensaje = 'La sesión venció. Inicia sesión nuevamente y repite el envío.';
      await cargarHistorialInformesTelegram({ silencioso: true });
      if (typeof mostrarToast === 'function') mostrarToast(mensaje, 'error', 'No se pudo enviar');
    } finally {
      if (boton) {
        boton.disabled = false;
        boton.classList.remove('is-loading');
        boton.innerHTML = contenidoAnterior;
      }
    }
  }

  async function compartirArchivoNativo() {
    if (!informeCompartirPendiente || !navigator.share) return;
    try {
      await navigator.share({
        title: informeCompartirPendiente.titulo,
        text: informeCompartirPendiente.mensaje,
        files: [informeCompartirPendiente.file]
      });
      cerrarModalCompartirInforme();
      if (typeof mostrarToast === 'function') mostrarToast('El informe fue enviado al menú de compartir.', 'success', 'Informe compartido');
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('No se pudo compartir el archivo:', error);
        if (typeof mostrarToast === 'function') mostrarToast('No se pudo abrir el menú para compartir. Usa uno de los accesos rápidos.', 'warning', 'Compartir no disponible');
      }
    }
  }

  function descargarInformeCompartirPendiente() {
    if (!informeCompartirPendiente) return;
    descargarBlobPdf(informeCompartirPendiente.blob, informeCompartirPendiente.archivo);
    if (typeof mostrarToast === 'function') mostrarToast('PDF descargado. Ya puedes adjuntarlo.', 'success', 'Informe listo');
  }

  function abrirCanalCompartirInforme(canal) {
    if (!informeCompartirPendiente) return;
    descargarInformeCompartirPendiente();
    const texto = encodeURIComponent(`${informeCompartirPendiente.mensaje}\n\nAdjunto el informe PDF generado por EduGestión.`);
    const asunto = encodeURIComponent('Informe de asistencia — EduGestión');
    const destinos = {
      whatsapp: `https://wa.me/?text=${texto}`,
      telegram: `https://t.me/share/url?url=&text=${texto}`,
      email: `mailto:?subject=${asunto}&body=${texto}`
    };
    const destino = destinos[canal];
    if (destino) window.open(destino, '_blank', 'noopener,noreferrer');
  }

  async function copiarMensajeInforme() {
    if (!informeCompartirPendiente) return;
    try {
      await navigator.clipboard.writeText(`${informeCompartirPendiente.mensaje}\n\nAdjunto el informe PDF generado por EduGestión.`);
      if (typeof mostrarToast === 'function') mostrarToast('Mensaje copiado al portapapeles.', 'success', 'Texto copiado');
    } catch {
      if (typeof mostrarToast === 'function') mostrarToast('No se pudo copiar automáticamente.', 'warning', 'Copia no disponible');
    }
  }

  function imprimirInforme() {
    if (!numero(estadisticasData?.resumen?.total)) {
      if (typeof mostrarToast === 'function') mostrarToast('No hay datos para imprimir.', 'warning', 'Informe vacío');
      return;
    }
    document.body.classList.add('stats-printing');
    window.addEventListener('afterprint', () => document.body.classList.remove('stats-printing'), { once: true });
    window.print();
    setTimeout(() => document.body.classList.remove('stats-printing'), 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', crearInterfazEstadisticas, { once: true });
  else crearInterfazEstadisticas();
})();
/* EDUGESTION_REPORT_TELEGRAM_SEND_V1_READY */
/* EDUGESTION_STATS_PANEL_V1_END */


/* EDUGESTION_USER_GUIDE_V2_START */
(() => {
  function iniciarGuiaEduGestion() {
    const modal = document.getElementById('user-guide-modal');
    if (!modal || modal.dataset.guideReady === 'true') return;

    modal.dataset.guideReady = 'true';

    const tabs = [...modal.querySelectorAll('[data-guide-tab]')];
    const panels = [...modal.querySelectorAll('[data-guide-panel]')];

    function seleccionarPestana(nombre) {
      tabs.forEach(tab => {
        const activa = tab.dataset.guideTab === nombre;
        tab.classList.toggle('is-active', activa);
        tab.setAttribute('aria-selected', activa ? 'true' : 'false');
      });

      panels.forEach(panel => {
        panel.classList.toggle('is-active', panel.dataset.guidePanel === nombre);
      });
    }

    function abrirGuia(pestana = 'access') {
      seleccionarPestana(pestana);
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('user-guide-open');

      window.setTimeout(() => {
        modal.querySelector('.user-guide-modal__close')?.focus();
      }, 50);
    }

    function cerrarGuia() {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('user-guide-open');
    }

    document.addEventListener('click', event => {
      const abrir = event.target.closest('[data-open-user-guide="true"]');
      if (abrir) {
        event.preventDefault();
        abrirGuia(abrir.dataset.guideStart || 'access');
        return;
      }

      const cerrar = event.target.closest('[data-close-user-guide="true"]');
      if (cerrar) {
        event.preventDefault();
        cerrarGuia();
        return;
      }

      const tab = event.target.closest('[data-guide-tab]');
      if (tab && modal.contains(tab)) {
        event.preventDefault();
        seleccionarPestana(tab.dataset.guideTab);
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
        cerrarGuia();
      }
    });

    window.abrirGuiaEduGestion = abrirGuia;
    window.cerrarGuiaEduGestion = cerrarGuia;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarGuiaEduGestion, { once: true });
  } else {
    iniciarGuiaEduGestion();
  }
})();
/* EDUGESTION_USER_GUIDE_V2_END */


/* EDUGESTION_HORARIO_HERO_FIX_V1_20260724 */
(() => {
  function agregarCintilloHorario() {
    const section = document.getElementById('section-horario');
    if (!section || section.querySelector('.schedule-institutional-hero')) return;

    const hero = document.createElement('header');
    hero.className = 'platform-hero platform-hero--schedule schedule-institutional-hero';
    hero.innerHTML = `
      <div class="platform-hero__copy">
        <span class="platform-hero__eyebrow">
          <i class="fa-solid fa-clock"></i>
          Organización semanal
        </span>
        <h2>Horario del docente</h2>
        <p>Organiza tus bloques de clase por día, año, sección y turno desde una agenda clara y adaptable.</p>
        <div class="platform-hero__badges">
          <span><i class="fa-solid fa-calendar-days"></i> Agenda semanal</span>
          <span><i class="fa-solid fa-school"></i> Cursos y secciones</span>
          <span><i class="fa-solid fa-mobile-screen"></i> Adaptado a celular</span>
        </div>
      </div>
      <div class="platform-hero__icon">
        <i class="fa-solid fa-calendar-week"></i>
      </div>
    `;

    section.insertBefore(hero, section.firstElementChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', agregarCintilloHorario, { once: true });
  } else {
    agregarCintilloHorario();
  }
})();


// Menú lateral responsive para celulares: se abre con un botón y se oculta solo.
(() => {
  const MOBILE_BREAKPOINT = 900;
  const AUTO_CLOSE_MS = 5500;
  let closeTimer = null;

  function initMobileNavigation() {
    const sidebar = document.querySelector('.app-sidebar');
    const nav = document.getElementById('app-nav');
    const toggle = document.getElementById('mobile-nav-toggle');
    if (!sidebar || !nav || !toggle) return;

    const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

    const setOpen = (open) => {
      if (!isMobile()) open = false;
      sidebar.classList.toggle('is-mobile-open', open);
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
      toggle.querySelector('i')?.classList.toggle('fa-xmark', open);
      toggle.querySelector('i')?.classList.toggle('fa-bars', !open);
      document.body.classList.toggle('mobile-nav-open', open);
      clearTimeout(closeTimer);
      if (open) closeTimer = setTimeout(() => setOpen(false), AUTO_CLOSE_MS);
    };

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      setOpen(!sidebar.classList.contains('is-mobile-open'));
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('.nav-item') && isMobile()) {
        setTimeout(() => setOpen(false), 160);
      }
    });

    sidebar.addEventListener('pointerdown', () => {
      if (sidebar.classList.contains('is-mobile-open')) {
        clearTimeout(closeTimer);
        closeTimer = setTimeout(() => setOpen(false), AUTO_CLOSE_MS);
      }
    });

    document.addEventListener('click', (event) => {
      if (isMobile() && sidebar.classList.contains('is-mobile-open') &&
          !sidebar.contains(event.target) && !toggle.contains(event.target)) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });

    window.addEventListener('resize', () => {
      if (!isMobile()) setOpen(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNavigation, { once: true });
  } else {
    initMobileNavigation();
  }
})();


/* EDUGESTION_SETTINGS_V1_START */
(() => {
  const STORAGE_KEY = 'edugestion_ui_settings_v1';
  const DEFAULTS = {
    fontSize: 16,
    fontFamily: 'system',
    theme: 'light',
    density: 'comfortable',
    reduceMotion: false
  };

  const FONT_FAMILIES = {
    system: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    arial: 'Arial, Helvetica, sans-serif',
    verdana: 'Verdana, Geneva, sans-serif',
    trebuchet: '"Trebuchet MS", Arial, sans-serif',
    georgia: 'Georgia, "Times New Roman", serif'
  };

  function cargarPreferencias() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...DEFAULTS, ...saved };
    } catch (_) {
      return { ...DEFAULTS };
    }
  }

  let prefs = cargarPreferencias();
  const mediaDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function temaReal(theme) {
    if (theme === 'system') return mediaDark?.matches ? 'dark' : 'light';
    return theme === 'dark' ? 'dark' : 'light';
  }

  function aplicarPreferencias() {
    const root = document.documentElement;
    const body = document.body;
    const fontSize = Math.min(20, Math.max(14, Number(prefs.fontSize) || 16));
    root.style.fontSize = `${fontSize}px`;
    root.style.setProperty('--edu-font-family', FONT_FAMILIES[prefs.fontFamily] || FONT_FAMILIES.system);
    body.dataset.edugestionTheme = temaReal(prefs.theme);
    body.dataset.edugestionThemePreference = prefs.theme;
    body.dataset.edugestionDensity = prefs.density === 'compact' ? 'compact' : 'comfortable';
    body.classList.toggle('edugestion-reduce-motion', !!prefs.reduceMotion);
    body.classList.add('edugestion-customized');
    actualizarControles();
  }

  function guardarPreferencias() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    aplicarPreferencias();
  }

  function textoTamano(size) {
    return ({14:'Pequeña',16:'Normal',18:'Grande',20:'Muy grande'})[String(size)] || `${size}px`;
  }

  function actualizarControles() {
    const range = document.getElementById('settings-font-size');
    const value = document.getElementById('settings-font-size-value');
    const family = document.getElementById('settings-font-family');
    const motion = document.getElementById('settings-reduce-motion');
    if (range) range.value = String(prefs.fontSize);
    if (value) value.textContent = textoTamano(prefs.fontSize);
    if (family) family.value = prefs.fontFamily;
    if (motion) motion.checked = !!prefs.reduceMotion;

    document.querySelectorAll('[data-font-size]').forEach(btn => {
      btn.classList.toggle('is-active', Number(btn.dataset.fontSize) === Number(prefs.fontSize));
    });
    document.querySelectorAll('.settings-theme-option').forEach(btn => {
      const active = btn.dataset.theme === prefs.theme;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-checked', String(active));
    });
    document.querySelectorAll('#settings-density [data-density]').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.density === prefs.density);
    });
  }

  function abrirConfiguracion() {
    const tab = document.getElementById('tab-configuracion');
    const section = document.getElementById('section-configuracion');
    if (!tab || !section) return;
    if (typeof cambiarPestana === 'function') {
      cambiarPestana(tab, section);
    } else {
      document.querySelectorAll('#app-nav .nav-item').forEach(item => item.classList.toggle('is-active', item === tab));
      document.querySelectorAll('#app-main > section').forEach(sec => sec.classList.toggle('hidden', sec !== section));
    }
    actualizarControles();
  }

  function initSettings() {
    aplicarPreferencias();

    document.getElementById('tab-configuracion')?.addEventListener('click', abrirConfiguracion);

    document.getElementById('settings-font-size')?.addEventListener('input', event => {
      prefs.fontSize = Number(event.target.value);
      guardarPreferencias();
    });

    document.querySelectorAll('[data-font-size]').forEach(btn => btn.addEventListener('click', () => {
      prefs.fontSize = Number(btn.dataset.fontSize);
      guardarPreferencias();
    }));

    document.getElementById('settings-font-family')?.addEventListener('change', event => {
      prefs.fontFamily = event.target.value;
      guardarPreferencias();
    });

    document.querySelectorAll('.settings-theme-option').forEach(btn => btn.addEventListener('click', () => {
      prefs.theme = btn.dataset.theme;
      guardarPreferencias();
    }));

    document.querySelectorAll('#settings-density [data-density]').forEach(btn => btn.addEventListener('click', () => {
      prefs.density = btn.dataset.density;
      guardarPreferencias();
    }));

    document.getElementById('settings-reduce-motion')?.addEventListener('change', event => {
      prefs.reduceMotion = event.target.checked;
      guardarPreferencias();
    });

    document.getElementById('settings-reset')?.addEventListener('click', () => {
      prefs = { ...DEFAULTS };
      guardarPreferencias();
      if (typeof showToast === 'function') showToast('Configuración restaurada', 'Se aplicaron los valores predeterminados.', 'success');
    });

    mediaDark?.addEventListener?.('change', () => {
      if (prefs.theme === 'system') aplicarPreferencias();
    });
  }

  // Aplicar lo antes posible para evitar destellos de tema al cargar.
  aplicarPreferencias();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettings, { once: true });
  } else {
    initSettings();
  }
})();
/* EDUGESTION_SETTINGS_V1_END */



/* =========================================================
   EduGestion · Planificacion con IA
   ========================================================= */
(() => {
  const btn = document.getElementById('btn-planificacion-ia');
  if (!btn) return;

  const grado = document.getElementById('plan-ia-grado');
  const area = document.getElementById('plan-ia-area');
  const fecha = document.getElementById('plan-ia-fecha');
  const tema = document.getElementById('plan-ia-tema');
  const duracion = document.getElementById('plan-ia-duracion');
  const objetivo = document.getElementById('plan-ia-objetivo');
  const tipo = document.getElementById('plan-ia-tipo');

  if (fecha && !fecha.value) {
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    fecha.value = `${y}-${m}-${d}`;
  }

  btn.addEventListener('click', () => {
    const temaValor = String(tema?.value || '').trim();
    const objetivoValor = String(objetivo?.value || '').trim();
    if (!temaValor) {
      if (typeof mostrarToast === 'function') mostrarToast('Escribe primero el tema de la clase.', 'warning', 'Planificación con IA');
      tema?.focus();
      return;
    }

    const fechaValor = fecha?.value ? new Date(`${fecha.value}T12:00:00`) : null;
    const fechaBonita = fechaValor && !Number.isNaN(fechaValor.getTime())
      ? new Intl.DateTimeFormat('es-VE', { day:'numeric', month:'long', year:'numeric' }).format(fechaValor)
      : 'fecha por definir';

    let baseCurricular = null;
    try {
      const guardada = JSON.parse(localStorage.getItem('edugestion_cuadernillo_ef_seleccion') || 'null');
      if (guardada && guardada.tema && String(guardada.tema).trim() === temaValor) baseCurricular = guardada;
    } catch (e) {}

    const bloqueCurricular = baseCurricular ? `\n\nBASE CURRICULAR OBLIGATORIA - Cuadernillo Curricular MPPE · Educación Física:\n- Grado/Año curricular: ${baseCurricular.grado || 'No indicado'}\n- Tema generador: ${baseCurricular.tema || temaValor}${baseCurricular.temaIndispensable ? `\n- Tema indispensable: ${baseCurricular.temaIndispensable}` : ''}${baseCurricular.intencionalidad ? `\n- Intencionalidad pedagógica: ${baseCurricular.intencionalidad}` : ''}${baseCurricular.tejido ? `\n- Tejido temático: ${baseCurricular.tejido}` : ''}${baseCurricular.referentes ? `\n- Referentes teórico-prácticos: ${baseCurricular.referentes}` : ''}\n- Fuente: Cuadernillo Curricular MPPE · Educación Física${baseCurricular.pagina ? `, página ${baseCurricular.pagina}` : ''}\n\nREGLA IMPORTANTE: Usa esta base curricular como referencia principal. No sustituyas los contenidos por otro currículo ni inventes referentes que no aparezcan aquí. Puedes proponer estrategias, actividades, recursos y formas de evaluación coherentes con esta base.` : '';

    const prompt = `Prepara una planificación docente completa y práctica en español, sin realizar búsqueda web.\n\nDatos de la clase:\n- Grado/Año: ${grado?.value || 'No indicado'}\n- Área: ${area?.value || 'No indicada'}\n- Tema: ${temaValor}\n- Fecha: ${fechaBonita}\n- Duración: ${duracion?.value || '60 minutos'}\n- Tipo de actividad: ${tipo?.value || 'Clase completa'}\n- Objetivo indicado por el docente: ${objetivoValor || 'Propón un objetivo claro y alcanzable relacionado con el tema.'}${bloqueCurricular}\n\nOrganiza la respuesta con estos apartados: Título, Propósito u objetivo, Aprendizajes esperados, Materiales, Inicio, Desarrollo paso a paso, Cierre, Evaluación formativa, Adaptaciones o variantes, y Observaciones para el docente. Usa lenguaje claro, aplicable en aula y actividades realistas para el tiempo indicado.`;

    const tabIA = document.getElementById('tab-gemini');
    const inputIA = document.getElementById('gemini-input');
    const formIA = document.getElementById('gemini-form');
    if (!tabIA || !inputIA || !formIA) {
      if (typeof mostrarToast === 'function') mostrarToast('No se pudo abrir el Asistente IA.', 'warning', 'Planificación con IA');
      return;
    }

    tabIA.click();
    inputIA.value = prompt;
    setTimeout(() => {
      inputIA.focus();
      if (typeof formIA.requestSubmit === 'function') formIA.requestSubmit();
      else formIA.dispatchEvent(new Event('submit', { bubbles:true, cancelable:true }));
    }, 180);
  });
})();

/* =========================================================
   EduGestion · Asistente IA Gemini
   ========================================================= */
(() => {
  const tab = document.getElementById('tab-gemini');
  const section = document.getElementById('section-gemini');
  const form = document.getElementById('gemini-form');
  const input = document.getElementById('gemini-input');
  const conversation = document.getElementById('gemini-conversation');
  const send = document.getElementById('gemini-send');
  if (!tab || !section) return;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function asegurarEstilosGeminiRich() {
    if (document.getElementById('gemini-rich-styles')) return;
    const style = document.createElement('style');
    style.id = 'gemini-rich-styles';
    style.textContent = `
      .gemini-rich{line-height:1.7;color:inherit;overflow-wrap:anywhere}
      .gemini-rich p{margin:.5rem 0}
      .gemini-rich h2,.gemini-rich h3,.gemini-rich h4{margin:1rem 0 .45rem;font-weight:800;line-height:1.3;color:inherit}
      .gemini-rich h2{font-size:1.18rem}
      .gemini-rich h3{font-size:1.08rem}
      .gemini-rich h4{font-size:1rem}
      .gemini-rich ul,.gemini-rich ol{margin:.55rem 0 .7rem 1.35rem;padding:0}
      .gemini-rich li{margin:.28rem 0;padding-left:.12rem}
      .gemini-rich ul{list-style:disc}
      .gemini-rich ol{list-style:decimal}
      .gemini-rich strong{font-weight:800}
      .gemini-rich em{font-style:italic}
      .gemini-rich code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;background:rgba(15,23,42,.07);padding:.08rem .3rem;border-radius:.35rem;font-size:.92em}
      .gemini-rich hr{border:0;border-top:1px solid rgba(100,116,139,.22);margin:1rem 0}
      body.edugestion-dark .gemini-rich code{background:rgba(255,255,255,.1)}
    `;
    document.head.appendChild(style);
  }

  function formatoInlineGemini(texto) {
    let html = esc(texto);
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    html = html.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    return html;
  }

  function markdownGemini(texto) {
    asegurarEstilosGeminiRich();
    const lineas = String(texto ?? '').replace(/\r\n/g, '\n').split('\n');
    const salida = [];
    let lista = null;

    const cerrarLista = () => {
      if (!lista) return;
      salida.push(lista === 'ol' ? '</ol>' : '</ul>');
      lista = null;
    };

    for (const original of lineas) {
      const linea = original.trim();
      if (!linea) { cerrarLista(); continue; }

      if (/^---+$/.test(linea)) { cerrarLista(); salida.push('<hr>'); continue; }

      const h = linea.match(/^(#{1,4})\s+(.+)$/);
      if (h) {
        cerrarLista();
        const nivel = Math.min(4, Math.max(2, h[1].length + 1));
        salida.push(`<h${nivel}>${formatoInlineGemini(h[2])}</h${nivel}>`);
        continue;
      }

      const ol = linea.match(/^\d+[.)]\s+(.+)$/);
      if (ol) {
        if (lista !== 'ol') { cerrarLista(); salida.push('<ol>'); lista = 'ol'; }
        salida.push(`<li>${formatoInlineGemini(ol[1])}</li>`);
        continue;
      }

      const ul = linea.match(/^[-•*]\s+(.+)$/);
      if (ul) {
        if (lista !== 'ul') { cerrarLista(); salida.push('<ul>'); lista = 'ul'; }
        salida.push(`<li>${formatoInlineGemini(ul[1])}</li>`);
        continue;
      }

      cerrarLista();
      salida.push(`<p>${formatoInlineGemini(linea)}</p>`);
    }

    cerrarLista();
    return salida.join('');
  }

  function abrirGemini() {
    if (typeof cambiarPestana === 'function') {
      cambiarPestana(tab, section);
    } else {
      document.querySelectorAll('#app-nav .nav-item').forEach(item => item.classList.toggle('is-active', item === tab));
      document.querySelectorAll('#app-main > section').forEach(sec => sec.classList.toggle('hidden', sec !== section));
    }
    setTimeout(() => input?.focus(), 120);
  }

  function agregarMensaje(tipo, texto, fuentes = []) {
    if (!conversation) return;
    const row = document.createElement('div');
    row.className = `gemini-message gemini-message--${tipo}`;
    const icon = tipo === 'user' ? 'fa-user' : 'fa-wand-magic-sparkles';
    const label = tipo === 'user' ? 'Tú' : 'Asistente IA';
    const sourceHtml = Array.isArray(fuentes) && fuentes.length
      ? `<div class="gemini-sources"><strong>Fuentes consultadas</strong>${fuentes.map((f,i)=>`<a href="${esc(f.url)}" target="_blank" rel="noopener noreferrer">${i+1}. ${esc(f.title || f.url)}</a>`).join('')}</div>`
      : '';
    const contenido = tipo === 'assistant'
      ? `<div class="gemini-rich">${markdownGemini(texto)}</div>`
      : `<p>${esc(texto)}</p>`;
    row.innerHTML = `<div class="gemini-avatar"><i class="fa-solid ${icon}"></i></div><div class="gemini-bubble"><strong>${label}</strong>${contenido}${sourceHtml}</div>`;
    conversation.appendChild(row);
    conversation.scrollTop = conversation.scrollHeight;
  }

  async function consultarGemini(message) {
    const texto = String(message || '').trim();
    if (!texto) return;
    agregarMensaje('user', texto);
    if (input) input.value = '';
    if (send) { send.disabled = true; send.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Consultando…'; }

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ message: texto })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) throw new Error(data?.message || 'No se pudo consultar Gemini.');
      agregarMensaje('assistant', data.answer || 'Gemini no devolvió una respuesta.', data.sources || []);
    } catch (error) {
      const local = location.protocol === 'file:';
      const msg = local
        ? 'La interfaz está lista, pero la consulta con Gemini necesita ejecutarse desde la versión publicada en Vercel. Terminaremos de probarla después de subir los cambios.'
        : (error?.message || 'No se pudo conectar con Gemini en este momento.');
      agregarMensaje('assistant', msg);
      if (typeof mostrarToast === 'function') mostrarToast(msg, 'warning', 'Asistente IA');
    } finally {
      if (send) { send.disabled = false; send.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Consultar Gemini'; }
    }
  }

  tab.addEventListener('click', abrirGemini);
  form?.addEventListener('submit', event => { event.preventDefault(); consultarGemini(input?.value); });
  input?.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); consultarGemini(input.value); }
  });
  document.querySelectorAll('[data-gemini-prompt]').forEach(btn => btn.addEventListener('click', () => {
    abrirGemini();
    if (input) input.value = btn.dataset.geminiPrompt || '';
    input?.focus();
  }));
})();


/* =========================================================
   EduGestion · Estudiantes: observaciones pedagógicas con IA
   ========================================================= */
(() => {
  const btn = document.getElementById('btn-estudiante-ia');
  const btnCargar = document.getElementById('btn-estudiante-ia-cargar');
  if (!btn) return;

  const nombre = document.getElementById('est-ia-nombre');
  const grado = document.getElementById('est-ia-grado');
  const seccion = document.getElementById('est-ia-seccion');
  const tipo = document.getElementById('est-ia-tipo');
  const extension = document.getElementById('est-ia-extension');
  const notas = document.getElementById('est-ia-notas');

  const cargarFicha = () => {
    const nombreFicha = document.getElementById('reg-nombre');
    const gradoFicha = document.getElementById('reg-ano');
    const seccionFicha = document.getElementById('reg-seccion');
    const obsFicha = document.getElementById('reg-observaciones');
    if (nombre && nombreFicha?.value) nombre.value = nombreFicha.value;
    if (grado && gradoFicha?.value) grado.value = gradoFicha.options?.[gradoFicha.selectedIndex]?.text || gradoFicha.value;
    if (seccion && seccionFicha?.value) seccion.value = seccionFicha.value;
    if (notas && obsFicha?.value && !notas.value.trim()) notas.value = obsFicha.value;
    if (typeof mostrarToast === 'function') mostrarToast('Datos cargados desde la ficha del estudiante.', 'success', 'Observaciones con IA');
  };

  btnCargar?.addEventListener('click', cargarFicha);

  btn.addEventListener('click', () => {
    const nombreValor = String(nombre?.value || '').trim();
    const notasValor = String(notas?.value || '').trim();
    if (!nombreValor) {
      if (typeof mostrarToast === 'function') mostrarToast('Indica el nombre del estudiante.', 'warning', 'Observaciones con IA');
      nombre?.focus();
      return;
    }
    if (!notasValor) {
      if (typeof mostrarToast === 'function') mostrarToast('Escribe primero algunas notas del estudiante.', 'warning', 'Observaciones con IA');
      notas?.focus();
      return;
    }

    const prompt = `Redacta en español una ${tipo?.value || 'observación pedagógica general'} sobre el estudiante indicado, en un tono profesional, respetuoso, constructivo y apropiado para un contexto escolar. No realices búsqueda web y no inventes información que no aparezca en mis notas.\n\nDatos aportados por el docente:\n- Estudiante: ${nombreValor}\n- Grado/Año: ${grado?.value || 'No indicado'}\n- Sección: ${seccion?.value || 'No indicada'}\n- Extensión deseada: ${extension?.value || 'breve'}\n- Notas del docente: ${notasValor}\n\nRedacta el texto listo para copiar. Evita diagnósticos, etiquetas o afirmaciones no sustentadas. Resalta fortalezas de forma concreta y, si corresponde, plantea aspectos por mejorar y una recomendación práctica con lenguaje positivo.`;

    const tabIA = document.getElementById('tab-gemini');
    const inputIA = document.getElementById('gemini-input');
    const formIA = document.getElementById('gemini-form');
    if (!tabIA || !inputIA || !formIA) {
      if (typeof mostrarToast === 'function') mostrarToast('No se pudo abrir el Asistente IA.', 'warning', 'Observaciones con IA');
      return;
    }

    tabIA.click();
    inputIA.value = prompt;
    setTimeout(() => {
      inputIA.focus();
      if (typeof formIA.requestSubmit === 'function') formIA.requestSubmit();
      else formIA.dispatchEvent(new Event('submit', { bubbles:true, cancelable:true }));
    }, 180);
  });
})();

/* =========================================================
   EduGestion · Mis respuestas IA
   Guarda, busca y reutiliza respuestas útiles de Gemini.
   Los datos se conservan en este navegador (localStorage).
   ========================================================= */
(() => {
  function iniciarRespuestasIAModulo() {
  const STORAGE_KEY = 'edugestion_respuestas_ia_v1';
  const conversation = document.getElementById('gemini-conversation');
  const tabGemini = document.getElementById('tab-gemini');
  if (!conversation || !tabGemini) return false;

  const escIA = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function leerGuardadas() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (_) { return []; }
  }

  function escribirGuardadas(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function idIA() {
    return `ia_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  }

  function fechaBonitaIA(iso) {
    try {
      return new Intl.DateTimeFormat('es-VE', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'}).format(new Date(iso));
    } catch (_) { return iso || ''; }
  }

  function detectarOrigen() {
    const mensajes = [...conversation.querySelectorAll('.gemini-message--user .gemini-bubble p')];
    const ultimo = mensajes.at(-1)?.textContent?.toLowerCase() || '';
    if (ultimo.includes('planificación') || ultimo.includes('planificacion')) return 'Planificación';
    if (ultimo.includes('estudiante') || ultimo.includes('boletín') || ultimo.includes('boletin') || ultimo.includes('representante')) return 'Estudiantes';
    if (ultimo.includes('efeméride') || ultimo.includes('efemeride') || ultimo.includes('fecha:')) return 'Calendario';
    if (ultimo.includes('biblioteca') || ultimo.includes('recurso') || ultimo.includes('guía de estudio') || ultimo.includes('guia de estudio')) return 'Biblioteca digital';
    return 'Asistente IA';
  }

  function sugerirCategoria(texto) {
    const t = String(texto || '').toLowerCase();
    if (t.includes('planificación') || t.includes('planificacion') || t.includes('inicio') && t.includes('desarrollo') && t.includes('cierre')) return 'Planificación';
    if (t.includes('observación') || t.includes('observacion') || t.includes('estudiante')) return 'Observación pedagógica';
    if (t.includes('actividad')) return 'Actividad';
    if (t.includes('resumen')) return 'Resumen';
    if (t.includes('pregunta')) return 'Preguntas';
    if (t.includes('guía') || t.includes('guia')) return 'Guía de estudio';
    return 'General';
  }

  function asegurarEstilosGuardadosIA() {
    if (document.getElementById('respuestas-ia-styles')) return;
    const style = document.createElement('style');
    style.id = 'respuestas-ia-styles';
    style.textContent = `
      .gemini-save-row{display:flex;justify-content:flex-end;gap:.55rem;flex-wrap:wrap;margin-top:.8rem;padding-top:.7rem;border-top:1px solid rgba(100,116,139,.18)}
      .gemini-response-action{border:0;border-radius:10px;padding:.58rem .82rem;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:.45rem;min-height:40px}
      .gemini-response-action:hover{filter:brightness(.97)}
      .gemini-copy-response{background:#f1f5f9;color:#334155}
      .gemini-save-response{background:#eef2ff;color:#4338ca}
      .gemini-print-response{background:#ecfdf5;color:#047857}
      body.edugestion-dark .gemini-copy-response{background:rgba(148,163,184,.16);color:#e2e8f0}
      body.edugestion-dark .gemini-save-response{background:rgba(99,102,241,.18);color:#c7d2fe}
      body.edugestion-dark .gemini-print-response{background:rgba(16,185,129,.16);color:#a7f3d0}
      @media(max-width:620px){.gemini-save-row{justify-content:stretch}.gemini-response-action{flex:1 1 100%}}
      .ia-saved-hero{background:linear-gradient(135deg,#312e81,#4f46e5 55%,#7c3aed);color:#fff;border-radius:24px;padding:1.4rem 1.55rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1rem;box-shadow:0 18px 42px rgba(79,70,229,.18)}
      .ia-saved-hero h2{font-size:1.45rem;font-weight:900;margin:.2rem 0}.ia-saved-hero p{opacity:.9;margin:0}.ia-saved-hero__icon{font-size:2rem;opacity:.9}
      .ia-saved-tools{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:.8rem;margin-bottom:1rem}
      .ia-saved-tools input,.ia-saved-tools select{width:100%;border:1px solid #dbe3ef;border-radius:14px;padding:.82rem 1rem;background:#fff;color:#0f172a}
      .ia-saved-list{display:grid;gap:.85rem}
      .ia-saved-card{background:#fff;border:1px solid #e6ebf2;border-radius:18px;padding:1rem 1.05rem;box-shadow:0 8px 24px rgba(15,23,42,.05)}
      .ia-saved-card__top{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}.ia-saved-card h3{font-size:1rem;font-weight:900;color:#0f172a;margin:0}.ia-saved-meta{display:flex;flex-wrap:wrap;gap:.4rem;margin:.45rem 0 .7rem}.ia-saved-meta span{font-size:.75rem;background:#f1f5f9;color:#475569;border-radius:999px;padding:.28rem .55rem;font-weight:700}
      .ia-saved-preview{white-space:pre-wrap;color:#475569;line-height:1.55;max-height:9rem;overflow:hidden}.ia-saved-actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.85rem}.ia-saved-actions button{border:0;border-radius:10px;padding:.55rem .75rem;font-weight:800;cursor:pointer;background:#f1f5f9;color:#334155}.ia-saved-actions button[data-action="reuse"]{background:#4f46e5;color:#fff}.ia-saved-actions button[data-action="delete"]{background:#fff1f2;color:#be123c}
      .ia-saved-empty{background:#fff;border:1px dashed #cbd5e1;border-radius:18px;padding:2rem;text-align:center;color:#64748b}.ia-saved-empty i{font-size:2rem;color:#818cf8;margin-bottom:.6rem}
      .ia-save-modal{position:fixed;inset:0;background:rgba(15,23,42,.58);display:grid;place-items:center;z-index:9999;padding:1rem}.ia-save-modal.hidden{display:none}.ia-save-dialog{width:min(560px,100%);background:#fff;border-radius:22px;padding:1.15rem;box-shadow:0 24px 70px rgba(15,23,42,.3)}.ia-save-dialog h3{font-weight:900;font-size:1.2rem;margin:0 0 .25rem}.ia-save-dialog p{color:#64748b;margin:0 0 1rem}.ia-save-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}.ia-save-field{display:grid;gap:.35rem}.ia-save-field.full{grid-column:1/-1}.ia-save-field label{font-weight:800;color:#334155;font-size:.83rem}.ia-save-field input,.ia-save-field select{border:1px solid #dbe3ef;border-radius:12px;padding:.72rem .8rem;width:100%}.ia-save-actions{display:flex;justify-content:flex-end;gap:.6rem;margin-top:1rem}.ia-save-actions button{border:0;border-radius:11px;padding:.68rem .9rem;font-weight:800;cursor:pointer}.ia-save-cancel{background:#f1f5f9;color:#334155}.ia-save-confirm{background:#4f46e5;color:#fff}
      body.edugestion-dark .ia-saved-card,body.edugestion-dark .ia-saved-empty,body.edugestion-dark .ia-save-dialog,body.edugestion-dark .ia-saved-tools input,body.edugestion-dark .ia-saved-tools select{background:#111827;color:#e5e7eb;border-color:#334155}body.edugestion-dark .ia-saved-card h3,body.edugestion-dark .ia-save-dialog h3,body.edugestion-dark .ia-save-field label{color:#f8fafc}body.edugestion-dark .ia-saved-preview{color:#cbd5e1}body.edugestion-dark .ia-saved-meta span{background:#1f2937;color:#cbd5e1}
      @media(max-width:700px){.ia-saved-tools,.ia-save-grid{grid-template-columns:1fr}.ia-save-field.full{grid-column:auto}.ia-saved-card__top{flex-direction:column}}
    `;
    document.head.appendChild(style);
  }

  function crearModuloGuardados() {
    asegurarEstilosGuardadosIA();
    if (document.getElementById('tab-respuestas-ia')) return;
    const nav = tabGemini.parentElement;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.id = 'tab-respuestas-ia';
    tab.className = 'nav-item';
    tab.dataset.title = 'Mis respuestas IA';
    tab.dataset.description = 'Guarda y reutiliza las respuestas útiles que genera Gemini.';
    tab.innerHTML = '<i class="fa-solid fa-bookmark"></i><span>Mis respuestas IA</span>';
    tabGemini.insertAdjacentElement('afterend', tab);

    const main = document.getElementById('app-main') || document.querySelector('main');
    if (!main) return;
    const section = document.createElement('section');
    section.id = 'section-respuestas-ia';
    section.className = 'hidden max-w-[1400px] mx-auto';
    section.innerHTML = `
      <header class="ia-saved-hero"><div><small><i class="fa-solid fa-sparkles"></i> Biblioteca personal de Gemini</small><h2>Mis respuestas IA</h2><p>Guarda planificaciones, actividades, observaciones, resúmenes y otras respuestas para reutilizarlas cuando quieras.</p></div><div class="ia-saved-hero__icon"><i class="fa-solid fa-bookmark"></i></div></header>
      <div class="ia-saved-tools"><input id="ia-saved-search" type="search" placeholder="Buscar por título, categoría, origen o contenido..."><select id="ia-saved-filter"><option value="">Todas las categorías</option></select></div>
      <div id="ia-saved-list" class="ia-saved-list"></div>`;
    main.appendChild(section);

    tab.addEventListener('click', () => {
      if (typeof cambiarPestana === 'function') cambiarPestana(tab, section);
      else {
        document.querySelectorAll('#app-nav .nav-item').forEach(item => item.classList.toggle('is-active', item === tab));
        document.querySelectorAll('#app-main > section').forEach(sec => sec.classList.toggle('hidden', sec !== section));
      }
      const pageTitle = document.getElementById('page-title'); if (pageTitle) pageTitle.textContent = 'Mis respuestas IA';
      renderGuardadas();
    });
    section.querySelector('#ia-saved-search')?.addEventListener('input', renderGuardadas);
    section.querySelector('#ia-saved-filter')?.addEventListener('change', renderGuardadas);
  }

  function crearModalGuardar() {
    if (document.getElementById('ia-save-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'ia-save-modal';
    modal.className = 'ia-save-modal hidden';
    modal.innerHTML = `<div class="ia-save-dialog" role="dialog" aria-modal="true" aria-labelledby="ia-save-title"><h3 id="ia-save-title">Guardar respuesta de Gemini</h3><p>Agrega un título para encontrarla fácilmente después.</p><div class="ia-save-grid"><div class="ia-save-field full"><label for="ia-save-name">Título</label><input id="ia-save-name" maxlength="120" placeholder="Ej.: Planificación de coordinación motriz"></div><div class="ia-save-field"><label for="ia-save-category">Categoría</label><select id="ia-save-category"><option>Planificación</option><option>Actividad</option><option>Observación pedagógica</option><option>Resumen</option><option>Preguntas</option><option>Guía de estudio</option><option>Efeméride</option><option>Acta</option><option>Estadísticas</option><option>General</option></select></div><div class="ia-save-field"><label for="ia-save-origin">Origen</label><select id="ia-save-origin"><option>Asistente IA</option><option>Planificación</option><option>Estudiantes</option><option>Calendario</option><option>Biblioteca digital</option><option>Actas</option><option>Estadísticas</option></select></div></div><div class="ia-save-actions"><button type="button" class="ia-save-cancel">Cancelar</button><button type="button" class="ia-save-confirm"><i class="fa-solid fa-floppy-disk"></i> Guardar</button></div></div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.ia-save-cancel')) modal.classList.add('hidden'); });
  }

  let respuestaPendiente = null;
  function abrirModalGuardar(texto) {
    crearModalGuardar();
    const modal = document.getElementById('ia-save-modal');
    const categoria = sugerirCategoria(texto);
    const origen = detectarOrigen();
    const primeraLinea = String(texto || '').split('\n').map(x=>x.trim()).find(Boolean) || 'Respuesta de Gemini';
    const titulo = primeraLinea.replace(/^#+\s*/, '').replace(/[*_`]/g,'').slice(0,90);
    document.getElementById('ia-save-name').value = titulo;
    document.getElementById('ia-save-category').value = [...document.getElementById('ia-save-category').options].some(o=>o.value===categoria) ? categoria : 'General';
    document.getElementById('ia-save-origin').value = origen;
    respuestaPendiente = String(texto || '').trim();
    modal.classList.remove('hidden');
    setTimeout(() => document.getElementById('ia-save-name')?.select(), 80);
  }

  function confirmarGuardado() {
    const modal = document.getElementById('ia-save-modal');
    if (!modal || !respuestaPendiente) return;
    const titulo = document.getElementById('ia-save-name').value.trim() || 'Respuesta de Gemini';
    const categoria = document.getElementById('ia-save-category').value;
    const origen = document.getElementById('ia-save-origin').value;
    const items = leerGuardadas();
    items.unshift({id:idIA(), titulo, categoria, origen, fecha:new Date().toISOString(), contenido:respuestaPendiente});
    escribirGuardadas(items);
    modal.classList.add('hidden'); respuestaPendiente = null;
    if (typeof mostrarToast === 'function') mostrarToast('La respuesta quedó guardada en Mis respuestas IA.', 'success', 'Respuesta guardada');
    renderGuardadas();
  }

  document.addEventListener('click', e => {
    if (e.target.closest('.ia-save-confirm')) confirmarGuardado();
  });

  function copiarRespuestaIA(texto) {
    const contenido = String(texto || '').trim();
    if (!contenido) return;
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = contenido;
      ta.setAttribute('readonly','');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); if (typeof mostrarToast === 'function') mostrarToast('Contenido copiado.', 'success', 'Asistente IA'); }
      catch (_) { if (typeof mostrarToast === 'function') mostrarToast('No se pudo copiar automáticamente.', 'warning', 'Asistente IA'); }
      ta.remove();
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(contenido).then(() => { if (typeof mostrarToast === 'function') mostrarToast('Contenido copiado.', 'success', 'Asistente IA'); }).catch(fallback);
    } else fallback();
  }

  function imprimirRespuestaIA(rich) {
    if (!rich) return;
    const contenidoHtml = rich.innerHTML?.trim();
    const contenidoTexto = rich.innerText?.trim();
    if (!contenidoHtml && !contenidoTexto) return;
    const primera = (contenidoTexto || 'Material generado con IA').split(/\n+/).find(Boolean) || 'Material generado con IA';
    const titulo = primera.replace(/^#+\s*/, '').replace(/[*_`]/g,'').slice(0,100);
    const ventana = window.open('', '_blank', 'width=900,height=700');
    if (!ventana) {
      if (typeof mostrarToast === 'function') mostrarToast('El navegador bloqueó la ventana de impresión. Permite ventanas emergentes e inténtalo de nuevo.', 'warning', 'Preparar para imprimir');
      return;
    }
    ventana.document.open();
    ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escIA(titulo)}</title><style>
      @page{size:A4;margin:18mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#111827;background:#fff;line-height:1.55;font-size:12.5pt;margin:0}main{max-width:760px;margin:0 auto}h1,h2,h3,h4{color:#111827;margin:1.05em 0 .45em;page-break-after:avoid}h1{font-size:20pt}h2{font-size:16pt}h3{font-size:14pt}p{margin:.55em 0}ul,ol{padding-left:1.4rem}li{margin:.3em 0}strong{font-weight:700}hr{border:0;border-top:1px solid #cbd5e1;margin:1rem 0}.print-head{display:flex;justify-content:space-between;align-items:flex-end;gap:1rem;border-bottom:2px solid #111827;padding-bottom:.7rem;margin-bottom:1.2rem}.print-head h1{font-size:16pt;margin:0}.print-meta{font-size:9.5pt;color:#475569}.no-print{margin:0 0 1rem;display:flex;justify-content:flex-end;gap:.5rem}.no-print button{border:1px solid #cbd5e1;background:#fff;border-radius:8px;padding:.55rem .8rem;font-weight:700;cursor:pointer}@media print{.no-print{display:none}a{color:inherit;text-decoration:none}}
    </style></head><body><main><div class="no-print"><button onclick="window.print()">Imprimir / Guardar PDF</button><button onclick="window.close()">Cerrar</button></div><div class="print-head"><h1>${escIA(titulo)}</h1><div class="print-meta">Preparado desde EduGestión</div></div><section>${contenidoHtml || `<pre>${escIA(contenidoTexto)}</pre>`}</section></main></body></html>`);
    ventana.document.close();
    ventana.focus();
    if (typeof mostrarToast === 'function') mostrarToast('Versión para imprimir preparada.', 'success', 'Asistente IA');
  }

  function mejorarMensajeAssistant(row) {
    if (!row || row.dataset.saveReady === '1') return;
    row.dataset.saveReady = '1';
    const rich = row.querySelector('.gemini-rich');
    const bubble = row.querySelector('.gemini-bubble');
    if (!rich || !bubble) return; // no agrega botones al mensaje de bienvenida
    const texto = rich.innerText?.trim();
    if (!texto) return;
    const actions = document.createElement('div');
    actions.className = 'gemini-save-row';
    actions.innerHTML = `
      <button type="button" class="gemini-response-action gemini-copy-response"><i class="fa-solid fa-copy"></i> Copiar</button>
      <button type="button" class="gemini-response-action gemini-save-response"><i class="fa-solid fa-bookmark"></i> Guardar en Mis respuestas IA</button>
      <button type="button" class="gemini-response-action gemini-print-response"><i class="fa-solid fa-print"></i> Preparar para imprimir</button>`;
    actions.querySelector('.gemini-copy-response')?.addEventListener('click', () => copiarRespuestaIA(rich.innerText.trim()));
    actions.querySelector('.gemini-save-response')?.addEventListener('click', () => abrirModalGuardar(rich.innerText.trim()));
    actions.querySelector('.gemini-print-response')?.addEventListener('click', () => imprimirRespuestaIA(rich));
    bubble.appendChild(actions);
  }

  conversation.querySelectorAll('.gemini-message--assistant').forEach(mejorarMensajeAssistant);
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => m.addedNodes.forEach(node => {
      if (!(node instanceof HTMLElement)) return;
      if (node.matches?.('.gemini-message--assistant')) mejorarMensajeAssistant(node);
      node.querySelectorAll?.('.gemini-message--assistant').forEach(mejorarMensajeAssistant);
    }));
  });
  observer.observe(conversation, {childList:true, subtree:false});

  function renderGuardadas() {
    const list = document.getElementById('ia-saved-list');
    const search = document.getElementById('ia-saved-search');
    const filter = document.getElementById('ia-saved-filter');
    if (!list || !filter) return;
    const all = leerGuardadas();
    const categorias = [...new Set(all.map(x=>x.categoria).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
    const previo = filter.value;
    filter.innerHTML = '<option value="">Todas las categorías</option>' + categorias.map(c=>`<option value="${escIA(c)}">${escIA(c)}</option>`).join('');
    if (categorias.includes(previo)) filter.value = previo;
    const q = String(search?.value || '').trim().toLowerCase();
    const cat = filter.value;
    const items = all.filter(x => (!cat || x.categoria===cat) && (!q || [x.titulo,x.categoria,x.origen,x.contenido].join(' ').toLowerCase().includes(q)));
    if (!items.length) {
      list.innerHTML = `<div class="ia-saved-empty"><i class="fa-solid fa-bookmark"></i><strong>${all.length ? 'No encontramos coincidencias' : 'Todavía no has guardado respuestas'}</strong><p>${all.length ? 'Prueba con otra búsqueda o categoría.' : 'Cuando Gemini te dé una respuesta útil, pulsa “Guardar respuesta”.'}</p></div>`;
      return;
    }
    list.innerHTML = items.map(x => `<article class="ia-saved-card" data-id="${escIA(x.id)}"><div class="ia-saved-card__top"><div><h3>${escIA(x.titulo)}</h3><div class="ia-saved-meta"><span>${escIA(x.categoria || 'General')}</span><span>${escIA(x.origen || 'Asistente IA')}</span><span>${escIA(fechaBonitaIA(x.fecha))}</span></div></div></div><div class="ia-saved-preview">${escIA(x.contenido)}</div><div class="ia-saved-actions"><button type="button" data-action="copy"><i class="fa-solid fa-copy"></i> Copiar</button><button type="button" data-action="reuse"><i class="fa-solid fa-wand-magic-sparkles"></i> Reutilizar con Gemini</button><button type="button" data-action="delete"><i class="fa-solid fa-trash"></i> Eliminar</button></div></article>`).join('');
  }

  document.addEventListener('click', async e => {
    const action = e.target.closest('#section-respuestas-ia [data-action]');
    if (!action) return;
    const card = action.closest('.ia-saved-card');
    const item = leerGuardadas().find(x=>x.id===card?.dataset.id);
    if (!item) return;
    const type = action.dataset.action;
    if (type === 'copy') {
      try { await navigator.clipboard.writeText(item.contenido); if (typeof mostrarToast === 'function') mostrarToast('Contenido copiado.', 'success', 'Mis respuestas IA'); }
      catch (_) { if (typeof mostrarToast === 'function') mostrarToast('No se pudo copiar automáticamente.', 'warning', 'Mis respuestas IA'); }
    }
    if (type === 'delete') {
      if (!window.confirm(`¿Eliminar “${item.titulo}”?`)) return;
      escribirGuardadas(leerGuardadas().filter(x=>x.id!==item.id)); renderGuardadas();
      if (typeof mostrarToast === 'function') mostrarToast('Respuesta eliminada.', 'success', 'Mis respuestas IA');
    }
    if (type === 'reuse') {
      const input = document.getElementById('gemini-input');
      tabGemini.click();
      if (input) {
        input.value = `Quiero reutilizar y adaptar esta respuesta que guardé anteriormente. Ayúdame a mejorarla o ajustarla según la nueva indicación que escribiré al final.\n\nRESPUESTA GUARDADA:\n${item.contenido}\n\nNUEVA INDICACIÓN:\n`;
        setTimeout(()=>{ input.focus(); input.setSelectionRange(input.value.length,input.value.length); },120);
      }
    }
  });

  crearModuloGuardados();
  crearModalGuardar();
  return true;
  }

  function intentarIniciarRespuestasIA() {
    if (document.getElementById('tab-respuestas-ia') && document.getElementById('section-respuestas-ia')) return true;
    try { return iniciarRespuestasIAModulo(); } catch (error) { console.warn('EduGestion: reintentando Mis respuestas IA', error); return false; }
  }

  if (!intentarIniciarRespuestasIA()) {
    const observer = new MutationObserver(() => {
      if (intentarIniciarRespuestasIA()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList:true, subtree:true });
    window.setTimeout(() => { intentarIniciarRespuestasIA(); }, 450);
    window.setTimeout(() => { intentarIniciarRespuestasIA(); }, 1200);
  }
})();


/* =========================================================
   EduGestion · Actas: redacción profesional con IA
   ========================================================= */
(() => {
  const section = document.getElementById('section-actas');
  const hero = section?.querySelector('.actas-hero');
  if (!section || !hero || document.getElementById('actas-ia-panel')) return;

  const panel = document.createElement('section');
  panel.id = 'actas-ia-panel';
  panel.className = 'actas-ia-panel';
  panel.innerHTML = `
    <div class="actas-ia-head">
      <div class="actas-ia-head__icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
      <div class="actas-ia-head__text">
        <span>ASISTENTE DOCENTE</span>
        <h3>Redactar acta con Gemini</h3>
        <p>Completa los datos principales y Gemini preparará un borrador profesional para que lo revises antes de usarlo.</p>
      </div>
      <div class="actas-ia-free"><i class="fa-solid fa-shield-halved"></i> Modo gratuito · sin búsqueda web</div>
    </div>
    <div class="actas-ia-grid">
      <label><span>TIPO DE ACTA</span><select id="acta-ia-tipo">
        <option>Incidencia escolar</option><option>Reunión docente</option><option>Reunión con padres</option>
        <option>Compromiso</option><option>Seguimiento</option><option>Orientación</option>
        <option>Inasistencia</option><option>Accidente escolar</option><option>Calificaciones</option><option>Mediación</option>
      </select></label>
      <label><span>FECHA</span><input id="acta-ia-fecha" type="date"></label>
      <label><span>PARTICIPANTES / PERSONAS INVOLUCRADAS</span><input id="acta-ia-participantes" placeholder="Ej.: estudiante, representante y docente"></label>
      <label class="actas-ia-wide"><span>MOTIVO O ASUNTO</span><input id="acta-ia-motivo" placeholder="Describe brevemente el motivo del acta"></label>
      <label class="actas-ia-wide"><span>HECHOS / INFORMACIÓN PRINCIPAL</span><textarea id="acta-ia-hechos" rows="3" placeholder="Escribe los hechos de forma breve y objetiva. Gemini los organizará sin inventar información."></textarea></label>
      <label><span>ACUERDOS O COMPROMISOS</span><textarea id="acta-ia-acuerdos" rows="3" placeholder="Ej.: seguimiento semanal, comunicación con representante..."></textarea></label>
      <label><span>OBSERVACIONES ADICIONALES</span><textarea id="acta-ia-observaciones" rows="3" placeholder="Opcional"></textarea></label>
    </div>
    <div class="actas-ia-actions">
      <button type="button" id="btn-acta-ia-cargar" class="actas-ia-secondary"><i class="fa-solid fa-file-import"></i> Usar datos del acta</button>
      <small><i class="fa-solid fa-circle-info"></i> Gemini redactará un borrador. Revísalo antes de guardarlo o entregarlo.</small>
      <button type="button" id="btn-acta-ia-generar" class="actas-ia-primary"><i class="fa-solid fa-wand-magic-sparkles"></i> Redactar acta con IA</button>
    </div>`;
  hero.insertAdjacentElement('afterend', panel);

  const style = document.createElement('style');
  style.textContent = `
    .actas-ia-panel{background:linear-gradient(135deg,#fff,#f8fbff);border:1px solid #cfe0f5;border-radius:22px;padding:24px;box-shadow:0 10px 28px rgba(42,76,120,.08)}
    .actas-ia-head{display:flex;gap:14px;align-items:flex-start;margin-bottom:20px}.actas-ia-head__icon{width:48px;height:48px;border-radius:14px;background:#eef5ff;color:#18579d;display:flex;align-items:center;justify-content:center;font-size:21px;flex:none}.actas-ia-head__text{flex:1}.actas-ia-head__text span{font-size:11px;font-weight:900;letter-spacing:.13em;color:#6557e8}.actas-ia-head__text h3{font-size:22px;font-weight:900;color:#1f2937;margin:3px 0}.actas-ia-head__text p{font-size:14px;color:#718096;margin:0}.actas-ia-free{font-size:12px;font-weight:800;color:#07845c;background:#ecfdf5;border:1px solid #b8f1d9;border-radius:999px;padding:8px 12px;white-space:nowrap}
    .actas-ia-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.actas-ia-grid label{display:flex;flex-direction:column;gap:6px}.actas-ia-grid label span{font-size:11px;font-weight:900;color:#475569;letter-spacing:.03em}.actas-ia-grid input,.actas-ia-grid select,.actas-ia-grid textarea{width:100%;border:1px solid #d7e1ee;border-radius:12px;background:#fff;padding:12px 13px;color:#253248;font:inherit;outline:none}.actas-ia-grid input:focus,.actas-ia-grid select:focus,.actas-ia-grid textarea:focus{border-color:#4f8fd8;box-shadow:0 0 0 3px rgba(79,143,216,.13)}.actas-ia-wide{grid-column:1/-1}
    .actas-ia-actions{display:flex;gap:14px;align-items:center;margin-top:18px}.actas-ia-actions small{flex:1;color:#8a96a8}.actas-ia-actions button{border:0;border-radius:12px;padding:12px 17px;font-weight:900;cursor:pointer}.actas-ia-secondary{background:#eef4fb;color:#245b91}.actas-ia-primary{background:#174f8b;color:#fff;box-shadow:0 7px 16px rgba(23,79,139,.18)}
    body.app-dark .actas-ia-panel{background:#111b2a;border-color:#2b405a}.app-dark .actas-ia-head__text h3,.app-dark .actas-ia-grid label span{color:#edf5ff}.app-dark .actas-ia-head__text p,.app-dark .actas-ia-actions small{color:#a9b7c9}.app-dark .actas-ia-grid input,.app-dark .actas-ia-grid select,.app-dark .actas-ia-grid textarea{background:#182538;border-color:#31465f;color:#eef6ff}
    @media(max-width:760px){.actas-ia-head{flex-wrap:wrap}.actas-ia-free{order:3}.actas-ia-grid{grid-template-columns:1fr}.actas-ia-wide{grid-column:auto}.actas-ia-actions{flex-direction:column;align-items:stretch}.actas-ia-actions small{order:3}.actas-ia-actions button{width:100%}}
  `;
  document.head.appendChild(style);

  const tipo = document.getElementById('acta-ia-tipo');
  const fecha = document.getElementById('acta-ia-fecha');
  const participantes = document.getElementById('acta-ia-participantes');
  const motivo = document.getElementById('acta-ia-motivo');
  const hechos = document.getElementById('acta-ia-hechos');
  const acuerdos = document.getElementById('acta-ia-acuerdos');
  const observaciones = document.getElementById('acta-ia-observaciones');

  const mapTipo = {
    reunion:'Reunión docente', padres:'Reunión con padres', incidencia:'Incidencia escolar', compromiso:'Compromiso',
    seguimiento:'Seguimiento', orientacion:'Orientación', inasistencia:'Inasistencia', accidente:'Accidente escolar',
    calificaciones:'Calificaciones', mediacion:'Mediación'
  };

  const hoy = () => new Date().toISOString().slice(0,10);
  fecha.value = document.getElementById('acta-fecha-global')?.value || hoy();

  function textoVisiblePlantilla() {
    const visible = [...section.querySelectorAll('.acta-plantilla')].find(el => !el.classList.contains('hidden'));
    if (!visible) return '';
    return [...visible.querySelectorAll('input,textarea,select')]
      .map(el => String(el.value || '').trim()).filter(Boolean).join('\n');
  }

  function cargarDatos() {
    const titulo = String(document.getElementById('acta-titulo-dinamico')?.value || '').trim();
    const tipoGlobal = typeof actaTipoActual !== 'undefined' ? actaTipoActual : '';
    const valorTipo = mapTipo[tipoGlobal] || titulo.replace(/^\d+\.\s*/, '') || 'Incidencia escolar';
    [...tipo.options].forEach(opt => { opt.selected = opt.textContent.trim().toLowerCase() === valorTipo.toLowerCase(); });
    fecha.value = document.getElementById('acta-fecha-global')?.value || hoy();

    const alumnoId = document.getElementById('acta-select-alumno')?.value;
    let alumno = null;
    try { alumno = Array.isArray(alumnosFiltradosActas) ? alumnosFiltradosActas.find(a => String(a.id) === String(alumnoId)) : null; } catch (_) {}
    const nombres = [];
    if (alumno?.nombre) nombres.push(`Estudiante: ${alumno.nombre}`);
    if (alumno?.representante) nombres.push(`Representante: ${alumno.representante}`);
    if (typeof profesorActual !== 'undefined' && profesorActual?.nombre) nombres.push(`Docente: ${profesorActual.nombre}`);
    if (nombres.length) participantes.value = nombres.join(' · ');

    const motInc = String(document.getElementById('acta-motivo')?.value || '').trim();
    const descInc = String(document.getElementById('acta-incidencia')?.value || '').trim();
    const faltas = String(document.getElementById('acta-inasistencia-fechas')?.value || '').trim();
    const obsFaltas = String(document.getElementById('acta-inasistencia-motivo')?.value || '').trim();
    if (motInc) motivo.value = motInc;
    else if (faltas) motivo.value = `Reporte de inasistencia: ${faltas}`;
    else if (!motivo.value.trim()) motivo.value = titulo || valorTipo;
    if (descInc) hechos.value = descInc;
    else if (obsFaltas) hechos.value = obsFaltas;
    else {
      const extra = textoVisiblePlantilla();
      if (extra && !hechos.value.trim()) hechos.value = extra;
    }
    if (typeof mostrarToast === 'function') mostrarToast('Datos del acta cargados en el asistente.', 'success', 'Actas con IA');
  }

  document.getElementById('btn-acta-ia-cargar')?.addEventListener('click', cargarDatos);

  document.getElementById('btn-acta-ia-generar')?.addEventListener('click', () => {
    const motivoValor = String(motivo.value || '').trim();
    const hechosValor = String(hechos.value || '').trim();
    if (!motivoValor) { mostrarToast?.('Indica el motivo o asunto del acta.', 'warning', 'Actas con IA'); motivo.focus(); return; }
    if (!hechosValor) { mostrarToast?.('Escribe los hechos o información principal.', 'warning', 'Actas con IA'); hechos.focus(); return; }

    const prompt = `Redacta un borrador formal de acta escolar en español, listo para ser revisado por un docente. No realices búsqueda web. Usa únicamente la información que te proporciono y NO inventes nombres, fechas, hechos, acuerdos ni datos faltantes. Mantén un tono institucional, objetivo, respetuoso y claro.\n\nDatos del acta:\n- Tipo: ${tipo.value}\n- Fecha: ${fecha.value || 'No indicada'}\n- Participantes o personas involucradas: ${participantes.value.trim() || 'No indicados'}\n- Motivo o asunto: ${motivoValor}\n- Hechos / información principal: ${hechosValor}\n- Acuerdos o compromisos: ${acuerdos.value.trim() || 'No indicados'}\n- Observaciones adicionales: ${observaciones.value.trim() || 'Ninguna'}\n\nOrganiza el borrador con: Título del acta, Fecha, Participantes, Motivo, Desarrollo de los hechos, Acuerdos o compromisos, Observaciones finales y espacios de firma cuando correspondan. Si falta algún dato importante, indícalo como [PENDIENTE DE COMPLETAR] en vez de inventarlo.`;

    const tabIA = document.getElementById('tab-gemini');
    const inputIA = document.getElementById('gemini-input');
    const formIA = document.getElementById('gemini-form');
    if (!tabIA || !inputIA || !formIA) { mostrarToast?.('No se pudo abrir el Asistente IA.', 'warning', 'Actas con IA'); return; }
    tabIA.click();
    inputIA.value = prompt;
    setTimeout(() => {
      inputIA.focus();
      if (typeof formIA.requestSubmit === 'function') formIA.requestSubmit();
      else formIA.dispatchEvent(new Event('submit', {bubbles:true,cancelable:true}));
    }, 180);
  });
})();


/* EDUGESTION_STATS_AI_V1_START */
(() => {
  const TAB_ID = 'tab-estadisticas';
  const SECTION_ID = 'section-estadisticas';
  const CARD_ID = 'estadisticas-ia-card';

  const text = id => String(document.getElementById(id)?.textContent || '').trim();
  const val = id => String(document.getElementById(id)?.value || '').trim();

  function asegurarTarjetaIA() {
    const section = document.getElementById(SECTION_ID);
    if (!section || document.getElementById(CARD_ID)) return;

    if (!document.getElementById('teacher-attendance-ai-styles')) {
      const style = document.createElement('style');
      style.id = 'teacher-attendance-ai-styles';
      style.textContent = `
        #teacher-attendance-ai-card {
          margin-top: 22px !important;
          padding: 0 !important;
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,.28);
          background: var(--surface, #fff);
          box-shadow: 0 10px 28px rgba(15,23,42,.06);
        }
        #teacher-attendance-ai-card > header {
          padding: 20px 22px 16px;
          border-bottom: 1px solid rgba(148,163,184,.22);
        }
        #teacher-attendance-ai-card > header > div {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        #teacher-attendance-ai-card > header > div > span {
          width: 46px;
          height: 46px;
          min-width: 46px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: rgba(37,99,235,.09);
          color: #2563eb;
          font-size: 18px;
        }
        #teacher-attendance-ai-card h3 {
          margin: 0 0 5px;
          line-height: 1.25;
          font-size: 1.04rem;
        }
        #teacher-attendance-ai-card header p {
          margin: 0;
          line-height: 1.5;
          font-size: .86rem;
          opacity: .72;
        }
        #teacher-attendance-ai-card .teacher-ai-body {
          padding: 20px 22px 22px;
        }
        #teacher-attendance-ai-card .teacher-ai-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 18px;
          margin: 0;
        }
        #teacher-attendance-ai-card .teacher-ai-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }
        #teacher-attendance-ai-card .teacher-ai-field > span {
          display: block;
          font-weight: 800;
          font-size: .88rem;
          line-height: 1.25;
          color: var(--text, inherit);
        }
        #teacher-attendance-ai-card select,
        #teacher-attendance-ai-card textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d9e2ef !important;
          border-radius: 12px !important;
          background: var(--surface, #fff);
          color: inherit;
          font: inherit;
        }
        #teacher-attendance-ai-card select {
          min-height: 48px;
          padding: 0 14px !important;
        }
        #teacher-attendance-ai-card textarea {
          min-height: 104px;
          padding: 14px !important;
          line-height: 1.45;
          resize: vertical;
        }
        #teacher-attendance-ai-card .teacher-ai-note {
          margin-top: 18px;
        }
        #teacher-attendance-ai-card .teacher-ai-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-top: 18px;
          padding-top: 2px;
        }
        #teacher-attendance-ai-card #teacher-ai-generate {
          min-height: 48px;
          padding: 0 20px !important;
          border-radius: 12px !important;
          white-space: nowrap;
        }
        #teacher-attendance-ai-card .teacher-ai-mode {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          line-height: 1.35;
          text-align: right;
          font-size: .82rem;
          opacity: .7;
        }
        @media (max-width: 760px) {
          #teacher-attendance-ai-card > header,
          #teacher-attendance-ai-card .teacher-ai-body { padding-left: 16px; padding-right: 16px; }
          #teacher-attendance-ai-card .teacher-ai-grid { grid-template-columns: 1fr; gap: 14px; }
          #teacher-attendance-ai-card .teacher-ai-actions { align-items: stretch; flex-direction: column; }
          #teacher-attendance-ai-card #teacher-ai-generate { width: 100%; justify-content: center; }
          #teacher-attendance-ai-card .teacher-ai-mode { justify-content: center; text-align: center; }
        }
      `;
      document.head.appendChild(style);
    }

    const card = document.createElement('section');
    card.id = CARD_ID;
    card.className = 'stats-table-card';
    card.innerHTML = `
      <div class="stats-table-card__header">
        <div><span><i class="fa-solid fa-wand-magic-sparkles"></i></span><div><h3>Explicar estadísticas con Gemini</h3><p>Convierte los indicadores visibles en conclusiones claras y útiles para tu trabajo docente.</p></div></div>
        <span class="stats-count"><i class="fa-solid fa-gift"></i> Modo gratuito</span>
      </div>
      <div style="padding:20px;display:grid;gap:16px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;">
          <label class="stats-field"><span>Tipo de análisis</span><select id="estadisticas-ia-tipo">
            <option value="explicar">Explicar resultados</option>
            <option value="conclusiones">Conclusiones y recomendaciones</option>
            <option value="alertas">Detectar alertas de asistencia</option>
            <option value="informe">Resumen para informe docente</option>
            <option value="comparar">Comparar secciones</option>
          </select></label>
          <label class="stats-field"><span>Enfoque</span><select id="estadisticas-ia-enfoque">
            <option value="general">General</option>
            <option value="asistencia">Asistencia</option>
            <option value="tardanzas">Tardanzas</option>
            <option value="ausencias">Ausencias</option>
            <option value="cumplimiento">Cumplimiento</option>
          </select></label>
        </div>
        <label class="stats-field"><span>Nota adicional para Gemini (opcional)</span><textarea id="estadisticas-ia-nota" rows="3" placeholder="Ej.: Dame recomendaciones sencillas para mejorar la asistencia del grupo." style="width:100%;resize:vertical;"></textarea></label>
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
          <button id="estadisticas-ia-generar" type="button" class="stats-button stats-button--primary"><i class="fa-solid fa-sparkles"></i> Analizar estadísticas con IA</button>
          <small style="opacity:.72;"><i class="fa-solid fa-shield-halved"></i> Usa solamente los datos visibles de EduGestión y no realiza búsqueda web.</small>
        </div>
      </div>`;

    const metrics = section.querySelector('.stats-metrics');
    if (metrics?.parentNode) metrics.parentNode.insertBefore(card, metrics.nextSibling);
    else section.appendChild(card);

    document.getElementById('estadisticas-ia-generar')?.addEventListener('click', enviarAnalisisIA);
  }

  function filasTabla(id, max = 12) {
    const body = document.getElementById(id);
    if (!body) return [];
    return [...body.querySelectorAll('tr')].slice(0, max).map(tr =>
      [...tr.querySelectorAll('td')].map(td => String(td.innerText || td.textContent || '').replace(/\s+/g, ' ').trim()).join(' | ')
    ).filter(Boolean);
  }

  function fechasVisibles(max = 10) {
    const cont = document.getElementById('estadisticas-fechas');
    if (!cont) return [];
    return [...cont.querySelectorAll('.stats-daily-item')].slice(0, max).map(x => String(x.innerText || x.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean);
  }

  function resumenActual() {
    const total = text('stats-total');
    if (!total || Number(total.replace(/\D/g,'')) === 0) return null;
    const seccionSel = document.getElementById('estadisticas-seccion')?.selectedOptions?.[0]?.textContent?.trim() || 'Todas las secciones';
    return {
      desde: val('estadisticas-desde') || 'No indicado',
      hasta: val('estadisticas-hasta') || 'No indicado',
      seccion: seccionSel,
      busqueda: val('estadisticas-buscar') || 'Sin filtro por estudiante',
      total,
      presentes: text('stats-presentes'),
      ausentes: text('stats-ausentes'),
      tardanzas: text('stats-tardanzas'),
      justificadas: text('stats-justificadas'),
      asistencia: text('stats-score-asistencia') || text('stats-porcentaje'),
      cumplimiento: text('stats-score-cumplimiento'),
      alumnos: filasTabla('estadisticas-alumnos-body'),
      secciones: filasTabla('estadisticas-secciones-body'),
      fechas: fechasVisibles()
    };
  }

  function objetivoSegunTipo(tipo) {
    return ({
      explicar: 'Explica qué significan estos resultados en lenguaje claro para un docente.',
      conclusiones: 'Redacta conclusiones pedagógicas y recomendaciones prácticas basadas únicamente en estos datos.',
      alertas: 'Identifica posibles alertas de asistencia, ausencias o tardanzas que merezcan seguimiento. No diagnostiques ni atribuyas causas que no estén en los datos.',
      informe: 'Prepara un resumen formal y breve que pueda incorporarse a un informe docente.',
      comparar: 'Compara las secciones visibles e indica diferencias objetivas, fortalezas y aspectos que conviene revisar.'
    })[tipo] || 'Explica los resultados.';
  }

  function enviarAnalisisIA() {
    const datos = resumenActual();
    if (!datos) {
      if (typeof mostrarToast === 'function') mostrarToast('Primero carga estadísticas con registros en el periodo seleccionado.', 'warning', 'Estadísticas con IA');
      return;
    }
    const tipo = val('estadisticas-ia-tipo') || 'explicar';
    const enfoque = val('estadisticas-ia-enfoque') || 'general';
    const nota = val('estadisticas-ia-nota');
    const lista = (arr, vacio='Sin datos visibles') => arr.length ? arr.map(x => `- ${x}`).join('\n') : vacio;

    const prompt = `Analiza las siguientes estadísticas de EduGestión como asistente para un docente. No realices búsqueda web. Usa ÚNICAMENTE los datos proporcionados y no inventes causas, antecedentes, nombres ni cifras. Si un dato no permite llegar a una conclusión, dilo claramente.\n\nObjetivo del análisis: ${objetivoSegunTipo(tipo)}\nEnfoque solicitado: ${enfoque}.\n${nota ? `Nota del docente: ${nota}\n` : ''}\nPeriodo: ${datos.desde} al ${datos.hasta}\nFiltro de sección: ${datos.seccion}\nFiltro de estudiante: ${datos.busqueda}\n\nResumen general:\n- Registros: ${datos.total}\n- Presentes: ${datos.presentes}\n- Ausentes: ${datos.ausentes}\n- Tardanzas: ${datos.tardanzas}\n- Justificadas: ${datos.justificadas}\n- Asistencia efectiva: ${datos.asistencia}\n- Cumplimiento registrado: ${datos.cumplimiento}\n\nEstudiantes visibles:\n${lista(datos.alumnos)}\n\nSecciones visibles:\n${lista(datos.secciones)}\n\nEvolución por fecha visible:\n${lista(datos.fechas)}\n\nOrganiza la respuesta con: 1) Resumen ejecutivo, 2) Hallazgos principales, 3) Aspectos que requieren atención, 4) Recomendaciones prácticas y 5) Conclusión. Mantén un tono profesional, claro y útil para un docente. No etiquetes a estudiantes ni hagas inferencias clínicas o familiares.`;

    const tabIA = document.getElementById('tab-gemini');
    const inputIA = document.getElementById('gemini-input');
    const formIA = document.getElementById('gemini-form');
    if (!tabIA || !inputIA || !formIA) {
      if (typeof mostrarToast === 'function') mostrarToast('No se pudo abrir el Asistente IA.', 'warning', 'Estadísticas con IA');
      return;
    }
    tabIA.click();
    inputIA.value = prompt;
    setTimeout(() => {
      inputIA.focus();
      if (typeof formIA.requestSubmit === 'function') formIA.requestSubmit();
      else formIA.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }, 180);
  }

  function iniciar() {
    asegurarTarjetaIA();
    document.getElementById(TAB_ID)?.addEventListener('click', () => setTimeout(asegurarTarjetaIA, 120));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
})();
/* EDUGESTION_STATS_AI_V1_END */

/* EDUGESTION_AUDITORIA_AI_V1_START */
(() => {
  const TAB_ID = 'tab-auditoria';
  const SECTION_ID = 'section-auditoria';
  const CARD_ID = 'auditoria-ia-card';

  const text = id => String(document.getElementById(id)?.textContent || '').replace(/\s+/g, ' ').trim();
  const val = id => String(document.getElementById(id)?.value || '').trim();

  function asegurarTarjetaIA() {
    const section = document.getElementById(SECTION_ID);
    if (!section || document.getElementById(CARD_ID)) return;

    const card = document.createElement('section');
    card.id = CARD_ID;
    card.className = 'audit-filter-card';
    card.innerHTML = `
      <div class="audit-filter-card__title">
        <div>
          <span><i class="fa-solid fa-wand-magic-sparkles"></i></span>
          <div><strong>Analizar auditoría con Gemini</strong><small>Resume movimientos, detecta pendientes y prepara conclusiones usando únicamente los datos visibles.</small></div>
        </div>
        <span class="audit-count"><i class="fa-solid fa-gift"></i> Modo gratuito</span>
      </div>
      <div class="audit-filters" style="margin-top:16px;">
        <label class="audit-field">
          <span>Tipo de análisis</span>
          <select id="auditoria-ia-tipo">
            <option value="resumen">Resumir incidencias</option>
            <option value="pendientes">Detectar pendientes</option>
            <option value="repetidos">Identificar movimientos repetidos</option>
            <option value="conclusiones">Generar conclusiones</option>
            <option value="recomendaciones">Crear recomendaciones</option>
            <option value="informe">Preparar informe breve</option>
          </select>
        </label>
        <label class="audit-field">
          <span>Enfoque</span>
          <select id="auditoria-ia-enfoque">
            <option value="general">General</option>
            <option value="asistencia">Cambios de asistencia</option>
            <option value="origen">Origen Web / Telegram</option>
            <option value="responsables">Responsables de cambios</option>
            <option value="estudiantes">Estudiantes con más movimientos</option>
          </select>
        </label>
        <label class="audit-field audit-field--wide">
          <span>Nota adicional para Gemini (opcional)</span>
          <textarea id="auditoria-ia-nota" rows="3" placeholder="Ej.: Señala solamente lo que necesite seguimiento del docente." style="width:100%;resize:vertical;"></textarea>
        </label>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:16px;">
        <button id="auditoria-ia-generar" type="button" class="audit-button audit-button--primary"><i class="fa-solid fa-sparkles"></i> Analizar auditoría con IA</button>
        <small style="opacity:.72;"><i class="fa-solid fa-shield-halved"></i> No realiza búsqueda web ni inventa información.</small>
      </div>`;

    const metrics = section.querySelector('.audit-metrics');
    if (metrics?.parentNode) metrics.parentNode.insertBefore(card, metrics.nextSibling);
    else section.prepend(card);

    document.getElementById('auditoria-ia-generar')?.addEventListener('click', enviarAuditoriaIA);
  }

  function filasVisibles(max = 30) {
    const body = document.getElementById('auditoria-tabla-body');
    if (!body) return [];
    return [...body.querySelectorAll('tr')].slice(0, max).map(tr =>
      [...tr.querySelectorAll('td')].map(td => String(td.innerText || td.textContent || '').replace(/\s+/g, ' ').trim()).join(' | ')
    ).filter(Boolean);
  }

  function objetivo(tipo) {
    return ({
      resumen: 'Resume de forma clara las incidencias o movimientos registrados y destaca los puntos más relevantes.',
      pendientes: 'Detecta qué elementos podrían requerir revisión o seguimiento. No asumas que algo está pendiente si los datos no lo demuestran; usa expresiones como “conviene revisar” cuando corresponda.',
      repetidos: 'Identifica patrones de movimientos repetidos por estudiante, responsable, origen o tipo de cambio, solo cuando sean visibles en los datos.',
      conclusiones: 'Redacta conclusiones objetivas y breves basadas únicamente en los movimientos mostrados.',
      recomendaciones: 'Propón recomendaciones operativas y prudentes para el docente basadas solo en los patrones observables, sin atribuir causas no registradas.',
      informe: 'Prepara un informe breve, formal y ordenado de auditoría para uso docente.'
    })[tipo] || 'Resume los movimientos de auditoría.';
  }

  function enviarAuditoriaIA() {
    const filas = filasVisibles();
    const total = text('auditoria-total');
    if ((!total || Number(total.replace(/\D/g, '')) === 0) && !filas.length) {
      if (typeof mostrarToast === 'function') mostrarToast('Primero carga movimientos de auditoría.', 'warning', 'Auditoría con IA');
      return;
    }

    const tipo = val('auditoria-ia-tipo') || 'resumen';
    const enfoque = val('auditoria-ia-enfoque') || 'general';
    const nota = val('auditoria-ia-nota');
    const origenFiltro = document.getElementById('auditoria-origen')?.selectedOptions?.[0]?.textContent?.trim() || 'Todos';
    const seccionFiltro = document.getElementById('auditoria-seccion')?.selectedOptions?.[0]?.textContent?.trim() || 'Todas';
    const fechaFiltro = val('auditoria-fecha') || 'Todas';
    const busqueda = val('auditoria-buscar') || 'Sin búsqueda';

    const prompt = `Analiza este historial de auditoría de EduGestión como apoyo para un docente. No realices búsqueda web. Usa ÚNICAMENTE la información proporcionada. No inventes causas, hechos, responsables, estudiantes, fechas ni pendientes. Si los datos no permiten afirmar algo, indícalo claramente.\n\nObjetivo: ${objetivo(tipo)}\nEnfoque: ${enfoque}.\n${nota ? `Nota del docente: ${nota}\n` : ''}\nFiltros visibles:\n- Fecha de asistencia: ${fechaFiltro}\n- Origen: ${origenFiltro}\n- Sección: ${seccionFiltro}\n- Búsqueda: ${busqueda}\n\nResumen de auditoría:\n- Cambios registrados: ${total || '0'}\n- Desde la web: ${text('auditoria-web') || '0'}\n- Desde Telegram: ${text('auditoria-telegram') || '0'}\n- Cambios de hoy: ${text('auditoria-hoy') || '0'}\n\nMovimientos visibles (máximo 30, del más reciente al más antiguo):\n${filas.length ? filas.map(x => `- ${x}`).join('\n') : '- Sin movimientos visibles en la tabla'}\n\nPresenta la respuesta con estos apartados cuando apliquen: Resumen, Hallazgos objetivos, Elementos que conviene revisar, Patrones observables, Recomendaciones y Conclusión. Evita lenguaje acusatorio y diferencia claramente hechos visibles de recomendaciones.`;

    const tabIA = document.getElementById('tab-gemini');
    const inputIA = document.getElementById('gemini-input');
    const formIA = document.getElementById('gemini-form');
    if (!tabIA || !inputIA || !formIA) {
      if (typeof mostrarToast === 'function') mostrarToast('No se pudo abrir el Asistente IA.', 'warning', 'Auditoría con IA');
      return;
    }
    tabIA.click();
    inputIA.value = prompt;
    setTimeout(() => {
      inputIA.focus();
      if (typeof formIA.requestSubmit === 'function') formIA.requestSubmit();
      else formIA.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }, 180);
  }

  function activar() {
    asegurarTarjetaIA();
    document.getElementById(TAB_ID)?.addEventListener('click', () => setTimeout(asegurarTarjetaIA, 120));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(activar, 200));
  else setTimeout(activar, 200);

  const observer = new MutationObserver(() => {
    if (document.getElementById(SECTION_ID) && !document.getElementById(CARD_ID)) asegurarTarjetaIA();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
/* EDUGESTION_AUDITORIA_AI_V1_END */

/* EDUGESTION_ASISTENCIA_LABORAL_IA_V1_START */
(() => {
  const SECTION_ID = 'section-asistencia-docente';
  const CARD_ID = 'teacher-attendance-ai-card';

  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const val = id => clean(document.getElementById(id)?.value);

  function asegurarTarjetaIA() {
    const section = document.getElementById(SECTION_ID);
    if (!section || document.getElementById(CARD_ID)) return;

    const card = document.createElement('section');
    card.id = CARD_ID;
    card.className = 'teacher-attendance-panel';
    card.style.marginTop = '18px';
    card.innerHTML = `
      <header>
        <div>
          <span><i class="fa-solid fa-wand-magic-sparkles"></i></span>
          <div>
            <h3>Resumen laboral con Gemini</h3>
            <p>Analiza tu asistencia del mes actual, horas trabajadas, ausencias y observaciones usando solo los datos visibles en EduGestión.</p>
          </div>
        </div>
      </header>
      <div class="teacher-ai-body">
        <div class="teacher-ai-grid">
          <label class="teacher-ai-field">
            <span>Tipo de informe</span>
            <select id="teacher-ai-type">
              <option value="mensual">Resumen mensual</option>
              <option value="horas">Analizar horas trabajadas</option>
              <option value="ausencias">Revisar ausencias</option>
              <option value="tendencias">Detectar tendencias</option>
              <option value="informe">Preparar informe formal</option>
              <option value="recomendaciones">Conclusiones y recomendaciones</option>
            </select>
          </label>
          <label class="teacher-ai-field">
            <span>Enfoque</span>
            <select id="teacher-ai-focus">
              <option value="general">Asistencia laboral general</option>
              <option value="horario">Llegadas y salidas</option>
              <option value="carga">Carga horaria</option>
              <option value="ausencias">Ausencias registradas</option>
              <option value="seguimiento">Seguimiento personal</option>
            </select>
          </label>
        </div>
        <label class="teacher-ai-field teacher-ai-note">
          <span>Observación adicional (opcional)</span>
          <textarea id="teacher-ai-note" rows="3" placeholder="Ej.: Quiero un resumen corto para mi informe mensual."></textarea>
        </label>
        <div class="teacher-ai-actions">
          <button id="teacher-ai-generate" type="button" style="border:0;background:#4f46e5;color:#fff;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:.5rem;">
            <i class="fa-solid fa-sparkles"></i> Generar resumen con IA
          </button>
          <small class="teacher-ai-mode"><i class="fa-solid fa-shield-halved"></i> Modo gratuito · sin búsqueda web · no inventa datos.</small>
        </div>
      </div>`;

    const summary = section.querySelector('#teacher-hours-summary');
    if (summary?.parentNode) summary.parentNode.insertBefore(card, summary.nextSibling);
    else section.appendChild(card);

    document.getElementById('teacher-ai-generate')?.addEventListener('click', enviarAsistenciaLaboralIA);
  }

  function objetivo(tipo) {
    return ({
      mensual: 'Prepara un resumen del mes actual con días trabajados, horas registradas, promedio diario, ausencias visibles y una conclusión breve.',
      horas: 'Analiza las horas trabajadas visibles y explica de forma objetiva la carga horaria registrada.',
      ausencias: 'Resume únicamente las ausencias visibles, sus fechas y motivos registrados. No infieras causas adicionales.',
      tendencias: 'Identifica tendencias observables en jornadas, horarios, horas o ausencias, solo si los datos visibles permiten hacerlo.',
      informe: 'Redacta un informe formal y breve de asistencia laboral del docente para el periodo visible.',
      recomendaciones: 'Genera conclusiones y recomendaciones prudentes de seguimiento personal basadas únicamente en los datos visibles.'
    })[tipo] || 'Resume la asistencia laboral visible.';
  }

  function datosVisibles() {
    const resumen = [...document.querySelectorAll('#teacher-hours-summary article')].map(a => clean(a.innerText || a.textContent)).filter(Boolean);
    const historial = [...document.querySelectorAll('#teacher-attendance-history article')].slice(0, 12).map(a => clean(a.innerText || a.textContent)).filter(Boolean);
    const grafico = [...document.querySelectorAll('#teacher-hours-chart article')].slice(0, 10).map(a => clean(a.innerText || a.textContent)).filter(Boolean);
    const estadoHoy = clean(document.getElementById('teacher-attendance-status')?.innerText || document.getElementById('teacher-attendance-status')?.textContent);
    return { resumen, historial, grafico, estadoHoy };
  }

  function enviarAsistenciaLaboralIA() {
    const datos = datosVisibles();
    if (!datos.resumen.length && !datos.historial.length && !datos.estadoHoy) {
      if (typeof mostrarToast === 'function') mostrarToast('Primero carga tu asistencia laboral.', 'warning', 'Asistencia laboral con IA');
      return;
    }

    const tipo = val('teacher-ai-type') || 'mensual';
    const enfoque = document.getElementById('teacher-ai-focus')?.selectedOptions?.[0]?.textContent?.trim() || 'Asistencia laboral general';
    const nota = val('teacher-ai-note');
    const periodo = new Date().toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });

    const prompt = `Analiza mi asistencia laboral registrada en EduGestión como apoyo personal para un docente. No realices búsqueda web. Usa ÚNICAMENTE los datos que te proporciono. No inventes horarios, ausencias, motivos, horas, fechas ni causas. Si falta información para una conclusión, indícalo claramente.\n\nPeriodo de referencia: ${periodo}.\nObjetivo: ${objetivo(tipo)}\nEnfoque: ${enfoque}.\n${nota ? `Observación del docente: ${nota}\n` : ''}\nEstado de hoy:\n- ${datos.estadoHoy || 'Sin información visible'}\n\nResumen visible de EduGestión:\n${datos.resumen.length ? datos.resumen.map(x => `- ${x}`).join('\n') : '- Sin resumen visible'}\n\nJornadas visibles en el gráfico:\n${datos.grafico.length ? datos.grafico.map(x => `- ${x}`).join('\n') : '- Sin jornadas completas visibles'}\n\nHistorial reciente:\n${datos.historial.length ? datos.historial.map(x => `- ${x}`).join('\n') : '- Sin historial visible'}\n\nPresenta la respuesta con estos apartados cuando apliquen: Resumen del periodo, Días y horas registradas, Ausencias registradas, Tendencias observables, Observaciones, Conclusión y Recomendaciones. Mantén un tono profesional y distingue claramente los datos registrados de cualquier recomendación.`;

    const tabIA = document.getElementById('tab-gemini');
    const inputIA = document.getElementById('gemini-input');
    const formIA = document.getElementById('gemini-form');
    if (!tabIA || !inputIA || !formIA) {
      if (typeof mostrarToast === 'function') mostrarToast('No se pudo abrir el Asistente IA.', 'warning', 'Asistencia laboral con IA');
      return;
    }

    tabIA.click();
    setTimeout(() => {
      inputIA.value = prompt;
      inputIA.dispatchEvent(new Event('input', { bubbles: true }));
      inputIA.focus();
      try {
        if (location.protocol !== 'file:') formIA.requestSubmit();
        else if (typeof mostrarToast === 'function') mostrarToast('Solicitud preparada. La respuesta real de Gemini se prueba desde Vercel.', 'success', 'Asistencia laboral con IA');
      } catch (_) {}
    }, 120);
  }

  function iniciar() {
    asegurarTarjetaIA();
    const observer = new MutationObserver(asegurarTarjetaIA);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
})();
/* EDUGESTION_ASISTENCIA_LABORAL_IA_V1_END */

/* EDUGESTION_EVALUACIONES_IA_V1_START */
(() => {
  const TAB_ID = 'tab-evaluaciones-ia';
  const SECTION_ID = 'section-evaluaciones-ia';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();

  function inyectarEstilos() {
    if (document.getElementById('evaluaciones-ia-styles')) return;
    const style = document.createElement('style');
    style.id = 'evaluaciones-ia-styles';
    style.textContent = `
      .eval-ia-page{display:grid;gap:1.25rem}
      .eval-ia-page.hidden{display:none!important}
      .eval-ia-hero{display:flex;justify-content:space-between;align-items:center;gap:1.2rem;padding:1.7rem 1.85rem;border-radius:24px;background:linear-gradient(135deg,#173b63,#1f6fa7);color:#fff;overflow:hidden;position:relative}
      .eval-ia-hero:after{content:"";position:absolute;width:240px;height:240px;border:36px solid rgba(255,255,255,.08);border-radius:50%;right:-70px;top:-85px}
      .eval-ia-hero__copy{position:relative;z-index:1;max-width:760px}
      .eval-ia-hero__eyebrow{display:inline-flex;align-items:center;gap:.45rem;font-size:.76rem;font-weight:900;letter-spacing:.11em;text-transform:uppercase;opacity:.9}
      .eval-ia-hero h2{margin:.45rem 0 .55rem;font-size:clamp(1.55rem,3vw,2.35rem);line-height:1.08}
      .eval-ia-hero p{margin:0;line-height:1.6;opacity:.92;max-width:680px}
      .eval-ia-hero__icon{width:88px;height:88px;border-radius:24px;display:grid;place-items:center;background:rgba(255,255,255,.14);font-size:2rem;position:relative;z-index:1;flex:0 0 auto}
      .eval-ia-card{background:var(--surface,#fff);border:1px solid rgba(148,163,184,.35);border-radius:22px;padding:1.4rem;box-shadow:0 12px 32px rgba(15,23,42,.06)}
      .eval-ia-card__head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1.2rem}
      .eval-ia-card__head h3{margin:0 0 .28rem;font-size:1.16rem}
      .eval-ia-card__head p{margin:0;color:#64748b;line-height:1.5}
      .eval-ia-badge{display:inline-flex;align-items:center;gap:.35rem;padding:.5rem .7rem;border-radius:999px;background:#ecfdf5;color:#047857;font-size:.78rem;font-weight:800;white-space:nowrap}
      .eval-ia-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:1rem}
      .eval-ia-field{grid-column:span 4;display:flex;flex-direction:column;gap:.42rem;min-width:0}
      .eval-ia-field.half{grid-column:span 6}
      .eval-ia-field.full{grid-column:1/-1}
      .eval-ia-field label,.eval-ia-field>span{font-size:.78rem;font-weight:900;color:#475569;text-transform:uppercase;letter-spacing:.035em}
      .eval-ia-field input,.eval-ia-field select,.eval-ia-field textarea{width:100%;min-height:48px;border:1px solid #cbd5e1;border-radius:13px;background:transparent;color:inherit;padding:.78rem .9rem;font:inherit;outline:none;box-sizing:border-box}
      .eval-ia-field textarea{min-height:104px;resize:vertical;line-height:1.5}
      .eval-ia-field input:focus,.eval-ia-field select:focus,.eval-ia-field textarea:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12)}
      .eval-ia-difficulty{display:grid;grid-template-columns:repeat(3,1fr);gap:.65rem}
      .eval-ia-difficulty input{position:absolute;opacity:0;pointer-events:none}
      .eval-ia-difficulty label{min-height:48px;border:1px solid #cbd5e1;border-radius:13px;display:flex;align-items:center;justify-content:center;gap:.45rem;font-weight:900;cursor:pointer;background:transparent;text-transform:none;letter-spacing:0}
      .eval-ia-difficulty input:checked+label{border-color:#2563eb;background:rgba(37,99,235,.1);color:#1d4ed8}
      .eval-ia-options{display:flex;flex-wrap:wrap;gap:.75rem 1.1rem;padding:.8rem 0 .15rem}
      .eval-ia-check{display:inline-flex;align-items:center;gap:.5rem;font-weight:700;color:#475569}
      .eval-ia-check input{width:18px;height:18px;min-height:auto}
      .eval-ia-actions{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-top:1.15rem;padding-top:1.1rem;border-top:1px solid rgba(148,163,184,.3)}
      .eval-ia-generate{border:0;border-radius:14px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;min-height:50px;padding:.8rem 1.15rem;font-weight:900;font-size:.95rem;display:inline-flex;align-items:center;gap:.55rem;cursor:pointer}
      .eval-ia-help{display:flex;align-items:center;gap:.45rem;color:#64748b;font-size:.82rem;line-height:1.45}
      .eval-ia-preview{display:grid;grid-template-columns:repeat(3,1fr);gap:.8rem}
      .eval-ia-preview article{padding:1rem;border:1px solid rgba(148,163,184,.28);border-radius:16px;background:rgba(248,250,252,.65)}
      .eval-ia-preview strong{display:block;margin-bottom:.28rem}
      .eval-ia-preview span{font-size:.84rem;color:#64748b;line-height:1.45}
      body.edugestion-dark .eval-ia-card{background:rgba(15,23,42,.72);border-color:rgba(148,163,184,.24)}
      body.edugestion-dark .eval-ia-field input,body.edugestion-dark .eval-ia-field select,body.edugestion-dark .eval-ia-field textarea,body.edugestion-dark .eval-ia-difficulty label{border-color:rgba(148,163,184,.38);background:rgba(15,23,42,.32);color:#e5e7eb}
      body.edugestion-dark .eval-ia-card__head p,body.edugestion-dark .eval-ia-field label,body.edugestion-dark .eval-ia-field>span,body.edugestion-dark .eval-ia-help,body.edugestion-dark .eval-ia-check,body.edugestion-dark .eval-ia-preview span{color:#cbd5e1}
      body.edugestion-dark .eval-ia-preview article{background:rgba(30,41,59,.55)}
      @media(max-width:900px){.eval-ia-field{grid-column:span 6}.eval-ia-preview{grid-template-columns:1fr}.eval-ia-hero__icon{display:none}}
      @media(max-width:620px){.eval-ia-hero{padding:1.25rem;border-radius:18px}.eval-ia-card{padding:1rem;border-radius:18px}.eval-ia-field,.eval-ia-field.half{grid-column:1/-1}.eval-ia-difficulty{grid-template-columns:1fr}.eval-ia-actions{align-items:stretch}.eval-ia-generate{width:100%;justify-content:center}.eval-ia-badge{white-space:normal}}
    `;
    document.head.appendChild(style);
  }

  function crearCategoria() {
    if (document.getElementById(TAB_ID) || document.getElementById(SECTION_ID)) return;
    const nav = document.getElementById('app-nav');
    const main = document.getElementById('app-main');
    if (!nav || !main) return;
    inyectarEstilos();

    const tab = document.createElement('button');
    tab.id = TAB_ID;
    tab.type = 'button';
    tab.className = 'nav-item';
    tab.setAttribute('aria-selected','false');
    tab.dataset.title = 'Evaluaciones IA';
    tab.dataset.description = 'Crea cuestionarios, talleres y exámenes adaptados al año y nivel de dificultad.';
    tab.innerHTML = '<i class="fa-solid fa-file-circle-question"></i><span>Evaluaciones IA</span>';

    const planTab = nav.querySelector('#tab-planificacion');
    if (planTab?.nextSibling) nav.insertBefore(tab, planTab.nextSibling);
    else nav.appendChild(tab);

    const section = document.createElement('section');
    section.id = SECTION_ID;
    section.className = 'hidden eval-ia-page';
    section.innerHTML = `
      <header class="eval-ia-hero">
        <div class="eval-ia-hero__copy">
          <span class="eval-ia-hero__eyebrow"><i class="fa-solid fa-wand-magic-sparkles"></i> Creador docente con Gemini</span>
          <h2>Cuestionarios, talleres y exámenes con IA</h2>
          <p>Completa la información de tu actividad, selecciona el año y el nivel de dificultad. Gemini preparará el material con un encabezado listo para revisar, copiar o imprimir.</p>
        </div>
        <div class="eval-ia-hero__icon"><i class="fa-solid fa-file-pen"></i></div>
      </header>

      <section class="eval-ia-card">
        <div class="eval-ia-card__head">
          <div><h3>Información del material</h3><p>Los datos que coloques aquí aparecerán como referencia en la evaluación generada.</p></div>
          <span class="eval-ia-badge"><i class="fa-solid fa-shield-halved"></i> Modo gratuito · sin búsqueda web</span>
        </div>

        <div class="eval-ia-grid">
          <div class="eval-ia-field"><span>Tipo de material</span><select id="eval-ia-tipo"><option value="Cuestionario">Cuestionario</option><option value="Taller">Taller</option><option value="Examen">Examen</option></select></div>
          <div class="eval-ia-field"><span>Año / grado</span><select id="eval-ia-grado"><option>1er Año</option><option>2do Año</option><option>3er Año</option><option>4to Año</option><option>5to Año</option><option>6to Grado</option><option>5to Grado</option><option>4to Grado</option><option>3er Grado</option><option>2do Grado</option><option>1er Grado</option></select></div>
          <div class="eval-ia-field"><span>Sección</span><input id="eval-ia-seccion" placeholder="Ej.: A"></div>

          <div class="eval-ia-field half"><span>Institución</span><input id="eval-ia-institucion" placeholder="Nombre de la institución"></div>
          <div class="eval-ia-field half"><span>Docente</span><input id="eval-ia-docente" placeholder="Nombre del docente"></div>

          <div class="eval-ia-field"><span>Área / materia</span><input id="eval-ia-area" value="Educación Física" placeholder="Ej.: Educación Física"></div>
          <div class="eval-ia-field"><span>Fecha</span><input id="eval-ia-fecha" type="date"></div>
          <div class="eval-ia-field"><span>Cantidad de preguntas</span><select id="eval-ia-cantidad"><option>5</option><option selected>10</option><option>15</option><option>20</option><option>25</option><option>30</option></select></div>

          <div class="eval-ia-field full"><span>Tema o contenido</span><input id="eval-ia-tema" placeholder="Ej.: Coordinación motriz, resistencia, sistema muscular..."></div>

          <div class="eval-ia-field half"><span>Nivel de dificultad</span><div class="eval-ia-difficulty">
            <div><input type="radio" name="eval-ia-dificultad" id="eval-dif-basico" value="Básico" checked><label for="eval-dif-basico"><i class="fa-solid fa-seedling"></i> Básico</label></div>
            <div><input type="radio" name="eval-ia-dificultad" id="eval-dif-medio" value="Medio"><label for="eval-dif-medio"><i class="fa-solid fa-layer-group"></i> Medio</label></div>
            <div><input type="radio" name="eval-ia-dificultad" id="eval-dif-fuerte" value="Fuerte"><label for="eval-dif-fuerte"><i class="fa-solid fa-bolt"></i> Fuerte</label></div>
          </div></div>
          <div class="eval-ia-field half"><span>Formato de preguntas</span><select id="eval-ia-formato"><option value="Mixto">Mixto</option><option value="Selección simple">Selección simple</option><option value="Verdadero o falso">Verdadero o falso</option><option value="Desarrollo">Desarrollo</option><option value="Completar">Completar</option><option value="Preguntas cortas">Preguntas cortas</option></select></div>

          <div class="eval-ia-field full"><span>Indicaciones o información adicional</span><textarea id="eval-ia-indicaciones" placeholder="Ej.: Incluir ejercicios prácticos, evitar preguntas repetidas, usar lenguaje sencillo, valorar sobre 20 puntos..."></textarea></div>
          <div class="eval-ia-field full"><span>Opciones del material</span><div class="eval-ia-options">
            <label class="eval-ia-check"><input type="checkbox" id="eval-ia-solucionario" checked> Incluir solucionario para el docente</label>
            <label class="eval-ia-check"><input type="checkbox" id="eval-ia-puntaje" checked> Sugerir puntaje por pregunta</label>
            <label class="eval-ia-check"><input type="checkbox" id="eval-ia-nombre-alumno" checked> Incluir espacio para nombre del estudiante</label>
          </div></div>
        </div>

        <div class="eval-ia-actions">
          <button id="eval-ia-generar" class="eval-ia-generate" type="button"><i class="fa-solid fa-wand-magic-sparkles"></i> Generar material con IA</button>
          <div class="eval-ia-help"><i class="fa-solid fa-circle-info"></i><span>Gemini preparará el borrador. El docente siempre debe revisarlo antes de imprimir o aplicar.</span></div>
        </div>
      </section>

      <section class="eval-ia-preview" aria-label="Qué puede crear esta sección">
        <article><strong><i class="fa-solid fa-list-check"></i> Cuestionarios</strong><span>Preguntas rápidas para repaso, práctica o comprobación de conocimientos.</span></article>
        <article><strong><i class="fa-solid fa-clipboard-list"></i> Talleres</strong><span>Actividades combinadas con preguntas, ejercicios y desarrollo guiado.</span></article>
        <article><strong><i class="fa-solid fa-file-signature"></i> Exámenes</strong><span>Evaluaciones organizadas por dificultad, cantidad de preguntas y formato elegido.</span></article>
      </section>
    `;
    main.appendChild(section);

    const hoy = new Date();
    const fecha = section.querySelector('#eval-ia-fecha');
    if (fecha) fecha.value = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
    const docente = section.querySelector('#eval-ia-docente');
    if (docente) docente.value = clean(document.querySelector('[data-profesor-nombre], #profesor-nombre, #account-name')?.textContent) || '';
    const institucion = section.querySelector('#eval-ia-institucion');
    if (institucion) institucion.value = clean(document.getElementById('input-institucion')?.value) || '';

    tab.addEventListener('click', () => abrirCategoria(tab, section));
    section.querySelector('#eval-ia-generar')?.addEventListener('click', generarMaterialIA);
  }

  function abrirCategoria(tab, section) {
    document.querySelectorAll('.app-sidebar .nav-item, #app-nav .nav-item').forEach(item => { item.classList.remove('is-active'); item.setAttribute('aria-selected','false'); });
    document.querySelectorAll('#app-main > section').forEach(sec => sec.classList.add('hidden'));
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected','true');
    section.classList.remove('hidden');
    const pageTitle = document.getElementById('page-title');
    const pageDescription = document.getElementById('page-description');
    if (pageTitle) pageTitle.textContent = tab.dataset.title;
    if (pageDescription) pageDescription.textContent = tab.dataset.description;
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function getValue(id) { return clean(document.getElementById(id)?.value); }
  function marcado(id) { return Boolean(document.getElementById(id)?.checked); }

  function generarMaterialIA() {
    const tipo = getValue('eval-ia-tipo') || 'Cuestionario';
    const grado = getValue('eval-ia-grado') || 'No indicado';
    const seccion = getValue('eval-ia-seccion') || 'No indicada';
    const institucion = getValue('eval-ia-institucion') || 'No indicada';
    const docente = getValue('eval-ia-docente') || 'No indicado';
    const area = getValue('eval-ia-area') || 'No indicada';
    const fecha = getValue('eval-ia-fecha') || 'No indicada';
    const cantidad = getValue('eval-ia-cantidad') || '10';
    const tema = getValue('eval-ia-tema');
    const formato = getValue('eval-ia-formato') || 'Mixto';
    const indicaciones = getValue('eval-ia-indicaciones');
    const dificultad = document.querySelector('input[name="eval-ia-dificultad"]:checked')?.value || 'Básico';

    if (!tema) {
      if (typeof mostrarToast === 'function') mostrarToast('Escribe primero el tema o contenido de la actividad.', 'warning', 'Evaluaciones IA');
      document.getElementById('eval-ia-tema')?.focus();
      return;
    }

    const opciones = [
      marcado('eval-ia-solucionario') ? 'Incluye al final un solucionario separado y claramente identificado SOLO PARA EL DOCENTE.' : 'No incluyas solucionario.',
      marcado('eval-ia-puntaje') ? 'Sugiere una distribución de puntaje por pregunta y un total.' : 'No es necesario asignar puntajes.',
      marcado('eval-ia-nombre-alumno') ? 'Incluye en el encabezado una línea en blanco para Nombre y apellido del estudiante.' : ''
    ].filter(Boolean).join('\n- ');

    const reglaDificultad = dificultad === 'Básico'
      ? 'Usa preguntas directas, vocabulario sencillo y conceptos esenciales, apropiados para comprobar comprensión básica.'
      : dificultad === 'Medio'
        ? 'Combina comprensión, aplicación y razonamiento moderado. Evita que todas las preguntas sean de memoria literal.'
        : 'Haz la actividad exigente para el nivel indicado: incluye aplicación, análisis, situaciones prácticas y razonamiento, sin salirte de contenidos apropiados para ese año.';

    const prompt = `Actúa como asistente docente y crea un ${tipo.toLowerCase()} completo en español. No realices búsqueda web. Trabaja únicamente con el tema y las instrucciones proporcionadas. No inventes datos institucionales que no se hayan indicado.\n\nINFORMACIÓN PARA EL ENCABEZADO:\n- Institución: ${institucion}\n- Docente: ${docente}\n- Área / materia: ${area}\n- Año / grado: ${grado}\n- Sección: ${seccion}\n- Fecha: ${fecha}\n- Tipo de material: ${tipo}\n- Tema: ${tema}\n- Nivel de dificultad: ${dificultad}\n\nCONFIGURACIÓN:\n- Cantidad aproximada de preguntas o actividades: ${cantidad}\n- Formato solicitado: ${formato}\n- Nivel: ${reglaDificultad}\n${indicaciones ? `- Indicaciones adicionales del docente: ${indicaciones}\n` : ''}- ${opciones}\n\nFORMATO DE ENTREGA:\n1. Presenta primero un encabezado limpio y listo para imprimir con los datos proporcionados.\n2. Incluye un título apropiado para el ${tipo.toLowerCase()}.\n3. Escribe instrucciones claras para el estudiante.\n4. Crea exactamente ${cantidad} preguntas o actividades, salvo que las indicaciones del docente pidan explícitamente otra organización.\n5. Mantén todas las preguntas relacionadas con el tema: ${tema}.\n6. Adecua el contenido al ${grado} y al nivel de dificultad ${dificultad}.\n7. Si el formato es Mixto, combina de manera equilibrada selección simple, verdadero/falso, completar, respuesta corta o desarrollo según sea apropiado.\n8. Evita preguntas ambiguas, repetidas o con más de una respuesta válida cuando sean de opción cerrada.\n9. ${marcado('eval-ia-solucionario') ? 'Después de una separación clara, agrega el SOLUCIONARIO PARA EL DOCENTE con las respuestas correspondientes.' : 'No agregues respuestas al final.'}\n10. Deja el material con presentación ordenada, numeración clara y listo para copiar a Word o imprimir después de revisión docente.`;

    const tabIA = document.getElementById('tab-gemini');
    const inputIA = document.getElementById('gemini-input');
    const formIA = document.getElementById('gemini-form');
    if (!tabIA || !inputIA || !formIA) {
      if (typeof mostrarToast === 'function') mostrarToast('No se pudo abrir el Asistente IA.', 'warning', 'Evaluaciones IA');
      return;
    }

    tabIA.click();
    setTimeout(() => {
      inputIA.value = prompt;
      inputIA.dispatchEvent(new Event('input', {bubbles:true}));
      inputIA.focus();
      try {
        if (location.protocol !== 'file:') formIA.requestSubmit();
        else if (typeof mostrarToast === 'function') mostrarToast('Solicitud preparada. La respuesta real de Gemini se prueba desde Vercel.', 'success', 'Evaluaciones IA');
      } catch (_) {}
    }, 140);
  }

  function ampliarCategoriasGuardadas() {
    const observer = new MutationObserver(() => {
      const cat = document.getElementById('ia-save-category');
      if (cat && ![...cat.options].some(o => o.value === 'Evaluación')) cat.add(new Option('Evaluación','Evaluación'));
      const origin = document.getElementById('ia-save-origin');
      if (origin && ![...origin.options].some(o => o.value === 'Evaluaciones IA')) origin.add(new Option('Evaluaciones IA','Evaluaciones IA'));
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  function iniciar() {
    crearCategoria();
    ampliarCategoriasGuardadas();
    const observer = new MutationObserver(() => { if (!document.getElementById(TAB_ID)) crearCategoria(); });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar,{once:true});
  else iniciar();
})();
/* EDUGESTION_EVALUACIONES_IA_V1_END */


/* EDUGESTION_MENU_SCROLL_RECOVERY_V1_START */
(() => {
  function instalarMenuScrollable() {
    const sidebar = document.querySelector('.app-sidebar');
    const planTab = document.getElementById('tab-planificacion');
    const geminiTab = document.getElementById('tab-gemini');
    const nav = document.getElementById('app-nav') || planTab?.parentElement || geminiTab?.parentElement || sidebar?.querySelector('nav');
    if (!sidebar || !nav) return false;

    if (!document.getElementById('edugestion-menu-scroll-styles')) {
      const style = document.createElement('style');
      style.id = 'edugestion-menu-scroll-styles';
      style.textContent = `
        .app-sidebar{display:flex!important;flex-direction:column!important;overflow:hidden!important}
        .app-sidebar #app-nav,.app-sidebar nav{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain;padding-right:5px!important;scrollbar-width:thin;scrollbar-color:rgba(148,163,184,.65) transparent}
        .app-sidebar #app-nav::-webkit-scrollbar,.app-sidebar nav::-webkit-scrollbar{width:6px}
        .app-sidebar #app-nav::-webkit-scrollbar-track,.app-sidebar nav::-webkit-scrollbar-track{background:transparent}
        .app-sidebar #app-nav::-webkit-scrollbar-thumb,.app-sidebar nav::-webkit-scrollbar-thumb{background:rgba(148,163,184,.55);border-radius:999px}
        .app-sidebar #app-nav::-webkit-scrollbar-thumb:hover,.app-sidebar nav::-webkit-scrollbar-thumb:hover{background:rgba(148,163,184,.78)}
        .app-sidebar .nav-item{flex:0 0 auto}
        @media(max-width:900px){.app-sidebar #app-nav,.app-sidebar nav{padding-bottom:18px!important}}
      `;
      document.head.appendChild(style);
    }

    nav.addEventListener('click', event => {
      const item = event.target.closest('.nav-item');
      if (item) window.setTimeout(() => item.scrollIntoView({block:'nearest',behavior:'smooth'}), 40);
    }, {passive:true});

    return true;
  }

  function recuperarEvaluaciones() {
    const existe = document.getElementById('tab-evaluaciones-ia');
    if (existe) return true;
    // El módulo principal de Evaluaciones IA posee su propio observador; un cambio DOM
    // adicional fuerza un nuevo ciclo de detección en navegadores que cargan el menú tarde.
    const nav = document.getElementById('app-nav') || document.getElementById('tab-planificacion')?.parentElement || document.getElementById('tab-gemini')?.parentElement;
    if (!nav) return false;
    const ping = document.createComment('edugestion-evaluaciones-retry');
    nav.appendChild(ping); ping.remove();
    return Boolean(document.getElementById('tab-evaluaciones-ia'));
  }

  function iniciar() {
    instalarMenuScrollable();
    recuperarEvaluaciones();
    let intentos = 0;
    const timer = window.setInterval(() => {
      intentos += 1;
      instalarMenuScrollable();
      recuperarEvaluaciones();
      const okEval = Boolean(document.getElementById('tab-evaluaciones-ia'));
      const okSaved = Boolean(document.getElementById('tab-respuestas-ia'));
      if ((okEval && okSaved) || intentos >= 12) window.clearInterval(timer);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, {once:true});
  else iniciar();
})();
/* EDUGESTION_MENU_SCROLL_RECOVERY_V1_END */

/* EDUGESTION_BIBLIOTECA_EVALUACIONES_IA_V1_START */
(() => {
  const STORAGE_KEY = 'edugestion_biblioteca_evaluaciones_v1';
  const TAB_ID = 'tab-biblioteca-evaluaciones';
  const SECTION_ID = 'section-biblioteca-evaluaciones';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean = v => String(v ?? '').replace(/\s+/g,' ').trim();

  function leer() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (_) { return []; }
  }
  function guardar(items) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  function id() { return `eval-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
  function toast(msg, type='success') {
    if (typeof mostrarToast === 'function') mostrarToast(msg, type, 'Biblioteca de evaluaciones');
  }

  function capturarContextoEvaluacion() {
    const tema = clean(document.getElementById('eval-ia-tema')?.value);
    if (!tema) return;
    const dificultad = document.querySelector('input[name="eval-ia-dificultad"]:checked')?.value || 'Básico';
    window.EDUGESTION_EVALUACION_ACTUAL = {
      tipo: clean(document.getElementById('eval-ia-tipo')?.value) || 'Cuestionario',
      grado: clean(document.getElementById('eval-ia-grado')?.value),
      seccion: clean(document.getElementById('eval-ia-seccion')?.value),
      institucion: clean(document.getElementById('eval-ia-institucion')?.value),
      docente: clean(document.getElementById('eval-ia-docente')?.value),
      area: clean(document.getElementById('eval-ia-area')?.value),
      fecha: clean(document.getElementById('eval-ia-fecha')?.value),
      cantidad: clean(document.getElementById('eval-ia-cantidad')?.value),
      tema,
      formato: clean(document.getElementById('eval-ia-formato')?.value),
      indicaciones: clean(document.getElementById('eval-ia-indicaciones')?.value),
      dificultad,
      solucionario: Boolean(document.getElementById('eval-ia-solucionario')?.checked),
      puntaje: Boolean(document.getElementById('eval-ia-puntaje')?.checked),
      nombreAlumno: Boolean(document.getElementById('eval-ia-nombre-alumno')?.checked),
      creadoEn: new Date().toISOString()
    };
  }

  function guardarRespuestaComoEvaluacion(texto) {
    const contenido = String(texto || '').trim();
    const ctx = window.EDUGESTION_EVALUACION_ACTUAL;
    if (!contenido) return;
    if (!ctx?.tema) {
      toast('Primero genera el material desde Evaluaciones IA para poder guardarlo aquí.', 'warning');
      return;
    }
    const items = leer();
    items.unshift({ id:id(), ...ctx, contenido, guardadoEn:new Date().toISOString() });
    guardar(items.slice(0,300));
    toast('Evaluación guardada en tu biblioteca.');
    render();
  }

  function agregarBotonBiblioteca(row) {
    if (!row || row.dataset.evalLibraryReady === '1') return;
    const rich = row.querySelector('.gemini-rich');
    const actions = row.querySelector('.gemini-save-row');
    if (!rich || !actions) return;
    row.dataset.evalLibraryReady = '1';
    if (actions.querySelector('.gemini-save-eval-library')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gemini-response-action gemini-save-eval-library';
    btn.innerHTML = '<i class="fa-solid fa-box-archive"></i> Guardar en Biblioteca de evaluaciones';
    btn.addEventListener('click', () => guardarRespuestaComoEvaluacion(rich.innerText.trim()));
    actions.appendChild(btn);
  }

  function instalarBotonEnRespuestas() {
    const conv = document.getElementById('gemini-conversation');
    if (!conv) return false;
    conv.querySelectorAll('.gemini-message--assistant').forEach(agregarBotonBiblioteca);
    const obs = new MutationObserver(() => conv.querySelectorAll('.gemini-message--assistant').forEach(agregarBotonBiblioteca));
    obs.observe(conv,{childList:true,subtree:true});
    return true;
  }

  function estilos() {
    if (document.getElementById('eval-library-styles')) return;
    const s = document.createElement('style');
    s.id = 'eval-library-styles';
    s.textContent = `
      .eval-lib-page{display:grid;gap:1.15rem}.eval-lib-page.hidden{display:none!important}.eval-lib-hero{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.45rem 1.55rem;border-radius:22px;background:linear-gradient(135deg,#1e3a5f,#255f8d);color:#fff}.eval-lib-hero h2{margin:.25rem 0 .35rem;font-size:1.65rem}.eval-lib-hero p{margin:0;opacity:.9;line-height:1.5}.eval-lib-hero i{font-size:2rem}.eval-lib-tools{display:grid;grid-template-columns:minmax(0,1fr) 220px 180px;gap:.8rem;padding:1rem;background:var(--surface,#fff);border:1px solid rgba(148,163,184,.35);border-radius:18px}.eval-lib-tools input,.eval-lib-tools select{min-height:46px;border:1px solid #cbd5e1;border-radius:12px;padding:.7rem .85rem;background:transparent;color:inherit;font:inherit}.eval-lib-count{display:flex;align-items:center;justify-content:center;border-radius:12px;background:rgba(37,99,235,.08);font-weight:800;color:#1d4ed8}.eval-lib-list{display:grid;gap:.9rem}.eval-lib-card{background:var(--surface,#fff);border:1px solid rgba(148,163,184,.32);border-radius:18px;padding:1.05rem 1.1rem;box-shadow:0 8px 24px rgba(15,23,42,.05)}.eval-lib-card__top{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}.eval-lib-card h3{margin:0 0 .28rem;font-size:1.05rem}.eval-lib-meta{display:flex;flex-wrap:wrap;gap:.45rem;margin:.65rem 0}.eval-lib-meta span{font-size:.75rem;font-weight:800;padding:.34rem .55rem;border-radius:999px;background:rgba(148,163,184,.14);color:#475569}.eval-lib-date{font-size:.76rem;color:#64748b;white-space:nowrap}.eval-lib-preview{margin:.65rem 0 0;color:#64748b;font-size:.86rem;line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.eval-lib-actions{display:flex;flex-wrap:wrap;gap:.55rem;margin-top:.85rem;padding-top:.85rem;border-top:1px solid rgba(148,163,184,.25)}.eval-lib-actions button{border:1px solid #cbd5e1;background:transparent;color:inherit;border-radius:10px;min-height:40px;padding:.5rem .7rem;font-weight:800;cursor:pointer}.eval-lib-actions button.primary{background:#2563eb;color:#fff;border-color:#2563eb}.eval-lib-actions button.danger{color:#b91c1c;border-color:#fecaca}.eval-lib-empty{text-align:center;padding:2rem 1rem;border:1px dashed #cbd5e1;border-radius:18px;color:#64748b}.eval-lib-empty i{font-size:1.8rem;margin-bottom:.6rem}.eval-lib-modal{position:fixed;inset:0;z-index:10050;background:rgba(15,23,42,.55);display:grid;place-items:center;padding:1rem}.eval-lib-modal.hidden{display:none}.eval-lib-modal__box{width:min(850px,96vw);max-height:88vh;overflow:auto;background:#fff;color:#111827;border-radius:18px;padding:1.2rem;box-shadow:0 24px 70px rgba(15,23,42,.28)}.eval-lib-modal__head{display:flex;justify-content:space-between;gap:1rem;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:.8rem}.eval-lib-modal__head h3{margin:0}.eval-lib-modal__close{border:0;background:#f1f5f9;border-radius:10px;width:42px;height:42px;cursor:pointer}.eval-lib-modal__content{white-space:pre-wrap;line-height:1.58;margin-top:1rem}.gemini-save-eval-library{border-color:#93c5fd!important;background:rgba(37,99,235,.08)!important}.edugestion-dark .eval-lib-tools,.edugestion-dark .eval-lib-card{background:rgba(15,23,42,.72)}.edugestion-dark .eval-lib-meta span,.edugestion-dark .eval-lib-preview,.edugestion-dark .eval-lib-date{color:#cbd5e1}.edugestion-dark .eval-lib-tools input,.edugestion-dark .eval-lib-tools select{border-color:rgba(148,163,184,.4);color:#e5e7eb}.edugestion-dark .eval-lib-actions button{border-color:rgba(148,163,184,.38)}@media(max-width:760px){.eval-lib-tools{grid-template-columns:1fr}.eval-lib-card__top{flex-direction:column}.eval-lib-date{white-space:normal}.eval-lib-hero i{display:none}}
    `;
    document.head.appendChild(s);
  }

  function crearCategoria() {
    if (document.getElementById(TAB_ID) || document.getElementById(SECTION_ID)) return false;
    const nav = document.getElementById('app-nav');
    const main = document.getElementById('app-main');
    if (!nav || !main) return false;
    estilos();
    const tab = document.createElement('button');
    tab.id = TAB_ID; tab.type='button'; tab.className='nav-item'; tab.setAttribute('aria-selected','false');
    tab.dataset.title='Biblioteca de evaluaciones';
    tab.dataset.description='Guarda, busca, reutiliza, duplica e imprime cuestionarios, talleres y exámenes creados con IA.';
    tab.innerHTML='<i class="fa-solid fa-box-archive"></i><span>Biblioteca evaluaciones</span>';
    const evalTab = document.getElementById('tab-evaluaciones-ia');
    if (evalTab?.nextSibling) nav.insertBefore(tab, evalTab.nextSibling); else nav.appendChild(tab);

    const section = document.createElement('section');
    section.id=SECTION_ID; section.className='hidden eval-lib-page';
    section.innerHTML=`
      <header class="eval-lib-hero"><div><small>ARCHIVO PERSONAL DEL DOCENTE</small><h2>Biblioteca de evaluaciones</h2><p>Encuentra rápidamente cuestionarios, talleres y exámenes generados con Gemini y vuelve a utilizarlos cuando los necesites.</p></div><i class="fa-solid fa-box-archive"></i></header>
      <div class="eval-lib-tools"><input id="eval-lib-search" type="search" placeholder="Buscar por tema, materia, grado o sección..."><select id="eval-lib-filter"><option value="">Todos los materiales</option><option value="Cuestionario">Cuestionarios</option><option value="Taller">Talleres</option><option value="Examen">Exámenes</option></select><div class="eval-lib-count" id="eval-lib-count">0 guardadas</div></div>
      <div class="eval-lib-list" id="eval-lib-list"></div>`;
    main.appendChild(section);

    tab.addEventListener('click',()=>{
      document.querySelectorAll('.app-sidebar .nav-item,#app-nav .nav-item').forEach(x=>{x.classList.remove('is-active');x.setAttribute('aria-selected','false')});
      document.querySelectorAll('#app-main > section').forEach(x=>x.classList.add('hidden'));
      tab.classList.add('is-active'); tab.setAttribute('aria-selected','true'); section.classList.remove('hidden');
      const t=document.getElementById('page-title'), d=document.getElementById('page-description'); if(t)t.textContent=tab.dataset.title;if(d)d.textContent=tab.dataset.description; render();
    });
    section.querySelector('#eval-lib-search')?.addEventListener('input',render);
    section.querySelector('#eval-lib-filter')?.addEventListener('change',render);
    return true;
  }

  function fmtFecha(v){try{return new Date(v).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})}catch(_){return ''}}
  function render(){
    const list=document.getElementById('eval-lib-list'), count=document.getElementById('eval-lib-count'); if(!list)return;
    const q=clean(document.getElementById('eval-lib-search')?.value).toLowerCase();
    const f=clean(document.getElementById('eval-lib-filter')?.value);
    const all=leer();
    const items=all.filter(x=>(!f||x.tipo===f)&&(!q||[x.tema,x.area,x.grado,x.seccion,x.tipo,x.dificultad,x.contenido].join(' ').toLowerCase().includes(q)));
    if(count)count.textContent=`${items.length} ${items.length===1?'guardada':'guardadas'}`;
    if(!items.length){list.innerHTML='<div class="eval-lib-empty"><i class="fa-regular fa-folder-open"></i><strong>No hay evaluaciones para mostrar</strong><p>Genera una desde Evaluaciones IA y usa el botón “Guardar en Biblioteca de evaluaciones”.</p></div>';return;}
    list.innerHTML=items.map(x=>`<article class="eval-lib-card" data-id="${esc(x.id)}"><div class="eval-lib-card__top"><div><h3>${esc(x.tema||x.tipo||'Evaluación')}</h3><div class="eval-lib-meta"><span>${esc(x.tipo||'Material')}</span><span>${esc(x.grado||'Sin grado')}</span><span>${esc(x.area||'Sin materia')}</span><span>Dificultad: ${esc(x.dificultad||'No indicada')}</span></div></div><span class="eval-lib-date">${esc(fmtFecha(x.guardadoEn))}</span></div><p class="eval-lib-preview">${esc(String(x.contenido||'').slice(0,420))}</p><div class="eval-lib-actions"><button class="primary" data-action="ver"><i class="fa-solid fa-eye"></i> Ver</button><button data-action="reutilizar"><i class="fa-solid fa-rotate"></i> Reutilizar</button><button data-action="duplicar"><i class="fa-regular fa-copy"></i> Duplicar</button><button data-action="imprimir"><i class="fa-solid fa-print"></i> Imprimir</button><button class="danger" data-action="eliminar"><i class="fa-solid fa-trash"></i> Eliminar</button></div></article>`).join('');
  }

  function obtenerItem(el){const idv=el.closest('[data-id]')?.dataset.id;return leer().find(x=>x.id===idv)}
  function abrirModal(item){
    let m=document.getElementById('eval-lib-modal'); if(!m){m=document.createElement('div');m.id='eval-lib-modal';m.className='eval-lib-modal hidden';m.innerHTML='<div class="eval-lib-modal__box"><div class="eval-lib-modal__head"><h3 id="eval-lib-modal-title"></h3><button class="eval-lib-modal__close" type="button"><i class="fa-solid fa-xmark"></i></button></div><div class="eval-lib-modal__content" id="eval-lib-modal-content"></div></div>';document.body.appendChild(m);m.querySelector('.eval-lib-modal__close').addEventListener('click',()=>m.classList.add('hidden'));m.addEventListener('click',e=>{if(e.target===m)m.classList.add('hidden')})}
    m.querySelector('#eval-lib-modal-title').textContent=item.tema||item.tipo||'Evaluación'; m.querySelector('#eval-lib-modal-content').textContent=item.contenido||'';m.classList.remove('hidden');
  }
  function reutilizar(item){
    document.getElementById('tab-evaluaciones-ia')?.click();
    setTimeout(()=>{
      const set=(id,v)=>{const el=document.getElementById(id);if(el&&v!=null){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}};
      set('eval-ia-tipo',item.tipo);set('eval-ia-grado',item.grado);set('eval-ia-seccion',item.seccion);set('eval-ia-institucion',item.institucion);set('eval-ia-docente',item.docente);set('eval-ia-area',item.area);set('eval-ia-fecha',item.fecha);set('eval-ia-cantidad',item.cantidad);set('eval-ia-tema',item.tema);set('eval-ia-formato',item.formato);set('eval-ia-indicaciones',item.indicaciones);
      const radio=[...document.querySelectorAll('input[name="eval-ia-dificultad"]')].find(r=>r.value===item.dificultad);if(radio)radio.checked=true;
      if(document.getElementById('eval-ia-solucionario'))document.getElementById('eval-ia-solucionario').checked=!!item.solucionario;
      if(document.getElementById('eval-ia-puntaje'))document.getElementById('eval-ia-puntaje').checked=!!item.puntaje;
      if(document.getElementById('eval-ia-nombre-alumno'))document.getElementById('eval-ia-nombre-alumno').checked=!!item.nombreAlumno;
      toast('Datos cargados en Evaluaciones IA. Puedes modificarlos y generar una nueva versión.');
    },120);
  }
  function duplicar(item){const all=leer();all.unshift({...item,id:id(),tema:`${item.tema||item.tipo||'Evaluación'} - copia`,guardadoEn:new Date().toISOString()});guardar(all);render();toast('Se creó una copia de la evaluación.');}
  function eliminar(item){if(!confirm(`¿Eliminar “${item.tema||item.tipo||'esta evaluación'}” de la biblioteca?`))return;guardar(leer().filter(x=>x.id!==item.id));render();toast('Evaluación eliminada.');}
  function imprimir(item){
    const w=window.open('','_blank','width=900,height=700');if(!w){toast('El navegador bloqueó la ventana de impresión.','warning');return}
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(item.tema||item.tipo||'Evaluación')}</title><style>@page{size:A4;margin:18mm}body{font-family:Arial,sans-serif;color:#111827;line-height:1.55;font-size:12pt}main{max-width:760px;margin:auto}.actions{text-align:right;margin-bottom:14px}.actions button{padding:8px 12px}pre{white-space:pre-wrap;font:inherit}@media print{.actions{display:none}}</style></head><body><main><div class="actions"><button onclick="window.print()">Imprimir / Guardar PDF</button></div><pre>${esc(item.contenido||'')}</pre></main></body></html>`);w.document.close();w.focus();
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('#eval-ia-generar')) capturarContextoEvaluacion();
    const btn=e.target.closest('.eval-lib-actions button');if(!btn)return;const item=obtenerItem(btn);if(!item)return;const a=btn.dataset.action;if(a==='ver')abrirModal(item);else if(a==='reutilizar')reutilizar(item);else if(a==='duplicar')duplicar(item);else if(a==='imprimir')imprimir(item);else if(a==='eliminar')eliminar(item);
  });

  function iniciar(){crearCategoria();instalarBotonEnRespuestas();const obs=new MutationObserver(()=>{if(!document.getElementById(TAB_ID))crearCategoria();if(!document.querySelector('.gemini-save-eval-library'))instalarBotonEnRespuestas()});obs.observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();
/* EDUGESTION_BIBLIOTECA_EVALUACIONES_IA_V1_END */


/* EDUGESTION_VISIBILIDAD_CATEGORIAS_IA_V2_START */
(() => {
  const DYNAMIC = {
    'tab-evaluaciones-ia': 'section-evaluaciones-ia',
    'tab-biblioteca-evaluaciones': 'section-biblioteca-evaluaciones',
    'tab-respuestas-ia': 'section-respuestas-ia'
  };

  function ocultarDinamicas(exceptId='') {
    Object.values(DYNAMIC).forEach(id => {
      const sec = document.getElementById(id);
      if (sec && id !== exceptId) sec.classList.add('hidden');
    });
  }

  function corregirVista(tab) {
    if (!tab) return;
    const sectionId = DYNAMIC[tab.id];
    if (sectionId) {
      document.querySelectorAll('#app-main > section').forEach(sec => sec.classList.add('hidden'));
      const sec = document.getElementById(sectionId);
      if (sec) sec.classList.remove('hidden');
      ocultarDinamicas(sectionId);
    } else {
      ocultarDinamicas();
    }
  }

  function iniciar() {
    if (!document.getElementById('edugestion-dynamic-hidden-fix')) {
      const st = document.createElement('style');
      st.id = 'edugestion-dynamic-hidden-fix';
      st.textContent = `
        #section-evaluaciones-ia.hidden,
        #section-biblioteca-evaluaciones.hidden,
        #section-respuestas-ia.hidden{display:none!important}
      `;
      document.head.appendChild(st);
    }

    const nav = document.getElementById('app-nav');
    if (!nav || nav.dataset.visibilityFixV2 === '1') return;
    nav.dataset.visibilityFixV2 = '1';
    nav.addEventListener('click', e => {
      const tab = e.target.closest('.nav-item');
      if (!tab) return;
      window.setTimeout(() => corregirVista(tab), 0);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, {once:true});
  else iniciar();
})();
/* EDUGESTION_VISIBILIDAD_CATEGORIAS_IA_V2_END */


/* ================================================================
   EduGestión · Cuadernillo Educación Física · FASE 1
   Fuente curricular: Cuadernillo Curricular MPPE aportado por el usuario.
   Navegación por nivel/grado/año + temas seleccionables.
   ================================================================ */
(() => {
  const TAB_ID='tab-cuadernillo-ef';
  const SECTION_ID='section-cuadernillo-ef';
  const STYLE_ID='style-cuadernillo-ef';
  const STORAGE_KEY='edugestion_cuadernillo_ef_seleccion';
  const DATA={"Inicial":[{"tema":"Destrezas corporales (4 a 6 meses de edad)","descripcion":"Destrezas corporales (4 a 6 meses de edad): deslizarse, rodar, trepar, etc. No locomotrices. Su característica principal es el manejo y dominio del cuerpo en el espacio. Ejemplos de estas habilidades son: balancearse, girar, retroceder, colgarse, etc.","intencionalidad":"• Potenciar los movimientos corporales. • Desarrollar la motricidad gruesa.","tejido":"• Movimientos corporales: posición de cúbito dorsal (boca arriba). • Movimientos corporales: Sentado, de lado, de pie. • Posición de cúbito abdominal (boca abajo). • Desplazamiento del rolado. • Reconocimiento de objetos. • Equilibrio estático.","pagina":5,"tipo":"Inicial","grado":"Inicial"},{"tema":"El mundo y Yo (7 a 12 meses)","descripcion":"El mundo y Yo (7 a 12 meses): manipulación gruesa. Identificando la manipulación de objetos en la posible solución de situaciones de juego.","intencionalidad":"Adquirir nociones viso-espaciales (dentro–fuera, delante–atrás). Potenciar la coordinación óculo– manual. Ampliar el campo perceptivo del niño y la niña. Apropiarse de objetos como medio para la solución de problemas. Desarrollar la motricidad fina y gruesa.","tejido":"Gateo o desplazamiento, en posición cuatro puntos. Agarra y deja caer objetos. Arroja y/o lanza objetos. Exploración de espacios. Desplazamiento de objetos. Llena envases con diferentes elementos. Vacía envases de elementos. Arma con materiales. Natación.","pagina":5,"tipo":"Inicial","grado":"Inicial"},{"tema":"Explorando materiales (de 12 a 18 meses)","descripcion":"Explorando materiales (de 12 a 18 meses): Manipulación de diversos materiales, textura, tamaño, figuras y colores. Estimulando la coordinación fina a través de la manipulación de materiales de construcción y diseños utilizados cotidianamente.","intencionalidad":"Propiciar la Solución de problemas apropiándose del espacio. Estimular la atención y la memoria. Desarrollar la prensión. Coordinar movimientos finos de la mano y la destreza en los dedos. Desarrollar su motricidad fina y coordinación óculo manual.","tejido":"Texturas, tamaños. Figuras, colores, y formas. Rasga y arruga. Envuelve, retuerce y enrolla. Uso de la pinza","pagina":5,"tipo":"Inicial","grado":"Inicial"},{"tema":"Experimentando sensaciones (de 18 a 24 meses)","descripcion":"Experimentando sensaciones (de 18 a 24 meses): Permite la posibilidad de percibir el espacio y su ubicación dentro de él, conocer el compás a través de los ritmos que encontramos en la naturaleza y los producidos con instrumentos musicales.","intencionalidad":"Desarrollar la motricidad gruesa y el equilibrio. Potenciar la capacidad de seguir ritmos con las palmas y los pies. Ampliar la percepción de ritmos musicales.","tejido":"Posición de pie. Desplazamiento en punta de pie. Desplazamiento sobre los talones. Ritmos con el cuerpo. Ritmos con varios objetos. Canales perceptivos.","pagina":6,"tipo":"Inicial","grado":"Inicial"},{"tema":"Conciencia corporal (de 18 a 24 meses de edad)","descripcion":"Conciencia corporal (de 18 a 24 meses de edad): Propicia el conocimiento de sí mismo y las diferencias y semejanzas con los demás.","intencionalidad":"Imita las partes del cuerpo segmentarias, a través de su cuerpo el de los demás.","tejido":"Partes del cuerpo segmentarias cabeza y tronco y Partes del cuerpo segmentarias brazos y piernas.","pagina":6,"tipo":"Inicial","grado":"Inicial"},{"tema":"Mis Primeras Creaciones (de 24 a 30 meses)","descripcion":"Mis Primeras Creaciones (de 24 a 30 meses): entre diferentes siluetas y objetos, Potenciando la creatividad y la construcción.","intencionalidad":"• Potenciar el autoconocimiento. • Agrupar objetos semejantes. • Adquirir nociones espacio- temporales como: adentro de – afuera de.","tejido":"• Trazado de siluetas.","pagina":6,"tipo":"Inicial","grado":"Inicial"},{"tema":"Explorando en el aula y fuera de ella (30 a 36 meses)","descripcion":"Explorando en el aula y fuera de ella (30 a 36 meses): sencillos, propicia la exploración y la atención a las orientaciones, activando la participación colectiva en actividades lúdicas como una forma de integración.","intencionalidad":"Desarrollar la motricidad fina al realizar sus creaciones. Orientarse en el espacio empleando como referencia su propio cuerpo. Potenciar el equilibrio y control de movimientos en actividades lúdicas.","tejido":"Tejido temático Moldeado de materiales. Orientación y búsqueda. Control de los movimientos. Coordinación de dinámica general. los Coordinación óculo-manual.","pagina":6,"tipo":"Inicial","grado":"Inicial"},{"tema":"Activación muscular","descripcion":"Activación muscular: estimulación y activación neuromuscular.","intencionalidad":"Propiciar juegos y/o actividades lúdicas que contribuyan a la activación y estimulación neuromuscular que permitan poner de manifiesto las diferentes habilidades motrices básicas.","tejido":"Caminar y correr. Juegos y actividades lúdicas. Estimulación de músculos. Estimulación de articulaciones.","pagina":6,"tipo":"Inicial","grado":"Inicial"},{"tema":"Hábitos de hidratación, alimentación e higiene","descripcion":"Hábitos de hidratación, alimentación e higiene: Orienta el conocimiento hacia las virtudes y conocimiento de hidratarse, alimentarse y el cuidado de la higiene personal.","intencionalidad":"Orientar la práctica de hidratación antes, durante y después de la actividad La higiene como un elemento importante para prevenir enfermedades y conservar la salud. Conocer y fortalecer la importancia una alimentación balanceada.","tejido":"La hidratación. Alimentación balanceada. Hábitos de higiene personal. de","pagina":6,"tipo":"Inicial","grado":"Inicial"},{"tema":"Prevención y cuidado de los espacios ambientales","descripcion":"Prevención y cuidado de los espacios ambientales: Concientización de la conservación y preservación de los espacios ambientales: escuela hogar, comunidad entre otros.","intencionalidad":"Participación en actividades relacionadas con la organización, conservación y preservación de los espacios ambientales.","tejido":"Espacios y materiales de la clase de Educación Física.","pagina":7,"tipo":"Inicial","grado":"Inicial"},{"tema":"Conciencia corporal","descripcion":"Conciencia corporal: Propicia el conocimiento de sí mismo y las diferencias y semejanzas con los demás.","intencionalidad":"Conocer e identificar las partes del cuerpo segmentarias, globales e interoceptivas con su cuerpo y el de los demás. Identificar y establecer diferencias entre su identidad y género en sí mismo como en las demás personas. Desarrollar el sentido de la lateralidad, que le permita ubicar su lado derecho e izquierdo.","tejido":"Partes del cuerpo segmentarias. Partes del cuerpo globales. Partes interoceptivas. Aspectos anatómicos. Aspectos fisiológicos. Lateralidad. Coordinación óculo-manual. Canales perceptivos.","pagina":7,"tipo":"Inicial","grado":"Inicial"},{"tema":"Estructura temporo – espacial","descripcion":"Estructura temporo – espacial:","intencionalidad":"• Participar en juegos y actividades lúdicas donde se ponga de manifiesto la dirección, distancia y tiempo para generar en ellos respuestas motrices.","tejido":"• Ubicación espacial. • Dirección. • Velocidad • Formaciones grupales.","pagina":7,"tipo":"Inicial","grado":"Inicial"},{"tema":"Habilidades motrices básicas","descripcion":"Habilidades motrices básicas: 7","intencionalidad":"Aplicar diversas actividades que permitan poner de manifiesto las diferentes habilidades motrices básicas.","tejido":"Gateo continuo. Rolado continúo. Reptar. Caminar y correr. Saltos unipodales. Saltos bipodales. Medición de la fuerza.","pagina":7,"tipo":"Inicial","grado":"Inicial"},{"tema":"Coordinación sensorio – motriz","descripcion":"Coordinación sensorio – motriz: Lanzamientos, Recepción), Coordinación óculo – podal: (Pateo, Recepción, Conducción), habilidades kinestésicas.","intencionalidad":"Propiciar actividades lúdicas y recreativos utilizando herramientas e instrumentos y materiales en actividades que requieran de control precisión en relación a la coordinación óculo – manual y óculo - podal.","tejido":"Rebote de pelotas. Lanzar y recibir. Patear y recibir. y Dirección.","pagina":7,"tipo":"Inicial","grado":"Inicial"},{"tema":"Control corporal","descripcion":"Control corporal: Permite tener conciencia de sus potencialidades y asumir control de ellas.","intencionalidad":"Fortalecer el control de su propio cuerpo en los diferentes segmentos corporales, tanto en reposo como en movimiento interrelacionando con espacio y los objetos que lo rodean.","tejido":"Técnicas de respiración. Equilibrio estático. Equilibrio dinámico. el Caminar y sentarse. Levantarse y recoger. Acostarse y levantarse. Técnicas de relajación.","pagina":7,"tipo":"Inicial","grado":"Inicial"},{"tema":"Recreación como medio formativo","descripcion":"Recreación como medio formativo: Estrategia pedagógica que contribuye al reforzamiento de los valores universales para la vida.","intencionalidad":"Reforzar los valores universales para la vida tales como: la cooperación, respeto, la solidaridad, el amor, la paz, entre otros.","tejido":"Actividades lúdicas. el Actividades recreativas. Juegos colaborativos. Juegos cooperativos.","pagina":8,"tipo":"Inicial","grado":"Inicial"},{"tema":"Juegos Educativos","descripcion":"Juegos Educativos: Como un medio para la formación integral, inclusiva, participativa, protagónica, lúdica y con valores, que respete los intereses, necesidades y potencialidades tanto individuales como colectivas.","intencionalidad":"Propiciar la formación integral, inclusiva, participativa, lúdica y en valores.","tejido":"Juegos educativos. Juegos contextualizados. Gimnasia. Ajedrez. Mini Atletismo. Natación.","pagina":8,"tipo":"Inicial","grado":"Inicial"}],"1er Grado":[{"tema":"Activación o acondicionamiento neuromuscular","descripcion":"Activación o acondicionamiento neuromuscular: y novedosas que contribuyen a la estimulación y activación neuromuscular. Reconocimiento de sí misma o mismo, actividades lúdicas para la activación de los músculos y articulaciones.","intencionalidad":"• Propiciar juegos y/o actividades lúdicas que contribuyan a la activación y estimulación neuromuscular que permitan poner de manifiesto las diferentes habilidades motrices básicas.","tejido":"• Camina y corre hacia un sitio determinado. • Identifica y reconoce las partes del cuerpo de sí mismo como en las demás personas. • Aplica juegos y actividades lúdicas, para la estimulación de músculos y articulaciones. • Participa en juegos y/o actividades lúdicas que contribuyan a la activación neuromuscular del niño y la niña. • Conoce e identifica las partes del cuerpo segmentarias, globales e interoceptivas con su cuerpo y el de los demás. • Aplica diversas actividades que permitan poner de manifiesto las diferentes habilidades motrices que posee el niño y la niña.","pagina":8,"tipo":"Primaria","grado":"1er Grado"},{"tema":"Aplicación de hábitos alimenticios, de hidratación e higiene","descripcion":"Aplicación de hábitos alimenticios, de hidratación e higiene: Orienta el conocimiento hacia las virtudes y conocimiento de hidratarse, alimentarse y el cuidado de la higiene personal diario, para el desarrollo adecuado de las diferentes actividades físicas, preservando la salud, entre otros.","intencionalidad":"Orientar la práctica de hidratación • l antes, durante y después de la actividad La higiene como un elemento importante para prevenir enfermedades y conservar la salud. Conocer y fortalecer la importancia • l de una alimentación balanceada.","tejido":"Reconoce la importancia de la hidratación antes, durante y después de la actividad física Comprende la importancia de la alimentación balanceada en la vida diaria Promueve buenos hábitos de higiene personal antes y después de la actividad física. Se hidrata antes, durante y después de la actividad física. Está pendiente de su higiene personal. Conoce e identifica el trompo de los alimentos. Conoce la importancia que tiene el consumo de agua.","pagina":9,"tipo":"Primaria","grado":"1er Grado"},{"tema":"Prevención y cuidado de los espacios ambientales destinados para la educación física","descripcion":"Prevención y cuidado de los espacios ambientales destinados para la educación física: Concientización de la organización, conservación, preservación y mantenimiento de los espacios ambientales y de trabajo: escuela, hogar, parques, comunidad entre otros.","intencionalidad":"Tejido Participación en actividades • l relacionadas con la organización, conservación y preservación de los espacios ambientales.","tejido":"temático: Participa, organiza y conserva los espacios y materiales de la clase de Educación Física.","pagina":9,"tipo":"Primaria","grado":"1er Grado"},{"tema":"Conciencia corporal","descripcion":"Conciencia corporal:","intencionalidad":"Tejido • Conocer e identificar las partes del • cuerpo segmentarias, globales e interoceptivas con su cuerpo y el de • los demás. • Identificar y establecer diferencias entre su identidad y género en sí • mismo como en las demás personas. • Desarrollar el sentido de la lateralidad, • que le permita ubicar su lado derecho e izquierdo. l","tejido":"temático: Identificar y reconocer las partes del cuerpo segmentarias: (ojos, nariz entre otras). en sí mismo como en las demás personas. Identificar y reconocer las partes globales (extremidades superiores, inferiores, cabeza y tronco, entre otros). del cuerpo en sí mismo como en las demás personas. Identificar y reconocer las partes interoceptivas (órganos internos) del cuerpo en sí mismo como en las demás personas. Reconocer el género, identificando los aspectos desde lo (anatómico y fisiológico). Establecer semejanzas y diferencias en los roles masculinos y femeninos. Identificar su lado derecho e izquierdo, en relación con su cuerpo y con otros elementos externos.","pagina":9,"tipo":"Primaria","grado":"1er Grado"},{"tema":"Estructura temporo – espacial","descripcion":"Estructura temporo – espacial: Permite el acercamiento a las hábilidades motrices mediante el juego. Orientación espacial, estructura espacial, orientación temporal, organización temporal, estructura temporal, formaciones grupales (columnas, filas, círculos, triángulos y rectángulos), percepción sensorial, sentido temporo espacial.","intencionalidad":"Participar en juegos y actividades • l lúdicas donde se ponga de manifiesto la dirección, distancia y tiempo para generar en ellos respuestas motrices.","tejido":"Ubicar y direccionar objetos (arriba – abajo – dentro – fuera – cerca – lejos – grande – pequeño) en el espacio. Caminar y correr en diferentes direcciones (adelante – atrás – hacia los lados). Desplazarse en diferentes velocidades (lento – rápido). Identificar direcciones largas y cortas. Ubicar en el espacio diferentes formaciones grupales, tales como: fila – columna – círculos – semicírculos – pareja.","pagina":9,"tipo":"Primaria","grado":"1er Grado"},{"tema":"Habilidades motrices básicas","descripcion":"Habilidades motrices básicas: Profundiza la complejidad de habilidades motrices básicas. Desarrollo locomotor: gatear, rolar, rectar, trepar, caminar, correr y saltar.","intencionalidad":"Aplicar diversas actividades que • l permitan poner de manifiesto las diferentes habilidades motrices básicas.","tejido":"Ejecutar desplaza gateando de forma continua. Ejecutar desplazamiento rolando de forma continua. Ejecutar desplazamiento reptando de forma continua. Caminar y correr hacia un sitio determinado. Ejecutar saltos unipodales (en un solo pie). Realizar saltos bipodales (en dos pies).","pagina":10,"tipo":"Primaria","grado":"1er Grado"},{"tema":"Coordinación sensorio – motriz","descripcion":"Coordinación sensorio – motriz.: Desarrolla la coordinación óculo – manual: (Rebotes, Golpes, Lanzamientos, Recepción), Coordinación óculo – podal: (Pateo, Recepción, Conducción), habilidades kinestésicas.","intencionalidad":"Tejido Propiciar actividades lúdicas y • l recreativos utilizando herramientas e instrumentos y materiales en actividades que requieran de control y precisión en relación a la coordinación óculo – manual y óculo - podal.","tejido":"temático: Golpear objetos de diferentes tamaños y peso. Rebotar pelotas de diferentes tamaños y pesos con una y ambas manos de forma estática y con desplazamientos. Lanzar objetos con una y con ambas manos. Lanzar hacia un sitio determinado. Realizar recepción de objetos con ambas manos de forma estática y con desplazamientos. Patear pelotas y balones de diferentes tamaños y pesos. Patear pelotas y balones hacia un sitio determinado. Recibir balones con ambos pies de forma alterna. Dirigir el balón en línea recta y en zic-zac hacia un sitio determinado.","pagina":10,"tipo":"Primaria","grado":"1er Grado"},{"tema":"Control corporal","descripcion":"Control corporal: Tono muscular, Equilibrio, Postura, Relajación.","intencionalidad":"Tejido • Fortalecer el control de su propio • cuerpo en los diferentes segmentos corporales, tanto en reposo como en • movimiento interrelacionando con el espacio y los objetos que lo rodean. l","tejido":"temático: Realizar técnicas de respiración durante y después de la clase de educación física. Realizar equilibrio estático en un (solo pie, sobre la punta de los pies y sobre los talones). Ejecutar equilibrio dinámico (caminando sobre la punta de los pies, sobre los talones, en línea recta y con objetos sobre la cabeza). Ejecutar posturas apropiadas al colocarse (de pie, caminar, sentarse, levantarse de la silla, recoger un objeto del suelo, acostarse y levantarse de la cama). Ejecutar técnicas de relajación al finalizar la clase de educación física contribuyendo con el proceso vuelta a la calma.","pagina":10,"tipo":"Primaria","grado":"1er Grado"},{"tema":"Deporte Educativo","descripcion":"Deporte Educativo: Sirve como un medio para la formación integral, inclusiva, participativa, protagónica, lúdica y con valores, que respete los intereses, necesidades y potencialidades tanto individuales como colectivas. (gimnasia, ajedrez, mini atletismo y natación).","intencionalidad":"Propiciar la formación integral, • l inclusiva, participativa, lúdica y en valores.","tejido":"Participar en juegos educativos, con material didáctico de provecho individual o colectivo. Participar en juegos contextualizados, donde todos puedan interactuar entre sí, poniéndose de manifiesto el aspecto socio afectivo. Crear juegos partiendo de su creatividad e imaginación y con sus propias reglas.","pagina":10,"tipo":"Primaria","grado":"1er Grado"},{"tema":"Recreación como medio formativo","descripcion":"Recreación como medio formativo: Estrategia pedagógica recreativa que contribuye al reforzamiento de los valores universales para la vida.","intencionalidad":"Reforzar los valores universales para • l la vida tales como: la cooperación, el respeto, la solidaridad, el amor, la paz, entre otros.","tejido":"Propiciar actividades lúdicas y recreativas que permitan el desarrollo biopsicosocial del estudiante.","pagina":10,"tipo":"Primaria","grado":"1er Grado"}],"2do Grado":[{"tema":"Activación o acondicionamiento neuromuscular","descripcion":"Activación o acondicionamiento neuromuscular: y novedosas que contribuyen a la estimulación y activación neuromuscular. Reconocimiento de sí misma o mismo, actividades lúdicas para la activación de los músculos y articulaciones.","intencionalidad":"• Propiciar juegos y/o actividades lúdicas que contribuyan a la activación y estimulación neuromuscular que permitan poner de manifiesto las diferentes habilidades motrices básicas.","tejido":"• Camina y corre hacia un sitio determinado. • Identifica y reconoce las partes del cuerpo de sí mismo como en las demás personas. • Aplica juegos y actividades lúdicas, para la estimulación de músculos y articulaciones. • Participa en juegos y/o actividades lúdicas que contribuyan a la activación neuromuscular del niño y la niña. • Conoce e identifica las partes del cuerpo segmentarias, globales e interoceptivas con su cuerpo y el de los demás. • Aplica diversas actividades que permitan poner de manifiesto las diferentes habilidades motrices que posee el niño y la niña.","pagina":8,"tipo":"Primaria","grado":"2do Grado"},{"tema":"Aplicación de hábitos alimenticios, de hidratación e higiene","descripcion":"Aplicación de hábitos alimenticios, de hidratación e higiene: Orienta el conocimiento hacia las virtudes y conocimiento de hidratarse, alimentarse y el cuidado de la higiene personal diario, para el desarrollo adecuado de las diferentes actividades físicas, preservando la salud, entre otros.","intencionalidad":"Orientar la práctica de hidratación • l antes, durante y después de la actividad La higiene como un elemento importante para prevenir enfermedades y conservar la salud. Conocer y fortalecer la importancia • l de una alimentación balanceada.","tejido":"Reconoce la importancia de la hidratación antes, durante y después de la actividad física Comprende la importancia de la alimentación balanceada en la vida diaria Promueve buenos hábitos de higiene personal antes y después de la actividad física. Se hidrata antes, durante y después de la actividad física. Está pendiente de su higiene personal. Conoce e identifica el trompo de los alimentos. Conoce la importancia que tiene el consumo de agua.","pagina":9,"tipo":"Primaria","grado":"2do Grado"},{"tema":"Prevención y cuidado de los espacios ambientales destinados para la educación física","descripcion":"Prevención y cuidado de los espacios ambientales destinados para la educación física: Concientización de la organización, conservación, preservación y mantenimiento de los espacios ambientales y de trabajo: escuela, hogar, parques, comunidad entre otros.","intencionalidad":"Tejido Participación en actividades • l relacionadas con la organización, conservación y preservación de los espacios ambientales.","tejido":"temático: Participa, organiza y conserva los espacios y materiales de la clase de Educación Física.","pagina":9,"tipo":"Primaria","grado":"2do Grado"},{"tema":"Conciencia corporal","descripcion":"Conciencia corporal:","intencionalidad":"Tejido • Conocer e identificar las partes del • cuerpo segmentarias, globales e interoceptivas con su cuerpo y el de • los demás. • Identificar y establecer diferencias entre su identidad y género en sí • mismo como en las demás personas. • Desarrollar el sentido de la lateralidad, • que le permita ubicar su lado derecho e izquierdo. l","tejido":"temático: Identificar y reconocer las partes del cuerpo segmentarias: (ojos, nariz entre otras). en sí mismo como en las demás personas. Identificar y reconocer las partes globales (extremidades superiores, inferiores, cabeza y tronco, entre otros). del cuerpo en sí mismo como en las demás personas. Identificar y reconocer las partes interoceptivas (órganos internos) del cuerpo en sí mismo como en las demás personas. Reconocer el género, identificando los aspectos desde lo (anatómico y fisiológico). Establecer semejanzas y diferencias en los roles masculinos y femeninos. Identificar su lado derecho e izquierdo, en relación con su cuerpo y con otros elementos externos.","pagina":9,"tipo":"Primaria","grado":"2do Grado"},{"tema":"Estructura temporo – espacial","descripcion":"Estructura temporo – espacial: Permite el acercamiento a las hábilidades motrices mediante el juego. Orientación espacial, estructura espacial, orientación temporal, organización temporal, estructura temporal, formaciones grupales (columnas, filas, círculos, triángulos y rectángulos), percepción sensorial, sentido temporo espacial.","intencionalidad":"Participar en juegos y actividades • l lúdicas donde se ponga de manifiesto la dirección, distancia y tiempo para generar en ellos respuestas motrices.","tejido":"Ubicar y direccionar objetos (arriba – abajo – dentro – fuera – cerca – lejos – grande – pequeño) en el espacio. Caminar y correr en diferentes direcciones (adelante – atrás – hacia los lados). Desplazarse en diferentes velocidades (lento – rápido). Identificar direcciones largas y cortas. Ubicar en el espacio diferentes formaciones grupales, tales como: fila – columna – círculos – semicírculos – pareja.","pagina":9,"tipo":"Primaria","grado":"2do Grado"},{"tema":"Habilidades motrices básicas","descripcion":"Habilidades motrices básicas: Profundiza la complejidad de habilidades motrices básicas. Desarrollo locomotor: gatear, rolar, rectar, trepar, caminar, correr y saltar.","intencionalidad":"Aplicar diversas actividades que • l permitan poner de manifiesto las diferentes habilidades motrices básicas.","tejido":"Ejecutar desplaza gateando de forma continua. Ejecutar desplazamiento rolando de forma continua. Ejecutar desplazamiento reptando de forma continua. Caminar y correr hacia un sitio determinado. Ejecutar saltos unipodales (en un solo pie). Realizar saltos bipodales (en dos pies).","pagina":10,"tipo":"Primaria","grado":"2do Grado"},{"tema":"Coordinación sensorio – motriz","descripcion":"Coordinación sensorio – motriz.: Desarrolla la coordinación óculo – manual: (Rebotes, Golpes, Lanzamientos, Recepción), Coordinación óculo – podal: (Pateo, Recepción, Conducción), habilidades kinestésicas.","intencionalidad":"Tejido Propiciar actividades lúdicas y • l recreativos utilizando herramientas e instrumentos y materiales en actividades que requieran de control y precisión en relación a la coordinación óculo – manual y óculo - podal.","tejido":"temático: Golpear objetos de diferentes tamaños y peso. Rebotar pelotas de diferentes tamaños y pesos con una y ambas manos de forma estática y con desplazamientos. Lanzar objetos con una y con ambas manos. Lanzar hacia un sitio determinado. Realizar recepción de objetos con ambas manos de forma estática y con desplazamientos. Patear pelotas y balones de diferentes tamaños y pesos. Patear pelotas y balones hacia un sitio determinado. Recibir balones con ambos pies de forma alterna. Dirigir el balón en línea recta y en zic-zac hacia un sitio determinado.","pagina":10,"tipo":"Primaria","grado":"2do Grado"},{"tema":"Control corporal","descripcion":"Control corporal: Tono muscular, Equilibrio, Postura, Relajación.","intencionalidad":"Tejido • Fortalecer el control de su propio • cuerpo en los diferentes segmentos corporales, tanto en reposo como en • movimiento interrelacionando con el espacio y los objetos que lo rodean. l","tejido":"temático: Realizar técnicas de respiración durante y después de la clase de educación física. Realizar equilibrio estático en un (solo pie, sobre la punta de los pies y sobre los talones). Ejecutar equilibrio dinámico (caminando sobre la punta de los pies, sobre los talones, en línea recta y con objetos sobre la cabeza). Ejecutar posturas apropiadas al colocarse (de pie, caminar, sentarse, levantarse de la silla, recoger un objeto del suelo, acostarse y levantarse de la cama). Ejecutar técnicas de relajación al finalizar la clase de educación física contribuyendo con el proceso vuelta a la calma.","pagina":10,"tipo":"Primaria","grado":"2do Grado"},{"tema":"Deporte Educativo","descripcion":"Deporte Educativo: Sirve como un medio para la formación integral, inclusiva, participativa, protagónica, lúdica y con valores, que respete los intereses, necesidades y potencialidades tanto individuales como colectivas. (gimnasia, ajedrez, mini atletismo y natación).","intencionalidad":"Propiciar la formación integral, • l inclusiva, participativa, lúdica y en valores.","tejido":"Participar en juegos educativos, con material didáctico de provecho individual o colectivo. Participar en juegos contextualizados, donde todos puedan interactuar entre sí, poniéndose de manifiesto el aspecto socio afectivo. Crear juegos partiendo de su creatividad e imaginación y con sus propias reglas.","pagina":10,"tipo":"Primaria","grado":"2do Grado"},{"tema":"Recreación como medio formativo","descripcion":"Recreación como medio formativo: Estrategia pedagógica recreativa que contribuye al reforzamiento de los valores universales para la vida.","intencionalidad":"Reforzar los valores universales para • l la vida tales como: la cooperación, el respeto, la solidaridad, el amor, la paz, entre otros.","tejido":"Propiciar actividades lúdicas y recreativas que permitan el desarrollo biopsicosocial del estudiante.","pagina":10,"tipo":"Primaria","grado":"2do Grado"}],"3er Grado":[{"tema":"Activación o acondicionamiento neuromuscular","descripcion":"Activación o acondicionamiento neuromuscular: Nuevas formas de ejecución, lúdicas, creativas y novedosas que contribuyen a la estimulación y activación neuromuscular. Reconocimiento de sí misma o mismo, actividades lúdicas para la activación de los músculos y articulaciones.","intencionalidad":"Propiciar juegos y/o actividades • l lúdicas que contribuyan a la activación y estimulación neuromuscular que permitan poner de manifiesto las diferentes habilidades motrices básicas.","tejido":"Camina y corre hacia un sitio determinado. Identifica y reconoce las partes del cuerpo de sí mismo como en las demás personas. Aplica juegos y actividades lúdicas, para la estimulación de músculos y articulaciones. Participa en juegos y/o actividades lúdicas que contribuyan a la activación neuromuscular del niño y la niña. Conoce e identifica las partes del cuerpo segmentarias, globales e interoceptivas con su cuerpo y el de los demás. Aplica diversas actividades que permitan poner de manifiesto las diferentes habilidades motrices que posee el niño y la niña.","pagina":11,"tipo":"Primaria","grado":"3er Grado"},{"tema":"Aplicación de hábitos alimenticios, de hidratación e higiene","descripcion":"Aplicación de hábitos alimenticios, de hidratación e higiene: Orienta el conocimiento hacia las virtudes y conocimiento de hidratarse, alimentarse y el cuidado de la higiene personal diario, para el desarrollo adecuado de las diferentes actividades físicas, preservando la salud, entre otros.","intencionalidad":"Tejido Orientar la práctica de hidratación • l antes, durante y después de la actividad La higiene como un elemento importante para prevenir enfermedades y conservar la salud. Conocer y fortalecer la importancia • l de una alimentación balanceada.","tejido":"temático: Reconocer la importancia de la hidratación antes, durante y después de la actividad física. Comprender la importancia de la alimentación balanceada en la vida diaria. Promover buenos hábitos de higiene personal antes y después de la actividad física. Está pendiente de su higiene personal. Identificar los grupos del trompo de los alimentos, su aporte energético y de nutrientes.","pagina":11,"tipo":"Primaria","grado":"3er Grado"},{"tema":"Prevención y cuidado de los espacios ambientales destinados para la educación física","descripcion":"Prevención y cuidado de los espacios ambientales destinados para la educación física: de la organización, conservación, preservación y mantenimiento de los espacios ambientales y de trabajo: escuela, hogar, parques, comunidad entre otros.","intencionalidad":"Tejido • Participación en actividades • relacionadas con la organización, conservación y preservación de los • espacios ambientales.","tejido":"temático: Organizar y conservar los espacios y materiales de la clase de Educación Física. Conservar los espacios al aire libre después de realizar alguna actividad.","pagina":11,"tipo":"Primaria","grado":"3er Grado"},{"tema":"Conciencia corporal","descripcion":"Conciencia corporal: Propicia el conocimiento de sí mismo, las diferencias y semejanzas con los demás.","intencionalidad":"Conocer e identificar las partes del • l cuerpo segmentarias, globales e interoceptivas con su cuerpo y el de los demás. Identificar y establecer diferencias entre su identidad y género en sí mismo como en las demás personas. Desarrollar el sentido de la lateralidad, • l que le permita ubicar su lado derecho e izquierdo.","tejido":"Reconocer las partes del cuerpo segmentarias: (ojos, nariz entre otras), en sí mismo como en las demás personas. Reconocer las partes globales (extremidades superiores, inferiores, cabeza y tronco, entre otros), del cuerpo en sí mismo como en las demás personas. Reconocer las partes interoceptivas (órganos internos) del cuerpo en sí mismo como en las demás personas. Reconocer el género, identificando los aspectos desde lo (anatómico y fisiológico). Establecer semejanzas y diferencias en los roles masculinos y femeninos. Identificar su lado derecho e izquierdo, en relación con su cuerpo y con otros elementos externos.","pagina":11,"tipo":"Primaria","grado":"3er Grado"},{"tema":"Estructura temporo – espacial","descripcion":"Estructura temporo – espacial: Permite el acercamiento a las habilidades motrices mediante el juego. Orientación espacial, estructura espacial, orientación temporal, organización temporal, estructura temporal, formaciones grupales (columnas, filas, círculos, triángulos y rectángulos), percepción sensorial, sentido temporo espacial.","intencionalidad":"Participar en juegos y actividades • l lúdicas donde se ponga de manifiesto la dirección, distancia y tiempo para generar en ellos respuestas motrices.","tejido":"Direccionar objetos (arriba – abajo – dentro – fuera – cerca – lejos – grande – pequeño) en el espacio. Caminar y correr en diferentes direcciones (adelante – atrás – hacia los lados). Desplazarse en diferentes velocidades (lento – rápido). Identificar direcciones largas y cortas. Ubicar en el espacio diferentes formaciones grupales, tales como: fila – columna – círculos – semicírculos – pareja.","pagina":12,"tipo":"Primaria","grado":"3er Grado"},{"tema":"Habilidades motrices básicas","descripcion":"Habilidades motrices básicas: Profundiza la complejidad de habilidades motrices básicas. Desarrollo locomotor: gatear, rolar, rectar, trepar, caminar, correr y saltar.","intencionalidad":"Tejido Aplicar diversas actividades que • l permitan poner de manifiesto las diferentes habilidades motrices básicas.","tejido":"temático: Ejecutar desplazamiento gateando de forma continua. Ejecutar desplazamiento rolando de forma continua. Ejecutar desplazamiento reptando de forma continua. Ejecutar lanzamientos de forma continua en diferentes direcciones. Ejecutar lanzamientos de forma precisa. Caminar y correr hacia un sitio determinado. Ejecutar saltos unipodales (en un solo pie). Realizar saltos bipodales (en dos pies).","pagina":12,"tipo":"Primaria","grado":"3er Grado"},{"tema":"Coordinación sensorio – motriz","descripcion":"Coordinación sensorio – motriz.: Lanzamientos, Recepción), Coordinación óculo – podal: (Pateo, Recepción, Conducción), habilidades kinestésicas.","intencionalidad":"Tejido • Propiciar actividades lúdicas y • recreativos utilizando herramientas • e instrumentos y materiales en actividades que requieran de • control y precisión en relación a la • coordinación óculo – manual • y óculo - podal.","tejido":"temático: Golpear objetos de diferentes tamaños y peso. Rebotar pelotas de diferentes tamaños y pesos con una y ambas manos de forma estática y con desplazamientos. Lanzar objetos con una y con ambas manos. Lanzar con precisión, hacia un sitio determinado. Realizar recepción de objetos con ambas manos de forma estática y con desplazamientos. Patear pelotas y balones de diferentes tamaños y pesos. Patear pelotas y balones hacia un sitio determinado. Recibir balones con ambos pies de forma alterna. Dirigir el balón en línea recta y en otras formas hacia un sitio determinado.","pagina":12,"tipo":"Primaria","grado":"3er Grado"},{"tema":"Control corporal","descripcion":"Control corporal: Permite tener conciencia de sus potencialidades y asumir control de ellas. Respiración, Tono muscular, Equilibrio, Postura, Relajación.","intencionalidad":"Fortalecer el control de su propio • l cuerpo en los diferentes segmentos corporales, tanto en reposo como en movimiento interrelacionando con el espacio y los objetos que lo rodean.","tejido":"Realizar técnicas de respiración durante y después de la clase de educación física. Realizar equilibrio estático en un (solo pie, sobre la punta de los pies y sobre los talones). Ejecutar equilibrio dinámico (caminando sobre la punta de los pies, sobre los talones, en línea recta y con objetos sobre la cabeza). Ejecutar posturas apropiadas al colocarse (de pie, caminar, sentarse, levantarse de la silla, recoger un objeto del suelo, acostarse y levantarse de la cama). Ejecutar técnicas de relajación al finalizar la clase de educación física contribuyendo con el proceso vuelta a la calma.","pagina":12,"tipo":"Primaria","grado":"3er Grado"},{"tema":"Deporte Educativo","descripcion":"Deporte Educativo: Sirve como un medio para la formación integral, inclusiva, participativa, protagónica, lúdica y con valores, que respete los intereses, necesidades y potencialidades tanto individuales como colectivas. (gimnasia, ajedrez, mini atletismo y natación).","intencionalidad":"Propiciar la formación integral, • l inclusiva, participativa, lúdica y en valores.","tejido":"Participar en juegos educativos, con material didáctico de provecho individual o colectivo. Participar en juegos contextualizados, donde todos puedan interactuar entre sí, poniéndose de manifiesto el aspecto socio afectivo. Crear juegos partiendo de su creatividad e imaginación y con sus propias reglas.","pagina":13,"tipo":"Primaria","grado":"3er Grado"},{"tema":"Recreación como medio formativo","descripcion":"Recreación como medio formativo: Estrategia pedagógica recreativa que contribuye al reforzamiento de los valores universales para la vida.","intencionalidad":"Tejido Reforzar los valores universales para • l la vida tales como: la cooperación, el respeto, la solidaridad, el amor, la paz, entre otros.","tejido":"temático: Propiciar actividades lúdicas y recreativas que permitan el desarrollo biopsicosocial del estudiante. 4to Grado","pagina":13,"tipo":"Primaria","grado":"3er Grado"}],"4to Grado":[{"tema":"Acondicionamiento neuromuscular","descripcion":"Acondicionamiento neuromuscular: activación de los músculos y articulaciones. Nuevas formas de ejecución, lúdicas, creativas y novedosas que contribuyen a la estimulación y activación neuromuscular.","intencionalidad":"Tejido • Propiciar juegos y/o actividades • lúdicas que contribuyan a • la activación y estimulación neuromuscular que permitan • poner de manifiesto las diferentes habilidades motrices básicas. l","tejido":"temático: Caminar, trotar y correr hacia un sitio determinado. Reconocer las partes del cuerpo de sí mismo, como en las demás personas. Realizar juegos y actividades lúdicas, para la estimulación de músculos y articulaciones. Conocer e identificar las partes del cuerpo segmentarias, globales e interoceptivas con su cuerpo y el de los demás. Aplicar diversas actividades que permitan poner de manifiesto las diferentes habilidades motrices que posee el niño y la niña.","pagina":13,"tipo":"Primaria","grado":"4to Grado"},{"tema":"Aplicación de hábitos alimenticios, de hidratación e higiene","descripcion":"Aplicación de hábitos alimenticios, de hidratación e higiene: Orienta el conocimiento hacia las virtudes y conocimiento de hidratarse, alimentarse y el cuidado de la higiene personal diario, para el desarrollo adecuado de las diferentes actividades físicas, preservando la salud, entre otros.","intencionalidad":"Orientar la práctica de hidratación • l antes, durante y después de la actividad La higiene como un elemento importante para prevenir enfermedades y conservar la salud. Conocer y fortalecer la importancia • l de una alimentación balanceada.","tejido":"Conocer la importancia de la hidratación antes, durante y después de la actividad física. Comprender la importancia de la alimentación balanceada en la vida diaria. Promover buenos hábitos de higiene personal antes y después de la actividad física. Estar pendiente de su higiene personal. Identificar los grupos del trompo de los alimentos, su aporte energético y de nutrientes. Realizar actividades lúdicas con los grupos del trompo de los alimentos.","pagina":13,"tipo":"Primaria","grado":"4to Grado"},{"tema":"Prevención y cuidado de los espacios ambientales destinados para la educación física","descripcion":"Prevención y cuidado de los espacios ambientales destinados para la educación física: Concientización de la organización, conservación, preservación y mantenimiento de los espacios ambientales y de trabajo: escuela, hogar, parques, comunidad entre otros.","intencionalidad":"Participación en actividades • l relacionadas con la organización, conservación y preservación de los espacios ambientales.","tejido":"Participar en actividades lúdicas al aire libre que tenga que ver con la conservación los espacios naturales. Conservar los materiales que se usan para la clase de Educación Física.","pagina":14,"tipo":"Primaria","grado":"4to Grado"},{"tema":"Conciencia corporal","descripcion":"Conciencia corporal:","intencionalidad":"Tejido Conocer e identificar las partes del • l cuerpo segmentarias, globales e interoceptivas con su cuerpo y el de los demás. Identificar y establecer diferencias entre su identidad y género en sí mismo como en las demás personas. Desarrollar el sentido de la lateralidad, • l que le permita ubicar su lado derecho e izquierdo.","tejido":"temático: Conocer las partes del cuerpo segmentarias: (ojos, nariz entre otras), en sí mismo como en las demás personas. Conocer las partes globales (extremidades superiores, inferiores, cabeza y tronco, entre otros), del cuerpo en sí mismo como en las demás personas. Conocer las partes interoceptivas (órganos internos) del cuerpo en sí mismo como en las demás personas. Conocer el género, identificando los aspectos desde lo (anatómico y fisiológico). Establecer semejanzas y diferencias en los roles masculinos y femeninos. Comprender su lado derecho e izquierdo, en relación con su cuerpo y con otros elementos externos.","pagina":14,"tipo":"Primaria","grado":"4to Grado"},{"tema":"Estructura temporo – espacial","descripcion":"Estructura temporo – espacial: Orientación espacial, estructura espacial, orientación temporal, organización temporal, estructura temporal, formaciones grupales (columnas, filas, círculos, triángulos y rectángulos), percepción sensorial, sentido temporo espacial. 14","intencionalidad":"Tejido • Participar en juegos y actividades • lúdicas donde se ponga de manifiesto la dirección, distancia y tiempo para • generar en ellos respuestas motrices.","tejido":"temático: Direccionar objetos (arriba – abajo – dentro – fuera – cerca – lejos – grande – pequeño) en el espacio. Caminar, trotar y correr en diferentes direcciones (adelante – atrás – hacia los lados). Desplazarse en diferentes velocidades (lento – rápido). Desplazarse en direcciones largas y cortas. Ubicar en el espacio diferentes formaciones grupales, tales como: fila – columna – círculos – semicírculos – pareja.","pagina":14,"tipo":"Primaria","grado":"4to Grado"},{"tema":"Habilidades motrices básicas","descripcion":"Habilidades motrices básicas: Profundiza la complejidad de habilidades motrices básicas. Desarrollo locomotor: gatear, rolar, rectar, trepar, caminar, correr y saltar.","intencionalidad":"Aplicar diversas actividades que • l permitan poner de manifiesto las diferentes habilidades motrices básicas.","tejido":"Realizar actividades que tengan que ver con trepar, rolar y rectar de forma continua. Ejecutar lanzamientos de forma continua en diferentes direcciones. Ejecutar lanzamientos de forma precisa. Caminar y correr hacia un sitio determinado. Ejecutar saltos unipodales (en un solo pie) y con dificultades. Realizar saltos bipodales (en dos pies) y con dificultades.","pagina":14,"tipo":"Primaria","grado":"4to Grado"},{"tema":"Coordinación sensorio – motriz","descripcion":"Coordinación sensorio – motriz.: Desarrolla la coordinación óculo – manual: (Rebotes, Golpes, Lanzamientos, Recepción), Coordinación óculo – podal: (Pateo, Recepción, Conducción), habilidades kinestésicas.","intencionalidad":"Propiciar actividades lúdicas y • l recreativos utilizando herramientas e instrumentos y materiales en actividades que requieran de control y precisión en relación a la coordinación óculo – manual y óculo - podal.","tejido":"Golpear objetos de diferentes tamaños y peso. Driblar o rebotar pelotas de diferentes tamaños y pesos con una y ambas manos de forma estática y con desplazamientos. Lanzar objetos con una y con ambas manos. Lanzar con precisión, hacia un sitio determinado. Realizar recepción de objetos con ambas manos de forma estática y con desplazamientos. Patear pelotas y balones de diferentes tamaños y pesos. Patear pelotas y balones hacia un sitio determinado. Recibir balones con ambos pies de forma alterna. Conducir el balón en línea recta y en otras formas hacia un sitio determinado.","pagina":15,"tipo":"Primaria","grado":"4to Grado"},{"tema":"Control corporal","descripcion":"Control corporal: Tono muscular, Equilibrio, Postura, Relajación.","intencionalidad":"Tejido Fortalecer el control de su propio • l cuerpo en los diferentes segmentos corporales, tanto en reposo como en movimiento interrelacionando con el espacio y los objetos que lo rodean.","tejido":"temático: Realizar técnicas de respiración antes y después de la clase de educación física. Realizar equilibrio estático en un (solo pie, sobre la punta de los pies y sobre los talones). Conocer la importancia de la postura. Conocer la importancia del tono muscular. Ejecutar equilibrio dinámico (caminando sobre la punta de los pies, sobre los talones, en línea recta y con objetos sobre la cabeza). Ejecutar posturas apropiadas al colocarse (de pie, caminar, sentarse, levantarse de la silla, recoger un objeto del suelo, acostarse y levantarse de la cama). Ejecutar técnicas de relajación al finalizar la clase de educación física contribuyendo con el proceso vuelta a la calma.","pagina":15,"tipo":"Primaria","grado":"4to Grado"},{"tema":"Deporte Educativo","descripcion":"Deporte Educativo: lúdica y con valores, que respete los intereses, necesidades y potencialidades tanto individuales como colectivas. (gimnasia, ajedrez, mini atletismo y natación).","intencionalidad":"Tejido • Propiciar la formación integral, • inclusiva, participativa, lúdica y en • valores.","tejido":"temático: Participar en actividades físicas, de destrezas motrices. Participar en juegos de destrezas relacionados a la Gimnasia, ajedrez, mini atletismo y natación. Participar en juegos educativos y contextualizados, donde todos puedan interactuar entre sí, poniéndose de manifiesto el aspecto socio afectivo. Crear juegos socios deportivos, partiendo de su creatividad e imaginación y con sus propias reglas.","pagina":15,"tipo":"Primaria","grado":"4to Grado"},{"tema":"Recreación como medio formativo","descripcion":"Recreación como medio formativo: Estrategia pedagógica recreativa que contribuye al reforzamiento de los valores universales para la vida.","intencionalidad":"Reforzar los valores universales para • l la vida tales como: la cooperación, el respeto, la solidaridad, el amor, la paz, entre otros.","tejido":"Propiciar actividades lúdicas y recreativas que permitan el desarrollo biopsicosocial del estudiante. La Educación Física y sus medios..","pagina":15,"tipo":"Primaria","grado":"4to Grado"}],"5to Grado":[{"tema":"Activación o acondicionamiento neuromuscular","descripcion":"Activación o acondicionamiento neuromuscular: Reconocimiento de sí misma o mismo, actividades lúdicas para la activación de los músculos y articulaciones. Nuevas formas de ejecución, lúdicas, creativas y novedosas que contribuyen a la estimulación y activación neuromuscular.","intencionalidad":"Propiciar juegos y/o actividades • l lúdicas que contribuyan a la activación y estimulación neuromuscular que permitan poner de manifiesto las diferentes habilidades motrices básicas.","tejido":"Caminar, trotar y correr hacia un sitio determinado alternando. Conocer las partes del cuerpo de sí mismo, como en las demás personas. Realizar juegos y actividades lúdicas, para la estimulación de músculos y articulaciones. Conocer e identificar las partes del cuerpo segmentarias, globales e interoceptivas con su cuerpo y el de los demás. Aplicar diversas actividades que permitan poner de manifiesto las diferentes habilidades motrices que posee el niño y la niña con su complejidad.","pagina":16,"tipo":"Primaria","grado":"5to Grado"},{"tema":"Aplicación de hábitos alimenticios, de hidratación e higiene","descripcion":"Aplicación de hábitos alimenticios, de hidratación e higiene: virtudes y conocimiento de hidratarse, alimentarse y el cuidado de la higiene personal diario, para el desarrollo adecuado de las diferentes actividades físicas, preservando la salud, entre otros.","intencionalidad":"Tejido Orientar la práctica de hidratación • l antes, durante y después de la actividad La higiene como un elemento importante para prevenir enfermedades y conservar la salud. Conocer y fortalecer la importancia • l de una alimentación balanceada.","tejido":"temático: Comprender la importancia de la hidratación antes, durante y después de la actividad física. Comprender la importancia de la alimentación balanceada en la vida diaria. Promover buenos hábitos de higiene personal antes y después de la actividad física. Estar pendiente de su higiene personal. Hidratarse antes, durante y después de la actividad física. Identificar los grupos del trompo de los alimentos, su aporte energético y de nutrientes. Realizar actividades lúdicas con los grupos del trompo de los alimentos.","pagina":16,"tipo":"Primaria","grado":"5to Grado"},{"tema":"Prevención y cuidado de los espacios ambientales destinados para la educación física","descripcion":"Prevención y cuidado de los espacios ambientales destinados para la educación física: de la organización, conservación, preservación y mantenimiento de los espacios ambientales y de trabajo: escuela, hogar, parques, comunidad entre otros.","intencionalidad":"Tejido • Participación en actividades • relacionadas con la organización, conservación y preservación de los • espacios ambientales.","tejido":"temático: Planificar y Organizar actividades lúdicas al aire libre que tenga que ver con la conservación los espacios naturales. Conservar los materiales que se usan para la clase de Educación Física y demás actividades.","pagina":16,"tipo":"Primaria","grado":"5to Grado"},{"tema":"Conciencia corporal","descripcion":"Conciencia corporal: Propicia el conocimiento de sí mismo, las diferencias y semejanzas con los demás.","intencionalidad":"Conocer e identificar las partes del • l cuerpo segmentarias, globales e interoceptivas con su cuerpo y el de los demás. Identificar y establecer diferencias entre su identidad y género en sí mismo como en las demás personas. Desarrollar el sentido de la lateralidad, que le permita ubicar su lado derecho e izquierdo.","tejido":"Realizar actividades donde se reconozca las partes del cuerpo segmentarias: (ojos, nariz entre otras), en sí mismo como en las demás personas. Realizar actividades donde se reconozca las partes globales (extremidades superiores, inferiores, cabeza y tronco, entre otros), del cuerpo en sí mismo como en las demás personas. Realizar actividades donde se reconozca las partes interoceptivas (órganos internos) del cuerpo en sí mismo como en las demás personas. Aplicar actividades donde se reconozca el género, identificando los aspectos desde lo (anatómico y fisiológico). Establecer semejanzas y diferencias en los roles masculinos y femeninos. Ejecutar actividades que tenga que ver con su lado derecho e izquierdo, en relación con su cuerpo y con otros elementos externos.","pagina":16,"tipo":"Primaria","grado":"5to Grado"},{"tema":"Estructura temporo – espacial","descripcion":"Estructura temporo – espacial: Permite el acercamiento a las habilidades motrices mediante el juego. Orientación espacial, estructura espacial, orientación temporal, organización temporal, estructura temporal, formaciones grupales (columnas, filas, círculos, triángulos y rectángulos), percepción sensorial, sentido temporo espacial.","intencionalidad":"Participar en juegos y actividades • l lúdicas donde se ponga de manifiesto la dirección, distancia y tiempo para generar en ellos respuestas motrices.","tejido":"Lanzar objetos en diferentes direcciones (arriba – abajo – dentro – fuera – cerca – lejos – grande – pequeño). Caminar, trotar y correr en diferentes direcciones (adelante – atrás – hacia los lados) entre otras, con grado de complejidad. Desplazarse en diferentes velocidades (lento – rápido) con obstáculos. Desplazarse en direcciones largas y cortas, con grado de complejidad. Ubicar en el espacio diferentes formaciones grupales, tales como: fila – columna – círculos – semicírculos, ajedrez, triángulos, rectángulos – pareja, entre otras.","pagina":17,"tipo":"Primaria","grado":"5to Grado"},{"tema":"Habilidades motrices básicas","descripcion":"Habilidades motrices básicas: locomotor: rectar, trepar, caminar, correr, saltar, andar, saltar, galopar, rodar, botar, caer, subir, bajar, entre otras. No balancearse, estirarse, inclinarse, doblarse, girar, empujar, levantar, traccionar, colgarse, equilibrarse, entre Locomotrices: otras. lanzar, recepcionar, golpear, patear, batear, atrapar, driblar, rodar, entre otras. Proyecciones y recepciones:","intencionalidad":"Tejido Aplicar diversas actividades que • l permitan poner de manifiesto las diferentes habilidades motrices básicas.","tejido":"temático: Realizar actividades que tengan que ver con el desarrollo locomotor: trepar, subir, bajar, saltar, galopar y rectar entre otras. Realizar actividades que tengan que ver con el desarrollo No locomotor: estirarse, inclinarse, doblarse, girar, empujar, levantar entre otras. Realizar actividades que tengan que ver con el desarrollo de proyecciones y recepciones: lanzar, recepcionar, golpear, patear, batear, atrapar, entre otras. Ejecutar lanzamientos de forma continua en diferentes direcciones. Ejecutar lanzamientos de forma precisa. Caminar, trotar y correr hacia un sitio determinado. Ejecutar saltos unipodales (en un solo pie) y con dificultades. Realizar saltos bipodales (en dos pies) y con dificultades.","pagina":17,"tipo":"Primaria","grado":"5to Grado"},{"tema":"Coordinación sensorio – motriz","descripcion":"Coordinación sensorio – motriz.: Lanzamientos, Recepción), Coordinación óculo – podal: (Pateo, Recepción, Conducción), habilidades kinestésicas.","intencionalidad":"Tejido • Propiciar actividades lúdicas y • recreativos utilizando herramientas • e instrumentos y materiales en actividades que requieran de control y precisión en relación a la • coordinación óculo – manual y óculo • - podal.","tejido":"temático: Golpear objetos de diferentes tamaños y peso. Driblar o rebotar pelotas de diferentes tamaños y pesos con una y ambas manos de forma estática, con desplazamientos y obstáculos. Lanzar objetos con una y con ambas manos a un determinado lugar. Lanzar con precisión, hacia un sitio determinado, con diferentes distancias. Realizar recepción de objetos con ambas manos de forma estática y con desplazamientos. Patear pelotas y balones de diferentes tamaños y pesos. Patear pelotas y balones de diferentes tamaños y pesos, hacia un sitio determinado. Recibir balones con ambos pies de forma alterna. Conducir el balón en línea recta y en otras formas hacia un sitio determinado.","pagina":17,"tipo":"Primaria","grado":"5to Grado"},{"tema":"Control corporal","descripcion":"Control corporal: Permite tener conciencia de sus potencialidades y asumir control de ellas. Respiración, Tono muscular, Equilibrio, Postura, Relajación.","intencionalidad":"Fortalecer el control de su propio • l cuerpo en los diferentes segmentos corporales, tanto en reposo como en movimiento interrelacionando con el espacio y los objetos que lo rodean.","tejido":"Realizar técnicas de respiración antes y después de la clase de educación física. Realizar equilibrio estático en un (solo pie, sobre la punta de los pies y sobre los talones) con grado de complejidad. Conocer la importancia de la postura. Conocer las diferentes posturas. Conocer la importancia del tono muscular. Reconocer la clasificación del tono muscular. Ejecutar actividades que tenga que ver con el tono muscular. Ejecutar equilibrio dinámico (caminando sobre la punta de los pies, sobre los talones, en línea recta y con objetos sobre la cabeza). Ejecutar posturas apropiadas al colocarse (de pie, caminar, sentarse, levantarse de la silla, recoger un objeto del suelo, acostarse y levantarse de la cama). Ejecutar técnicas de relajación al finalizar la clase de educación física contribuyendo con el proceso vuelta a la calma.","pagina":18,"tipo":"Primaria","grado":"5to Grado"},{"tema":"Deporte Educativo","descripcion":"Deporte Educativo: lúdica y con valores, que respete los intereses, necesidades y potencialidades tanto individuales como colectivas. (gimnasia, ajedrez, mini atletismo y natación).","intencionalidad":"Tejido Propiciar la formación integral, • l inclusiva, participativa, lúdica y en valores.","tejido":"temático: Participar en actividades físicas, de destrezas motrices con grado de complejidad. Participar en juegos de destrezas relacionados a la Gimnasia, ajedrez, mini atletismo y natación. Participar en juegos educativos y contextualizados, donde todos puedan interactuar entre sí, poniéndose de manifiesto el aspecto socio afectivo. Crear y planificar juegos socios deportivos, partiendo de su creatividad e imaginación y con sus propias reglas.","pagina":18,"tipo":"Primaria","grado":"5to Grado"},{"tema":"Recreación como medio formativo","descripcion":"Recreación como medio formativo: de los valores universales para la vida.","intencionalidad":"Tejido • Reforzar los valores universales para • la vida tales como: la cooperación, el respeto, la solidaridad, el amor, la paz, • entre otros.","tejido":"temático: Propiciar actividades lúdicas y recreativas que permitan el desarrollo biopsicosocial del estudiante con grado de complejidad. Crear diferentes juegos partiendo de su creatividad e imaginación y con sus propias reglas. Educación Física y la salud integral. 6to Grado","pagina":18,"tipo":"Primaria","grado":"5to Grado"}],"6to Grado":[{"tema":"Acondicionamiento neuromuscular","descripcion":"Acondicionamiento neuromuscular: Reconocimiento de sí misma o mismo, actividades lúdicas para el Acondicionamiento neuromuscular y articulaciones. Nuevas formas de ejecución, lúdicas, creativas y novedosas que contribuyen a la estimulación y activación neuromuscular.","intencionalidad":"Propiciar juegos y/o actividades • l lúdicas que contribuyan al Acondicionamiento y estimulación neuromuscular que permitan poner de manifiesto las diferentes habilidades motrices básicas.","tejido":"Caminar, trotar y correr hacia un sitio determinado alternando con diferentes cambios. Conocer e identificar las partes del cuerpo de sí mismo, como en las demás personas. Realizar juegos y actividades lúdicas, para la estimulación de los músculos y articulaciones. Conocer e identificar las partes del cuerpo segmentarias, globales e interoceptivas con su cuerpo y el de los demás. Aplicar diversas actividades que permitan poner de manifiesto las diferentes habilidades motrices que posee el niño y la niña con su complejidad.","pagina":18,"tipo":"Primaria","grado":"6to Grado"},{"tema":"Aplicación de hábitos alimenticios, de hidratación e higiene","descripcion":"Aplicación de hábitos alimenticios, de hidratación e higiene: Orienta el conocimiento hacia las virtudes y conocimiento de hidratarse, alimentarse y el cuidado de la higiene personal diario, para el desarrollo adecuado de las diferentes actividades físicas, preservando la salud, entre otros.","intencionalidad":"Orientar la práctica de hidratación • l antes, durante y después de la actividad. La higiene como un elemento importante para prevenir enfermedades y conservar la salud. Conocer y fortalecer la importancia • l de una alimentación balanceada.","tejido":"Comprender la importancia de la hidratación antes, durante y después de la actividad física. Comprender la importancia de la alimentación balanceada en la vida diaria. Promover buenos hábitos de higiene personal antes y después de la actividad física. Estar pendiente de su higiene personal. Hidratarse antes, durante y después de la actividad física. Identificar los grupos del trompo de los alimentos, su aporte energético y de nutrientes. Realizar actividades lúdicas con los grupos del trompo de los alimentos.","pagina":19,"tipo":"Primaria","grado":"6to Grado"},{"tema":"Prevención y cuidado de los espacios ambientales destinados para la educación física","descripcion":"Prevención y cuidado de los espacios ambientales destinados para la educación física: de la organización, conservación, preservación y mantenimiento de los espacios ambientales y de trabajo: escuela, hogar, parques, comunidad entre otros.","intencionalidad":"Tejido Participación en actividades • l relacionadas con la organización, conservación y preservación de los espacios ambientales.","tejido":"temático: Planificar, Organizar y ejecuta actividades lúdicas al aire libre que tenga que ver con la conservación de los espacios naturales. Conservar los materiales que se usan para la clase de Educación Física y demás actividades.","pagina":19,"tipo":"Primaria","grado":"6to Grado"},{"tema":"Conciencia corporal","descripcion":"Conciencia corporal:","intencionalidad":"Tejido • Conocer e identificar las partes del • cuerpo segmentarias, globales e interoceptivas con su cuerpo y el de los demás. • l Identificar y establecer diferencias entre su identidad y género en sí mismo como en las demás personas. • l Desarrollar el sentido de la lateralidad, que le permita ubicar su lado derecho • e izquierdo.","tejido":"temático: Ejecutar actividades donde se reconozca las partes del cuerpo segmentarias: (ojos, nariz entre otras), en sí mismo como en las demás personas. Ejecutar actividades donde se reconozca las partes globales (extremidades superiores, inferiores, cabeza y tronco, entre otros), del cuerpo en sí mismo como en las demás personas. Realizar actividades donde se reconozca las partes interoceptivas (órganos internos) del cuerpo en sí mismo como en las demás personas. Aplicar actividades donde se reconozca el género, identificando los aspectos desde lo (anatómico y fisiológico). Establecer semejanzas y diferencias en los roles masculinos y femeninos. Ejecutar actividades que tengan que ver con su lado derecho e izquierdo, en relación con su cuerpo y con otros elementos externos.","pagina":19,"tipo":"Primaria","grado":"6to Grado"},{"tema":"Estructura temporo – espacial","descripcion":"Estructura temporo – espacial: Permite el acercamiento a las habilidades motrices mediante el juego. Orientación espacial, estructura espacial, orientación temporal, organización temporal, estructura temporal, formaciones grupales (columnas, filas, círculos, triángulos y rectángulos), percepción sensorial, sentido temporo espacial.","intencionalidad":"Crear y Participar en juegos y • l actividades lúdicas donde se ponga de manifiesto la dirección, distancia y tiempo para generar en ellos respuestas motrices.","tejido":"Lanzar objetos en diferentes direcciones (arriba – abajo – dentro – fuera – cerca – lejos – grande – pequeño, entre otros con alguna complejidad). Caminar, trotar y correr en diferentes direcciones (adelante – atrás – hacia los lados) entre otras, con grado de complejidad. Desplazarse en diferentes velocidades (lento – rápido) con obstáculos y grado de complejidad. Desplazarse en direcciones largas y cortas, con grado de complejidad. Ubicar en el espacio diferentes formaciones grupales, tales como: fila – columna – círculos – semicírculos, triángulos, rectángulos – pareja, entre otras con grado de complejidad.","pagina":19,"tipo":"Primaria","grado":"6to Grado"},{"tema":"Habilidades motrices básicas","descripcion":"Habilidades motrices básicas: Profundiza la complejidad de habilidades motrices básicas. Desarrollo locomotor: rectar, trepar, caminar, correr, saltar, andar, saltar, galopar, rodar, botar, caer, subir, bajar, entre otras. No Locomotrices: balancearse, estirarse, inclinarse, doblarse, girar, empujar, levantar, traccionar, colgarse, equilibrarse, entre otras. Proyecciones y recepciones: lanzar, recepcionar, golpear, patear, batear, atrapar, driblar, rodar, entre otras.","intencionalidad":"Aplicar diversas actividades y • l estrategias que permitan poner de manifiesto las diferentes habilidades motrices básicas.","tejido":"Realizar actividades que tengan que ver con el desarrollo locomotor trepar, subir, bajar, saltar, galopar y rectar entre otras. Realizar actividades que tengan que ver con el desarrollo No locomotor: estirarse, inclinarse, doblarse, girar, empujar, levantar entre otras. Ejecutar actividades que tengan que ver con el desarrollo de proyecciones y recepciones: lanzar, recepcionar, golpear, patear, batear, atrapar, entre otras. Ejecutar lanzamientos de forma continua en diferentes direcciones. Ejecutar lanzamientos de forma precisa. Caminar, trotar y correr hacia un sitio determinado. Ejecutar saltos unipodales (en un solo pie) y con dificultades. Realizar saltos bipodales (en dos pies) y con dificultades.","pagina":20,"tipo":"Primaria","grado":"6to Grado"},{"tema":"Coordinación sensorio – motriz","descripcion":"Coordinación sensorio – motriz.: Lanzamientos, Recepción), Coordinación óculo – podal: (Pateo, Recepción, Conducción), habilidades kinestésicas.","intencionalidad":"Tejido Crear actividades lúdicas y • l recreativas utilizando herramientas e instrumentos con materiales que requieran de control y precisión en relación a la coordinación óculo – manual y óculo - podal.","tejido":"temático: Golpear objetos de diferentes tamaños y peso. Driblar o rebotar pelotas de diferentes tamaños y pesos con una y ambas manos de forma estática, con desplazamientos y obstáculos con algo de complejidad. Lanzar objetos con una y con ambas manos a un determinado lugar. Lanzar con precisión, hacia un sitio determinado, con diferentes distancias y grado de complejidad. Realizar recepción de objetos con ambas manos de forma estática y con desplazamientos. Patear pelotas y balones de diferentes tamaños y pesos. Patear pelotas y balones de diferentes tamaños y pesos, hacia un sitio determinado. Recibir balones con ambos pies de forma alterna. Conducir el balón en línea recta y en otras formas hacia un sitio determinado.","pagina":20,"tipo":"Primaria","grado":"6to Grado"},{"tema":"Control corporal","descripcion":"Control corporal: Tono muscular, Equilibrio, Postura, Relajación.","intencionalidad":"Tejido • Fortalecer el control de su propio • cuerpo en los diferentes segmentos corporales, tanto en reposo como en • movimiento interrelacionando con el espacio y los objetos que lo rodean. l","tejido":"temático: Realizar técnicas de respiración antes y después de la clase de educación física. Realizar equilibrio estático en un (solo pie, sobre la punta de los pies y sobre los talones) con grado de complejidad. Conocer la importancia de la postura. Conocer las diferentes posturas. Conocer la importancia del tono muscular. Reconocer la clasificación del tono muscular. Ejecutar actividades que tenga que ver con el tono muscular. Ejecutar equilibrio dinámico (caminando sobre la punta de los pies, sobre los talones, en línea recta y con objetos sobre la cabeza). Ejecutar posturas apropiadas al colocarse (de pie, caminar, sentarse, levantarse de la silla, recoger un objeto del suelo, acostarse y levantarse de la cama). Ejecutar técnicas de relajación al finalizar la clase de educación física contribuyendo con el proceso vuelta a la calma.","pagina":20,"tipo":"Primaria","grado":"6to Grado"},{"tema":"Deporte Educativo","descripcion":"Deporte Educativo: Sirve como un medio para la formación integral, inclusiva, participativa, protagónica, lúdica y con valores, que respete los intereses, necesidades y potencialidades tanto individuales como colectivas de los estudiantes. (gimnasia, ajedrez, mini atletismo y natación).","intencionalidad":"Propiciar la formación integral, • l inclusiva, participativa, lúdica y en valores.","tejido":"Participar en actividades físicas, de destrezas motrices con grado de complejidad. Crear y Participar juegos de destrezas relacionados a la Gimnasia, ajedrez, mini atletismo y natación. Participar en juegos educativos y contextualizados, donde todos puedan interactuar entre sí, poniéndose de manifiesto el aspecto socio afectivo. Crear y planificar juegos socios deportivos, partiendo de su creatividad e imaginación y con sus propias reglas.","pagina":21,"tipo":"Primaria","grado":"6to Grado"},{"tema":"Recreación como medio formativo","descripcion":"Recreación como medio formativo: de los valores universales para la vida.","intencionalidad":"Tejido Reforzar los valores universales para • l la vida tales como: la cooperación, el respeto, la solidaridad, el amor, la paz, entre otros.","tejido":"temático: Propiciar actividades lúdicas y recreativas que permitan el desarrollo biopsicosocial del estudiante con grado de complejidad. Crear diferentes juegos partiendo de su creatividad e imaginación y con sus propias reglas. La Educación Física y sus medios. Educación Física y la salud integral. Anatomía humana; partes del cuerpo.","pagina":21,"tipo":"Primaria","grado":"6to Grado"}],"1er Año":[{"tema":"La Educación Física como base de salud integral","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"1. Definiciones y conceptos básicos. La Educación Física y sus medios. Educación Física y la salud integral Diferencias entre los Medios de la Educación Física. 2. Análisis de artículos (Art. 111 de la “C.R.B.V”; 16 de la “L.O.E”.y 8 de la “L.O.D.A.F.E.F”).","referentes":"Definiciones de Educación Física, Importancia. Diferencias entre los Medios de la Educación Física. Relación de la Educación Física con la salud integral. Definición e importancia de los Medios de la Educación Física. La actividad física, el deporte educativo, la recreación formativa Normativos Legales de la Educación Física, el Deporte y la Recreación. Análisis del 5to Objetivo del Plan de la Patria 19-25. Manifiesto de la organización Mundial de la Salud. (OMS).","pagina":21,"tipo":"Media","grado":"1er Año"},{"tema":"Hábitos, habilidades, destrezas, actitud y aptitud para el trabajo físico","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Higiene Personal Formas de expresión corporal. Actitud vs Aptitud física. Habilidad y destreza deportiva.","referentes":"Hábitos de higiene como parte de la salud integral. Uso adecuado de la hidratación: antes durante y después de ejercicio físico. Definiciones Dramatizaciones, mima, pantomima, danza y bailes. Aptitud para la práctica de distintos tipos de ejercicios físicos. Destrezas con y sin implemento.","pagina":22,"tipo":"Media","grado":"1er Año"},{"tema":"Habilidades motrices como principio de la práctica de actividad física","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Habilidades motrices fundamentales. Capacidades coordinativas y condicionales","referentes":"Movilidad articular y elongación muscular. Individual Tipos de movilidad articular y elongación muscular (ascendente y descendente). Creatividad motriz. Ejercicios sin desplazamientos. Ejercicios con desplazamientos. Generales y específicas y su relación con la habilidad motora. Fuerza, velocidad resistencia, agilidad y flexibilidad.","pagina":22,"tipo":"Media","grado":"1er Año"},{"tema":"El movimiento humano como fuente de salud y vida","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir","tejido":"Anatomía humana; partes del cuerpo. Hábitos de Alimentación e Hidratación Movimientos y desplazamientos humanos. Salud integral y el juego.","referentes":"Ubicar y diferenciar los segmentos y partes del cuerpo. Importancia del trompo alimenticio y su relación con la Educación Física. Ejercicios de movilidad articular y elongación muscular. Actividades lúdicas para la salud.","pagina":22,"tipo":"Media","grado":"1er Año"},{"tema":"Variables sociales para una vida saludable","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Valoración de la Condición Física y Medidas Antropométricas.","referentes":"Aplicación de pruebas: 1. Peso. 2. Talla. 3. Flexión Ventral. 4. Rapidez. 5. Lanzamiento de balón medicinal (1 kg hasta 11 años, 2 kg de 12 años en adelante). 6. Flexión y extensión de codo. 7. Salto de longitud sin carrera de impulso. 8. Lanzamiento de la pelota de béisbol N.º 10. 9. Abdominales. 10. Resistencia.","pagina":22,"tipo":"Media","grado":"1er Año"},{"tema":"Salud y desarrollo integral del ser humano","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Cualidades y potencialidades físicas del ser humano. El trabajo físico según el medio (Físico, Deportivo o Recreativo)","referentes":"Principios biológicos del movimiento humano. Ejercicios estáticos y con desplazamientos. Características del ejerció Físico.","pagina":22,"tipo":"Media","grado":"1er Año"},{"tema":"Potencialidades humanas y parámetros fisiológicos para el mantenimiento de la salud","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir","tejido":"Parámetros fisiológicos y su relación con la salud. La actividad física y frecuencia cardíaca.","referentes":"Anatomía y fisiología humana. Pulso y frecuencia cardíaca. Localización y conteo de los latidos o pulsaciones cardíacas.","pagina":22,"tipo":"Media","grado":"1er Año"},{"tema":"Actividad física y recreación como herramienta de prevención de daños causados por el consumo de tabaco, alcohol y droga. El juego como herramienta de formación en valores","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir. #17 Actividad física, deporte y recreación.","tejido":"Organización Nacional Antidroga. Espacios recreativos y Deportivos. Juegos Motrices Tradiciones y Sociales.","referentes":"Instituciones de prevención contra el consumo y distribución de drogas. Consecuencias del uso y consumo de drogas. Ambientes vulnerables para la Recreación. Definición de Juegos y tipos de juegos. Importancia del juego. Juegos tradicionales de la región, estado, Manifestaciones folklóricas de la localidad. Bailes y Danzas autóctonas de la localidad.","pagina":23,"tipo":"Media","grado":"1er Año"},{"tema":"Actividad física, salud y el desarrollo integral del ser humano","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir","tejido":"Cualidades y potencialidades físicas del ser humano. Espacios físico territorial. Lengua de señas y otras formas de comunicación corporal.","referentes":"Principios biológicos del movimiento humano. Ejercicios estáticos y con desplazamientos. Espacios y actividades físicas y deportivas de interés comunitario Manifestaciones del cuerpo, corporeidad y el cuerpo como instrumento de comunicación.","pagina":23,"tipo":"Media","grado":"1er Año"},{"tema":"Actividad física, salud y el desarrollo integral del ser humano","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir","tejido":"Cualidades y potencialidades físicas del ser humano. Espacios físicos y norma territorial.","referentes":"Principios biológicos del movimiento humano. Ejercicios estáticos y con desplazamientos. Movilidad articular y elongación muscular con implementos. Espacios y actividades físicas y deportivas de interés comunitario","pagina":23,"tipo":"Media","grado":"1er Año"},{"tema":"El movimiento humano como fuente de salud y vida","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Anatomía humana; partes del cuerpo. Movimientos y desplazamientos humanos.","referentes":"Ubicar y diferenciar los segmentos corporales. Diferenciar las partes del cuerpo. Ejercicios de movilidad articular y elongación muscular, individual y por parejas Actividades lúdicas dinámicas para la salud.","pagina":23,"tipo":"Media","grado":"1er Año"},{"tema":"Potencialidades humanas y parámetros fisiológicos para el mantenimiento de la salud. Habilidades motrices como principio de la práctica de actividades físicas","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir #17 Actividad física, deporte y recreación.","tejido":"Parámetros fisiológicos y su relación con la salud. La actividad física y frecuencia cardíaca. Sistemas de trabajo físico.","referentes":"Anatomía y fisiología humana. Pulso y frecuencia cardíaca. Localización y conteo de los latidos o pulsaciones cardíacas. Creatividad motriz Ejercicios sin desplazamientos. Ejercicios con desplazamientos.","pagina":23,"tipo":"Media","grado":"1er Año"},{"tema":"El juego como herramienta de formación y educación del movimiento","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Juegos Tradicionales. Juegos Sociales. Juegos Motrices","referentes":"Juegos tradicionales de la región y localidad. Manifestaciones folclóricas de la localidad. Bailes y Danzas autóctonas de la localidad. Juegos inter cursos","pagina":24,"tipo":"Media","grado":"1er Año"},{"tema":"Hábitos, destrezas y aptitudes para el trabajo físico","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Formas de expresión corporal. Aptitud hacia la actividad deportiva. Destrezas deportivas.","referentes":"Movimientos segméntales. Aptitud para la práctica de distintos tipos de ejercicio físicos y deportivas Destrezas para las actividades físicas con y sin implemento. Juegos inter-cursos.","pagina":24,"tipo":"Media","grado":"1er Año"},{"tema":"Potencialidades humanas y parámetros fisiológicos para el mantenimiento de la salud","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir","tejido":"Parámetros fisiológicos y su relación con la salud. La actividad física y frecuencia cardíaca.","referentes":"Localización y conteo de los latidos o pulsaciones cardíacas. Pulso y frecuencia cardíaca. Variantes de la frecuencia cardíaca según el tipo de actividad.","pagina":24,"tipo":"Media","grado":"1er Año"},{"tema":"El juego como herramienta de formación y educación del movimiento","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir","tejido":"Juegos Motrices. Juegos Tradicionales. Juegos Sociales. Valores en la sociedad venezolana.","referentes":"Juegos motrices propios de la localidad Juegos inter cursos Juegos tradicionales de la región y localidad. Manifestaciones folklóricas de la localidad. Bailes y Danzas autóctonas de la localidad.","pagina":24,"tipo":"Media","grado":"1er Año"},{"tema":"Variables sociales parta una vida saludable","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Segundo momento Fase de evaluación y análisis de los resultados de la Valoración de la Condición física y Medidas Antropométricas en todos los Niveles y Modalidades. Ambiente y trabajo físico.","referentes":"Condiciones y variantes según la cualidad física. Momentos de trabajo y Frecuencia cardíaca. La incidencia del espacio de trabajo en la práctica de actividad física y la salud.","pagina":24,"tipo":"Media","grado":"1er Año"},{"tema":"Hábitos, habilidades, destrezas, actitud y aptitud para el trabajo físico","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Formas de expresión corporal. Actitud vs Aptitud física. Habilidad y destreza deportiva.","referentes":"Hábitos de higiene como parte de la salud integral. Aptitud para la práctica de distintos tipos de ejercicios físicos. Destrezas con y sin implemento. Juegos inter-cursos.","pagina":24,"tipo":"Media","grado":"1er Año"}],"2do Año":[{"tema":"La Educación Física como base de la salud integral","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Normativos Legales de la Educación Física, el Deporte y la Recreación. La Educación Física y sus medios. Educación Física y la salud integral.","referentes":"Definiciones de Educación Física, Importancia. Análisis de artículos (Art. 102, 103, 11 de la “C.R.B.V”.;15, 16, 17, 27, 54, de la “L.O.E”. y 8 de la “L.O.D.A.F.E.F”.) Análisis del 5to Objetivo del Plan de la Patria 19-25. (Art. 1, 83) Manifiesto de la organización Mundial de la Salud. (OMS) Definición de Educación Física, importancia de los Medios de la Educación Física. La actividad física, el deporte educativo, la recreación formativa. Diferencias entre los Medios de la Educación Física. Definición e importancia de salud, Relación de la Educación Física con la salud integral","pagina":25,"tipo":"Media","grado":"2do Año"},{"tema":"Hábitos actitudes, aptitudes y destrezas motoras como herramientas para el desarrollo físico y salud integral del ser humano","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Higiene personal. Clasificación de las actividades físicas de acuerdo con su intensidad. Acondiciona- miento Neuromuscular Alimentación y actividad física. Actividades Lúdicas.","referentes":"Hábitos de higiene como parte de la salud integral. Uso adecuado de la hidratación: antes durante y después de actividad física. Dosificación del ejercicio de acuerdo con la frecuencia cardíaca Movilidad articular y elongación muscular individual y por parejas. Alimentación alternativa. Importancia. Relación con la actividad física. Efectos fisiológicos del ejercicio físico sobre la ingesta diaria de Carbohidratos, lípidos y prótidos. Jugos alternativos que destaque la importancia de los valores y la identidad nacional. Actividades lúdicas para la salud","pagina":25,"tipo":"Media","grado":"2do Año"},{"tema":"Habilidades motrices como principio de la práctica de actividades físicas","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Habilidades motrices fundamentales. Capacidades coordinativas y condicionales","referentes":"Movilidad articular y elongación muscular. Individual y por parejas. Tipos de movilidad articular y elongación muscular (ascendente y descendente). Creatividad motriz. Ejercicios sin desplazamientos. Ejercicios con desplazamientos. Generales y específicas y su relación con la habilidad motora. Fuerza, velocidad resistencia, agilidad y flexibilidad.","pagina":25,"tipo":"Media","grado":"2do Año"},{"tema":"El movimiento humano como fuente de salud y vida","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Anatomía humana; partes del cuerpo. Hábitos de Hidratación.","referentes":"Concepto de anatomía. Importancia de la anatomía y la fisiología humana en la Educación Física. Ubicar y diferenciar los segmentos y partes del cuerpo. Importancia de la hidratación antes, durante y después de la actividad física.","pagina":26,"tipo":"Media","grado":"2do Año"},{"tema":"Potencialidades humanas y parámetros fisiológicos para el mantenimiento de la salud. Variables sociales parta una vida saludable","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir. #17 Actividad física, deporte y recreación.","tejido":"La actividad física y frecuencia cardíaca Valoración de la Condición Física y Medidas Antropométricas","referentes":"Pulso y frecuencia cardíaca. Localización y conteo de los latidos o pulsaciones cardíacas. En reposo, durante y después de la actividad física. Importancia de las pruebas de valoración y medidas Antropométricas. Aplicación de pruebas: 1. Peso. 2. Talla. 3. Flexión Ventral. 4. Rapidez. 5. Lanzamiento de balón medicinal (1 kg hasta 11 años, 2 kg de 12 años en adelante). 6. Flexión y extensión de codo. 7. Salto de longitud sin carrera de impulso. 8. Lanzamiento de la pelota de béisbol N.º 10. 9. Abdominales. 10. Resistencia","pagina":26,"tipo":"Media","grado":"2do Año"},{"tema":"Ambiente, recreación y valores, para el uso del tiempo libre y la salud","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Recreación formativa. Vida al Aire Libre. Actividad física y fiestas tradicionales. Nociones fundamentales sobre sustancias nocivas para la salud. La autoestima como alternativa para evitar el consumo de sustancias nocivas para la salud.","referentes":"Juegos alternativos (pelotica de goma, chapita, entre otros). Excursionismos, visitas guiadas, campamentos contextualizados. Actividades culturales propias de la localidad. Consumo de refrescos, café, entre otras sustancias nocivas para la salud. Situaciones que afectan la salud mental y física.","pagina":26,"tipo":"Media","grado":"2do Año"},{"tema":"Actividad física y recreación como herramienta de prevención de daños causados por el consumo de tabaco, alcohol y droga","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Políticas de salud en Venezuela. Espacios para la actividad Físicas y deportivas.","referentes":"Importancia de mantenerse físicamente saludable. Campañas como medidas preventivas ante el tráfico y consumo de drogas. Programación deportiva comunitaria. Sitios recreativos, turísticos, históricos, de salud y deporte.","pagina":26,"tipo":"Media","grado":"2do Año"},{"tema":"Hábitos actitudes, aptitudes y destrezas motoras como herramientas para el desarrollo físico y salud integral del ser humano","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Higiene personal. Clasificación de las actividades físicas de acuerdo con su intensidad. Acondiciona- miento Neuromuscular Alimentación y actividad física. Actividades Lúdicas.","referentes":"Hábitos de higiene como parte de la salud integral. Uso adecuado de la hidratación: antes durante y después de actividad física. Dosificación del ejercicio de acuerdo con la frecuencia cardíaca Movilidad articular y elongación muscular individual y por parejas. Alimentación alternativa. Importancia. Relación con la actividad física. Efectos fisiológicos del ejercicio físico sobre la ingesta diaria de Carbohidratos, lípidos y prótidos. Jugos alternativos que destaquen la importancia de los valores y la identidad nacional. Actividades lúdicas para la salud.","pagina":27,"tipo":"Media","grado":"2do Año"},{"tema":"Corporeidad y educación del ritmo","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Expresiones corporales. Sonidos y expresión corporal. Onomatopeyas y expresión corporal. Sentimientos como expresión corporal básica. Recursos expresivos del propio cuerpo. El movimiento para la expresión, la representación, la comunicación y educación del ritmo. Valores éticos y humanísticos. Bailes y danzas populares y tradicionales.","referentes":"Kinestésica y coordinación de los seres humanos. Expresiones corporales urbanas. Actividades rítmicas: Danzas y bailes tradicionales. La pantomima (escenificación, sin palabras) como técnica expresiva para el respeto por la vida y el ambiente. Expresiones básicas de afectos, miedo, tristeza, rabia, a través de juegos, haciendo uso de la cara y de todo el cuerpo, sin palabras (mimos). Herramienta corporal para favorecer la creatividad. Diversidad cultural personal. Mejoramiento de la coordinación neuro- motora a través del baile.","pagina":27,"tipo":"Media","grado":"2do Año"},{"tema":"Actividad física y el disfrute con la naturaleza","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Juegos motrices y sus diferentes Manifestaciones creativas en espacios naturales. Parques Nacionales y recreacionales. Historia geográfica y deportivas comunitaria Problemas socio- comunitarios.","referentes":"Juegos tradicionales y autóctonos de los pueblos indígenas. Juegos motores en contacto directo con la naturaleza. Ocio, tiempo libre y sociedad. Integración, preservación y conservación del ambiente. Línea del tiempo deportivo en mi comunidad. Aportes para solucionar problemas en mi comunidad.","pagina":28,"tipo":"Media","grado":"2do Año"},{"tema":"El deporte educativo para el desarrollo de destrezas que contribuyan al armónico compartir y salud integral del ser humano","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Aspectos básicos de los deportes. Reglamento de los deportes individuales y colectivos. Deporte estudiantil y educativo en Venezuela.","referentes":"Las disciplinas deportivas. Elementos de la reglamentación deportiva. Participación en Juegos alternativos. Intercambios deportivos Intercurso de la institución. Intercambios deportivos comunidad Institución.","pagina":28,"tipo":"Media","grado":"2do Año"},{"tema":"Ambiente, recreación y valores, para el uso del tiempo libre y la salud","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Recreación formativa. Vida al Aire Libre. Actividad física y tradiciones. Nociones fundamentales sobre sustancias nocivas para la salud. La autoestima como alternativa para evitar el consumo de sustancias nocivas para la salud.","referentes":"Tipos de Juegos. Excursionismos, visitas guiadas, campamentos contextualizados. Juegos Autóctonos estudiantiles de los pueblos indígenas. Sustancias nocivas para la salud. Alternativas motivacionales en lo individual y grupal.","pagina":28,"tipo":"Media","grado":"2do Año"},{"tema":"Actitudes y valores positivos para prevenir situaciones que atenten o deterioren el vivir bien","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Sustancias nocivas para la salud. Cultura de prevención. La autoestima. Problemas de la sociedad Venezolana.","referentes":"Drogas comunes. Sitios recreativos, turísticos, históricos, de salud y esparcimiento. Organismos de atención y prevención de los derechos humanos. Causas que desencadenan el acoso estudiantil. Organización estudiantil.","pagina":28,"tipo":"Media","grado":"2do Año"},{"tema":"Actividad física y recreación como herramienta de prevención de daños causados por el consumo de tabaco, alcohol y droga","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Políticas de salud, deportiva y actividad física en Venezuela Actividades físicas y deportivas en su comunidad.","referentes":"Importancia que tiene mantenerse Físicamente saludable. Foros, charlas y visitas guiadas como medidas Preventivas ante el tráfico y consumo de drogas.","pagina":28,"tipo":"Media","grado":"2do Año"},{"tema":"Hábitos actitudes, aptitudes y destrezas motoras como herramientas para el desarrollo físico y salud integral del ser humano","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Hábitos de higiene e hidratación como parte de la salud integral. Acondiciona- miento Neuromuscular Capacidades coordinativas.","referentes":"Aspecto físico y personal. Dosificación y Frecuencia Cardíaca. Movilidad articular y elongación muscular con materiales Juegos alternativos y lúdicos que destaquen la importancia de los valores y la identidad local y regional. Fuerza, rapidez, resistencia. Capacidades coordinativas: generales y específicas y su relación con la habilidad motora.","pagina":29,"tipo":"Media","grado":"2do Año"},{"tema":"Corporeidad y educación del ritmo","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Onomatopeyas y expresión. Sentimientos como expresión corporal básica. Recursos expresivos del propio cuerpo. Bailes y danzas autóctonas populares y Tradicionales propias de la localidad. Lengua de señas y otras formas de comunicación corporal.","referentes":"Expresiones corporales urbanas. Actividades rítmicas: Danzas y bailes tradicionales. Herramientas corporales para favorecer la creatividad, la interculturalidad y la diversidad. Mejoramiento de la coordinación neuro- motora a través del baile y la danza. Manifestaciones del cuerpo, corporeidad y el cuerpo como instrumento de comunicación.","pagina":29,"tipo":"Media","grado":"2do Año"},{"tema":"Actividad física y el disfrute con la naturaleza","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Juegos Motrices tradicionales y autóctonos. Actividades físicas y deportivas en ambientes naturales comunitarios Problemas socio- comunitarios.","referentes":"Uso del tiempo libre en la comunidad. Juegos motores en contacto directo con la naturaleza. Integración, preservación y conservación del ambiente. Educación y protección Ambiental.","pagina":29,"tipo":"Media","grado":"2do Año"},{"tema":"Ambiente, recreación formativa y valores, para el buen uso del tiempo libre y la salud","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Actividad física tradicional según la Región. La autoestima como Alternativa para evitar el consumo de sustancias nocivas para la salud.","referentes":"Juegos Tradicionales propios de la región o localidad. Alternativas motivacionales en lo individual y grupal, asociadas a la región o localidad.","pagina":29,"tipo":"Media","grado":"2do Año"},{"tema":"El deporte educativo para el desarrollo de destrezas que contribuyan al armónico compartir y salud integral del ser humano","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Aspectos básicos de los deportes educativos. Reglamento de los deportes individuales y Colectivos. Deporte Educativo estudiantil y en Venezuela.","referentes":"Participación en Juegos alternativos Intercambios deportivos inter-institución. Intercambios deportivos entre comunidad, Institución.","pagina":29,"tipo":"Media","grado":"2do Año"},{"tema":"Actividad física y recreación como herramienta de prevención de daños causados por el consumo de tabaco, alcohol y droga","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Políticas de salud en Venezuela Políticas deportivas y actividad física en Venezuela.","referentes":"Foros, charlas y visitas guiadas como medidas Elementos de prevención contra el uso de sustancias prohibidas. Preventivas ante el tráfico y consumo de drogas.","pagina":30,"tipo":"Media","grado":"2do Año"}],"3er Año":[{"tema":"La actividad física sistemática para la salud y la vida","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"La Educación Física y sus medios. Educación Física y la salud integral. Componentes de la aptitud física como indicadores de la intensidad del esfuerzo físico. Potencialidades psicológicas, morfológicas y Fisiológicas.","referentes":"Definición de Educación Física, importancia de los Medios de la Educación Física. La actividad física, el deporte educativo, la recreación formativa. Diferencias entre los Medios de la Educación Física. Definición e importancia de salud, Relación de la Educación Física con la salud integral. Conocer e identificar los elementos de la aptitud física, capacidad aeróbica. Conocer, identificar y medir los parámetros fisiológicos antes, durante y después del ejercicio físico.","pagina":30,"tipo":"Media","grado":"3er Año"},{"tema":"Aptitud física, destrezas y hábitos adquiridos","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Actividades físicas diferentes, de larga duración y baja o mediana intensidad, para el mejoramiento de la capacidad aeróbica Actividades físicas diferentes, de larga duración y baja o mediana intensidad, para el mejoramiento de su capacidad anaeróbica. Higiene personal. Clasificación de las actividades físicas de acuerdo con su intensidad. Alimentación y actividad física. Actividades Lúdicas.","referentes":"Identificar capacidades físicas según aptitud. Ejercicios de capacidad aeróbica variados. Tipos de entrenamientos Aeróbicos. Hábitos de higiene como parte de la salud integral. Uso adecuado de la hidratación: antes durante y después de actividad física. Dosificación del ejercicio de acuerdo con la frecuencia cardíaca Alimentación alternativa. Importancia. Relación con la actividad física. Efectos fisiológicos del ejercicio físico sobre la ingesta diaria de Carbohidratos, lípidos y prótidos. Jugos alternativos que destaquen la importancia de los valores y la identidad nacional. Actividades lúdicas para la salud","pagina":30,"tipo":"Media","grado":"3er Año"},{"tema":"Sistemas de trabajo físico para la salud y la vida","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir","tejido":"Actividades de larga duración y baja o mediana intensidad. Capacidades coordinativas. Trabajo físico de baja intensidad y larga duración","referentes":"Tipos de entrenamiento físico. Capacidades coordinativas generales y específicas y su relación con la habilidad motora. Fuerza, rapidez, resistencia, agilidad y flexibilidad. Ejercicios Aeróbicos.","pagina":31,"tipo":"Media","grado":"3er Año"},{"tema":"El trabajo físico y sus potencialidades humanas","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir","tejido":"Aspectos Psicológicos en el trabajo físico. Aspectos Morfológicos y Fisiológicos en la actividad física.","referentes":"Origen de la energía humana. Calculo y dosificación de cargas de trabajo físico, determinación de los tiempos y desplazamientos en Actividades físicas. Sistema digestivo y metabolismo.","pagina":31,"tipo":"Media","grado":"3er Año"},{"tema":"El desarrollo físico y armónico del ser humano","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Movilidad articular y elongación muscular. Segmentos y partes corporales.","referentes":"Ejercicios de movilidad articular y elongación muscular individual por parejas y con implementos. Diferentes articulaciones y segmento corporales.","pagina":31,"tipo":"Media","grado":"3er Año"},{"tema":"El deporte educativo como medio de aprendizaje de la educación física","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Generalidades del deporte.","referentes":"Historia y evolución del deporte en Venezuela. Deportes educativos que se practica en la comunidad, región y en Venezuela. Características. Conceptualización de Deporte educativo, deporte alternativo y deporte simplificado. Deporte educativo individual. Deportes educativos colectivos.","pagina":31,"tipo":"Media","grado":"3er Año"},{"tema":"Los primeros auxilios en ambientes escolares y comunitarios","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Educación ambiental y ecología. Medidas de seguridad y primeros auxilios.","referentes":"Simulacros de desalojo en Ambientes escolares y comunitarios. Participación de estudiantes y comunidad en evento naturales no previstos. Características de los ambientes escolares y comunitarios. Elementos básicos en los primeros auxilios.","pagina":31,"tipo":"Media","grado":"3er Año"},{"tema":"Actividad física, ambiente y ecosistema como equilibrio y vida del ser humano","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Ambientes naturales y ecosistema. Actividades físicas para la vida. Ecosistema escolar y comunitario.","referentes":"Participación estudiantil en actividades de conservación ambiental. Excursiones y/o campamentos educativos. Actividades recreativas a través de juegos en espacios naturales. Valoración del buen uso de los recursos Naturales renovables y no renovables.","pagina":31,"tipo":"Media","grado":"3er Año"},{"tema":"La actividad física y el deporte educativo como elemento de formación social y comunitario","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Actividad física y deportiva no tradicional. Deportes tradicionales y sus reglas. Organización deportiva comunitaria.","referentes":"Tipos y características de las actividades físicas y deportes no tradicionales. Fundamentos técnicos de los deportes colectivos e individuales. Elementos tácticos de los deportes colectivos e individuales. Actividades físicas y recreativas de interés comunitario.","pagina":31,"tipo":"Media","grado":"3er Año"},{"tema":"Prevención de adicciones y dependencia de sustancias dañinas para la salud del ser humano","temaIndispensable":"","tejido":"Organismos de atención a víctimas del uso y consumo de drogas. Drogas y sustancias toxicas.","referentes":"Sustancias nocivas para la salud. Sustancias que generan dependencias y Adicciones. Consecuencias del uso de sustancias prohibidas. Drogas más usadas en mi localidad y en el país. Dependencias o adicciones. Incidencia del Doping en la actividad física y el deporte.","pagina":32,"tipo":"Media","grado":"3er Año"},{"tema":"La iniciación deportiva","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Deportes a temprana edad. Iniciación en el desarrollo de destrezas deportivas.","referentes":"Actividades de fútbol sala para la iniciación y refuerzo de valores. Actividades atléticas de desarrollo de destrezas básicas. Actividades de Baloncesto para el desarrollo de destrezas y valores. Actividades deportivas practicadas en la escuela y comunidad.","pagina":32,"tipo":"Media","grado":"3er Año"},{"tema":"Practicar hábitos de alimentación sana e higiene personal para mantener buena salud","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"El cuerpo humano como sistema energético. Cuidados y prevenciones para garantizar la buena salud.","referentes":"Consejos para una alimentación sana. Acciones preventivas para un cuerpo saludable. 1.3*Sistemas energéticos. Entes encargados de orientar la salud en Venezuela. Alimentos que garantizan la buena salud. Características de una buena Higiene personal.","pagina":32,"tipo":"Media","grado":"3er Año"},{"tema":"La actividad física como herramienta para el vivir bien","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Corporeidad y kinestésica. Corporeidad, actividad física y movimiento.","referentes":"La gimnasia sus características. Combinaciones de movimientos corporales. Composiciones en grupos. Asociación de música y movimientos.","pagina":32,"tipo":"Media","grado":"3er Año"},{"tema":"Educación del ritmo y el movimiento para la salud y la vida","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Expresiones corporales en combinación con sonidos onomatopéyicos. Bailes y danzas autóctonas, populares y Tradicionales.","referentes":"Identificar expresiones propias de la localidad, región y país. Características de las tradiciones de la localidad región y país. Actividades dirigidas a mejorar la Coordinación Neuromotora. Danzas y bailes tradicionales*Manifestaciones tradicionales y bailes culturales de la localidad, región y país. Patrimonios culturales de la localidad, región y país.","pagina":32,"tipo":"Media","grado":"3er Año"},{"tema":"La actividad física y el deporte como medio de refuerzo de valores sociales y comunitarios","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Actividad física y deportiva de las comunidades. Fundamentos deportivos y valores comunitarios.","referentes":"Deporte estudiantil. El beisbol five (5): fundamentos técnicos y tácticos. Glorias deportivas de la comunidad. Tipos de actividades físicas y deportivas realizadas en la comunidad.","pagina":33,"tipo":"Media","grado":"3er Año"},{"tema":"Habilidades y destrezas que contribuyen al desarrollo pleno y armónico del ser humano","temaIndispensable":"#17 Actividad física, deporte y recreación.","tejido":"Habilidades motoras básicas. Destreza física. Disciplinas deportivas de interés escolar y comunitario.","referentes":"Juegos que reflejan habilidades. actividad física y juegos que combinan destrezas y habilidades Actividades físicas y deportivas comunes en mi comunidad. Características de los participantes en la actividad física y deportiva escolar.","pagina":33,"tipo":"Media","grado":"3er Año"},{"tema":"El juego y el deporte educativo como herramienta para el desarrollo física integral","temaIndispensable":"#6. Preservación de la vida en el planeta, salud y buen vivir.","tejido":"Organización de actividades físicas y deportivas. Disciplinas y categorías en los juegos deportivos.","referentes":"Juegos, deportes y actividades físicas realizadas en la escuela. Juegos tradicionales y deportes practicados en la comunidad. Características de los participantes en las actividades deportiva escolar. Atención según el género en las actividades físicas y deportivas.","pagina":33,"tipo":"Media","grado":"3er Año"}],"4to Año":[{"tema":"Corporeidad como herramienta de desarrollo físico integral","temaIndispensable":"","tejido":"Reconocimiento de sí misma o mismo. Cuerpo, corporeidad y sociedad.","referentes":"Ejercicios para el desarrollo físico motriz. Valoración de la potencialidad de sí mismo como humano. Procesos metabólicos humanos. Técnicas corporales relacionadas las costumbres y valores sociales.","pagina":33,"tipo":"Media","grado":"4to Año"},{"tema":"Las cualidades físicas como bases del desarrollo integral del ser humano","temaIndispensable":"","tejido":"Pruebas que miden la capacidad física. Anatomía y fisiología del ejercicio físico.","referentes":"Momentos de aplicación de pruebas de aptitud física. Secuencia de ejercicios de Movilidad articular y elongación muscular.","pagina":33,"tipo":"Media","grado":"4to Año"},{"tema":"La condición física y la salud integral del ser humano","temaIndispensable":"","tejido":"Parámetros fisiológicos relacionados con la salud. Bases para la organización, planificación y medición de la actividad física.","referentes":"Control de la frecuencia cardíaca, consumo de oxígeno y tensión arterial en personas sanas según Grupos etarios y sexo. Principios fisiológicos y psicológicos para el mejoramiento de la Aptitud física. Aplicar principios científicos para la prescripción de trabajo físico. Tareas motrices en diferentes contextos (escuela, familia y comunidad). Medición de la capacidad aeróbica, potencia anaeróbica. Identificar formas de control de la intensidad de actividades cardo-respiratorias.","pagina":34,"tipo":"Media","grado":"4to Año"},{"tema":"Las destrezas motrices como elemento clave en el rendimiento físico","temaIndispensable":"","tejido":"Variaciones en el desarrollo y Condición física. Rendimiento físico según genero","referentes":"Diferentes movimientos en la realización de ejercicios físicos. Identificar las distintas variantes de trabajo físico. Tareas motrices según la cualidad física. Requerimientos en el trabajo físico según el género.","pagina":34,"tipo":"Media","grado":"4to Año"},{"tema":"Actividades deportivas y recreativas en diferentes ambientes para el beneficio de la salud física","temaIndispensable":"","tejido":"Deporte y recreación en diferentes ambientes. Recreación y juego en la naturaleza.","referentes":"Actividades deportivas desarrolladas en la escuela, comunidad. Actividades Lúdicas, recreación y juego. Recreación y juego en espacios naturales naturaleza. Propuestas de juegos deportivos y recreativos para la escuela.","pagina":34,"tipo":"Media","grado":"4to Año"},{"tema":"El cuerpo humano, corporeidad, sociedad y vida","temaIndispensable":"","tejido":"Objetivo terapéutico del movimiento Cualidades motrices y ejercicios físicos.","referentes":"Ejercicios individuales y en grupo. Formas de control en los movimientos generales y parciales del cuerpo. Ejercicios corporales terapéuticos. Aplicación de ejercicios gimnásticos al movimiento.","pagina":34,"tipo":"Media","grado":"4to Año"},{"tema":"Uso y abuso de sustancias nocivas para la salud","temaIndispensable":"","tejido":"Enfermedades crónicas relacionadas con el uso Y abuso de sustancias nocivas. Metabolismo y salud.","referentes":"Sustancias nocivas para la salud. Influencia del doping en el rendimiento físico. Transgénicos, usados en las actividades físicas. Consecuencias del uso de las sustancias prohibidas.","pagina":34,"tipo":"Media","grado":"4to Año"},{"tema":"Medios de la Educación Física para preservar la salud física y psíquica","temaIndispensable":"","tejido":"Entes públicos responsables de la salud física y mental. Sustancias prohibidas en Venezuela","referentes":"Políticas publicas relacionadas con la prevención en Salud. Sustancias nocivas para la salud Dependencias y adicciones. Enfermedades crónicas; anorexia, disorexia, Bulimia","pagina":34,"tipo":"Media","grado":"4to Año"},{"tema":"Deportes tradicionales y manifestaciones motrices alternativas","temaIndispensable":"","tejido":"Eventos colectivos de actividades Alternativas. Juegos deportivos, Tradicionales, autóctonos.","referentes":"Juegos deportivos de diferentes, deportes Tradicionales y autóctonos. Actividades propias de nuestros indígenas, afro, entre otros. Actividades deportivas, Individuales y colectivos.","pagina":35,"tipo":"Media","grado":"4to Año"},{"tema":"Los juegos deportivos","temaIndispensable":"","tejido":"Aspectos técnicos, Logísticos y protocolares de los deportes. Clubes deportivos y polideportivos estudiantiles.","referentes":"Principios de organización deportiva. Diferentes fases de un evento deportivo. Elementos logísticos de un evento deportivo. Protocolo deportivo de un evento.","pagina":35,"tipo":"Media","grado":"4to Año"},{"tema":"Promoción de la actividad física y deportes emergentes para la salud física y mental Recreación, salud y deporte para el buen vivir","temaIndispensable":"","tejido":"Deportes emergentes en Venezuela. Actividad física y espacios diversos. Cultura, localidad y actividad física.","referentes":"Tipos de deportes emergentes. El pentatlón como sus características. Soga-Tira, el juego y la batalla de fuerza: historia y evolución. Actividades deportivas propias de la región. Actividades recreativas autóctonas de la localidad. Bailes y Danzas tradicionales de la localidad. Espacios naturales sugeridos para actividades recreativas escolares y comunitarias.","pagina":35,"tipo":"Media","grado":"4to Año"},{"tema":"El deporte como medio estratégico para la integración","temaIndispensable":"","tejido":"Deportes tradicionales y no tradicionales. Acuerdos de participación en deportes no tradicionales.","referentes":"Béisbol five (5). Baloncesto 3vs3. Juegos alternativos, simplificados, cooperativos, entre otros. Juegos indígena Actividad deportiva en espacios naturales de la localidad.","pagina":35,"tipo":"Media","grado":"4to Año"},{"tema":"Seguridad y primeros auxilios durante el desarrollo de actividades físicas y deportivas","temaIndispensable":"","tejido":"Seguridad y primeros auxilios para los ciudadanos. Accidentes más frecuentes en la práctica de deportes y actividad física.","referentes":"Normas de seguridad en espacios deportivos urbanos Acuerdos de convivencia en las instituciones educativas. Proyecto Educativo Integral Comunitario. Plan de acción institucional en materia deportiva, recreativa y cultural. Entes de atención y consulta inmediata en caso de accidentes o lesiones en la práctica de actividades físicas. Articulación escuela – comunidad.","pagina":35,"tipo":"Media","grado":"4to Año"},{"tema":"Organización y promoción de actividades físicas, deportivas y recreativas para el buen vivir","temaIndispensable":"","tejido":"Organización, Planificación y ejecución de actividades deportivas y recreativas. Consideraciones de género y edad en las actividades recreativas y deportivas.","referentes":"Actividades deportivas y recreativas. en la comunidad. Promoción de la convivencia y la salud integral. Participación en actividades recreativas y deportivas según el género. Participación en actividades recreativas y deportivas considerando las diferencias de edad. Actividades de integración sin distingo de género y edad. Actividades o intercambios recreativos y deportivos entre la escuela y la comunidad.","pagina":36,"tipo":"Media","grado":"4to Año"}],"5to Año":[{"tema":"Orientación y acuerdos para un sano compartir formativo","temaIndispensable":"","tejido":"Acuerdos para el desarrollo de actividades didácticas. Compromisos y responsabilidades","referentes":"Revisión de los temas. Ponderación por trabajo realizado. Fechas de inicio y cierre. Valores de respeto, responsabilidad, entre otros.","pagina":36,"tipo":"Media","grado":"5to Año"},{"tema":"Actividad física para la salud y la vida","temaIndispensable":"","tejido":"Acondicionamiento neuromuscular. Capacidades coordinativas y condicionales Juegos.","referentes":"Movilidad articular y elongación muscular. Ejercicios especiales sin desplazamientos. Ejercicios especiales con desplazamientos. Ejercicios aeróbicos Ejercicios anaeróbicos. Ejercicios de fuerza. Ejercicios de flexibilidad. Juegos a Alternativos, simplificados, cooperativos, entre otros.","pagina":36,"tipo":"Media","grado":"5to Año"},{"tema":"Destrezas, aptitudes y hábitos importantes para la salud corporal y desarrollo físico","temaIndispensable":"","tejido":"Parámetros fisiológicos: pruebas físicas. Capacidad y preparación físicas. Normas de seguridad y prevención de lesiones y accidentes.","referentes":"Resistencia, fuerza, velocidad, coordinación y flexibilidad. Principios, fisiológicos y psicológicos para el rendimiento físico. Mejoramiento de la velocidad y la resistencia muscular (Potencia anaerobia). Principios de la preparación y el mejoramiento de la condición física. Diferentes normas básicas de seguridad para la prevención de lesiones y accidentes durante la práctica de actividades físicas corporales.","pagina":37,"tipo":"Media","grado":"5to Año"},{"tema":"La motricidad como herramientas de trabajo y desarrollo físico","temaIndispensable":"","tejido":"Medición del rendimiento físico. Instrumentos y cualidades físicas.","referentes":"Desarrollo físico motriz. Valoración de las potencialidades físicas. Pruebas de aptitud física. Cálculos y resultados del trabajo físico.","pagina":37,"tipo":"Media","grado":"5to Año"},{"tema":"Fenómenos socioculturales relacionados con la actividad física y el deporte","temaIndispensable":"","tejido":"Tradiciones y costumbres en Venezuela Actividades físico- motrices.","referentes":"Características de la localidad institucional. Actividades socioculturales, físico-motrices de la región y localidad. Control corporal en situaciones motrices complejas. Actividades deportivas no tradicionales.","pagina":37,"tipo":"Media","grado":"5to Año"},{"tema":"Manifestaciones motrices alternativas y deportes tradicionales para la salud y vida","temaIndispensable":"","tejido":"Manifestaciones corporales emergentes. Fundamentos técnicos deportivos.","referentes":"Habilidades y destrezas básicas. Principios del entrenamiento físico y deportivo. Ejercicios de aplicación y consolidación de fundamentos deportivos. Características y cualidades físicas según el Genero.","pagina":37,"tipo":"Media","grado":"5to Año"},{"tema":"Actividad física, deporte educativo y recreación formativa en diferentes espacios naturales","temaIndispensable":"","tejido":"Ambiente y salud física y deportes. Actividad física y deportes, dentro y fuera de las instituciones educativas.","referentes":"Valores del gerente deportivo. Ética profesional. Liderazgo. Inteligencia emocional. El atletismo: historia, evolución, pruebas. Pruebas de pista o campo abierto y sus reglas. Pruebas de campo (fondo y medio fondo). Entrenamiento en espacios abiertos. Pruebas de campo: impulsos, saltos y lanzamientos.","pagina":37,"tipo":"Media","grado":"5to Año"},{"tema":"Sociedad, cuerpo, corporeidad y salud física","temaIndispensable":"","tejido":"Educación Física para la salud física, psíquica y social. Actividad Física, prevención y salud mental. El baile deportivo de integración coreográfica","referentes":"Condición física y actitudes psico-sociales. Entes vinculados con la salud física y mental. Fundamentos de la Educación Física. Principio de la conciencia actividad. Clasificación de la Clase de Educación Física. Estructura de la Clase de Educación Física. Técnica para la dirección de la clase de educación física. Políticas públicas relacionadas con la prevención en salud. Característica fenotipos y expresión corporal. Coreografías simples con base rítmico-musical, de forma individual. Coreografías simples con base rítmico-musical, de forma colectiva.","pagina":38,"tipo":"Media","grado":"5to Año"},{"tema":"Organización y desarrollo de actividades, físicas, deportivas y recreativas para la salud y sana convivencia","temaIndispensable":"","tejido":"Organización deportiva, recreativa y de actividad física. Competencias deportivas (aspectos técnicos, logísticos y protocolares)","referentes":"Promoción y publicidad, de actividades físicas, deportivas y recreativas. Principios de organización deportiva, recreativa y de actividad física. Características de la región, municipio, localidad, y su relación con las instituciones educativas. Actividades físicas, recreativas y deportivas practicadas en la localidad.","pagina":38,"tipo":"Media","grado":"5to Año"},{"tema":"Salud y buen uso del tiempo libre como mecanismo de prevención de conductas que producen adicciones y dependencias","temaIndispensable":"","tejido":"Uso y abuso de sustancias nocivas para la salud. Mecanismos de prevención contra el uso de sustancias nocivas para la salud.","referentes":"Sustancias nocivas para la salud. Valores personales. Instituciones encargadas de la prevención contra el uso de sustancias prohibidas. Causas del consumo de sustancias prohibidas. Consecuencias físicas, mentales y sociales del consumo y tráfico de sustancias prohibidas.","pagina":38,"tipo":"Media","grado":"5to Año"},{"tema":"Aspectos técnicos, logísticos y protocolares que deben ser considerados para el desarrollo de actividades físicas, deportivas y recreativas","temaIndispensable":"","tejido":"Nuevos deportes colectivos e individuales. Deportes no tradicionales, sus fundamentos técnicos, reglamento, recursos.","referentes":"El Pentatlón moderno. El Bádminton en Venezuela. El Beisbol five (5) en Venezuela. Soga-Tira, juegos y la batalla de fuerza. Normas de participación. Características de la organización deportiva, recreativa y de actividades físicas regionales y locales.","pagina":38,"tipo":"Media","grado":"5to Año"}]};
  window.EDUGESTION_CEF_DATA=DATA;
  let nivelActual='1er Grado';
  window.EDUGESTION_CEF_GET_LEVEL=()=>nivelActual;
  let filtro='';
  let temaActivo=null;

  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':c==='"'?'&quot;':'&#39;');
  const textoLista=(v='')=>{
    const limpio=String(v||'').replace(/\s+/g,' ').trim();
    if(!limpio) return '<p class=\"cef-vacio\">No se especifica en este registro.</p>';
    const partes=limpio.split(/\s*•\s*/).filter(Boolean);
    if(partes.length>1) return '<ul>'+partes.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
    return '<p>'+esc(limpio)+'</p>';
  };

  function estilos(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style'); s.id=STYLE_ID; s.textContent=`
      .cef-page{padding-bottom:38px}.cef-hero{position:relative;overflow:hidden;border-radius:26px;padding:28px 30px;background:linear-gradient(120deg,#0f4770,#17699b 58%,#2388b8);color:#fff;margin-bottom:22px}.cef-hero:after{content:\"\";position:absolute;width:220px;height:220px;border-radius:50%;right:-70px;top:-95px;background:rgba(255,255,255,.10)}.cef-hero small{font-weight:900;letter-spacing:.12em;text-transform:uppercase}.cef-hero h2{font-size:clamp(1.7rem,3vw,2.35rem);margin:8px 0 8px}.cef-hero p{max-width:820px;margin:0;line-height:1.6;color:rgba(255,255,255,.92)}
      .cef-toolbar{background:var(--surface,#fff);border:1px solid #d9e4ef;border-radius:22px;padding:18px;margin-bottom:18px}.cef-levels{display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;scrollbar-width:thin}.cef-level{border:1px solid #cbd9e6;background:#f7fafc;color:#28445f;border-radius:12px;padding:10px 14px;white-space:nowrap;font-weight:800;cursor:pointer}.cef-level.active{background:#1769aa;color:#fff;border-color:#1769aa}.cef-tools{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:12px;margin-top:10px}.cef-search{width:100%;border:1px solid #cad8e6;border-radius:13px;padding:12px 14px;font:inherit;background:#fff;color:#17283b}.cef-source{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:13px;background:#eefaf5;color:#087a52;font-weight:800;white-space:nowrap}.cef-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:18px 2px 12px}.cef-summary h3{margin:0;color:#1c3046}.cef-summary span{font-size:.88rem;color:#66788a}.cef-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.cef-card{border:1px solid #d6e1ec;background:#fff;border-radius:18px;padding:17px;display:flex;flex-direction:column;gap:12px;min-width:0;transition:.18s ease}.cef-card:hover{border-color:#8fb6d4;transform:translateY(-1px)}.cef-card.selected{border:2px solid #1769aa;background:#f3f9ff}.cef-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.cef-card h4{margin:0;font-size:1.05rem;line-height:1.35;color:#18334e}.cef-pagechip{font-size:.72rem;background:#edf3f8;color:#587085;border-radius:999px;padding:5px 8px;white-space:nowrap}.cef-card p{margin:0;color:#617486;line-height:1.5;font-size:.91rem}.cef-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto}.cef-btn{border:0;border-radius:11px;padding:9px 11px;font-weight:800;cursor:pointer}.cef-btn.primary{background:#1769aa;color:#fff}.cef-btn.soft{background:#edf5fb;color:#155989}.cef-selectedbar{display:none;align-items:center;justify-content:space-between;gap:12px;border:1px solid #9fc9e8;background:#f0f8ff;border-radius:16px;padding:13px 15px;margin-bottom:14px}.cef-selectedbar.show{display:flex}.cef-selectedbar strong{color:#164d76}.cef-empty{grid-column:1/-1;border:1px dashed #b9c8d5;border-radius:18px;padding:34px;text-align:center;color:#6b7d8e}.cef-modal{position:fixed;inset:0;z-index:9999;background:rgba(9,21,34,.58);display:none;align-items:center;justify-content:center;padding:20px}.cef-modal.open{display:flex}.cef-dialog{width:min(920px,100%);max-height:88vh;overflow:auto;background:#fff;border-radius:22px;padding:24px;box-shadow:0 24px 70px rgba(0,0,0,.28)}.cef-dialog-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;border-bottom:1px solid #e3eaf1;padding-bottom:15px;margin-bottom:16px}.cef-dialog h3{margin:0;color:#153958;font-size:1.35rem}.cef-close{border:0;background:#eef3f7;width:40px;height:40px;border-radius:12px;cursor:pointer;font-size:1.05rem}.cef-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.cef-detail{border:1px solid #dae5ee;border-radius:15px;padding:15px}.cef-detail.full{grid-column:1/-1}.cef-detail h5{margin:0 0 8px;color:#155989;font-size:.9rem;text-transform:uppercase;letter-spacing:.04em}.cef-detail p,.cef-detail li{color:#42586d;line-height:1.55}.cef-detail ul{padding-left:19px;margin:0}.cef-dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.cef-primary-note{font-size:.8rem;color:#6b7c8d;margin-top:5px}
      body.edugestion-dark .cef-toolbar,body.edugestion-dark .cef-card,body.edugestion-dark .cef-dialog{background:#142233;border-color:#31455b}body.edugestion-dark .cef-card h4,body.edugestion-dark .cef-summary h3,body.edugestion-dark .cef-dialog h3{color:#e8f1f8}body.edugestion-dark .cef-card p,body.edugestion-dark .cef-summary span,body.edugestion-dark .cef-detail p,body.edugestion-dark .cef-detail li{color:#b8c6d4}body.edugestion-dark .cef-level{background:#1b2d40;color:#d8e5f0;border-color:#3b5168}body.edugestion-dark .cef-level.active{background:#1769aa;color:#fff}body.edugestion-dark .cef-search{background:#17283a;color:#eef6fb;border-color:#40566c}body.edugestion-dark .cef-detail{border-color:#33495f}
      @media(max-width:800px){.cef-grid{grid-template-columns:1fr}.cef-tools{grid-template-columns:1fr}.cef-source{white-space:normal}.cef-detail-grid{grid-template-columns:1fr}.cef-detail.full{grid-column:auto}}@media(max-width:520px){.cef-hero{padding:21px 18px;border-radius:20px}.cef-toolbar{padding:13px}.cef-selectedbar{align-items:flex-start;flex-direction:column}.cef-dialog{padding:17px}}
    `;document.head.appendChild(s);
  }

  function crear(){
    if(document.getElementById(TAB_ID)||document.getElementById(SECTION_ID))return true;
    const nav=document.getElementById('app-nav'); const main=document.getElementById('app-main');
    if(!nav||!main)return false; estilos();
    const tab=document.createElement('button'); tab.id=TAB_ID;tab.type='button';tab.className='nav-item';tab.setAttribute('aria-selected','false');tab.dataset.title='Cuadernillo Educación Física';tab.dataset.description='Base curricular interactiva por grado y año para organizar los temas oficiales de Educación Física.';tab.innerHTML='<i class=\"fa-solid fa-book-open-reader\"></i><span>Cuadernillo Educación Física</span>';
    const plan=document.getElementById('tab-planificacion'); if(plan?.nextSibling)nav.insertBefore(tab,plan.nextSibling);else nav.appendChild(tab);
    const section=document.createElement('section');section.id=SECTION_ID;section.className='hidden cef-page';section.innerHTML=`
      <header class=\"cef-hero\"><small><i class=\"fa-solid fa-landmark\"></i> Base curricular MPPE · Educación Física</small><h2>Cuadernillo Educación Física</h2><p>Explora el contenido oficial por nivel, grado y año. Selecciona un tema y envíalo directamente a Planificación IA con su base curricular completa.</p></header>
      <div class=\"cef-toolbar\"><div class=\"cef-levels\" id=\"cef-levels\"></div><div class=\"cef-tools\"><input class=\"cef-search\" id=\"cef-search\" placeholder=\"Buscar tema, tejido temático o referente...\"><div class=\"cef-source\"><i class=\"fa-solid fa-circle-check\"></i> Fuente: Cuadernillo Curricular MPPE</div></div></div>
      <div class=\"cef-selectedbar\" id=\"cef-selectedbar\"><div><strong id=\"cef-selected-title\">Tema seleccionado</strong><div class=\"cef-primary-note\">La selección queda guardada en este navegador y puede enviarse directamente a Planificación IA.</div></div><div class=\"cef-actions\"><button class=\"cef-btn primary\" id=\"cef-send-plan\" type=\"button\"><i class=\"fa-solid fa-wand-magic-sparkles\"></i> Llevar a Planificación</button><button class=\"cef-btn soft\" id=\"cef-clear\" type=\"button\">Quitar selección</button></div></div>
      <div class=\"cef-summary\"><div><h3 id=\"cef-level-title\">1er Grado</h3><span id=\"cef-level-sub\"></span></div><span id=\"cef-count\"></span></div><div class=\"cef-grid\" id=\"cef-grid\"></div>
      <div class=\"cef-modal\" id=\"cef-modal\" aria-hidden=\"true\"><div class=\"cef-dialog\" role=\"dialog\" aria-modal=\"true\"><div class=\"cef-dialog-head\"><div><h3 id=\"cef-modal-title\"></h3><div class=\"cef-primary-note\" id=\"cef-modal-meta\"></div></div><button class=\"cef-close\" id=\"cef-close\" type=\"button\"><i class=\"fa-solid fa-xmark\"></i></button></div><div class=\"cef-detail-grid\" id=\"cef-detail-grid\"></div><div class=\"cef-dialog-actions\"><button class=\"cef-btn soft\" id=\"cef-select-modal\" type=\"button\"><i class=\"fa-solid fa-check\"></i> Seleccionar este tema</button><button class=\"cef-btn soft\" id=\"cef-eval-modal\" type=\"button\"><i class=\"fa-solid fa-list-check\"></i> Añadir al plan de evaluación</button><button class=\"cef-btn primary\" id=\"cef-send-plan-modal\" type=\"button\"><i class=\"fa-solid fa-wand-magic-sparkles\"></i> Planificar con IA</button></div></div></div>
    `;main.appendChild(section);
    tab.addEventListener('click',()=>abrir(tab,section));
    section.querySelector('#cef-search').addEventListener('input',e=>{filtro=e.target.value.trim().toLowerCase();renderCards();});
    section.querySelector('#cef-close').addEventListener('click',cerrarModal);section.querySelector('#cef-modal').addEventListener('click',e=>{if(e.target.id==='cef-modal')cerrarModal();});
    section.querySelector('#cef-clear').addEventListener('click',()=>seleccionar(null));section.querySelector('#cef-select-modal').addEventListener('click',()=>{if(temaActivo)seleccionar(temaActivo);cerrarModal();});section.querySelector('#cef-eval-modal').addEventListener('click',()=>{if(temaActivo&&window.EDUGESTION_PLAN_EVAL_ADD)window.EDUGESTION_PLAN_EVAL_ADD({...temaActivo,grado:nivelActual,fuente:'Cuadernillo Curricular MPPE · Educación Física'});cerrarModal();});section.querySelector('#cef-send-plan').addEventListener('click',()=>{const s=leerSeleccion();if(s)enviarAPlanificacion(s);});section.querySelector('#cef-send-plan-modal').addEventListener('click',()=>{if(temaActivo){seleccionar(temaActivo);enviarAPlanificacion({...temaActivo,grado:nivelActual,fuente:'Cuadernillo Curricular MPPE · Educación Física'});}cerrarModal();});
    renderLevels(); restaurarSeleccion(); renderCards(); return true;
  }

  function abrir(tab,section){document.querySelectorAll('.app-sidebar .nav-item,#app-nav .nav-item').forEach(x=>{x.classList.remove('is-active');x.setAttribute('aria-selected','false')});document.querySelectorAll('#app-main > section').forEach(x=>x.classList.add('hidden'));tab.classList.add('is-active');tab.setAttribute('aria-selected','true');section.classList.remove('hidden');const t=document.getElementById('page-title'),d=document.getElementById('page-description');if(t)t.textContent=tab.dataset.title;if(d)d.textContent=tab.dataset.description;window.scrollTo({top:0,behavior:'smooth'});}
  function renderLevels(){const box=document.getElementById('cef-levels');if(!box)return;box.innerHTML=Object.keys(DATA).map(n=>`<button type=\"button\" class=\"cef-level ${n===nivelActual?'active':''}\" data-nivel=\"${esc(n)}\">${esc(n)}</button>`).join('');box.querySelectorAll('.cef-level').forEach(b=>b.addEventListener('click',()=>{nivelActual=b.dataset.nivel;filtro='';const q=document.getElementById('cef-search');if(q)q.value='';renderLevels();renderCards();}));}
  function textoBusqueda(x){return [x.tema,x.descripcion,x.intencionalidad,x.tejido,x.referentes,x.temaIndispensable].filter(Boolean).join(' ').toLowerCase();}
  function renderCards(){const grid=document.getElementById('cef-grid');if(!grid)return;const arr=(DATA[nivelActual]||[]).filter(x=>!filtro||textoBusqueda(x).includes(filtro));const title=document.getElementById('cef-level-title'),sub=document.getElementById('cef-level-sub'),count=document.getElementById('cef-count');if(title)title.textContent=nivelActual;if(sub)sub.textContent=nivelActual.includes('Año')?'Educación Media General / Media Técnica':'Inicial'===nivelActual?'Educación Inicial':'Educación Primaria';if(count)count.textContent=`${arr.length} tema${arr.length===1?'':'s'} curricular${arr.length===1?'':'es'}`;if(!arr.length){grid.innerHTML='<div class=\"cef-empty\"><i class=\"fa-solid fa-magnifying-glass\"></i><h4>No encontramos coincidencias</h4><p>Prueba con otra palabra o cambia de grado/año.</p></div>';return;}const sel=leerSeleccion();grid.innerHTML=arr.map((x,i)=>{const selected=sel&&sel.grado===nivelActual&&sel.tema===x.tema;const desc=x.descripcion||x.tejido||x.referentes||'';return `<article class=\"cef-card ${selected?'selected':''}\"><div class=\"cef-card-top\"><h4>${esc(x.tema)}</h4><span class=\"cef-pagechip\">p. ${x.pagina}</span></div><p>${esc(desc.slice(0,210))}${desc.length>210?'…':''}</p><div class=\"cef-actions\"><button class=\"cef-btn soft\" data-ver=\"${i}\" type=\"button\"><i class=\"fa-solid fa-eye\"></i> Ver base curricular</button><button class=\"cef-btn primary\" data-sel=\"${i}\" type=\"button\"><i class=\"fa-solid fa-check\"></i> ${selected?'Seleccionado':'Seleccionar tema'}</button><button class=\"cef-btn primary\" data-plan=\"${i}\" type=\"button\"><i class=\"fa-solid fa-wand-magic-sparkles\"></i> Planificar con IA</button><button class=\"cef-btn soft\" data-eval=\"${i}\" type=\"button\"><i class=\"fa-solid fa-list-check\"></i> Plan de evaluación</button></div></article>`}).join('');grid.querySelectorAll('[data-ver]').forEach(b=>b.addEventListener('click',()=>abrirModal(arr[Number(b.dataset.ver)])));grid.querySelectorAll('[data-sel]').forEach(b=>b.addEventListener('click',()=>seleccionar(arr[Number(b.dataset.sel)])));grid.querySelectorAll('[data-plan]').forEach(b=>b.addEventListener('click',()=>enviarAPlanificacion(arr[Number(b.dataset.plan)])));grid.querySelectorAll('[data-eval]').forEach(b=>b.addEventListener('click',()=>{const item=arr[Number(b.dataset.eval)];if(window.EDUGESTION_PLAN_EVAL_ADD)window.EDUGESTION_PLAN_EVAL_ADD({...item,grado:nivelActual,fuente:'Cuadernillo Curricular MPPE · Educación Física'});}));}
  function detalleItem(titulo,contenido,full=false){if(!contenido)return '';return `<section class=\"cef-detail ${full?'full':''}\"><h5>${esc(titulo)}</h5>${textoLista(contenido)}</section>`;}
  function abrirModal(x){temaActivo=x;const modal=document.getElementById('cef-modal');document.getElementById('cef-modal-title').textContent=x.tema;document.getElementById('cef-modal-meta').textContent=`${nivelActual} · Página ${x.pagina} del cuadernillo`;const g=document.getElementById('cef-detail-grid');let html='';if(x.descripcion&&x.descripcion!==x.tema)html+=detalleItem('Tema generador / descripción',x.descripcion,true);if(x.temaIndispensable)html+=detalleItem('Tema indispensable',x.temaIndispensable);if(x.intencionalidad)html+=detalleItem('Intencionalidad pedagógica',x.intencionalidad);if(x.tejido)html+=detalleItem('Tejido temático',x.tejido,true);if(x.referentes)html+=detalleItem('Referentes teórico-prácticos',x.referentes,true);g.innerHTML=html||'<section class=\"cef-detail full\"><p>No hay detalle adicional extraído para este tema.</p></section>';modal.classList.add('open');modal.setAttribute('aria-hidden','false');}
  function cerrarModal(){const m=document.getElementById('cef-modal');if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true')}}
  function leerSeleccion(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')}catch(e){return null}}
  function seleccionar(x){if(x){const registro={...x,grado:nivelActual,fuente:'Cuadernillo Curricular MPPE · Educación Física',seleccionadoEn:new Date().toISOString()};localStorage.setItem(STORAGE_KEY,JSON.stringify(registro));}else localStorage.removeItem(STORAGE_KEY);actualizarSeleccion();renderCards();}
  function restaurarSeleccion(){actualizarSeleccion();}
  function actualizarSeleccion(){const bar=document.getElementById('cef-selectedbar'),title=document.getElementById('cef-selected-title'),s=leerSeleccion();if(!bar)return;if(s){bar.classList.add('show');if(title)title.textContent=`${s.grado}: ${s.tema}`;}else{bar.classList.remove('show');if(title)title.textContent='Tema seleccionado';}}
  function asegurarPanelPlanificacion(s){
    const sec=document.getElementById('section-planificacion');if(!sec)return;let panel=document.getElementById('plan-cuadernillo-base');
    if(!panel){panel=document.createElement('div');panel.id='plan-cuadernillo-base';panel.className='card';panel.style.cssText='margin:0 0 18px;padding:18px;border:1px solid var(--border-color,#d9e2ec);border-radius:18px;background:var(--card-bg,#fff)';const form=document.getElementById('btn-planificacion-ia')?.closest('.card')||document.getElementById('btn-planificacion-ia')?.parentElement;sec.insertBefore(panel,form||sec.firstChild);}
    panel.innerHTML=`<div style=\"display:flex;gap:12px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap\"><div><div style=\"font-size:.78rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#1476b8\"><i class=\"fa-solid fa-book-open-reader\"></i> Base curricular seleccionada</div><h3 style=\"margin:6px 0 4px\">${esc(s.grado)} · ${esc(s.tema)}</h3><div style=\"font-size:.88rem;color:#64748b\">Cuadernillo Curricular MPPE · Educación Física · página ${esc(s.pagina||'—')}</div></div><button type=\"button\" id=\"plan-cuadernillo-volver\" class=\"cef-btn soft\"><i class=\"fa-solid fa-arrow-left\"></i> Volver al cuadernillo</button></div>${s.temaIndispensable?`<div style=\"margin-top:14px\"><strong>Tema indispensable</strong><div style=\"margin-top:5px\">${textoLista(s.temaIndispensable)}</div></div>`:''}${s.intencionalidad?`<div style=\"margin-top:14px\"><strong>Intencionalidad pedagógica</strong><div style=\"margin-top:5px\">${textoLista(s.intencionalidad)}</div></div>`:''}${s.tejido?`<div style=\"margin-top:14px\"><strong>Tejido temático</strong><div style=\"margin-top:5px\">${textoLista(s.tejido)}</div></div>`:''}${s.referentes?`<div style=\"margin-top:14px\"><strong>Referentes teórico-prácticos</strong><div style=\"margin-top:5px\">${textoLista(s.referentes)}</div></div>`:''}`;
    panel.querySelector('#plan-cuadernillo-volver')?.addEventListener('click',()=>document.getElementById(TAB_ID)?.click());
  }
  function enviarAPlanificacion(x){
    const s={...x,grado:x.grado||nivelActual,fuente:'Cuadernillo Curricular MPPE · Educación Física',seleccionadoEn:new Date().toISOString()};localStorage.setItem(STORAGE_KEY,JSON.stringify(s));actualizarSeleccion();renderCards();
    const tab=document.getElementById('tab-planificacion');if(!tab)return;tab.click();
    setTimeout(()=>{const grado=document.getElementById('plan-ia-grado'),area=document.getElementById('plan-ia-area'),tema=document.getElementById('plan-ia-tema'),obj=document.getElementById('plan-ia-objetivo');if(grado){const opts=[...grado.options||[]];const exact=opts.find(o=>o.value===s.grado||o.textContent.trim()===s.grado);if(exact)grado.value=exact.value;else if(grado.tagName==='INPUT')grado.value=s.grado;}if(area)area.value='Educación Física';if(tema)tema.value=s.tema;if(obj&&s.intencionalidad)obj.value=String(s.intencionalidad).replace(/•/g,' ').replace(/\s+/g,' ').trim();asegurarPanelPlanificacion(s);window.scrollTo({top:0,behavior:'smooth'});if(typeof mostrarToast==='function')mostrarToast('Tema cargado desde el cuadernillo.','success','Planificación IA');},180);
  }
  function init(){try{return crear()}catch(e){console.warn('EduGestión Cuadernillo EF:',e);return false}}
  if(!init()){let n=0;const tm=setInterval(()=>{n++;if(init()||n>30)clearInterval(tm)},250);}
})();

/* ================================================================
   EduGestión · Cuadernillo Educación Física · FASE 3
   Plan de evaluación curricular por uno o varios temas + Gemini
   ================================================================ */
(() => {
  const TAB_ID='tab-plan-evaluacion-ef';
  const SECTION_ID='section-plan-evaluacion-ef';
  const STYLE_ID='style-plan-evaluacion-ef';
  const KEY='edugestion_plan_evaluacion_ef_temas';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const leer=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(_){return []}};
  const guardar=a=>localStorage.setItem(KEY,JSON.stringify(a));
  function toast(msg,type='success'){if(typeof mostrarToast==='function')mostrarToast(msg,type,'Plan de evaluación');}
  function clave(x){return `${x.grado||''}::${x.tema||''}`.toLowerCase()}
  function addTema(x){
    if(!x||!x.tema)return;
    const a=leer();
    if(!a.some(y=>clave(y)===clave(x))){
      a.push({...x,agregadoEn:new Date().toISOString()});guardar(a);toast('Tema añadido al plan de evaluación.');
    }else toast('Ese tema ya está en el plan.','warning');
    render();document.getElementById(TAB_ID)?.click();
  }
  window.EDUGESTION_PLAN_EVAL_ADD=addTema;
  function removeTema(i){const a=leer();a.splice(i,1);guardar(a);render()}
  function clearTemas(){guardar([]);render();toast('Selección limpiada.','success')}
  function styles(){
    if(document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');st.id=STYLE_ID;st.textContent=`
      #${SECTION_ID}{padding-bottom:28px}
      .pev-hero{border-radius:24px;padding:24px;background:linear-gradient(135deg,#174f7d,#2477aa);color:#fff;margin-bottom:18px}
      .pev-hero small{font-weight:900;letter-spacing:.08em;text-transform:uppercase}.pev-hero h2{margin:8px 0 6px;font-size:1.75rem}.pev-hero p{margin:0;opacity:.92;max-width:850px;line-height:1.55}
      .pev-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:16px}.pev-card{background:var(--card-bg,#fff);border:1px solid var(--border-color,#d8e3ed);border-radius:20px;padding:18px;min-width:0}.pev-card h3{margin:0 0 6px;color:var(--text-color,#1f3348)}
      .pev-help{color:#6b7e91;font-size:.9rem;margin-bottom:14px}.pev-field{display:flex;flex-direction:column;gap:7px;margin-bottom:13px}.pev-field label{font-weight:800;font-size:.83rem;color:#36516b}.pev-field input,.pev-field select,.pev-field textarea{width:100%;border:1px solid #ccd9e5;border-radius:12px;padding:11px 12px;font:inherit;background:var(--card-bg,#fff);color:var(--text-color,#1f3348)}
      .pev-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.pev-topics{display:flex;flex-direction:column;gap:10px}.pev-topic{border:1px solid #d8e3ed;border-radius:15px;padding:13px;background:var(--card-bg,#fff)}.pev-topic-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.pev-topic h4{margin:0;color:var(--text-color,#1f3348);font-size:.98rem}.pev-meta{font-size:.8rem;color:#6d8195;margin-top:4px}.pev-topic p{margin:8px 0 0;color:#536b81;font-size:.86rem;line-height:1.45}
      .pev-remove{border:0;background:#fff0f0;color:#b52b2b;border-radius:9px;width:34px;height:34px;cursor:pointer}.pev-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.pev-btn{border:0;border-radius:12px;padding:11px 14px;font-weight:850;cursor:pointer}.pev-btn.primary{background:#1769aa;color:#fff}.pev-btn.soft{background:#edf5fb;color:#155989}.pev-btn.danger{background:#fff0f0;color:#a82d2d}
      .pev-empty{border:1px dashed #b9c8d7;border-radius:16px;padding:28px;text-align:center;color:#6d8195}.pev-count{display:inline-flex;align-items:center;gap:7px;background:#eef7ff;color:#155989;border-radius:999px;padding:7px 10px;font-weight:800;font-size:.82rem}.pev-source{margin-top:12px;border:1px solid #a8d8c4;background:#effbf6;color:#0d7854;border-radius:13px;padding:10px 12px;font-size:.84rem;font-weight:750}.pev-summary{border-left:4px solid #1769aa;padding:10px 12px;background:#f5f9fd;border-radius:10px;color:#405a72;font-size:.87rem;line-height:1.5}
      .dark-mode .pev-card,.dark-mode .pev-topic{background:#172334;border-color:#33465a}.dark-mode .pev-field input,.dark-mode .pev-field select,.dark-mode .pev-field textarea{background:#172334;border-color:#40536a;color:#edf4fb}.dark-mode .pev-summary{background:#1d2d3f;color:#c8d6e4}.dark-mode .pev-help,.dark-mode .pev-topic p,.dark-mode .pev-meta{color:#9fb0c0}
      @media(max-width:850px){.pev-grid{grid-template-columns:1fr}.pev-row{grid-template-columns:1fr}.pev-hero h2{font-size:1.45rem}}
    `;document.head.appendChild(st);
  }
  function crear(){
    if(document.getElementById(SECTION_ID))return true;
    const nav=document.getElementById('app-nav')||document.getElementById('tab-planificacion')?.parentElement||document.querySelector('.app-sidebar nav');
    const main=document.getElementById('app-main')||document.querySelector('main');if(!nav||!main)return false;styles();
    const tab=document.createElement('button');tab.id=TAB_ID;tab.type='button';tab.className='nav-item';tab.setAttribute('aria-selected','false');tab.dataset.title='Plan de evaluación';tab.dataset.description='Construye el plan de evaluación con uno o varios temas del Cuadernillo Curricular de Educación Física.';tab.innerHTML='<i class="fa-solid fa-list-check"></i><span>Plan de evaluación</span>';
    const ctab=document.getElementById('tab-cuadernillo-ef');if(ctab?.nextSibling)nav.insertBefore(tab,ctab.nextSibling);else nav.appendChild(tab);
    const sec=document.createElement('section');sec.id=SECTION_ID;sec.className='hidden';sec.innerHTML=`
      <header class="pev-hero"><small><i class="fa-solid fa-clipboard-check"></i> Base curricular + Gemini</small><h2>Plan de evaluación de Educación Física</h2><p>Selecciona uno o varios temas desde el Cuadernillo Educación Física y prepara un plan de evaluación coherente con la intencionalidad pedagógica, el tejido temático y los referentes del material oficial.</p></header>
      <div class="pev-grid">
        <div class="pev-card"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap"><div><h3>Temas seleccionados</h3><div class="pev-help">Puedes combinar varios temas del mismo grado o de un lapso.</div></div><span class="pev-count" id="pev-count">0 temas</span></div><div id="pev-topics" class="pev-topics"></div><div class="pev-actions"><button type="button" class="pev-btn soft" id="pev-go-book"><i class="fa-solid fa-book-open-reader"></i> Añadir temas desde el cuadernillo</button><button type="button" class="pev-btn danger" id="pev-clear"><i class="fa-solid fa-trash-can"></i> Limpiar selección</button></div></div>
        <div class="pev-card"><h3>Datos del plan</h3><div class="pev-help">Completa estos datos antes de pedir la propuesta a Gemini.</div><div class="pev-row"><div class="pev-field"><label>Lapso / período</label><select id="pev-lapso"><option>1er Lapso</option><option>2do Lapso</option><option>3er Lapso</option><option>Período especial</option></select></div><div class="pev-field"><label>Sección</label><input id="pev-seccion" placeholder="Ej.: A"></div></div><div class="pev-row"><div class="pev-field"><label>Fecha de inicio</label><input type="date" id="pev-desde"></div><div class="pev-field"><label>Fecha de cierre</label><input type="date" id="pev-hasta"></div></div><div class="pev-field"><label>Orientación adicional (opcional)</label><textarea id="pev-nota" rows="4" placeholder="Ej.: Quiero priorizar actividades prácticas y observación directa."></textarea></div><div class="pev-summary">Gemini propondrá estrategias, técnicas, instrumentos, criterios/indicadores, ponderaciones y fechas. La suma sugerida de ponderaciones será 100%.</div><div class="pev-source"><i class="fa-solid fa-shield-halved"></i> La base curricular proviene del Cuadernillo Curricular MPPE de Educación Física. Gemini no debe sustituirla por otro currículo.</div><div class="pev-actions"><button type="button" class="pev-btn primary" id="pev-generate"><i class="fa-solid fa-wand-magic-sparkles"></i> Generar plan de evaluación con IA</button></div></div>
      </div>`;main.appendChild(sec);
    tab.addEventListener('click',()=>abrir(tab,sec));
    sec.querySelector('#pev-go-book').addEventListener('click',()=>document.getElementById('tab-cuadernillo-ef')?.click());
    sec.querySelector('#pev-clear').addEventListener('click',clearTemas);
    sec.querySelector('#pev-generate').addEventListener('click',generar);
    render();return true;
  }
  function abrir(tab,sec){document.querySelectorAll('.app-sidebar .nav-item,#app-nav .nav-item').forEach(x=>{x.classList.remove('is-active');x.setAttribute('aria-selected','false')});document.querySelectorAll('#app-main > section').forEach(x=>x.classList.add('hidden'));tab.classList.add('is-active');tab.setAttribute('aria-selected','true');sec.classList.remove('hidden');const t=document.getElementById('page-title'),d=document.getElementById('page-description');if(t)t.textContent=tab.dataset.title;if(d)d.textContent=tab.dataset.description;window.scrollTo({top:0,behavior:'smooth'});render()}
  function render(){
    const box=document.getElementById('pev-topics'),count=document.getElementById('pev-count');if(!box)return;const a=leer();if(count)count.textContent=`${a.length} tema${a.length===1?'':'s'}`;
    if(!a.length){box.innerHTML='<div class="pev-empty"><i class="fa-solid fa-book-open-reader"></i><h4>No has añadido temas todavía</h4><p>Ve al Cuadernillo Educación Física y pulsa “Plan de evaluación” en los temas que quieras incluir.</p></div>';return;}
    box.innerHTML=a.map((x,i)=>`<article class="pev-topic"><div class="pev-topic-head"><div><h4>${esc(x.tema)}</h4><div class="pev-meta">${esc(x.grado||'')} · página ${esc(x.pagina||'—')}</div></div><button type="button" class="pev-remove" data-rm="${i}" title="Quitar tema"><i class="fa-solid fa-xmark"></i></button></div>${x.tejido?`<p><strong>Tejido temático:</strong> ${esc(String(x.tejido).replace(/•/g,' · ').slice(0,260))}${String(x.tejido).length>260?'…':''}</p>`:''}</article>`).join('');
    box.querySelectorAll('[data-rm]').forEach(b=>b.addEventListener('click',()=>removeTema(Number(b.dataset.rm))));
  }
  function fechaBonita(v){if(!v)return 'Por definir';const d=new Date(`${v}T12:00:00`);return Number.isNaN(d.getTime())?v:new Intl.DateTimeFormat('es-VE',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d)}
  function generar(){
    const temas=leer();if(!temas.length){toast('Añade al menos un tema desde el cuadernillo.','warning');return}
    const lapso=document.getElementById('pev-lapso')?.value||'No indicado';
    const seccion=document.getElementById('pev-seccion')?.value.trim()||'No indicada';
    const desde=document.getElementById('pev-desde')?.value||'';
    const hasta=document.getElementById('pev-hasta')?.value||'';
    const nota=document.getElementById('pev-nota')?.value.trim()||'';
    const grados=[...new Set(temas.map(x=>x.grado).filter(Boolean))].join(', ');
    const bloques=temas.map((x,i)=>`TEMA ${i+1}\n- Grado/Año: ${x.grado||'No indicado'}\n- Tema generador: ${x.tema}${x.temaIndispensable?`\n- Tema indispensable: ${x.temaIndispensable}`:''}${x.intencionalidad?`\n- Intencionalidad pedagógica: ${x.intencionalidad}`:''}${x.tejido?`\n- Tejido temático: ${x.tejido}`:''}${x.referentes?`\n- Referentes teórico-prácticos: ${x.referentes}`:''}\n- Fuente: Cuadernillo Curricular MPPE · Educación Física${x.pagina?`, página ${x.pagina}`:''}`).join('\n\n');
    const prompt=`Actúa como asistente docente de Educación Física y prepara un PLAN DE EVALUACIÓN completo en español, sin búsqueda web. Usa como base curricular obligatoria únicamente la información del Cuadernillo Curricular MPPE proporcionada abajo. No sustituyas estos contenidos por otro currículo y no inventes temas, intencionalidades o referentes oficiales. Puedes proponer estrategias, técnicas, instrumentos, criterios, ponderaciones y fechas coherentes con la base.\n\nDATOS DEL PLAN\n- Área: Educación Física\n- Grado/Año: ${grados||'Según los temas seleccionados'}\n- Sección: ${seccion}\n- Lapso/Período: ${lapso}\n- Fecha de inicio: ${fechaBonita(desde)}\n- Fecha de cierre: ${fechaBonita(hasta)}${nota?`\n- Orientación adicional del docente: ${nota}`:''}\n\nBASE CURRICULAR SELECCIONADA\n${bloques}\n\nFORMATO DE RESPUESTA\n1. Encabezado del plan de evaluación.\n2. Propósito general del lapso, derivado de los temas seleccionados.\n3. Tabla organizada con estas columnas: N°, Tema generador, Contenido/tejido temático, Actividad o estrategia evaluativa, Técnica de evaluación, Instrumento, Criterios o indicadores observables, Ponderación %, Fecha sugerida y Observaciones.\n4. Distribuye la ponderación entre todas las actividades y asegúrate de que el TOTAL sea exactamente 100%.\n5. Combina evaluación práctica, formativa y, cuando sea pertinente, producciones o actividades escritas sin perder el carácter práctico de Educación Física.\n6. Propón instrumentos realistas como lista de cotejo, escala de estimación, registro anecdótico, rúbrica u observación directa según corresponda.\n7. Los criterios deben ser observables y estar vinculados a la intencionalidad pedagógica y tejido temático de cada tema.\n8. Al final agrega un resumen de la distribución de ponderaciones y recomendaciones para el docente.\n9. No inventes datos institucionales ni fechas si no fueron indicadas; usa “Por definir” cuando corresponda.`;
    const tabIA=document.getElementById('tab-gemini'),inputIA=document.getElementById('gemini-input'),formIA=document.getElementById('gemini-form');
    if(!tabIA||!inputIA||!formIA){toast('No se pudo abrir el Asistente IA.','warning');return}
    tabIA.click();setTimeout(()=>{inputIA.value=prompt;inputIA.dispatchEvent(new Event('input',{bubbles:true}));inputIA.focus();try{if(location.protocol!=='file:')formIA.requestSubmit();else toast('Solicitud preparada. La respuesta real de Gemini se prueba desde Vercel.','success')}catch(_){}},160);
  }
  function init(){try{return crear()}catch(e){console.warn('EduGestión Plan Evaluación EF:',e);return false}}
  if(!init()){let n=0;const tm=setInterval(()=>{n++;if(init()||n>30)clearInterval(tm)},250)}
})();

/* ================================================================
   EduGestión · Cuadernillo Educación Física · FASE 4
   Seguimiento curricular por tema: Pendiente / Planificado / Trabajado / Evaluado
   ================================================================ */
(() => {
  const STORAGE_KEY='edugestion_cuadernillo_ef_seguimiento_v1';
  const STYLE_ID='style-cuadernillo-seguimiento-v1';
  const STATUSES=['Pendiente','Planificado','Trabajado','Evaluado'];
  let filtroEstado='Todos';
  let procesando=false;

  const esc=s=>String(s??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
  const normaliza=s=>String(s||'').trim().replace(/\s+/g,' ');
  const clave=(grado,tema)=>`${normaliza(grado)}|||${normaliza(tema)}`;

  function leer(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}catch(_){return {}}}
  function guardar(data){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}catch(_){}}
  function estadoDe(grado,tema){return leer()[clave(grado,tema)]?.estado||'Pendiente'}
  function setEstado(grado,tema,estado){
    if(!STATUSES.includes(estado))return;
    const data=leer();
    data[clave(grado,tema)]={grado:normaliza(grado),tema:normaliza(tema),estado,actualizadoEn:new Date().toISOString()};
    guardar(data);
    actualizarTodo();
    const msg=`${tema}: ${estado}`;
    if(typeof mostrarToast==='function') mostrarToast(msg,'success','Seguimiento curricular');
  }

  function estilos(){
    if(document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');st.id=STYLE_ID;st.textContent=`
      .cef-progress-panel{display:grid;gap:12px;border:1px solid #d8e4ee;background:linear-gradient(135deg,#f8fbff,#f4fbf7);border-radius:18px;padding:15px 16px;margin:0 0 15px}
      .cef-progress-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.cef-progress-title{display:flex;align-items:center;gap:10px}.cef-progress-title i{width:38px;height:38px;display:grid;place-items:center;border-radius:12px;background:#e9f4ff;color:#1769aa}.cef-progress-title strong{display:block;color:#193650}.cef-progress-title small{display:block;color:#6b7f91;margin-top:2px}.cef-progress-filter{display:flex;align-items:center;gap:8px;font-size:.85rem;font-weight:800;color:#52687d}.cef-progress-filter select{border:1px solid #cbd9e6;background:#fff;color:#223a50;border-radius:10px;padding:8px 10px;font:inherit;font-weight:800}
      .cef-progress-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.cef-stat{border:1px solid #dce7ef;border-radius:13px;padding:10px 11px;background:#fff}.cef-stat small{display:block;color:#718498;font-weight:700}.cef-stat strong{display:block;margin-top:2px;color:#193650;font-size:1.15rem}.cef-stat[data-s='Planificado']{border-left:4px solid #3b82f6}.cef-stat[data-s='Trabajado']{border-left:4px solid #f59e0b}.cef-stat[data-s='Evaluado']{border-left:4px solid #10b981}.cef-stat[data-s='Pendiente']{border-left:4px solid #94a3b8}
      .cef-progress-line{height:9px;border-radius:999px;background:#e7eef4;overflow:hidden}.cef-progress-line span{display:block;height:100%;width:0;background:linear-gradient(90deg,#1769aa,#13a36f);transition:width .25s ease}
      .cef-status-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px;border-radius:12px;background:#f7fafc;border:1px solid #dce6ef;flex-wrap:wrap}.cef-status-label{display:flex;align-items:center;gap:7px;font-size:.82rem;font-weight:900;color:#4a6379}.cef-status-dot{width:9px;height:9px;border-radius:50%;background:#94a3b8}.cef-card[data-status='Planificado'] .cef-status-dot{background:#3b82f6}.cef-card[data-status='Trabajado'] .cef-status-dot{background:#f59e0b}.cef-card[data-status='Evaluado'] .cef-status-dot{background:#10b981}.cef-card[data-status='Pendiente'] .cef-status-dot{background:#94a3b8}.cef-status-select{border:1px solid #cbd9e6;background:#fff;color:#244158;border-radius:9px;padding:7px 9px;font:inherit;font-size:.82rem;font-weight:800;max-width:160px}.cef-card.cef-track-hidden{display:none!important}.cef-card[data-status='Planificado']{box-shadow:inset 4px 0 0 #3b82f6}.cef-card[data-status='Trabajado']{box-shadow:inset 4px 0 0 #f59e0b}.cef-card[data-status='Evaluado']{box-shadow:inset 4px 0 0 #10b981}.cef-card[data-status='Pendiente']{box-shadow:inset 4px 0 0 #94a3b8}
      .edugestion-dark .cef-progress-panel,.dark-mode .cef-progress-panel{background:#152435;border-color:#344a60}.edugestion-dark .cef-stat,.dark-mode .cef-stat,.edugestion-dark .cef-status-row,.dark-mode .cef-status-row{background:#17283a;border-color:#385066}.edugestion-dark .cef-progress-title strong,.dark-mode .cef-progress-title strong,.edugestion-dark .cef-stat strong,.dark-mode .cef-stat strong{color:#edf5fb}.edugestion-dark .cef-progress-title small,.dark-mode .cef-progress-title small,.edugestion-dark .cef-stat small,.dark-mode .cef-stat small,.edugestion-dark .cef-status-label,.dark-mode .cef-status-label{color:#a9bac9}.edugestion-dark .cef-progress-filter select,.dark-mode .cef-progress-filter select,.edugestion-dark .cef-status-select,.dark-mode .cef-status-select{background:#17283a;border-color:#425b72;color:#edf5fb}
      @media(max-width:760px){.cef-progress-stats{grid-template-columns:1fr 1fr}.cef-progress-filter{width:100%;justify-content:space-between}.cef-progress-filter select{flex:1}.cef-status-row{align-items:stretch}.cef-status-select{max-width:none;flex:1}}
    `;document.head.appendChild(st);
  }

  function gradoActual(){return document.querySelector('#cef-levels .cef-level.active')?.dataset.nivel||document.getElementById('cef-level-title')?.textContent?.trim()||''}

  function asegurarPanel(){
    const section=document.getElementById('section-cuadernillo-ef');
    const grid=document.getElementById('cef-grid');
    if(!section||!grid)return;
    estilos();
    if(document.getElementById('cef-progress-panel'))return;
    const p=document.createElement('div');p.id='cef-progress-panel';p.className='cef-progress-panel';p.innerHTML=`
      <div class="cef-progress-top"><div class="cef-progress-title"><i class="fa-solid fa-chart-line"></i><div><strong>Seguimiento curricular</strong><small id="cef-progress-caption">Controla el avance de los temas de este grado.</small></div></div><label class="cef-progress-filter">Ver <select id="cef-track-filter"><option>Todos</option>${STATUSES.map(s=>`<option>${s}</option>`).join('')}</select></label></div>
      <div class="cef-progress-stats">${STATUSES.map(s=>`<div class="cef-stat" data-s="${s}"><small>${s}</small><strong id="cef-stat-${s.toLowerCase()}">0</strong></div>`).join('')}</div>
      <div class="cef-progress-line"><span id="cef-progress-fill"></span></div>`;
    grid.parentElement.insertBefore(p,grid);
    p.querySelector('#cef-track-filter')?.addEventListener('change',e=>{filtroEstado=e.target.value;aplicarFiltro();actualizarResumen();});
  }

  function decorarTarjetas(){
    const grado=gradoActual();
    document.querySelectorAll('#cef-grid .cef-card').forEach(card=>{
      const tema=normaliza(card.querySelector('h4')?.textContent);
      if(!tema)return;
      const estado=estadoDe(grado,tema);
      card.dataset.trackGrado=grado;card.dataset.trackTema=tema;card.dataset.status=estado;
      let row=card.querySelector('.cef-status-row');
      if(!row){
        row=document.createElement('div');row.className='cef-status-row';
        row.innerHTML=`<span class="cef-status-label"><span class="cef-status-dot"></span> Estado curricular</span><select class="cef-status-select" aria-label="Estado de ${esc(tema)}">${STATUSES.map(s=>`<option value="${s}">${s}</option>`).join('')}</select>`;
        const actions=card.querySelector('.cef-actions');
        card.insertBefore(row,actions||null);
        const sel=row.querySelector('select');
        if(sel){
          sel.value=estado;
          sel.addEventListener('change',e=>{
            const nuevo=e.target.value;
            card.dataset.status=nuevo;
            setEstado(card.dataset.trackGrado||grado,card.dataset.trackTema||tema,nuevo);
          });
        }
      }else{
        const sel=row.querySelector('.cef-status-select');
        if(sel && document.activeElement!==sel && sel.value!==estado) sel.value=estado;
      }
      const plan=card.querySelector('[data-plan]');
      if(plan&&!plan.dataset.trackHook){plan.dataset.trackHook='1';plan.addEventListener('click',()=>{if(estadoDe(grado,tema)==='Pendiente')setEstado(grado,tema,'Planificado')},{capture:true});}
    });
  }

  function aplicarFiltro(){
    document.querySelectorAll('#cef-grid .cef-card').forEach(card=>{
      const ok=filtroEstado==='Todos'||card.dataset.status===filtroEstado;
      card.classList.toggle('cef-track-hidden',!ok);
    });
  }

  function actualizarResumen(){
    const grado=gradoActual();
    const cards=[...document.querySelectorAll('#cef-grid .cef-card')];
    const counts=Object.fromEntries(STATUSES.map(s=>[s,0]));
    cards.forEach(c=>{const s=c.dataset.status||'Pendiente';counts[s]=(counts[s]||0)+1;});
    STATUSES.forEach(s=>{const el=document.getElementById(`cef-stat-${s.toLowerCase()}`);if(el)el.textContent=counts[s]||0;});
    const total=cards.length,completados=(counts.Planificado||0)+(counts.Trabajado||0)+(counts.Evaluado||0);
    const pct=total?Math.round(completados*100/total):0;
    const fill=document.getElementById('cef-progress-fill');if(fill)fill.style.width=`${pct}%`;
    const cap=document.getElementById('cef-progress-caption');if(cap)cap.textContent=`${grado||'Grado'} · ${total} temas · ${pct}% con avance registrado`;
  }

  function actualizarTodo(){
    if(procesando)return;procesando=true;
    try{asegurarPanel();decorarTarjetas();aplicarFiltro();actualizarResumen();}finally{procesando=false;}
  }

  function iniciar(){
    const section=document.getElementById('section-cuadernillo-ef');
    if(!section)return false;
    actualizarTodo();
    if(!section.dataset.trackObserver){
      section.dataset.trackObserver='1';
      const obs=new MutationObserver(muts=>{
        const relevante=muts.some(m=>{
          const t=m.target?.nodeType===1?m.target:m.target?.parentElement;
          if(!t)return true;
          return !t.closest?.('.cef-status-row,#cef-progress-panel,.cef-history-modal');
        });
        if(relevante)setTimeout(actualizarTodo,0);
      });
      obs.observe(section,{childList:true,subtree:true});
    }
    document.getElementById('tab-cuadernillo-ef')?.addEventListener('click',()=>setTimeout(actualizarTodo,40));
    return true;
  }

  if(!iniciar()){let n=0;const tm=setInterval(()=>{n++;if(iniciar()||n>40)clearInterval(tm)},250);}
})();
/* EDUGESTION_CUADERNILLO_EF_FASE4_SEGUIMIENTO_END */

/* ================================================================
   EduGestión · Cuadernillo Educación Física · FASE 5
   Historial curricular + sincronización con Plan de evaluación
   ================================================================ */
(() => {
  const TRACK_KEY='edugestion_cuadernillo_ef_seguimiento_v1';
  const HISTORY_KEY='edugestion_cuadernillo_ef_historial_v1';
  const PLAN_KEY='edugestion_plan_evaluacion_ef_temas';
  const STYLE_ID='style-cuadernillo-historial-v1';
  const STATUSES=['Pendiente','Planificado','Trabajado','Evaluado'];
  const norm=s=>String(s||'').trim().replace(/\s+/g,' ');
  const key=(grado,tema)=>`${norm(grado)}|||${norm(tema)}`;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const readJSON=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(fallback))}catch(_){return fallback}};
  const saveJSON=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
  const toast=(msg,type='success')=>{if(typeof mostrarToast==='function')mostrarToast(msg,type,'Seguimiento curricular');};

  function addHistory(grado,tema,estado,accion,detalle=''){
    grado=norm(grado);tema=norm(tema);if(!grado||!tema)return;
    const all=readJSON(HISTORY_KEY,{}),k=key(grado,tema),list=Array.isArray(all[k])?all[k]:[];
    list.unshift({fecha:new Date().toISOString(),grado,tema,estado:estado||'',accion:accion||'Actualización',detalle:detalle||''});
    all[k]=list.slice(0,80);saveJSON(HISTORY_KEY,all);
  }

  function setTrack(grado,tema,estado,accion,detalle=''){
    if(!STATUSES.includes(estado))return;
    const data=readJSON(TRACK_KEY,{}),k=key(grado,tema),prev=data[k]?.estado||'Pendiente';
    data[k]={grado:norm(grado),tema:norm(tema),estado,actualizadoEn:new Date().toISOString()};
    saveJSON(TRACK_KEY,data);
    if(prev!==estado || accion)addHistory(grado,tema,estado,accion||`Estado cambiado de ${prev} a ${estado}`,detalle);
  }

  function styles(){
    if(document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');st.id=STYLE_ID;st.textContent=`
      .cef-history-btn{background:#f3efff!important;color:#6546a8!important}.cef-history-btn:hover{filter:brightness(.98)}
      .cef-history-modal{position:fixed;inset:0;background:rgba(10,24,38,.58);display:none;align-items:center;justify-content:center;padding:18px;z-index:99999}.cef-history-modal.open{display:flex}.cef-history-dialog{width:min(760px,96vw);max-height:88vh;overflow:auto;background:#fff;border-radius:20px;box-shadow:0 24px 70px rgba(0,0,0,.25);padding:0}.cef-history-head{position:sticky;top:0;background:#fff;z-index:2;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px;border-bottom:1px solid #dce6ef}.cef-history-head h3{margin:0;color:#1f3b53}.cef-history-head small{display:block;color:#6d8195;margin-top:4px}.cef-history-close{border:0;background:#edf3f8;color:#315169;width:38px;height:38px;border-radius:11px;cursor:pointer}.cef-history-body{padding:18px}.cef-history-empty{padding:26px;text-align:center;border:1px dashed #c7d5e2;border-radius:14px;color:#718498}.cef-history-list{display:flex;flex-direction:column;gap:10px}.cef-history-item{display:grid;grid-template-columns:132px 1fr;gap:12px;border:1px solid #dce6ef;border-radius:14px;padding:12px;background:#fbfdff}.cef-history-date{font-size:.78rem;font-weight:850;color:#6c8195}.cef-history-action strong{display:block;color:#213f58}.cef-history-action span{font-size:.84rem;color:#61778c;line-height:1.4}.cef-history-status{display:inline-flex;margin-top:6px;border-radius:999px;padding:4px 8px;background:#eef5fb;color:#245e88;font-size:.73rem;font-weight:900}
      .pev-track-choice{margin-top:12px;border:1px solid #cdddeb;background:#f7fbff;border-radius:13px;padding:11px 12px}.pev-track-choice label{display:block;font-weight:850;color:#34536d;font-size:.83rem;margin-bottom:7px}.pev-track-choice select{width:100%;border:1px solid #cbd9e6;background:#fff;color:#223a50;border-radius:10px;padding:9px 10px;font:inherit;font-weight:800}.pev-track-note{font-size:.78rem;color:#6d8195;margin-top:6px;line-height:1.4}
      .dark-mode .cef-history-dialog,.edugestion-dark .cef-history-dialog,.dark-mode .cef-history-head,.edugestion-dark .cef-history-head{background:#17283a}.dark-mode .cef-history-head,.edugestion-dark .cef-history-head,.dark-mode .cef-history-item,.edugestion-dark .cef-history-item{border-color:#3a5167}.dark-mode .cef-history-head h3,.edugestion-dark .cef-history-head h3,.dark-mode .cef-history-action strong,.edugestion-dark .cef-history-action strong{color:#edf5fb}.dark-mode .cef-history-item,.edugestion-dark .cef-history-item{background:#142536}.dark-mode .cef-history-action span,.edugestion-dark .cef-history-action span,.dark-mode .cef-history-date,.edugestion-dark .cef-history-date{color:#a8bac9}.dark-mode .pev-track-choice,.edugestion-dark .pev-track-choice{background:#17283a;border-color:#3d556c}.dark-mode .pev-track-choice label,.edugestion-dark .pev-track-choice label{color:#d9e6f1}.dark-mode .pev-track-choice select,.edugestion-dark .pev-track-choice select{background:#142536;border-color:#425b72;color:#edf5fb}
      @media(max-width:620px){.cef-history-item{grid-template-columns:1fr}.cef-history-dialog{max-height:92vh}}
    `;document.head.appendChild(st);
  }

  function ensureModal(){
    if(document.getElementById('cef-history-modal'))return;
    const m=document.createElement('div');m.id='cef-history-modal';m.className='cef-history-modal';m.innerHTML=`<div class="cef-history-dialog" role="dialog" aria-modal="true"><div class="cef-history-head"><div><h3 id="cef-history-title">Historial del tema</h3><small id="cef-history-sub"></small></div><button class="cef-history-close" id="cef-history-close" type="button"><i class="fa-solid fa-xmark"></i></button></div><div class="cef-history-body" id="cef-history-body"></div></div>`;
    document.body.appendChild(m);m.querySelector('#cef-history-close').addEventListener('click',()=>m.classList.remove('open'));m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')});
  }

  function showHistory(grado,tema){
    ensureModal();const m=document.getElementById('cef-history-modal'),body=document.getElementById('cef-history-body');
    document.getElementById('cef-history-title').textContent=tema;document.getElementById('cef-history-sub').textContent=`${grado} · Historial curricular`;
    const list=readJSON(HISTORY_KEY,{})[key(grado,tema)]||[];
    if(!list.length)body.innerHTML='<div class="cef-history-empty"><i class="fa-solid fa-clock-rotate-left"></i><h4>Sin movimientos todavía</h4><p>Los cambios de estado, planificaciones y planes de evaluación aparecerán aquí.</p></div>';
    else body.innerHTML=`<div class="cef-history-list">${list.map(x=>{const d=new Date(x.fecha);const fecha=Number.isNaN(d.getTime())?x.fecha:new Intl.DateTimeFormat('es-VE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d);return `<div class="cef-history-item"><div class="cef-history-date">${esc(fecha)}</div><div class="cef-history-action"><strong>${esc(x.accion)}</strong>${x.detalle?`<span>${esc(x.detalle)}</span>`:''}${x.estado?`<div class="cef-history-status">${esc(x.estado)}</div>`:''}</div></div>`}).join('')}</div>`;
    m.classList.add('open');
  }

  function currentGrade(){return document.querySelector('#cef-levels .cef-level.active')?.dataset.nivel||document.getElementById('cef-level-title')?.textContent?.trim()||'';}

  function decorateCards(){
    const grade=currentGrade();document.querySelectorAll('#cef-grid .cef-card').forEach(card=>{
      const tema=norm(card.querySelector('h4')?.textContent);if(!tema)return;
      const actions=card.querySelector('.cef-actions');if(actions&&!actions.querySelector('.cef-history-btn')){
        const b=document.createElement('button');b.type='button';b.className='cef-btn soft cef-history-btn';b.innerHTML='<i class="fa-solid fa-clock-rotate-left"></i> Historial';b.addEventListener('click',()=>showHistory(currentGrade(),tema));actions.appendChild(b);
      }
    });
  }

  function bindTrackingHistory(){
    const sec=document.getElementById('section-cuadernillo-ef');if(!sec||sec.dataset.historyTrackBound)return;
    sec.dataset.historyTrackBound='1';
    sec.addEventListener('change',e=>{
      const sel=e.target.closest?.('.cef-status-select');if(!sel)return;const card=sel.closest('.cef-card'),grado=card?.dataset.trackGrado||currentGrade(),tema=card?.dataset.trackTema||norm(card?.querySelector('h4')?.textContent);if(!tema)return;
      addHistory(grado,tema,sel.value,'Estado curricular actualizado','Cambio realizado manualmente desde el Cuadernillo Educación Física.');
    },true);
    sec.addEventListener('click',e=>{
      const card=e.target.closest?.('.cef-card');if(!card)return;const tema=norm(card.querySelector('h4')?.textContent),grado=currentGrade();if(!tema)return;
      if(e.target.closest('[data-plan]')) addHistory(grado,tema,'Planificado','Enviado a Planificación IA','El tema fue seleccionado como base curricular para preparar una planificación.');
      if(e.target.closest('[data-eval]')) addHistory(grado,tema,card.dataset.status||'Pendiente','Añadido al Plan de evaluación','El tema fue incorporado a la selección del plan de evaluación.');
    },true);
  }

  function ensurePlanChoice(){
    const sec=document.getElementById('section-plan-evaluacion-ef');if(!sec)return;
    const gen=sec.querySelector('#pev-generate');if(!gen)return;
    if(!sec.querySelector('#pev-track-after-generate')){
      const box=document.createElement('div');box.className='pev-track-choice';box.innerHTML=`<label for="pev-track-after-generate"><i class="fa-solid fa-rotate"></i> Al generar este plan, marcar los temas como</label><select id="pev-track-after-generate"><option value="Planificado" selected>Planificado</option><option value="Evaluado">Evaluado</option><option value="none">No cambiar el estado</option></select><div class="pev-track-note">Recomendado: “Planificado” cuando apenas estás preparando el plan. Usa “Evaluado” cuando la evaluación ya fue aplicada o quieres cerrar esos contenidos.</div>`;
      gen.closest('.pev-actions')?.insertAdjacentElement('beforebegin',box);
    }
    if(!gen.dataset.phase5Bound){
      gen.dataset.phase5Bound='1';gen.addEventListener('click',()=>{
        const topics=readJSON(PLAN_KEY,[]),estado=sec.querySelector('#pev-track-after-generate')?.value||'Planificado';if(!topics.length||estado==='none')return;
        topics.forEach(x=>setTrack(x.grado,x.tema,estado,estado==='Evaluado'?'Marcado como Evaluado desde Plan de evaluación':'Marcado como Planificado desde Plan de evaluación',`Actualización automática al generar el plan de evaluación.`));
        toast(`${topics.length} tema${topics.length===1?'':'s'} marcado${topics.length===1?'':'s'} como ${estado}.`);
      },true);
    }
  }

  function refresh(){styles();ensureModal();decorateCards();bindTrackingHistory();ensurePlanChoice();}
  function init(){refresh();const root=document.body;if(!root.dataset.cefHistoryObserver){root.dataset.cefHistoryObserver='1';new MutationObserver(()=>setTimeout(refresh,0)).observe(root,{childList:true,subtree:true});}document.getElementById('tab-cuadernillo-ef')?.addEventListener('click',()=>setTimeout(refresh,40));document.getElementById('tab-plan-evaluacion-ef')?.addEventListener('click',()=>setTimeout(refresh,40));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
/* EDUGESTION_CUADERNILLO_EF_FASE5_HISTORIAL_END */

/* ================================================================
   EduGestión · Cuadernillo Educación Física · FASE 6
   Resumen curricular general por grado/año
   ================================================================ */
(() => {
  const TAB_ID='tab-resumen-curricular-ef';
  const SECTION_ID='section-resumen-curricular-ef';
  const STYLE_ID='style-resumen-curricular-ef';
  const TRACK_KEY='edugestion_cuadernillo_ef_seguimiento_v1';
  const HISTORY_KEY='edugestion_cuadernillo_ef_historial_v1';
  const STATUSES=['Pendiente','Planificado','Trabajado','Evaluado'];
  const norm=s=>String(s||'').trim().replace(/\s+/g,' ');
  const key=(grado,tema)=>`${norm(grado)}|||${norm(tema)}`;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const readJSON=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(fallback))}catch(_){return fallback}};

  function styles(){
    if(document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');st.id=STYLE_ID;st.textContent=`
      #${SECTION_ID}{padding-bottom:30px}
      .rc-hero{border-radius:24px;padding:24px;background:linear-gradient(135deg,#173f6d,#287eaa);color:#fff;margin-bottom:18px}.rc-hero small{font-weight:900;letter-spacing:.08em;text-transform:uppercase}.rc-hero h2{margin:8px 0 6px;font-size:1.75rem}.rc-hero p{margin:0;opacity:.92;max-width:900px;line-height:1.55}
      .rc-overall{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:11px;margin-bottom:16px}.rc-kpi{border:1px solid var(--border-color,#d7e2ec);background:var(--card-bg,#fff);border-radius:16px;padding:14px}.rc-kpi small{display:block;color:#6f8295;font-weight:800}.rc-kpi strong{display:block;font-size:1.5rem;color:var(--text-color,#21384d);margin-top:3px}.rc-kpi.eval strong{color:#16775a}.rc-kpi.work strong{color:#9a6500}.rc-kpi.plan strong{color:#1f6faa}.rc-kpi.pending strong{color:#6d7680}
      .rc-toolbar{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:14px}.rc-filter{display:flex;gap:8px;flex-wrap:wrap}.rc-filter button,.rc-print{border:1px solid #cad8e5;background:var(--card-bg,#fff);color:#36516b;border-radius:999px;padding:8px 11px;font-weight:850;cursor:pointer}.rc-filter button.active{background:#1b6fa9;color:#fff;border-color:#1b6fa9}.rc-print{border-radius:11px}
      .rc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.rc-card{border:1px solid var(--border-color,#d7e2ec);background:var(--card-bg,#fff);border-radius:18px;padding:16px}.rc-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.rc-head h3{margin:0;color:var(--text-color,#21384d)}.rc-head button{border:0;background:#edf5fb;color:#165d8f;border-radius:10px;padding:8px 10px;font-weight:850;cursor:pointer}.rc-counts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:13px}.rc-count{border-radius:11px;padding:9px;background:#f5f8fb;text-align:center}.rc-count b{display:block;font-size:1.05rem;color:#28445e}.rc-count span{font-size:.72rem;color:#6b8095;font-weight:800}.rc-progress{height:10px;background:#e9eff4;border-radius:999px;overflow:hidden;margin-top:13px}.rc-progress > i{display:block;height:100%;background:#1f7eaa;border-radius:999px}.rc-foot{display:flex;justify-content:space-between;gap:8px;margin-top:7px;color:#6c8194;font-size:.8rem;font-weight:750}.rc-empty{grid-column:1/-1;border:1px dashed #bdcad7;border-radius:16px;padding:28px;text-align:center;color:#718497}
      .rc-history{margin-top:18px;border:1px solid var(--border-color,#d7e2ec);background:var(--card-bg,#fff);border-radius:18px;padding:16px}.rc-history h3{margin:0 0 11px;color:var(--text-color,#21384d)}.rc-history-list{display:flex;flex-direction:column;gap:8px}.rc-history-item{display:grid;grid-template-columns:130px 160px 1fr;gap:10px;padding:10px;border-radius:11px;background:#f6f9fc;font-size:.82rem}.rc-history-item b{color:#294760}.rc-history-item span{color:#657b8f}.dark-mode .rc-count,.edugestion-dark .rc-count,.dark-mode .rc-history-item,.edugestion-dark .rc-history-item{background:#1b2d40}.dark-mode .rc-filter button,.edugestion-dark .rc-filter button,.dark-mode .rc-print,.edugestion-dark .rc-print{background:#17283a;border-color:#3c546b;color:#e7f0f8}
      @media(max-width:900px){.rc-overall{grid-template-columns:repeat(2,1fr)}.rc-grid{grid-template-columns:1fr}.rc-history-item{grid-template-columns:1fr}}
      @media(max-width:520px){.rc-overall{grid-template-columns:1fr 1fr}.rc-counts{grid-template-columns:1fr 1fr}.rc-head{flex-direction:column}.rc-head button{width:100%}}
    `;document.head.appendChild(st);
  }

  function crear(){
    if(document.getElementById(SECTION_ID))return true;
    const nav=document.getElementById('app-nav')||document.querySelector('.app-sidebar nav');
    const main=document.getElementById('app-main')||document.querySelector('main');
    if(!nav||!main||!window.EDUGESTION_CEF_DATA)return false;
    styles();
    const tab=document.createElement('button');tab.id=TAB_ID;tab.type='button';tab.className='nav-item';tab.setAttribute('aria-selected','false');tab.dataset.title='Resumen curricular';tab.dataset.description='Consulta el avance general del Cuadernillo de Educación Física por grado y año.';tab.innerHTML='<i class="fa-solid fa-chart-pie"></i><span>Resumen curricular</span>';
    const ref=document.getElementById('tab-plan-evaluacion-ef')||document.getElementById('tab-cuadernillo-ef');if(ref?.nextSibling)nav.insertBefore(tab,ref.nextSibling);else nav.appendChild(tab);
    const sec=document.createElement('section');sec.id=SECTION_ID;sec.className='hidden';sec.innerHTML=`
      <header class="rc-hero"><small><i class="fa-solid fa-chart-pie"></i> Seguimiento general</small><h2>Resumen curricular de Educación Física</h2><p>Visualiza en una sola pantalla cuánto has planificado, trabajado y evaluado en cada grado o año del cuadernillo.</p></header>
      <div class="rc-overall" id="rc-overall"></div>
      <div class="rc-toolbar"><div class="rc-filter" id="rc-filters"><button type="button" class="active" data-filter="Todos">Todos</button><button type="button" data-filter="con-avance">Con avance</button><button type="button" data-filter="Pendiente">Solo pendientes</button><button type="button" data-filter="Evaluado">Con evaluados</button></div><button type="button" class="rc-print" id="rc-print"><i class="fa-solid fa-print"></i> Imprimir resumen</button></div>
      <div class="rc-grid" id="rc-grid"></div>
      <div class="rc-history"><h3><i class="fa-solid fa-clock-rotate-left"></i> Movimientos recientes</h3><div class="rc-history-list" id="rc-history-list"></div></div>`;
    main.appendChild(sec);
    tab.addEventListener('click',()=>abrir(tab,sec));
    sec.querySelectorAll('#rc-filters button').forEach(b=>b.addEventListener('click',()=>{sec.querySelectorAll('#rc-filters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');sec.dataset.filter=b.dataset.filter;render();}));
    sec.querySelector('#rc-print').addEventListener('click',imprimir);
    render();return true;
  }

  function abrir(tab,sec){document.querySelectorAll('.app-sidebar .nav-item,#app-nav .nav-item').forEach(x=>{x.classList.remove('is-active');x.setAttribute('aria-selected','false')});document.querySelectorAll('#app-main > section').forEach(x=>x.classList.add('hidden'));tab.classList.add('is-active');tab.setAttribute('aria-selected','true');sec.classList.remove('hidden');const t=document.getElementById('page-title'),d=document.getElementById('page-description');if(t)t.textContent=tab.dataset.title;if(d)d.textContent=tab.dataset.description;window.scrollTo({top:0,behavior:'smooth'});render();}

  function resumenNivel(grado,temas,track){
    const out={grado,total:temas.length,Pendiente:0,Planificado:0,Trabajado:0,Evaluado:0};
    temas.forEach(x=>{const estado=track[key(grado,x.tema)]?.estado||'Pendiente';out[STATUSES.includes(estado)?estado:'Pendiente']++;});
    out.avance=out.Planificado+out.Trabajado+out.Evaluado;out.pct=out.total?Math.round((out.avance/out.total)*100):0;return out;
  }

  function render(){
    const sec=document.getElementById(SECTION_ID),grid=document.getElementById('rc-grid'),overall=document.getElementById('rc-overall');if(!sec||!grid||!overall||!window.EDUGESTION_CEF_DATA)return;
    const data=window.EDUGESTION_CEF_DATA,track=readJSON(TRACK_KEY,{});const rows=Object.entries(data).map(([g,t])=>resumenNivel(g,t,track));
    const total=rows.reduce((a,x)=>a+x.total,0),pend=rows.reduce((a,x)=>a+x.Pendiente,0),plan=rows.reduce((a,x)=>a+x.Planificado,0),work=rows.reduce((a,x)=>a+x.Trabajado,0),evald=rows.reduce((a,x)=>a+x.Evaluado,0);
    overall.innerHTML=`<div class="rc-kpi"><small>Total de temas</small><strong>${total}</strong></div><div class="rc-kpi pending"><small>Pendientes</small><strong>${pend}</strong></div><div class="rc-kpi plan"><small>Planificados</small><strong>${plan}</strong></div><div class="rc-kpi work"><small>Trabajados</small><strong>${work}</strong></div><div class="rc-kpi eval"><small>Evaluados</small><strong>${evald}</strong></div>`;
    const f=sec.dataset.filter||'Todos';const shown=rows.filter(x=>f==='Todos'||(f==='con-avance'&&x.avance>0)||(f==='Pendiente'&&x.Pendiente>0)||(f==='Evaluado'&&x.Evaluado>0));
    if(!shown.length){grid.innerHTML='<div class="rc-empty"><i class="fa-solid fa-circle-info"></i><h4>No hay grados que coincidan con este filtro</h4></div>';}
    else grid.innerHTML=shown.map(x=>`<article class="rc-card"><div class="rc-head"><div><h3>${esc(x.grado)}</h3><div style="font-size:.8rem;color:#6d8194;margin-top:3px">${x.total} temas curriculares</div></div><button type="button" data-open-grade="${esc(x.grado)}"><i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir grado</button></div><div class="rc-counts"><div class="rc-count"><b>${x.Pendiente}</b><span>Pendientes</span></div><div class="rc-count"><b>${x.Planificado}</b><span>Planificados</span></div><div class="rc-count"><b>${x.Trabajado}</b><span>Trabajados</span></div><div class="rc-count"><b>${x.Evaluado}</b><span>Evaluados</span></div></div><div class="rc-progress"><i style="width:${x.pct}%"></i></div><div class="rc-foot"><span>Avance curricular</span><span>${x.avance}/${x.total} · ${x.pct}%</span></div></article>`).join('');
    grid.querySelectorAll('[data-open-grade]').forEach(b=>b.addEventListener('click',()=>abrirGrado(b.dataset.openGrade)));
    renderHistory();
  }

  function abrirGrado(grado){
    document.getElementById('tab-cuadernillo-ef')?.click();
    setTimeout(()=>{const btn=[...document.querySelectorAll('#cef-levels .cef-level')].find(x=>norm(x.dataset.nivel)===norm(grado));if(btn)btn.click();},120);
  }

  function renderHistory(){
    const box=document.getElementById('rc-history-list');if(!box)return;const all=readJSON(HISTORY_KEY,{}),items=[];Object.values(all).forEach(list=>{if(Array.isArray(list))items.push(...list)});items.sort((a,b)=>String(b.fecha||'').localeCompare(String(a.fecha||'')));const top=items.slice(0,8);
    if(!top.length){box.innerHTML='<div class="rc-empty"><i class="fa-solid fa-clock"></i><p>Aún no hay movimientos registrados.</p></div>';return;}
    box.innerHTML=top.map(x=>{const d=new Date(x.fecha);const fecha=Number.isNaN(d.getTime())?x.fecha:new Intl.DateTimeFormat('es-VE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d);return `<div class="rc-history-item"><b>${esc(fecha)}</b><span>${esc(x.grado||'')}</span><div><b>${esc(x.tema||'')}</b><br><span>${esc(x.accion||'Actualización')}${x.estado?` · ${esc(x.estado)}`:''}</span></div></div>`}).join('');
  }

  function imprimir(){
    const data=window.EDUGESTION_CEF_DATA||{},track=readJSON(TRACK_KEY,{}),rows=Object.entries(data).map(([g,t])=>resumenNivel(g,t,track));const w=window.open('','_blank','width=1050,height=800');if(!w)return;
    const filas=rows.map(x=>`<tr><td>${esc(x.grado)}</td><td>${x.total}</td><td>${x.Pendiente}</td><td>${x.Planificado}</td><td>${x.Trabajado}</td><td>${x.Evaluado}</td><td>${x.pct}%</td></tr>`).join('');
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Resumen curricular Educación Física</title><style>body{font-family:Arial,sans-serif;color:#1c2d3d;padding:28px}h1{margin-bottom:4px}p{color:#617487}table{width:100%;border-collapse:collapse;margin-top:22px}th,td{border:1px solid #cfd9e2;padding:9px;text-align:left}th{background:#eef4f8}@media print{button{display:none}}</style></head><body><h1>Resumen curricular de Educación Física</h1><p>Seguimiento del Cuadernillo Curricular MPPE en EduGestión.</p><table><thead><tr><th>Grado/Año</th><th>Total</th><th>Pendientes</th><th>Planificados</th><th>Trabajados</th><th>Evaluados</th><th>Avance</th></tr></thead><tbody>${filas}</tbody></table><p style="margin-top:20px;font-size:12px">Generado: ${new Intl.DateTimeFormat('es-VE',{dateStyle:'long',timeStyle:'short'}).format(new Date())}</p><button onclick="window.print()">Imprimir</button></body></html>`);w.document.close();setTimeout(()=>w.focus(),150);
  }

  function init(){try{return crear()}catch(e){console.warn('EduGestión Resumen Curricular EF:',e);return false}}
  if(!init()){let n=0;const tm=setInterval(()=>{n++;if(init()||n>30)clearInterval(tm)},250)}
  window.addEventListener('storage',()=>{if(document.getElementById(SECTION_ID)?.classList.contains('hidden')===false)render();});
})();
/* EDUGESTION_CUADERNILLO_EF_FASE6_RESUMEN_END */


/* ================================================================
   EduGestión · Cuadernillo Educación Física · FASE 7
   Panel por lapso + organización de temas + planificación IA del lapso
   ================================================================ */
(() => {
  const TAB_ID='tab-panel-lapsos-ef';
  const SECTION_ID='section-panel-lapsos-ef';
  const STYLE_ID='style-panel-lapsos-ef';
  const ASSIGN_KEY='edugestion_cuadernillo_ef_lapsos_v1';
  const TRACK_KEY='edugestion_cuadernillo_ef_seguimiento_v1';
  const HISTORY_KEY='edugestion_cuadernillo_ef_historial_v1';
  const SELECT_KEY='edugestion_cuadernillo_ef_seleccion';
  const LAPSOS=['1er Lapso','2do Lapso','3er Lapso'];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').trim().replace(/\s+/g,' ');
  const topicKey=(grado,tema)=>`${norm(grado)}|||${norm(tema)}`;
  const readJSON=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch(_){return f}};
  const writeJSON=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  let gradoActual='';
  let lapsoActual='1er Lapso';
  let filtroEstado='Todos';

  function styles(){
    if(document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');st.id=STYLE_ID;st.textContent=`
      #${SECTION_ID}{padding-bottom:34px}.pl-hero{border-radius:25px;padding:25px 28px;background:linear-gradient(135deg,#0d5377,#1587a9);color:#fff;margin-bottom:18px}.pl-hero small{font-weight:900;letter-spacing:.08em;text-transform:uppercase}.pl-hero h2{margin:7px 0 6px;font-size:1.8rem}.pl-hero p{margin:0;line-height:1.55;max-width:900px;opacity:.94}
      .pl-toolbar{border:1px solid var(--border-color,#d5e1eb);background:var(--card-bg,#fff);border-radius:20px;padding:15px;margin-bottom:15px}.pl-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.pl-row+.pl-row{margin-top:11px}.pl-grade{min-width:210px;border:1px solid #c9d8e5;border-radius:12px;padding:10px 12px;background:var(--card-bg,#fff);color:var(--text-color,#23384c);font:inherit;font-weight:800}.pl-lapsos,.pl-statusfilters{display:flex;gap:7px;flex-wrap:wrap}.pl-pill{border:1px solid #c8d7e4;background:var(--card-bg,#fff);color:#34536d;border-radius:999px;padding:8px 11px;font-weight:850;cursor:pointer}.pl-pill.active{background:#176f9f;color:#fff;border-color:#176f9f}.pl-actions-top{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}.pl-action{border:0;border-radius:11px;padding:10px 12px;font-weight:850;cursor:pointer}.pl-action.primary{background:#176f9f;color:#fff}.pl-action.soft{background:#edf5f9;color:#155a7f}.pl-action.warn{background:#fff3df;color:#8a5b00}.pl-action:disabled{opacity:.5;cursor:not-allowed}
      .pl-summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px;margin:14px 0}.pl-kpi{border:1px solid var(--border-color,#d7e2eb);background:var(--card-bg,#fff);border-radius:14px;padding:12px}.pl-kpi small{display:block;color:#6f8193;font-weight:800}.pl-kpi strong{display:block;font-size:1.35rem;margin-top:2px;color:var(--text-color,#23384c)}
      .pl-list{display:flex;flex-direction:column;gap:10px}.pl-item{border:1px solid var(--border-color,#d7e2eb);background:var(--card-bg,#fff);border-radius:17px;padding:14px;display:grid;grid-template-columns:minmax(0,1fr) 170px 155px;gap:12px;align-items:center}.pl-item h4{margin:0 0 5px;color:var(--text-color,#21384d);font-size:1rem}.pl-meta{display:flex;gap:7px;flex-wrap:wrap}.pl-chip{font-size:.74rem;border-radius:999px;padding:4px 8px;font-weight:850;background:#eef4f8;color:#536d83}.pl-chip.Pendiente{background:#f0f2f4;color:#65717c}.pl-chip.Planificado{background:#e8f4ff;color:#176aa0}.pl-chip.Trabajado{background:#fff3dc;color:#946100}.pl-chip.Evaluado{background:#e5f7ef;color:#167354}.pl-desc{margin:7px 0 0;color:#687d90;line-height:1.42;font-size:.87rem}.pl-select{width:100%;border:1px solid #cbd9e5;border-radius:10px;padding:9px;background:var(--card-bg,#fff);color:var(--text-color,#23384c);font:inherit}.pl-item-actions{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}.pl-small{border:0;border-radius:9px;padding:8px 9px;background:#edf5f9;color:#165d82;font-weight:800;cursor:pointer}.pl-empty{border:1px dashed #bdcbd7;border-radius:17px;padding:30px;text-align:center;color:#738697}.pl-note{margin-top:13px;border-radius:14px;padding:12px 14px;background:#edf8f2;color:#236e50;font-size:.86rem;line-height:1.45}.dark-mode .pl-chip,.edugestion-dark .pl-chip{background:#23374a;color:#d7e5f1}.dark-mode .pl-action.soft,.edugestion-dark .pl-action.soft,.dark-mode .pl-small,.edugestion-dark .pl-small{background:#21364a;color:#d7e9f5}
      @media(max-width:900px){.pl-summary{grid-template-columns:repeat(2,1fr)}.pl-item{grid-template-columns:1fr}.pl-item-actions{justify-content:flex-start}.pl-actions-top{margin-left:0}}
      @media(max-width:520px){.pl-summary{grid-template-columns:1fr 1fr}.pl-grade{width:100%}.pl-action{width:100%}.pl-actions-top{width:100%}}
    `;document.head.appendChild(st);
  }

  function assignmentMap(){return readJSON(ASSIGN_KEY,{})}
  function trackMap(){return readJSON(TRACK_KEY,{})}
  function historyMap(){return readJSON(HISTORY_KEY,{})}
  function setAssignment(grado,tema,lapso){
    const m=assignmentMap(),k=topicKey(grado,tema),prev=m[k]||'';
    if(lapso)m[k]=lapso;else delete m[k];writeJSON(ASSIGN_KEY,m);
    if(prev!==lapso)addHistory(grado,tema,trackMap()[k]?.estado||'Pendiente','Cambio de lapso',lapso?`Tema asignado a ${lapso}.`:'Tema dejado sin lapso asignado.');
  }
  function addHistory(grado,tema,estado,accion,detalle){const all=historyMap(),k=topicKey(grado,tema);if(!Array.isArray(all[k]))all[k]=[];all[k].push({fecha:new Date().toISOString(),grado,tema,estado,accion,detalle});if(all[k].length>80)all[k]=all[k].slice(-80);writeJSON(HISTORY_KEY,all)}

  function create(){
    if(document.getElementById(SECTION_ID))return true;
    const nav=document.getElementById('app-nav')||document.querySelector('.app-sidebar nav');
    const main=document.getElementById('app-main')||document.querySelector('main');
    const data=window.EDUGESTION_CEF_DATA;if(!nav||!main||!data)return false;
    styles();gradoActual=gradoActual||Object.keys(data)[0]||'';
    const tab=document.createElement('button');tab.id=TAB_ID;tab.type='button';tab.className='nav-item';tab.setAttribute('aria-selected','false');tab.dataset.title='Panel por lapso';tab.dataset.description='Organiza los temas del Cuadernillo de Educación Física por lapso y prepara planificaciones con IA.';tab.innerHTML='<i class="fa-solid fa-calendar-week"></i><span>Panel por lapso</span>';
    const ref=document.getElementById('tab-resumen-curricular-ef')||document.getElementById('tab-plan-evaluacion-ef')||document.getElementById('tab-cuadernillo-ef');if(ref?.nextSibling)nav.insertBefore(tab,ref.nextSibling);else nav.appendChild(tab);
    const sec=document.createElement('section');sec.id=SECTION_ID;sec.className='hidden';sec.innerHTML=`
      <header class="pl-hero"><small><i class="fa-solid fa-calendar-week"></i> Organización del año escolar</small><h2>Panel curricular por lapso</h2><p>Distribuye los temas del cuadernillo entre 1er, 2do y 3er lapso. Puedes moverlos cuando quieras y generar una planificación con IA usando únicamente los temas asignados al período seleccionado.</p></header>
      <div class="pl-toolbar"><div class="pl-row"><select class="pl-grade" id="pl-grade"></select><div class="pl-lapsos" id="pl-lapsos"></div><div class="pl-actions-top"><button class="pl-action soft" id="pl-open-grade"><i class="fa-solid fa-book-open"></i> Abrir en cuadernillo</button><button class="pl-action primary" id="pl-plan-lapso"><i class="fa-solid fa-wand-magic-sparkles"></i> Planificar lapso con IA</button></div></div><div class="pl-row"><strong style="color:var(--text-color,#24384c)">Filtrar estado:</strong><div class="pl-statusfilters" id="pl-statusfilters"></div></div></div>
      <div class="pl-summary" id="pl-summary"></div><div class="pl-list" id="pl-list"></div><div class="pl-note"><i class="fa-solid fa-circle-info"></i> El lapso es una organización interna de EduGestión. No modifica el contenido curricular original del cuadernillo.</div>`;
    main.appendChild(sec);
    tab.addEventListener('click',()=>openSection(tab,sec));
    const gs=sec.querySelector('#pl-grade');gs.innerHTML=Object.keys(data).map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join('');gs.value=gradoActual;gs.addEventListener('change',()=>{gradoActual=gs.value;render()});
    sec.querySelector('#pl-open-grade').addEventListener('click',openGrade);
    sec.querySelector('#pl-plan-lapso').addEventListener('click',planLapso);
    renderLapsos();renderStatusFilters();render();return true;
  }
  function openSection(tab,sec){document.querySelectorAll('.app-sidebar .nav-item,#app-nav .nav-item').forEach(x=>{x.classList.remove('is-active');x.setAttribute('aria-selected','false')});document.querySelectorAll('#app-main > section').forEach(x=>x.classList.add('hidden'));tab.classList.add('is-active');tab.setAttribute('aria-selected','true');sec.classList.remove('hidden');const t=document.getElementById('page-title'),d=document.getElementById('page-description');if(t)t.textContent=tab.dataset.title;if(d)d.textContent=tab.dataset.description;window.scrollTo({top:0,behavior:'smooth'});render()}
  function renderLapsos(){const box=document.getElementById('pl-lapsos');if(!box)return;box.innerHTML=LAPSOS.map(l=>`<button type="button" class="pl-pill ${l===lapsoActual?'active':''}" data-lapso="${l}">${l}</button>`).join('');box.querySelectorAll('[data-lapso]').forEach(b=>b.addEventListener('click',()=>{lapsoActual=b.dataset.lapso;renderLapsos();render()}))}
  function renderStatusFilters(){const box=document.getElementById('pl-statusfilters');if(!box)return;const opts=['Todos','Pendiente','Planificado','Trabajado','Evaluado'];box.innerHTML=opts.map(s=>`<button type="button" class="pl-pill ${s===filtroEstado?'active':''}" data-status="${s}">${s}</button>`).join('');box.querySelectorAll('[data-status]').forEach(b=>b.addEventListener('click',()=>{filtroEstado=b.dataset.status;renderStatusFilters();render()}))}
  function rowsForGrade(){const data=window.EDUGESTION_CEF_DATA||{},assign=assignmentMap(),track=trackMap();return (data[gradoActual]||[]).map(x=>{const k=topicKey(gradoActual,x.tema);return {...x,grado:gradoActual,lapso:assign[k]||'',estado:track[k]?.estado||'Pendiente'}})}
  function render(){
    const list=document.getElementById('pl-list'),sum=document.getElementById('pl-summary');if(!list||!sum)return;
    const all=rowsForGrade(),inLapso=all.filter(x=>x.lapso===lapsoActual),shown=inLapso.filter(x=>filtroEstado==='Todos'||x.estado===filtroEstado),unassigned=all.filter(x=>!x.lapso).length;
    const counts={Pendiente:0,Planificado:0,Trabajado:0,Evaluado:0};inLapso.forEach(x=>counts[x.estado]=(counts[x.estado]||0)+1);
    sum.innerHTML=`<div class="pl-kpi"><small>Temas en ${esc(lapsoActual)}</small><strong>${inLapso.length}</strong></div><div class="pl-kpi"><small>Pendientes</small><strong>${counts.Pendiente||0}</strong></div><div class="pl-kpi"><small>Planificados</small><strong>${counts.Planificado||0}</strong></div><div class="pl-kpi"><small>Trabajados / Evaluados</small><strong>${(counts.Trabajado||0)+(counts.Evaluado||0)}</strong></div><div class="pl-kpi"><small>Sin asignar</small><strong>${unassigned}</strong></div>`;
    const plan=document.getElementById('pl-plan-lapso');if(plan)plan.disabled=!inLapso.length;
    if(!shown.length){list.innerHTML=`<div class="pl-empty"><i class="fa-solid fa-folder-open"></i><h4>${inLapso.length?'No hay temas con ese estado':'Este lapso todavía no tiene temas'}</h4><p>${inLapso.length?'Cambia el filtro de estado para ver otros contenidos.':'Usa el selector de lapso en los temas del cuadernillo o asigna temas desde aquí cambiando primero a “Todos” y usando los temas sin asignar desde el botón de administración.'}</p><button type="button" class="pl-action soft" id="pl-show-unassigned">Ver temas sin asignar</button></div>`;document.getElementById('pl-show-unassigned')?.addEventListener('click',showUnassigned);return}
    list.innerHTML=shown.map((x,i)=>itemHtml(x,i)).join('');bindItems(list,shown);
  }
  function itemHtml(x,i){const desc=x.descripcion||x.tejido||x.referentes||'';return `<article class="pl-item"><div><h4>${esc(x.tema)}</h4><div class="pl-meta"><span class="pl-chip ${esc(x.estado)}">${esc(x.estado)}</span>${x.pagina?`<span class="pl-chip">p. ${esc(x.pagina)}</span>`:''}</div>${desc?`<p class="pl-desc">${esc(desc.slice(0,180))}${desc.length>180?'…':''}</p>`:''}</div><div><select class="pl-select" data-assign="${i}"><option value="">Sin asignar</option>${LAPSOS.map(l=>`<option value="${l}" ${x.lapso===l?'selected':''}>${l}</option>`).join('')}</select></div><div class="pl-item-actions"><button type="button" class="pl-small" data-open="${i}"><i class="fa-solid fa-book-open"></i> Ver tema</button><button type="button" class="pl-small" data-plan="${i}"><i class="fa-solid fa-wand-magic-sparkles"></i> Planificar</button></div></article>`}
  function bindItems(root,arr){root.querySelectorAll('[data-assign]').forEach(s=>s.addEventListener('change',()=>{const x=arr[Number(s.dataset.assign)];setAssignment(x.grado,x.tema,s.value);render()}));root.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openTopic(arr[Number(b.dataset.open)])));root.querySelectorAll('[data-plan]').forEach(b=>b.addEventListener('click',()=>sendSingle(arr[Number(b.dataset.plan)])))}
  function showUnassigned(){const list=document.getElementById('pl-list');if(!list)return;const arr=rowsForGrade().filter(x=>!x.lapso);if(!arr.length){list.innerHTML='<div class="pl-empty"><h4>Todos los temas ya tienen lapso asignado</h4></div>';return}list.innerHTML=`<div style="font-weight:900;color:var(--text-color,#24384c);margin-bottom:2px">Temas sin asignar · ${esc(gradoActual)}</div>`+arr.map((x,i)=>itemHtml(x,i)).join('');bindItems(list,arr)}
  function openGrade(){document.getElementById('tab-cuadernillo-ef')?.click();setTimeout(()=>{const b=[...document.querySelectorAll('#cef-levels .cef-level')].find(x=>norm(x.dataset.nivel)===norm(gradoActual));b?.click()},120)}
  function openTopic(x){openGrade();setTimeout(()=>{const cards=[...document.querySelectorAll('#cef-grid .cef-card')];const c=cards.find(el=>norm(el.querySelector('h4')?.textContent)===norm(x.tema));c?.querySelector('[data-ver]')?.click()},250)}
  function sendSingle(x){const synthetic={...x,grado:gradoActual,fuente:'Cuadernillo Curricular MPPE · Educación Física',seleccionadoEn:new Date().toISOString()};writeJSON(SELECT_KEY,synthetic);document.getElementById('tab-planificacion')?.click();setTimeout(()=>fillPlanning(synthetic),180)}
  function planLapso(){
    const topics=rowsForGrade().filter(x=>x.lapso===lapsoActual);if(!topics.length)return;
    const temaCompuesto=`${lapsoActual} · ${gradoActual} · ${topics.map(x=>x.tema).join(' + ')}`;
    const block=t=>`${t.tema}${t.intencionalidad?`\nIntencionalidad: ${t.intencionalidad}`:''}${t.tejido?`\nTejido temático: ${t.tejido}`:''}${t.referentes?`\nReferentes: ${t.referentes}`:''}`;
    const synthetic={grado:gradoActual,tema:temaCompuesto,pagina:'varias',temaIndispensable:'',intencionalidad:`Planificar el ${lapsoActual} integrando los temas curriculares seleccionados sin alterar su contenido oficial.`,tejido:topics.map(block).join('\n\n---\n\n'),referentes:'',fuente:'Cuadernillo Curricular MPPE · Educación Física',lapso:lapsoActual,seleccionadoEn:new Date().toISOString()};
    writeJSON(SELECT_KEY,synthetic);topics.forEach(t=>addHistory(gradoActual,t.tema,t.estado,'Incluido en planificación del lapso',`Incluido en la planificación IA del ${lapsoActual}.`));document.getElementById('tab-planificacion')?.click();setTimeout(()=>fillPlanning(synthetic,true),180)
  }
  function fillPlanning(s,fromLapso=false){
    const grado=document.getElementById('plan-ia-grado'),area=document.getElementById('plan-ia-area'),tema=document.getElementById('plan-ia-tema'),obj=document.getElementById('plan-ia-objetivo');if(grado){const opts=[...(grado.options||[])],m=opts.find(o=>o.value===s.grado||norm(o.textContent)===norm(s.grado));if(m)grado.value=m.value;else if(grado.tagName==='INPUT')grado.value=s.grado}if(area)area.value='Educación Física';if(tema)tema.value=s.tema;if(obj)obj.value=s.intencionalidad||'';
    const sec=document.getElementById('section-planificacion');if(sec){let panel=document.getElementById('plan-lapso-base');if(!panel){panel=document.createElement('div');panel.id='plan-lapso-base';panel.className='card';panel.style.cssText='margin:0 0 18px;padding:18px;border:1px solid var(--border-color,#d9e2ec);border-radius:18px;background:var(--card-bg,#fff)';const form=document.getElementById('btn-planificacion-ia')?.closest('.card')||document.getElementById('btn-planificacion-ia')?.parentElement;sec.insertBefore(panel,form||sec.firstChild)}panel.innerHTML=`<div style="font-size:.78rem;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#1476b8"><i class="fa-solid fa-calendar-week"></i> Base curricular ${fromLapso?'del lapso':'seleccionada'}</div><h3 style="margin:6px 0 5px">${esc(s.grado)}${s.lapso?` · ${esc(s.lapso)}`:''}</h3><div style="font-weight:800;margin-bottom:8px">${esc(s.tema)}</div><div style="font-size:.86rem;color:#64748b">La IA utilizará esta selección como base curricular obligatoria del Cuadernillo de Educación Física.</div>`}
    window.scrollTo({top:0,behavior:'smooth'});if(typeof mostrarToast==='function')mostrarToast(fromLapso?`Se cargaron ${rowsForGrade().filter(x=>x.lapso===lapsoActual).length} temas del ${lapsoActual}.`:'Tema cargado desde el panel por lapso.','success','Planificación IA')
  }
  function init(){try{return create()}catch(e){console.warn('EduGestión Panel por Lapso EF:',e);return false}}
  if(!init()){let n=0;const tm=setInterval(()=>{n++;if(init()||n>35)clearInterval(tm)},250)}
  window.addEventListener('storage',()=>{if(!document.getElementById(SECTION_ID)?.classList.contains('hidden'))render()});
})();
/* EDUGESTION_CUADERNILLO_EF_FASE7_LAPSOS_END */

/* ================================================================
   EduGestión · Cuadernillo Educación Física · FASE 8
   Plan anual de Educación Física
   ================================================================ */
(() => {
  const TAB_ID='tab-plan-anual-ef';
  const SECTION_ID='section-plan-anual-ef';
  const STYLE_ID='style-plan-anual-ef';
  const ASSIGN_KEY='edugestion_cuadernillo_ef_lapsos_v1';
  const TRACK_KEY='edugestion_cuadernillo_ef_seguimiento_v1';
  const HISTORY_KEY='edugestion_cuadernillo_ef_historial_v1';
  const SELECT_KEY='edugestion_cuadernillo_ef_seleccion';
  const LAPSOS=['1er Lapso','2do Lapso','3er Lapso'];
  const norm=s=>String(s||'').trim().replace(/\s+/g,' ');
  const key=(g,t)=>`${norm(g)}|||${norm(t)}`;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const readJSON=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch(_){return f}};
  const writeJSON=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  let gradoActual='';

  function styles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      #${SECTION_ID}{padding-bottom:34px}.pa-hero{border-radius:24px;padding:24px;background:linear-gradient(135deg,#223b6e,#386fa4);color:#fff;margin-bottom:18px}.pa-hero small{font-weight:900;letter-spacing:.08em;text-transform:uppercase}.pa-hero h2{margin:7px 0 6px;font-size:1.8rem}.pa-hero p{margin:0;opacity:.93;max-width:980px;line-height:1.55}
      .pa-controls{display:grid;grid-template-columns:1.1fr repeat(3,1fr);gap:10px;margin-bottom:15px}.pa-field{border:1px solid var(--border-color,#d8e2ec);background:var(--card-bg,#fff);border-radius:14px;padding:11px}.pa-field label{display:block;font-size:.74rem;font-weight:900;color:#60758a;margin-bottom:5px}.pa-field select,.pa-field input{width:100%;border:1px solid #cbd8e5;background:var(--card-bg,#fff);color:var(--text-color,#25394d);border-radius:10px;padding:9px 10px;outline:none}
      .pa-summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:15px}.pa-kpi{border:1px solid var(--border-color,#d8e2ec);background:var(--card-bg,#fff);border-radius:15px;padding:13px}.pa-kpi small{display:block;font-size:.72rem;font-weight:850;color:#72879a}.pa-kpi strong{display:block;font-size:1.45rem;color:var(--text-color,#24394e);margin-top:2px}.pa-kpi.warn strong{color:#b36a00}.pa-kpi.good strong{color:#177156}
      .pa-actions{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:15px}.pa-btn{border:0;border-radius:11px;padding:10px 14px;font-weight:900;cursor:pointer}.pa-btn.primary{background:#176ea7;color:#fff}.pa-btn.soft{background:#edf5fb;color:#195e8c}.pa-btn.print{background:#eff6f1;color:#19664e}.pa-btn:disabled{opacity:.5;cursor:not-allowed}
      .pa-lapsos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.pa-lapso{border:1px solid var(--border-color,#d8e2ec);background:var(--card-bg,#fff);border-radius:18px;overflow:hidden}.pa-lapso-head{padding:14px 15px;background:#f3f8fc;border-bottom:1px solid var(--border-color,#d8e2ec)}.pa-lapso-head h3{margin:0;color:var(--text-color,#24394e);font-size:1rem}.pa-lapso-head small{color:#6c8194;font-weight:800}.pa-topic-list{padding:10px;display:flex;flex-direction:column;gap:8px}.pa-topic{border:1px solid #e0e8ef;border-radius:12px;padding:10px}.pa-topic h4{margin:0 0 6px;font-size:.88rem;color:var(--text-color,#273b4e)}.pa-meta{display:flex;gap:6px;flex-wrap:wrap}.pa-chip{font-size:.68rem;font-weight:850;border-radius:999px;padding:4px 7px;background:#eef3f7;color:#5d7184}.pa-chip.Evaluado{background:#e8f6ef;color:#176849}.pa-chip.Trabajado{background:#fff5df;color:#9a6200}.pa-chip.Planificado{background:#e8f3fb;color:#196b9c}.pa-empty{padding:22px;text-align:center;color:#71869a;font-size:.82rem}
      .pa-note{margin-top:14px;border:1px dashed #b8c9d8;background:var(--card-bg,#fff);border-radius:14px;padding:12px;color:#63788c;font-size:.82rem;line-height:1.45}.pa-note.warn{border-color:#e0b77d;background:#fff9ef;color:#8c5b12}
      .dark-mode .pa-lapso-head,.edugestion-dark .pa-lapso-head{background:#1b2e40}.dark-mode .pa-topic,.edugestion-dark .pa-topic{border-color:#3d5367}.dark-mode .pa-btn.soft,.edugestion-dark .pa-btn.soft{background:#1b3448;color:#d9edfa}.dark-mode .pa-btn.print,.edugestion-dark .pa-btn.print{background:#17352e;color:#d8f3e9}
      @media(max-width:1000px){.pa-controls{grid-template-columns:1fr 1fr}.pa-summary{grid-template-columns:repeat(3,1fr)}.pa-lapsos{grid-template-columns:1fr}}
      @media(max-width:600px){.pa-controls{grid-template-columns:1fr}.pa-summary{grid-template-columns:1fr 1fr}.pa-actions .pa-btn{width:100%}}
    `;document.head.appendChild(s);
  }

  function assignments(){return readJSON(ASSIGN_KEY,{})}
  function track(){return readJSON(TRACK_KEY,{})}
  function history(){return readJSON(HISTORY_KEY,{})}
  function addHistory(grado,tema,estado,accion,detalle){const all=history(),k=key(grado,tema);if(!Array.isArray(all[k]))all[k]=[];all[k].push({fecha:new Date().toISOString(),grado,tema,estado,accion,detalle});if(all[k].length>80)all[k]=all[k].slice(-80);writeJSON(HISTORY_KEY,all)}

  function rows(){
    const data=window.EDUGESTION_CEF_DATA||{},a=assignments(),tr=track();
    return (data[gradoActual]||[]).map(x=>{const k=key(gradoActual,x.tema);return {...x,grado:gradoActual,lapso:a[k]||'',estado:tr[k]?.estado||'Pendiente'}})
  }

  function create(){
    if(document.getElementById(SECTION_ID))return true;
    const data=window.EDUGESTION_CEF_DATA,nav=document.getElementById('app-nav')||document.querySelector('.app-sidebar nav'),main=document.getElementById('app-main')||document.querySelector('main');
    if(!data||!nav||!main)return false;styles();gradoActual=gradoActual||Object.keys(data)[0]||'';
    const tab=document.createElement('button');tab.id=TAB_ID;tab.type='button';tab.className='nav-item';tab.setAttribute('aria-selected','false');tab.dataset.title='Plan anual Educación Física';tab.dataset.description='Organiza y genera una visión anual a partir de los tres lapsos del cuadernillo curricular.';tab.innerHTML='<i class="fa-solid fa-calendar-days"></i><span>Plan anual Educación Física</span>';
    const ref=document.getElementById('tab-panel-lapsos-ef')||document.getElementById('tab-resumen-curricular-ef')||document.getElementById('tab-cuadernillo-ef');if(ref?.nextSibling)nav.insertBefore(tab,ref.nextSibling);else nav.appendChild(tab);
    const sec=document.createElement('section');sec.id=SECTION_ID;sec.className='hidden';sec.innerHTML=`
      <header class="pa-hero"><small><i class="fa-solid fa-calendar-days"></i> Fase 8 · Organización anual</small><h2>Plan anual de Educación Física</h2><p>Reúne los temas de los tres lapsos de un grado o año, muestra el avance curricular y prepara una base anual para generar con IA una planificación coherente con el Cuadernillo Curricular.</p></header>
      <div class="pa-controls"><div class="pa-field"><label>Grado / año</label><select id="pa-grade"></select></div><div class="pa-field"><label>Institución</label><input id="pa-inst" placeholder="Nombre de la institución"></div><div class="pa-field"><label>Docente</label><input id="pa-doc" placeholder="Nombre del docente"></div><div class="pa-field"><label>Año escolar</label><input id="pa-year" value="2026 - 2027" placeholder="2026 - 2027"></div></div>
      <div class="pa-summary" id="pa-summary"></div>
      <div class="pa-actions"><button class="pa-btn primary" id="pa-generate"><i class="fa-solid fa-wand-magic-sparkles"></i> Crear plan anual con IA</button><button class="pa-btn soft" id="pa-open-lapsos"><i class="fa-solid fa-table-columns"></i> Organizar lapsos</button><button class="pa-btn print" id="pa-print"><i class="fa-solid fa-print"></i> Imprimir vista anual</button></div>
      <div class="pa-lapsos" id="pa-lapsos"></div><div class="pa-note" id="pa-note"></div>`;
    main.appendChild(sec);tab.addEventListener('click',()=>open(tab,sec));
    const sel=sec.querySelector('#pa-grade');sel.innerHTML=Object.keys(data).map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join('');sel.value=gradoActual;sel.addEventListener('change',()=>{gradoActual=sel.value;render()});
    sec.querySelector('#pa-open-lapsos').addEventListener('click',()=>{document.getElementById('tab-panel-lapsos-ef')?.click()});
    sec.querySelector('#pa-generate').addEventListener('click',generateAnnual);
    sec.querySelector('#pa-print').addEventListener('click',printAnnual);
    render();return true;
  }

  function open(tab,sec){document.querySelectorAll('.app-sidebar .nav-item,#app-nav .nav-item').forEach(x=>{x.classList.remove('is-active');x.setAttribute('aria-selected','false')});document.querySelectorAll('#app-main > section').forEach(x=>x.classList.add('hidden'));tab.classList.add('is-active');tab.setAttribute('aria-selected','true');sec.classList.remove('hidden');const t=document.getElementById('page-title'),d=document.getElementById('page-description');if(t)t.textContent=tab.dataset.title;if(d)d.textContent=tab.dataset.description;render();window.scrollTo({top:0,behavior:'smooth'})}

  function render(){
    const all=rows(),assigned=all.filter(x=>x.lapso),unassigned=all.filter(x=>!x.lapso),status={Pendiente:0,Planificado:0,Trabajado:0,Evaluado:0};all.forEach(x=>status[x.estado]=(status[x.estado]||0)+1);
    const done=(status.Trabajado||0)+(status.Evaluado||0),pct=all.length?Math.round((done/all.length)*100):0;
    const sum=document.getElementById('pa-summary');if(sum)sum.innerHTML=`<div class="pa-kpi"><small>Total de temas</small><strong>${all.length}</strong></div><div class="pa-kpi"><small>Asignados a lapsos</small><strong>${assigned.length}</strong></div><div class="pa-kpi warn"><small>Sin asignar</small><strong>${unassigned.length}</strong></div><div class="pa-kpi"><small>Trabajados / Evaluados</small><strong>${done}</strong></div><div class="pa-kpi good"><small>Avance anual</small><strong>${pct}%</strong></div>`;
    const box=document.getElementById('pa-lapsos');if(box)box.innerHTML=LAPSOS.map(l=>lapsoHtml(l,all.filter(x=>x.lapso===l))).join('');
    const note=document.getElementById('pa-note');if(note){if(unassigned.length){note.className='pa-note warn';note.innerHTML=`<b><i class="fa-solid fa-triangle-exclamation"></i> Faltan ${unassigned.length} tema${unassigned.length===1?'':'s'} por asignar.</b> Para que el plan anual quede completo, entra en <b>Panel por lapso</b> y distribuye esos contenidos entre 1er, 2do y 3er Lapso.`}else{note.className='pa-note';note.innerHTML='<b><i class="fa-solid fa-circle-check"></i> Distribución completa.</b> Todos los temas de este grado/año ya están asignados a un lapso y pueden utilizarse para generar el plan anual.'}}
    const gen=document.getElementById('pa-generate');if(gen)gen.disabled=!assigned.length;
  }

  function lapsoHtml(l,arr){return `<article class="pa-lapso"><div class="pa-lapso-head"><h3>${esc(l)}</h3><small>${arr.length} tema${arr.length===1?'':'s'} asignado${arr.length===1?'':'s'}</small></div>${arr.length?`<div class="pa-topic-list">${arr.map(x=>`<div class="pa-topic"><h4>${esc(x.tema)}</h4><div class="pa-meta"><span class="pa-chip ${esc(x.estado)}">${esc(x.estado)}</span>${x.pagina?`<span class="pa-chip">p. ${esc(x.pagina)}</span>`:''}</div></div>`).join('')}</div>`:`<div class="pa-empty">No hay temas asignados a este lapso.</div>`}</article>`}

  function annualSynthetic(){
    const all=rows(),assigned=all.filter(x=>x.lapso),byLapso={};LAPSOS.forEach(l=>byLapso[l]=assigned.filter(x=>x.lapso===l));
    const inst=document.getElementById('pa-inst')?.value.trim()||'',doc=document.getElementById('pa-doc')?.value.trim()||'',year=document.getElementById('pa-year')?.value.trim()||'2026 - 2027';
    const topicText=t=>`${t.tema}${t.intencionalidad?`\nIntencionalidad pedagógica: ${t.intencionalidad}`:''}${t.tejido?`\nTejido temático: ${t.tejido}`:''}${t.temaIndispensable?`\nTema indispensable: ${t.temaIndispensable}`:''}${t.referentes?`\nReferentes teórico-prácticos: ${t.referentes}`:''}`;
    const body=LAPSOS.map(l=>`${l.toUpperCase()}\n${byLapso[l].length?byLapso[l].map((t,i)=>`${i+1}. ${topicText(t)}`).join('\n\n'):'Sin temas asignados'}`).join('\n\n====================\n\n');
    return {grado:gradoActual,tema:`Plan anual de Educación Física · ${gradoActual} · Año escolar ${year}`,intencionalidad:'Construir una planificación anual coherente, progresiva y organizada por los tres lapsos, respetando estrictamente la base curricular del cuadernillo.',tejido:body,referentes:'',fuente:'Cuadernillo Curricular MPPE · Educación Física',tipo:'plan-anual',institucion:inst,docente:doc,anioEscolar:year,seleccionadoEn:new Date().toISOString(),cantidadTemas:assigned.length};
  }

  function generateAnnual(){
    const s=annualSynthetic();if(!s.cantidadTemas)return;writeJSON(SELECT_KEY,s);
    rows().filter(x=>x.lapso).forEach(t=>addHistory(gradoActual,t.tema,t.estado,'Incluido en plan anual',`Incluido en el plan anual ${s.anioEscolar}, ${t.lapso}.`));
    document.getElementById('tab-planificacion')?.click();setTimeout(()=>fillPlanning(s),180);
  }

  function fillPlanning(s){
    const grado=document.getElementById('plan-ia-grado'),area=document.getElementById('plan-ia-area'),tema=document.getElementById('plan-ia-tema'),obj=document.getElementById('plan-ia-objetivo'),extra=document.getElementById('plan-ia-indicaciones')||document.getElementById('plan-ia-notas');
    if(grado){const opts=[...(grado.options||[])],m=opts.find(o=>o.value===s.grado||norm(o.textContent)===norm(s.grado));if(m)grado.value=m.value;else if(grado.tagName==='INPUT')grado.value=s.grado}if(area)area.value='Educación Física';if(tema)tema.value=s.tema;if(obj)obj.value=s.intencionalidad;
    if(extra)extra.value=`Genera un PLAN ANUAL de Educación Física para ${s.grado}, año escolar ${s.anioEscolar}.${s.institucion?` Institución: ${s.institucion}.`:''}${s.docente?` Docente: ${s.docente}.`:''}\n\nUsa exclusivamente como base curricular los temas distribuidos por lapso que se muestran en la base curricular seleccionada. Organiza el resultado por 1er, 2do y 3er Lapso. Para cada lapso incluye: temas generadores, propósito/objetivos, secuencia sugerida, estrategias y actividades, recursos, evidencias de aprendizaje, estrategias de evaluación e instrumentos sugeridos. Mantén una progresión pedagógica anual. No inventes temas curriculares que no estén en la base. Puedes proponer estrategias y actividades prácticas adecuadas a Educación Física.`;
    const sec=document.getElementById('section-planificacion');if(sec){let p=document.getElementById('plan-anual-base');if(!p){p=document.createElement('div');p.id='plan-anual-base';p.className='card';p.style.cssText='margin:0 0 18px;padding:18px;border:1px solid var(--border-color,#d9e2ec);border-radius:18px;background:var(--card-bg,#fff)';const f=document.getElementById('btn-planificacion-ia')?.closest('.card')||document.getElementById('btn-planificacion-ia')?.parentElement;sec.insertBefore(p,f||sec.firstChild)}p.innerHTML=`<div style="font-size:.78rem;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#176da4"><i class="fa-solid fa-calendar-days"></i> Base curricular anual seleccionada</div><h3 style="margin:6px 0 4px">${esc(s.grado)} · ${esc(s.anioEscolar)}</h3><div style="font-size:.85rem;color:#64748b">${s.cantidadTemas} temas distribuidos entre los tres lapsos. Gemini debe respetar esta base curricular del Cuadernillo de Educación Física.</div>`}
    if(typeof mostrarToast==='function')mostrarToast(`Plan anual cargado: ${s.cantidadTemas} temas de ${s.grado}.`,'success','Planificación IA');window.scrollTo({top:0,behavior:'smooth'});
  }

  function printAnnual(){
    const all=rows(),year=document.getElementById('pa-year')?.value.trim()||'2026 - 2027',inst=document.getElementById('pa-inst')?.value.trim()||'',doc=document.getElementById('pa-doc')?.value.trim()||'';
    const w=window.open('','_blank','width=1050,height=800');if(!w)return;
    const sections=LAPSOS.map(l=>{const arr=all.filter(x=>x.lapso===l);return `<h2>${esc(l)}</h2>${arr.length?`<table><thead><tr><th>Tema</th><th>Estado</th><th>Intencionalidad / tejido temático</th></tr></thead><tbody>${arr.map(x=>`<tr><td><b>${esc(x.tema)}</b></td><td>${esc(x.estado)}</td><td>${esc((x.intencionalidad||x.tejido||x.referentes||'').slice(0,500))}</td></tr>`).join('')}</tbody></table>`:'<p>Sin temas asignados.</p>'}`}).join('');
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Plan anual ${esc(gradoActual)}</title><style>body{font-family:Arial,sans-serif;color:#203447;margin:28px}h1{margin-bottom:4px}h2{margin-top:26px;color:#175f8f}p.meta{color:#60758a}table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px}th,td{border:1px solid #c9d4dd;padding:8px;vertical-align:top;text-align:left}th{background:#eef5fa}@media print{button{display:none}}</style></head><body><button onclick="window.print()">Imprimir / Guardar PDF</button><h1>Plan anual de Educación Física</h1><p class="meta"><b>${esc(gradoActual)}</b> · Año escolar ${esc(year)}${inst?` · ${esc(inst)}`:''}${doc?` · Docente: ${esc(doc)}`:''}</p>${sections}<script>setTimeout(()=>window.print(),400)<\/script></body></html>`);w.document.close();
  }

  function init(){try{return create()}catch(e){console.warn('EduGestión Plan Anual EF:',e);return false}}
  if(!init()){let n=0;const tm=setInterval(()=>{n++;if(init()||n>35)clearInterval(tm)},250)}
  window.addEventListener('storage',()=>{if(!document.getElementById(SECTION_ID)?.classList.contains('hidden'))render()});
})();
/* EDUGESTION_CUADERNILLO_EF_FASE8_PLAN_ANUAL_END */

/* =========================================================
   EduGestión · FASE 9
   Perfil docente + personalización por materia + separación local
   ========================================================= */
(() => {
  const PROFILE_VERSION = 'v1';
  const PROFILE_PREFIX = 'edugestion_docente_perfil_';
  const MIGRATION_OWNER_KEY = 'edugestion_local_data_owner_v1';
  const PROFILE_TAB_ID = 'tab-perfil-docente';
  const PROFILE_SECTION_ID = 'section-perfil-docente';
  const EF_TABS = [
    'tab-cuadernillo-ef',
    'tab-plan-evaluacion-ef',
    'tab-resumen-curricular-ef',
    'tab-panel-lapsos-ef',
    'tab-plan-anual-ef'
  ];
  const PERSONAL_KEYS = new Set([
    'edugestion_respuestas_ia_v1',
    'edugestion_biblioteca_evaluaciones_v1',
    'edugestion_cuadernillo_ef_seleccion',
    'edugestion_plan_evaluacion_ef_temas',
    'edugestion_cuadernillo_ef_seguimiento_v1',
    'edugestion_cuadernillo_ef_historial_v1',
    'edugestion_cuadernillo_ef_lapsos_v1',
    'edugestion_ui_settings_v1',
    'nombreInstitucion'
  ]);
  const MATERIAS = [
    'Educación Física','Matemática','Lengua y Literatura','Castellano','Inglés',
    'Ciencias Naturales','Biología','Física','Química','Ciencias Sociales',
    'Geografía, Historia y Ciudadanía','Arte y Patrimonio','Formación para la Soberanía Nacional',
    'Orientación y Convivencia','Informática','Educación Inicial','Otra'
  ];
  const GRADOS = ['Inicial','1er Grado','2do Grado','3er Grado','4to Grado','5to Grado','6to Grado','1er Año','2do Año','3er Año','4to Año','5to Año'];

  const rawGet = Storage.prototype.getItem;
  const rawSet = Storage.prototype.setItem;
  const rawRemove = Storage.prototype.removeItem;

  function norm(v='') {
    return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  }
  function esc(v='') {
    return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function identityFrom(prof) {
    const p = prof || (typeof profesorActual !== 'undefined' ? profesorActual : null) || {};
    const raw = p.id || p.usuario || p.username || p.correo || p.email || p.nombre || 'anonimo';
    return String(raw).trim().toLowerCase().replace(/[^a-z0-9._-]+/g,'_') || 'anonimo';
  }
  function activeIdentity() {
    if (typeof profesorActual === 'undefined' || !profesorActual) return '';
    return identityFrom(profesorActual);
  }
  function scopedKey(key, identity=activeIdentity()) {
    return identity ? `${key}__docente_${identity}` : key;
  }
  function isPersonalKey(key) {
    const k=String(key||'');
    return PERSONAL_KEYS.has(k) || k.startsWith('edugestion_ponderacion_') || k.startsWith('filtros_asistencia_');
  }

  // Los datos locales personales se aíslan por docente. Los datos principales del sistema
  // continúan protegidos por la sesión/token del servidor.
  Storage.prototype.getItem = function(key) {
    const k = String(key);
    if (this === window.localStorage && isPersonalKey(k) && activeIdentity()) {
      return rawGet.call(this, scopedKey(k));
    }
    return rawGet.call(this, k);
  };
  Storage.prototype.setItem = function(key, value) {
    const k = String(key);
    if (this === window.localStorage && isPersonalKey(k) && activeIdentity()) {
      return rawSet.call(this, scopedKey(k), String(value));
    }
    return rawSet.call(this, k, String(value));
  };
  Storage.prototype.removeItem = function(key) {
    const k = String(key);
    if (this === window.localStorage && isPersonalKey(k) && activeIdentity()) {
      return rawRemove.call(this, scopedKey(k));
    }
    return rawRemove.call(this, k);
  };

  function migrateLegacyDataForFirstTeacher(prof) {
    const identity = identityFrom(prof);
    let owner = rawGet.call(localStorage, MIGRATION_OWNER_KEY) || '';
    if (!owner) {
      // El primer docente que entra tras actualizar es el propietario de los datos locales ya existentes.
      owner = identity;
      rawSet.call(localStorage, MIGRATION_OWNER_KEY, owner);
    }
    if (owner !== identity) return;
    PERSONAL_KEYS.forEach(key => {
      const oldVal = rawGet.call(localStorage, key);
      const newKey = scopedKey(key, identity);
      const newVal = rawGet.call(localStorage, newKey);
      if (oldVal !== null && newVal === null) rawSet.call(localStorage, newKey, oldVal);
    });
  }

  function profileKey(prof) { return `${PROFILE_PREFIX}${identityFrom(prof)}_${PROFILE_VERSION}`; }
  function loadProfile(prof) {
    let saved = {};
    try { saved = JSON.parse(rawGet.call(localStorage, profileKey(prof)) || '{}') || {}; } catch (_) {}
    return {
      nombre: saved.nombre || prof?.nombre || '',
      materia: saved.materia || prof?.materia || '',
      anioEscolar: saved.anioEscolar || '2026-2027',
      grados: Array.isArray(saved.grados) ? saved.grados : [],
      otraMateria: saved.otraMateria || '',
      perfilConfigurado: !!saved.perfilConfigurado
    };
  }
  function saveProfile(prof, profile) {
    rawSet.call(localStorage, profileKey(prof), JSON.stringify(profile));
  }
  function effectiveMateria(profile) {
    return profile.materia === 'Otra' ? String(profile.otraMateria || '').trim() : String(profile.materia || '').trim();
  }
  function isEducacionFisica(materia) {
    const n = norm(materia);
    return n === 'educacion fisica' || n.includes('educacion fisica') || n === 'ef';
  }

  function ensureStyles() {
    if (document.getElementById('edu-profile-v1-styles')) return;
    const style = document.createElement('style');
    style.id = 'edu-profile-v1-styles';
    style.textContent = `
      .dp-hero{padding:22px;border-radius:22px;background:linear-gradient(135deg,#0f5f8d,#1596a7);color:white;margin-bottom:18px;box-shadow:0 12px 30px rgba(15,95,141,.18)}
      .dp-hero small{font-weight:900;text-transform:uppercase;letter-spacing:.08em;opacity:.88}.dp-hero h2{margin:6px 0 8px;font-size:1.55rem}.dp-hero p{margin:0;max-width:820px;opacity:.94}
      .dp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.dp-card{background:var(--card-bg,#fff);border:1px solid var(--border-color,#dfe7ee);border-radius:18px;padding:18px}
      .dp-card h3{margin:0 0 12px}.dp-field{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}.dp-field span{font-weight:800;font-size:.86rem}.dp-field input,.dp-field select{width:100%;padding:11px 12px;border:1px solid var(--border-color,#ccd7e0);border-radius:11px;background:var(--input-bg,#fff);color:inherit}
      .dp-grades{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.dp-grade{display:flex;gap:7px;align-items:center;padding:9px;border:1px solid var(--border-color,#dfe7ee);border-radius:10px;font-size:.84rem}
      .dp-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:15px}.dp-btn{border:0;border-radius:11px;padding:11px 15px;font-weight:900;cursor:pointer}.dp-btn.primary{background:#087a9a;color:#fff}.dp-btn.soft{background:#eaf4f7;color:#0e627b}
      .dp-status{margin-top:12px;padding:11px 13px;border-radius:12px;background:#edf8f3;color:#176c4c;font-size:.86rem}.dp-status.warn{background:#fff6df;color:#8a5d00}
      .dp-hidden-by-profile{display:none!important}
      @media(max-width:760px){.dp-grid{grid-template-columns:1fr}.dp-grades{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  }

  function ensureProfileUI() {
    if (document.getElementById(PROFILE_TAB_ID)) return;
    ensureStyles();
    const nav = document.getElementById('app-nav');
    const main = document.getElementById('app-main');
    if (!nav || !main) return;
    const tab = document.createElement('button');
    tab.id = PROFILE_TAB_ID; tab.type='button'; tab.className='nav-item'; tab.setAttribute('aria-selected','false');
    tab.dataset.title='Mi perfil docente'; tab.dataset.description='Configura tu materia, grados y año escolar para adaptar EduGestión a tu trabajo.';
    tab.innerHTML='<i class="fa-solid fa-user-gear"></i><span>Mi perfil docente</span>';
    const settingsTab = document.getElementById('tab-configuracion');
    nav.insertBefore(tab, settingsTab || null);

    const section = document.createElement('section');
    section.id = PROFILE_SECTION_ID; section.className='hidden';
    section.innerHTML = `
      <header class="dp-hero"><small><i class="fa-solid fa-user-gear"></i> Fase 9 · Personalización docente</small><h2>Mi perfil docente</h2><p>EduGestión adapta la materia, los grados y las herramientas visibles para cada profesor. Tus bibliotecas IA, preferencias, ponderaciones y seguimiento curricular local quedan separados de los demás docentes. Los módulos principales continúan cargándose con la sesión segura de cada profesor.</p></header>
      <div class="dp-grid">
        <div class="dp-card"><h3>Datos del docente</h3>
          <label class="dp-field"><span>Nombre</span><input id="dp-name" type="text" placeholder="Nombre del docente"></label>
          <label class="dp-field"><span>Área / materia</span><select id="dp-subject">${MATERIAS.map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join('')}</select></label>
          <label class="dp-field" id="dp-other-wrap" style="display:none"><span>Escribe tu materia</span><input id="dp-other" type="text" placeholder="Ej.: Educación Comercial"></label>
          <label class="dp-field"><span>Año escolar</span><input id="dp-school-year" type="text" placeholder="2026-2027"></label>
          <div id="dp-profile-status" class="dp-status"></div>
          <div class="dp-status" style="margin-top:10px;background:#eef6ff;color:#235a8a"><i class="fa-solid fa-shield-halved"></i> <strong>Datos separados por usuario</strong><br><span style="font-size:.82rem">Planificaciones, estudiantes, asistencia y demás datos del servidor se consultan con la sesión del profesor. Las bibliotecas y herramientas locales también se guardan bajo su identidad.</span></div>
        </div>
        <div class="dp-card"><h3>Grados / años que atiendo</h3><div class="dp-grades">${GRADOS.map(g=>`<label class="dp-grade"><input type="checkbox" data-dp-grade="${esc(g)}"><span>${esc(g)}</span></label>`).join('')}</div>
          <div class="dp-actions"><button id="dp-save" class="dp-btn primary"><i class="fa-solid fa-floppy-disk"></i> Guardar perfil</button><button id="dp-select-all" class="dp-btn soft">Seleccionar todos</button></div>
        </div>
      </div>`;
    main.appendChild(section);

    tab.addEventListener('click', () => {
      if (typeof cambiarPestana === 'function') cambiarPestana(tab, section);
      else {
        document.querySelectorAll('#app-nav .nav-item').forEach(x=>x.classList.toggle('is-active',x===tab));
        document.querySelectorAll('#app-main > section').forEach(x=>x.classList.toggle('hidden',x!==section));
      }
      renderProfileForm();
    });
    document.getElementById('dp-subject')?.addEventListener('change', e => {
      document.getElementById('dp-other-wrap').style.display = e.target.value === 'Otra' ? '' : 'none';
    });
    document.getElementById('dp-select-all')?.addEventListener('click',()=>document.querySelectorAll('[data-dp-grade]').forEach(c=>c.checked=true));
    document.getElementById('dp-save')?.addEventListener('click', saveProfileFromForm);
  }

  function renderProfileForm() {
    if (typeof profesorActual === 'undefined' || !profesorActual) return;
    const p = loadProfile(profesorActual);
    const name=document.getElementById('dp-name'), subject=document.getElementById('dp-subject'), other=document.getElementById('dp-other'), year=document.getElementById('dp-school-year');
    if(name)name.value=p.nombre||'';
    if(subject){
      const exists=[...subject.options].some(o=>o.value===p.materia);
      subject.value=exists?p.materia:(p.materia?'Otra':'Educación Física');
    }
    if(other)other.value=p.otraMateria || (!MATERIAS.includes(p.materia)?p.materia:'');
    const wrap=document.getElementById('dp-other-wrap'); if(wrap)wrap.style.display=subject?.value==='Otra'?'':'none';
    if(year)year.value=p.anioEscolar||'2026-2027';
    document.querySelectorAll('[data-dp-grade]').forEach(c=>c.checked=p.grados.includes(c.dataset.dpGrade));
    const st=document.getElementById('dp-profile-status');
    if(st){const mat=effectiveMateria(p)||'Sin materia configurada';st.className='dp-status'+(p.perfilConfigurado?'':' warn');st.innerHTML=p.perfilConfigurado?`<b>Perfil activo:</b> ${esc(mat)}${p.grados.length?` · ${p.grados.length} grado(s)/año(s) seleccionados`:''}`:'<b>Completa tu perfil.</b> Al guardarlo, EduGestión adaptará automáticamente las herramientas a tu materia.'}
  }

  function saveProfileFromForm() {
    if (typeof profesorActual === 'undefined' || !profesorActual) return;
    const materia=document.getElementById('dp-subject')?.value||'';
    const otra=document.getElementById('dp-other')?.value.trim()||'';
    if(materia==='Otra'&&!otra){
      if(typeof mostrarToast==='function')mostrarToast('Escribe el nombre de tu materia.','warning','Falta la materia');
      return;
    }
    const p={
      nombre:document.getElementById('dp-name')?.value.trim()||profesorActual.nombre||'',
      materia,
      otraMateria:otra,
      anioEscolar:document.getElementById('dp-school-year')?.value.trim()||'2026-2027',
      grados:[...document.querySelectorAll('[data-dp-grade]:checked')].map(x=>x.dataset.dpGrade),
      perfilConfigurado:true
    };
    saveProfile(profesorActual,p);
    applyPersonalization(false);
    renderProfileForm();
    if(typeof mostrarToast==='function')mostrarToast('El menú y las herramientas se adaptaron a tu perfil.','success','Perfil docente guardado');
  }

  function updateCommonFields(materia, profile) {
    const ids=['plan-ia-area','eval-ia-area'];
    ids.forEach(id=>{const el=document.getElementById(id);if(el&&(!el.value||norm(el.value)==='educacion fisica'||el.dataset.dpAuto==='1')){el.value=materia;el.dataset.dpAuto='1'}});
    const annualYear=document.getElementById('pa-year'); if(annualYear&&profile?.anioEscolar)annualYear.value=profile.anioEscolar;
    const annualTeacher=document.getElementById('pa-teacher'); if(annualTeacher&&profile?.nombre&&!annualTeacher.value)annualTeacher.value=profile.nombre;
  }

  function applyMenuVisibility(materia) {
    const ef=isEducacionFisica(materia);
    EF_TABS.forEach(id=>document.getElementById(id)?.classList.toggle('dp-hidden-by-profile',!ef));
    // Si un docente no EF estaba dentro de un módulo EF, volver a una herramienta general.
    if(!ef){
      const active=EF_TABS.some(id=>document.getElementById(id)?.classList.contains('is-active'));
      if(active)document.getElementById('tab-planificacion')?.click();
    }
  }

  function applyPersonalization(openIfNeeded=true) {
    if (typeof profesorActual === 'undefined' || !profesorActual) return;
    migrateLegacyDataForFirstTeacher(profesorActual);
    const p=loadProfile(profesorActual);
    const materia=effectiveMateria(p)||String(profesorActual.materia||'').trim();
    const nombre=p.nombre||profesorActual.nombre||'Docente';
    window.EDUGESTION_DOCENTE_PERFIL={...p,materiaEfectiva:materia,docenteId:identityFrom(profesorActual)};
    // Conserva los datos de sesión, pero expone la preferencia efectiva a las herramientas IA.
    if(p.perfilConfigurado){profesorActual={...profesorActual,nombre,materia:materia||profesorActual.materia};}
    if(typeof profesorName!=='undefined'&&profesorName)profesorName.textContent=nombre;
    if(typeof profesorMateria!=='undefined'&&profesorMateria)profesorMateria.textContent=materia||'Configura tu materia';
    applyMenuVisibility(materia);
    updateCommonFields(materia,p);
    if(openIfNeeded && (!materia || (!p.perfilConfigurado && !profesorActual.materia))){
      setTimeout(()=>{document.getElementById(PROFILE_TAB_ID)?.click();if(typeof mostrarToast==='function')mostrarToast('Selecciona tu materia y los grados que atiendes para personalizar EduGestión.','info','Configura tu perfil docente')},180);
    }
  }

  function installLoginHook() {
    if (typeof aplicarPerfilDocente !== 'function' || aplicarPerfilDocente.__dpWrapped) return;
    const original=aplicarPerfilDocente;
    const wrapped=function(profesor){
      migrateLegacyDataForFirstTeacher(profesor);
      const result=original(profesor);
      setTimeout(()=>applyPersonalization(true),0);
      return result;
    };
    wrapped.__dpWrapped=true;
    aplicarPerfilDocente=wrapped;
  }

  function boot() {
    ensureProfileUI();
    installLoginHook();
    if(typeof profesorActual!=='undefined'&&profesorActual)applyPersonalization(false);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

  window.EDUGESTION_PROFILE_V1={apply:applyPersonalization,load:()=>typeof profesorActual!=='undefined'&&profesorActual?loadProfile(profesorActual):null,isEducacionFisica};
})();
/* EDUGESTION_PROFILE_V1_END */

/* =========================================================
   EduGestión · FASE 10
   IA adaptada automáticamente al perfil docente
   ========================================================= */
(() => {
  const MARK='EDUGESTION_PROFILE_AI_V1';
  if (window[MARK]) return;
  window[MARK]=true;

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function perfilIA(){
    const p=window.EDUGESTION_DOCENTE_PERFIL||{};
    const materia=String(p.materiaEfectiva||p.materia||window.profesorActual?.materia||'').trim();
    const nombre=String(p.nombre||window.profesorActual?.nombre||'Docente').trim();
    const grados=Array.isArray(p.grados)?p.grados.filter(Boolean):[];
    const anio=String(p.anioEscolar||'').trim();
    return {nombre,materia,grados,anio};
  }

  function contextoPerfil(){
    const p=perfilIA();
    const lineas=[
      'CONTEXTO DEL PERFIL DOCENTE DE EDUGESTIÓN:',
      `- Docente: ${p.nombre||'No indicado'}`,
      `- Área o materia principal: ${p.materia||'No indicada'}`,
      `- Grados/Años que atiende: ${p.grados.length?p.grados.join(', '):'No indicados'}`,
      `- Año escolar: ${p.anio||'No indicado'}`,
      '',
      'INSTRUCCIONES DE PERSONALIZACIÓN:',
      '- Adapta la respuesta al área o materia del perfil cuando la consulta sea pedagógica o escolar.',
      '- Si la consulta ya indica otra materia, grado, año, tema o contexto específico, respeta primero lo escrito por el docente en esa consulta.',
      '- No cambies ni sustituyas una base curricular, texto, documento o material que el docente haya proporcionado. Si existe una fuente curricular obligatoria dentro de la consulta, esa fuente tiene prioridad.',
      '- Usa ejemplos, actividades, instrumentos y lenguaje apropiados para los grados/años indicados cuando sean pertinentes.',
      '- No inventes datos institucionales, contenidos oficiales ni referencias curriculares que no hayan sido proporcionados.',
      '- No realices búsqueda web salvo que la propia herramienta lo solicite expresamente.'
    ];
    return lineas.join('\n');
  }

  function enriquecerMensaje(texto){
    const raw=String(texto||'').trim();
    if(!raw || raw.includes('CONTEXTO DEL PERFIL DOCENTE DE EDUGESTIÓN:')) return raw;
    return `${contextoPerfil()}\n\nCONSULTA DEL DOCENTE:\n${raw}`;
  }

  function instalarFetchPerfil(){
    if(!window.fetch || window.fetch.__edugestionPerfilIA) return;
    const original=window.fetch.bind(window);
    const wrapped=async function(input, init){
      try{
        const url=typeof input==='string'?input:(input?.url||'');
        if(String(url).includes('/api/gemini') && init && typeof init.body==='string'){
          const data=JSON.parse(init.body);
          if(data && typeof data.message==='string'){
            data.message=enriquecerMensaje(data.message);
            init={...init,body:JSON.stringify(data)};
          }
        }
      }catch(e){/* Si el cuerpo no es JSON, se conserva intacto. */}
      return original(input,init);
    };
    wrapped.__edugestionPerfilIA=true;
    window.fetch=wrapped;
  }

  function autocompletarCampos(){
    const p=perfilIA();
    const materia=p.materia;
    if(materia){
      ['plan-ia-area','eval-ia-area'].forEach(id=>{
        const el=document.getElementById(id);
        if(el && (!String(el.value||'').trim() || el.dataset.dpAuto==='1')){
          el.value=materia;
          el.dataset.dpAuto='1';
        }
      });
    }
    if(p.grados.length===1){
      ['plan-ia-grado','eval-ia-grado'].forEach(id=>{
        const el=document.getElementById(id);
        if(!el || String(el.value||'').trim()) return;
        const exact=[...el.options||[]].find(o=>String(o.value||o.textContent).trim()===p.grados[0]);
        if(exact) el.value=exact.value;
      });
    }
  }

  function asegurarIndicadorIA(){
    const section=document.getElementById('section-gemini');
    if(!section || document.getElementById('profile-ai-context-card')) return;
    const p=perfilIA();
    const card=document.createElement('div');
    card.id='profile-ai-context-card';
    card.style.cssText='margin:0 0 14px;padding:12px 14px;border:1px solid rgba(14,116,144,.22);border-radius:14px;background:rgba(6,182,212,.08);display:flex;gap:10px;align-items:flex-start;line-height:1.35';
    card.innerHTML=`<i class="fa-solid fa-user-graduate" style="margin-top:2px;color:#0e7490"></i><div><strong>IA adaptada a tu perfil</strong><div id="profile-ai-context-text" style="font-size:.86rem;opacity:.82;margin-top:2px"></div></div>`;
    section.insertBefore(card,section.firstChild);
    actualizarIndicadorIA();
  }

  function actualizarIndicadorIA(){
    const out=document.getElementById('profile-ai-context-text');
    if(!out) return;
    const p=perfilIA();
    const partes=[p.materia||'Materia sin configurar'];
    if(p.grados.length)partes.push(p.grados.join(', '));
    if(p.anio)partes.push(`Año escolar ${p.anio}`);
    out.innerHTML=esc(partes.join(' · '));
  }

  function aplicar(){
    instalarFetchPerfil();
    autocompletarCampos();
    asegurarIndicadorIA();
    actualizarIndicadorIA();
  }

  // Reaplica al guardar/cambiar el perfil sin modificar el flujo de Fase 9.
  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#dp-save')) setTimeout(aplicar,80);
    if(e.target?.closest?.('#tab-gemini,#tab-planificacion,#tab-evaluaciones-ia')) setTimeout(aplicar,20);
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',aplicar,{once:true});else aplicar();
  window.EDUGESTION_PROFILE_AI_V1={apply:aplicar,context:perfilIA,enrich:enriquecerMensaje};
})();
/* EDUGESTION_PROFILE_AI_V1_END */


/* =========================================================
   EduGestión · FASE 11
   Refuerzo de separación de datos por usuario
   - Datos del servidor: protegidos por token/sesión del profesor.
   - Datos locales: bibliotecas IA, configuración, institución,
     ponderaciones, filtros y seguimiento curricular aislados por identidad.
   ========================================================= */
(() => {
  const MARK='EDUGESTION_USER_DATA_ISOLATION_V1';
  if(window[MARK])return;
  window[MARK]=true;

  function actualizarSello(){
    const p=window.EDUGESTION_DOCENTE_PERFIL||{};
    const name=String(p.nombre||window.profesorActual?.nombre||'Docente').trim();
    const status=document.getElementById('dp-profile-status');
    if(status && window.profesorActual){
      status.innerHTML=`<i class="fa-solid fa-circle-check"></i> Perfil activo: <strong>${name.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</strong> · almacenamiento personal aislado.`;
    }
  }

  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#tab-perfil-docente,#dp-save'))setTimeout(actualizarSello,80);
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(actualizarSello,250),{once:true});
  else setTimeout(actualizarSello,100);
})();
/* EDUGESTION_USER_DATA_ISOLATION_V1_END */
