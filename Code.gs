/**
 * EduGestión 2026 - Backend seguro multiusuario
 * Google Apps Script vinculado a una Hoja de cálculo.
 *
 * Seguridad aplicada:
 * - Inicio de sesión con usuario y contraseña.
 * - Contraseñas con HMAC-SHA-256, salt individual y clave interna del servidor (nunca texto plano).
 * - Sesiones temporales de 6 horas.
 * - Cada lectura/escritura se filtra en el servidor por idProfesor.
 * - El cliente nunca decide qué docente es propietario de un registro.
 */

var EG = Object.freeze({
  DB_PROPERTY: 'EDUGESTION_SPREADSHEET_ID',
  PEPPER_PROPERTY: 'EDUGESTION_PASSWORD_PEPPER',
  SESSION_PREFIX: 'eg_session_',
  SESSION_TTL_SECONDS: 21600,
  LOGIN_LIMIT: 8,
  LOGIN_WINDOW_SECONDS: 600,
  SHEETS: Object.freeze({
    DOCENTES: 'Docentes',
    ALUMNOS: 'Alumnos',
    ASISTENCIA: 'Asistencia',
    PLANIFICACION: 'Planificacion',
    HORARIOS: 'Horarios',
    ACTAS: 'Actas',
    AUDITORIA_ASISTENCIA: 'AuditoriaAsistencia',
    CONFIGURACION: 'Configuracion',
    CALIFICACIONES: 'Calificaciones',
    BIBLIOTECA: 'BibliotecaDigital',
    ASISTENCIA_DOCENTES: 'AsistenciaDocentes',
    ESTADO_DOCENTE: 'EstadoDocente',
    CHAT_INTERNO: 'ChatInterno',
    EVALUACION_SEGUIMIENTO: 'EvaluacionSeguimiento',
    SEGUIMIENTO_ACADEMICO: 'SeguimientoAcademico'
  }),
  HEADERS: Object.freeze({
    Docentes: [
      'id', 'usuario', 'claveHash', 'salt', 'nombre', 'materia', 'email',
      'telefono', 'seccion', 'turno', 'rol', 'activo', 'creadoEn', 'actualizadoEn'
    ],
    Alumnos: [
      'id', 'idProfesor', 'nombre', 'cedula', 'ano', 'seccion', 'turno',
      'repite', 'materiaPendiente', 'direccion', 'representante',
      'telefonoRepresentante', 'emailRepresentante', 'practicaDeporte', 'deporte',
      'tieneHermanosInstitucion', 'hermanosInstitucion', 'tieneAlergia', 'alergias',
      'observaciones', 'creadoEn', 'actualizadoEn'
    ],
    Asistencia: [
      'id', 'idProfesor', 'materia', 'ano', 'seccion', 'turno', 'fecha',
      'idAlumno', 'alumno', 'estado', 'actualizadoEn'
    ],
    Planificacion: [
      'id', 'idProfesor', 'ano', 'seccion', 'actividad', 'puntos', 'fecha',
      'creadoEn', 'actualizadoEn'
    ],
    Horarios: [
      'id', 'idProfesor', 'dia', 'horaInicio', 'horaFin', 'ano', 'seccion',
      'turno', 'creadoEn', 'actualizadoEn'
    ],
    Actas: [
      'id', 'idProfesor', 'idAlumno', 'alumno', 'tipo', 'titulo', 'fecha',
      'mensaje', 'emailRepresentante', 'creadoEn'
    ],
    AuditoriaAsistencia: [
      'id', 'idProfesor', 'docente', 'origen', 'actorId', 'actorNombre',
      'accion', 'materia', 'ano', 'seccion', 'turno', 'fecha', 'idAlumno',
      'alumno', 'estadoAnterior', 'estadoNuevo', 'registradoEn'
    ],
    Configuracion: ['clave', 'valor', 'actualizadoEn'],
    Calificaciones: [
      'id', 'idProfesor', 'idAlumno', 'alumno', 'cedula', 'materia',
      'ano', 'seccion', 'turno', 'actividad', 'nota', 'notaMaxima',
      'fecha', 'periodo', 'creadoEn', 'actualizadoEn'
    ],
    BibliotecaDigital: [
      'id', 'idProfesor', 'tipo', 'titulo', 'categoria', 'area',
      'descripcion', 'etiquetas', 'url', 'archivoId', 'archivoNombre',
      'mimeType', 'tamanoBytes', 'apunte', 'favorito', 'creadoEn', 'actualizadoEn'
    ],
    AsistenciaDocentes: [
      'id', 'idProfesor', 'docente', 'fecha', 'estado',
      'horaLlegada', 'horaSalida', 'minutosTrabajados',
      'motivoAusencia', 'observacion', 'origen', 'creadoEn', 'actualizadoEn'
    ],
    EstadoDocente: [
      'id', 'idProfesor', 'clave', 'parte', 'totalPartes', 'valorJson', 'creadoEn', 'actualizadoEn'
    ],
    ChatInterno: [
      'id', 'idDocente', 'docente', 'idRemitente', 'rolRemitente',
      'nombreRemitente', 'mensaje', 'leidoDocente', 'leidoDirector',
      'origen', 'creadoEn', 'actualizadoEn', 'activo'
    ],
    EvaluacionSeguimiento: [
      'id', 'idProfesor', 'materia', 'ano', 'seccion', 'turno', 'lapso',
      'idActividad', 'actividad', 'puntos', 'fechaPlanificada',
      'idAlumno', 'alumno', 'estadoEntrega', 'fechaEntrega', 'nota',
      'observacion', 'creadoEn', 'actualizadoEn'
    ],
    SeguimientoAcademico: [
      'id', 'idProfesor', 'materia', 'ano', 'seccion', 'turno', 'lapso',
      'idAlumno', 'alumno', 'tipo', 'fecha', 'motivo', 'medio',
      'representante', 'compromiso', 'observacion', 'creadoEn', 'actualizadoEn'
    ]
  })
});

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('EduGestión')
    .addItem('1. Instalar o reparar estructura', 'instalarSistema')
    .addSeparator()
    .addItem('Crear docente', 'crearDocenteDesdeMenu')
    .addItem('Crear o actualizar director', 'crearDirectorDesdeMenu')
    .addItem('Preparar acceso Director / Control', 'prepararAccesoInstitucionalDesdeMenu')
    .addItem('Restablecer contraseña', 'restablecerClaveDesdeMenu')
    .addItem('Activar o desactivar docente', 'cambiarEstadoDocenteDesdeMenu')
    .addSeparator()
    .addItem('Configurar institución', 'configurarInstitucionDesdeMenu')
    .addItem('Preparar hoja de calificaciones', 'prepararHojaCalificaciones')
    .addItem('Preparar biblioteca digital', 'prepararBibliotecaDigital')
    .addItem('Preparar asistencia docente', 'prepararAsistenciaDocente')
    .addItem('Preparar persistencia docente', 'prepararPersistenciaDocente')
    .addToUi();
}

function instalarSistema() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Este código debe estar vinculado a una Hoja de cálculo de Google.');

  var propiedades = PropertiesService.getScriptProperties();
  propiedades.setProperty(EG.DB_PROPERTY, ss.getId());
  if (!propiedades.getProperty(EG.PEPPER_PROPERTY)) {
    propiedades.setProperty(EG.PEPPER_PROPERTY, digestToken_(Utilities.getUuid() + '|' + Date.now() + '|' + Math.random()));
  }
  Object.keys(EG.HEADERS).forEach(function(nombre) {
    asegurarHoja_(ss, nombre, EG.HEADERS[nombre]);
  });

  establecerConfiguracionSiFalta_('institucion', ss.getName());
  completarIdsFaltantes_();

  SpreadsheetApp.getUi().alert(
    'Instalación completada',
    'La base de datos quedó preparada. Ahora usa el menú EduGestión → Crear docente para generar las cuentas.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function crearDocenteDesdeMenu() {
  verificarInstalacion_();
  var ui = SpreadsheetApp.getUi();
  var usuario = pedirDato_(ui, 'Crear docente', 'Usuario único (ejemplo: maria.perez):');
  if (usuario === null) return;
  var nombre = pedirDato_(ui, 'Crear docente', 'Nombre completo del docente:');
  if (nombre === null) return;
  var clave = pedirDato_(ui, 'Crear docente', 'Contraseña temporal (mínimo 8 caracteres):');
  if (clave === null) return;
  var materia = pedirDato_(ui, 'Crear docente', 'Materia principal:');
  if (materia === null) return;
  var email = pedirDatoOpcional_(ui, 'Crear docente', 'Correo electrónico (opcional):');
  if (email === null) return;
  var telefono = pedirDatoOpcional_(ui, 'Crear docente', 'Teléfono/WhatsApp (opcional):');
  if (telefono === null) return;
  var seccion = pedirDatoOpcional_(ui, 'Crear docente', 'Sección predeterminada, por ejemplo A (opcional):');
  if (seccion === null) return;
  var turno = pedirDatoOpcional_(ui, 'Crear docente', 'Turno predeterminado: Manana o Tarde (opcional):');
  if (turno === null) return;

  try {
    crearDocente_(usuario, clave, {
      nombre: nombre,
      materia: materia,
      email: email,
      telefono: telefono,
      seccion: seccion || 'A',
      turno: normalizarTurno_(turno || 'Manana'),
      rol: 'docente'
    });
    ui.alert('Cuenta creada', 'El docente ya puede ingresar con el usuario "' + normalizarUsuario_(usuario) + '".', ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('No se creó la cuenta', error.message, ui.ButtonSet.OK);
  }
}


function crearDirectorDesdeMenu() {
  verificarInstalacion_();
  var ui = SpreadsheetApp.getUi();
  var usuario = pedirDato_(ui, 'Cuenta del director', 'Usuario especial del director:');
  if (usuario === null) return;
  var nombre = pedirDato_(ui, 'Cuenta del director', 'Nombre completo del director:');
  if (nombre === null) return;
  var clave = pedirDato_(ui, 'Cuenta del director', 'Clave especial (mínimo 10 caracteres):');
  if (clave === null) return;
  if (String(clave).length < 10) {
    ui.alert('Clave insuficiente', 'La clave del director debe tener al menos 10 caracteres.', ui.ButtonSet.OK);
    return;
  }

  try {
    var tabla = leerObjetos_(EG.SHEETS.DOCENTES);
    var existente = tabla.objetos.filter(function(d) {
      return normalizarUsuario_(d.usuario) === normalizarUsuario_(usuario);
    })[0];

    if (existente) {
      var salt = crearSalt_();
      actualizarFilaObjeto_(EG.SHEETS.DOCENTES, existente.__row, {
        nombre: nombre,
        materia: 'Dirección institucional',
        rol: 'director',
        activo: 'SI',
        salt: salt,
        claveHash: hashClave_(clave, salt),
        actualizadoEn: ahora_()
      });
      invalidarSesionesDocente_(existente.id);
    } else {
      crearDocente_(usuario, clave, {
        nombre: nombre,
        materia: 'Dirección institucional',
        email: '',
        telefono: '',
        seccion: 'TODAS',
        turno: 'Manana',
        rol: 'director'
      });
    }

    ui.alert(
      'Cuenta del director preparada',
      'El director podrá entrar con el usuario "' + normalizarUsuario_(usuario) + '" y tendrá acceso exclusivamente al panel institucional de solo lectura.',
      ui.ButtonSet.OK
    );
  } catch (error) {
    ui.alert('No se preparó la cuenta', error.message, ui.ButtonSet.OK);
  }
}

function restablecerClaveDesdeMenu() {
  verificarInstalacion_();
  var ui = SpreadsheetApp.getUi();
  var usuario = pedirDato_(ui, 'Restablecer contraseña', 'Usuario del docente:');
  if (usuario === null) return;
  var nuevaClave = pedirDato_(ui, 'Restablecer contraseña', 'Nueva contraseña (mínimo 8 caracteres):');
  if (nuevaClave === null) return;

  try {
    cambiarClaveAdministrativa_(usuario, nuevaClave);
    ui.alert('Contraseña actualizada', 'La nueva contraseña ya está activa.', ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('No se actualizó', error.message, ui.ButtonSet.OK);
  }
}

function cambiarEstadoDocenteDesdeMenu() {
  verificarInstalacion_();
  var ui = SpreadsheetApp.getUi();
  var usuario = pedirDato_(ui, 'Activar o desactivar', 'Usuario del docente:');
  if (usuario === null) return;
  var tabla = leerObjetos_(EG.SHEETS.DOCENTES);
  var docente = tabla.objetos.filter(function(d) {
    return normalizarUsuario_(d.usuario) === normalizarUsuario_(usuario);
  })[0];
  if (!docente) {
    ui.alert('Docente no encontrado', 'No existe ese usuario.', ui.ButtonSet.OK);
    return;
  }
  var nuevoEstado = esActivo_(docente.activo) ? 'NO' : 'SI';
  actualizarFilaObjeto_(EG.SHEETS.DOCENTES, docente.__row, {
    activo: nuevoEstado,
    actualizadoEn: ahora_()
  });
  invalidarSesionesDocente_(docente.id);
  ui.alert('Estado actualizado', 'La cuenta quedó ' + (nuevoEstado === 'SI' ? 'ACTIVA.' : 'DESACTIVADA.'), ui.ButtonSet.OK);
}




function prepararAsistenciaDocente() {
  verificarInstalacion_();
  asegurarHoja_(getDb_(), EG.SHEETS.ASISTENCIA_DOCENTES, EG.HEADERS.AsistenciaDocentes);
  SpreadsheetApp.getUi().alert(
    'Asistencia docente preparada',
    'La hoja AsistenciaDocentes quedó disponible para registrar entradas, salidas y ausencias.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}


function prepararPersistenciaDocente() {
  verificarInstalacion_();
  asegurarHoja_(getDb_(), EG.SHEETS.ESTADO_DOCENTE, EG.HEADERS.EstadoDocente);
  SpreadsheetApp.getUi().alert(
    'Persistencia docente preparada',
    'La hoja EstadoDocente quedó lista para conservar configuraciones y avances de cada profesor en la nube.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function prepararBibliotecaDigital() {
  verificarInstalacion_();
  asegurarHoja_(getDb_(), EG.SHEETS.BIBLIOTECA, EG.HEADERS.BibliotecaDigital);
  obtenerOCrearCarpetaBibliotecaRaiz_();
  SpreadsheetApp.getUi().alert(
    'Biblioteca digital preparada',
    'La hoja BibliotecaDigital y la carpeta de Google Drive quedaron disponibles.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function prepararHojaCalificaciones() {
  verificarInstalacion_();
  asegurarHoja_(getDb_(), EG.SHEETS.CALIFICACIONES, EG.HEADERS.Calificaciones);
  SpreadsheetApp.getUi().alert(
    'Hoja preparada',
    'La hoja Calificaciones quedó disponible. El panel del director mostrará promedios cuando existan notas registradas.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function configurarInstitucionDesdeMenu() {
  verificarInstalacion_();
  var ui = SpreadsheetApp.getUi();
  var nombre = pedirDato_(ui, 'Configurar institución', 'Nombre oficial de la institución:');
  if (nombre === null) return;
  establecerConfiguracion_('institucion', nombre);
  ui.alert('Configuración guardada', 'El nombre aparecerá en los documentos de EduGestión.', ui.ButtonSet.OK);
}

function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};
  var tokenEncuesta = String(
    params.encuestaPersonal ||
    params.tokenEncuesta ||
    params.token ||
    ''
  ).trim();

  if (tokenEncuesta) {
    if (typeof generarEncuestaPersonalHtml !== 'function') {
      return HtmlService.createHtmlOutput(
        '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>EduGestión</title></head><body style="font-family:Arial;padding:30px">' +
        '<h2>Encuesta no disponible</h2>' +
        '<p>El módulo EncuestaPersonal.gs no está instalado.</p>' +
        '</body></html>'
      );
    }
    return generarEncuestaPersonalHtml(tokenEncuesta);
  }

  return json_({
    status: 'success',
    service: 'EduGestión API',
    version: '2.5.3-persistencia-docente',
    message: 'Servidor activo.'
  });
}

function doPost(e) {
  try {
    verificarInstalacion_();
    var payload = parsearPayload_(e);
    var action = String(payload.action || '').trim();
    if (!action) lanzar_('Falta indicar la acción.', 'BAD_REQUEST');

    if (action === 'loginProfesor') return json_(loginProfesor_(payload));

    // FASE 21S-B: recepción pública de la encuesta individual del personal.
    // Se valida por Token_Encuesta dentro de EncuestaPersonal.gs y no requiere sesión.
    if (action === 'guardarEncuestaPersonalPublica') {
      if (typeof registrarEncuestaPersonalPublica_ !== 'function') {
        lanzar_('El módulo EncuestaPersonal.gs no está instalado.', 'ENCUESTA_MODULE_REQUIRED');
      }
      return json_(registrarEncuestaPersonalPublica_(payload));
    }

    // Acciones exclusivas del bot de Telegram. Se autentican con
    // EDUGESTION_BOT_SECRET y no dependen de una sesión del navegador.
    if (action.indexOf('bot') === 0) {
      return json_(manejarAccionTelegram_(action, payload));
    }

    if (action === 'botObtenerAsistenciaDocente') return responder_(botObtenerAsistenciaDocente_(payload));
    if (action === 'botRegistrarLlegadaDocente') return responder_(botRegistrarLlegadaDocente_(payload));
    if (action === 'botRegistrarSalidaDocente') return responder_(botRegistrarSalidaDocente_(payload));
    if (action === 'botRegistrarAusenciaDocente') return responder_(botRegistrarAusenciaDocente_(payload));

    var sesion = exigirSesion_(payload.token);
    var respuesta;
    var rolSesion = normalizarRol_(sesion.docente.rol);

    if (rolSesion === 'director') {
      var accionesDirector = [
        'validarSesion', 'logout', 'cambiarClave', 'obtenerPanelDirector',
        'obtenerChatContexto', 'obtenerConversacionesChat',
        'obtenerConversacionChat', 'enviarMensajeChat', 'marcarChatLeido',
        'obtenerRegistroPersonalInstitucion', 'guardarRegistroPersonalInstitucion',
        'eliminarRegistroPersonalInstitucion', 'cambiarEstadoRegistroPersonalInstitucion',
        'obtenerTokenEncuestaRegistroPersonal', 'obtenerUrlEncuestaRegistroPersonal'
      ];
      if (accionesDirector.indexOf(action) === -1) {
        lanzar_('La cuenta del director es de consulta y no puede modificar información.', 'READ_ONLY');
      }
    } else if (rolSesion === 'control_estudio') {
      var accionesControl = [
        'validarSesion', 'logout', 'cambiarClave', 'obtenerPanelDirector'
      ];
      if (accionesControl.indexOf(action) === -1) {
        lanzar_('Control de Estudio tiene acceso institucional de consulta. No puede modificar información privada de los docentes.', 'READ_ONLY');
      }
    } else if (action === 'obtenerPanelDirector') {
      lanzar_('Esta sección es exclusiva de Dirección y Control de Estudio.', 'FORBIDDEN');
    }

    switch (action) {
      case 'validarSesion':
        respuesta = { status: 'success', profesor: perfilPublico_(sesion.docente) };
        break;
      case 'logout':
        cerrarSesion_(payload.token);
        respuesta = { status: 'success', message: 'Sesión cerrada.' };
        break;
      case 'obtenerDatosIniciales':
        respuesta = obtenerDatosIniciales_(sesion.docente);
        break;
      case 'obtenerBiblioteca':
        respuesta = obtenerBiblioteca_(sesion.docente);
        break;
      case 'obtenerAsistenciaDocente':
        respuesta = obtenerAsistenciaDocente_(sesion.docente, payload);
        break;
      case 'registrarLlegadaDocente':
        respuesta = registrarLlegadaDocente_(sesion.docente, payload, 'Web');
        break;
      case 'registrarSalidaDocente':
        respuesta = registrarSalidaDocente_(sesion.docente, payload, 'Web');
        break;
      case 'registrarAusenciaDocente':
        respuesta = registrarAusenciaDocente_(sesion.docente, payload, 'Web');
        break;
      case 'guardarAsistenciaDocenteManual':
        respuesta = guardarAsistenciaDocenteManual_(sesion.docente, payload, 'Web manual');
        break;
      case 'eliminarAsistenciaDocente':
        respuesta = eliminarAsistenciaDocente_(sesion.docente, payload);
        break;
      case 'obtenerEstadoDocente':
        respuesta = obtenerEstadoDocente_(sesion.docente, payload);
        break;
      case 'guardarEstadoDocente':
        respuesta = guardarEstadoDocente_(sesion.docente, payload);
        break;
      case 'guardarEstadosDocente':
        respuesta = guardarEstadosDocente_(sesion.docente, payload);
        break;
      case 'eliminarEstadoDocente':
        respuesta = eliminarEstadoDocente_(sesion.docente, payload);
        break;
      case 'guardarRecursoBiblioteca':
        respuesta = guardarRecursoBiblioteca_(sesion.docente, payload);
        break;
      case 'subirArchivoBiblioteca':
        respuesta = subirArchivoBiblioteca_(sesion.docente, payload);
        break;
      case 'eliminarRecursoBiblioteca':
        respuesta = eliminarRecursoBiblioteca_(sesion.docente, payload);
        break;
      case 'alternarFavoritoBiblioteca':
        respuesta = alternarFavoritoBiblioteca_(sesion.docente, payload);
        break;
      case 'importarCarpetaDriveBiblioteca':
        respuesta = importarCarpetaDriveBiblioteca_(sesion.docente, payload);
        break;
      case 'previsualizarCarpetaDriveBiblioteca':
        respuesta = previsualizarCarpetaDriveBiblioteca_(sesion.docente, payload);
        break;
      case 'obtenerControlEstudio':
        respuesta = obtenerControlEstudioWeb_(sesion.docente, payload);
        break;
      case 'crearActividadControlEstudio':
        respuesta = crearActividadControlEstudioWeb_(sesion.docente, payload);
        break;
      case 'guardarCalificacionesControlEstudio':
        respuesta = guardarCalificacionesControlEstudioWeb_(sesion.docente, payload);
        break;
      case 'obtenerHistorialCierres':
        respuesta = obtenerHistorialCierresWeb_(sesion.docente, payload);
        break;
      case 'registrarHistorialCierre':
        respuesta = registrarHistorialCierreWeb_(sesion.docente, payload);
        break;
      case 'actualizarHistorialCierre':
        respuesta = actualizarHistorialCierreWeb_(sesion.docente, payload);
        break;
      case 'eliminarHistorialCierre':
        respuesta = eliminarHistorialCierreWeb_(sesion.docente, payload);
        break;
      case 'obtenerChatContexto':
        respuesta = obtenerChatContexto_(sesion.docente, payload);
        break;
      case 'obtenerConversacionesChat':
        respuesta = obtenerConversacionesChat_(sesion.docente, payload);
        break;
      case 'obtenerConversacionChat':
        respuesta = obtenerConversacionChat_(sesion.docente, payload);
        break;
      case 'enviarMensajeChat':
        respuesta = enviarMensajeChat_(sesion.docente, payload);
        break;
      case 'marcarChatLeido':
        respuesta = marcarChatLeido_(sesion.docente, payload);
        break;
      case 'obtenerAgendaContexto':
        respuesta = obtenerAgendaContexto_(sesion.docente, payload);
        break;
      case 'obtenerAgendaResumen':
        respuesta = obtenerAgendaResumen_(sesion.docente, payload);
        break;
      case 'listarAgendaEventos':
        respuesta = listarAgendaEventos_(sesion.docente, payload);
        break;
      case 'guardarAgendaEvento':
        respuesta = guardarAgendaEvento_(sesion.docente, payload);
        break;
      case 'eliminarAgendaEvento':
        respuesta = eliminarAgendaEvento_(sesion.docente, payload);
        break;
      case 'listarAgendaNotas':
        respuesta = listarAgendaNotas_(sesion.docente, payload);
        break;
      case 'guardarAgendaNota':
        respuesta = guardarAgendaNota_(sesion.docente, payload);
        break;
      case 'eliminarAgendaNota':
        respuesta = eliminarAgendaNota_(sesion.docente, payload);
        break;
      case 'listarAgendaBitacora':
        respuesta = listarAgendaBitacora_(sesion.docente, payload);
        break;
      case 'guardarAgendaBitacora':
        respuesta = guardarAgendaBitacora_(sesion.docente, payload);
        break;
      case 'eliminarAgendaBitacora':
        respuesta = eliminarAgendaBitacora_(sesion.docente, payload);
        break;
      case 'listarInventarioDeportivo':
        respuesta = listarInventarioDeportivo_(sesion.docente, payload);
        break;
      case 'guardarInventarioDeportivo':
        respuesta = guardarInventarioDeportivo_(sesion.docente, payload);
        break;
      case 'eliminarInventarioDeportivo':
        respuesta = eliminarInventarioDeportivo_(sesion.docente, payload);
        break;
      case 'listarPrestamosMaterial':
        respuesta = listarPrestamosMaterial_(sesion.docente, payload);
        break;
      case 'guardarPrestamoMaterial':
        respuesta = guardarPrestamoMaterial_(sesion.docente, payload);
        break;
      case 'actualizarEstadoPrestamo':
        respuesta = actualizarEstadoPrestamo_(sesion.docente, payload);
        break;
      case 'eliminarPrestamoMaterial':
        respuesta = eliminarPrestamoMaterial_(sesion.docente, payload);
        break;
      case 'obtenerJuegosEscolares':
        respuesta = obtenerJuegosEscolares_(sesion.docente, payload);
        break;
      case 'guardarJuegosEscolares':
        respuesta = guardarJuegosEscolares_(sesion.docente, payload);
        break;
      case 'obtenerPanelDirector':
        respuesta = obtenerPanelDirector_(sesion.docente, payload);
        break;
      case 'obtenerRegistroPersonalInstitucion':
        respuesta = obtenerRegistroPersonalInstitucionApi_(sesion.docente, payload);
        break;
      case 'guardarRegistroPersonalInstitucion':
        respuesta = guardarRegistroPersonalInstitucionApi_(sesion.docente, payload);
        break;
      case 'eliminarRegistroPersonalInstitucion':
        respuesta = eliminarRegistroPersonalInstitucionApi_(sesion.docente, payload);
        break;
      case 'cambiarEstadoRegistroPersonalInstitucion':
        respuesta = cambiarEstadoRegistroPersonalInstitucionApi_(sesion.docente, payload);
        break;
      case 'obtenerTokenEncuestaRegistroPersonal':
        respuesta = obtenerTokenEncuestaRegistroPersonalApi_(sesion.docente, payload);
        break;
      case 'obtenerUrlEncuestaRegistroPersonal':
        respuesta = obtenerUrlEncuestaRegistroPersonalApi_(sesion.docente, payload);
        break;
      case 'obtenerAlumnos':
        respuesta = obtenerAlumnos_(sesion.docente, payload);
        break;
      case 'registrarAlumno':
        respuesta = registrarAlumno_(sesion.docente, payload);
        break;
      case 'actualizarAlumno':
        respuesta = actualizarAlumno_(sesion.docente, payload);
        break;
      case 'eliminarAlumnoDuplicado':
        respuesta = eliminarAlumnoDuplicado_(sesion.docente, payload);
        break;
      case 'obtenerAsistencia':
        respuesta = obtenerAsistencia_(sesion.docente, payload);
        break;
      case 'obtenerAuditoriaAsistencia':
        respuesta = obtenerAuditoriaAsistencia_(sesion.docente, payload);
        break;
      case 'obtenerEstadisticasAsistencia':
        respuesta = obtenerEstadisticasAsistencia_(sesion.docente, payload);
        break;
      case 'guardarAsistencia':
        respuesta = guardarAsistencia_(sesion.docente, payload);
        break;
      case 'obtenerGestionEvaluaciones':
        respuesta = obtenerGestionEvaluaciones_(sesion.docente, payload);
        break;
      case 'guardarRegistrosEvaluacion':
        respuesta = guardarRegistrosEvaluacion_(sesion.docente, payload);
        break;
      case 'registrarSeguimientoAcademico':
        respuesta = registrarSeguimientoAcademico_(sesion.docente, payload);
        break;
      case 'obtenerSeguimientoAcademico':
        respuesta = obtenerSeguimientoAcademico_(sesion.docente, payload);
        break;
      case 'guardarPlanificacion':
        respuesta = guardarPlanificacion_(sesion.docente, payload);
        break;
      case 'eliminarPlanificacion':
        respuesta = eliminarPropio_(EG.SHEETS.PLANIFICACION, sesion.docente.id, payload.id, 'Evaluación eliminada.');
        break;
      case 'guardarHorario':
        respuesta = guardarHorario_(sesion.docente, payload);
        break;
      case 'eliminarHorario':
        respuesta = eliminarPropio_(EG.SHEETS.HORARIOS, sesion.docente.id, payload.id, 'Bloque eliminado.');
        break;
      case 'registrarActa':
        respuesta = registrarActa_(sesion.docente, payload);
        break;
      case 'enviarCorreo':
        respuesta = enviarCorreo_(sesion.docente, payload);
        break;
      case 'cambiarClave':
        respuesta = cambiarClavePropia_(sesion.docente, payload);
        break;
      case 'crearCodigoTelegram':
        respuesta = crearCodigoTelegram_(sesion.docente);
        break;
      case 'estadoTelegram':
        respuesta = estadoTelegram_(sesion.docente);
        break;
      case 'desvincularTelegram':
        respuesta = desvincularTelegram_(sesion.docente);
        break;
      default:
        lanzar_('Acción no reconocida.', 'BAD_REQUEST');
    }

    return json_(respuesta);
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return json_({
      status: 'error',
      code: error.code || 'SERVER_ERROR',
      message: error.message || 'Ocurrió un error interno.'
    });
  }
}


/* =========================================================
 * EduGestión · FASE 21R-B
 * CONEXIÓN REGISTRO DE PERSONAL ↔ GOOGLE SHEETS
 * Requiere RegistroPersonal.gs instalado en el mismo proyecto.
 * Solo Dirección puede consultar/modificar estos registros.
 * ========================================================= */

function exigirDirectorRegistroPersonal_(cuenta) {
  if (normalizarRol_(cuenta && cuenta.rol) !== 'director') {
    lanzar_('El Registro de Personal es exclusivo de Dirección.', 'FORBIDDEN');
  }
}

function verificarModuloRegistroPersonal_() {
  if (
    typeof listarPersonalInstitucion !== 'function' ||
    typeof guardarPersonalInstitucion !== 'function' ||
    typeof eliminarPersonalInstitucion !== 'function'
  ) {
    lanzar_(
      'Falta el archivo RegistroPersonal.gs o no está actualizado. Instala primero la FASE 21R.',
      'PERSONAL_MODULE_REQUIRED'
    );
  }
}

function obtenerRegistroPersonalInstitucionApi_(director, payload) {
  exigirDirectorRegistroPersonal_(director);
  verificarModuloRegistroPersonal_();

  var filtros = {
    buscar: String(payload.buscar || ''),
    tipo: String(payload.tipo || ''),
    turno: String(payload.turno || ''),
    estadoRegistro: String(payload.estadoRegistro || '')
  };

  var personal = listarPersonalInstitucion(filtros);

  return {
    status: 'success',
    personal: personal,
    total: personal.length
  };
}

function guardarRegistroPersonalInstitucionApi_(director, payload) {
  exigirDirectorRegistroPersonal_(director);
  verificarModuloRegistroPersonal_();

  var datos = payload && payload.datos && typeof payload.datos === 'object'
    ? payload.datos
    : payload;

  var resultado = guardarPersonalInstitucion(datos || {});

  return {
    status: 'success',
    message: 'Registro de personal guardado correctamente.',
    id: resultado && resultado.id ? resultado.id : '',
    fila: resultado && resultado.fila ? resultado.fila : '',
    registro: resultado && resultado.registro ? resultado.registro : null
  };
}

function eliminarRegistroPersonalInstitucionApi_(director, payload) {
  exigirDirectorRegistroPersonal_(director);
  verificarModuloRegistroPersonal_();

  var id = String(payload.id || '').trim();
  if (!id) lanzar_('Falta el ID del registro.', 'BAD_REQUEST');

  var resultado = eliminarPersonalInstitucion(id);
  if (!resultado || resultado.ok === false) {
    lanzar_((resultado && resultado.mensaje) || 'No se encontró el registro.', 'NOT_FOUND');
  }

  return {
    status: 'success',
    message: 'Registro eliminado correctamente.',
    id: id
  };
}

function cambiarEstadoRegistroPersonalInstitucionApi_(director, payload) {
  exigirDirectorRegistroPersonal_(director);
  verificarModuloRegistroPersonal_();

  if (typeof cambiarEstadoPersonalInstitucion !== 'function') {
    lanzar_('La función de estados del Registro de Personal no está disponible.', 'PERSONAL_MODULE_REQUIRED');
  }

  var id = String(payload.id || '').trim();
  var estado = String(payload.estado || '').trim();
  if (!id || !estado) lanzar_('Faltan el ID o el estado.', 'BAD_REQUEST');

  var resultado = cambiarEstadoPersonalInstitucion(id, estado);

  return {
    status: 'success',
    message: 'Estado del registro actualizado.',
    id: id,
    estado: resultado && resultado.estado ? resultado.estado : estado
  };
}

function obtenerTokenEncuestaRegistroPersonalApi_(director, payload) {
  exigirDirectorRegistroPersonal_(director);
  verificarModuloRegistroPersonal_();

  if (typeof obtenerTokenEncuestaPersonal !== 'function') {
    lanzar_('La función de encuesta del Registro de Personal no está disponible.', 'PERSONAL_MODULE_REQUIRED');
  }

  var id = String(payload.id || '').trim();
  if (!id) lanzar_('Falta el ID del registro.', 'BAD_REQUEST');

  var resultado = obtenerTokenEncuestaPersonal(id);

  return {
    status: 'success',
    id: id,
    tokenEncuesta: resultado && resultado.token ? resultado.token : ''
  };
}

/* EDUGESTION_FASE_21R_B_REGISTRO_PERSONAL_API_END */

function construirUrlEncuestaPersonal_(token) {
  token = String(token || '').trim();
  if (!token) lanzar_('Falta el token de la encuesta.', 'BAD_REQUEST');

  var base = ScriptApp.getService().getUrl();
  if (!base) {
    lanzar_('La aplicación web todavía no tiene una URL publicada.', 'WEBAPP_URL_REQUIRED');
  }

  return base + '?encuestaPersonal=' + encodeURIComponent(token);
}

function obtenerUrlEncuestaRegistroPersonalApi_(director, payload) {
  exigirDirectorRegistroPersonal_(director);
  verificarModuloRegistroPersonal_();

  var id = String(payload.id || '').trim();
  if (!id) lanzar_('Falta el ID del registro.', 'BAD_REQUEST');

  if (typeof obtenerTokenEncuestaPersonal !== 'function') {
    lanzar_('La función de encuesta del Registro de Personal no está disponible.', 'PERSONAL_MODULE_REQUIRED');
  }

  var tokenInfo = obtenerTokenEncuestaPersonal(id);
  var token = tokenInfo && tokenInfo.token ? tokenInfo.token : '';

  return {
    status: 'success',
    id: id,
    tokenEncuesta: token,
    urlEncuesta: construirUrlEncuestaPersonal_(token)
  };
}

/* EDUGESTION_FASE_21S_B_ENCUESTA_PUBLICA_BACKEND_END */



function loginProfesor_(payload) {
  var credencial = String(payload.usuario || payload.email || '').trim().toLowerCase();
  var clave = String(payload.clave || '');
  if (!credencial || !clave) lanzar_('Escribe el usuario o correo y la contraseña.', 'BAD_REQUEST');

  var cache = CacheService.getScriptCache();
  var limitKey = 'eg_login_fail_' + digestCorto_(credencial);
  var intentos = Number(cache.get(limitKey) || 0);
  if (intentos >= EG.LOGIN_LIMIT) {
    lanzar_('Demasiados intentos. Espera 10 minutos antes de volver a intentar.', 'TOO_MANY_ATTEMPTS');
  }

  var tabla = leerObjetos_(EG.SHEETS.DOCENTES);
  var esCorreo = credencial.indexOf('@') !== -1;
  var docente = tabla.objetos.filter(function(d) {
    if (esCorreo) return normalizarEmail_(d.email || '') === normalizarEmail_(credencial);
    return normalizarUsuario_(d.usuario) === normalizarUsuario_(credencial);
  })[0];

  if (
    !docente ||
    !esActivo_(docente.activo) ||
    !accesoInstitucionalVigente_(docente) ||
    !compararClave_(clave, docente.salt, docente.claveHash)
  ) {
    intentos += 1;
    cache.put(limitKey, String(intentos), EG.LOGIN_WINDOW_SECONDS);
    Utilities.sleep(Math.min(1200, 150 * intentos));
    lanzar_('Usuario, correo o contraseña incorrectos.', 'INVALID_CREDENTIALS');
  }

  cache.remove(limitKey);
  var token = crearSesion_(docente);
  return {
    status: 'success',
    token: token,
    expiresIn: EG.SESSION_TTL_SECONDS,
    profesor: perfilPublico_(docente)
  };
}


function normalizarRol_(rol) {
  var valor = String(rol || 'docente')
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s-]+/g, '_');

  if (valor === 'director' || valor === 'direccion') return 'director';
  if (
    valor === 'control_estudio' ||
    valor === 'control_de_estudio' ||
    valor === 'control_estudios'
  ) return 'control_estudio';
  return 'docente';
}

function esRolInstitucional_(rol) {
  var r = normalizarRol_(rol);
  return r === 'director' || r === 'control_estudio';
}

function exigirDirector_(cuenta) {
  if (!esRolInstitucional_(cuenta && cuenta.rol)) {
    lanzar_('Esta consulta es exclusiva de Dirección y Control de Estudio.', 'FORBIDDEN');
  }
}

function obtenerPanelDirector_(director, payload) {
  exigirDirector_(director);
  var rolInstitucional = normalizarRol_(director.rol);

  var docentesTabla = leerObjetos_(EG.SHEETS.DOCENTES);
  var docentes = docentesTabla.objetos.filter(function(d) {
    return normalizarRol_(d.rol) === 'docente';
  });

  var alumnos = leerObjetos_(EG.SHEETS.ALUMNOS).objetos;
  var asistencia = leerObjetos_(EG.SHEETS.ASISTENCIA).objetos;
  var planificacion = leerObjetos_(EG.SHEETS.PLANIFICACION).objetos;
  var horarios = leerObjetos_(EG.SHEETS.HORARIOS).objetos;
  var actas = leerObjetos_(EG.SHEETS.ACTAS).objetos;
  var auditoria = leerObjetos_(EG.SHEETS.AUDITORIA_ASISTENCIA).objetos;
  var hojaCalificaciones = getDb_().getSheetByName(EG.SHEETS.CALIFICACIONES);
  var calificaciones = hojaCalificaciones ? leerObjetos_(EG.SHEETS.CALIFICACIONES).objetos : [];

  var nombrePorId = {};
  docentes.forEach(function(d) {
    nombrePorId[String(d.id)] = String(d.nombre || d.usuario || 'Docente');
  });

  function delProfesor(lista, id) {
    return lista.filter(function(r) { return String(r.idProfesor) === String(id); });
  }

  var detalleDocentes = docentes.map(function(d) {
    var id = String(d.id);
    var a = delProfesor(alumnos, id);
    var asi = delProfesor(asistencia, id);
    var pla = delProfesor(planificacion, id);
    var hor = delProfesor(horarios, id);
    var act = delProfesor(actas, id);
    var aud = delProfesor(auditoria, id);

    var presentes = asi.filter(function(r) { return String(r.estado).toLowerCase() === 'presente'; }).length;
    var ausentes = asi.filter(function(r) { return String(r.estado).toLowerCase() === 'ausente'; }).length;
    var tardanzas = asi.filter(function(r) { return String(r.estado).toLowerCase() === 'tardanza'; }).length;
    var justificados = asi.filter(function(r) { return String(r.estado).toLowerCase() === 'justificado'; }).length;
    var totalAsistencia = asi.length;
    var porcentaje = totalAsistencia ? Math.round((presentes / totalAsistencia) * 1000) / 10 : 0;
    var puntosPlanificados = pla.reduce(function(total, r) {
      return total + (Number(r.puntos) || 0);
    }, 0);

    return {
      id: id,
      usuario: String(d.usuario || ''),
      nombre: String(d.nombre || ''),
      materia: String(d.materia || ''),
      email: String(d.email || ''),
      telefono: String(d.telefono || ''),
      seccion: String(d.seccion || ''),
      turno: normalizarTurno_(d.turno || 'Manana'),
      activo: esActivo_(d.activo),
      estudiantes: a.length,
      registrosAsistencia: totalAsistencia,
      presentes: presentes,
      ausentes: ausentes,
      tardanzas: tardanzas,
      justificados: justificados,
      porcentajeAsistencia: porcentaje,
      evaluaciones: pla.length,
      puntosPlanificados: puntosPlanificados,
      bloquesHorario: hor.length,
      actas: act.length,
      movimientosAuditoria: aud.length,
      actualizadoEn: String(d.actualizadoEn || '')
    };
  });

  function mapConDocente(lista) {
    return lista.map(function(r) {
      var limpio = limpiarMeta_(r);
      // El panel del director necesita conservar idProfesor para enlazar
      // cada registro con el docente seleccionado.
      limpio.idProfesor = String(r.idProfesor || '');
      limpio.docente = nombrePorId[String(r.idProfesor)] || String(r.docente || 'Docente');
      return limpio;
    });
  }

  var totalPresentes = asistencia.filter(function(r) { return String(r.estado).toLowerCase() === 'presente'; }).length;
  var totalRegistros = asistencia.length;

  return {
    status: 'success',
    soloLectura: true,
    generadoEn: ahora_(),
    institucion: obtenerConfiguracion_('institucion') || '',
    resumen: {
      docentes: detalleDocentes.length,
      docentesActivos: detalleDocentes.filter(function(d) { return d.activo; }).length,
      estudiantes: alumnos.length,
      registrosAsistencia: totalRegistros,
      porcentajeAsistencia: totalRegistros ? Math.round((totalPresentes / totalRegistros) * 1000) / 10 : 0,
      evaluaciones: planificacion.length,
      horarios: horarios.length,
      actas: actas.length,
      movimientosAuditoria: auditoria.length,
      calificaciones: calificaciones.length
    },
    docentes: detalleDocentes.sort(function(a, b) {
      return a.nombre.localeCompare(b.nombre, 'es');
    }),
    asistencia: mapConDocente(asistencia).sort(function(a, b) {
      return String(b.actualizadoEn || b.fecha || '').localeCompare(String(a.actualizadoEn || a.fecha || ''));
    }).slice(0, 1200),
    evaluaciones: mapConDocente(planificacion).sort(function(a, b) {
      return String(b.fecha || '').localeCompare(String(a.fecha || ''));
    }).slice(0, 1000),
    estudiantes: mapConDocente(alumnos).sort(function(a, b) {
      return String(a.docente || '').localeCompare(String(b.docente || ''), 'es') ||
        String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
    }).slice(0, 1500),
    horarios: mapConDocente(horarios).slice(0, 800),
    actas: mapConDocente(actas).sort(function(a, b) {
      return String(b.creadoEn || b.fecha || '').localeCompare(String(a.creadoEn || a.fecha || ''));
    }).slice(0, 800),
    auditoria: mapConDocente(auditoria).sort(function(a, b) {
      return String(b.registradoEn || '').localeCompare(String(a.registradoEn || ''));
    }).slice(0, 1200),
    calificaciones: mapConDocente(calificaciones).sort(function(a, b) {
      return String(b.fecha || b.actualizadoEn || '').localeCompare(String(a.fecha || a.actualizadoEn || ''));
    }).slice(0, 2500)
  };
}


function asegurarBibliotecaDigital_() {
  return asegurarHoja_(getDb_(), EG.SHEETS.BIBLIOTECA, EG.HEADERS.BibliotecaDigital);
}

function obtenerOCrearCarpetaBibliotecaRaiz_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('EDUGESTION_BIBLIOTECA_FOLDER_ID');
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (error) {}
  }

  var carpeta = DriveApp.createFolder('EduGestion - Biblioteca Digital');
  props.setProperty('EDUGESTION_BIBLIOTECA_FOLDER_ID', carpeta.getId());
  return carpeta;
}

function obtenerCarpetaBibliotecaDocente_(docente) {
  var raiz = obtenerOCrearCarpetaBibliotecaRaiz_();
  var nombre = 'Docente - ' + String(docente.nombre || docente.usuario || docente.id)
    .replace(/[\\/:*?"<>|#%]/g, '-')
    .substring(0, 90);
  var carpetas = raiz.getFoldersByName(nombre);
  if (carpetas.hasNext()) return carpetas.next();
  return raiz.createFolder(nombre);
}

function recursoBibliotecaPublico_(r) {
  return {
    id: String(r.id || ''),
    tipo: String(r.tipo || 'Enlace'),
    titulo: String(r.titulo || ''),
    categoria: String(r.categoria || 'General'),
    area: String(r.area || ''),
    descripcion: String(r.descripcion || ''),
    etiquetas: String(r.etiquetas || ''),
    url: String(r.url || ''),
    archivoNombre: String(r.archivoNombre || ''),
    mimeType: String(r.mimeType || ''),
    tamanoBytes: Number(r.tamanoBytes || 0),
    apunte: String(r.apunte || ''),
    favorito: String(r.favorito || 'NO').toUpperCase() === 'SI',
    creadoEn: String(r.creadoEn || ''),
    actualizadoEn: String(r.actualizadoEn || '')
  };
}

function recursosPredeterminadosBiblioteca_(docente) {
  var area = String(docente.materia || 'educación').trim();
  var busquedaArea = encodeURIComponent(
    'cuadernillo pedagógico ' + area + ' Venezuela PDF Ministerio de Educación'
  );

  return [
    {
      id: 'default-lopnna',
      predeterminado: true,
      tipo: 'Documento legal',
      titulo: 'LOPNNA — protección de niños, niñas y adolescentes',
      categoria: 'Normativa',
      area: 'Todas las áreas',
      descripcion: 'Texto y referencias jurídicas para orientar la actuación docente y la protección integral del estudiante.',
      url: 'https://www.oas.org/DIL/ESP/derecho_de_familia_red_de_cooperacion_venezuela_sustantiva.htm',
      fuente: 'OEA',
      favorito: true
    },
    {
      id: 'default-constitucion',
      predeterminado: true,
      tipo: 'PDF',
      titulo: 'Constitución de la República Bolivariana de Venezuela',
      categoria: 'Normativa',
      area: 'Todas las áreas',
      descripcion: 'Constitución con la Enmienda, disponible para consulta y descarga.',
      url: 'https://www.oas.org/juridico/PDFs/mesicic4_ven_cons_updated.pdf',
      fuente: 'OEA',
      favorito: true
    },
    {
      id: 'default-cuadernillos',
      predeterminado: true,
      tipo: 'Colección',
      titulo: 'Cuadernillos y materiales educativos para ' + area,
      categoria: 'Material pedagógico',
      area: area,
      descripcion: 'Búsqueda preparada de cuadernillos pedagógicos vinculados con el área del docente.',
      url: 'https://www.google.com/search?q=' + busquedaArea,
      fuente: 'Búsqueda educativa',
      favorito: true
    },
    {
      id: 'default-unicef-educacion',
      predeterminado: true,
      tipo: 'Colección',
      titulo: 'Publicaciones educativas de UNICEF Venezuela',
      categoria: 'Material pedagógico',
      area: 'Todas las áreas',
      descripcion: 'Libros, guías y cuadernillos educativos disponibles públicamente.',
      url: 'https://www.unicef.org/venezuela/publicaciones',
      fuente: 'UNICEF Venezuela',
      favorito: false
    },
    {
      id: 'default-proteccion',
      predeterminado: true,
      tipo: 'Guía',
      titulo: 'Recursos para la protección y el buen trato',
      categoria: 'Orientación docente',
      area: 'Convivencia',
      descripcion: 'Materiales para acompañar situaciones de protección, convivencia y derechos de la niñez.',
      url: 'https://www.unicef.org/venezuela/proteccion',
      fuente: 'UNICEF Venezuela',
      favorito: false
    }
  ];
}

function obtenerBiblioteca_(docente) {
  asegurarBibliotecaDigital_();
  var propios = filtrarPorProfesor_(EG.SHEETS.BIBLIOTECA, docente.id)
    .map(recursoBibliotecaPublico_)
    .sort(function(a, b) {
      if (a.favorito !== b.favorito) return a.favorito ? -1 : 1;
      return String(b.actualizadoEn || b.creadoEn).localeCompare(String(a.actualizadoEn || a.creadoEn));
    });

  return {
    status: 'success',
    recursos: propios,
    predeterminados: recursosPredeterminadosBiblioteca_(docente),
    resumen: {
      total: propios.length,
      archivos: propios.filter(function(r) { return r.tipo === 'Archivo'; }).length,
      enlaces: propios.filter(function(r) { return r.tipo === 'Enlace' || r.url; }).length,
      apuntes: propios.filter(function(r) { return r.tipo === 'Apunte'; }).length,
      favoritos: propios.filter(function(r) { return r.favorito; }).length
    }
  };
}

function guardarRecursoBiblioteca_(docente, payload) {
  asegurarBibliotecaDigital_();

  var tipo = normalizarTexto_(payload.tipo || 'Enlace');
  var titulo = normalizarTexto_(payload.titulo || '');
  var url = normalizarTexto_(payload.url || '');
  var apunte = normalizarTexto_(payload.apunte || '');

  if (!titulo) lanzar_('Escribe un título para el recurso.', 'VALIDATION_ERROR');
  if (tipo === 'Enlace' && !/^https?:\/\//i.test(url)) {
    lanzar_('El enlace debe comenzar con http:// o https://.', 'VALIDATION_ERROR');
  }
  if (tipo === 'Apunte' && !apunte) {
    lanzar_('Escribe el contenido del apunte.', 'VALIDATION_ERROR');
  }

  var ahora = ahora_();
  var recurso = {
    id: crearId_('BIB'),
    idProfesor: docente.id,
    tipo: tipo,
    titulo: titulo,
    categoria: normalizarTexto_(payload.categoria || 'General'),
    area: normalizarTexto_(payload.area || docente.materia || ''),
    descripcion: normalizarTexto_(payload.descripcion || ''),
    etiquetas: normalizarTexto_(payload.etiquetas || ''),
    url: url,
    archivoId: '',
    archivoNombre: '',
    mimeType: '',
    tamanoBytes: 0,
    apunte: apunte,
    favorito: payload.favorito ? 'SI' : 'NO',
    creadoEn: ahora,
    actualizadoEn: ahora
  };

  anexarObjeto_(EG.SHEETS.BIBLIOTECA, recurso);
  return { status: 'success', message: 'Recurso guardado en tu biblioteca.', recurso: recursoBibliotecaPublico_(recurso) };
}

function subirArchivoBiblioteca_(docente, payload) {
  asegurarBibliotecaDigital_();

  var titulo = normalizarTexto_(payload.titulo || payload.archivoNombre || '');
  var archivoNombre = normalizarTexto_(payload.archivoNombre || '');
  var mimeType = normalizarTexto_(payload.mimeType || 'application/octet-stream');
  var base64 = String(payload.base64 || '').replace(/^data:[^;]+;base64,/, '');

  if (!titulo || !archivoNombre || !base64) {
    lanzar_('Faltan los datos del archivo.', 'VALIDATION_ERROR');
  }

  var bytes = Utilities.base64Decode(base64);
  if (bytes.length > 10 * 1024 * 1024) {
    lanzar_('El archivo supera el límite de 10 MB.', 'FILE_TOO_LARGE');
  }

  var permitidos = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'text/plain'
  ];
  if (permitidos.indexOf(mimeType) === -1) {
    lanzar_('Formato no permitido. Usa PDF, Word, PowerPoint o TXT.', 'INVALID_FILE_TYPE');
  }

  var carpeta = obtenerCarpetaBibliotecaDocente_(docente);
  var blob = Utilities.newBlob(bytes, mimeType, archivoNombre);
  var archivo = carpeta.createFile(blob);
  archivo.setDescription('Recurso de la Biblioteca Digital de EduGestión. Docente: ' + docente.nombre);

  var ahora = ahora_();
  var recurso = {
    id: crearId_('BIB'),
    idProfesor: docente.id,
    tipo: 'Archivo',
    titulo: titulo,
    categoria: normalizarTexto_(payload.categoria || 'Libro y documento'),
    area: normalizarTexto_(payload.area || docente.materia || ''),
    descripcion: normalizarTexto_(payload.descripcion || ''),
    etiquetas: normalizarTexto_(payload.etiquetas || ''),
    url: archivo.getUrl(),
    archivoId: archivo.getId(),
    archivoNombre: archivoNombre,
    mimeType: mimeType,
    tamanoBytes: bytes.length,
    apunte: normalizarTexto_(payload.apunte || ''),
    favorito: payload.favorito ? 'SI' : 'NO',
    creadoEn: ahora,
    actualizadoEn: ahora
  };

  anexarObjeto_(EG.SHEETS.BIBLIOTECA, recurso);
  return { status: 'success', message: 'Archivo subido a Google Drive y guardado en tu biblioteca.', recurso: recursoBibliotecaPublico_(recurso) };
}

function obtenerRecursoBibliotecaPropio_(docente, id) {
  var tabla = leerObjetos_(EG.SHEETS.BIBLIOTECA);
  return tabla.objetos.filter(function(r) {
    return String(r.id) === String(id) && String(r.idProfesor) === String(docente.id);
  })[0] || null;
}

function alternarFavoritoBiblioteca_(docente, payload) {
  var recurso = obtenerRecursoBibliotecaPropio_(docente, payload.id);
  if (!recurso) lanzar_('No se encontró el recurso.', 'NOT_FOUND');

  var nuevo = String(recurso.favorito || 'NO').toUpperCase() === 'SI' ? 'NO' : 'SI';
  actualizarFilaObjeto_(EG.SHEETS.BIBLIOTECA, recurso.__row, {
    favorito: nuevo,
    actualizadoEn: ahora_()
  });

  return { status: 'success', favorito: nuevo === 'SI', message: nuevo === 'SI' ? 'Agregado a favoritos.' : 'Quitado de favoritos.' };
}

function eliminarRecursoBiblioteca_(docente, payload) {
  var recurso = obtenerRecursoBibliotecaPropio_(docente, payload.id);
  if (!recurso) lanzar_('No se encontró el recurso.', 'NOT_FOUND');

  if (recurso.archivoId) {
    try { DriveApp.getFileById(String(recurso.archivoId)).setTrashed(true); } catch (error) {}
  }

  var hoja = getDb_().getSheetByName(EG.SHEETS.BIBLIOTECA);
  hoja.deleteRow(recurso.__row);
  return { status: 'success', message: 'Recurso eliminado de tu biblioteca.' };
}



/* EDUGESTION_HELPER_CREAR_ID_V1 */
function crearId_(prefijo) {
  var uuid = Utilities.getUuid();
  var limpio = String(prefijo || '').trim().replace(/[^A-Za-z0-9_-]/g, '');
  return limpio ? limpio + '-' + uuid : uuid;
}

function asegurarAsistenciaDocente_() {
  return asegurarHoja_(getDb_(), EG.SHEETS.ASISTENCIA_DOCENTES, EG.HEADERS.AsistenciaDocentes);
}

function fechaLocalDocente_(valor) {
  if (valor && /^\d{4}-\d{2}-\d{2}$/.test(String(valor))) return String(valor);
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Caracas', 'yyyy-MM-dd');
}

function horaLocalDocente_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Caracas', 'HH:mm');
}

function minutosEntreHoras_(inicio, fin) {
  var a = String(inicio || '').split(':').map(Number);
  var b = String(fin || '').split(':').map(Number);
  if (a.length < 2 || b.length < 2 || a.some(isNaN) || b.some(isNaN)) return 0;
  var minutos = (b[0] * 60 + b[1]) - (a[0] * 60 + a[1]);
  return Math.max(0, minutos);
}

function registroAsistenciaDocenteHoy_(docente, fecha) {
  asegurarAsistenciaDocente_();
  return leerObjetos_(EG.SHEETS.ASISTENCIA_DOCENTES).objetos.filter(function(r) {
    return String(r.idProfesor) === String(docente.id) && String(r.fecha) === String(fecha);
  })[0] || null;
}

function asistenciaDocentePublica_(r) {
  return {
    id: String(r.id || ''),
    fecha: String(r.fecha || ''),
    estado: String(r.estado || ''),
    horaLlegada: String(r.horaLlegada || ''),
    horaSalida: String(r.horaSalida || ''),
    minutosTrabajados: Number(r.minutosTrabajados || 0),
    motivoAusencia: String(r.motivoAusencia || ''),
    observacion: String(r.observacion || ''),
    origen: String(r.origen || ''),
    creadoEn: String(r.creadoEn || ''),
    actualizadoEn: String(r.actualizadoEn || '')
  };
}

function registrarLlegadaDocente_(docente, payload, origen) {
  asegurarAsistenciaDocente_();
  var fecha = fechaLocalDocente_(payload.fecha);
  var hora = normalizarTexto_(payload.hora || '') || horaLocalDocente_();
  var existente = registroAsistenciaDocenteHoy_(docente, fecha);
  var ahora = ahora_();

  if (existente) {
    if (String(existente.estado) === 'Ausente') {
      lanzar_('La fecha ya está marcada como ausencia. Solicita a la administración corregirla.', 'ALREADY_ABSENT');
    }
    if (existente.horaLlegada) {
      return { status: 'success', message: 'La llegada ya estaba registrada.', registro: asistenciaDocentePublica_(existente) };
    }
    actualizarFilaObjeto_(EG.SHEETS.ASISTENCIA_DOCENTES, existente.__row, {
      estado: 'Presente', horaLlegada: hora, origen: origen || 'Web', actualizadoEn: ahora
    });
  } else {
    anexarObjeto_(EG.SHEETS.ASISTENCIA_DOCENTES, {
      id: crearId_('ASIDOC'), idProfesor: docente.id, docente: docente.nombre,
      fecha: fecha, estado: 'Presente', horaLlegada: hora, horaSalida: '',
      minutosTrabajados: 0, motivoAusencia: '', observacion: '', origen: origen || 'Web',
      creadoEn: ahora, actualizadoEn: ahora
    });
  }

  return { status: 'success', message: 'Hora de llegada registrada: ' + hora + '.', registro: asistenciaDocentePublica_(registroAsistenciaDocenteHoy_(docente, fecha)) };
}

function registrarSalidaDocente_(docente, payload, origen) {
  asegurarAsistenciaDocente_();
  var fecha = fechaLocalDocente_(payload.fecha);
  var hora = normalizarTexto_(payload.hora || '') || horaLocalDocente_();
  var existente = registroAsistenciaDocenteHoy_(docente, fecha);
  if (!existente || !existente.horaLlegada) lanzar_('Primero registra la hora de llegada.', 'ARRIVAL_REQUIRED');
  if (String(existente.estado) === 'Ausente') lanzar_('La fecha está marcada como ausencia.', 'ALREADY_ABSENT');

  var minutos = minutosEntreHoras_(existente.horaLlegada, hora);
  actualizarFilaObjeto_(EG.SHEETS.ASISTENCIA_DOCENTES, existente.__row, {
    estado: 'Presente', horaSalida: hora, minutosTrabajados: minutos,
    origen: origen || existente.origen || 'Web', actualizadoEn: ahora_()
  });

  return { status: 'success', message: 'Hora de salida registrada: ' + hora + '.', registro: asistenciaDocentePublica_(registroAsistenciaDocenteHoy_(docente, fecha)) };
}

function registrarAusenciaDocente_(docente, payload, origen) {
  asegurarAsistenciaDocente_();
  var fecha = fechaLocalDocente_(payload.fecha);
  var motivo = normalizarTexto_(payload.motivo || '');
  if (motivo.length < 5) lanzar_('Explica brevemente el motivo de la ausencia.', 'VALIDATION_ERROR');

  var existente = registroAsistenciaDocenteHoy_(docente, fecha);
  var ahora = ahora_();
  var datos = {
    estado: 'Ausente', horaLlegada: '', horaSalida: '', minutosTrabajados: 0,
    motivoAusencia: motivo, observacion: '', origen: origen || 'Web', actualizadoEn: ahora
  };

  if (existente) {
    if (existente.horaLlegada || existente.horaSalida) {
      lanzar_('Ya existe una entrada o salida registrada para esa fecha.', 'TIME_ALREADY_RECORDED');
    }
    actualizarFilaObjeto_(EG.SHEETS.ASISTENCIA_DOCENTES, existente.__row, datos);
  } else {
    datos.id = crearId_('ASIDOC');
    datos.idProfesor = docente.id;
    datos.docente = docente.nombre;
    datos.fecha = fecha;
    datos.creadoEn = ahora;
    anexarObjeto_(EG.SHEETS.ASISTENCIA_DOCENTES, datos);
  }

  return { status: 'success', message: 'Ausencia registrada correctamente.', registro: asistenciaDocentePublica_(registroAsistenciaDocenteHoy_(docente, fecha)) };
}



function normalizarHoraDocente_(valor, campo) {
  var hora = normalizarTexto_(valor || '');
  if (!hora) return '';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
    lanzar_('La ' + (campo || 'hora') + ' debe tener formato HH:mm.', 'VALIDATION_ERROR');
  }
  return hora;
}

function eliminarFilaAsistenciaDocentePropia_(docente, fecha) {
  var existente = registroAsistenciaDocenteHoy_(docente, fecha);
  if (!existente) return false;
  var hoja = getDb_().getSheetByName(EG.SHEETS.ASISTENCIA_DOCENTES);
  hoja.deleteRow(existente.__row);
  return true;
}

function guardarAsistenciaDocenteManual_(docente, payload, origen) {
  asegurarAsistenciaDocente_();
  var fecha = fechaLocalDocente_(payload.fecha);
  var fechaOriginal = normalizarTexto_(payload.fechaOriginal || payload.originalFecha || '');
  var llegada = normalizarHoraDocente_(payload.horaLlegada, 'hora de llegada');
  var salida = normalizarHoraDocente_(payload.horaSalida, 'hora de salida');
  var observacion = normalizarTexto_(payload.observacion || '');

  if (!llegada) lanzar_('Indica la hora de llegada.', 'VALIDATION_ERROR');
  if (salida && minutosEntreHoras_(llegada, salida) <= 0) {
    lanzar_('La hora de salida debe ser posterior a la llegada.', 'VALIDATION_ERROR');
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (fechaOriginal && fechaOriginal !== fecha) {
      eliminarFilaAsistenciaDocentePropia_(docente, fechaOriginal);
    }

    var existente = registroAsistenciaDocenteHoy_(docente, fecha);
    var ahora = ahora_();
    var datos = {
      estado: 'Presente',
      horaLlegada: llegada,
      horaSalida: salida,
      minutosTrabajados: salida ? minutosEntreHoras_(llegada, salida) : 0,
      motivoAusencia: '',
      observacion: observacion,
      origen: origen || 'Web manual',
      actualizadoEn: ahora
    };

    if (existente) {
      actualizarFilaObjeto_(EG.SHEETS.ASISTENCIA_DOCENTES, existente.__row, datos);
    } else {
      datos.id = crearId_('ASIDOC');
      datos.idProfesor = docente.id;
      datos.docente = docente.nombre;
      datos.fecha = fecha;
      datos.creadoEn = ahora;
      anexarObjeto_(EG.SHEETS.ASISTENCIA_DOCENTES, datos);
    }

    return {
      status: 'success',
      message: 'Registro manual guardado permanentemente.',
      registro: asistenciaDocentePublica_(registroAsistenciaDocenteHoy_(docente, fecha))
    };
  } finally {
    lock.releaseLock();
  }
}

function eliminarAsistenciaDocente_(docente, payload) {
  asegurarAsistenciaDocente_();
  var fecha = fechaLocalDocente_(payload.fecha);
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var eliminado = eliminarFilaAsistenciaDocentePropia_(docente, fecha);
    return {
      status: 'success',
      message: eliminado ? 'Registro de asistencia eliminado.' : 'No había un registro guardado para esa fecha.',
      fecha: fecha,
      eliminado: eliminado
    };
  } finally {
    lock.releaseLock();
  }
}

/* =========================================================
 * PERSISTENCIA DE ESTADO DEL DOCENTE · V5.3
 * Conserva en Google Sheets las configuraciones/avances que
 * antes dependían solamente de localStorage del navegador.
 * ========================================================= */
function asegurarEstadoDocente_() {
  return asegurarHoja_(getDb_(), EG.SHEETS.ESTADO_DOCENTE, EG.HEADERS.EstadoDocente);
}

function claveEstadoDocentePermitida_(clave) {
  clave = String(clave || '').trim();
  if (!clave || clave.length > 220) return false;
  if (clave === 'nombreInstitucion') return true;
  if (clave.indexOf('filtros_asistencia_') === 0) return true;
  if (clave.indexOf('edugestion_') !== 0) return false;
  var bloqueadas = [
    'edugestion_session_v2',
    'edugestion_local_data_owner_v1',
    'edugestion:director:'
  ];
  return !bloqueadas.some(function(prefijo) { return clave.indexOf(prefijo) === 0; });
}

function normalizarValorEstadoDocente_(valor) {
  if (valor === undefined || valor === null) return '';
  var texto = typeof valor === 'string' ? valor : JSON.stringify(valor);
  if (texto.length > 1500000) lanzar_('El dato es demasiado grande para guardarlo en la nube.', 'PAYLOAD_TOO_LARGE');
  return texto;
}

function dividirTextoEstadoDocente_(texto) {
  var limite = 45000; // Google Sheets admite ~50.000 caracteres por celda.
  var partes = [];
  texto = String(texto || '');
  if (!texto) return [''];
  for (var i = 0; i < texto.length; i += limite) partes.push(texto.substring(i, i + limite));
  return partes;
}

function obtenerEstadoDocente_(docente, payload) {
  asegurarEstadoDocente_();
  var prefijo = normalizarTexto_(payload && payload.prefijo || '');
  var filas = filtrarPorProfesor_(EG.SHEETS.ESTADO_DOCENTE, docente.id)
    .filter(function(r) { return !prefijo || String(r.clave || '').indexOf(prefijo) === 0; });
  var grupos = {};
  filas.forEach(function(r) {
    var clave = String(r.clave || '');
    if (!clave) return;
    if (!grupos[clave]) grupos[clave] = [];
    grupos[clave].push(r);
  });
  var mapa = {};
  var registros = [];
  Object.keys(grupos).forEach(function(clave) {
    var partes = grupos[clave].sort(function(a,b) { return Number(a.parte || 1) - Number(b.parte || 1); });
    var valor = partes.map(function(r) { return String(r.valorJson || ''); }).join('');
    mapa[clave] = valor;
    registros.push({
      clave: clave,
      valor: valor,
      partes: partes.length,
      actualizadoEn: String(partes[partes.length - 1].actualizadoEn || '')
    });
  });
  return { status: 'success', estados: mapa, registros: registros };
}

function guardarEstadoDocente_(docente, payload) {
  asegurarEstadoDocente_();
  var clave = String(payload.clave || '').trim();
  if (!claveEstadoDocentePermitida_(clave)) lanzar_('La clave de estado no está permitida.', 'VALIDATION_ERROR');
  var valor = normalizarValorEstadoDocente_(payload.valor);
  var partes = dividirTextoEstadoDocente_(valor);
  var ahora = ahora_();
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var tabla = leerObjetos_(EG.SHEETS.ESTADO_DOCENTE);
    var existentes = tabla.objetos.filter(function(r) {
      return String(r.idProfesor) === String(docente.id) && String(r.clave) === clave;
    });
    var creadoEn = existentes.length ? (existentes[0].creadoEn || ahora) : ahora;
    existentes.sort(function(a,b){return b.__row-a.__row;}).forEach(function(r){ tabla.hoja.deleteRow(r.__row); });
    partes.forEach(function(parteTexto, indice) {
      anexarObjeto_(EG.SHEETS.ESTADO_DOCENTE, {
        id: crearId_('ESTDOC'),
        idProfesor: docente.id,
        clave: clave,
        parte: indice + 1,
        totalPartes: partes.length,
        valorJson: parteTexto,
        creadoEn: creadoEn,
        actualizadoEn: ahora
      });
    });
  } finally {
    lock.releaseLock();
  }
  return { status: 'success', clave: clave, partes: partes.length, actualizadoEn: ahora };
}

function guardarEstadosDocente_(docente, payload) {
  var estados = payload && payload.estados && typeof payload.estados === 'object' ? payload.estados : {};
  var claves = Object.keys(estados);
  if (claves.length > 120) lanzar_('Demasiados datos para sincronizar en una sola operación.', 'PAYLOAD_TOO_LARGE');
  var guardados = 0;
  claves.forEach(function(clave) {
    if (!claveEstadoDocentePermitida_(clave)) return;
    guardarEstadoDocente_(docente, { clave: clave, valor: estados[clave] });
    guardados++;
  });
  return { status: 'success', guardados: guardados };
}

function eliminarEstadoDocente_(docente, payload) {
  asegurarEstadoDocente_();
  var clave = String(payload.clave || '').trim();
  if (!claveEstadoDocentePermitida_(clave)) lanzar_('La clave de estado no está permitida.', 'VALIDATION_ERROR');
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var tabla = leerObjetos_(EG.SHEETS.ESTADO_DOCENTE);
    var existentes = tabla.objetos.filter(function(r) {
      return String(r.idProfesor) === String(docente.id) && String(r.clave) === clave;
    }).sort(function(a,b){return b.__row-a.__row;});
    existentes.forEach(function(r){ tabla.hoja.deleteRow(r.__row); });
    return { status: 'success', clave: clave, eliminado: existentes.length > 0 };
  } finally {
    lock.releaseLock();
  }
}

function resumenPeriodoAsistenciaDocente_(registros, desde, hasta) {
  var filtrados = registros.filter(function(r) {
    return String(r.fecha) >= String(desde) && String(r.fecha) <= String(hasta);
  });
  var presentes = filtrados.filter(function(r) { return String(r.estado) === 'Presente'; });
  var ausentes = filtrados.filter(function(r) { return String(r.estado) === 'Ausente'; });
  var minutos = presentes.reduce(function(total, r) { return total + Number(r.minutosTrabajados || 0); }, 0);
  return {
    diasRegistrados: filtrados.length,
    diasTrabajados: presentes.length,
    ausencias: ausentes.length,
    minutos: minutos,
    horas: Math.round(minutos / 6) / 10,
    promedioHorasDia: presentes.length ? Math.round((minutos / 60 / presentes.length) * 10) / 10 : 0
  };
}

function obtenerAsistenciaDocente_(docente, payload) {
  asegurarAsistenciaDocente_();
  var todos = filtrarPorProfesor_(EG.SHEETS.ASISTENCIA_DOCENTES, docente.id)
    .map(asistenciaDocentePublica_)
    .sort(function(a, b) { return String(b.fecha).localeCompare(String(a.fecha)); });

  var hoy = fechaLocalDocente_();
  var fechaHoy = new Date(hoy + 'T12:00:00');
  var inicioSemana = new Date(fechaHoy);
  var dia = inicioSemana.getDay();
  inicioSemana.setDate(inicioSemana.getDate() - (dia === 0 ? 6 : dia - 1));
  var inicioMes = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), 1, 12);
  var fmt = function(d) { return Utilities.formatDate(d, Session.getScriptTimeZone() || 'America/Caracas', 'yyyy-MM-dd'); };

  return {
    status: 'success',
    hoy: asistenciaDocentePublica_(registroAsistenciaDocenteHoy_(docente, hoy) || { fecha: hoy }),
    resumen: {
      dia: resumenPeriodoAsistenciaDocente_(todos, hoy, hoy),
      semana: resumenPeriodoAsistenciaDocente_(todos, fmt(inicioSemana), hoy),
      mes: resumenPeriodoAsistenciaDocente_(todos, fmt(inicioMes), hoy)
    },
    registros: todos.slice(0, 180)
  };
}

function botDocenteAsistencia_(payload) {
  return resolverDocenteTelegram_(payload.telegramId);
}
function botObtenerAsistenciaDocente_(payload) {
  return obtenerAsistenciaDocente_(botDocenteAsistencia_(payload), payload);
}
function botRegistrarLlegadaDocente_(payload) {
  return registrarLlegadaDocente_(botDocenteAsistencia_(payload), payload, 'Telegram');
}
function botRegistrarSalidaDocente_(payload) {
  return registrarSalidaDocente_(botDocenteAsistencia_(payload), payload, 'Telegram');
}
function botRegistrarAusenciaDocente_(payload) {
  return registrarAusenciaDocente_(botDocenteAsistencia_(payload), payload, 'Telegram');
}

/* =========================================================
 * EDUGESTION V6.0 · HORARIO DE CONTINGENCIA INSTITUCIONAL
 * Eliu Flores (mañana) + Harrison Guillén (mañana y tarde)
 *
 * El horario habitual del docente se respalda una sola vez en EstadoDocente
 * antes de activar la contingencia. Esto permite que Web y Telegram consulten
 * la misma tabla Horarios y reconozcan las secciones del día sin duplicidad.
 * ========================================================= */
function normalizarSinAcentosEG_(valor) {
  return String(valor || '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function perfilHorarioContingencia_(docente) {
  var materia = normalizarSinAcentosEG_(docente && docente.materia);
  var nombre = normalizarSinAcentosEG_(docente && docente.nombre);
  if (materia.indexOf('educacion fisica') !== -1 && nombre.indexOf('eliu flores') !== -1) return 'ELIU';
  if (materia.indexOf('ciencias naturales') !== -1 && (nombre.indexOf('harrison') !== -1 || nombre.indexOf('guillen') !== -1)) return 'HARRISON';
  return '';
}

// Mantiene el nombre histórico de la función para no romper llamadas existentes.
function aplicaHorarioContingenciaEliu_(docente) {
  return !!perfilHorarioContingencia_(docente);
}

function bloquesHorarioContingenciaEliu_(docente) {
  var ahora = ahora_();
  var perfil = perfilHorarioContingencia_(docente);
  var filasManana = [
    ['Lunes',     '1ero', 'A'], ['Lunes',     '1ero', 'B'], ['Lunes',     '3ero', 'A'], ['Lunes',     '3ero', 'B'],
    ['Martes',    '2do',  'A'], ['Martes',    '2do',  'B'], ['Martes',    '5to',  'A'],
    ['Miercoles', '3ero', 'A'], ['Miercoles', '3ero', 'B'], ['Miercoles', '4to',  'A'], ['Miercoles', '4to',  'B'],
    ['Jueves',    '1ero', 'A'], ['Jueves',    '1ero', 'B'], ['Jueves',    '5to',  'A'],
    ['Viernes',   '2do',  'A'], ['Viernes',   '2do',  'B'], ['Viernes',   '4to',  'A'], ['Viernes',   '4to',  'B']
  ];
  var filasTarde = [
    ['Lunes',     '1ero', 'C'], ['Lunes',     '1ero', 'D'], ['Lunes',     '2do',  'C'], ['Lunes',     '2do',  'D'],
    ['Martes',    '5to',  'B'], ['Martes',    '4to',  'C'],
    ['Miercoles', '2do',  'C'], ['Miercoles', '2do',  'D'], ['Miercoles', '3ero', 'C'],
    ['Jueves',    '1ero', 'C'], ['Jueves',    '1ero', 'D'], ['Jueves',    '3ero', 'C'],
    ['Viernes',   '5to',  'B'], ['Viernes',   '4to',  'C']
  ];
  var prefDia = { Lunes:'LUN', Martes:'MAR', Miercoles:'MIE', Jueves:'JUE', Viernes:'VIE' };
  var filas = filasManana.map(function(f) { return [f[0], f[1], f[2], 'Manana', perfil === 'HARRISON' ? '07:40' : '08:00', perfil === 'HARRISON' ? '12:40' : '11:00']; });
  if (perfil === 'HARRISON') {
    filas = filas.concat(filasTarde.map(function(f) { return [f[0], f[1], f[2], 'Tarde', '12:30', '16:40']; }));
  }
  return filas.map(function(f) {
    var ano = f[1], seccion = f[2], turno = f[3];
    return {
      id: perfil === 'ELIU'
        ? 'CONT-2026-' + prefDia[f[0]] + '-' + ano.toUpperCase() + '-' + seccion
        : 'CONT-2026-HARRISON-' + prefDia[f[0]] + '-' + ano.toUpperCase() + '-' + seccion + '-' + turno.toUpperCase(),
      dia: f[0],
      horaInicio: f[4],
      horaFin: f[5],
      ano: ano,
      seccion: seccion,
      turno: turno,
      creadoEn: ahora,
      actualizadoEn: ahora
    };
  });
}

function sincronizarHorarioContingenciaEliu_(docente) {
  if (!aplicaHorarioContingenciaEliu_(docente)) return { activo:false };

  var perfilContingencia = perfilHorarioContingencia_(docente);
  var markerKey = perfilContingencia === 'ELIU'
    ? 'edugestion_horario_contingencia_2026_v58'
    : 'edugestion_horario_contingencia_2026_v60_harrison';
  var backupKey = perfilContingencia === 'ELIU'
    ? 'edugestion_horario_habitual_respaldo_v58'
    : 'edugestion_horario_habitual_respaldo_v60_harrison';
  var estado = obtenerEstadoDocente_(docente, {}).estados || {};
  var actuales = filtrarPorProfesor_(EG.SHEETS.HORARIOS, docente.id);
  var esperados = bloquesHorarioContingenciaEliu_(docente);
  var idsEsperados = {};
  esperados.forEach(function(h) { idsEsperados[String(h.id)] = true; });
  var actualesContingencia = actuales.filter(function(h) { return idsEsperados[String(h.id)] === true; });

  // Si ya están todos los bloques de contingencia, no vuelve a escribir nada.
  if (actualesContingencia.length === esperados.length && actuales.length === esperados.length) {
    return {
      activo:true,
      modo:'contingencia',
      mensaje:'Horario de contingencia activo',
      fuente:'Coordinación de Evaluación',
      perfil: perfilContingencia,
      turnos: perfilContingencia === 'HARRISON' ? ['Manana','Tarde'] : ['Manana'],
      bloques:esperados.length
    };
  }

  // Respaldo único del horario anterior antes de sustituirlo.
  if (!Object.prototype.hasOwnProperty.call(estado, backupKey)) {
    guardarEstadoDocente_(docente, {
      clave: backupKey,
      valor: JSON.stringify(actuales.map(limpiarMeta_))
    });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var tabla = leerObjetos_(EG.SHEETS.HORARIOS);
    tabla.objetos
      .filter(function(h) { return String(h.idProfesor) === String(docente.id); })
      .sort(function(a,b) { return b.__row - a.__row; })
      .forEach(function(h) { tabla.hoja.deleteRow(h.__row); });

    esperados.forEach(function(h) {
      var fila = {};
      Object.keys(h).forEach(function(k) { fila[k] = h[k]; });
      fila.idProfesor = docente.id;
      anexarObjeto_(EG.SHEETS.HORARIOS, fila);
    });
  } finally {
    lock.releaseLock();
  }

  guardarEstadoDocente_(docente, {
    clave: markerKey,
    valor: JSON.stringify({
      activo:true,
      instaladoEn:ahora_(),
      fuente:'Horario de Contingencia Escolar 2026-2027',
      perfil: perfilContingencia,
      turnos: perfilContingencia === 'HARRISON' ? ['Manana','Tarde'] : ['Manana'],
      nota:'Los alumnos no vienen a clase; entregan actividades asignadas y copian la siguiente.'
    })
  });

  return {
    activo:true,
    modo:'contingencia',
    mensaje:'Horario de contingencia activo',
    fuente:'Coordinación de Evaluación',
    perfil: perfilContingencia,
    turnos: perfilContingencia === 'HARRISON' ? ['Manana','Tarde'] : ['Manana'],
    bloques:esperados.length
  };
}

function obtenerDatosIniciales_(docente) {
  var contingencia = sincronizarHorarioContingenciaEliu_(docente);
  var planes = filtrarPorProfesor_(EG.SHEETS.PLANIFICACION, docente.id).map(limpiarMeta_);
  var horarios = filtrarPorProfesor_(EG.SHEETS.HORARIOS, docente.id).map(limpiarMeta_);
  var estadoNube = obtenerEstadoDocente_(docente, {});
  return {
    status: 'success',
    planes: planes,
    horarios: horarios,
    institucion: obtenerConfiguracion_('institucion') || '',
    estadoDocente: estadoNube.estados || {},
    horarioContingencia: contingencia
  };
}


function asegurarCamposBienestarAlumnos_() {
  var hoja = getDb_().getSheetByName(EG.SHEETS.ALUMNOS);
  if (!hoja) lanzar_('No existe la hoja Alumnos.', 'DATABASE_ERROR');

  var requeridos = EG.HEADERS.Alumnos;
  var ultimaColumna = Math.max(hoja.getLastColumn(), 1);
  var actuales = hoja.getRange(1, 1, 1, ultimaColumna).getValues()[0]
    .map(function(valor) { return String(valor || '').trim(); });

  var faltantes = requeridos.filter(function(campo) {
    return actuales.indexOf(campo) === -1;
  });

  if (faltantes.length) {
    hoja.getRange(1, actuales.length + 1, 1, faltantes.length).setValues([faltantes]);
    hoja.setFrozenRows(1);
  }
}

function actualizarCamposBienestarEstudiantes() {
  verificarInstalacion_();
  asegurarCamposBienestarAlumnos_();
  return {
    status: 'success',
    message: 'Campos de deporte, hermanos, alergias y observaciones disponibles.'
  };
}

function esDocenteCienciasHarrison_(docente) {
  return perfilHorarioContingencia_(docente) === 'HARRISON';
}

function claveNombreAlumnoCompartido_(nombre) {
  return normalizarSinAcentosEG_(nombre).replace(/\s+/g, ' ').trim();
}

function sincronizarNombresAlumnosCompartidos_(docente, ano, seccion, turno) {
  // V6.0: Harrison puede reutilizar únicamente los NOMBRES de estudiantes ya
  // cargados por otro docente en una sección común. No se copian cédula,
  // representante, teléfono, dirección, alergias ni ningún otro dato privado.
  if (!esDocenteCienciasHarrison_(docente) || !ano || !seccion || !turno) return { agregados:0 };

  var anoNorm = normalizarTexto_(ano).toLowerCase();
  var secNorm = normalizarTexto_(seccion).toUpperCase();
  var turnoNorm = normalizarTurno_(turno);
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var tabla = leerObjetos_(EG.SHEETS.ALUMNOS);
    var propios = tabla.objetos.filter(function(a) {
      return String(a.idProfesor) === String(docente.id) &&
        normalizarTexto_(a.ano).toLowerCase() === anoNorm &&
        normalizarTexto_(a.seccion).toUpperCase() === secNorm &&
        normalizarTurno_(a.turno) === turnoNorm;
    });
    var existentes = {};
    propios.forEach(function(a) { existentes[claveNombreAlumnoCompartido_(a.nombre)] = true; });

    var fuentes = tabla.objetos.filter(function(a) {
      return String(a.idProfesor) !== String(docente.id) &&
        normalizarTexto_(a.ano).toLowerCase() === anoNorm &&
        normalizarTexto_(a.seccion).toUpperCase() === secNorm &&
        normalizarTurno_(a.turno) === turnoNorm &&
        !!claveNombreAlumnoCompartido_(a.nombre);
    }).sort(function(a,b) {
      return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es', { sensitivity:'base' });
    });

    var agregados = 0;
    var ahora = ahora_();
    fuentes.forEach(function(origen) {
      var clave = claveNombreAlumnoCompartido_(origen.nombre);
      if (!clave || existentes[clave]) return;
      anexarObjeto_(EG.SHEETS.ALUMNOS, {
        id: Utilities.getUuid(),
        idProfesor: docente.id,
        nombre: String(origen.nombre || '').trim(),
        cedula: '',
        ano: ano,
        seccion: secNorm,
        turno: turnoNorm,
        repite: 'No',
        materiaPendiente: '',
        direccion: '',
        representante: '',
        telefonoRepresentante: '',
        emailRepresentante: '',
        practicaDeporte: 'No',
        deporte: '',
        tieneHermanosInstitucion: 'No',
        hermanosInstitucion: '',
        tieneAlergia: 'No',
        alergias: '',
        observaciones: '',
        creadoEn: ahora,
        actualizadoEn: ahora
      });
      existentes[clave] = true;
      agregados += 1;
    });
    if (agregados) SpreadsheetApp.flush();
    return { agregados:agregados };
  } finally {
    lock.releaseLock();
  }
}

function obtenerAlumnos_(docente, payload) {
  asegurarCamposBienestarAlumnos_();
  var ano = normalizarTexto_(payload.ano);
  var seccion = normalizarTexto_(payload.seccion).toUpperCase();
  var turno = normalizarTurno_(payload.turno || '');

  var sincronizacionCompartida = sincronizarNombresAlumnosCompartidos_(docente, ano, seccion, turno);

  var alumnos = filtrarPorProfesor_(EG.SHEETS.ALUMNOS, docente.id).filter(function(alumno) {
    if (ano && normalizarTexto_(alumno.ano).toUpperCase() !== ano.toUpperCase()) return false;
    if (seccion && normalizarTexto_(alumno.seccion).toUpperCase() !== seccion) return false;
    if (turno && normalizarTurno_(alumno.turno) !== turno) return false;
    return true;
  }).map(function(alumno) {
    return {
      id: String(alumno.id),
      nombre: String(alumno.nombre || ''),
      cedula: String(alumno.cedula || ''),
      ano: String(alumno.ano || ''),
      seccion: String(alumno.seccion || ''),
      turno: normalizarTurno_(alumno.turno),
      repite: String(alumno.repite || ''),
      materiaPendiente: String(alumno.materiaPendiente || ''),
      direccion: String(alumno.direccion || ''),
      representante: String(alumno.representante || ''),
      telefonoRepresentante: String(alumno.telefonoRepresentante || ''),
      emailRepresentante: String(alumno.emailRepresentante || ''),
      practicaDeporte: String(alumno.practicaDeporte || 'No'),
      deporte: String(alumno.deporte || ''),
      tieneHermanosInstitucion: String(alumno.tieneHermanosInstitucion || 'No'),
      hermanosInstitucion: String(alumno.hermanosInstitucion || ''),
      tieneAlergia: String(alumno.tieneAlergia || 'No'),
      alergias: String(alumno.alergias || ''),
      observaciones: String(alumno.observaciones || '')
    };
  });

  alumnos.sort(function(a, b) {
    return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
  });

  // V5.7: número de lista por año + sección + turno.
  // Se calcula alfabéticamente en cada grupo, incluso cuando la consulta pide
  // todos los estudiantes del docente, para que el mismo alumno conserve el
  // mismo número en Registro, Asistencia y Telegram.
  var contadoresLista = {};
  alumnos.forEach(function(alumno) {
    var grupo = [
      normalizarTexto_(alumno.ano).toLowerCase(),
      normalizarTexto_(alumno.seccion).toUpperCase(),
      normalizarTurno_(alumno.turno)
    ].join('|');
    contadoresLista[grupo] = (contadoresLista[grupo] || 0) + 1;
    alumno.numeroLista = contadoresLista[grupo];
  });

  return { status: 'success', alumnos: alumnos, nombresCompartidosAgregados: Number(sincronizacionCompartida.agregados || 0) };
}

function normalizarSiNoAlumno_(valor, porDefecto) {
  var texto = normalizarTexto_(valor || porDefecto || 'No').toLowerCase();
  return (texto === 'si' || texto === 'sí' || texto === 'yes') ? 'Si' : 'No';
}

function construirDatosAlumno_(docente, payload, existente) {
  var nombre = limpiarRequerido_(payload.nombre, 'nombre del estudiante');
  var ano = limpiarRequerido_(payload.ano, 'año');
  var seccion = limpiarRequerido_(payload.seccion, 'sección').toUpperCase();
  var turno = normalizarTurno_(limpiarRequerido_(payload.turno, 'turno'));
  var cedula = normalizarTexto_(payload.cedula || '');
  var practicaDeporte = normalizarSiNoAlumno_(payload.practicaDeporte, 'No');
  var tieneHermanos = normalizarSiNoAlumno_(payload.tieneHermanosInstitucion, 'No');
  var tieneAlergia = normalizarSiNoAlumno_(payload.tieneAlergia, 'No');

  return {
    idProfesor: docente.id,
    nombre: nombre,
    cedula: cedula,
    ano: ano,
    seccion: seccion,
    turno: turno,
    repite: normalizarSiNoAlumno_(payload.repite, 'No'),
    materiaPendiente: String(payload.materiaPendiente || '').trim(),
    direccion: String(payload.direccion || '').trim(),
    representante: String(payload.representante || '').trim(),
    telefonoRepresentante: soloDigitos_(payload.telefonoRep || payload.telefonoRepresentante || ''),
    emailRepresentante: normalizarEmail_(payload.emailRep || payload.emailRepresentante || ''),
    practicaDeporte: practicaDeporte,
    deporte: practicaDeporte === 'Si' ? String(payload.deporte || '').trim() : '',
    tieneHermanosInstitucion: tieneHermanos,
    hermanosInstitucion: tieneHermanos === 'Si' ? String(payload.hermanosInstitucion || '').trim() : '',
    tieneAlergia: tieneAlergia,
    alergias: tieneAlergia === 'Si' ? String(payload.alergias || '').trim() : '',
    observaciones: String(payload.observaciones || '').trim(),
    actualizadoEn: ahora_(),
    creadoEn: existente && existente.creadoEn ? existente.creadoEn : ahora_()
  };
}

function validarCedulaAlumnoUnica_(docente, cedula, excluirId) {
  cedula = normalizarTexto_(cedula || '');
  if (!cedula) return;
  var duplicado = filtrarPorProfesor_(EG.SHEETS.ALUMNOS, docente.id).some(function(a) {
    if (excluirId && String(a.id) === String(excluirId)) return false;
    return normalizarTexto_(a.cedula) === cedula;
  });
  if (duplicado) lanzar_('Ya tienes un estudiante registrado con esa cédula.', 'DUPLICATE');
}

function registrarAlumno_(docente, payload) {
  asegurarCamposBienestarAlumnos_();

  // V5.7: evita duplicados cuando el docente vuelve a pulsar Guardar porque
  // todavía no ve el estudiante en pantalla. La comprobación se hace en el
  // servidor, por lo que protege también frente a recargas o varios equipos.
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var alumno = construirDatosAlumno_(docente, payload, null);
    var propios = filtrarPorProfesor_(EG.SHEETS.ALUMNOS, docente.id);
    var claveNueva = claveDuplicadoAlumnoServidor_(alumno);

    var existenteMismoAlumno = propios.filter(function(a) {
      if (alumno.cedula && normalizarTexto_(a.cedula || '') === alumno.cedula) {
        return claveDuplicadoAlumnoServidor_(a) === claveNueva;
      }
      if (!alumno.cedula && !normalizarTexto_(a.cedula || '')) {
        return claveDuplicadoAlumnoServidor_(a) === claveNueva;
      }
      return false;
    })[0];

    if (existenteMismoAlumno) {
      var existentesSeccion = propios.filter(function(a) {
        return normalizarTexto_(a.ano).toLowerCase() === normalizarTexto_(alumno.ano).toLowerCase() &&
          normalizarTexto_(a.seccion).toUpperCase() === normalizarTexto_(alumno.seccion).toUpperCase() &&
          normalizarTurno_(a.turno) === normalizarTurno_(alumno.turno);
      }).sort(function(a, b) {
        return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es', { sensitivity: 'base' });
      });
      var numeroExistente = existentesSeccion.findIndex(function(a) {
        return String(a.id) === String(existenteMismoAlumno.id);
      }) + 1;

      var limpioExistente = limpiarMeta_(existenteMismoAlumno);
      limpioExistente.numeroLista = numeroExistente > 0 ? numeroExistente : '';
      return {
        status: 'success',
        duplicadoEvitado: true,
        message: 'Ese estudiante ya estaba registrado. Se cargó la ficha existente para evitar un duplicado.',
        alumno: limpioExistente
      };
    }

    // Si existe la misma cédula pero corresponde a una ficha diferente,
    // conserva la validación de seguridad original.
    validarCedulaAlumnoUnica_(docente, alumno.cedula, '');

    alumno.id = Utilities.getUuid();
    anexarObjeto_(EG.SHEETS.ALUMNOS, alumno);
    SpreadsheetApp.flush();

    // Confirma el número real que ocupa el estudiante dentro de su sección.
    var seccionActualizada = filtrarPorProfesor_(EG.SHEETS.ALUMNOS, docente.id).filter(function(a) {
      return normalizarTexto_(a.ano).toLowerCase() === normalizarTexto_(alumno.ano).toLowerCase() &&
        normalizarTexto_(a.seccion).toUpperCase() === normalizarTexto_(alumno.seccion).toUpperCase() &&
        normalizarTurno_(a.turno) === normalizarTurno_(alumno.turno);
    }).sort(function(a, b) {
      return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es', { sensitivity: 'base' });
    });
    var numeroLista = seccionActualizada.findIndex(function(a) {
      return String(a.id) === String(alumno.id);
    }) + 1;

    var limpio = limpiarMeta_(alumno);
    limpio.numeroLista = numeroLista > 0 ? numeroLista : '';
    return {
      status: 'success',
      message: 'La ficha del estudiante fue guardada y confirmada en la lista de la sección.',
      alumno: limpio
    };
  } finally {
    lock.releaseLock();
  }
}

function actualizarAlumno_(docente, payload) {
  asegurarCamposBienestarAlumnos_();
  var id = normalizarTexto_(payload.id || payload.idAlumno || '');
  if (!id) lanzar_('Falta indicar el estudiante que deseas actualizar.', 'BAD_REQUEST');

  var tabla = leerObjetos_(EG.SHEETS.ALUMNOS);
  var existente = tabla.objetos.filter(function(a) {
    return String(a.id) === String(id) && String(a.idProfesor) === String(docente.id);
  })[0];
  if (!existente) lanzar_('No se encontró la ficha del estudiante.', 'NOT_FOUND');

  var cambios = construirDatosAlumno_(docente, payload, existente);
  validarCedulaAlumnoUnica_(docente, cambios.cedula, id);
  actualizarFilaObjeto_(EG.SHEETS.ALUMNOS, existente.__row, cambios);

  var actualizado = leerObjetos_(EG.SHEETS.ALUMNOS).objetos.filter(function(a) {
    return String(a.id) === String(id) && String(a.idProfesor) === String(docente.id);
  })[0];

  return {
    status: 'success',
    message: 'La ficha del estudiante fue actualizada correctamente.',
    alumno: actualizado ? limpiarMeta_(actualizado) : null
  };
}


function claveDuplicadoAlumnoServidor_(alumno) {
  return [
    normalizarTexto_(alumno && alumno.nombre || '').toLowerCase(),
    normalizarTexto_(alumno && alumno.ano || '').toLowerCase(),
    normalizarTexto_(alumno && alumno.seccion || '').toUpperCase(),
    normalizarTurno_(alumno && alumno.turno || '')
  ].join('|');
}

function eliminarRegistrosAlumnoEnHoja_(nombreHoja, idProfesor, idAlumno) {
  var hoja = getDb_().getSheetByName(nombreHoja);
  if (!hoja) return 0;
  var tabla = leerObjetos_(nombreHoja);
  var filas = tabla.objetos.filter(function(r) {
    return String(r.idProfesor || '') === String(idProfesor || '') &&
      String(r.idAlumno || '') === String(idAlumno || '');
  }).map(function(r) {
    return Number(r.__row || 0);
  }).filter(function(n) {
    return n >= 2;
  }).sort(function(a, b) {
    return b - a;
  });

  filas.forEach(function(numeroFila) {
    hoja.deleteRow(numeroFila);
  });
  return filas.length;
}

function eliminarAlumnoDuplicado_(docente, payload) {
  asegurarCamposBienestarAlumnos_();
  var id = normalizarTexto_(payload.id || payload.idAlumno || '');
  if (!id) lanzar_('Falta indicar el estudiante que deseas eliminar.', 'BAD_REQUEST');

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var tabla = leerObjetos_(EG.SHEETS.ALUMNOS);
    var propios = tabla.objetos.filter(function(a) {
      return String(a.idProfesor) === String(docente.id);
    });
    var alumno = propios.filter(function(a) {
      return String(a.id) === String(id);
    })[0];
    if (!alumno) lanzar_('No se encontró la ficha del estudiante.', 'NOT_FOUND');

    var clave = claveDuplicadoAlumnoServidor_(alumno);
    var copias = propios.filter(function(a) {
      return String(a.id) !== String(id) && claveDuplicadoAlumnoServidor_(a) === clave;
    });
    if (!copias.length) {
      lanzar_('Esta ficha no tiene otra copia idéntica en el mismo año, sección y turno. Por seguridad no se eliminó.', 'NOT_DUPLICATE');
    }

    var confirmar = payload.confirmar === true || String(payload.confirmar || '').toLowerCase() === 'si';
    if (!confirmar) lanzar_('Confirma la eliminación del registro duplicado.', 'CONFIRM_REQUIRED');

    var eliminados = {
      asistencia: eliminarRegistrosAlumnoEnHoja_(EG.SHEETS.ASISTENCIA, docente.id, id),
      calificaciones: eliminarRegistrosAlumnoEnHoja_(EG.SHEETS.CALIFICACIONES, docente.id, id),
      actas: eliminarRegistrosAlumnoEnHoja_(EG.SHEETS.ACTAS, docente.id, id)
    };

    // La auditoría de asistencia se conserva como trazabilidad institucional.
    var tablaActual = leerObjetos_(EG.SHEETS.ALUMNOS);
    var filaActual = tablaActual.objetos.filter(function(a) {
      return String(a.id) === String(id) && String(a.idProfesor) === String(docente.id);
    })[0];
    if (!filaActual) lanzar_('La ficha ya no existe.', 'NOT_FOUND');
    tablaActual.hoja.deleteRow(filaActual.__row);
    SpreadsheetApp.flush();

    return {
      status: 'success',
      message: 'La ficha duplicada fue eliminada correctamente.',
      idAlumno: id,
      nombre: String(alumno.nombre || ''),
      eliminados: eliminados
    };
  } finally {
    lock.releaseLock();
  }
}

function normalizarEstadoAsistencia_(valor) {
  var texto = normalizarTexto_(valor || 'Presente').toLowerCase();
  if (texto === 'ausente' || texto === 'ausencia') return 'Ausente';
  if (texto === 'tardanza' || texto === 'tarde') return 'Tardanza';
  if (texto === 'justificada' || texto === 'justificado' || texto === 'ausencia justificada') return 'Justificada';
  return 'Presente';
}

function obtenerAsistencia_(docente, payload) {
  var fecha = limpiarRequerido_(payload.fecha, 'fecha');
  var ano = normalizarTexto_(payload.ano);
  var seccion = normalizarTexto_(payload.seccion).toUpperCase();
  var turno = normalizarTurno_(payload.turno || '');
  var materia = normalizarTexto_(payload.materia || docente.materia || '');
  var registros = filtrarPorProfesor_(EG.SHEETS.ASISTENCIA, docente.id).filter(function(r) {
    if (String(r.fecha) !== String(fecha)) return false;
    if (ano && normalizarTexto_(r.ano).toUpperCase() !== ano.toUpperCase()) return false;
    if (seccion && normalizarTexto_(r.seccion).toUpperCase() !== seccion) return false;
    if (turno && normalizarTurno_(r.turno) !== turno) return false;
    if (materia && normalizarTexto_(r.materia) !== materia) return false;
    return true;
  });
  var asistencia = {};
  registros.forEach(function(r) {
    asistencia[String(r.idAlumno)] = normalizarEstadoAsistencia_(r.estado);
  });
  return { status: 'success', asistencia: asistencia, existe: registros.length > 0 };
}

function asegurarAuditoriaAsistencia_() {
  return asegurarHoja_(getDb_(), EG.SHEETS.AUDITORIA_ASISTENCIA, EG.HEADERS.AuditoriaAsistencia);
}

function normalizarOrigenAuditoria_(valor) {
  var origen = normalizarTexto_(valor).toLowerCase();
  if (origen === 'telegram') return 'Telegram';
  if (origen === 'web') return 'Web';
  return origen ? origen.charAt(0).toUpperCase() + origen.slice(1) : 'Web';
}

function anexarAuditoriasAsistencia_(registros) {
  if (!registros || !registros.length) return;
  var hoja = asegurarAuditoriaAsistencia_();
  var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String);
  var filas = registros.map(function(registro) {
    return headers.map(function(header) {
      return Object.prototype.hasOwnProperty.call(registro, header) ? registro[header] : '';
    });
  });
  hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, headers.length).setValues(filas);
}

function obtenerAuditoriaAsistencia_(docente, payload) {
  asegurarAuditoriaAsistencia_();
  var fecha = normalizarTexto_(payload.fecha || '');
  var ano = normalizarTexto_(payload.ano || '');
  var seccion = normalizarTexto_(payload.seccion || '').toUpperCase();
  var turno = normalizarTurno_(payload.turno || '');
  var idAlumno = normalizarTexto_(payload.idAlumno || '');
  var limite = Math.max(1, Math.min(Number(payload.limite || 100), 300));

  var registros = filtrarPorProfesor_(EG.SHEETS.AUDITORIA_ASISTENCIA, docente.id).filter(function(item) {
    if (fecha && String(item.fecha || '') !== fecha) return false;
    if (ano && normalizarTexto_(item.ano).toUpperCase() !== ano.toUpperCase()) return false;
    if (seccion && normalizarTexto_(item.seccion).toUpperCase() !== seccion) return false;
    if (turno && normalizarTurno_(item.turno) !== turno) return false;
    if (idAlumno && String(item.idAlumno || '') !== idAlumno) return false;
    return true;
  }).sort(function(a, b) {
    return String(b.registradoEn || '').localeCompare(String(a.registradoEn || ''));
  }).slice(0, limite).map(limpiarMeta_);

  return { status: 'success', auditoria: registros, total: registros.length };
}


function obtenerEstadisticasAsistencia_(docente, payload) {
  var fechaDesde = normalizarTexto_(payload.fechaDesde || '');
  var fechaHasta = normalizarTexto_(payload.fechaHasta || '');
  var ano = normalizarTexto_(payload.ano || '');
  var seccion = normalizarTexto_(payload.seccion || '').toUpperCase();
  var turno = normalizarTurno_(payload.turno || '');
  var idAlumno = normalizarTexto_(payload.idAlumno || '');
  var materia = normalizarTexto_(payload.materia || docente.materia || '');

  if (fechaDesde && !/^\d{4}-\d{2}-\d{2}$/.test(fechaDesde)) {
    lanzar_('La fecha inicial no tiene un formato válido.', 'BAD_REQUEST');
  }
  if (fechaHasta && !/^\d{4}-\d{2}-\d{2}$/.test(fechaHasta)) {
    lanzar_('La fecha final no tiene un formato válido.', 'BAD_REQUEST');
  }
  if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
    lanzar_('La fecha inicial no puede ser posterior a la fecha final.', 'BAD_REQUEST');
  }

  var registros = filtrarPorProfesor_(EG.SHEETS.ASISTENCIA, docente.id).filter(function(item) {
    var fecha = String(serializarValor_(item.fecha, 'fecha') || '');
    if (fechaDesde && fecha < fechaDesde) return false;
    if (fechaHasta && fecha > fechaHasta) return false;
    if (ano && normalizarTexto_(item.ano).toUpperCase() !== ano.toUpperCase()) return false;
    if (seccion && normalizarTexto_(item.seccion).toUpperCase() !== seccion) return false;
    if (turno && normalizarTurno_(item.turno) !== turno) return false;
    if (idAlumno && String(item.idAlumno || '') !== idAlumno) return false;
    if (materia && normalizarTexto_(item.materia) !== materia) return false;
    return true;
  });

  var resumen = {
    total: 0,
    presentes: 0,
    ausentes: 0,
    tardanzas: 0,
    justificadas: 0,
    asistenciasEfectivas: 0,
    registrosConJustificacion: 0,
    porcentajeAsistencia: 0,
    porcentajeCumplimiento: 0
  };
  var porAlumno = {};
  var porSeccion = {};
  var porFecha = {};

  function crearContadorBase_() {
    return { total: 0, presentes: 0, ausentes: 0, tardanzas: 0, justificadas: 0 };
  }

  function acumularEstado_(destino, estado) {
    destino.total += 1;
    if (estado === 'Ausente') destino.ausentes += 1;
    else if (estado === 'Tardanza') destino.tardanzas += 1;
    else if (estado === 'Justificada') destino.justificadas += 1;
    else destino.presentes += 1;
  }

  registros.forEach(function(item) {
    var estado = normalizarEstadoAsistencia_(item.estado);
    var fecha = String(serializarValor_(item.fecha, 'fecha') || '');
    var alumnoId = String(item.idAlumno || '');
    var alumnoNombre = String(item.alumno || 'Sin nombre');
    var claveAlumno = alumnoId || alumnoNombre;
    var anoItem = String(item.ano || '');
    var seccionItem = String(item.seccion || '').toUpperCase();
    var turnoItem = normalizarTurno_(item.turno || '');
    var claveSeccion = [anoItem, seccionItem, turnoItem].join('|');

    acumularEstado_(resumen, estado);

    if (!porAlumno[claveAlumno]) {
      porAlumno[claveAlumno] = crearContadorBase_();
      porAlumno[claveAlumno].idAlumno = alumnoId;
      porAlumno[claveAlumno].alumno = alumnoNombre;
      porAlumno[claveAlumno].ano = anoItem;
      porAlumno[claveAlumno].seccion = seccionItem;
      porAlumno[claveAlumno].turno = turnoItem;
    }
    acumularEstado_(porAlumno[claveAlumno], estado);

    if (!porSeccion[claveSeccion]) {
      porSeccion[claveSeccion] = crearContadorBase_();
      porSeccion[claveSeccion].ano = anoItem;
      porSeccion[claveSeccion].seccion = seccionItem;
      porSeccion[claveSeccion].turno = turnoItem;
    }
    acumularEstado_(porSeccion[claveSeccion], estado);

    if (!porFecha[fecha]) {
      porFecha[fecha] = crearContadorBase_();
      porFecha[fecha].fecha = fecha;
    }
    acumularEstado_(porFecha[fecha], estado);
  });

  resumen.asistenciasEfectivas = resumen.presentes + resumen.tardanzas;
  resumen.registrosConJustificacion = resumen.asistenciasEfectivas + resumen.justificadas;
  resumen.porcentajeAsistencia = resumen.total
    ? Math.round((resumen.asistenciasEfectivas / resumen.total) * 10000) / 100
    : 0;
  resumen.porcentajeCumplimiento = resumen.total
    ? Math.round((resumen.registrosConJustificacion / resumen.total) * 10000) / 100
    : 0;

  function completarPorcentajes_(item) {
    item.asistenciasEfectivas = item.presentes + item.tardanzas;
    item.registrosConJustificacion = item.asistenciasEfectivas + item.justificadas;
    item.porcentajeAsistencia = item.total
      ? Math.round((item.asistenciasEfectivas / item.total) * 10000) / 100
      : 0;
    item.porcentajeCumplimiento = item.total
      ? Math.round((item.registrosConJustificacion / item.total) * 10000) / 100
      : 0;
    return item;
  }

  var alumnos = Object.keys(porAlumno).map(function(clave) {
    return completarPorcentajes_(porAlumno[clave]);
  }).sort(function(a, b) {
    return String(a.alumno || '').localeCompare(String(b.alumno || ''));
  });

  var secciones = Object.keys(porSeccion).map(function(clave) {
    return completarPorcentajes_(porSeccion[clave]);
  }).sort(function(a, b) {
    return [a.ano, a.seccion, a.turno].join('|').localeCompare([b.ano, b.seccion, b.turno].join('|'));
  });

  var fechas = Object.keys(porFecha).map(function(clave) {
    return completarPorcentajes_(porFecha[clave]);
  }).sort(function(a, b) {
    return String(a.fecha || '').localeCompare(String(b.fecha || ''));
  });

  return {
    status: 'success',
    filtros: {
      fechaDesde: fechaDesde,
      fechaHasta: fechaHasta,
      ano: ano,
      seccion: seccion,
      turno: turno,
      idAlumno: idAlumno,
      materia: materia
    },
    resumen: resumen,
    porAlumno: alumnos,
    porSeccion: secciones,
    porFecha: fechas
  };
}

function guardarAsistencia_(docente, payload) {
  var fecha = limpiarRequerido_(payload.fecha, 'fecha');
  var ano = limpiarRequerido_(payload.ano, 'año');
  var seccion = limpiarRequerido_(payload.seccion, 'sección').toUpperCase();
  var turno = normalizarTurno_(limpiarRequerido_(payload.turno, 'turno'));
  var materia = String(payload.materia || docente.materia || '');
  var asistencia = payload.asistencia;
  var origen = normalizarOrigenAuditoria_(payload.origen || 'Web');
  var actorId = String(payload.actorId || docente.id || '');
  var actorNombre = String(payload.actorNombre || docente.nombre || '');
  if (!asistencia || typeof asistencia !== 'object') lanzar_('No se recibió la asistencia.', 'BAD_REQUEST');

  var alumnosPropios = filtrarPorProfesor_(EG.SHEETS.ALUMNOS, docente.id);
  var mapaAlumnos = {};
  alumnosPropios.forEach(function(a) { mapaAlumnos[String(a.id)] = a; });

  var ids = Object.keys(asistencia);
  ids.forEach(function(idAlumno) {
    if (!mapaAlumnos[String(idAlumno)]) {
      lanzar_('Uno de los estudiantes no pertenece a la cuenta del docente.', 'UNAUTHORIZED');
    }
  });

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var hoja = getDb_().getSheetByName(EG.SHEETS.ASISTENCIA);
    var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String);
    var index = {};
    headers.forEach(function(h, i) { index[h] = i; });
    var filas = hoja.getLastRow() >= 2
      ? hoja.getRange(2, 1, hoja.getLastRow() - 1, headers.length).getValues()
      : [];
    var existentes = {};
    filas.forEach(function(fila, i) {
      var key = [
        String(fila[index.idProfesor] || ''),
        String(serializarValor_(fila[index.fecha], 'fecha') || ''),
        String(fila[index.idAlumno] || ''),
        normalizarTexto_(fila[index.materia] || '')
      ].join('|');
      existentes[key] = i;
    });

    var auditorias = [];
    ids.forEach(function(idAlumno) {
      var alumno = mapaAlumnos[String(idAlumno)];
      var estado = normalizarEstadoAsistencia_(asistencia[idAlumno]);
      var key = [String(docente.id), String(fecha), String(idAlumno), normalizarTexto_(materia)].join('|');
      var existe = Object.prototype.hasOwnProperty.call(existentes, key);
      var estadoAnterior = '';
      if (existe && Object.prototype.hasOwnProperty.call(index, 'estado')) {
        estadoAnterior = normalizarEstadoAsistencia_(filas[existentes[key]][index.estado]);
      }
      var registradoEn = ahora_();
      var datos = {
        id: Utilities.getUuid(),
        idProfesor: docente.id,
        materia: materia,
        ano: ano,
        seccion: seccion,
        turno: turno,
        fecha: fecha,
        idAlumno: idAlumno,
        alumno: alumno.nombre,
        estado: estado,
        actualizadoEn: registradoEn
      };

      if (existe) {
        var posicion = existentes[key];
        var actual = filas[posicion];
        headers.forEach(function(h, c) {
          if (h === 'id' && actual[c]) return;
          if (Object.prototype.hasOwnProperty.call(datos, h)) actual[c] = datos[h];
        });
      } else {
        filas.push(headers.map(function(h) {
          return Object.prototype.hasOwnProperty.call(datos, h) ? datos[h] : '';
        }));
        existentes[key] = filas.length - 1;
      }

      if (!existe || estadoAnterior !== estado) {
        auditorias.push({
          id: Utilities.getUuid(),
          idProfesor: docente.id,
          docente: String(docente.nombre || ''),
          origen: origen,
          actorId: actorId,
          actorNombre: actorNombre,
          accion: existe ? 'Actualización' : 'Creación',
          materia: materia,
          ano: ano,
          seccion: seccion,
          turno: turno,
          fecha: fecha,
          idAlumno: idAlumno,
          alumno: String(alumno.nombre || ''),
          estadoAnterior: existe ? estadoAnterior : 'Sin registro',
          estadoNuevo: estado,
          registradoEn: registradoEn
        });
      }
    });

    if (filas.length) hoja.getRange(2, 1, filas.length, headers.length).setValues(filas);
    anexarAuditoriasAsistencia_(auditorias);
    return {
      status: 'success',
      message: 'Asistencia guardada.',
      registros: ids.length,
      cambiosAuditados: auditorias.length
    };
  } finally {
    lock.releaseLock();
  }
}

function guardarPlanificacion_(docente, payload) {
  var ahora = ahora_();
  var plan = {
    id: Utilities.getUuid(),
    idProfesor: docente.id,
    ano: limpiarRequerido_(payload.ano, 'año'),
    seccion: limpiarRequerido_(payload.seccion, 'sección').toUpperCase(),
    actividad: limpiarRequerido_(payload.actividad, 'actividad'),
    puntos: numeroEntre_(payload.puntos, 0, 100, 'puntos'),
    fecha: limpiarRequerido_(payload.fecha, 'fecha'),
    creadoEn: ahora,
    actualizadoEn: ahora
  };
  anexarObjeto_(EG.SHEETS.PLANIFICACION, plan);
  return { status: 'success', plan: limpiarMeta_(plan) };
}

function guardarHorario_(docente, payload) {
  var inicio = limpiarRequerido_(payload.horaInicio, 'hora de inicio');
  var fin = limpiarRequerido_(payload.horaFin, 'hora de fin');
  if (inicio >= fin) lanzar_('La hora de fin debe ser posterior a la hora de inicio.', 'BAD_REQUEST');
  var ahora = ahora_();
  var horario = {
    id: Utilities.getUuid(),
    idProfesor: docente.id,
    dia: limpiarRequerido_(payload.dia, 'día'),
    horaInicio: inicio,
    horaFin: fin,
    ano: limpiarRequerido_(payload.ano, 'año'),
    seccion: limpiarRequerido_(payload.seccion, 'sección').toUpperCase(),
    turno: normalizarTurno_(limpiarRequerido_(payload.turno, 'turno')),
    creadoEn: ahora,
    actualizadoEn: ahora
  };
  anexarObjeto_(EG.SHEETS.HORARIOS, horario);
  return { status: 'success', horario: limpiarMeta_(horario) };
}

function registrarActa_(docente, payload) {
  var alumno = obtenerAlumnoPropio_(docente.id, payload.idAlumno);
  var acta = {
    id: Utilities.getUuid(),
    idProfesor: docente.id,
    idAlumno: alumno.id,
    alumno: alumno.nombre,
    tipo: String(payload.tipo || 'general'),
    titulo: String(payload.titulo || 'Acta'),
    fecha: String(payload.fecha || fechaHoy_()),
    mensaje: String(payload.mensaje || ''),
    emailRepresentante: String(alumno.emailRepresentante || ''),
    creadoEn: ahora_()
  };
  anexarObjeto_(EG.SHEETS.ACTAS, acta);
  return { status: 'success', acta: limpiarMeta_(acta) };
}

function enviarCorreo_(docente, payload) {
  var alumno = obtenerAlumnoPropio_(docente.id, payload.idAlumno);
  var email = normalizarEmail_(alumno.emailRepresentante || '');
  if (!email) return { status: 'success', enviado: false, message: 'El representante no tiene correo registrado.' };

  var titulo = String(payload.titulo || 'Notificación educativa');
  var mensaje = String(payload.mensaje || 'Se ha generado una notificación educativa.');
  var fecha = String(payload.fecha || fechaHoy_());
  var asunto = 'EduGestión - ' + titulo + ' - ' + alumno.nombre;
  var html = [
    '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033">',
    '<h2 style="color:#173B67">Notificación educativa</h2>',
    '<p>Estimado/a representante de <strong>' + escaparHtmlServidor_(alumno.nombre) + '</strong>:</p>',
    '<p>Se ha generado el documento <strong>' + escaparHtmlServidor_(titulo) + '</strong> con fecha ' + escaparHtmlServidor_(fecha) + '.</p>',
    '<div style="padding:16px;background:#f5f7fb;border-left:4px solid #2563eb">' + escaparHtmlServidor_(mensaje).replace(/\n/g, '<br>') + '</div>',
    '<p>Docente responsable: <strong>' + escaparHtmlServidor_(docente.nombre) + '</strong>.</p>',
    '<p style="font-size:12px;color:#667085">Mensaje generado por EduGestión.</p>',
    '</div>'
  ].join('');

  MailApp.sendEmail({
    to: email,
    subject: asunto,
    htmlBody: html,
    name: 'EduGestión'
  });
  return { status: 'success', enviado: true, message: 'Correo enviado.' };
}

function cambiarClavePropia_(docente, payload) {
  var actual = String(payload.claveActual || '');
  var nueva = String(payload.claveNueva || '');
  if (nueva.length < 8) lanzar_('La nueva contraseña debe tener al menos 8 caracteres.', 'BAD_REQUEST');
  if (!compararClave_(actual, docente.salt, docente.claveHash)) lanzar_('La contraseña actual no es correcta.', 'INVALID_CREDENTIALS');
  var salt = crearSalt_();
  actualizarFilaObjeto_(EG.SHEETS.DOCENTES, docente.__row, {
    salt: salt,
    claveHash: hashClave_(nueva, salt),
    actualizadoEn: ahora_()
  });
  invalidarSesionesDocente_(docente.id);
  return { status: 'success', message: 'Contraseña actualizada. Inicia sesión nuevamente.' };
}

function eliminarPropio_(nombreHoja, idProfesor, idRegistro, mensaje) {
  var id = String(idRegistro || '').trim();
  if (!id) lanzar_('Falta el identificador del registro.', 'BAD_REQUEST');
  var tabla = leerObjetos_(nombreHoja);
  var registro = tabla.objetos.filter(function(r) {
    return String(r.id) === id && String(r.idProfesor) === String(idProfesor);
  })[0];
  if (!registro) lanzar_('El registro no existe o no pertenece a esta cuenta.', 'NOT_FOUND');
  tabla.hoja.deleteRow(registro.__row);
  return { status: 'success', message: mensaje };
}

function crearDocente_(usuario, clave, datos) {
  usuario = normalizarUsuario_(usuario);
  clave = String(clave || '');
  if (!/^[a-z0-9._-]{4,40}$/.test(usuario)) {
    lanzar_('El usuario debe tener entre 4 y 40 caracteres y solo usar letras, números, punto, guion o guion bajo.', 'BAD_REQUEST');
  }
  if (clave.length < 8) lanzar_('La contraseña debe tener al menos 8 caracteres.', 'BAD_REQUEST');

  var tabla = leerObjetos_(EG.SHEETS.DOCENTES);
  if (tabla.objetos.some(function(d) { return normalizarUsuario_(d.usuario) === usuario; })) {
    lanzar_('Ese usuario ya existe.', 'DUPLICATE');
  }

  var salt = crearSalt_();
  var ahora = ahora_();
  var docente = {
    id: Utilities.getUuid(),
    usuario: usuario,
    claveHash: hashClave_(clave, salt),
    salt: salt,
    nombre: limpiarRequerido_(datos.nombre, 'nombre'),
    materia: String(datos.materia || ''),
    email: normalizarEmail_(datos.email || ''),
    telefono: soloDigitos_(datos.telefono || ''),
    seccion: String(datos.seccion || 'A').toUpperCase(),
    turno: normalizarTurno_(datos.turno || 'Manana'),
    rol: normalizarRol_(datos.rol || 'docente'),
    activo: 'SI',
    creadoEn: ahora,
    actualizadoEn: ahora
  };
  anexarObjeto_(EG.SHEETS.DOCENTES, docente);
  return docente;
}

function cambiarClaveAdministrativa_(usuario, nuevaClave) {
  if (String(nuevaClave || '').length < 8) lanzar_('La contraseña debe tener al menos 8 caracteres.', 'BAD_REQUEST');
  var tabla = leerObjetos_(EG.SHEETS.DOCENTES);
  var docente = tabla.objetos.filter(function(d) {
    return normalizarUsuario_(d.usuario) === normalizarUsuario_(usuario);
  })[0];
  if (!docente) lanzar_('No existe ese usuario.', 'NOT_FOUND');
  var salt = crearSalt_();
  actualizarFilaObjeto_(EG.SHEETS.DOCENTES, docente.__row, {
    salt: salt,
    claveHash: hashClave_(nuevaClave, salt),
    actualizadoEn: ahora_()
  });
  invalidarSesionesDocente_(docente.id);
}

function crearSesion_(docente) {
  var token = digestToken_(Utilities.getUuid() + '|' + Utilities.getUuid() + '|' + Date.now());
  var sesion = {
    idProfesor: String(docente.id),
    authVersion: authVersion_(docente),
    creadoEn: Date.now(),
    expiraEn: Date.now() + (EG.SESSION_TTL_SECONDS * 1000)
  };
  guardarSesion_(token, sesion);
  return token;
}

function guardarSesion_(token, sesion) {
  var clave = EG.SESSION_PREFIX + String(token);
  var raw = JSON.stringify(sesion);
  CacheService.getScriptCache().put(clave, raw, EG.SESSION_TTL_SECONDS);
  // Script Properties evita que un simple refresco pierda la sesión si Google limpia
  // el caché antes de tiempo. La expiración sigue limitada a seis horas.
  PropertiesService.getScriptProperties().setProperty(clave, raw);
}

function eliminarSesion_(token) {
  var clave = EG.SESSION_PREFIX + String(token || '');
  CacheService.getScriptCache().remove(clave);
  PropertiesService.getScriptProperties().deleteProperty(clave);
}

function exigirSesion_(token) {
  token = String(token || '').trim();
  if (!token) lanzar_('Debes iniciar sesión.', 'SESSION_REQUIRED');

  var clave = EG.SESSION_PREFIX + token;
  var cache = CacheService.getScriptCache();
  var propiedades = PropertiesService.getScriptProperties();
  var raw = cache.get(clave) || propiedades.getProperty(clave);
  if (!raw) lanzar_('La sesión venció. Ingresa nuevamente.', 'SESSION_EXPIRED');

  var datos;
  try {
    datos = JSON.parse(raw);
  } catch (error) {
    eliminarSesion_(token);
    lanzar_('La sesión no es válida. Ingresa nuevamente.', 'SESSION_EXPIRED');
  }

  if (!datos.expiraEn || Number(datos.expiraEn) <= Date.now()) {
    eliminarSesion_(token);
    lanzar_('La sesión venció. Ingresa nuevamente.', 'SESSION_EXPIRED');
  }

  var tabla = leerObjetos_(EG.SHEETS.DOCENTES);
  var docente = tabla.objetos.filter(function(d) {
    return String(d.id) === String(datos.idProfesor);
  })[0];
  if (!docente || !esActivo_(docente.activo) || !accesoInstitucionalVigente_(docente)) {
    eliminarSesion_(token);
    lanzar_('La cuenta no está disponible.', 'UNAUTHORIZED');
  }
  if (String(datos.authVersion || '') !== authVersion_(docente)) {
    eliminarSesion_(token);
    lanzar_('La sesión dejó de ser válida. Ingresa nuevamente.', 'SESSION_EXPIRED');
  }

  // Renovación deslizante: cada operación válida extiende la sesión seis horas.
  datos.expiraEn = Date.now() + (EG.SESSION_TTL_SECONDS * 1000);
  guardarSesion_(token, datos);
  return { token: token, docente: docente };
}

function cerrarSesion_(token) {
  if (token) eliminarSesion_(token);
}

function invalidarSesionesDocente_(idProfesor) {
  var propiedades = PropertiesService.getScriptProperties();
  var todas = propiedades.getProperties();
  Object.keys(todas).forEach(function(clave) {
    if (clave.indexOf(EG.SESSION_PREFIX) !== 0) return;
    try {
      var sesion = JSON.parse(todas[clave]);
      if (String(sesion.idProfesor) === String(idProfesor)) {
        propiedades.deleteProperty(clave);
        CacheService.getScriptCache().remove(clave);
      }
    } catch (error) {
      propiedades.deleteProperty(clave);
      CacheService.getScriptCache().remove(clave);
    }
  });
}

function authVersion_(docente) {
  return digestCorto_(String(docente.claveHash || '') + '|' + String(docente.activo || ''));
}

function perfilPublico_(docente) {
  return {
    id: String(docente.id),
    usuario: String(docente.usuario || ''),
    nombre: String(docente.nombre || ''),
    materia: String(docente.materia || ''),
    email: String(docente.email || ''),
    telefono: String(docente.telefono || ''),
    seccion: String(docente.seccion || 'A'),
    turno: normalizarTurno_(docente.turno || 'Manana'),
    rol: normalizarRol_(docente.rol || 'docente')
  };
}

function obtenerAlumnoPropio_(idProfesor, idAlumno) {
  var alumno = filtrarPorProfesor_(EG.SHEETS.ALUMNOS, idProfesor).filter(function(a) {
    return String(a.id) === String(idAlumno || '');
  })[0];
  if (!alumno) lanzar_('El estudiante no existe o no pertenece a esta cuenta.', 'NOT_FOUND');
  return alumno;
}

function filtrarPorProfesor_(nombreHoja, idProfesor) {
  return leerObjetos_(nombreHoja).objetos.filter(function(r) {
    return String(r.idProfesor) === String(idProfesor);
  });
}

function verificarInstalacion_() {
  var id = PropertiesService.getScriptProperties().getProperty(EG.DB_PROPERTY);
  if (!id) lanzar_('Primero ejecuta instalarSistema desde el editor o el menú EduGestión.', 'NOT_INSTALLED');
}

function getDb_() {
  verificarInstalacion_();
  return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty(EG.DB_PROPERTY));
}

function asegurarHoja_(ss, nombre, headers) {
  var hoja = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
  var columnas = Math.max(hoja.getLastColumn(), headers.length);
  if (hoja.getMaxColumns() < columnas) hoja.insertColumnsAfter(hoja.getMaxColumns(), columnas - hoja.getMaxColumns());

  var actuales = hoja.getLastColumn() > 0 ? hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String) : [];
  if (hoja.getLastRow() === 0 || actuales.every(function(v) { return !v; })) {
    hoja.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    var faltantes = headers.filter(function(h) { return actuales.indexOf(h) === -1; });
    if (faltantes.length) {
      hoja.getRange(1, actuales.length + 1, 1, faltantes.length).setValues([faltantes]);
    }
  }
  hoja.setFrozenRows(1);
  hoja.getRange(1, 1, 1, hoja.getLastColumn()).setFontWeight('bold').setBackground('#173B67').setFontColor('#ffffff');
  hoja.autoResizeColumns(1, hoja.getLastColumn());
  return hoja;
}

function leerObjetos_(nombreHoja) {
  var hoja = getDb_().getSheetByName(nombreHoja);
  if (!hoja) lanzar_('No existe la hoja ' + nombreHoja + '.', 'DATABASE_ERROR');
  var lastRow = hoja.getLastRow();
  var lastCol = hoja.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return { hoja: hoja, headers: [], objetos: [] };
  var values = hoja.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = values[0].map(function(h) { return String(h).trim(); });
  var objetos = [];
  for (var r = 1; r < values.length; r++) {
    if (values[r].every(function(v) { return v === '' || v === null; })) continue;
    var obj = { __row: r + 1 };
    headers.forEach(function(h, c) {
      if (h) obj[h] = serializarValor_(values[r][c], h);
    });
    objetos.push(obj);
  }
  return { hoja: hoja, headers: headers, objetos: objetos };
}

function anexarObjeto_(nombreHoja, objeto) {
  var tabla = leerObjetos_(nombreHoja);
  var fila = tabla.headers.map(function(h) {
    return Object.prototype.hasOwnProperty.call(objeto, h) ? objeto[h] : '';
  });
  tabla.hoja.appendRow(fila);
}

function actualizarFilaObjeto_(nombreHoja, numeroFila, cambios) {
  var tabla = leerObjetos_(nombreHoja);
  if (!numeroFila || numeroFila < 2) lanzar_('Fila inválida.', 'DATABASE_ERROR');
  var rango = tabla.hoja.getRange(numeroFila, 1, 1, tabla.headers.length);
  var fila = rango.getValues()[0];
  tabla.headers.forEach(function(h, i) {
    if (Object.prototype.hasOwnProperty.call(cambios, h)) fila[i] = cambios[h];
  });
  rango.setValues([fila]);
}

function completarIdsFaltantes_() {
  [EG.SHEETS.DOCENTES, EG.SHEETS.ALUMNOS, EG.SHEETS.ASISTENCIA, EG.SHEETS.PLANIFICACION, EG.SHEETS.HORARIOS, EG.SHEETS.ACTAS, EG.SHEETS.AUDITORIA_ASISTENCIA]
    .forEach(function(nombre) {
      var tabla = leerObjetos_(nombre);
      tabla.objetos.forEach(function(obj) {
        if (!obj.id) actualizarFilaObjeto_(nombre, obj.__row, { id: Utilities.getUuid() });
      });
    });
}

function establecerConfiguracionSiFalta_(clave, valor) {
  if (!obtenerConfiguracion_(clave)) establecerConfiguracion_(clave, valor);
}

function establecerConfiguracion_(clave, valor) {
  var tabla = leerObjetos_(EG.SHEETS.CONFIGURACION);
  var existente = tabla.objetos.filter(function(r) { return String(r.clave) === String(clave); })[0];
  var datos = { clave: clave, valor: valor, actualizadoEn: ahora_() };
  if (existente) actualizarFilaObjeto_(EG.SHEETS.CONFIGURACION, existente.__row, datos);
  else anexarObjeto_(EG.SHEETS.CONFIGURACION, datos);
}

function obtenerConfiguracion_(clave) {
  var tabla = leerObjetos_(EG.SHEETS.CONFIGURACION);
  var item = tabla.objetos.filter(function(r) { return String(r.clave) === String(clave); })[0];
  return item ? String(item.valor || '') : '';
}

function parsearPayload_(e) {
  if (!e || !e.postData || !e.postData.contents) lanzar_('Solicitud vacía.', 'BAD_REQUEST');
  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    lanzar_('El cuerpo de la solicitud no contiene JSON válido.', 'BAD_REQUEST');
  }
}

function json_(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

function lanzar_(mensaje, code) {
  var error = new Error(mensaje);
  error.code = code || 'SERVER_ERROR';
  throw error;
}

function pedirDato_(ui, titulo, mensaje) {
  var res = ui.prompt(titulo, mensaje, ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui.Button.OK) return null;
  var valor = String(res.getResponseText() || '').trim();
  if (!valor) {
    ui.alert('Dato obligatorio', 'Este campo no puede quedar vacío.', ui.ButtonSet.OK);
    return null;
  }
  return valor;
}

function pedirDatoOpcional_(ui, titulo, mensaje) {
  var res = ui.prompt(titulo, mensaje, ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui.Button.OK) return null;
  return String(res.getResponseText() || '').trim();
}

function normalizarUsuario_(valor) {
  return String(valor || '').trim().toLowerCase();
}

function normalizarTexto_(valor) {
  return String(valor === null || valor === undefined ? '' : valor).trim();
}

function normalizarTurno_(valor) {
  var v = normalizarTexto_(valor).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (!v) return '';
  return v.indexOf('tarde') !== -1 ? 'Tarde' : 'Manana';
}

function limpiarRequerido_(valor, nombre) {
  var limpio = normalizarTexto_(valor);
  if (!limpio) lanzar_('Falta completar ' + nombre + '.', 'BAD_REQUEST');
  return limpio;
}

function numeroEntre_(valor, minimo, maximo, nombre) {
  var numero = Number(valor);
  if (!isFinite(numero) || numero < minimo || numero > maximo) {
    lanzar_('El campo ' + nombre + ' debe estar entre ' + minimo + ' y ' + maximo + '.', 'BAD_REQUEST');
  }
  return numero;
}

function soloDigitos_(valor) {
  return String(valor || '').replace(/\D/g, '');
}

function normalizarEmail_(valor) {
  var email = String(valor || '').trim().toLowerCase();
  if (!email) return '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) lanzar_('El correo electrónico no tiene un formato válido.', 'BAD_REQUEST');
  return email;
}

function esActivo_(valor) {
  var v = String(valor === true ? 'SI' : valor || '').trim().toUpperCase();
  return ['SI', 'SÍ', 'TRUE', '1', 'ACTIVO'].indexOf(v) !== -1;
}

function ahora_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Caracas', "yyyy-MM-dd'T'HH:mm:ss");
}

function fechaHoy_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Caracas', 'yyyy-MM-dd');
}

function serializarValor_(valor, header) {
  if (!(valor instanceof Date)) return valor;
  var zona = Session.getScriptTimeZone() || 'America/Caracas';
  if (/hora/i.test(header)) return Utilities.formatDate(valor, zona, 'HH:mm');
  if (/fecha/i.test(header)) return Utilities.formatDate(valor, zona, 'yyyy-MM-dd');
  return Utilities.formatDate(valor, zona, "yyyy-MM-dd'T'HH:mm:ss");
}

function limpiarMeta_(objeto) {
  var limpio = {};
  Object.keys(objeto).forEach(function(k) {
    if (k !== '__row' && k !== 'idProfesor') limpio[k] = objeto[k];
  });
  return limpio;
}

function crearSalt_() {
  return digestToken_(Utilities.getUuid() + '|' + Math.random() + '|' + Date.now()).substring(0, 32);
}

function hashClave_(clave, salt) {
  var pepper = PropertiesService.getScriptProperties().getProperty(EG.PEPPER_PROPERTY);
  if (!pepper) lanzar_('Falta la clave interna de seguridad. Ejecuta instalarSistema nuevamente.', 'NOT_INSTALLED');
  var bytes = Utilities.computeHmacSha256Signature(
    String(salt) + '|' + String(clave),
    String(pepper),
    Utilities.Charset.UTF_8
  );
  return bytesAHex_(bytes);
}

function compararClave_(clave, salt, hashGuardado) {
  if (!salt || !hashGuardado) return false;
  return comparacionConstante_(hashClave_(clave, salt), String(hashGuardado));
}

function comparacionConstante_(a, b) {
  a = String(a || '');
  b = String(b || '');
  var diferencia = a.length ^ b.length;
  var longitud = Math.max(a.length, b.length);
  for (var i = 0; i < longitud; i++) {
    diferencia |= (a.charCodeAt(i % Math.max(1, a.length)) || 0) ^ (b.charCodeAt(i % Math.max(1, b.length)) || 0);
  }
  return diferencia === 0;
}

function digestToken_(texto) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(texto), Utilities.Charset.UTF_8);
  return bytesAHex_(bytes);
}

function digestCorto_(texto) {
  return digestToken_(texto).substring(0, 24);
}

function bytesAHex_(bytes) {
  return bytes.map(function(b) {
    var n = b < 0 ? b + 256 : b;
    return ('0' + n.toString(16)).slice(-2);
  }).join('');
}

function escaparHtmlServidor_(valor) {
  return String(valor || '').replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/* =========================================================
   EDUGESTIÓN · SINCRONIZACIÓN NOTAS WEB ↔ TELEGRAM · FASE 2
   ========================================================= */

function exigirBackendNotasCompartido_() {
  if (typeof asegurarNotasControlEstudioTelegram_ !== 'function' ||
      typeof actividadesNotasTelegram_ !== 'function' ||
      typeof alumnosCursoNotasTelegram_ !== 'function') {
    lanzar_('El módulo compartido de Notas y Control de Estudio no está disponible. Verifica TelegramBot.gs.', 'MODULE_NOT_READY');
  }
}

function obtenerControlEstudioWeb_(docente, payload) {
  exigirBackendNotasCompartido_();
  asegurarNotasControlEstudioTelegram_();

  var lapso = normalizarLapsoTelegram_(payload.lapso || '1er Lapso');
  var ano = String(payload.ano || '').trim();
  var seccion = String(payload.seccion || '').trim().toUpperCase();
  var turno = String(payload.turno || '').trim();

  if (!ano) lanzar_('Indica el año o grado.', 'VALIDATION_ERROR');
  if (!seccion) lanzar_('Indica la sección.', 'VALIDATION_ERROR');

  var actividadesRaw = actividadesNotasTelegram_(docente, {
    lapso: lapso, ano: ano, seccion: seccion, turno: turno
  });

  var actividades = actividadesRaw.map(function(actividad) {
    var base = serializarActividadNotasTelegram_(docente, actividad, true);
    var notas = base.notas || {};
    var registros = {};

    Object.keys(notas).forEach(function(idAlumno) {
      var r = notas[idAlumno] || {};
      registros[String(idAlumno)] = {
        entrego: normalizarEntregoTelegram_(r.entrego) === 'Si' ? 'Si' : 'No',
        nota: r.nota === '' || r.nota === null || r.nota === undefined ? '' : Number(r.nota),
        observacion: String(r.observacion || '')
      };
    });

    return {
      id: base.id,
      lapso: base.lapso,
      ano: base.ano,
      seccion: base.seccion,
      turno: base.turno,
      nombre: base.nombre,
      fecha: base.fecha,
      ponderacion: Number(base.ponderacion || 0),
      actualizadoEn: base.actualizadoEn,
      registros: registros
    };
  });

  var pseudo = { ano: ano, seccion: seccion, turno: turno };
  var alumnos = alumnosCursoNotasTelegram_(docente, pseudo).map(function(alumno) {
    return {
      id: String(alumno.id || ''),
      nombre: String(alumno.nombre || ''),
      cedula: String(alumno.cedula || ''),
      ano: String(alumno.ano || ''),
      seccion: String(alumno.seccion || ''),
      turno: String(alumno.turno || '')
    };
  });

  var resumenFilas = alumnos.map(function(alumno) {
    var baseAlumno = { id: alumno.id, nombre: alumno.nombre, cedula: alumno.cedula };
    var fila = resumenAlumnoNotasTelegram_(docente, baseAlumno, actividadesRaw);
    fila.asistencia = resumenAsistenciaEstudianteTelegram_(docente, alumno.id);
    return fila;
  });

  var conNota = resumenFilas.filter(function(f) { return f.notaFinal !== null; });
  var promedio = conNota.length
    ? Math.round((conNota.reduce(function(s, f) { return s + Number(f.notaFinal || 0); }, 0) / conNota.length) * 100) / 100
    : null;

  var ponderacionAcumulada = actividades.reduce(function(s, a) {
    return s + Number(a.ponderacion || 0);
  }, 0);

  return {
    status: 'success',
    origen: 'servidor_compartido',
    lapso: lapso,
    ano: ano,
    seccion: seccion,
    turno: turno,
    alumnos: alumnos,
    actividades: actividades,
    resumen: {
      totalActividades: actividades.length,
      totalEstudiantes: alumnos.length,
      ponderacionAcumulada: Math.round(ponderacionAcumulada * 100) / 100,
      promedioSeccion: promedio,
      estudiantes: resumenFilas
    }
  };
}

function crearActividadControlEstudioWeb_(docente, payload) {
  exigirBackendNotasCompartido_();
  asegurarNotasControlEstudioTelegram_();

  var lapso = normalizarLapsoTelegram_(payload.lapso || '1er Lapso');
  var ano = limpiarRequerido_(payload.ano, 'año o grado');
  var seccion = limpiarRequerido_(payload.seccion, 'sección').toUpperCase();
  var turno = String(payload.turno || '').trim();
  var nombre = limpiarRequerido_(payload.nombre, 'nombre de la actividad').slice(0, 180);
  var fecha = String(payload.fecha || fechaLocalDocente_()).slice(0, 10);
  var ponderacion = Number(payload.ponderacion || 0);

  if (!isFinite(ponderacion) || ponderacion <= 0 || ponderacion > 100) {
    lanzar_('La ponderación debe ser mayor que 0 y no superar 100%.', 'VALIDATION_ERROR');
  }

  var existentes = actividadesNotasTelegram_(docente, {
    lapso: lapso, ano: ano, seccion: seccion, turno: turno
  });

  var totalPonderado = existentes.reduce(function(s, a) {
    return s + Number(a.ponderacion || 0);
  }, 0);

  if (totalPonderado + ponderacion > 100.0001) {
    lanzar_('La ponderación total del lapso no puede superar 100%. Actualmente hay ' + totalPonderado + '%.', 'VALIDATION_ERROR');
  }

  var actividad = {
    id: Utilities.getUuid(),
    idProfesor: String(docente.id),
    lapso: lapso,
    ano: ano,
    seccion: seccion,
    turno: turno,
    nombre: nombre,
    fecha: fecha,
    ponderacion: ponderacion,
    creadoEn: ahora_(),
    actualizadoEn: ahora_(),
    activo: 'SI'
  };

  anexarObjeto_(EG_NOTAS_TELEGRAM.ACTIVIDADES_SHEET, actividad);

  return {
    status: 'success',
    origen: 'servidor_compartido',
    actividad: serializarActividadNotasTelegram_(docente, actividad, false),
    ponderacionAcumulada: Math.round((totalPonderado + ponderacion) * 100) / 100,
    message: 'Actividad creada correctamente.'
  };
}

function guardarCalificacionesControlEstudioWeb_(docente, payload) {
  exigirBackendNotasCompartido_();
  asegurarNotasControlEstudioTelegram_();

  var actividad = buscarActividadPropiaNotasTelegram_(docente, payload.idActividad);
  var registros = Array.isArray(payload.registros) ? payload.registros : [];
  if (!registros.length) lanzar_('No se recibieron calificaciones para guardar.', 'VALIDATION_ERROR');

  var alumnos = alumnosCursoNotasTelegram_(docente, actividad);
  var permitidos = {};
  alumnos.forEach(function(a) { permitidos[String(a.id)] = true; });

  var tabla = leerObjetos_(EG_NOTAS_TELEGRAM.NOTAS_SHEET);
  var guardados = 0;

  registros.forEach(function(reg) {
    var idAlumno = String(reg.idAlumno || '').trim();
    if (!permitidos[idAlumno]) {
      lanzar_('Uno de los estudiantes no pertenece a la sección de esta actividad.', 'UNAUTHORIZED');
    }

    var nota = validarNotaTelegram_(reg.nota);
    var entrego = normalizarEntregoTelegram_(reg.entrego);
    if (!entrego && nota !== '') entrego = 'Si';

    var anterior = tabla.objetos.filter(function(item) {
      return String(item.idProfesor) === String(docente.id) &&
        String(item.idActividad || '') === String(actividad.id) &&
        String(item.idAlumno || '') === idAlumno;
    })[0];

    var datos = {
      id: anterior && anterior.id ? anterior.id : Utilities.getUuid(),
      idProfesor: String(docente.id),
      idActividad: String(actividad.id),
      idAlumno: idAlumno,
      entrego: entrego || 'No',
      nota: nota,
      observacion: String(reg.observacion || '').slice(0, 500),
      actualizadoEn: ahora_()
    };

    if (anterior) actualizarFilaObjeto_(EG_NOTAS_TELEGRAM.NOTAS_SHEET, anterior.__row, datos);
    else anexarObjeto_(EG_NOTAS_TELEGRAM.NOTAS_SHEET, datos);
    guardados++;
  });

  return {
    status: 'success',
    origen: 'servidor_compartido',
    actividad: serializarActividadNotasTelegram_(docente, actividad, false),
    guardados: guardados,
    message: 'Calificaciones guardadas correctamente.'
  };
}

/* EDUGESTION_SYNC_NOTAS_WEB_TELEGRAM_FASE2_END */

/* =========================================================
   EDUGESTIÓN · HISTORIAL DE CIERRES COMPARTIDO · FASE 3
   ========================================================= */

var EG_HISTORIAL_CIERRES = Object.freeze({
  SHEET: 'HistorialCierres',
  HEADERS: [
    'id', 'idProfesor', 'fecha', 'accion', 'medio',
    'ano', 'seccion', 'turno', 'lapso',
    'docente', 'materia', 'enviado', 'fechaEnvio', 'actualizadoEn'
  ]
});

function asegurarHistorialCierres_() {
  asegurarHoja_(getDb_(), EG_HISTORIAL_CIERRES.SHEET, EG_HISTORIAL_CIERRES.HEADERS);
}

function historialCierrePublico_(row) {
  return {
    id: String(row.id || ''),
    fecha: String(row.fecha || ''),
    accion: String(row.accion || ''),
    medio: String(row.medio || ''),
    ano: String(row.ano || ''),
    seccion: String(row.seccion || ''),
    turno: String(row.turno || ''),
    lapso: String(row.lapso || ''),
    docente: String(row.docente || ''),
    materia: String(row.materia || ''),
    enviado: esActivo_(row.enviado),
    fechaEnvio: String(row.fechaEnvio || ''),
    actualizadoEn: String(row.actualizadoEn || '')
  };
}

function obtenerHistorialCierresWeb_(docente, payload) {
  asegurarHistorialCierres_();

  var registros = filtrarPorProfesor_(EG_HISTORIAL_CIERRES.SHEET, docente.id)
    .sort(function(a, b) {
      return String(b.fecha || '').localeCompare(String(a.fecha || ''));
    })
    .slice(0, 500)
    .map(historialCierrePublico_);

  return {
    status: 'success',
    origen: 'servidor_compartido',
    total: registros.length,
    historial: registros
  };
}

function registrarHistorialCierreWeb_(docente, payload) {
  asegurarHistorialCierres_();

  var ano = limpiarRequerido_(payload.ano, 'año o grado');
  var seccion = limpiarRequerido_(payload.seccion, 'sección').toUpperCase();
  var lapso = normalizarLapsoTelegram_(payload.lapso || '1er Lapso');
  var idSolicitado = String(payload.id || '').trim();

  var tabla = leerObjetos_(EG_HISTORIAL_CIERRES.SHEET);
  var existente = idSolicitado ? tabla.objetos.filter(function(row) {
    return String(row.idProfesor) === String(docente.id) &&
      String(row.id || '') === idSolicitado;
  })[0] : null;

  if (existente) {
    return {
      status: 'success',
      origen: 'servidor_compartido',
      duplicado: true,
      registro: historialCierrePublico_(existente)
    };
  }

  var ahora = ahora_();
  var registro = {
    id: idSolicitado || Utilities.getUuid(),
    idProfesor: String(docente.id),
    fecha: String(payload.fecha || ahora),
    accion: String(payload.accion || 'Generado').slice(0, 120),
    medio: String(payload.medio || '').slice(0, 80),
    ano: ano,
    seccion: seccion,
    turno: String(payload.turno || '').slice(0, 80),
    lapso: lapso,
    docente: String(payload.docente || docente.nombre || '').slice(0, 180),
    materia: String(payload.materia || docente.materia || '').slice(0, 180),
    enviado: payload.enviado ? 'SI' : 'NO',
    fechaEnvio: payload.enviado ? String(payload.fechaEnvio || ahora) : '',
    actualizadoEn: ahora
  };

  anexarObjeto_(EG_HISTORIAL_CIERRES.SHEET, registro);

  return {
    status: 'success',
    origen: 'servidor_compartido',
    registro: historialCierrePublico_(registro),
    message: 'Cierre agregado al historial.'
  };
}

function buscarHistorialCierrePropio_(docente, id) {
  asegurarHistorialCierres_();
  var row = filtrarPorProfesor_(EG_HISTORIAL_CIERRES.SHEET, docente.id)
    .filter(function(item) { return String(item.id || '') === String(id || ''); })[0];
  if (!row) lanzar_('El registro de cierre no existe o no pertenece a tu cuenta.', 'NOT_FOUND');
  return row;
}

function actualizarHistorialCierreWeb_(docente, payload) {
  var row = buscarHistorialCierrePropio_(docente, payload.id);
  var enviado = Boolean(payload.enviado);
  var ahora = ahora_();

  actualizarFilaObjeto_(EG_HISTORIAL_CIERRES.SHEET, row.__row, {
    accion: String(payload.accion || (enviado ? 'Enviado' : 'Pendiente')).slice(0, 120),
    enviado: enviado ? 'SI' : 'NO',
    fechaEnvio: enviado ? String(payload.fechaEnvio || ahora) : '',
    actualizadoEn: ahora
  });

  var actualizado = buscarHistorialCierrePropio_(docente, payload.id);

  return {
    status: 'success',
    origen: 'servidor_compartido',
    registro: historialCierrePublico_(actualizado),
    message: enviado ? 'Cierre marcado como enviado.' : 'Cierre marcado como pendiente.'
  };
}

function eliminarHistorialCierreWeb_(docente, payload) {
  var row = buscarHistorialCierrePropio_(docente, payload.id);
  var hoja = getDb_().getSheetByName(EG_HISTORIAL_CIERRES.SHEET);
  hoja.deleteRow(row.__row);

  return {
    status: 'success',
    origen: 'servidor_compartido',
    id: String(payload.id || ''),
    message: 'Registro eliminado del historial.'
  };
}

/* EDUGESTION_HISTORIAL_CIERRES_COMPARTIDO_FASE3_END */


/* =========================================================
   EduGestión · FASE 18 · CHAT INTERNO WEB
   Dirección ↔ Docente
   - Una conversación por docente.
   - Datos compartidos para futura integración con Telegram.
   - El docente solo puede ver su propia conversación.
   - Dirección puede consultar conversaciones de todos los docentes.
   ========================================================= */

var EG_CHAT_INTERNO = Object.freeze({
  SHEET: 'ChatInterno',
  HEADERS: [
    'id', 'idDocente', 'docente', 'idRemitente', 'rolRemitente',
    'nombreRemitente', 'mensaje', 'leidoDocente', 'leidoDirector',
    'origen', 'creadoEn', 'actualizadoEn', 'activo'
  ],
  MAX_MENSAJE: 2500
});

function asegurarChatInterno_() {
  asegurarHoja_(getDb_(), EG_CHAT_INTERNO.SHEET, EG_CHAT_INTERNO.HEADERS);
}

function rolChat_(cuenta) {
  return normalizarRol_(cuenta && cuenta.rol);
}

function esDirectorChat_(cuenta) {
  return rolChat_(cuenta) === 'director';
}

function docenteChatPorId_(idDocente) {
  var id = String(idDocente || '').trim();
  if (!id) lanzar_('Falta indicar el docente.', 'CHAT_DOCENTE_REQUERIDO');

  var docente = leerObjetos_(EG.SHEETS.DOCENTES).objetos.filter(function(d) {
    return String(d.id || '').trim() === id &&
      normalizarRol_(d.rol) === 'docente';
  })[0];

  if (!docente) {
    lanzar_('No encontré ese docente.', 'CHAT_DOCENTE_NO_ENCONTRADO');
  }

  return docente;
}

function resolverDocenteChat_(cuenta, payload) {
  if (esDirectorChat_(cuenta)) {
    return docenteChatPorId_(payload && payload.idDocente);
  }

  return docenteChatPorId_(cuenta.id);
}

function limpiarMensajeChat_(m) {
  return {
    id: String(m.id || ''),
    idDocente: String(m.idDocente || ''),
    docente: String(m.docente || ''),
    idRemitente: String(m.idRemitente || ''),
    rolRemitente: String(m.rolRemitente || ''),
    nombreRemitente: String(m.nombreRemitente || ''),
    mensaje: String(m.mensaje || ''),
    leidoDocente: esActivo_(m.leidoDocente),
    leidoDirector: esActivo_(m.leidoDirector),
    origen: String(m.origen || 'Web'),
    creadoEn: String(m.creadoEn || ''),
    actualizadoEn: String(m.actualizadoEn || '')
  };
}

function mensajesChatDocente_(idDocente) {
  asegurarChatInterno_();

  return leerObjetos_(EG_CHAT_INTERNO.SHEET).objetos
    .filter(function(m) {
      return String(m.idDocente || '') === String(idDocente || '') &&
        esActivo_(m.activo);
    })
    .sort(function(a, b) {
      var porFecha = String(a.creadoEn || '').localeCompare(String(b.creadoEn || ''));
      if (porFecha !== 0) return porFecha;
      return String(a.id || '').localeCompare(String(b.id || ''));
    });
}

function ultimoMensajeChat_(mensajes) {
  if (!mensajes || !mensajes.length) return null;
  return mensajes[mensajes.length - 1];
}

function contarNoLeidosChat_(mensajes, rolDestino) {
  return (mensajes || []).filter(function(m) {
    if (rolDestino === 'director') {
      return String(m.rolRemitente || '') === 'docente' && !esActivo_(m.leidoDirector);
    }
    return String(m.rolRemitente || '') === 'director' && !esActivo_(m.leidoDocente);
  }).length;
}

function obtenerChatContexto_(cuenta, payload) {
  asegurarChatInterno_();

  var esDirector = esDirectorChat_(cuenta);
  var docentes = [];

  if (esDirector) {
    docentes = leerObjetos_(EG.SHEETS.DOCENTES).objetos
      .filter(function(d) {
        return normalizarRol_(d.rol) === 'docente';
      })
      .map(function(d) {
        var mensajes = mensajesChatDocente_(d.id);
        var ultimo = ultimoMensajeChat_(mensajes);

        return {
          id: String(d.id || ''),
          nombre: String(d.nombre || d.usuario || 'Docente'),
          usuario: String(d.usuario || ''),
          materia: String(d.materia || ''),
          activo: esActivo_(d.activo),
          noLeidos: contarNoLeidosChat_(mensajes, 'director'),
          ultimoMensaje: ultimo ? String(ultimo.mensaje || '').slice(0, 160) : '',
          ultimoMensajeEn: ultimo ? String(ultimo.creadoEn || '') : ''
        };
      })
      .sort(function(a, b) {
        if (b.noLeidos !== a.noLeidos) return b.noLeidos - a.noLeidos;
        var fa = String(a.ultimoMensajeEn || '');
        var fb = String(b.ultimoMensajeEn || '');
        if (fa !== fb) return fb.localeCompare(fa);
        return String(a.nombre).localeCompare(String(b.nombre), 'es', { sensitivity: 'base' });
      });
  }

  var propios = esDirector ? [] : mensajesChatDocente_(cuenta.id);

  return {
    status: 'success',
    rol: esDirector ? 'director' : 'docente',
    cuenta: {
      id: String(cuenta.id || ''),
      nombre: String(cuenta.nombre || cuenta.usuario || ''),
      usuario: String(cuenta.usuario || ''),
      materia: String(cuenta.materia || ''),
      rol: esDirector ? 'director' : 'docente'
    },
    docentes: docentes,
    noLeidos: esDirector
      ? docentes.reduce(function(total, d) { return total + Number(d.noLeidos || 0); }, 0)
      : contarNoLeidosChat_(propios, 'docente'),
    generadoEn: ahora_()
  };
}

function obtenerConversacionesChat_(cuenta, payload) {
  asegurarChatInterno_();

  if (!esDirectorChat_(cuenta)) {
    var mensajes = mensajesChatDocente_(cuenta.id);
    var ultimo = ultimoMensajeChat_(mensajes);

    return {
      status: 'success',
      conversaciones: [{
        idDocente: String(cuenta.id || ''),
        docente: String(cuenta.nombre || cuenta.usuario || 'Docente'),
        materia: String(cuenta.materia || ''),
        noLeidos: contarNoLeidosChat_(mensajes, 'docente'),
        totalMensajes: mensajes.length,
        ultimoMensaje: ultimo ? String(ultimo.mensaje || '').slice(0, 180) : '',
        ultimoMensajeEn: ultimo ? String(ultimo.creadoEn || '') : ''
      }]
    };
  }

  var contexto = obtenerChatContexto_(cuenta, payload);

  return {
    status: 'success',
    conversaciones: contexto.docentes.map(function(d) {
      var mensajes = mensajesChatDocente_(d.id);
      return {
        idDocente: d.id,
        docente: d.nombre,
        usuario: d.usuario,
        materia: d.materia,
        activo: d.activo,
        noLeidos: d.noLeidos,
        totalMensajes: mensajes.length,
        ultimoMensaje: d.ultimoMensaje,
        ultimoMensajeEn: d.ultimoMensajeEn
      };
    })
  };
}

function obtenerConversacionChat_(cuenta, payload) {
  asegurarChatInterno_();

  var docente = resolverDocenteChat_(cuenta, payload || {});
  var mensajes = mensajesChatDocente_(docente.id);

  return {
    status: 'success',
    docente: {
      id: String(docente.id || ''),
      nombre: String(docente.nombre || docente.usuario || 'Docente'),
      usuario: String(docente.usuario || ''),
      materia: String(docente.materia || ''),
      activo: esActivo_(docente.activo)
    },
    mensajes: mensajes.map(limpiarMensajeChat_),
    noLeidos: contarNoLeidosChat_(
      mensajes,
      esDirectorChat_(cuenta) ? 'director' : 'docente'
    )
  };
}

function enviarMensajeChat_(cuenta, payload) {
  asegurarChatInterno_();
  payload = payload || {};

  var mensaje = String(payload.mensaje || '').trim();
  if (!mensaje) {
    lanzar_('Escribe un mensaje.', 'CHAT_MENSAJE_REQUERIDO');
  }

  if (mensaje.length > EG_CHAT_INTERNO.MAX_MENSAJE) {
    lanzar_(
      'El mensaje es demasiado largo. Máximo ' + EG_CHAT_INTERNO.MAX_MENSAJE + ' caracteres.',
      'CHAT_MENSAJE_LARGO'
    );
  }

  var docente = resolverDocenteChat_(cuenta, payload);
  var director = esDirectorChat_(cuenta);
  var ahora = ahora_();

  var registro = {
    id: Utilities.getUuid(),
    idDocente: String(docente.id || ''),
    docente: String(docente.nombre || docente.usuario || 'Docente'),
    idRemitente: String(cuenta.id || ''),
    rolRemitente: director ? 'director' : 'docente',
    nombreRemitente: String(cuenta.nombre || cuenta.usuario || (director ? 'Dirección' : 'Docente')),
    mensaje: mensaje,
    leidoDocente: director ? 'NO' : 'SI',
    leidoDirector: director ? 'SI' : 'NO',
    origen: String(payload.origen || 'Web').slice(0, 40),
    creadoEn: ahora,
    actualizadoEn: ahora,
    activo: 'SI'
  };

  anexarObjeto_(EG_CHAT_INTERNO.SHEET, registro);

  return {
    status: 'success',
    message: 'Mensaje enviado.',
    registro: limpiarMensajeChat_(registro)
  };
}

function marcarChatLeido_(cuenta, payload) {
  asegurarChatInterno_();

  var docente = resolverDocenteChat_(cuenta, payload || {});
  var director = esDirectorChat_(cuenta);
  var tabla = leerObjetos_(EG_CHAT_INTERNO.SHEET);
  var actualizados = 0;
  var ahora = ahora_();

  tabla.objetos.forEach(function(m) {
    if (String(m.idDocente || '') !== String(docente.id || '') || !esActivo_(m.activo)) return;

    if (director) {
      if (String(m.rolRemitente || '') === 'docente' && !esActivo_(m.leidoDirector)) {
        actualizarFilaObjeto_(EG_CHAT_INTERNO.SHEET, m.__row, {
          leidoDirector: 'SI',
          actualizadoEn: ahora
        });
        actualizados++;
      }
    } else {
      if (String(m.rolRemitente || '') === 'director' && !esActivo_(m.leidoDocente)) {
        actualizarFilaObjeto_(EG_CHAT_INTERNO.SHEET, m.__row, {
          leidoDocente: 'SI',
          actualizadoEn: ahora
        });
        actualizados++;
      }
    }
  });

  return {
    status: 'success',
    actualizados: actualizados,
    message: actualizados
      ? 'Mensajes marcados como leídos.'
      : 'No había mensajes pendientes.'
  };
}

/* EDUGESTION_FASE_18_CHAT_INTERNO_WEB_END */



/* =========================================================
   EduGestión · FASE 19 · AGENDA DIGITAL
   Adaptación funcional de la Agenda Docente 2026-2027.

   Módulos:
   - Agenda / eventos
   - Notas
   - Bitácora docente
   - Inventario deportivo
   - Préstamos de material
   - Juegos Escolares

   Reutiliza información ya existente de EduGestión:
   - Perfil docente
   - Estudiantes
   - Horarios
   - Asistencia
   - Planificación
   ========================================================= */

var EG_AGENDA = Object.freeze({
  EVENTOS: Object.freeze({
    SHEET: 'AgendaEventos',
    HEADERS: [
      'id', 'idProfesor', 'fecha', 'hora', 'tipo', 'titulo', 'descripcion',
      'prioridad', 'estado', 'ano', 'seccion', 'turno', 'recordatorio',
      'creadoEn', 'actualizadoEn', 'activo'
    ]
  }),
  NOTAS: Object.freeze({
    SHEET: 'AgendaNotas',
    HEADERS: [
      'id', 'idProfesor', 'titulo', 'contenido', 'categoria', 'fecha',
      'mes', 'semana', 'favorito', 'creadoEn', 'actualizadoEn', 'activo'
    ]
  }),
  BITACORA: Object.freeze({
    SHEET: 'AgendaBitacora',
    HEADERS: [
      'id', 'idProfesor', 'idAlumno', 'alumno', 'edad', 'fecha',
      'sesionActividad', 'situacionObservada', 'accionRealizada',
      'seguimientoAcuerdos', 'ano', 'seccion', 'turno',
      'creadoEn', 'actualizadoEn', 'activo'
    ]
  }),
  INVENTARIO: Object.freeze({
    SHEET: 'InventarioDeportivo',
    HEADERS: [
      'id', 'idProfesor', 'material', 'cantidadTotal', 'buenEstado',
      'regularEstado', 'malEstado', 'necesitaReposicion', 'observaciones',
      'responsable', 'fechaElaboracion', 'creadoEn', 'actualizadoEn', 'activo'
    ]
  }),
  PRESTAMOS: Object.freeze({
    SHEET: 'PrestamosMaterial',
    HEADERS: [
      'id', 'idProfesor', 'fecha', 'material', 'cantidad', 'solicitadoPor',
      'fechaEntrega', 'entregadoPor', 'fechaDevolucion', 'estadoDevolucion',
      'recibidoPor', 'estado', 'observaciones', 'creadoEn', 'actualizadoEn', 'activo'
    ]
  }),
  JUEGOS: Object.freeze({
    SHEET: 'JuegosEscolares',
    HEADERS: [
      'id', 'idProfesor', 'cicloEscolar', 'etapaZona', 'etapaEstatal',
      'etapaRegional', 'etapaNacional', 'notas', 'creadoEn', 'actualizadoEn', 'activo'
    ]
  }),
  CICLO: '2026-2027',
  TIPOS_EVENTO: ['Actividad', 'Evaluación', 'Reunión', 'Recordatorio', 'Juegos Escolares', 'Consejo Técnico', 'Otro'],
  PRIORIDADES: ['Baja', 'Media', 'Alta'],
  ESTADOS_EVENTO: ['Pendiente', 'Completado', 'Cancelado'],
  ESTADOS_PRESTAMO: ['Prestado', 'Devuelto', 'Pendiente', 'Incidencia']
});

function asegurarAgendaDigital_() {
  var db = getDb_();
  asegurarHoja_(db, EG_AGENDA.EVENTOS.SHEET, EG_AGENDA.EVENTOS.HEADERS);
  asegurarHoja_(db, EG_AGENDA.NOTAS.SHEET, EG_AGENDA.NOTAS.HEADERS);
  asegurarHoja_(db, EG_AGENDA.BITACORA.SHEET, EG_AGENDA.BITACORA.HEADERS);
  asegurarHoja_(db, EG_AGENDA.INVENTARIO.SHEET, EG_AGENDA.INVENTARIO.HEADERS);
  asegurarHoja_(db, EG_AGENDA.PRESTAMOS.SHEET, EG_AGENDA.PRESTAMOS.HEADERS);
  asegurarHoja_(db, EG_AGENDA.JUEGOS.SHEET, EG_AGENDA.JUEGOS.HEADERS);
}

function exigirDocenteAgenda_(docente) {
  if (!docente || !docente.id) lanzar_('La sesión docente no está disponible.', 'UNAUTHORIZED');
  if (normalizarRol_(docente.rol) === 'director') {
    lanzar_('La Agenda Digital pertenece al espacio de trabajo docente.', 'READ_ONLY');
  }
  return docente;
}

function textoAgenda_(valor, maximo) {
  var t = String(valor == null ? '' : valor).trim();
  if (maximo && t.length > maximo) t = t.slice(0, maximo);
  return t;
}

function fechaAgenda_(valor) {
  var t = textoAgenda_(valor, 20);
  if (!t) return '';
  var m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[1] + '-' + m[2] + '-' + m[3] : t.slice(0, 10);
}

function horaAgenda_(valor) {
  var t = textoAgenda_(valor, 10);
  var m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return '';
  return String(Number(m[1])).padStart(2, '0') + ':' + m[2];
}

function booleanoAgenda_(valor) {
  return esActivo_(valor) ? 'SI' : 'NO';
}

function valorListaAgenda_(valor, permitidos, porDefecto) {
  var limpio = textoAgenda_(valor, 80);
  var encontrado = permitidos.filter(function(x) {
    return normalizarTexto_(x).toLowerCase() === normalizarTexto_(limpio).toLowerCase();
  })[0];
  return encontrado || porDefecto;
}

function registrosAgendaProfesor_(config, idProfesor) {
  asegurarAgendaDigital_();
  return leerObjetos_(config.SHEET).objetos.filter(function(r) {
    return String(r.idProfesor || '') === String(idProfesor || '') && esActivo_(r.activo);
  });
}

function buscarRegistroAgenda_(config, docente, id) {
  var registro = registrosAgendaProfesor_(config, docente.id).filter(function(r) {
    return String(r.id || '') === String(id || '');
  })[0];
  if (!registro) lanzar_('El registro no existe o no pertenece a esta cuenta.', 'NOT_FOUND');
  return registro;
}

function guardarRegistroAgenda_(config, docente, payload, datos) {
  asegurarAgendaDigital_();
  var id = textoAgenda_(payload.id, 120);
  var ahora = ahora_();

  if (id) {
    var existente = buscarRegistroAgenda_(config, docente, id);
    datos.actualizadoEn = ahora;
    actualizarFilaObjeto_(config.SHEET, existente.__row, datos);
    return {
      status: 'success',
      message: 'Registro actualizado.',
      id: id,
      actualizado: true
    };
  }

  datos.id = Utilities.getUuid();
  datos.idProfesor = String(docente.id);
  datos.creadoEn = ahora;
  datos.actualizadoEn = ahora;
  datos.activo = 'SI';
  anexarObjeto_(config.SHEET, datos);

  return {
    status: 'success',
    message: 'Registro guardado.',
    id: datos.id,
    actualizado: false
  };
}

function eliminarRegistroAgenda_(config, docente, id, mensaje) {
  var registro = buscarRegistroAgenda_(config, docente, id);
  actualizarFilaObjeto_(config.SHEET, registro.__row, {
    activo: 'NO',
    actualizadoEn: ahora_()
  });
  return { status: 'success', message: mensaje || 'Registro eliminado.' };
}

function obtenerAgendaContexto_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  asegurarAgendaDigital_();

  var alumnos = filtrarPorProfesor_(EG.SHEETS.ALUMNOS, docente.id);
  var horarios = filtrarPorProfesor_(EG.SHEETS.HORARIOS, docente.id);
  var planificacion = filtrarPorProfesor_(EG.SHEETS.PLANIFICACION, docente.id);

  return {
    status: 'success',
    cicloEscolar: EG_AGENDA.CICLO,
    profesor: perfilPublico_(docente),
    institucion: obtenerConfiguracion_('institucion') || '',
    tiposEvento: EG_AGENDA.TIPOS_EVENTO,
    prioridades: EG_AGENDA.PRIORIDADES,
    estadosEvento: EG_AGENDA.ESTADOS_EVENTO,
    estadosPrestamo: EG_AGENDA.ESTADOS_PRESTAMO,
    alumnos: alumnos.map(function(a) {
      return {
        id: String(a.id || ''),
        nombre: String(a.nombre || ''),
        cedula: String(a.cedula || ''),
        ano: String(a.ano || ''),
        seccion: String(a.seccion || ''),
        turno: String(a.turno || '')
      };
    }),
    horarios: horarios,
    planificacion: planificacion
  };
}

function obtenerAgendaResumen_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  asegurarAgendaDigital_();

  var hoy = fechaAgenda_(payload && payload.fecha) || fechaHoy_();
  var eventos = registrosAgendaProfesor_(EG_AGENDA.EVENTOS, docente.id);
  var prestamos = registrosAgendaProfesor_(EG_AGENDA.PRESTAMOS, docente.id);
  var bitacora = registrosAgendaProfesor_(EG_AGENDA.BITACORA, docente.id);
  var inventario = registrosAgendaProfesor_(EG_AGENDA.INVENTARIO, docente.id);
  var notas = registrosAgendaProfesor_(EG_AGENDA.NOTAS, docente.id);

  var pendientesHoy = eventos.filter(function(e) {
    return fechaAgenda_(e.fecha) === hoy &&
      valorListaAgenda_(e.estado, EG_AGENDA.ESTADOS_EVENTO, 'Pendiente') === 'Pendiente';
  });

  var proximos = eventos.filter(function(e) {
    var f = fechaAgenda_(e.fecha);
    return f && f >= hoy &&
      valorListaAgenda_(e.estado, EG_AGENDA.ESTADOS_EVENTO, 'Pendiente') === 'Pendiente';
  }).sort(function(a, b) {
    var f = String(a.fecha || '').localeCompare(String(b.fecha || ''));
    if (f !== 0) return f;
    return String(a.hora || '').localeCompare(String(b.hora || ''));
  }).slice(0, 8);

  var prestamosPendientes = prestamos.filter(function(p) {
    return valorListaAgenda_(p.estado, EG_AGENDA.ESTADOS_PRESTAMO, 'Prestado') !== 'Devuelto';
  });

  var reposicion = inventario.filter(function(i) {
    return Number(i.necesitaReposicion || 0) > 0 || Number(i.malEstado || 0) > 0;
  });

  return {
    status: 'success',
    fecha: hoy,
    cicloEscolar: EG_AGENDA.CICLO,
    hoy: {
      eventosPendientes: pendientesHoy.length,
      proximos: proximos
    },
    totales: {
      eventos: eventos.length,
      notas: notas.length,
      bitacora: bitacora.length,
      inventario: inventario.length,
      prestamosPendientes: prestamosPendientes.length,
      materialesReposicion: reposicion.length
    }
  };
}

/* ---------- EVENTOS ---------- */

function listarAgendaEventos_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  payload = payload || {};

  var desde = fechaAgenda_(payload.desde);
  var hasta = fechaAgenda_(payload.hasta);
  var estado = textoAgenda_(payload.estado, 40);
  var tipo = textoAgenda_(payload.tipo, 60);
  var limite = Math.max(1, Math.min(Number(payload.limite || 300), 500));

  var lista = registrosAgendaProfesor_(EG_AGENDA.EVENTOS, docente.id)
    .filter(function(e) {
      var f = fechaAgenda_(e.fecha);
      if (desde && f < desde) return false;
      if (hasta && f > hasta) return false;
      if (estado && normalizarTexto_(e.estado).toLowerCase() !== normalizarTexto_(estado).toLowerCase()) return false;
      if (tipo && normalizarTexto_(e.tipo).toLowerCase() !== normalizarTexto_(tipo).toLowerCase()) return false;
      return true;
    })
    .sort(function(a, b) {
      var f = String(a.fecha || '').localeCompare(String(b.fecha || ''));
      if (f !== 0) return f;
      return String(a.hora || '').localeCompare(String(b.hora || ''));
    })
    .slice(0, limite)
    .map(function(e) {
      return {
        id: String(e.id || ''),
        fecha: fechaAgenda_(e.fecha),
        hora: horaAgenda_(e.hora),
        tipo: String(e.tipo || 'Actividad'),
        titulo: String(e.titulo || ''),
        descripcion: String(e.descripcion || ''),
        prioridad: String(e.prioridad || 'Media'),
        estado: String(e.estado || 'Pendiente'),
        ano: String(e.ano || ''),
        seccion: String(e.seccion || ''),
        turno: String(e.turno || ''),
        recordatorio: esActivo_(e.recordatorio),
        creadoEn: String(e.creadoEn || ''),
        actualizadoEn: String(e.actualizadoEn || '')
      };
    });

  return { status: 'success', eventos: lista };
}

function guardarAgendaEvento_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  payload = payload || {};

  var titulo = textoAgenda_(payload.titulo, 180);
  var fecha = fechaAgenda_(payload.fecha);
  if (!titulo) lanzar_('Escribe el título del evento.', 'BAD_REQUEST');
  if (!fecha) lanzar_('Selecciona la fecha del evento.', 'BAD_REQUEST');

  return guardarRegistroAgenda_(EG_AGENDA.EVENTOS, docente, payload, {
    fecha: fecha,
    hora: horaAgenda_(payload.hora),
    tipo: valorListaAgenda_(payload.tipo, EG_AGENDA.TIPOS_EVENTO, 'Actividad'),
    titulo: titulo,
    descripcion: textoAgenda_(payload.descripcion, 1500),
    prioridad: valorListaAgenda_(payload.prioridad, EG_AGENDA.PRIORIDADES, 'Media'),
    estado: valorListaAgenda_(payload.estado, EG_AGENDA.ESTADOS_EVENTO, 'Pendiente'),
    ano: textoAgenda_(payload.ano, 80),
    seccion: textoAgenda_(payload.seccion, 30).toUpperCase(),
    turno: textoAgenda_(payload.turno, 30),
    recordatorio: booleanoAgenda_(payload.recordatorio)
  });
}

function eliminarAgendaEvento_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  return eliminarRegistroAgenda_(EG_AGENDA.EVENTOS, docente, payload && payload.id, 'Evento eliminado.');
}

/* ---------- NOTAS ---------- */

function listarAgendaNotas_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  payload = payload || {};
  var buscar = normalizarTexto_(payload.buscar || '').toLowerCase();
  var categoria = normalizarTexto_(payload.categoria || '').toLowerCase();

  var notas = registrosAgendaProfesor_(EG_AGENDA.NOTAS, docente.id)
    .filter(function(n) {
      if (categoria && normalizarTexto_(n.categoria).toLowerCase() !== categoria) return false;
      if (!buscar) return true;
      var bolsa = normalizarTexto_([
        n.titulo, n.contenido, n.categoria, n.mes, n.semana
      ].join(' ')).toLowerCase();
      return bolsa.indexOf(buscar) !== -1;
    })
    .sort(function(a, b) {
      return String(b.actualizadoEn || b.creadoEn || '').localeCompare(String(a.actualizadoEn || a.creadoEn || ''));
    })
    .map(function(n) {
      return {
        id: String(n.id || ''),
        titulo: String(n.titulo || ''),
        contenido: String(n.contenido || ''),
        categoria: String(n.categoria || 'General'),
        fecha: fechaAgenda_(n.fecha),
        mes: String(n.mes || ''),
        semana: String(n.semana || ''),
        favorito: esActivo_(n.favorito),
        creadoEn: String(n.creadoEn || ''),
        actualizadoEn: String(n.actualizadoEn || '')
      };
    });

  return { status: 'success', notas: notas };
}

function guardarAgendaNota_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  payload = payload || {};
  var contenido = textoAgenda_(payload.contenido, 8000);
  if (!contenido) lanzar_('Escribe el contenido de la nota.', 'BAD_REQUEST');

  return guardarRegistroAgenda_(EG_AGENDA.NOTAS, docente, payload, {
    titulo: textoAgenda_(payload.titulo, 180) || 'Nota',
    contenido: contenido,
    categoria: textoAgenda_(payload.categoria, 80) || 'General',
    fecha: fechaAgenda_(payload.fecha) || fechaHoy_(),
    mes: textoAgenda_(payload.mes, 40),
    semana: textoAgenda_(payload.semana, 40),
    favorito: booleanoAgenda_(payload.favorito)
  });
}

function eliminarAgendaNota_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  return eliminarRegistroAgenda_(EG_AGENDA.NOTAS, docente, payload && payload.id, 'Nota eliminada.');
}

/* ---------- BITÁCORA ---------- */

function listarAgendaBitacora_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  payload = payload || {};
  var idAlumno = textoAgenda_(payload.idAlumno, 120);
  var desde = fechaAgenda_(payload.desde);
  var hasta = fechaAgenda_(payload.hasta);

  var lista = registrosAgendaProfesor_(EG_AGENDA.BITACORA, docente.id)
    .filter(function(b) {
      var f = fechaAgenda_(b.fecha);
      if (idAlumno && String(b.idAlumno || '') !== idAlumno) return false;
      if (desde && f < desde) return false;
      if (hasta && f > hasta) return false;
      return true;
    })
    .sort(function(a, b) {
      return String(b.fecha || '').localeCompare(String(a.fecha || ''));
    });

  return { status: 'success', registros: lista };
}

function guardarAgendaBitacora_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  payload = payload || {};

  var idAlumno = textoAgenda_(payload.idAlumno, 120);
  var alumno = null;

  if (idAlumno) {
    alumno = filtrarPorProfesor_(EG.SHEETS.ALUMNOS, docente.id).filter(function(a) {
      return String(a.id || '') === idAlumno;
    })[0];
    if (!alumno) lanzar_('El estudiante no pertenece a esta cuenta docente.', 'NOT_FOUND');
  }

  var situacion = textoAgenda_(payload.situacionObservada, 3500);
  var accion = textoAgenda_(payload.accionRealizada, 3500);
  var seguimiento = textoAgenda_(payload.seguimientoAcuerdos, 3500);

  if (!situacion && !accion && !seguimiento) {
    lanzar_('Escribe al menos una observación, acción o seguimiento.', 'BAD_REQUEST');
  }

  return guardarRegistroAgenda_(EG_AGENDA.BITACORA, docente, payload, {
    idAlumno: alumno ? String(alumno.id || '') : '',
    alumno: alumno ? String(alumno.nombre || '') : textoAgenda_(payload.alumno, 180),
    edad: textoAgenda_(payload.edad, 20),
    fecha: fechaAgenda_(payload.fecha) || fechaHoy_(),
    sesionActividad: textoAgenda_(payload.sesionActividad, 300),
    situacionObservada: situacion,
    accionRealizada: accion,
    seguimientoAcuerdos: seguimiento,
    ano: alumno ? String(alumno.ano || '') : textoAgenda_(payload.ano, 80),
    seccion: alumno ? String(alumno.seccion || '') : textoAgenda_(payload.seccion, 30).toUpperCase(),
    turno: alumno ? String(alumno.turno || '') : textoAgenda_(payload.turno, 30)
  });
}

function eliminarAgendaBitacora_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  return eliminarRegistroAgenda_(EG_AGENDA.BITACORA, docente, payload && payload.id, 'Registro de bitácora eliminado.');
}

/* ---------- INVENTARIO DEPORTIVO ---------- */

function listarInventarioDeportivo_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  payload = payload || {};
  var buscar = normalizarTexto_(payload.buscar || '').toLowerCase();

  var lista = registrosAgendaProfesor_(EG_AGENDA.INVENTARIO, docente.id)
    .filter(function(i) {
      if (!buscar) return true;
      return normalizarTexto_([i.material, i.observaciones, i.responsable].join(' ')).toLowerCase().indexOf(buscar) !== -1;
    })
    .sort(function(a, b) {
      return String(a.material || '').localeCompare(String(b.material || ''), 'es', { sensitivity: 'base' });
    });

  return { status: 'success', inventario: lista };
}

function guardarInventarioDeportivo_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  payload = payload || {};
  var material = textoAgenda_(payload.material, 220);
  if (!material) lanzar_('Escribe el nombre del material o equipo.', 'BAD_REQUEST');

  function entero(v) {
    return Math.max(0, Math.floor(Number(v || 0)));
  }

  var buen = entero(payload.buenEstado);
  var regular = entero(payload.regularEstado);
  var mal = entero(payload.malEstado);
  var reposicion = entero(payload.necesitaReposicion);
  var total = entero(payload.cantidadTotal);

  if (!total) total = buen + regular + mal;

  return guardarRegistroAgenda_(EG_AGENDA.INVENTARIO, docente, payload, {
    material: material,
    cantidadTotal: total,
    buenEstado: buen,
    regularEstado: regular,
    malEstado: mal,
    necesitaReposicion: reposicion,
    observaciones: textoAgenda_(payload.observaciones, 1800),
    responsable: textoAgenda_(payload.responsable, 180) || String(docente.nombre || ''),
    fechaElaboracion: fechaAgenda_(payload.fechaElaboracion) || fechaHoy_()
  });
}

function eliminarInventarioDeportivo_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  return eliminarRegistroAgenda_(EG_AGENDA.INVENTARIO, docente, payload && payload.id, 'Material eliminado del inventario.');
}

/* ---------- PRÉSTAMOS ---------- */

function listarPrestamosMaterial_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  payload = payload || {};
  var estado = normalizarTexto_(payload.estado || '').toLowerCase();

  var lista = registrosAgendaProfesor_(EG_AGENDA.PRESTAMOS, docente.id)
    .filter(function(p) {
      if (!estado) return true;
      return normalizarTexto_(p.estado).toLowerCase() === estado;
    })
    .sort(function(a, b) {
      return String(b.fecha || '').localeCompare(String(a.fecha || ''));
    });

  return { status: 'success', prestamos: lista };
}

function guardarPrestamoMaterial_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  payload = payload || {};

  var material = textoAgenda_(payload.material, 220);
  var solicitadoPor = textoAgenda_(payload.solicitadoPor, 220);
  var cantidad = Math.max(1, Math.floor(Number(payload.cantidad || 1)));

  if (!material) lanzar_('Selecciona o escribe el material prestado.', 'BAD_REQUEST');
  if (!solicitadoPor) lanzar_('Indica quién solicita el material.', 'BAD_REQUEST');

  return guardarRegistroAgenda_(EG_AGENDA.PRESTAMOS, docente, payload, {
    fecha: fechaAgenda_(payload.fecha) || fechaHoy_(),
    material: material,
    cantidad: cantidad,
    solicitadoPor: solicitadoPor,
    fechaEntrega: fechaAgenda_(payload.fechaEntrega) || fechaAgenda_(payload.fecha) || fechaHoy_(),
    entregadoPor: textoAgenda_(payload.entregadoPor, 180) || String(docente.nombre || ''),
    fechaDevolucion: fechaAgenda_(payload.fechaDevolucion),
    estadoDevolucion: textoAgenda_(payload.estadoDevolucion, 120),
    recibidoPor: textoAgenda_(payload.recibidoPor, 180),
    estado: valorListaAgenda_(payload.estado, EG_AGENDA.ESTADOS_PRESTAMO, 'Prestado'),
    observaciones: textoAgenda_(payload.observaciones, 1800)
  });
}

function actualizarEstadoPrestamo_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  payload = payload || {};
  var registro = buscarRegistroAgenda_(EG_AGENDA.PRESTAMOS, docente, payload.id);
  var estado = valorListaAgenda_(payload.estado, EG_AGENDA.ESTADOS_PRESTAMO, 'Devuelto');

  var cambios = {
    estado: estado,
    actualizadoEn: ahora_()
  };

  if (estado === 'Devuelto') {
    cambios.fechaDevolucion = fechaAgenda_(payload.fechaDevolucion) || fechaHoy_();
    cambios.estadoDevolucion = textoAgenda_(payload.estadoDevolucion, 120) || 'Devuelto';
    cambios.recibidoPor = textoAgenda_(payload.recibidoPor, 180) || String(docente.nombre || '');
  }

  if (payload.observaciones != null) {
    cambios.observaciones = textoAgenda_(payload.observaciones, 1800);
  }

  actualizarFilaObjeto_(EG_AGENDA.PRESTAMOS.SHEET, registro.__row, cambios);

  return {
    status: 'success',
    message: estado === 'Devuelto' ? 'Devolución registrada.' : 'Estado del préstamo actualizado.'
  };
}

function eliminarPrestamoMaterial_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  return eliminarRegistroAgenda_(EG_AGENDA.PRESTAMOS, docente, payload && payload.id, 'Préstamo eliminado.');
}

/* ---------- JUEGOS ESCOLARES ---------- */

function obtenerJuegosEscolares_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  asegurarAgendaDigital_();

  var ciclo = textoAgenda_(payload && payload.cicloEscolar, 30) || EG_AGENDA.CICLO;
  var registro = registrosAgendaProfesor_(EG_AGENDA.JUEGOS, docente.id).filter(function(j) {
    return String(j.cicloEscolar || '') === ciclo;
  })[0];

  return {
    status: 'success',
    cicloEscolar: ciclo,
    juegos: registro ? {
      id: String(registro.id || ''),
      cicloEscolar: String(registro.cicloEscolar || ciclo),
      etapaZona: String(registro.etapaZona || ''),
      etapaEstatal: String(registro.etapaEstatal || ''),
      etapaRegional: String(registro.etapaRegional || ''),
      etapaNacional: String(registro.etapaNacional || ''),
      notas: String(registro.notas || '')
    } : {
      id: '',
      cicloEscolar: ciclo,
      etapaZona: '',
      etapaEstatal: '',
      etapaRegional: '',
      etapaNacional: '',
      notas: ''
    }
  };
}

function guardarJuegosEscolares_(docente, payload) {
  docente = exigirDocenteAgenda_(docente);
  payload = payload || {};
  asegurarAgendaDigital_();

  var ciclo = textoAgenda_(payload.cicloEscolar, 30) || EG_AGENDA.CICLO;
  var existente = registrosAgendaProfesor_(EG_AGENDA.JUEGOS, docente.id).filter(function(j) {
    return String(j.cicloEscolar || '') === ciclo;
  })[0];

  var datosPayload = {
    id: existente ? String(existente.id || '') : '',
    cicloEscolar: ciclo,
    etapaZona: textoAgenda_(payload.etapaZona, 2500),
    etapaEstatal: textoAgenda_(payload.etapaEstatal, 2500),
    etapaRegional: textoAgenda_(payload.etapaRegional, 2500),
    etapaNacional: textoAgenda_(payload.etapaNacional, 2500),
    notas: textoAgenda_(payload.notas, 3500)
  };

  return guardarRegistroAgenda_(EG_AGENDA.JUEGOS, docente, datosPayload, {
    cicloEscolar: ciclo,
    etapaZona: datosPayload.etapaZona,
    etapaEstatal: datosPayload.etapaEstatal,
    etapaRegional: datosPayload.etapaRegional,
    etapaNacional: datosPayload.etapaNacional,
    notas: datosPayload.notas
  });
}

/* EDUGESTION_FASE_19_AGENDA_DIGITAL_END */



/* =========================================================
   EduGestión · FASE 20
   IMPORTADOR DE LIBROS DESDE GOOGLE DRIVE → BIBLIOTECA DIGITAL

   - Importa todos los archivos de una carpeta de Drive.
   - Recorre subcarpetas de forma recursiva.
   - No duplica archivos ya guardados por archivoId.
   - Guarda referencias/enlaces: NO copia físicamente el archivo.
   - Categoría por defecto: Libros.
   - Carpeta solicitada inicialmente:
     1j-dH6bd00zF0IRJIhSDSBsMYOrBXPs7W
   ========================================================= */

var EG_IMPORTADOR_BIBLIOTECA = Object.freeze({
  CARPETA_PREDETERMINADA_ID: '1j-dH6bd00zF0IRJIhSDSBsMYOrBXPs7W',
  CATEGORIA: 'Libros',
  MAX_ARCHIVOS: 1000,
  MIME_ADMITIDOS: [
    'application/pdf',
    'application/vnd.google-apps.document',
    'application/vnd.google-apps.presentation',
    'application/vnd.google-apps.spreadsheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'text/plain',
    'application/epub+zip'
  ]
});

function extraerIdCarpetaDriveBiblioteca_(valor) {
  var texto = String(valor || '').trim();
  if (!texto) return EG_IMPORTADOR_BIBLIOTECA.CARPETA_PREDETERMINADA_ID;

  var match = texto.match(/\/folders\/([A-Za-z0-9_-]+)/i);
  if (match && match[1]) return match[1];

  if (/^[A-Za-z0-9_-]{10,}$/.test(texto)) return texto;

  lanzar_('El enlace o ID de la carpeta de Google Drive no es válido.', 'VALIDATION_ERROR');
}

function tituloArchivoBibliotecaDrive_(nombre) {
  var titulo = String(nombre || '').trim();
  titulo = titulo.replace(/\.(pdf|docx?|pptx?|txt|epub)$/i, '');
  return titulo || 'Libro sin título';
}

function mimePermitidoBibliotecaDrive_(mimeType) {
  var mime = String(mimeType || '').trim();
  if (!mime) return false;

  // También permitimos cualquier archivo PDF detectado correctamente.
  if (mime === 'application/pdf') return true;

  return EG_IMPORTADOR_BIBLIOTECA.MIME_ADMITIDOS.indexOf(mime) !== -1;
}

function mapaArchivosBibliotecaDocente_(docente) {
  asegurarBibliotecaDigital_();

  var mapa = {};
  leerObjetos_(EG.SHEETS.BIBLIOTECA).objetos.forEach(function(r) {
    if (String(r.idProfesor || '') !== String(docente.id || '')) return;

    var archivoId = String(r.archivoId || '').trim();
    if (archivoId) mapa[archivoId] = true;

    var url = String(r.url || '').trim();
    if (url) mapa['url:' + url] = true;
  });

  return mapa;
}

function recorrerCarpetaDriveBiblioteca_(carpeta, ruta, acumulado, maximo) {
  if (acumulado.length >= maximo) return;

  var archivos = carpeta.getFiles();
  while (archivos.hasNext() && acumulado.length < maximo) {
    var archivo = archivos.next();
    var mimeType = String(archivo.getMimeType() || '');

    if (!mimePermitidoBibliotecaDrive_(mimeType)) continue;

    acumulado.push({
      archivoId: String(archivo.getId()),
      archivoNombre: String(archivo.getName() || ''),
      titulo: tituloArchivoBibliotecaDrive_(archivo.getName()),
      mimeType: mimeType,
      tamanoBytes: Number(archivo.getSize() || 0),
      url: String(archivo.getUrl() || ''),
      ruta: ruta || carpeta.getName()
    });
  }

  var subcarpetas = carpeta.getFolders();
  while (subcarpetas.hasNext() && acumulado.length < maximo) {
    var sub = subcarpetas.next();
    var nuevaRuta = (ruta ? ruta + ' / ' : '') + String(sub.getName() || 'Subcarpeta');
    recorrerCarpetaDriveBiblioteca_(sub, nuevaRuta, acumulado, maximo);
  }
}

function obtenerArchivosCarpetaDriveBiblioteca_(payload) {
  payload = payload || {};

  var carpetaId = extraerIdCarpetaDriveBiblioteca_(
    payload.carpetaUrl || payload.carpetaId || EG_IMPORTADOR_BIBLIOTECA.CARPETA_PREDETERMINADA_ID
  );

  var carpeta;
  try {
    carpeta = DriveApp.getFolderById(carpetaId);
  } catch (error) {
    lanzar_(
      'No pude abrir la carpeta de Google Drive. Verifica que la cuenta de Apps Script tenga acceso a esa carpeta.',
      'DRIVE_FOLDER_ACCESS'
    );
  }

  var maximo = Math.max(
    1,
    Math.min(Number(payload.maxArchivos || EG_IMPORTADOR_BIBLIOTECA.MAX_ARCHIVOS), EG_IMPORTADOR_BIBLIOTECA.MAX_ARCHIVOS)
  );

  var archivos = [];
  recorrerCarpetaDriveBiblioteca_(carpeta, String(carpeta.getName() || ''), archivos, maximo);

  return {
    carpetaId: carpetaId,
    carpetaNombre: String(carpeta.getName() || 'Carpeta de Drive'),
    archivos: archivos,
    limite: maximo
  };
}

function previsualizarCarpetaDriveBiblioteca_(docente, payload) {
  asegurarBibliotecaDigital_();

  var datos = obtenerArchivosCarpetaDriveBiblioteca_(payload || {});
  var existentes = mapaArchivosBibliotecaDocente_(docente);

  var nuevos = datos.archivos.filter(function(a) {
    return !existentes[String(a.archivoId)] && !existentes['url:' + String(a.url || '')];
  });

  return {
    status: 'success',
    carpetaId: datos.carpetaId,
    carpetaNombre: datos.carpetaNombre,
    encontrados: datos.archivos.length,
    nuevos: nuevos.length,
    duplicados: datos.archivos.length - nuevos.length,
    archivos: nuevos.slice(0, 100).map(function(a) {
      return {
        archivoId: a.archivoId,
        titulo: a.titulo,
        archivoNombre: a.archivoNombre,
        mimeType: a.mimeType,
        ruta: a.ruta
      };
    }),
    message: nuevos.length
      ? 'La carpeta está lista para importar.'
      : 'No hay libros nuevos para importar.'
  };
}

function importarCarpetaDriveBiblioteca_(docente, payload) {
  asegurarBibliotecaDigital_();
  payload = payload || {};

  var datos = obtenerArchivosCarpetaDriveBiblioteca_(payload);
  var existentes = mapaArchivosBibliotecaDocente_(docente);

  var categoria = normalizarTexto_(payload.categoria || EG_IMPORTADOR_BIBLIOTECA.CATEGORIA);
  var area = normalizarTexto_(payload.area || docente.materia || 'Educación Física');
  var etiquetasBase = normalizarTexto_(payload.etiquetas || 'libros, biblioteca digital, google drive');
  var ahora = ahora_();

  var importados = [];
  var duplicados = [];
  var errores = [];

  datos.archivos.forEach(function(a) {
    var claveId = String(a.archivoId || '');
    var claveUrl = 'url:' + String(a.url || '');

    if (existentes[claveId] || existentes[claveUrl]) {
      duplicados.push({
        archivoId: a.archivoId,
        titulo: a.titulo
      });
      return;
    }

    try {
      var recurso = {
        id: crearId_('BIB'),
        idProfesor: docente.id,
        tipo: 'Archivo',
        titulo: a.titulo,
        categoria: categoria,
        area: area,
        descripcion: 'Libro importado desde Google Drive. Carpeta: ' + a.ruta,
        etiquetas: etiquetasBase,
        url: a.url,
        archivoId: a.archivoId,
        archivoNombre: a.archivoNombre,
        mimeType: a.mimeType,
        tamanoBytes: a.tamanoBytes,
        apunte: '',
        favorito: 'NO',
        creadoEn: ahora,
        actualizadoEn: ahora
      };

      anexarObjeto_(EG.SHEETS.BIBLIOTECA, recurso);

      existentes[claveId] = true;
      existentes[claveUrl] = true;

      importados.push({
        id: recurso.id,
        archivoId: a.archivoId,
        titulo: a.titulo,
        ruta: a.ruta
      });
    } catch (error) {
      errores.push({
        archivoId: a.archivoId,
        titulo: a.titulo,
        error: String(error && error.message ? error.message : error)
      });
    }
  });

  return {
    status: 'success',
    carpetaId: datos.carpetaId,
    carpetaNombre: datos.carpetaNombre,
    encontrados: datos.archivos.length,
    importados: importados.length,
    duplicados: duplicados.length,
    errores: errores.length,
    detalleImportados: importados.slice(0, 100),
    detalleErrores: errores.slice(0, 50),
    message: importados.length
      ? 'Se importaron ' + importados.length + ' libro(s) a tu Biblioteca Digital.'
      : 'No se importaron libros nuevos. Los archivos encontrados ya estaban registrados.'
  };
}



/* =========================================================
   EDUGESTIÓN · FASE 21B
   MULTIUSUARIO INSTITUCIONAL + CONTROL DE ESTUDIO
   ========================================================= */

function obtenerAccesosInstitucionalesBackend_() {
  var hoja = getDb_().getSheetByName('AccesosInstitucionales');
  if (!hoja || hoja.getLastRow() < 2) return [];

  var lastCol = Math.max(7, hoja.getLastColumn());
  var valores = hoja.getRange(1, 1, hoja.getLastRow(), lastCol).getValues();
  var headers = valores[0].map(function(h) {
    return String(h || '').trim().toLowerCase();
  });

  function col(nombre, fallback) {
    var idx = headers.indexOf(String(nombre).toLowerCase());
    return idx >= 0 ? idx : fallback;
  }

  var cId = col('id', 0);
  var cNombre = col('nombre', 1);
  var cCorreo = col('correo', 2);
  var cRol = col('rol', 3);
  var cActivo = col('activo', 4);

  return valores.slice(1).map(function(r, i) {
    return {
      __row: i + 2,
      id: String(r[cId] || '').trim(),
      nombre: String(r[cNombre] || '').trim(),
      correo: normalizarEmail_(r[cCorreo] || ''),
      rol: normalizarRol_(r[cRol] || ''),
      activo: esActivo_(r[cActivo])
    };
  }).filter(function(a) {
    return !!a.correo;
  });
}


function accesoInstitucionalVigente_(docente) {
  var rol = normalizarRol_(docente && docente.rol);
  if (!esRolInstitucional_(rol)) return true;

  var correo = normalizarEmail_(docente && docente.email || '');
  if (!correo) {
    // Compatibilidad con cuentas antiguas de Dirección:
    // no las rompe hasta que se vinculen desde el nuevo menú.
    return true;
  }

  var accesos = obtenerAccesosInstitucionalesBackend_();
  if (!accesos.length) return true;

  var registro = accesos.filter(function(a) {
    return a.correo === correo;
  })[0];

  // Si el correo ya está administrado por AccesosInstitucionales,
  // el estado y el rol de esa hoja se vuelven obligatorios.
  if (!registro) return false;
  return registro.activo && registro.rol === rol;
}


function prepararAccesoInstitucionalDesdeMenu() {
  verificarInstalacion_();
  var ui = SpreadsheetApp.getUi();
  var accesos = obtenerAccesosInstitucionalesBackend_();

  if (!accesos.length) {
    ui.alert(
      'No hay accesos institucionales',
      'Primero registra al Director y/o Control de Estudio en la hoja AccesosInstitucionales.',
      ui.ButtonSet.OK
    );
    return;
  }

  var correoRes = ui.prompt(
    'Preparar acceso institucional',
    'Escribe el correo que ya registraste en AccesosInstitucionales:',
    ui.ButtonSet.OK_CANCEL
  );
  if (correoRes.getSelectedButton() !== ui.Button.OK) return;

  var correo = normalizarEmail_(correoRes.getResponseText());
  var acceso = accesos.filter(function(a) {
    return a.correo === correo;
  })[0];

  if (!acceso) {
    ui.alert(
      'Correo no encontrado',
      'Ese correo no está registrado en AccesosInstitucionales.',
      ui.ButtonSet.OK
    );
    return;
  }

  if (!acceso.activo) {
    ui.alert(
      'Acceso inactivo',
      'Ese acceso está marcado como NO. Actívalo antes de preparar la cuenta.',
      ui.ButtonSet.OK
    );
    return;
  }

  var claveRes = ui.prompt(
    'Contraseña temporal',
    'Crea una contraseña temporal de mínimo 10 caracteres para ' + acceso.nombre + ':',
    ui.ButtonSet.OK_CANCEL
  );
  if (claveRes.getSelectedButton() !== ui.Button.OK) return;

  var clave = String(claveRes.getResponseText() || '');
  if (clave.length < 10) {
    ui.alert(
      'Contraseña demasiado corta',
      'Usa al menos 10 caracteres.',
      ui.ButtonSet.OK
    );
    return;
  }

  var tabla = leerObjetos_(EG.SHEETS.DOCENTES);
  var cuenta = tabla.objetos.filter(function(d) {
    return normalizarEmail_(d.email || '') === correo;
  })[0];

  // Compatibilidad: si ya existía una cuenta antigua de Director sin correo,
  // la reutilizamos para no duplicar Dirección.
  if (!cuenta && acceso.rol === 'director') {
    cuenta = tabla.objetos.filter(function(d) {
      return normalizarRol_(d.rol) === 'director' && !normalizarEmail_(d.email || '');
    })[0];
  }

  var usuario;
  if (cuenta) {
    usuario = normalizarUsuario_(cuenta.usuario);
    var salt = crearSalt_();
    actualizarFilaObjeto_(EG.SHEETS.DOCENTES, cuenta.__row, {
      nombre: acceso.nombre || cuenta.nombre,
      materia: acceso.rol === 'director'
        ? 'Dirección institucional'
        : 'Control de Estudio',
      email: correo,
      seccion: 'TODAS',
      rol: acceso.rol,
      activo: 'SI',
      salt: salt,
      claveHash: hashClave_(clave, salt),
      actualizadoEn: ahora_()
    });
    invalidarSesionesDocente_(cuenta.id);
  } else {
    usuario = usuarioInstitucionalDesdeCorreo_(correo, tabla.objetos);
    crearDocente_(usuario, clave, {
      nombre: acceso.nombre || correo,
      materia: acceso.rol === 'director'
        ? 'Dirección institucional'
        : 'Control de Estudio',
      email: correo,
      telefono: '',
      seccion: 'TODAS',
      turno: 'Manana',
      rol: acceso.rol
    });
  }

  ui.alert(
    'Acceso preparado',
    'Nombre: ' + (acceso.nombre || '') +
    '\nRol: ' + (acceso.rol === 'director' ? 'DIRECTOR' : 'CONTROL_ESTUDIO') +
    '\nCorreo: ' + correo +
    '\nUsuario: ' + usuario +
    '\n\nPuede iniciar sesión usando el USUARIO o el CORREO y la contraseña temporal.',
    ui.ButtonSet.OK
  );
}


function usuarioInstitucionalDesdeCorreo_(correo, docentes) {
  var base = String(correo || '').split('@')[0]
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^[._-]+|[._-]+$/g, '');

  if (base.length < 4) base = 'acceso.' + base;
  base = base.substring(0, 32);

  var usados = {};
  (docentes || []).forEach(function(d) {
    usados[normalizarUsuario_(d.usuario)] = true;
  });

  if (!usados[base]) return base;

  for (var i = 2; i <= 99; i++) {
    var candidato = (base.substring(0, 35) + '.' + i).substring(0, 40);
    if (!usados[candidato]) return candidato;
  }

  return ('acceso.' + Utilities.getUuid().substring(0, 12)).toLowerCase();
}


function probarAislamientoMultiusuario() {
  verificarInstalacion_();

  var docentes = leerObjetos_(EG.SHEETS.DOCENTES).objetos.filter(function(d) {
    return normalizarRol_(d.rol) === 'docente' && esActivo_(d.activo);
  });

  var resultado = {
    status: 'success',
    docentesActivos: docentes.length,
    comprobaciones: [],
    mensaje: 'Cada registro docente se consulta por idProfesor en el backend.'
  };

  docentes.slice(0, 10).forEach(function(d) {
    resultado.comprobaciones.push({
      docente: String(d.nombre || d.usuario || ''),
      materia: String(d.materia || ''),
      idProfesor: String(d.id || ''),
      alumnosPropios: filtrarPorProfesor_(EG.SHEETS.ALUMNOS, d.id).length,
      planificacionesPropias: filtrarPorProfesor_(EG.SHEETS.PLANIFICACION, d.id).length,
      horariosPropios: filtrarPorProfesor_(EG.SHEETS.HORARIOS, d.id).length
    });
  });

  Logger.log(JSON.stringify(resultado, null, 2));
  return resultado;
}

/* EDUGESTION_FASE_21B_MULTIUSUARIO_INSTITUCIONAL_END */

/* EDUGESTION_FASE_20_IMPORTADOR_BIBLIOTECA_DRIVE_END */



/* =========================================================
 * EduGestión · V6.6
 * GESTIÓN INTEGRAL DE EVALUACIONES, ENTREGAS Y NOTAS
 * ========================================================= */

function asegurarGestionEvaluaciones_() {
  asegurarHoja_(getDb_(), EG.SHEETS.EVALUACION_SEGUIMIENTO, EG.HEADERS.EvaluacionSeguimiento);
  asegurarHoja_(getDb_(), EG.SHEETS.SEGUIMIENTO_ACADEMICO, EG.HEADERS.SeguimientoAcademico);
  asegurarHoja_(getDb_(), EG.SHEETS.CALIFICACIONES, EG.HEADERS.Calificaciones);
}

function rangoLapsoEvaluacion_(lapso) {
  var texto = String(lapso || '1er Lapso').toLowerCase();
  if (texto.indexOf('2') === 0 || texto.indexOf('seg') !== -1) {
    return { lapso: '2do Lapso', desde: '2027-01-11', hasta: '2027-04-30' };
  }
  if (texto.indexOf('3') === 0 || texto.indexOf('ter') !== -1) {
    return { lapso: '3er Lapso', desde: '2027-05-03', hasta: '2027-07-16' };
  }
  return { lapso: '1er Lapso', desde: '2026-09-21', hasta: '2026-12-15' };
}

function normalizarEstadoEntregaEvaluacion_(valor) {
  var t = normalizarTexto_(valor || '').toLowerCase();
  if (t === 'entrego' || t === 'entregó' || t === 'si' || t === 'sí') return 'Entrego';
  if (t === 'no entrego' || t === 'no entregó' || t === 'no') return 'No entrego';
  if (t === 'tardia' || t === 'tardía' || t === 'entrega tardia' || t === 'entrega tardía') return 'Tardia';
  if (t === 'justificada' || t === 'justificado') return 'Justificada';
  return 'Pendiente';
}

function actividadEvaluacionPublica_(p) {
  return {
    id: String(p.id || ''),
    nombre: String(p.actividad || p.nombre || 'Actividad evaluativa'),
    puntos: Number(p.puntos || p.ponderacion || 0),
    fecha: String(serializarValor_(p.fecha, 'fecha') || ''),
    ano: String(p.ano || ''),
    seccion: String(p.seccion || '').toUpperCase()
  };
}

function upsertCalificacionEvaluacion_(docente, actividad, alumno, contexto, reg) {
  var hoja = asegurarHoja_(getDb_(), EG.SHEETS.CALIFICACIONES, EG.HEADERS.Calificaciones);
  var tabla = leerObjetos_(EG.SHEETS.CALIFICACIONES);
  var existente = tabla.objetos.filter(function(item) {
    return String(item.idProfesor) === String(docente.id) &&
      String(item.idAlumno || '') === String(alumno.id || '') &&
      normalizarTexto_(item.materia || '') === normalizarTexto_(docente.materia || '') &&
      normalizarTexto_(item.ano || '').toUpperCase() === normalizarTexto_(contexto.ano || '').toUpperCase() &&
      normalizarTexto_(item.seccion || '').toUpperCase() === normalizarTexto_(contexto.seccion || '').toUpperCase() &&
      normalizarTurno_(item.turno || '') === normalizarTurno_(contexto.turno || '') &&
      normalizarTexto_(item.actividad || '') === normalizarTexto_(actividad.nombre || '') &&
      String(serializarValor_(item.fecha, 'fecha') || '') === String(actividad.fecha || '') &&
      normalizarTexto_(item.periodo || '') === normalizarTexto_(contexto.lapso || '');
  })[0];

  var notaValida = reg.nota === '' || reg.nota === null || reg.nota === undefined ? '' : Number(reg.nota);
  var datos = {
    id: existente && existente.id ? existente.id : Utilities.getUuid(),
    idProfesor: String(docente.id),
    idAlumno: String(alumno.id || ''),
    alumno: String(alumno.nombre || ''),
    cedula: String(alumno.cedula || ''),
    materia: String(docente.materia || ''),
    ano: String(contexto.ano || ''),
    seccion: String(contexto.seccion || '').toUpperCase(),
    turno: normalizarTurno_(contexto.turno || ''),
    actividad: String(actividad.nombre || ''),
    nota: notaValida,
    notaMaxima: Number(actividad.puntos || 0),
    fecha: String(actividad.fecha || ''),
    periodo: String(contexto.lapso || ''),
    creadoEn: existente ? String(existente.creadoEn || ahora_()) : ahora_(),
    actualizadoEn: ahora_()
  };

  if (existente) actualizarFilaObjeto_(EG.SHEETS.CALIFICACIONES, existente.__row, datos);
  else anexarObjeto_(EG.SHEETS.CALIFICACIONES, datos);
}

function obtenerGestionEvaluaciones_(docente, payload) {
  asegurarGestionEvaluaciones_();

  var ano = limpiarRequerido_(payload.ano, 'año');
  var seccion = limpiarRequerido_(payload.seccion, 'sección').toUpperCase();
  var turno = normalizarTurno_(limpiarRequerido_(payload.turno, 'turno'));
  var rango = rangoLapsoEvaluacion_(payload.lapso || '1er Lapso');

  var alumnos = filtrarPorProfesor_(EG.SHEETS.ALUMNOS, docente.id).filter(function(a) {
    return normalizarTexto_(a.ano || '').toUpperCase() === normalizarTexto_(ano).toUpperCase() &&
      normalizarTexto_(a.seccion || '').toUpperCase() === seccion &&
      normalizarTurno_(a.turno || '') === turno;
  }).sort(function(a, b) {
    return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
  });

  var planes = filtrarPorProfesor_(EG.SHEETS.PLANIFICACION, docente.id).filter(function(p) {
    var fecha = String(serializarValor_(p.fecha, 'fecha') || '');
    return normalizarTexto_(p.ano || '').toUpperCase() === normalizarTexto_(ano).toUpperCase() &&
      normalizarTexto_(p.seccion || '').toUpperCase() === seccion &&
      (!fecha || (fecha >= rango.desde && fecha <= rango.hasta));
  }).sort(function(a, b) {
    return String(serializarValor_(a.fecha, 'fecha') || '').localeCompare(String(serializarValor_(b.fecha, 'fecha') || ''));
  });

  var actividades = planes.map(actividadEvaluacionPublica_);
  var idsActividad = {};
  actividades.forEach(function(a) { idsActividad[a.id] = a; });

  var registros = filtrarPorProfesor_(EG.SHEETS.EVALUACION_SEGUIMIENTO, docente.id).filter(function(r) {
    return normalizarTexto_(r.ano || '').toUpperCase() === normalizarTexto_(ano).toUpperCase() &&
      normalizarTexto_(r.seccion || '').toUpperCase() === seccion &&
      normalizarTurno_(r.turno || '') === turno &&
      normalizarTexto_(r.lapso || '') === normalizarTexto_(rango.lapso);
  });

  var mapaRegistros = {};
  registros.forEach(function(r) {
    var key = String(r.idActividad || '') + '|' + String(r.idAlumno || '');
    mapaRegistros[key] = {
      id: String(r.id || ''),
      idActividad: String(r.idActividad || ''),
      idAlumno: String(r.idAlumno || ''),
      estadoEntrega: normalizarEstadoEntregaEvaluacion_(r.estadoEntrega),
      fechaEntrega: String(serializarValor_(r.fechaEntrega, 'fecha') || ''),
      nota: r.nota === '' || r.nota === null || r.nota === undefined ? '' : Number(r.nota),
      observacion: String(r.observacion || ''),
      actualizadoEn: String(r.actualizadoEn || '')
    };
  });

  var asistencia = filtrarPorProfesor_(EG.SHEETS.ASISTENCIA, docente.id).filter(function(r) {
    var fecha = String(serializarValor_(r.fecha, 'fecha') || '');
    return normalizarTexto_(r.ano || '').toUpperCase() === normalizarTexto_(ano).toUpperCase() &&
      normalizarTexto_(r.seccion || '').toUpperCase() === seccion &&
      normalizarTurno_(r.turno || '') === turno &&
      normalizarTexto_(r.materia || '') === normalizarTexto_(docente.materia || '') &&
      fecha >= rango.desde && fecha <= rango.hasta;
  });

  var asistenciaPorFechaAlumno = {};
  asistencia.forEach(function(r) {
    asistenciaPorFechaAlumno[String(serializarValor_(r.fecha, 'fecha') || '') + '|' + String(r.idAlumno || '')] =
      normalizarEstadoAsistencia_(r.estado);
  });

  var totalPuntos = actividades.reduce(function(s, a) { return s + Number(a.puntos || 0); }, 0);
  var resumenAlumnos = alumnos.map(function(a, idx) {
    var entregadas = 0, noEntregadas = 0, tardias = 0, justificadas = 0, pendientes = 0, puntos = 0;
    actividades.forEach(function(act) {
      var reg = mapaRegistros[act.id + '|' + a.id];
      var estado = reg ? reg.estadoEntrega : 'Pendiente';
      if (estado === 'Entrego') entregadas++;
      else if (estado === 'No entrego') noEntregadas++;
      else if (estado === 'Tardia') tardias++;
      else if (estado === 'Justificada') justificadas++;
      else pendientes++;
      if (reg && reg.nota !== '') puntos += Number(reg.nota || 0);
    });

    var asistenciasAlumno = asistencia.filter(function(r) { return String(r.idAlumno || '') === String(a.id); });
    var efectivas = asistenciasAlumno.filter(function(r) {
      var e = normalizarEstadoAsistencia_(r.estado);
      return e === 'Presente' || e === 'Tardanza';
    }).length;
    var pctAsistencia = asistenciasAlumno.length ? Math.round((efectivas / asistenciasAlumno.length) * 100) : 0;

    return {
      idAlumno: String(a.id || ''),
      numeroLista: idx + 1,
      alumno: String(a.nombre || ''),
      cedula: String(a.cedula || ''),
      representante: String(a.representante || ''),
      telefonoRepresentante: String(a.telefonoRepresentante || ''),
      entregadas: entregadas,
      noEntregadas: noEntregadas,
      tardias: tardias,
      justificadas: justificadas,
      pendientes: pendientes,
      puntosAcumulados: Math.round(puntos * 100) / 100,
      puntosPlanificados: Math.round(totalPuntos * 100) / 100,
      porcentajeAcademico: totalPuntos ? Math.round((puntos / totalPuntos) * 100) : 0,
      porcentajeAsistencia: pctAsistencia,
      alerta: noEntregadas >= 3 ? 'ROJA' : noEntregadas >= 2 ? 'AMARILLA' : 'VERDE'
    };
  });

  var alertas = resumenAlumnos.filter(function(a) { return a.noEntregadas >= 2; })
    .sort(function(a, b) { return b.noEntregadas - a.noEntregadas; });

  var matrizAsistencia = {};
  actividades.forEach(function(act) {
    matrizAsistencia[act.id] = {};
    alumnos.forEach(function(a) {
      matrizAsistencia[act.id][a.id] = asistenciaPorFechaAlumno[String(act.fecha || '') + '|' + String(a.id || '')] || '';
    });
  });

  return {
    status: 'success',
    lapso: rango.lapso,
    rango: rango,
    ano: ano,
    seccion: seccion,
    turno: turno,
    materia: String(docente.materia || ''),
    alumnos: alumnos.map(function(a, idx) {
      return {
        id: String(a.id || ''),
        numeroLista: idx + 1,
        nombre: String(a.nombre || ''),
        cedula: String(a.cedula || ''),
        representante: String(a.representante || ''),
        telefonoRepresentante: String(a.telefonoRepresentante || '')
      };
    }),
    actividades: actividades,
    registros: mapaRegistros,
    asistenciaPorActividad: matrizAsistencia,
    resumen: {
      totalActividades: actividades.length,
      totalEstudiantes: alumnos.length,
      puntosPlanificados: Math.round(totalPuntos * 100) / 100,
      alertas: alertas.length,
      estudiantes: resumenAlumnos
    },
    alertas: alertas
  };
}

function guardarRegistrosEvaluacion_(docente, payload) {
  asegurarGestionEvaluaciones_();

  var idActividad = limpiarRequerido_(payload.idActividad, 'actividad');
  var ano = limpiarRequerido_(payload.ano, 'año');
  var seccion = limpiarRequerido_(payload.seccion, 'sección').toUpperCase();
  var turno = normalizarTurno_(limpiarRequerido_(payload.turno, 'turno'));
  var rango = rangoLapsoEvaluacion_(payload.lapso || '1er Lapso');
  var registros = Array.isArray(payload.registros) ? payload.registros : [];
  if (!registros.length) lanzar_('No se recibieron registros de evaluación.', 'VALIDATION_ERROR');

  var plan = filtrarPorProfesor_(EG.SHEETS.PLANIFICACION, docente.id).filter(function(p) {
    return String(p.id || '') === idActividad;
  })[0];
  if (!plan) lanzar_('La actividad no pertenece a la planificación del docente.', 'NOT_FOUND');

  var actividad = actividadEvaluacionPublica_(plan);
  var alumnos = filtrarPorProfesor_(EG.SHEETS.ALUMNOS, docente.id).filter(function(a) {
    return normalizarTexto_(a.ano || '').toUpperCase() === normalizarTexto_(ano).toUpperCase() &&
      normalizarTexto_(a.seccion || '').toUpperCase() === seccion &&
      normalizarTurno_(a.turno || '') === turno;
  });
  var mapaAlumnos = {};
  alumnos.forEach(function(a) { mapaAlumnos[String(a.id)] = a; });

  var tabla = leerObjetos_(EG.SHEETS.EVALUACION_SEGUIMIENTO);
  var guardados = 0;
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    registros.forEach(function(reg) {
      var idAlumno = String(reg.idAlumno || '').trim();
      var alumno = mapaAlumnos[idAlumno];
      if (!alumno) lanzar_('Uno de los estudiantes no pertenece a esta sección.', 'UNAUTHORIZED');

      var estado = normalizarEstadoEntregaEvaluacion_(reg.estadoEntrega);
      var nota = reg.nota === '' || reg.nota === null || reg.nota === undefined ? '' : Number(reg.nota);
      if (nota !== '') {
        if (!isFinite(nota) || nota < 0 || nota > Number(actividad.puntos || 0)) {
          lanzar_('La nota de ' + String(alumno.nombre || 'un estudiante') +
            ' debe estar entre 0 y ' + Number(actividad.puntos || 0) + ' puntos.', 'VALIDATION_ERROR');
        }
      }

      var anterior = tabla.objetos.filter(function(r) {
        return String(r.idProfesor) === String(docente.id) &&
          String(r.idActividad || '') === idActividad &&
          String(r.idAlumno || '') === idAlumno &&
          normalizarTexto_(r.lapso || '') === normalizarTexto_(rango.lapso);
      })[0];

      var datos = {
        id: anterior && anterior.id ? anterior.id : Utilities.getUuid(),
        idProfesor: String(docente.id),
        materia: String(docente.materia || ''),
        ano: ano,
        seccion: seccion,
        turno: turno,
        lapso: rango.lapso,
        idActividad: idActividad,
        actividad: actividad.nombre,
        puntos: Number(actividad.puntos || 0),
        fechaPlanificada: actividad.fecha,
        idAlumno: idAlumno,
        alumno: String(alumno.nombre || ''),
        estadoEntrega: estado,
        fechaEntrega: String(reg.fechaEntrega || ''),
        nota: nota,
        observacion: String(reg.observacion || '').slice(0, 700),
        creadoEn: anterior ? String(anterior.creadoEn || ahora_()) : ahora_(),
        actualizadoEn: ahora_()
      };

      if (anterior) actualizarFilaObjeto_(EG.SHEETS.EVALUACION_SEGUIMIENTO, anterior.__row, datos);
      else anexarObjeto_(EG.SHEETS.EVALUACION_SEGUIMIENTO, datos);

      upsertCalificacionEvaluacion_(docente, actividad, alumno, {
        ano: ano, seccion: seccion, turno: turno, lapso: rango.lapso
      }, { nota: nota });

      guardados++;
    });

    return {
      status: 'success',
      guardados: guardados,
      actividad: actividad,
      message: 'Entregas y calificaciones guardadas correctamente.'
    };
  } finally {
    lock.releaseLock();
  }
}

function registrarSeguimientoAcademico_(docente, payload) {
  asegurarGestionEvaluaciones_();

  var idAlumno = limpiarRequerido_(payload.idAlumno, 'estudiante');
  var alumno = filtrarPorProfesor_(EG.SHEETS.ALUMNOS, docente.id).filter(function(a) {
    return String(a.id || '') === idAlumno;
  })[0];
  if (!alumno) lanzar_('El estudiante no pertenece al docente.', 'UNAUTHORIZED');

  var rango = rangoLapsoEvaluacion_(payload.lapso || '1er Lapso');
  var registro = {
    id: Utilities.getUuid(),
    idProfesor: String(docente.id),
    materia: String(docente.materia || ''),
    ano: String(payload.ano || alumno.ano || ''),
    seccion: String(payload.seccion || alumno.seccion || '').toUpperCase(),
    turno: normalizarTurno_(payload.turno || alumno.turno || ''),
    lapso: rango.lapso,
    idAlumno: idAlumno,
    alumno: String(alumno.nombre || ''),
    tipo: String(payload.tipo || 'SEGUIMIENTO').slice(0, 80),
    fecha: String(payload.fecha || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd')),
    motivo: String(payload.motivo || '').slice(0, 800),
    medio: String(payload.medio || '').slice(0, 80),
    representante: String(payload.representante || alumno.representante || '').slice(0, 180),
    compromiso: String(payload.compromiso || '').slice(0, 800),
    observacion: String(payload.observacion || '').slice(0, 1000),
    creadoEn: ahora_(),
    actualizadoEn: ahora_()
  };
  anexarObjeto_(EG.SHEETS.SEGUIMIENTO_ACADEMICO, registro);
  return { status: 'success', registro: limpiarMeta_(registro), message: 'Seguimiento académico registrado.' };
}

function obtenerSeguimientoAcademico_(docente, payload) {
  asegurarGestionEvaluaciones_();

  var ano = normalizarTexto_(payload.ano || '');
  var seccion = normalizarTexto_(payload.seccion || '').toUpperCase();
  var turno = normalizarTurno_(payload.turno || '');
  var idAlumno = String(payload.idAlumno || '');
  var rango = rangoLapsoEvaluacion_(payload.lapso || '1er Lapso');

  var items = filtrarPorProfesor_(EG.SHEETS.SEGUIMIENTO_ACADEMICO, docente.id).filter(function(r) {
    if (ano && normalizarTexto_(r.ano || '').toUpperCase() !== ano.toUpperCase()) return false;
    if (seccion && normalizarTexto_(r.seccion || '').toUpperCase() !== seccion) return false;
    if (turno && normalizarTurno_(r.turno || '') !== turno) return false;
    if (idAlumno && String(r.idAlumno || '') !== idAlumno) return false;
    if (normalizarTexto_(r.lapso || '') !== normalizarTexto_(rango.lapso)) return false;
    return true;
  }).sort(function(a, b) {
    return String(b.fecha || b.creadoEn || '').localeCompare(String(a.fecha || a.creadoEn || ''));
  }).slice(0, 300).map(limpiarMeta_);

  return { status: 'success', seguimiento: items, total: items.length };
}
/* EDUGESTION_GESTION_EVALUACIONES_V66_END */
