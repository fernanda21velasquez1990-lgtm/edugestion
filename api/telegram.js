const BOT_API_BASE = 'https://api.telegram.org';
const MAX_TELEGRAM_MESSAGE = 3900;
const pendingTextMode = new Map();

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function getRequiredEnv(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeCommand(text) {
  return String(text || '').trim();
}

function teacherTelegramId(source) {
  return String(source?.from?.id || '');
}

function teacherName(source) {
  const first = String(source?.from?.first_name || '').trim();
  const last = String(source?.from?.last_name || '').trim();
  return `${first} ${last}`.trim() || 'Docente';
}

async function telegramRequest(method, payload = {}) {
  const token = getRequiredEnv('TELEGRAM_BOT_TOKEN');
  const response = await fetch(`${BOT_API_BASE}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.description || `Telegram respondió con estado ${response.status}`);
  }
  return data;
}

async function sendMessage(chatId, text, options = {}) {
  return telegramRequest('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...options,
  });
}

async function answerCallbackQuery(callbackQueryId, text = '') {
  return telegramRequest('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: false,
  });
}

async function callEduGestion(action, payload = {}) {
  const apiUrl = getRequiredEnv('EDUGESTION_API_URL');
  const botSecret = getRequiredEnv('EDUGESTION_BOT_SECRET');
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action, botSecret, ...payload }),
    redirect: 'follow',
  });

  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    console.error('Respuesta no JSON de Apps Script:', raw.slice(0, 500));
    throw new Error('El servidor de EduGestión devolvió una respuesta inválida. Revisa la implementación de Apps Script.');
  }

  if (!response.ok || data.status !== 'success') {
    const error = new Error(data.message || `EduGestión respondió con estado ${response.status}`);
    error.code = data.code || 'EDUGESTION_ERROR';
    throw error;
  }
  return data;
}

function mainMenuKeyboard(linked = true) {
  const rows = [];
  if (linked) {
    rows.push([
      { text: '✅ Pasar asistencia', callback_data: 'attendance:start' },
      { text: '📋 Consultar asistencia', callback_data: 'attendance:consult' },
    ]);
    rows.push([
      { text: '👨‍🎓 Mis estudiantes', callback_data: 'students:menu' },
      { text: '📅 Planificación', callback_data: 'planning:menu' },
    ]);
    rows.push([
      { text: '📊 Estadísticas', callback_data: 'stats:soon' },
      { text: '📄 Generar informe', callback_data: 'reports:soon' },
    ]);
    rows.push([
      { text: '👤 Mi cuenta', callback_data: 'account:status' },
      { text: 'ℹ️ Ayuda', callback_data: 'help' },
    ]);
  } else {
    rows.push([{ text: '🔗 Vincular cuenta', callback_data: 'link:start' }]);
    rows.push([{ text: 'ℹ️ Ayuda', callback_data: 'help' }]);
  }
  return { inline_keyboard: rows };
}

function classesKeyboard(classes = []) {
  const rows = classes.map((item, index) => [{
    text: `${item.registrada ? '✅' : '🟡'} ${item.horaInicio || '--:--'} · ${item.ano} ${item.seccion}`,
    callback_data: `class:open:${index}`,
  }]);
  rows.push([{ text: '🏠 Menú principal', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function attendanceConsultKeyboard(classes = []) {
  const rows = classes.map((item, index) => [{
    text: `${item.registrada ? '✅' : '🟡'} ${item.horaInicio || '--:--'} · ${item.ano} ${item.seccion}`,
    callback_data: `consult:open:${index}`,
  }]);
  rows.push([{ text: '🏠 Menú principal', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function attendanceDetailKeyboard(index, registered = false) {
  const rows = [];
  if (registered) {
    rows.push([{ text: '✏️ Corregir asistencia', callback_data: `consult:edit:${index}` }]);
  } else {
    rows.push([{ text: '✅ Pasar asistencia', callback_data: `class:open:${index}` }]);
  }
  rows.push([{ text: '📋 Volver a consultar', callback_data: 'attendance:consult' }]);
  rows.push([{ text: '🏠 Menú principal', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function studentsMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📚 Ver lista', callback_data: 'students:list' }],
      [{ text: '🔎 Buscar por nombre o cédula', callback_data: 'students:search' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}

function studentsListKeyboard(students = []) {
  const rows = students.slice(0, 30).map((student, index) => [{
    text: `${index + 1}. ${student.nombre || 'Estudiante'} · ${student.ano || ''}${student.seccion ? ` ${student.seccion}` : ''}`.slice(0, 60),
    callback_data: `students:open:${index}`,
  }]);
  rows.push([{ text: '🔎 Buscar', callback_data: 'students:search' }]);
  rows.push([{ text: '🏠 Menú principal', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function studentDetailKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📚 Volver a estudiantes', callback_data: 'students:menu' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}

function planningMenuKeyboard(sections = []) {
  const rows = [
    [{ text: '📅 Próximas evaluaciones', callback_data: 'planning:list' }],
  ];

  if (Array.isArray(sections) && sections.length) {
    const sectionButtons = sections.slice(0, 6).map(section => ({
      text: `Sección ${section}`,
      callback_data: `planning:section:${section}`,
    }));
    for (let i = 0; i < sectionButtons.length; i += 2) {
      rows.push(sectionButtons.slice(i, i + 2));
    }
  }

  rows.push([{ text: '🏠 Menú principal', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function planningListKeyboard(items = []) {
  const rows = items.slice(0, 30).map((item, index) => [{
    text: `${item.fecha || 'Sin fecha'} · ${item.actividad || 'Evaluación'}`.slice(0, 60),
    callback_data: `planning:open:${index}`,
  }]);
  rows.push([{ text: '📅 Volver a planificación', callback_data: 'planning:menu' }]);
  rows.push([{ text: '🏠 Menú principal', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function planningDetailKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📅 Volver a planificación', callback_data: 'planning:menu' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}

function attendanceInputKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '✅ Todos presentes', callback_data: 'attendance:all' }],
      [{ text: '❌ Cancelar', callback_data: 'attendance:cancel' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}

function attendancePreviewKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '💾 Guardar asistencia', callback_data: 'attendance:save' }],
      [
        { text: '✏️ Corregir estados', callback_data: 'attendance:edit' },
        { text: '❌ Cancelar', callback_data: 'attendance:cancel' },
      ],
    ],
  };
}

async function linkedProfile(telegramId) {
  try {
    return await callEduGestion('botEstadoTelegram', { telegramId });
  } catch (error) {
    if (error.code === 'TELEGRAM_NOT_LINKED') return null;
    throw error;
  }
}

async function showMainMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);

  if (!profile) {
    await sendMessage(
      chatId,
      `🎓 <b>EduGestión Docente</b>\n\nHola, <b>${escapeHtml(teacherName(source))}</b>. El bot está conectado, pero este Telegram todavía no está vinculado con una cuenta docente.\n\nGenera un código temporal dentro de EduGestión y envíalo así:\n<code>/vincular 123456</code>`,
      { reply_markup: mainMenuKeyboard(false) },
    );
    return;
  }

  const profesor = profile.profesor || {};
  await sendMessage(
    chatId,
    `🎓 <b>EduGestión Docente</b>\n\nHola, <b>${escapeHtml(profesor.nombre || teacherName(source))}</b>.\nMateria: <b>${escapeHtml(profesor.materia || 'Sin materia asignada')}</b>\n\n¿Qué deseas hacer?`,
    { reply_markup: mainMenuKeyboard(true) },
  );
}

async function showLinkInstructions(chatId) {
  await sendMessage(
    chatId,
    '🔗 <b>Vincular cuenta</b>\n\n1. Inicia sesión en EduGestión desde el navegador.\n2. Genera el código temporal de Telegram.\n3. Envíalo aquí de esta forma:\n\n<code>/vincular 123456</code>\n\nEl código tiene seis dígitos y vence en 10 minutos.',
    { reply_markup: mainMenuKeyboard(false) },
  );
}

async function linkAccount(message, code) {
  const chatId = message.chat.id;
  const digits = String(code || '').replace(/\D/g, '');
  if (!/^\d{6}$/.test(digits)) {
    await sendMessage(chatId, '⚠️ El código debe tener exactamente seis dígitos. Ejemplo:\n<code>/vincular 123456</code>');
    return;
  }

  const result = await callEduGestion('botVincularTelegram', {
    codigo: digits,
    telegramId: teacherTelegramId(message),
    chatId: String(chatId),
    telegramUsuario: String(message.from?.username || ''),
    telegramNombre: teacherName(message),
  });

  await sendMessage(
    chatId,
    `✅ <b>Cuenta vinculada correctamente</b>\n\nDocente: <b>${escapeHtml(result.profesor?.nombre || 'Docente')}</b>\nMateria: <b>${escapeHtml(result.profesor?.materia || 'Sin materia asignada')}</b>\n\nYa puedes consultar tus clases y pasar asistencia desde Telegram.`,
    { reply_markup: mainMenuKeyboard(true) },
  );
}

function formatClassLine(item) {
  const state = item.registrada
    ? `✅ Registrada · P:${item.presentes || 0} · A:${item.ausentes || 0} · T:${item.tardanzas || 0} · J:${item.justificadas || 0}`
    : '🟡 Asistencia pendiente';
  return `<b>${escapeHtml(item.horaInicio || '--:--')}–${escapeHtml(item.horaFin || '--:--')}</b> · ${escapeHtml(item.ano)} – Sección ${escapeHtml(item.seccion)}\n${escapeHtml(item.turno || '')} · ${item.total} estudiantes\n${state}`;
}

async function showTodayClasses(chatId, source) {
  const telegramId = teacherTelegramId(source);
  try {
    const result = await callEduGestion('botClasesHoy', { telegramId });
    const classes = Array.isArray(result.clases) ? result.clases : [];
    if (!classes.length) {
      await sendMessage(
        chatId,
        `📅 <b>Clases de hoy</b>\n\nNo hay clases registradas en tu horario para ${escapeHtml(result.dia || 'hoy')}.`,
        { reply_markup: mainMenuKeyboard(true) },
      );
      return;
    }

    const body = classes.map((item, index) => `${index + 1}. ${formatClassLine(item)}`).join('\n\n');
    await sendMessage(
      chatId,
      `📅 <b>${escapeHtml(result.dia || 'Clases de hoy')}</b> · ${escapeHtml(result.fecha || '')}\n\n${body}\n\nSelecciona una clase:`,
      { reply_markup: classesKeyboard(classes) },
    );
  } catch (error) {
    if (error.code === 'TELEGRAM_NOT_LINKED') {
      await showLinkInstructions(chatId);
      return;
    }
    throw error;
  }
}

function splitStudentList(students) {
  const chunks = [];
  let current = '';
  students.forEach((student, index) => {
    const icon = escapeHtml(student.icono || '⚪');
    const state = escapeHtml(student.estado || 'Presente');
    const line = `${index + 1}. ${icon} ${escapeHtml(student.nombre || 'Estudiante')} · <i>${state}</i>\n`;
    if ((current + line).length > MAX_TELEGRAM_MESSAGE && current) {
      chunks.push(current.trim());
      current = line;
    } else {
      current += line;
    }
  });
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function openClass(chatId, source, index) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botAbrirClase', { telegramId, indice: Number(index) });
  const clase = result.clase || {};
  const students = Array.isArray(result.alumnos) ? result.alumnos : [];

  if (!students.length) {
    await sendMessage(
      chatId,
      `⚠️ <b>${escapeHtml(clase.ano || '')} – Sección ${escapeHtml(clase.seccion || '')}</b>\n\nEsta sección no tiene estudiantes registrados. Agrégalos primero desde EduGestión.`,
      { reply_markup: mainMenuKeyboard(true) },
    );
    return;
  }

  const correctionNotice = result.registrada
    ? '\n⚠️ Esta clase ya tiene asistencia. Al guardar, se actualizará el registro anterior.'
    : '';

  await sendMessage(
    chatId,
    `✅ <b>${result.registrada ? 'Consultar o corregir asistencia' : 'Pasar asistencia'}</b>\n\nCurso: <b>${escapeHtml(clase.ano || '')} – Sección ${escapeHtml(clase.seccion || '')}</b>\nHorario: <b>${escapeHtml(clase.horaInicio || '')}–${escapeHtml(clase.horaFin || '')}</b>\nFecha: <b>${escapeHtml(clase.fecha || '')}</b>\nTotal: <b>${students.length} estudiantes</b>${correctionNotice}\n\nLista numerada y estado actual:`,
  );

  for (const chunk of splitStudentList(students)) {
    await sendMessage(chatId, chunk);
  }

  await sendMessage(
    chatId,
    'Escribe los estados especiales usando este formato:\n\n<code>A: 2,5; T: 3; J: 4</code>\n\n<b>A</b> = ausente · <b>T</b> = tardanza · <b>J</b> = justificada.\nLos estudiantes no indicados quedarán como presentes.\n\nTambién puedes escribir <code>0</code> o pulsar <b>Todos presentes</b>.',
    { reply_markup: attendanceInputKeyboard() },
  );
}

async function previewAttendance(chatId, source, text) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botPrevisualizarAsistencia', { telegramId, texto: text });
  const absent = Array.isArray(result.ausentes) ? result.ausentes : [];
  const late = Array.isArray(result.tardanzas) ? result.tardanzas : [];
  const justified = Array.isArray(result.justificadas) ? result.justificadas : [];

  const formatPeople = (items) => items.length
    ? items.map((item) => `${item.numero}. ${escapeHtml(item.nombre)}`).join('\n')
    : 'Ninguno';

  const overwrite = result.sobrescribira
    ? '\n\n⚠️ <b>Esta clase ya tenía asistencia.</b> Al confirmar se reemplazará con este nuevo resumen.'
    : '';

  await sendMessage(
    chatId,
    `📋 <b>Resumen antes de guardar</b>\n\nCurso: <b>${escapeHtml(result.clase?.ano || '')} – Sección ${escapeHtml(result.clase?.seccion || '')}</b>\n🟢 Presentes: <b>${result.presentes || 0}</b>\n🔴 Ausentes: <b>${absent.length}</b>\n🟠 Tardanzas: <b>${late.length}</b>\n🟣 Justificadas: <b>${justified.length}</b>\nTotal: <b>${result.total || 0}</b>\n\n<b>Ausentes</b>\n${formatPeople(absent)}\n\n<b>Tardanzas</b>\n${formatPeople(late)}\n\n<b>Justificadas</b>\n${formatPeople(justified)}${overwrite}\n\nRevisa la información y confirma.`,
    { reply_markup: attendancePreviewKeyboard() },
  );
}

async function previewAllPresent(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botTodosPresentes', { telegramId });
  const overwrite = result.sobrescribira
    ? '\n\n⚠️ Esta clase ya tenía asistencia y será actualizada al confirmar.'
    : '';
  await sendMessage(
    chatId,
    `📋 <b>Resumen antes de guardar</b>\n\nCurso: <b>${escapeHtml(result.clase?.ano || '')} – Sección ${escapeHtml(result.clase?.seccion || '')}</b>\n🟢 Presentes: <b>${result.presentes || 0}</b>\n🔴 Ausentes: <b>0</b>\n🟠 Tardanzas: <b>0</b>\n🟣 Justificadas: <b>0</b>\nTotal: <b>${result.total || 0}</b>\n\nTodos los estudiantes fueron marcados como presentes.${overwrite}`,
    { reply_markup: attendancePreviewKeyboard() },
  );
}

async function saveAttendance(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botGuardarAsistencia', { telegramId });
  await sendMessage(
    chatId,
    `✅ <b>${result.modificada ? 'Asistencia actualizada' : 'Asistencia guardada'}</b>\n\nCurso: <b>${escapeHtml(result.clase?.ano || '')} – Sección ${escapeHtml(result.clase?.seccion || '')}</b>\n🟢 Presentes: <b>${result.presentes || 0}</b>\n🔴 Ausentes: <b>${result.ausentes || 0}</b>\n🟠 Tardanzas: <b>${result.tardanzas || 0}</b>\n🟣 Justificadas: <b>${result.justificadas || 0}</b>\nTotal: <b>${result.total || 0}</b>\n\nLos cambios ya están disponibles en EduGestión.`,
    { reply_markup: mainMenuKeyboard(true) },
  );
}

async function cancelAttendance(chatId, source) {
  const telegramId = teacherTelegramId(source);
  try {
    await callEduGestion('botCancelarAsistencia', { telegramId });
  } catch (error) {
    if (error.code !== 'TELEGRAM_NOT_LINKED') throw error;
  }
  await sendMessage(chatId, '❌ Registro de asistencia cancelado.', { reply_markup: mainMenuKeyboard(true) });
}

async function showAttendanceConsultation(chatId, source) {
  const telegramId = teacherTelegramId(source);
  try {
    const result = await callEduGestion('botClasesHoy', { telegramId });
    const classes = Array.isArray(result.clases) ? result.clases : [];

    if (!classes.length) {
      await sendMessage(
        chatId,
        `📋 <b>Consultar asistencia</b>

No hay clases registradas en tu horario para ${escapeHtml(result.dia || 'hoy')}.`,
        { reply_markup: mainMenuKeyboard(true) },
      );
      return;
    }

    const body = classes.map((item, index) => {
      const estado = item.registrada
        ? `✅ Registrada · P:${item.presentes || 0} · A:${item.ausentes || 0} · T:${item.tardanzas || 0} · J:${item.justificadas || 0}`
        : '🟡 Asistencia pendiente';
      return `${index + 1}. <b>${escapeHtml(item.horaInicio || '--:--')}–${escapeHtml(item.horaFin || '--:--')}</b>
${escapeHtml(item.ano || '')} · Sección ${escapeHtml(item.seccion || '')}
${estado}`;
    }).join('\n\n');

    await sendMessage(
      chatId,
      `📋 <b>Consulta de asistencia</b>
${escapeHtml(result.dia || '')} · ${escapeHtml(result.fecha || '')}

${body}

Selecciona una clase para ver el detalle:`,
      { reply_markup: attendanceConsultKeyboard(classes) },
    );
  } catch (error) {
    if (error.code === 'TELEGRAM_NOT_LINKED') {
      await showLinkInstructions(chatId);
      return;
    }
    throw error;
  }
}

async function showAttendanceDetail(chatId, source, index) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botAbrirClase', {
    telegramId,
    indice: Number(index),
  });

  const clase = result.clase || {};
  const students = Array.isArray(result.alumnos) ? result.alumnos : [];
  const resumen = result.resumenActual || {};

  if (!students.length) {
    await sendMessage(
      chatId,
      `⚠️ <b>Consulta de asistencia</b>

La sección ${escapeHtml(clase.ano || '')} ${escapeHtml(clase.seccion || '')} no tiene estudiantes registrados.`,
      { reply_markup: mainMenuKeyboard(true) },
    );
    return;
  }

  const estados = { Presente: [], Ausente: [], Tardanza: [], Justificada: [] };

  students.forEach(student => {
    const estado = String(student.estado || 'Presente');
    if (!estados[estado]) estados[estado] = [];
    estados[estado].push(student);
  });

  const lista = items => items.length
    ? items.map(item => `${item.numero}. ${escapeHtml(item.nombre || 'Estudiante')}`).join('\n')
    : 'Ninguno';

  const aviso = result.registrada
    ? 'Esta asistencia ya está registrada.'
    : 'Esta clase todavía no tiene asistencia registrada.';

  await sendMessage(
    chatId,
    `📋 <b>Detalle de asistencia</b>

Curso: <b>${escapeHtml(clase.ano || '')} · Sección ${escapeHtml(clase.seccion || '')}</b>
Fecha: <b>${escapeHtml(clase.fecha || '')}</b>
Horario: <b>${escapeHtml(clase.horaInicio || '')}–${escapeHtml(clase.horaFin || '')}</b>

🟢 Presentes: <b>${resumen.presentes || estados.Presente.length}</b>
${lista(estados.Presente)}

🔴 Ausentes: <b>${resumen.ausentes || estados.Ausente.length}</b>
${lista(estados.Ausente)}

🟠 Tardanzas: <b>${resumen.tardanzas || estados.Tardanza.length}</b>
${lista(estados.Tardanza)}

🟣 Justificadas: <b>${resumen.justificadas || estados.Justificada.length}</b>
${lista(estados.Justificada)}

${escapeHtml(aviso)}`,
    { reply_markup: attendanceDetailKeyboard(Number(index), Boolean(result.registrada)) },
  );
}


async function showStudentsMenu(chatId, source) {
  const profile = await linkedProfile(teacherTelegramId(source));
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  pendingTextMode.delete(String(chatId));
  await sendMessage(
    chatId,
    `👨‍🎓 <b>Mis estudiantes</b>

Consulta únicamente los estudiantes asociados a tu cuenta docente.

Selecciona una opción:`,
    { reply_markup: studentsMenuKeyboard() },
  );
}

async function showStudentsList(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botListarEstudiantes', { telegramId, limite: 30 });
  const students = Array.isArray(result.estudiantes) ? result.estudiantes : [];

  if (!students.length) {
    await sendMessage(
      chatId,
      '👨‍🎓 <b>Mis estudiantes</b>\n\nTodavía no tienes estudiantes registrados.',
      { reply_markup: studentsMenuKeyboard() },
    );
    return;
  }

  const body = students.map((student, index) =>
    `${index + 1}. <b>${escapeHtml(student.nombre || 'Estudiante')}</b>\n` +
    `Cédula: ${escapeHtml(student.cedula || 'No registrada')} · ` +
    `${escapeHtml(student.ano || '')} · Sección ${escapeHtml(student.seccion || '')}`
  ).join('\n\n');

  await sendMessage(
    chatId,
    `📚 <b>Lista de estudiantes</b>

Mostrando ${students.length} de ${Number(result.total || students.length)} estudiante(s).

${body}

Selecciona un estudiante para ver sus datos:`,
    { reply_markup: studentsListKeyboard(students) },
  );
}

async function requestStudentSearch(chatId) {
  pendingTextMode.set(String(chatId), 'student-search');
  await sendMessage(
    chatId,
    `🔎 <b>Buscar estudiante</b>

Escribe parte del nombre o la cédula.

Ejemplos:
<code>Marcos</code>
<code>12345678</code>

Escribe <code>cancelar</code> para salir.`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: '❌ Cancelar búsqueda', callback_data: 'students:menu' }]],
      },
    },
  );
}

async function searchStudents(chatId, source, text) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botBuscarEstudiantes', {
    telegramId,
    texto: String(text || '').trim(),
  });
  const students = Array.isArray(result.estudiantes) ? result.estudiantes : [];

  pendingTextMode.delete(String(chatId));

  if (!students.length) {
    await sendMessage(
      chatId,
      `🔎 <b>Resultado de búsqueda</b>

No encontré estudiantes con:
<code>${escapeHtml(text)}</code>`,
      { reply_markup: studentsMenuKeyboard() },
    );
    return;
  }

  const body = students.map((student, index) =>
    `${index + 1}. <b>${escapeHtml(student.nombre || 'Estudiante')}</b>\n` +
    `Cédula: ${escapeHtml(student.cedula || 'No registrada')} · ` +
    `${escapeHtml(student.ano || '')} · Sección ${escapeHtml(student.seccion || '')}`
  ).join('\n\n');

  await sendMessage(
    chatId,
    `🔎 <b>Resultados</b>

${body}

Selecciona un estudiante:`,
    { reply_markup: studentsListKeyboard(students) },
  );
}

async function showStudentDetail(chatId, source, index) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botDetalleEstudiante', {
    telegramId,
    indice: Number(index),
  });
  const student = result.estudiante || {};
  const attendance = student.asistencia || {};

  const representativePhone = student.telefonoRepresentante
    ? `<code>${escapeHtml(student.telefonoRepresentante)}</code>`
    : 'No registrado';

  const representativeEmail = student.emailRepresentante
    ? escapeHtml(student.emailRepresentante)
    : 'No registrado';

  await sendMessage(
    chatId,
    `👨‍🎓 <b>${escapeHtml(student.nombre || 'Estudiante')}</b>

<b>Datos académicos</b>
Cédula: ${escapeHtml(student.cedula || 'No registrada')}
Año: ${escapeHtml(student.ano || 'No registrado')}
Sección: ${escapeHtml(student.seccion || 'No registrada')}
Turno: ${escapeHtml(student.turno || 'No registrado')}
Repite: ${escapeHtml(student.repite || 'No')}
Materia pendiente: ${escapeHtml(student.materiaPendiente || 'Ninguna')}

<b>Representante</b>
Nombre: ${escapeHtml(student.representante || 'No registrado')}
Teléfono: ${representativePhone}
Correo: ${representativeEmail}

<b>Resumen de asistencia</b>
Registros: <b>${Number(attendance.total || 0)}</b>
🟢 Presentes: <b>${Number(attendance.presentes || 0)}</b>
🔴 Ausentes: <b>${Number(attendance.ausentes || 0)}</b>
🟠 Tardanzas: <b>${Number(attendance.tardanzas || 0)}</b>
🟣 Justificadas: <b>${Number(attendance.justificadas || 0)}</b>
Asistencia efectiva: <b>${Number(attendance.porcentajeAsistencia || 0).toFixed(2)}%</b>`,
    { reply_markup: studentDetailKeyboard() },
  );
}

function formatPlanningDate(value) {
  const parts = String(value || '').split('-');
  if (parts.length !== 3) return value || 'Sin fecha';
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function planningUrgencyLabel(days) {
  if (days === null || days === undefined || Number.isNaN(Number(days))) return '';
  const value = Number(days);
  if (value < 0) return 'Vencida';
  if (value === 0) return 'Hoy';
  if (value === 1) return 'Mañana';
  if (value <= 7) return `En ${value} días`;
  return `En ${value} días`;
}

async function showPlanningMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botListarPlanificacion', {
    telegramId,
    incluirPasadas: false,
  });
  const sections = Array.isArray(result.secciones) ? result.secciones : [];
  const total = Number(result.total || 0);

  await sendMessage(
    chatId,
    `📅 <b>Planificación académica</b>

Próximas evaluaciones: <b>${total}</b>

Consulta tus actividades, fechas, secciones y ponderaciones.`,
    { reply_markup: planningMenuKeyboard(sections) },
  );
}

async function showPlanningList(chatId, source, section = '') {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botListarPlanificacion', {
    telegramId,
    seccion: section,
    incluirPasadas: false,
  });
  const items = Array.isArray(result.planificaciones) ? result.planificaciones : [];

  if (!items.length) {
    const sectionText = section ? ` para la Sección ${escapeHtml(section)}` : '';
    await sendMessage(
      chatId,
      `📅 <b>Próximas evaluaciones</b>

No tienes evaluaciones próximas${sectionText}.`,
      { reply_markup: planningMenuKeyboard(result.secciones || []) },
    );
    return;
  }

  const body = items.map((item, index) => {
    const urgency = planningUrgencyLabel(item.diasRestantes);
    return `${index + 1}. <b>${escapeHtml(item.actividad || 'Evaluación')}</b>
Fecha: ${escapeHtml(formatPlanningDate(item.fecha))}
Curso: ${escapeHtml(item.ano || '')} · Sección ${escapeHtml(item.seccion || '')}
Ponderación: <b>${Number(item.puntos || 0)}%</b>${urgency ? `
⏳ ${escapeHtml(urgency)}` : ''}`;
  }).join('\n\n');

  await sendMessage(
    chatId,
    `📅 <b>Próximas evaluaciones${section ? ` · Sección ${escapeHtml(section)}` : ''}</b>

${body}

Selecciona una evaluación para ver el detalle:`,
    { reply_markup: planningListKeyboard(items) },
  );
}

async function showPlanningDetail(chatId, source, index) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botDetallePlanificacion', {
    telegramId,
    indice: Number(index),
  });
  const item = result.planificacion || {};
  const urgency = planningUrgencyLabel(item.diasRestantes);

  await sendMessage(
    chatId,
    `📅 <b>Detalle de evaluación</b>

Actividad: <b>${escapeHtml(item.actividad || 'Evaluación')}</b>
Fecha: <b>${escapeHtml(formatPlanningDate(item.fecha))}</b>
Año: ${escapeHtml(item.ano || 'No registrado')}
Sección: ${escapeHtml(item.seccion || 'No registrada')}
Ponderación: <b>${Number(item.puntos || 0)}%</b>
${urgency ? `Recordatorio: <b>${escapeHtml(urgency)}</b>` : ''}`,
    { reply_markup: planningDetailKeyboard() },
  );
}

async function showSoonMessage(chatId, title, phase) {
  await sendMessage(
    chatId,
    `🚧 <b>${escapeHtml(title)}</b>\n\nEsta opción se activará en la ${escapeHtml(phase)}.\n\nPor ahora puedes seguir usando asistencia, clases de hoy, mi cuenta y ayuda.`,
    { reply_markup: mainMenuKeyboard(true) },
  );
}

async function showAccountStatus(chatId, source) {
  const profile = await linkedProfile(teacherTelegramId(source));
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }
  const profesor = profile.profesor || {};
  await sendMessage(
    chatId,
    `👤 <b>Cuenta vinculada</b>\n\nDocente: <b>${escapeHtml(profesor.nombre || 'Docente')}</b>\nMateria: <b>${escapeHtml(profesor.materia || 'Sin materia asignada')}</b>\nUsuario de Telegram: <b>@${escapeHtml(source?.from?.username || 'sin_usuario')}</b>`,
    { reply_markup: mainMenuKeyboard(true) },
  );
}

async function showHelp(chatId, source) {
  const profile = await linkedProfile(teacherTelegramId(source));
  const linked = Boolean(profile);
  const text = linked
    ? 'ℹ️ <b>Ayuda de EduGestión</b>\n\n• /menu abre el menú principal.\n• /hoy muestra las clases del día.\n• /asistencia inicia el registro.\n• /consultar muestra el detalle de asistencia del día.\n• /estudiantes abre la consulta de estudiantes.\n• /planificacion muestra próximas evaluaciones.\n• /estado muestra la cuenta vinculada.\n\nPara pasar o corregir asistencia, abre una clase y escribe:\n<code>A: 2,5; T: 3; J: 4</code>\n\nA = ausente · T = tardanza · J = justificada. Los demás quedan presentes.'
    : 'ℹ️ <b>Ayuda de EduGestión</b>\n\nPrimero vincula tu Telegram con una cuenta docente. Genera un código temporal en EduGestión y envíalo así:\n<code>/vincular 123456</code>';
  await sendMessage(chatId, text, { reply_markup: mainMenuKeyboard(linked) });
}

async function handleMessage(message) {
  const chatId = message?.chat?.id;
  if (!chatId) return;

  const text = normalizeCommand(message.text);

  if (/^\/(start|menu)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showMainMenu(chatId, message);
    return;
  }

  const linkMatch = text.match(/^\/vincular(?:@\w+)?(?:\s+(.+))?$/i);
  if (linkMatch) {
    if (!linkMatch[1]) await showLinkInstructions(chatId);
    else await linkAccount(message, linkMatch[1]);
    return;
  }

  if (/^\/(hoy|asistencia)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showTodayClasses(chatId, message);
    return;
  }

  if (/^\/consultar(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showAttendanceConsultation(chatId, message);
    return;
  }

  if (/^\/estudiantes(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showStudentsMenu(chatId, message);
    return;
  }

  if (/^\/planificacion(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showPlanningMenu(chatId, message);
    return;
  }

  if (/^\/estado(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showAccountStatus(chatId, message);
    return;
  }

  if (/^\/ayuda(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showHelp(chatId, message);
    return;
  }

  if (text && !text.startsWith('/')) {
    const mode = pendingTextMode.get(String(chatId));
    if (mode === 'student-search') {
      if (String(text).trim().toLowerCase() === 'cancelar') {
        pendingTextMode.delete(String(chatId));
        await showStudentsMenu(chatId, message);
      } else {
        try {
          await searchStudents(chatId, message, text);
        } catch (error) {
          if (error.code === 'BAD_REQUEST') {
            await sendMessage(
              chatId,
              `⚠️ ${escapeHtml(error.message)}`,
              { reply_markup: studentsMenuKeyboard() },
            );
            return;
          }
          throw error;
        }
      }
      return;
    }

    try {
      await previewAttendance(chatId, message, text);
    } catch (error) {
      if (['FLOW_EXPIRED', 'BAD_REQUEST'].includes(error.code)) {
        await sendMessage(
          chatId,
          `⚠️ ${escapeHtml(error.message)}\n\nAbre nuevamente una clase desde <b>Clases de hoy</b>.`,
          { reply_markup: mainMenuKeyboard(true) },
        );
        return;
      }
      if (error.code === 'TELEGRAM_NOT_LINKED') {
        await showLinkInstructions(chatId);
        return;
      }
      throw error;
    }
    return;
  }

  await sendMessage(chatId, 'No reconocí ese mensaje. Escribe /menu para abrir EduGestión.');
}

async function handleCallbackQuery(callbackQuery) {
  const callbackId = callbackQuery?.id;
  const chatId = callbackQuery?.message?.chat?.id;
  const data = String(callbackQuery?.data || '');
  if (!callbackId || !chatId) return;

  await answerCallbackQuery(callbackId);

  if (data === 'menu') {
    await showMainMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'help') {
    await showHelp(chatId, callbackQuery);
    return;
  }
  if (data === 'link:start') {
    await showLinkInstructions(chatId);
    return;
  }
  if (data === 'account:status') {
    await showAccountStatus(chatId, callbackQuery);
    return;
  }
  if (data === 'attendance:start' || data === 'classes:today') {
    await showTodayClasses(chatId, callbackQuery);
    return;
  }
  if (data === 'attendance:consult') {
    await showAttendanceConsultation(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('consult:open:')) {
    const index = Number(data.split(':')[2]);
    await showAttendanceDetail(chatId, callbackQuery, index);
    return;
  }
  if (data.startsWith('consult:edit:')) {
    const index = Number(data.split(':')[2]);
    await openClass(chatId, callbackQuery, index);
    return;
  }
  if (data === 'students:menu') {
    await showStudentsMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'students:list') {
    await showStudentsList(chatId, callbackQuery);
    return;
  }
  if (data === 'students:search') {
    await requestStudentSearch(chatId);
    return;
  }
  if (data.startsWith('students:open:')) {
    const index = Number(data.split(':')[2]);
    await showStudentDetail(chatId, callbackQuery, index);
    return;
  }
  if (data === 'planning:menu') {
    await showPlanningMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'planning:list') {
    await showPlanningList(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('planning:section:')) {
    const section = data.split(':').slice(2).join(':');
    await showPlanningList(chatId, callbackQuery, section);
    return;
  }
  if (data.startsWith('planning:open:')) {
    const index = Number(data.split(':')[2]);
    await showPlanningDetail(chatId, callbackQuery, index);
    return;
  }
  if (data === 'stats:soon') {
    await showSoonMessage(chatId, 'Estadísticas', 'Fase 3.4');
    return;
  }
  if (data === 'reports:soon') {
    await showSoonMessage(chatId, 'Generar informe', 'Fase 3.4');
    return;
  }
  if (data.startsWith('class:open:')) {
    const index = Number(data.split(':')[2]);
    await openClass(chatId, callbackQuery, index);
    return;
  }
  if (data === 'attendance:all') {
    await previewAllPresent(chatId, callbackQuery);
    return;
  }
  if (data === 'attendance:save') {
    await saveAttendance(chatId, callbackQuery);
    return;
  }
  if (data === 'attendance:edit') {
    await sendMessage(
      chatId,
      '✏️ Escribe nuevamente todos los estados especiales. Ejemplo:\n<code>A: 2,5; T: 3; J: 4</code>\n\nLos estudiantes no indicados quedarán presentes. Para todos presentes escribe <code>0</code>.',
      { reply_markup: attendanceInputKeyboard() },
    );
    return;
  }
  if (data === 'attendance:cancel') {
    await cancelAttendance(chatId, callbackQuery);
    return;
  }

  await showMainMenu(chatId, callbackQuery);
}

async function reportUserError(update, error) {
  const source = update?.message || update?.callback_query;
  const chatId = update?.message?.chat?.id || update?.callback_query?.message?.chat?.id;
  if (!chatId) return;

  console.error('Error procesando actualización:', error);
  const knownMessage = error?.message || 'Ocurrió un error inesperado.';
  const linked = error?.code !== 'TELEGRAM_NOT_LINKED';
  await sendMessage(
    chatId,
    `⚠️ <b>No se pudo completar la operación</b>\n\n${escapeHtml(knownMessage)}`,
    { reply_markup: mainMenuKeyboard(linked) },
  ).catch((sendError) => console.error('No se pudo informar el error al usuario:', sendError));
}

export default {
  async fetch(request) {
    if (request.method === 'GET') {
      return jsonResponse({
        ok: true,
        service: 'EduGestion Telegram webhook',
        status: 'phase3.3-planning-ready',
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Método no permitido' }, 405);
    }

    let update = null;
    try {
      const expectedSecret = getRequiredEnv('TELEGRAM_WEBHOOK_SECRET');
      const receivedSecret = request.headers.get('x-telegram-bot-api-secret-token') || '';
      if (receivedSecret !== expectedSecret) {
        return jsonResponse({ ok: false, error: 'Webhook no autorizado' }, 401);
      }

      update = await request.json();
      try {
        if (update.message) {
          await handleMessage(update.message);
        } else if (update.callback_query) {
          await handleCallbackQuery(update.callback_query);
        }
      } catch (error) {
        await reportUserError(update, error);
      }

      return jsonResponse({ ok: true });
    } catch (error) {
      console.error('Error crítico en webhook de Telegram:', error);
      return jsonResponse({ ok: false, error: 'Error interno del webhook' }, 500);
    }
  },
};
