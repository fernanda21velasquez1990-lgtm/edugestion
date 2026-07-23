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

    tabAsistencia.addEventListener('click', async () => {
      cambiarPestana(tabAsistencia, sectionAsistencia);
      await renderAgendaAsistencia();
    });
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
    ['tab-asistencia', 'tab-planificacion', 'tab-actas', 'tab-registro', 'tab-horario'].forEach(id => {
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

    document.getElementById(IDS.from).value = primerDiaMesIso();
    document.getElementById(IDS.to).value = hoyIso();

    tab.addEventListener('click', abrirEstadisticas);
    ['tab-asistencia', 'tab-planificacion', 'tab-actas', 'tab-registro', 'tab-horario', 'tab-auditoria'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', cerrarEstadisticas, { capture: true });
    });
    document.getElementById(IDS.apply)?.addEventListener('click', () => cargarEstadisticas(true));
    document.getElementById(IDS.refresh)?.addEventListener('click', () => cargarEstadisticas(true, true));
    document.getElementById(IDS.clear)?.addEventListener('click', restablecerFiltros);
    document.getElementById(IDS.export)?.addEventListener('click', exportarCsv);
    document.getElementById(IDS.pdf)?.addEventListener('click', generarPdfProfesional);
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

    const reporte = construirReportePdf();
    const hostPdf = document.createElement('div');
    hostPdf.className = 'stats-pdf-render-host';
    hostPdf.setAttribute('aria-hidden', 'true');
    hostPdf.appendChild(reporte);

    const scrollAnterior = { x: window.scrollX, y: window.scrollY };
    document.body.appendChild(hostPdf);
    window.scrollTo(0, 0);

    const desde = String(document.getElementById(IDS.from)?.value || 'inicio');
    const hasta = String(document.getElementById(IDS.to)?.value || 'fin');
    const archivo = `Informe_Asistencia_Horizontal_${desde}_${hasta}.pdf`;

    try {
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const anchoCaptura = Math.max(1123, Math.ceil(reporte.scrollWidth || reporte.getBoundingClientRect().width));
      const altoCaptura = Math.max(794, Math.ceil(reporte.scrollHeight || reporte.getBoundingClientRect().height));

      await html2pdf().set({
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
      }).from(reporte).save();
      if (typeof mostrarToast === 'function') mostrarToast('El informe PDF se generó correctamente.', 'success', 'Informe descargado');
    } catch (error) {
      console.error('No se pudo generar el informe PDF:', error);
      if (typeof mostrarToast === 'function') mostrarToast(error.message || 'No se pudo generar el PDF.', 'error', 'Error de PDF');
    } finally {
      hostPdf.remove();
      window.scrollTo(scrollAnterior.x, scrollAnterior.y);
      if (boton) {
        boton.disabled = false;
        boton.classList.remove('is-loading');
        boton.innerHTML = contenidoAnterior;
      }
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
/* EDUGESTION_STATS_PANEL_V1_END */
