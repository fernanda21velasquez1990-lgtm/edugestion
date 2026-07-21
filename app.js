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
    let agendaClasesEstado = [];
    let claseAgendaSeleccionada = '';

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

    const sectionAsistencia = document.getElementById('section-asistencia');
    const sectionPlanificacion = document.getElementById('section-planificacion');
    const sectionActas = document.getElementById('section-actas');
    const sectionRegistro = document.getElementById('section-registro');
    const sectionHorario = document.getElementById('section-horario');

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
    const agendaClasesDia = document.getElementById('agenda-clases-dia');
    const agendaTotalClases = document.getElementById('agenda-total-clases');
    const agendaClasesCompletadas = document.getElementById('agenda-clases-completadas');
    const agendaClasesPendientes = document.getElementById('agenda-clases-pendientes');
    const nombreDiaAgenda = document.getElementById('nombre-dia-agenda');
    const buscarAlumnoAsistencia = document.getElementById('buscar-alumno-asistencia');
    const btnTodosPresentes = document.getElementById('btn-todos-presentes');
    const btnTodosAusentes = document.getElementById('btn-todos-ausentes');
   
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
        const valor = window.localStorage.getItem(SESSION_KEY) || window.sessionStorage.getItem(SESSION_KEY);
        return valor ? JSON.parse(valor) : null;
      } catch (error) {
        return null;
      }
    }

    function sessionSet(datos) {
      const serializado = JSON.stringify(datos);
      try { window.localStorage.setItem(SESSION_KEY, serializado); } catch (error) {}
      try { window.sessionStorage.setItem(SESSION_KEY, serializado); } catch (error) {}
    }

    function sessionClear() {
      try { window.localStorage.removeItem(SESSION_KEY); } catch (error) {}
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
        detectarClaseAutomatica();
        await renderAgendaDiaria();

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
      if (guardada.profesor) aplicarPerfilDocente(guardada.profesor);
      try {
        const datos = await apiRequest('validarSesion');
        await iniciarSesion({ token: sessionToken, profesor: datos.profesor }, false);
      } catch (error) {
        const invalida = ['SESSION_EXPIRED', 'SESSION_REQUIRED', 'UNAUTHORIZED'].includes(error.code);
        if (invalida) {
          cerrarSesionLocal(false);
          loginError.textContent = error.message || 'La sesión venció. Ingresa nuevamente.';
          loginError.classList.remove('hidden');
        } else {
          console.warn('No se pudo validar la sesión durante la recarga. Se conserva localmente:', error);
          mostrarToast('No se pudo contactar al servidor. Tu sesión permanece abierta y se reintentará en la próxima operación.', 'warning', 'Conexión temporal');
        }
      }
    }

    window.addEventListener('DOMContentLoaded', async () => {
      const hoy = new Date();
      const fechaHoyISO = hoy.toISOString().split('T')[0];
      fechaAsistencia.value = fechaHoyISO;
      if (fechaAgendaClases) fechaAgendaClases.value = fechaHoyISO;
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
      [tabAsistencia, tabPlanificacion, tabActas, tabRegistro, tabHorario].forEach(tab => {
        tab.classList.remove('is-active');
        tab.setAttribute('aria-selected', 'false');
      });
      [sectionAsistencia, sectionPlanificacion, sectionActas, sectionRegistro, sectionHorario].forEach(sec => sec.classList.add('hidden'));

      activaTab.classList.add('is-active');
      activaTab.setAttribute('aria-selected', 'true');
      activaSection.classList.remove('hidden');
      if (pageTitle) pageTitle.textContent = activaTab.dataset.title || activaTab.textContent.trim();
      if (pageDescription) pageDescription.textContent = activaTab.dataset.description || '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    tabAsistencia.addEventListener('click', () => { cambiarPestana(tabAsistencia, sectionAsistencia); });
    tabPlanificacion.addEventListener('click', () => { cambiarPestana(tabPlanificacion, sectionPlanificacion); actualizarUIPlanificacion(); });
    tabActas.addEventListener('click', async () => { cambiarPestana(tabActas, sectionActas); setFechaHoraActas(); await filtrarAlumnosParaActas(); });
    tabRegistro.addEventListener('click', () => { cambiarPestana(tabRegistro, sectionRegistro); });
    tabHorario.addEventListener('click', () => { cambiarPestana(tabHorario, sectionHorario); actualizarUIHorario(); });
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

    // ====== AGENDA DIARIA DE CLASES Y ASISTENCIA ======
    function normalizarDia(valor = '') {
      return String(valor).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
    }

    function diaSemanaDesdeFecha(fechaISO) {
      if (!fechaISO) return { clave: '', nombre: '—' };
      const fecha = new Date(`${fechaISO}T12:00:00`);
      if (Number.isNaN(fecha.getTime())) return { clave: '', nombre: '—' };
      const nombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const nombre = nombres[fecha.getDay()];
      return { clave: normalizarDia(nombre), nombre };
    }

    function claveClaseAgenda(clase) {
      return [clase.dia, clase.horaInicio, clase.horaFin, clase.ano, clase.seccion, clase.turno].map(v => String(v || '')).join('|');
    }

    function mostrarAgendaVacia(titulo, texto, icono = 'fa-calendar-check') {
      if (!agendaClasesDia) return;
      agendaClasesDia.innerHTML = `<div class="attendance-agenda-empty"><i class="fa-solid ${icono}"></i><div><strong>${escaparHTML(titulo)}</strong><p>${escaparHTML(texto)}</p></div></div>`;
    }

    function renderAgendaCargando(clases) {
      if (!agendaClasesDia) return;
      agendaClasesDia.innerHTML = clases.map(() => `
        <article class="attendance-class-card is-loading" aria-hidden="true">
          <span class="attendance-card-skeleton attendance-card-skeleton--small"></span>
          <span class="attendance-card-skeleton attendance-card-skeleton--medium"></span>
          <span class="attendance-card-skeleton"></span>
          <span class="attendance-card-skeleton attendance-card-skeleton--medium"></span>
        </article>`).join('');
    }

    async function obtenerResumenClaseAgenda(clase, fecha) {
      try {
        const [alumnosResp, asistenciaResp] = await Promise.all([
          apiRequest('obtenerAlumnos', { ano: clase.ano, seccion: clase.seccion, turno: clase.turno }),
          apiRequest('obtenerAsistencia', {
            ano: clase.ano,
            seccion: clase.seccion,
            turno: clase.turno,
            fecha,
            materia: profesorActual?.materia || ''
          })
        ]);
        const alumnos = Array.isArray(alumnosResp.alumnos) ? alumnosResp.alumnos : [];
        const registro = asistenciaResp.asistencia && typeof asistenciaResp.asistencia === 'object' ? asistenciaResp.asistencia : {};
        let presentes = 0;
        let ausentes = 0;
        alumnos.forEach(al => {
          if (registro[al.id] === 'Ausente') ausentes += 1;
          else if (registro[al.id] === 'Presente') presentes += 1;
        });
        const registrados = presentes + ausentes;
        let estado = 'pending';
        let etiqueta = 'Pendiente';
        if (!alumnos.length) { estado = 'empty'; etiqueta = 'Sin alumnos'; }
        else if (registrados === alumnos.length) { estado = 'complete'; etiqueta = 'Registrada'; }
        else if (registrados > 0) { estado = 'partial'; etiqueta = 'Parcial'; }
        return { ...clase, total: alumnos.length, presentes, ausentes, registrados, existe: Boolean(asistenciaResp.existe), estado, etiqueta };
      } catch (error) {
        console.warn('No se pudo resumir una clase de la agenda:', error);
        return { ...clase, total: 0, presentes: 0, ausentes: 0, registrados: 0, estado: 'error', etiqueta: 'No disponible' };
      }
    }

    function renderTarjetasAgenda() {
      if (!agendaClasesDia) return;
      if (!agendaClasesEstado.length) {
        mostrarAgendaVacia('No hay clases programadas', 'Agrega bloques en el módulo Horario para este día.', 'fa-calendar-xmark');
        return;
      }
      agendaClasesDia.innerHTML = '';
      agendaClasesEstado.forEach(clase => {
        const clave = claveClaseAgenda(clase);
        const tarjeta = document.createElement('button');
        tarjeta.type = 'button';
        tarjeta.className = `attendance-class-card is-${clase.estado}${claseAgendaSeleccionada === clave ? ' is-selected' : ''}`;
        tarjeta.setAttribute('aria-label', `Abrir asistencia de ${clase.ano} sección ${clase.seccion}`);
        tarjeta.innerHTML = `
          <span class="attendance-class-card__topline">
            <span class="attendance-class-card__time"><i class="fa-regular fa-clock"></i>${escaparHTML(formatearHoraLimpia(clase.horaInicio))} - ${escaparHTML(formatearHoraLimpia(clase.horaFin))}</span>
            <span class="attendance-class-card__status">${escaparHTML(clase.etiqueta)}</span>
          </span>
          <strong class="attendance-class-card__course">${escaparHTML(clase.ano)} · Sección “${escaparHTML(clase.seccion)}”</strong>
          <span class="attendance-class-card__meta"><i class="fa-solid fa-sun"></i>${escaparHTML(clase.turno === 'Manana' ? 'Mañana' : clase.turno)}</span>
          <span class="attendance-class-card__numbers">
            <span><b>${clase.total}</b><small>Estudiantes</small></span>
            <span><b>${clase.presentes}</b><small>Presentes</small></span>
            <span><b>${clase.ausentes}</b><small>Ausentes</small></span>
          </span>
          <span class="attendance-class-card__action"><span>${clase.estado === 'complete' ? 'Consultar asistencia' : 'Tomar asistencia'}</span><i class="fa-solid fa-arrow-right"></i></span>`;
        tarjeta.addEventListener('click', async () => {
          claseAgendaSeleccionada = clave;
          renderTarjetasAgenda();
          selectFiltroAno.value = clase.ano;
          selectFiltroSeccion.value = clase.seccion;
          selectFiltroTurno.value = clase.turno === 'Mañana' ? 'Manana' : clase.turno;
          fechaAsistencia.value = fechaAgendaClases?.value || fechaAsistencia.value;
          await cargarAlumnosDeSeccion();
          document.querySelector('.attendance-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        agendaClasesDia.appendChild(tarjeta);
      });
    }

    async function renderAgendaDiaria() {
      if (!fechaAgendaClases || !agendaClasesDia || !profesorActual) return;
      const fecha = fechaAgendaClases.value || new Date().toISOString().split('T')[0];
      const dia = diaSemanaDesdeFecha(fecha);
      if (nombreDiaAgenda) nombreDiaAgenda.textContent = dia.nombre;
      const clases = horariosProfesor
        .filter(h => normalizarDia(h.dia) === dia.clave)
        .sort((a, b) => String(a.horaInicio || '').localeCompare(String(b.horaInicio || '')));
      if (agendaTotalClases) agendaTotalClases.textContent = String(clases.length);
      if (agendaClasesCompletadas) agendaClasesCompletadas.textContent = '0';
      if (agendaClasesPendientes) agendaClasesPendientes.textContent = String(clases.length);
      agendaClasesEstado = [];
      claseAgendaSeleccionada = '';
      if (!clases.length) {
        mostrarAgendaVacia('No hay clases programadas', `No se encontraron bloques para ${dia.nombre.toLowerCase()}.`, 'fa-calendar-xmark');
        return;
      }
      renderAgendaCargando(clases);
      agendaClasesEstado = await Promise.all(clases.map(clase => obtenerResumenClaseAgenda(clase, fecha)));
      const completadas = agendaClasesEstado.filter(c => c.estado === 'complete').length;
      if (agendaClasesCompletadas) agendaClasesCompletadas.textContent = String(completadas);
      if (agendaClasesPendientes) agendaClasesPendientes.textContent = String(Math.max(0, clases.length - completadas));
      renderTarjetasAgenda();
    }

    fechaAgendaClases?.addEventListener('change', renderAgendaDiaria);
    btnAgendaHoy?.addEventListener('click', () => {
      fechaAgendaClases.value = new Date().toISOString().split('T')[0];
      renderAgendaDiaria();
    });

    buscarAlumnoAsistencia?.addEventListener('input', () => {
      const termino = normalizarTextoBusqueda(buscarAlumnoAsistencia.value);
      listaAlumnosAsistencia.querySelectorAll('.attendance-student-row').forEach(fila => {
        fila.hidden = Boolean(termino) && !String(fila.dataset.search || '').includes(termino);
      });
    });

    function normalizarTextoBusqueda(valor = '') {
      return String(valor).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    }

    function marcarTodosAsistencia(estado) {
      if (!alumnosSeccion.length) return mostrarToast('Primero carga una lista de estudiantes.', 'warning', 'Sin lista');
      alumnosSeccion.forEach(al => { asistenciaTemporal[al.id] = estado; });
      renderAsistencia();
      actualizarStatsSeccion();
      mostrarToast(`Todos los estudiantes fueron marcados como ${estado.toLowerCase()}.`, 'info', 'Marcación masiva');
    }

    btnTodosPresentes?.addEventListener('click', () => marcarTodosAsistencia('Presente'));
    btnTodosAusentes?.addEventListener('click', () => marcarTodosAsistencia('Ausente'));

    // ====== LÓGICA DE ASISTENCIA DASHBOARD ======
    btnCargarListaFiltrada.onclick = cargarAlumnosDeSeccion;
   
    async function cargarAlumnosDeSeccion() {
      const a = selectFiltroAno.value; const s = selectFiltroSeccion.value; let t = selectFiltroTurno.value; if (t === "Mañana" || t === "Manana") t = "Manana";
      if(profesorActual) storageSet('filtros_asistencia_' + profesorActual.id, JSON.stringify({ a, s, t }));
     
      asistenciaInfo.textContent = `Lista: ${a} - Secc "${s}"`;
      listaAlumnosAsistencia.innerHTML = '<div class="py-8 text-center"><i class="fa-solid fa-spinner animate-spin text-3xl text-indigo-500 mb-2"></i><p>Cargando lista...</p></div>';
     
      try {
        const [d, registro] = await Promise.all([
          apiRequest('obtenerAlumnos', { ano: a, seccion: s, turno: t }),
          apiRequest('obtenerAsistencia', {
            ano: a,
            seccion: s,
            turno: t,
            fecha: fechaAsistencia.value,
            materia: profesorActual.materia
          })
        ]);
        alumnosSeccion = Array.isArray(d.alumnos) ? d.alumnos : [];
        if (buscarAlumnoAsistencia) buscarAlumnoAsistencia.value = '';
        asistenciaTemporal = registro.asistencia && typeof registro.asistencia === 'object' ? { ...registro.asistencia } : {};
        estadisticasAlumnos = {};
        contadorAsistencia.textContent = `${alumnosSeccion.length} Alumnos`;
        alumnosSeccion.forEach(al => { estadisticasAlumnos[al.id] = { faltasSemana: 0, faltasMes: 0 }; });
        renderAsistencia();
        actualizarStatsSeccion();
        llenarSelectActaRapida();
        if (registro.existe) mostrarToast('Se cargó la asistencia que ya estaba guardada para esta fecha.', 'info', 'Registro recuperado');
      } catch (e) {
        console.error('Error al cargar estudiantes o asistencia:', e);
        listaAlumnosAsistencia.innerHTML = '<p class="text-center text-red-500 py-6">No fue posible cargar la lista.</p>';
      }
    }

    fechaAsistencia.addEventListener('change', () => {
      if (profesorActual && (alumnosSeccion.length || selectFiltroAno.value)) cargarAlumnosDeSeccion();
    });

    function renderAsistencia() {
      listaAlumnosAsistencia.innerHTML = '';
      if (alumnosSeccion.length === 0) {
        listaAlumnosAsistencia.innerHTML = '<div class="py-10 text-center text-gray-400"><i class="fa-solid fa-user-slash text-3xl mb-3 text-gray-300"></i><p class="text-sm font-semibold">No hay estudiantes registrados en esta sección.</p></div>';
        statPresentes.textContent = '0';
        statAusentes.textContent = '0';
        porcentajeAsistencia.textContent = '0%';
        barPresentes.style.width = '0%';
        barAusentes.style.width = '0%';
        return;
      }

      alumnosSeccion.forEach((al, indice) => {
        const idDom = `alumno-${indice}`;
        const nombre = escaparHTML(al.nombre || 'Estudiante');
        const cedula = escaparHTML(al.cedula || 'Sin cédula');
        const estadoInicial = asistenciaTemporal[al.id] === 'Ausente' ? 'Ausente' : 'Presente';
        asistenciaTemporal[al.id] = estadoInicial;
        const clasePresente = estadoInicial === 'Presente'
          ? 'w-20 py-2 rounded-xl bg-green-500 text-white font-black text-xs shadow-sm transition'
          : 'w-20 py-2 rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-200 font-black text-xs transition';
        const claseAusente = estadoInicial === 'Ausente'
          ? 'w-20 py-2 rounded-xl bg-red-500 text-white font-black text-xs shadow-sm transition'
          : 'w-20 py-2 rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-200 font-black text-xs transition';
        const d = document.createElement('div');
        d.className = 'attendance-student-row py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-gray-50 px-2 rounded-xl transition';
        d.dataset.search = normalizarTextoBusqueda(`${al.nombre || ''} ${al.cedula || ''}`);
        d.innerHTML = `<div class="flex items-center gap-3 min-w-0"><div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black shadow-sm flex-shrink-0">${nombre.charAt(0).toUpperCase()}</div><div class="min-w-0"><p class="text-sm font-bold text-gray-800 truncate">${nombre}</p><div class="flex flex-wrap items-center gap-2 mt-1"><span class="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-bold">C.I: ${cedula}</span><span class="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold"><i class="fa-regular fa-calendar-check mr-1"></i>Registro del día</span></div></div></div><div class="flex gap-2 self-end sm:self-auto"><button id="p-${idDom}" type="button" class="${clasePresente}" aria-label="Marcar presente a ${nombre}"><i class="fa-solid fa-check mr-1"></i> PRES</button><button id="i-${idDom}" type="button" class="${claseAusente}" aria-label="Marcar ausente a ${nombre}"><i class="fa-solid fa-xmark mr-1"></i> AUS</button></div>`;
        d.querySelector(`#p-${idDom}`).addEventListener('click', () => setA(al.id, 'Presente', idDom));
        d.querySelector(`#i-${idDom}`).addEventListener('click', () => setA(al.id, 'Ausente', idDom));
        listaAlumnosAsistencia.appendChild(d);
      });
    }

    window.setA = function(id, est, idDom = id) {
      asistenciaTemporal[id] = est;
      const p = document.getElementById(`p-${idDom}`);
      const i = document.getElementById(`i-${idDom}`);
      if (!p || !i) return;
      if(est === 'Presente') { p.className="w-20 py-2 rounded-xl bg-green-500 text-white font-black text-xs shadow-sm transition"; i.className="w-20 py-2 rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-200 font-black text-xs transition"; }
      else { p.className="w-20 py-2 rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-200 font-black text-xs transition"; i.className="w-20 py-2 rounded-xl bg-red-500 text-white font-black text-xs shadow-sm transition"; }
      actualizarStatsSeccion();
    }

    function actualizarStatsSeccion() {
       const total = alumnosSeccion.length; if(total === 0) return;
       let presentes = 0; let ausentes = 0;
       for(let id in asistenciaTemporal) { if(asistenciaTemporal[id] === 'Presente') presentes++; else ausentes++; }
       statPresentes.textContent = presentes; statAusentes.textContent = ausentes;
       const pctPresentes = Math.round((presentes / total) * 100); const pctAusentes = 100 - pctPresentes;
       barPresentes.style.width = `${pctPresentes}%`; barAusentes.style.width = `${pctAusentes}%`; porcentajeAsistencia.textContent = `${pctPresentes}%`;
       if(pctPresentes >= 80) porcentajeAsistencia.className = "text-xl font-black text-green-500"; else if(pctPresentes >= 50) porcentajeAsistencia.className = "text-xl font-black text-orange-500"; else porcentajeAsistencia.className = "text-xl font-black text-red-500";
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
          const payload = { materia: profesorActual.materia, ano: selectFiltroAno.value, seccion: selectFiltroSeccion.value, turno: selectFiltroTurno.value, fecha: fechaAsistencia.value, asistencia: asistenciaTemporal };
          await apiRequest('guardarAsistencia', payload);
          mostrarToast('La asistencia del día quedó registrada correctamente.', 'success', 'Asistencia guardada');
          if (fechaAgendaClases) fechaAgendaClases.value = fechaAsistencia.value;
          await renderAgendaDiaria();
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
    window.mostrarFormularioPlan = function() {
      panelListaPlan.classList.add('hidden'); accionesPlan.classList.add('hidden'); panelFormPlan.classList.remove('hidden'); seccionPlanViendo = null;
    }
    function renderMenuPlanificacion() {
      menuSeccionesPlan.innerHTML = '';
      if(planesProfesor.length === 0) { menuSeccionesPlan.innerHTML = '<p class="text-xs text-center text-gray-400 mt-4">Sin planes registrados.</p>'; return; }
      const secUnicas = []; planesProfesor.forEach(p => { const key = `${p.ano}-${p.seccion}`; if(!secUnicas.find(s => s.key === key)) secUnicas.push({ key, ano: p.ano, seccion: p.seccion }); });
      secUnicas.sort((a,b) => a.key.localeCompare(b.key));
      secUnicas.forEach(sec => {
        const color = getColorAno(sec.ano);
        const btn = document.createElement('button'); btn.type = "button"; btn.className = `w-full text-left px-4 py-3 rounded-xl mb-2 font-bold text-sm border-l-4 shadow-sm transition hover:opacity-80 bg-white border border-gray-100 ${color.border} text-gray-700 flex justify-between items-center`;
        btn.innerHTML = `<span>${escaparHTML(sec.ano)} - Secc "${escaparHTML(sec.seccion)}"</span> <i class="fa-solid fa-chevron-right text-xs text-gray-400"></i>`;
        btn.onclick = () => mostrarListaPlan(sec.ano, sec.seccion); menuSeccionesPlan.appendChild(btn);
      });
    }
    window.mostrarListaPlan = function(ano, seccion) {
      panelFormPlan.classList.add('hidden'); panelListaPlan.classList.remove('hidden'); accionesPlan.classList.remove('hidden'); seccionPlanViendo = { ano, seccion };
      tituloPlan.textContent = `Plan de Evaluación`; subtituloPlan.textContent = `${ano} - Sección "${seccion}"`; tablaBodyPlan.innerHTML = '';
      const filtrados = planesProfesor.filter(p => p.ano === ano && p.seccion === seccion).sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
      let suma = 0;
      if(filtrados.length === 0){ tablaBodyPlan.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-400 text-xs">No hay evaluaciones cargadas.</td></tr>'; }
      else { filtrados.forEach((p, index) => {
          suma += parseInt(p.puntos); const [y, m, d] = p.fecha.split('-'); const fechaStr = `${d}/${m}/${y}`;
          const actividadSegura = escaparHTML(p.actividad || 'Evaluación');
          const puntosSeguros = escaparHTML(p.puntos || 0);
          const tr = document.createElement('tr');
          tr.innerHTML = `<td class="px-4 py-3 font-semibold text-gray-800">${fechaStr}</td><td class="px-4 py-3 text-gray-600">${actividadSegura}</td><td class="px-4 py-3 text-center font-black text-indigo-600">${puntosSeguros}</td><td class="px-4 py-3 text-center no-pdf"><button type="button" class="text-red-400 hover:text-red-600 transition" aria-label="Eliminar evaluación"><i class="fa-solid fa-trash-can"></i></button></td>`;
          tr.querySelector('button').addEventListener('click', () => eliminarPlanLocal(index, ano, seccion));
          tablaBodyPlan.appendChild(tr);
        }); }
      badgeTotalPlan.textContent = `Total: ${suma} pts`;
      if(suma > 100) badgeTotalPlan.className = "bg-red-100 text-red-800 px-3 py-1.5 rounded-lg font-black text-sm border border-red-200";
      else badgeTotalPlan.className = "bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-lg font-black text-sm border border-indigo-200";
    }
    window.eliminarPlanLocal = async function(indexReal, ano, seccion) {
      if (!confirm('¿Eliminar esta evaluación?')) return;
      const filtrado = planesProfesor.filter(p => p.ano === ano && p.seccion === seccion).sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
      const plan = filtrado[indexReal];
      if (!plan?.id) return mostrarToast('No se encontró el identificador de la evaluación.', 'error');
      try {
        await apiRequest('eliminarPlanificacion', { id: plan.id });
        planesProfesor = planesProfesor.filter(p => p.id !== plan.id);
        actualizarUIPlanificacion();
        mostrarListaPlan(ano, seccion);
        mostrarToast('La evaluación fue eliminada del registro del docente.', 'success', 'Evaluación eliminada');
      } catch (error) {
        mostrarToast(error.message, 'error', 'No se eliminó la evaluación');
      }
    }
    function renderCalendario() {
      const hoy = new Date(); const año = hoy.getFullYear(); const mes = hoy.getMonth();
      const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      mesCalendario.textContent = `${nombresMeses[mes]} ${año}`; gridCalendario.innerHTML = '';
      const primerDia = new Date(año, mes, 1).getDay(); const diasEnMes = new Date(año, mes + 1, 0).getDate();
      for (let i = 0; i < primerDia; i++) { const div = document.createElement('div'); div.className = "calendar-day bg-gray-50 rounded-lg border border-transparent"; gridCalendario.appendChild(div); }
      for (let dia = 1; dia <= diasEnMes; dia++) {
        const div = document.createElement('div'); const esHoy = (dia === hoy.getDate()); div.className = `calendar-day rounded-lg border p-1 relative ${esHoy ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100'}`;
        let htmlDia = `<span class="text-xs font-bold ${esHoy ? 'text-indigo-600' : 'text-gray-500'}">${dia}</span><div class="mt-1 flex flex-col gap-1">`;
        const fStr = `${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        planesProfesor.filter(p => p.fecha === fStr).forEach(p => { const color = getColorAno(p.ano); htmlDia += `<span class="eval-badge ${color.hex}" title="${escaparHTML(p.actividad || 'Evaluación')}">${escaparHTML(p.ano)} "${escaparHTML(p.seccion)}"</span>`; });
        div.innerHTML = htmlDia + `</div>`; gridCalendario.appendChild(div);
      }
    }
    function actualizarUIPlanificacion() { renderMenuPlanificacion(); renderCalendario(); }
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
      const acumulado = planesProfesor
        .filter(p => p.ano === objPlan.ano && p.seccion === objPlan.seccion)
        .reduce((total, p) => total + Number(p.puntos || 0), 0) + Number(objPlan.puntos || 0);
      if (acumulado > 100 && !confirm(`La planificación sumará ${acumulado} puntos. ¿Deseas continuar?`)) return;

      btnPlan.disabled = true;
      btnPlan.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin"></i> Guardando...';
      try {
        const resultado = await apiRequest('guardarPlanificacion', objPlan);
        planesProfesor.push(resultado.plan || objPlan);
        formPlanificacion.reset();
        actualizarUIPlanificacion();
        mostrarListaPlan(objPlan.ano, objPlan.seccion);
        mostrarToast('La evaluación quedó guardada en la cuenta del docente.', 'success', 'Evaluación guardada');
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
        await renderAgendaDiaria();
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
        await renderAgendaDiaria();
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
      const dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]; const hoy = dias[new Date().getDay()];
      const clases = horariosProfesor.filter(h => h.dia.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === hoy.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
      const box = document.getElementById('box-clases-hoy'); const lista = document.getElementById('lista-botones-clases-hoy');
      if (clases.length > 0) { box.classList.remove('hidden'); lista.innerHTML = ''; clases.forEach(c => { const btn = document.createElement('button'); btn.className = 'w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-2.5 rounded-xl shadow-sm transition border border-indigo-100 flex justify-between items-center'; btn.innerHTML = `<span>${escaparHTML(c.ano)} "${escaparHTML(c.seccion)}"</span> <span>${escaparHTML(formatearHoraLimpia(c.horaInicio))}</span>`; btn.onclick = () => { selectFiltroAno.value = c.ano; selectFiltroSeccion.value = c.seccion; selectFiltroTurno.value = c.turno; cargarAlumnosDeSeccion(); }; lista.appendChild(btn); }); } else { box.classList.add('hidden'); }
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
      const payload = { action: 'registrarAlumno', nombre: document.getElementById('reg-nombre').value.trim(), cedula: document.getElementById('reg-cedula').value.trim(), ano: document.getElementById('reg-ano').value, seccion: document.getElementById('reg-seccion').value, turno: turnoSel, repite: document.getElementById('reg-repite').value, materiaPendiente: document.getElementById('reg-pendiente').value, direccion: document.getElementById('reg-direccion').value.trim(), representante: document.getElementById('reg-representante').value.trim(), telefonoRep: document.getElementById('reg-telefono-rep').value.trim(), emailRep: document.getElementById('reg-email-rep').value.trim() };
      try {
        delete payload.action;
        const data = await apiRequest('registrarAlumno', payload);
        mostrarToast(data.message || 'El estudiante fue registrado correctamente.', 'success', 'Estudiante registrado');
        formRegistroManual.reset();
      } catch (err) {
        console.error('Error al registrar estudiante:', err);
        mostrarToast('Verifica la conexión e inténtalo nuevamente.', 'error', 'No se registró el estudiante');
      } finally { btn.disabled = false; btn.innerHTML = `<i class="fa-solid fa-user-plus"></i> Registrar Alumno`; }
    });

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
