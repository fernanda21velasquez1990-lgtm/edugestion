const BOT_API_BASE = 'https://api.telegram.org';
const MAX_TELEGRAM_MESSAGE = 3900;

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
      { text: '👨‍🎓 Mis estudiantes', callback_data: 'students:soon' },
      { text: '📅 Planificación', callback_data: 'planning:soon' },
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
    ? 'ℹ️ <b>Ayuda de EduGestión</b>\n\n• /menu abre el menú principal.\n• /hoy muestra las clases del día.\n• /asistencia inicia el registro.\n• /consultar muestra el detalle de asistencia del día.\n• /estado muestra la cuenta vinculada.\n\nPara pasar o corregir asistencia, abre una clase y escribe:\n<code>A: 2,5; T: 3; J: 4</code>\n\nA = ausente · T = tardanza · J = justificada. Los demás quedan presentes.'
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

  if (/^\/estado(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showAccountStatus(chatId, message);
    return;
  }

  if (/^\/ayuda(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showHelp(chatId, message);
    return;
  }

  if (text && !text.startsWith('/')) {
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
  if (data === 'students:soon') {
    await showSoonMessage(chatId, 'Mis estudiantes', 'Fase 3.2');
    return;
  }
  if (data === 'planning:soon') {
    await showSoonMessage(chatId, 'Planificación', 'Fase 3.3');
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
        status: 'phase3.1-attendance-consult-ready',
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
