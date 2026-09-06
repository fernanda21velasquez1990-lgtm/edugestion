/* EDUGESTION_TELEGRAM_NOTAS_CONTROL_ESTUDIO_FASE1_V1 */
const BOT_API_BASE = 'https://api.telegram.org';
const MAX_TELEGRAM_MESSAGE = 3900;
const pendingTextMode = new Map();

const closureState = new Map();

function closureLapsoKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '1️⃣ 1er Lapso', callback_data: 'closure:lapso:L1' },
        { text: '2️⃣ 2do Lapso', callback_data: 'closure:lapso:L2' },
      ],
      [{ text: '3️⃣ 3er Lapso', callback_data: 'closure:lapso:L3' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

function closureCoursesKeyboard(courses = [], lapsoCode = 'L1') {
  const rows = courses.slice(0, 30).map((course, index) => [{
    text: `${course.ano || ''} · Sección ${course.seccion || ''}${course.turno ? ` · ${course.turno}` : ''}`.slice(0, 60),
    callback_data: `closure:course:${lapsoCode}:${index}`,
  }]);
  rows.push([{ text: '🔄 Cambiar lapso', callback_data: 'closure:menu' }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function closurePreviewKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '✅ Registrar cierre', callback_data: 'closure:register' }],
      [{ text: '🔄 Elegir otro curso', callback_data: 'closure:changeCourse' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

function closureDoneKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📦 Hacer otro cierre', callback_data: 'closure:menu' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

const gradesState = new Map();

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


function pdfEscape(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7EáéíóúÁÉÍÓÚñÑüÜ¿?¡!]/g, '');
}

function wrapPdfText(text, maxChars = 92) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  words.forEach(word => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function buildSimplePdf(report) {
  const lines = [];
  const add = (text = '', size = 10, bold = false) => lines.push({ text: String(text), size, bold });

  const periodoLabel = {
    dia: 'Diario',
    semana: 'Semanal',
    mes: 'Mensual',
  }[report.periodo] || 'Mensual';

  const range = report.rango || {};
  const summary = report.resumen || {};
  const ranking = Array.isArray(report.ranking) ? report.ranking : [];

  add(report.institucion || 'EduGestion', 16, true);
  add('Informe de asistencia', 14, true);
  add(`Docente: ${report.profesor?.nombre || 'Docente'}`, 10);
  add(`Materia: ${report.profesor?.materia || 'No registrada'}`, 10);
  add(`Periodo: ${periodoLabel}`, 10);
  add(`Rango: ${range.inicio || ''} al ${range.fin || ''}`, 10);
  add(`Seccion: ${report.seccion || 'Todas las secciones'}`, 10);
  add('', 8);

  add('Resumen general', 12, true);
  add(`Registros: ${Number(summary.total || 0)}`, 10);
  add(`Estudiantes: ${Number(summary.estudiantes || 0)}`, 10);
  add(`Secciones: ${Number(summary.secciones || 0)}`, 10);
  add(`Presentes: ${Number(summary.presentes || 0)}`, 10);
  add(`Ausentes: ${Number(summary.ausentes || 0)}`, 10);
  add(`Tardanzas: ${Number(summary.tardanzas || 0)}`, 10);
  add(`Justificadas: ${Number(summary.justificadas || 0)}`, 10);
  add(`Asistencia efectiva: ${Number(summary.porcentajeAsistencia || 0).toFixed(2)}%`, 10);
  add('', 8);

  add('Estudiantes con mas ausencias', 12, true);
  if (!ranking.length) {
    add('No hay ausencias o tardanzas registradas en el periodo.', 10);
  } else {
    ranking.slice(0, 10).forEach((item, index) => {
      add(
        `${index + 1}. ${item.alumno || 'Estudiante'} - ${item.ano || ''} ${item.seccion || ''} - Ausencias: ${Number(item.ausentes || 0)} - Tardanzas: ${Number(item.tardanzas || 0)}`,
        9,
      );
    });
  }
  add('', 8);
  add(`Generado: ${new Date().toLocaleString('es-ES')}`, 8);
  add('Documento generado por EduGestion desde Telegram.', 8);

  const expanded = [];
  lines.forEach(line => {
    if (!line.text) {
      expanded.push(line);
      return;
    }
    wrapPdfText(line.text, line.size >= 12 ? 70 : 92).forEach(text => {
      expanded.push({ ...line, text });
    });
  });

  const pageHeight = 792;
  const marginTop = 52;
  const marginBottom = 45;
  const usable = pageHeight - marginTop - marginBottom;
  const pages = [];
  let page = [];
  let used = 0;

  expanded.forEach(line => {
    const height = line.text ? Math.max(13, line.size + 5) : 8;
    if (used + height > usable && page.length) {
      pages.push(page);
      page = [];
      used = 0;
    }
    page.push(line);
    used += height;
  });
  if (page.length) pages.push(page);

  const objects = [];
  const addObject = body => {
    objects.push(body);
    return objects.length;
  };

  const catalogId = addObject('');
  const pagesId = addObject('');
  const fontRegularId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fontBoldId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  const pageIds = [];
  pages.forEach(pageLines => {
    let y = pageHeight - marginTop;
    const commands = ['BT'];
    pageLines.forEach(line => {
      if (!line.text) {
        y -= 8;
        return;
      }
      const font = line.bold ? 'F2' : 'F1';
      commands.push(`/${font} ${line.size} Tf`);
      commands.push(`1 0 0 1 48 ${y} Tm`);
      commands.push(`(${pdfEscape(line.text)}) Tj`);
      y -= Math.max(13, line.size + 5);
    });
    commands.push('ET');

    const stream = commands.join('\n');
    const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'latin1');
}

async function sendPdfDocument(chatId, buffer, filename, caption) {
  const token = getRequiredEnv('TELEGRAM_BOT_TOKEN');
  const form = new FormData();
  form.append('chat_id', String(chatId));
  form.append('document', new Blob([buffer], { type: 'application/pdf' }), filename);
  form.append('caption', String(caption || '').slice(0, 900));

  const response = await fetch(`${BOT_API_BASE}/bot${token}/sendDocument`, {
    method: 'POST',
    body: form,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    const error = new Error(data.description || `Telegram respondió con estado ${response.status}`);
    error.code = 'TELEGRAM_SEND_FAILED';
    throw error;
  }
  return data.result || {};
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


const quickMenuInstalledChats = new Set();

function quickMenuKeyboard() {
  return {
    keyboard: [[{ text: '☰ TODAS LAS OPCIONES' }]],
    resize_keyboard: true,
    is_persistent: true,
    one_time_keyboard: false,
    input_field_placeholder: 'Toca ☰ TODAS LAS OPCIONES para abrir el menú',
  };
}

async function ensureQuickMenuButton(chatId) {
  const key = String(chatId);
  if (quickMenuInstalledChats.has(key)) return;
  try {
    await sendMessage(
      chatId,
      '☰ <b>Acceso rápido activado</b>\n\nDesde ahora puedes tocar <b>TODAS LAS OPCIONES</b> junto al cuadro de mensaje para abrir el menú completo sin escribir “menu”.',
      { reply_markup: quickMenuKeyboard() },
    );
    quickMenuInstalledChats.add(key);
  } catch (error) {
    console.error('No se pudo instalar el botón de menú rápido:', error);
  }
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
      { text: '📊 Estadísticas', callback_data: 'stats:menu' },
      { text: '📄 Generar informe', callback_data: 'reports:menu' },
    ]);
    rows.push([
      { text: '📝 Actas', callback_data: 'records:menu' },
      { text: '👤 Mi cuenta', callback_data: 'account:status' },
    ]);
    rows.push([
      { text: '🩺 Diagnóstico', callback_data: 'system:diagnostic' },
      { text: '🔐 Seguridad', callback_data: 'system:security' },
    ]);
    rows.push([
      { text: '🕒 Mi asistencia laboral', callback_data: 'teacherTime:menu' },
    ]);
    rows.push([
      { text: '📝 Notas y Control de Estudio', callback_data: 'grades:menu' },
    ]);
    rows.push([
      { text: '📘 Ficha académica', callback_data: 'academic:menu' },
      { text: '📄 Boletines', callback_data: 'bulletin:menu' },
    ]);
    rows.push([
      { text: '📦 Cierre de lapso', callback_data: 'closure:menu' },
    ]);
    rows.push([
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

function studentDetailKeyboard(index = 0) {
  return {
    inline_keyboard: [
      [{ text: '📘 Ver ficha académica', callback_data: `academic:student:${Number(index)}` }],
      [{ text: '📚 Volver a estudiantes', callback_data: 'students:menu' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}

function academicStudentsKeyboard(students = []) {
  const rows = students.slice(0, 30).map((student, index) => [{
    text: `${index + 1}. ${student.nombre || 'Estudiante'} · ${student.ano || ''}${student.seccion ? ` ${student.seccion}` : ''}`.slice(0, 60),
    callback_data: `academic:student:${index}`,
  }]);
  rows.push([{ text: '🏠 Menú principal', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function academicLapsoKeyboard(index) {
  return {
    inline_keyboard: [
      [
        { text: '1️⃣ 1er Lapso', callback_data: `academic:lapso:${Number(index)}:L1` },
        { text: '2️⃣ 2do Lapso', callback_data: `academic:lapso:${Number(index)}:L2` },
      ],
      [{ text: '3️⃣ 3er Lapso', callback_data: `academic:lapso:${Number(index)}:L3` }],
      [{ text: '👨‍🎓 Elegir otro estudiante', callback_data: 'academic:menu' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}

function academicDetailKeyboard(index, lapsoCode) {
  return {
    inline_keyboard: [
      [{ text: '🔄 Ver otro lapso', callback_data: `academic:student:${Number(index)}` }],
      [{ text: '👨‍🎓 Elegir otro estudiante', callback_data: 'academic:menu' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}

function bulletinStudentsKeyboard(students = []) {
  const rows = students.slice(0, 30).map((student, index) => [{
    text: `${index + 1}. ${student.nombre || 'Estudiante'} · ${student.ano || ''}${student.seccion ? ` ${student.seccion}` : ''}`.slice(0, 60),
    callback_data: `bulletin:student:${index}`,
  }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function bulletinLapsoKeyboard(index) {
  return {
    inline_keyboard: [
      [
        { text: '1️⃣ 1er Lapso', callback_data: `bulletin:lapso:${Number(index)}:L1` },
        { text: '2️⃣ 2do Lapso', callback_data: `bulletin:lapso:${Number(index)}:L2` },
      ],
      [{ text: '3️⃣ 3er Lapso', callback_data: `bulletin:lapso:${Number(index)}:L3` }],
      [{ text: '👨‍🎓 Elegir otro estudiante', callback_data: 'bulletin:menu' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

function bulletinDetailKeyboard(index) {
  return {
    inline_keyboard: [
      [{ text: '🔄 Ver otro lapso', callback_data: `bulletin:student:${Number(index)}` }],
      [{ text: '👨‍🎓 Elegir otro estudiante', callback_data: 'bulletin:menu' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
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

function statsMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '📅 Hoy', callback_data: 'stats:day' },
        { text: '🗓 Semana', callback_data: 'stats:week' },
      ],
      [{ text: '📆 Mes', callback_data: 'stats:month' }],
      [{ text: '⚠️ Más ausencias', callback_data: 'stats:ranking' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}

function statsResultKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📊 Volver a estadísticas', callback_data: 'stats:menu' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}

function reportsMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📅 Informe diario', callback_data: 'reports:day' }],
      [{ text: '🗓 Informe semanal', callback_data: 'reports:week' }],
      [{ text: '📆 Informe mensual', callback_data: 'reports:month' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}

function reportsResultKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📄 Generar otro informe', callback_data: 'reports:menu' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}

function recordsMenuKeyboard(types = []) {
  const rows = [
    [{ text: '➕ Crear nueva acta', callback_data: 'records:create' }],
    [{ text: '📚 Ver actas recientes', callback_data: 'records:list' }],
  ];

  if (Array.isArray(types) && types.length) {
    const buttons = types.slice(0, 6).map((type, index) => ({
      text: `🏷 ${type}`.slice(0, 50),
      callback_data: `records:type:${index}`,
    }));
    for (let i = 0; i < buttons.length; i += 2) {
      rows.push(buttons.slice(i, i + 2));
    }
  }

  rows.push([{ text: '🏠 Menú principal', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function recordsListKeyboard(items = []) {
  const rows = items.slice(0, 30).map((item, index) => [{
    text: `${item.fecha || 'Sin fecha'} · ${item.alumno || 'Estudiante'} · ${item.titulo || 'Acta'}`.slice(0, 60),
    callback_data: `records:open:${index}`,
  }]);

  rows.push([{ text: '📝 Volver a actas', callback_data: 'records:menu' }]);
  rows.push([{ text: '🏠 Menú principal', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function recordDetailKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📝 Volver a actas', callback_data: 'records:menu' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}

function recordStudentsKeyboard(students = []) {
  const rows = students.slice(0, 30).map((student, index) => [{
    text: `${index + 1}. ${student.nombre || 'Estudiante'} · ${student.ano || ''} ${student.seccion || ''}`.slice(0, 60),
    callback_data: `records:create:student:${index}`,
  }]);
  rows.push([{ text: '❌ Cancelar', callback_data: 'records:create:cancel' }]);
  return { inline_keyboard: rows };
}

function recordTypesKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '📌 General', callback_data: 'records:create:type:general' },
        { text: '⚠️ Incidencia', callback_data: 'records:create:type:incidencia' },
      ],
      [
        { text: '🎓 Académica', callback_data: 'records:create:type:academica' },
        { text: '🤝 Compromiso', callback_data: 'records:create:type:compromiso' },
      ],
      [{ text: '❌ Cancelar', callback_data: 'records:create:cancel' }],
    ],
  };
}

function recordConfirmKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '✅ Guardar acta', callback_data: 'records:create:save' }],
      [{ text: '📧 Guardar y enviar correo', callback_data: 'records:create:save-email' }],
      [{ text: '❌ Cancelar', callback_data: 'records:create:cancel' }],
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



/* =========================================================
   NOTAS Y CONTROL DE ESTUDIO · TELEGRAM FASE 1
   ========================================================= */

function gradesLapsoCode(lapso) {
  const t = String(lapso || '').toLowerCase();
  if (t.startsWith('2') || t.includes('seg')) return 'L2';
  if (t.startsWith('3') || t.includes('ter')) return 'L3';
  return 'L1';
}

function gradesLapsoFromCode(code) {
  if (code === 'L2') return '2do Lapso';
  if (code === 'L3') return '3er Lapso';
  return '1er Lapso';
}

function gradesMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '1️⃣ 1er Lapso', callback_data: 'grades:lapso:L1' },
        { text: '2️⃣ 2do Lapso', callback_data: 'grades:lapso:L2' },
      ],
      [{ text: '3️⃣ 3er Lapso', callback_data: 'grades:lapso:L3' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}

function gradesCoursesKeyboard(courses = [], lapso = '1er Lapso') {
  const code = gradesLapsoCode(lapso);
  const rows = courses.slice(0, 30).map((course, index) => [{
    text: `${course.ano || 'Curso'} · Sección ${course.seccion || ''}${course.turno ? ` · ${course.turno}` : ''}`.slice(0, 60),
    callback_data: `grades:course:${code}:${index}`,
  }]);
  rows.push([{ text: '↩️ Cambiar lapso', callback_data: 'grades:menu' }]);
  rows.push([{ text: '🏠 Menú principal', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function gradesCourseMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📚 Ver actividades', callback_data: 'grades:activities' }],
      [{ text: '➕ Crear actividad', callback_data: 'grades:create' }],
      [{ text: '📊 Resumen de la sección', callback_data: 'grades:summary' }],
      [{ text: '↩️ Cambiar curso', callback_data: 'grades:changeCourse' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}

function gradesActivitiesKeyboard(items = []) {
  const rows = items.slice(0, 30).map((item, index) => [{
    text: `${item.fecha || 'Sin fecha'} · ${item.nombre || 'Actividad'} · ${Number(item.ponderacion || 0)}%`.slice(0, 60),
    callback_data: `grades:activity:${index}`,
  }]);
  rows.push([{ text: '➕ Crear actividad', callback_data: 'grades:create' }]);
  rows.push([{ text: '📊 Resumen de la sección', callback_data: 'grades:summary' }]);
  rows.push([{ text: '↩️ Volver', callback_data: 'grades:courseMenu' }]);
  return { inline_keyboard: rows };
}

function gradesActivityKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '✏️ Registrar / modificar notas', callback_data: 'grades:enter' }],
      [{ text: '📚 Volver a actividades', callback_data: 'grades:activities' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}

function gradesBackKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📚 Actividades', callback_data: 'grades:activities' }],
      [{ text: '📊 Resumen de la sección', callback_data: 'grades:summary' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}


async function showClosureMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  const result = await callEduGestion('botNotasContexto', { telegramId });
  const courses = Array.isArray(result.cursos) ? result.cursos : [];
  closureState.set(String(chatId), {
    courses,
    lapso: '',
    lapsoCode: '',
    course: null,
    preview: null,
  });

  await sendMessage(
    chatId,
    `📦 <b>CIERRE DE LAPSO</b>

Docente: <b>${escapeHtml(result.profesor?.nombre || 'Docente')}</b>
Materia: <b>${escapeHtml(result.profesor?.materia || 'Sin materia asignada')}</b>

Desde aquí puedes revisar el resumen final de una sección y registrar el cierre del lapso en EduGestión.

Selecciona el lapso:`,
    { reply_markup: closureLapsoKeyboard() },
  );
}

async function chooseClosureLapso(chatId, source, lapsoCode) {
  const telegramId = teacherTelegramId(source);
  let state = closureState.get(String(chatId));

  if (!state || !Array.isArray(state.courses)) {
    const result = await callEduGestion('botNotasContexto', { telegramId });
    state = {
      courses: Array.isArray(result.cursos) ? result.cursos : [],
      lapso: '',
      lapsoCode: '',
      course: null,
      preview: null,
    };
  }

  const lapso = gradesLapsoFromCode(lapsoCode);
  state.lapso = lapso;
  state.lapsoCode = lapsoCode;
  state.course = null;
  state.preview = null;
  closureState.set(String(chatId), state);

  if (!state.courses.length) {
    await sendMessage(
      chatId,
      `⚠️ No encontré cursos con estudiantes registrados para <b>${escapeHtml(lapso)}</b>.`,
      { reply_markup: closureLapsoKeyboard() },
    );
    return;
  }

  await sendMessage(
    chatId,
    `📦 <b>${escapeHtml(lapso)}</b>

Selecciona el curso o sección que deseas cerrar:`,
    { reply_markup: closureCoursesKeyboard(state.courses, lapsoCode) },
  );
}

async function previewClosure(chatId, source, lapsoCode, index) {
  const state = closureState.get(String(chatId));
  if (!state || !Array.isArray(state.courses)) {
    await showClosureMenu(chatId, source);
    return;
  }

  const course = state.courses[Number(index)];
  if (!course) {
    await sendMessage(chatId, '⚠️ La lista de cursos venció. Abre nuevamente Cierre de lapso.', {
      reply_markup: closureLapsoKeyboard(),
    });
    return;
  }

  const telegramId = teacherTelegramId(source);
  const lapso = gradesLapsoFromCode(lapsoCode);
  const result = await callEduGestion('botCierreLapsoPreview', {
    telegramId,
    lapso,
    ano: course.ano,
    seccion: course.seccion,
    turno: course.turno || '',
  });

  state.lapso = result.lapso || lapso;
  state.lapsoCode = lapsoCode;
  state.course = course;
  state.preview = result;
  closureState.set(String(chatId), state);

  const avg = result.promedioSeccion === null || result.promedioSeccion === undefined
    ? 'Sin promedio'
    : `${Number(result.promedioSeccion).toFixed(2)}/20`;

  const attendance = result.asistencia || {};
  const students = Array.isArray(result.estudiantes) ? result.estudiantes : [];

  const detail = students.length
    ? students.map((student, i) => {
        const grade = student.notaFinal === null || student.notaFinal === undefined
          ? 'Sin nota'
          : `${Number(student.notaFinal).toFixed(2)}/20`;
        return `${i + 1}. ${escapeHtml(student.alumno || 'Estudiante')} · <b>${grade}</b>`;
      }).join('\n')
    : 'Sin estudiantes registrados.';

  await sendMessage(
    chatId,
    `📦 <b>VISTA PREVIA DEL CIERRE</b>
━━━━━━━━━━━━━━━━━━

Lapso: <b>${escapeHtml(result.lapso || lapso)}</b>
Curso: <b>${escapeHtml(result.ano || course.ano || '')} · Sección ${escapeHtml(result.seccion || course.seccion || '')}</b>
Turno: <b>${escapeHtml(result.turno || course.turno || 'No registrado')}</b>

👨‍🎓 <b>RESUMEN ACADÉMICO</b>
Estudiantes: <b>${Number(result.totalEstudiantes || 0)}</b>
Actividades: <b>${Number(result.totalActividades || 0)}</b>
Con nota final: <b>${Number(result.estudiantesConNota || 0)}</b>
Aprobados: <b>${Number(result.aprobados || 0)}</b>
Reprobados: <b>${Number(result.reprobados || 0)}</b>
Promedio de la sección: <b>${avg}</b>

📋 <b>ASISTENCIA ACUMULADA</b>
Presentes: <b>${Number(attendance.presentes || 0)}</b>
Ausentes: <b>${Number(attendance.ausentes || 0)}</b>
Tardanzas: <b>${Number(attendance.tardanzas || 0)}</b>
Justificadas: <b>${Number(attendance.justificadas || 0)}</b>

📝 <b>NOTAS FINALES</b>
${detail}

━━━━━━━━━━━━━━━━━━
Revisa la información antes de registrar el cierre.`,
    { reply_markup: closurePreviewKeyboard() },
  );
}

async function registerClosure(chatId, source) {
  const state = closureState.get(String(chatId));
  if (!state?.course || !state?.lapso) {
    await showClosureMenu(chatId, source);
    return;
  }

  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botRegistrarCierreLapso', {
    telegramId,
    lapso: state.lapso,
    ano: state.course.ano,
    seccion: state.course.seccion,
    turno: state.course.turno || '',
    accion: 'Cierre generado desde Telegram',
    medio: 'Telegram',
  });

  const summary = result.resumen || state.preview || {};
  const avg = summary.promedioSeccion === null || summary.promedioSeccion === undefined
    ? 'Sin promedio'
    : `${Number(summary.promedioSeccion).toFixed(2)}/20`;

  await sendMessage(
    chatId,
    `✅ <b>CIERRE REGISTRADO</b>

Lapso: <b>${escapeHtml(summary.lapso || state.lapso)}</b>
Curso: <b>${escapeHtml(summary.ano || state.course.ano || '')} · Sección ${escapeHtml(summary.seccion || state.course.seccion || '')}</b>
Estudiantes: <b>${Number(summary.totalEstudiantes || 0)}</b>
Promedio de la sección: <b>${avg}</b>
Aprobados: <b>${Number(summary.aprobados || 0)}</b>
Reprobados: <b>${Number(summary.reprobados || 0)}</b>

📚 El cierre quedó registrado en el historial compartido de EduGestión.`,
    { reply_markup: closureDoneKeyboard() },
  );
}

async function showGradesMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botNotasContexto', { telegramId });
  const courses = Array.isArray(result.cursos) ? result.cursos : [];
  gradesState.set(String(chatId), {
    courses,
    lapso: '',
    course: null,
    activities: [],
    selectedActivity: null,
    students: [],
  });
  pendingTextMode.delete(String(chatId));

  await sendMessage(
    chatId,
    `📝 <b>Notas y Control de Estudio</b>\n\nDocente: <b>${escapeHtml(result.profesor?.nombre || 'Docente')}</b>\nMateria: <b>${escapeHtml(result.profesor?.materia || 'Sin materia asignada')}</b>\n\nSelecciona el lapso que deseas trabajar:`,
    { reply_markup: gradesMenuKeyboard() },
  );
}

async function chooseGradesLapso(chatId, source, code) {
  const telegramId = teacherTelegramId(source);
  let state = gradesState.get(String(chatId));
  if (!state || !Array.isArray(state.courses)) {
    const result = await callEduGestion('botNotasContexto', { telegramId });
    state = {
      courses: Array.isArray(result.cursos) ? result.cursos : [],
      lapso: '',
      course: null,
      activities: [],
      selectedActivity: null,
      students: [],
    };
  }

  const lapso = gradesLapsoFromCode(code);
  state.lapso = lapso;
  state.course = null;
  state.activities = [];
  state.selectedActivity = null;
  state.students = [];
  gradesState.set(String(chatId), state);

  if (!state.courses.length) {
    await sendMessage(
      chatId,
      `⚠️ <b>${escapeHtml(lapso)}</b>\n\nNo encontré cursos con estudiantes registrados en tu cuenta docente.`,
      { reply_markup: gradesMenuKeyboard() },
    );
    return;
  }

  await sendMessage(
    chatId,
    `📝 <b>${escapeHtml(lapso)}</b>\n\nSelecciona el curso o sección:`,
    { reply_markup: gradesCoursesKeyboard(state.courses, lapso) },
  );
}

async function chooseGradesCourse(chatId, source, code, index) {
  const state = gradesState.get(String(chatId));
  if (!state || !Array.isArray(state.courses)) {
    await showGradesMenu(chatId, source);
    return;
  }

  const lapso = gradesLapsoFromCode(code);
  const course = state.courses[Number(index)];
  if (!course) {
    await sendMessage(chatId, '⚠️ La lista de cursos venció. Abre nuevamente Notas y Control de Estudio.', {
      reply_markup: gradesMenuKeyboard(),
    });
    return;
  }

  state.lapso = lapso;
  state.course = course;
  state.activities = [];
  state.selectedActivity = null;
  state.students = [];
  gradesState.set(String(chatId), state);

  await sendMessage(
    chatId,
    `📝 <b>Notas y Control de Estudio</b>\n\nLapso: <b>${escapeHtml(lapso)}</b>\nCurso: <b>${escapeHtml(course.ano || '')} · Sección ${escapeHtml(course.seccion || '')}</b>${course.turno ? `\nTurno: <b>${escapeHtml(course.turno)}</b>` : ''}\nEstudiantes: <b>${Number(course.estudiantes || 0)}</b>\n\n¿Qué deseas hacer?`,
    { reply_markup: gradesCourseMenuKeyboard() },
  );
}

async function showGradesCourseMenu(chatId, source) {
  const state = gradesState.get(String(chatId));
  if (!state?.course || !state?.lapso) {
    await showGradesMenu(chatId, source);
    return;
  }
  const course = state.course;
  await sendMessage(
    chatId,
    `📝 <b>${escapeHtml(state.lapso)}</b>\nCurso: <b>${escapeHtml(course.ano || '')} · Sección ${escapeHtml(course.seccion || '')}</b>\n\nSelecciona una opción:`,
    { reply_markup: gradesCourseMenuKeyboard() },
  );
}

async function showGradesActivities(chatId, source) {
  const state = gradesState.get(String(chatId));
  if (!state?.course || !state?.lapso) {
    await showGradesMenu(chatId, source);
    return;
  }

  const telegramId = teacherTelegramId(source);
  const course = state.course;
  const result = await callEduGestion('botNotasListarActividades', {
    telegramId,
    lapso: state.lapso,
    ano: course.ano,
    seccion: course.seccion,
    turno: course.turno || '',
  });

  const activities = Array.isArray(result.actividades) ? result.actividades : [];
  state.activities = activities;
  state.selectedActivity = null;
  gradesState.set(String(chatId), state);

  if (!activities.length) {
    await sendMessage(
      chatId,
      `📚 <b>Actividades · ${escapeHtml(state.lapso)}</b>\n\nCurso: <b>${escapeHtml(course.ano || '')} · Sección ${escapeHtml(course.seccion || '')}</b>\n\nTodavía no has creado actividades para este lapso.`,
      { reply_markup: gradesActivitiesKeyboard([]) },
    );
    return;
  }

  const totalWeight = activities.reduce((sum, item) => sum + Number(item.ponderacion || 0), 0);
  const body = activities.map((item, index) =>
    `${index + 1}. <b>${escapeHtml(item.nombre || 'Actividad')}</b>\n` +
    `Fecha: ${escapeHtml(formatPlanningDate(item.fecha || ''))} · Ponderación: <b>${Number(item.ponderacion || 0)}%</b>`
  ).join('\n\n');

  await sendMessage(
    chatId,
    `📚 <b>Actividades · ${escapeHtml(state.lapso)}</b>\n\nPonderación acumulada: <b>${Number(totalWeight.toFixed(2))}%</b>\n\n${body}\n\nSelecciona una actividad para registrar o modificar notas:`,
    { reply_markup: gradesActivitiesKeyboard(activities) },
  );
}

async function openGradesActivity(chatId, source, index) {
  const state = gradesState.get(String(chatId));
  const activity = state?.activities?.[Number(index)];
  if (!state?.course || !state?.lapso || !activity) {
    await showGradesActivities(chatId, source);
    return;
  }

  const telegramId = teacherTelegramId(source);
  const course = state.course;
  const summary = await callEduGestion('botNotasResumenSeccion', {
    telegramId,
    lapso: state.lapso,
    ano: course.ano,
    seccion: course.seccion,
    turno: course.turno || '',
  });

  const students = Array.isArray(summary.estudiantes) ? summary.estudiantes : [];
  state.selectedActivity = activity;
  state.students = students;
  gradesState.set(String(chatId), state);

  const detail = students.map((student, i) => {
    const reg = Array.isArray(student.detalle)
      ? student.detalle.find(item => String(item.idActividad) === String(activity.id))
      : null;
    const status = reg?.entrego
      ? `✅ ${reg.nota === null || reg.nota === undefined ? 'Entregó · sin nota' : `Nota ${reg.nota}/20`}`
      : '❌ No entregó / sin registro';
    return `${i + 1}. ${escapeHtml(student.alumno || 'Estudiante')} · ${status}`;
  }).join('\n');

  const chunks = [];
  let current = '';
  detail.split('\n').forEach(line => {
    if ((current + line + '\n').length > MAX_TELEGRAM_MESSAGE && current) {
      chunks.push(current.trim());
      current = '';
    }
    current += line + '\n';
  });
  if (current.trim()) chunks.push(current.trim());

  await sendMessage(
    chatId,
    `📝 <b>${escapeHtml(activity.nombre || 'Actividad')}</b>\n\nFecha: <b>${escapeHtml(formatPlanningDate(activity.fecha || ''))}</b>\nPonderación: <b>${Number(activity.ponderacion || 0)}%</b>\nCurso: <b>${escapeHtml(course.ano || '')} · Sección ${escapeHtml(course.seccion || '')}</b>\n\nEstado actual de los estudiantes:`,
  );
  for (const chunk of chunks) await sendMessage(chatId, chunk);
  await sendMessage(
    chatId,
    'Puedes registrar o modificar las notas de esta actividad.',
    { reply_markup: gradesActivityKeyboard() },
  );
}

async function requestGradesEntry(chatId, source) {
  const state = gradesState.get(String(chatId));
  if (!state?.selectedActivity || !Array.isArray(state.students) || !state.students.length) {
    await showGradesActivities(chatId, source);
    return;
  }

  pendingTextMode.set(String(chatId), 'grades-entry');
  await sendMessage(
    chatId,
    `✏️ <b>Registrar notas</b>\n\nActividad: <b>${escapeHtml(state.selectedActivity.nombre || 'Actividad')}</b>\n\nEscribe únicamente los estudiantes que deseas actualizar usando este formato:\n\n<code>1=18; 2=15.5; 3=NE</code>\n\n• Número = posición del estudiante en la lista.\n• Nota válida: 0 a 20.\n• <b>NE</b> = No entregó.\n• Los estudiantes que no escribas conservarán su información actual.\n\nEscribe <code>cancelar</code> para salir.`,
    { reply_markup: gradesActivityKeyboard() },
  );
}

function parseGradesEntry(text, students) {
  const raw = String(text || '').trim();
  if (!raw) throw new Error('Escribe al menos una nota.');
  const parts = raw.split(';').map(x => x.trim()).filter(Boolean);
  const records = [];
  const seen = new Set();

  for (const part of parts) {
    const match = part.match(/^(\d+)\s*=\s*(.+)$/);
    if (!match) throw new Error(`No entendí "${part}". Usa el formato 1=18; 2=15; 3=NE.`);
    const pos = Number(match[1]);
    if (!Number.isInteger(pos) || pos < 1 || pos > students.length) {
      throw new Error(`El estudiante número ${pos} no existe en la lista.`);
    }
    if (seen.has(pos)) throw new Error(`El estudiante número ${pos} aparece más de una vez.`);
    seen.add(pos);

    const student = students[pos - 1];
    const value = String(match[2] || '').trim().toUpperCase();
    if (['NE', 'NO', 'N'].includes(value)) {
      records.push({ idAlumno: student.idAlumno, entrego: 'No', nota: '', observacion: '' });
      continue;
    }

    const note = Number(String(match[2]).replace(',', '.'));
    if (!Number.isFinite(note) || note < 0 || note > 20) {
      throw new Error(`La nota de ${student.alumno || `estudiante ${pos}`} debe estar entre 0 y 20, o usa NE.`);
    }
    records.push({ idAlumno: student.idAlumno, entrego: 'Si', nota: Math.round(note * 100) / 100, observacion: '' });
  }

  return records;
}

async function saveGradesEntry(chatId, source, text) {
  const state = gradesState.get(String(chatId));
  if (!state?.selectedActivity || !Array.isArray(state.students)) {
    pendingTextMode.delete(String(chatId));
    await showGradesMenu(chatId, source);
    return;
  }

  let records;
  try {
    records = parseGradesEntry(text, state.students);
  } catch (error) {
    await sendMessage(
      chatId,
      `⚠️ ${escapeHtml(error.message)}\n\nEjemplo correcto:\n<code>1=18; 2=15.5; 3=NE</code>`,
      { reply_markup: gradesActivityKeyboard() },
    );
    return;
  }

  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botNotasGuardarCalificaciones', {
    telegramId,
    idActividad: state.selectedActivity.id,
    registros: records,
  });

  pendingTextMode.delete(String(chatId));
  await sendMessage(
    chatId,
    `✅ <b>Calificaciones guardadas</b>\n\nActividad: <b>${escapeHtml(state.selectedActivity.nombre || 'Actividad')}</b>\nRegistros actualizados: <b>${Number(result.guardados || records.length)}</b>\n\nLos cambios ya quedaron guardados en EduGestión.`,
    { reply_markup: gradesBackKeyboard() },
  );
}

async function startGradesActivityCreation(chatId, source) {
  const state = gradesState.get(String(chatId));
  if (!state?.course || !state?.lapso) {
    await showGradesMenu(chatId, source);
    return;
  }

  state.newActivity = { nombre: '', fecha: '', ponderacion: 0 };
  gradesState.set(String(chatId), state);
  pendingTextMode.set(String(chatId), 'grades-create-name');

  await sendMessage(
    chatId,
    `➕ <b>Nueva actividad</b>\n\nLapso: <b>${escapeHtml(state.lapso)}</b>\nCurso: <b>${escapeHtml(state.course.ano || '')} · Sección ${escapeHtml(state.course.seccion || '')}</b>\n\nEscribe el <b>nombre de la actividad</b>.\n\nEjemplo:\n<code>Prueba práctica de coordinación</code>\n\nEscribe <code>cancelar</code> para salir.`,
    { reply_markup: { inline_keyboard: [[{ text: '❌ Cancelar', callback_data: 'grades:courseMenu' }]] } },
  );
}

async function handleGradesCreateText(chatId, source, text, mode) {
  const state = gradesState.get(String(chatId));
  if (!state?.course || !state?.lapso) {
    pendingTextMode.delete(String(chatId));
    await showGradesMenu(chatId, source);
    return;
  }

  if (String(text).trim().toLowerCase() === 'cancelar') {
    pendingTextMode.delete(String(chatId));
    delete state.newActivity;
    gradesState.set(String(chatId), state);
    await showGradesCourseMenu(chatId, source);
    return;
  }

  state.newActivity = state.newActivity || { nombre: '', fecha: '', ponderacion: 0 };

  if (mode === 'grades-create-name') {
    const name = String(text || '').trim();
    if (name.length < 3) {
      await sendMessage(chatId, '⚠️ Escribe un nombre de al menos 3 caracteres.');
      return;
    }
    state.newActivity.nombre = name.slice(0, 180);
    gradesState.set(String(chatId), state);
    pendingTextMode.set(String(chatId), 'grades-create-date');
    await sendMessage(
      chatId,
      `📅 <b>Fecha de la actividad</b>\n\nEscribe la fecha como <code>AAAA-MM-DD</code>.\nEjemplo: <code>2026-09-15</code>\n\nTambién puedes escribir <code>hoy</code>.`,
    );
    return;
  }

  if (mode === 'grades-create-date') {
    let date = String(text || '').trim().toLowerCase();
    if (date === 'hoy') date = new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      await sendMessage(chatId, '⚠️ Usa una fecha válida en formato AAAA-MM-DD. Ejemplo: 2026-09-15.');
      return;
    }
    state.newActivity.fecha = date;
    gradesState.set(String(chatId), state);
    pendingTextMode.set(String(chatId), 'grades-create-weight');
    await sendMessage(
      chatId,
      `⚖️ <b>Ponderación</b>\n\nEscribe el porcentaje de esta actividad, de 1 a 100.\nEjemplo: <code>25</code>`,
    );
    return;
  }

  if (mode === 'grades-create-weight') {
    const weight = Number(String(text || '').replace(',', '.').trim());
    if (!Number.isFinite(weight) || weight <= 0 || weight > 100) {
      await sendMessage(chatId, '⚠️ La ponderación debe ser un número mayor que 0 y no superar 100.');
      return;
    }

    state.newActivity.ponderacion = weight;
    const telegramId = teacherTelegramId(source);
    const result = await callEduGestion('botNotasCrearActividad', {
      telegramId,
      lapso: state.lapso,
      ano: state.course.ano,
      seccion: state.course.seccion,
      turno: state.course.turno || '',
      nombre: state.newActivity.nombre,
      fecha: state.newActivity.fecha,
      ponderacion: state.newActivity.ponderacion,
    });

    pendingTextMode.delete(String(chatId));
    delete state.newActivity;
    gradesState.set(String(chatId), state);

    await sendMessage(
      chatId,
      `✅ <b>Actividad creada</b>\n\nNombre: <b>${escapeHtml(result.actividad?.nombre || '')}</b>\nFecha: <b>${escapeHtml(formatPlanningDate(result.actividad?.fecha || ''))}</b>\nPonderación: <b>${Number(result.actividad?.ponderacion || 0)}%</b>\nPonderación acumulada del lapso: <b>${Number(result.ponderacionAcumulada || 0)}%</b>`,
      { reply_markup: gradesBackKeyboard() },
    );
  }
}

async function showGradesSummary(chatId, source) {
  const state = gradesState.get(String(chatId));
  if (!state?.course || !state?.lapso) {
    await showGradesMenu(chatId, source);
    return;
  }

  const telegramId = teacherTelegramId(source);
  const course = state.course;
  const result = await callEduGestion('botNotasResumenSeccion', {
    telegramId,
    lapso: state.lapso,
    ano: course.ano,
    seccion: course.seccion,
    turno: course.turno || '',
  });

  const students = Array.isArray(result.estudiantes) ? result.estudiantes : [];
  const header =
    `📊 <b>Resumen de la sección</b>\n\n` +
    `Lapso: <b>${escapeHtml(result.lapso || state.lapso)}</b>\n` +
    `Curso: <b>${escapeHtml(result.ano || course.ano || '')} · Sección ${escapeHtml(result.seccion || course.seccion || '')}</b>\n` +
    `Actividades: <b>${Number(result.totalActividades || 0)}</b>\n` +
    `Estudiantes: <b>${Number(result.totalEstudiantes || students.length)}</b>\n` +
    `Promedio de la sección: <b>${result.promedioSeccion === null || result.promedioSeccion === undefined ? 'Sin notas' : `${Number(result.promedioSeccion).toFixed(2)}/20`}</b>\n\n`;

  await sendMessage(chatId, header);

  if (!students.length) {
    await sendMessage(chatId, 'No hay estudiantes para esta sección.', { reply_markup: gradesBackKeyboard() });
    return;
  }

  let current = '';
  const chunks = [];
  students.forEach((student, index) => {
    const attendance = student.asistencia || {};
    const note = student.notaFinal === null || student.notaFinal === undefined
      ? 'Sin nota'
      : `${Number(student.notaFinal).toFixed(2)}/20`;
    const line =
      `${index + 1}. <b>${escapeHtml(student.alumno || 'Estudiante')}</b>\n` +
      `Nota: <b>${note}</b> · Entregadas: ${Number(student.entregadas || 0)}/${Number(student.totalActividades || 0)}\n` +
      `Asistencia: P ${Number(attendance.presentes || 0)} · A ${Number(attendance.ausentes || 0)} · T ${Number(attendance.tardanzas || 0)}\n\n`;
    if ((current + line).length > MAX_TELEGRAM_MESSAGE && current) {
      chunks.push(current.trim());
      current = '';
    }
    current += line;
  });
  if (current.trim()) chunks.push(current.trim());

  for (const chunk of chunks) await sendMessage(chatId, chunk);
  await sendMessage(chatId, 'Resumen actualizado de EduGestión.', { reply_markup: gradesBackKeyboard() });
}

/* =========================================================
   FIN NOTAS Y CONTROL DE ESTUDIO · TELEGRAM FASE 1
   ========================================================= */

function teacherTimeKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '🟢 Registrar llegada', callback_data: 'teacherTime:arrival' }],
      [{ text: '🔴 Registrar salida', callback_data: 'teacherTime:exit' }],
      [{ text: '🚫 Informar ausencia', callback_data: 'teacherTime:absence' }],
      [{ text: '📊 Ver resumen', callback_data: 'teacherTime:summary' }],
      [{ text: '🏠 Menú principal', callback_data: 'menu' }],
    ],
  };
}

async function showTeacherTimeMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botObtenerAsistenciaDocente', { telegramId });
  const today = result.hoy || {};

  let statusText = '⚪ Sin registro para hoy';
  if (today.estado === 'Ausente') {
    statusText = `🚫 Ausente\nMotivo: ${escapeHtml(today.motivoAusencia || 'Registrado')}`;
  } else if (today.horaSalida) {
    statusText =
      `✅ Jornada completada\n` +
      `Llegada: <b>${escapeHtml(today.horaLlegada || '--:--')}</b>\n` +
      `Salida: <b>${escapeHtml(today.horaSalida || '--:--')}</b>\n` +
      `Horas: <b>${Number(today.minutosTrabajados || 0) / 60} h</b>`;
  } else if (today.horaLlegada) {
    statusText =
      `🟢 Llegada registrada: <b>${escapeHtml(today.horaLlegada)}</b>\n` +
      `La salida está pendiente.`;
  }

  await sendMessage(
    chatId,
    `🕒 <b>Mi asistencia laboral</b>\n\n${statusText}\n\nSelecciona una opción:`,
    { reply_markup: teacherTimeKeyboard() },
  );
}

async function registerTeacherArrival(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botRegistrarLlegadaDocente', { telegramId });

  await sendMessage(
    chatId,
    `✅ <b>Llegada registrada</b>\n\n${escapeHtml(result.message || 'La hora de llegada fue guardada.')}`,
    { reply_markup: teacherTimeKeyboard() },
  );
}

async function registerTeacherExit(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botRegistrarSalidaDocente', { telegramId });

  await sendMessage(
    chatId,
    `✅ <b>Salida registrada</b>\n\n${escapeHtml(result.message || 'La hora de salida fue guardada.')}`,
    { reply_markup: teacherTimeKeyboard() },
  );
}

async function showTeacherTimeSummary(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botObtenerAsistenciaDocente', { telegramId });
  const summary = result.resumen || {};

  const formatPeriod = (label, item = {}) =>
    `${label}: <b>${Number(item.horas || 0).toFixed(1)} h</b>\n` +
    `Días trabajados: <b>${Number(item.diasTrabajados || 0)}</b>\n` +
    `Ausencias: <b>${Number(item.ausencias || 0)}</b>\n` +
    `Promedio: <b>${Number(item.promedioHorasDia || 0).toFixed(1)} h/día</b>`;

  await sendMessage(
    chatId,
    `📊 <b>Resumen de asistencia laboral</b>\n\n` +
    `${formatPeriod('Hoy', summary.dia)}\n\n` +
    `${formatPeriod('Esta semana', summary.semana)}\n\n` +
    `${formatPeriod('Este mes', summary.mes)}`,
    { reply_markup: teacherTimeKeyboard() },
  );
}

async function saveTeacherAbsenceFromCommand(message, reason) {
  const chatId = message?.chat?.id;
  const telegramId = teacherTelegramId(message);
  const cleanReason = String(reason || '').trim();

  if (cleanReason.length < 5) {
    await sendMessage(
      chatId,
      `⚠️ Escribe un motivo más claro.\n\nEjemplo:\n<code>/ausencia Reposo médico</code>`,
      { reply_markup: teacherTimeKeyboard() },
    );
    return;
  }

  const result = await callEduGestion('botRegistrarAusenciaDocente', {
    telegramId,
    motivo: cleanReason,
  });

  await sendMessage(
    chatId,
    `✅ <b>Ausencia registrada</b>\n\n${escapeHtml(result.message || 'La ausencia fue guardada.')}`,
    { reply_markup: teacherTimeKeyboard() },
  );
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

  await ensureQuickMenuButton(chatId);

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
    { reply_markup: studentDetailKeyboard(Number(index)) },
  );
}


async function showAcademicStudents(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  pendingTextMode.delete(String(chatId));

  const result = await callEduGestion('botListarEstudiantes', {
    telegramId,
    limite: 30,
  });
  const students = Array.isArray(result.estudiantes) ? result.estudiantes : [];

  if (!students.length) {
    await sendMessage(
      chatId,
      '📘 <b>Ficha académica</b>\n\nTodavía no tienes estudiantes registrados.',
      { reply_markup: mainMenuKeyboard(true) },
    );
    return;
  }

  await sendMessage(
    chatId,
    `📘 <b>Ficha académica</b>

Selecciona el estudiante cuya ficha deseas consultar.

La ficha reúne:
• Datos académicos y representante
• Asistencia acumulada
• Actividades del lapso
• Entregadas y no entregadas
• Calificaciones
• Promedio del lapso`,
    { reply_markup: academicStudentsKeyboard(students) },
  );
}

async function chooseAcademicStudent(chatId, source, index) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botDetalleEstudiante', {
    telegramId,
    indice: Number(index),
  });
  const student = result.estudiante || {};

  await sendMessage(
    chatId,
    `📘 <b>Ficha académica</b>

Estudiante: <b>${escapeHtml(student.nombre || 'Estudiante')}</b>
Curso: <b>${escapeHtml(student.ano || 'No registrado')} · Sección ${escapeHtml(student.seccion || '—')}</b>

Selecciona el lapso que deseas consultar:`,
    { reply_markup: academicLapsoKeyboard(Number(index)) },
  );
}

function academicLapsoLabel(code) {
  if (code === 'L2') return '2do Lapso';
  if (code === 'L3') return '3er Lapso';
  return '1er Lapso';
}

async function showAcademicRecord(chatId, source, index, lapsoCode) {
  const telegramId = teacherTelegramId(source);
  const lapso = academicLapsoLabel(lapsoCode);

  const result = await callEduGestion('botFichaAcademicaEstudiante', {
    telegramId,
    indice: Number(index),
    lapso,
  });

  const student = result.estudiante || {};
  const attendance = result.asistencia || {};
  const academic = result.resumenAcademico || {};
  const activities = Array.isArray(result.actividades) ? result.actividades : [];

  const representativePhone = student.telefonoRepresentante
    ? `<code>${escapeHtml(student.telefonoRepresentante)}</code>`
    : 'No registrado';
  const representativeEmail = student.emailRepresentante
    ? escapeHtml(student.emailRepresentante)
    : 'No registrado';

  const activitiesText = activities.length
    ? activities.map((item, i) => {
        const grade = item.nota === null || item.nota === undefined
          ? 'Sin nota'
          : `${Number(item.nota).toFixed(2)}/20`;
        return `${i + 1}. ${item.entrego ? '✅' : '❌'} <b>${escapeHtml(item.actividad || 'Actividad')}</b>\n` +
          `   Ponderación: ${Number(item.ponderacion || 0)}% · Nota: <b>${grade}</b>`;
      }).join('\n\n')
    : 'No hay actividades registradas en este lapso.';

  const average = academic.promedioLapso === null || academic.promedioLapso === undefined
    ? 'Sin promedio'
    : `${Number(academic.promedioLapso).toFixed(2)}/20`;

  await sendMessage(
    chatId,
    `📘 <b>FICHA ACADÉMICA</b>

👨‍🎓 <b>${escapeHtml(student.nombre || 'Estudiante')}</b>
Cédula: ${escapeHtml(student.cedula || 'No registrada')}
Curso: ${escapeHtml(student.ano || 'No registrado')} · Sección ${escapeHtml(student.seccion || '—')}
Turno: ${escapeHtml(student.turno || 'No registrado')}
Lapso: <b>${escapeHtml(result.lapso || lapso)}</b>

👪 <b>Representante</b>
Nombre: ${escapeHtml(student.representante || 'No registrado')}
Teléfono: ${representativePhone}
Correo: ${representativeEmail}

📋 <b>Asistencia acumulada</b>
Registros: <b>${Number(attendance.total || 0)}</b>
🟢 Presentes: <b>${Number(attendance.presentes || 0)}</b>
🔴 Ausentes: <b>${Number(attendance.ausentes || 0)}</b>
🟠 Tardanzas: <b>${Number(attendance.tardanzas || 0)}</b>
🟣 Justificadas: <b>${Number(attendance.justificadas || 0)}</b>
Asistencia efectiva: <b>${Number(attendance.porcentajeAsistencia || 0).toFixed(2)}%</b>

📝 <b>Resumen académico</b>
Actividades: <b>${Number(academic.totalActividades || 0)}</b>
✅ Entregadas: <b>${Number(academic.entregadas || 0)}</b>
❌ No entregadas: <b>${Number(academic.noEntregadas || 0)}</b>
⭐ Promedio del lapso: <b>${average}</b>

📚 <b>Detalle de actividades</b>
${activitiesText}`,
    { reply_markup: academicDetailKeyboard(Number(index), lapsoCode) },
  );
}



async function showBulletinStudents(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  pendingTextMode.delete(String(chatId));

  const result = await callEduGestion('botListarEstudiantes', {
    telegramId,
    limite: 30,
  });
  const students = Array.isArray(result.estudiantes) ? result.estudiantes : [];

  if (!students.length) {
    await sendMessage(
      chatId,
      '📄 <b>Boletines</b>\n\nTodavía no tienes estudiantes registrados.',
      { reply_markup: mainMenuKeyboard(true) },
    );
    return;
  }

  await sendMessage(
    chatId,
    `📄 <b>BOLETINES POR ESTUDIANTE</b>

Selecciona el estudiante.

El boletín mostrará:
• Datos del estudiante
• Lapso
• Resumen de asistencia
• Actividades y ponderaciones
• Entregadas / no entregadas
• Calificaciones
• Promedio final del lapso

Los datos se toman del mismo registro compartido que usa Notas y Control de Estudio.`,
    { reply_markup: bulletinStudentsKeyboard(students) },
  );
}

async function chooseBulletinStudent(chatId, source, index) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botDetalleEstudiante', {
    telegramId,
    indice: Number(index),
  });
  const student = result.estudiante || {};

  await sendMessage(
    chatId,
    `📄 <b>Boletín del estudiante</b>

👨‍🎓 <b>${escapeHtml(student.nombre || 'Estudiante')}</b>
Curso: <b>${escapeHtml(student.ano || 'No registrado')} · Sección ${escapeHtml(student.seccion || '—')}</b>

Selecciona el lapso del boletín:`,
    { reply_markup: bulletinLapsoKeyboard(Number(index)) },
  );
}

async function showStudentBulletin(chatId, source, index, lapsoCode) {
  const telegramId = teacherTelegramId(source);
  const lapso = academicLapsoLabel(lapsoCode);

  const result = await callEduGestion('botFichaAcademicaEstudiante', {
    telegramId,
    indice: Number(index),
    lapso,
  });

  const student = result.estudiante || {};
  const attendance = result.asistencia || {};
  const academic = result.resumenAcademico || {};
  const activities = Array.isArray(result.actividades) ? result.actividades : [];

  const average = academic.promedioLapso === null || academic.promedioLapso === undefined
    ? 'Sin promedio'
    : `${Number(academic.promedioLapso).toFixed(2)}/20`;

  const attendancePercent = Number(attendance.porcentajeAsistencia || 0).toFixed(2);

  const activitiesText = activities.length
    ? activities.map((item, i) => {
        const grade = item.nota === null || item.nota === undefined
          ? 'Sin nota'
          : `${Number(item.nota).toFixed(2)}/20`;
        return `${i + 1}. ${item.entrego ? '✅' : '❌'} ${escapeHtml(item.actividad || 'Actividad')}\n` +
          `   ${Number(item.ponderacion || 0)}% · ${grade}`;
      }).join('\n')
    : 'Sin actividades registradas en este lapso.';

  await sendMessage(
    chatId,
    `📄 <b>BOLETÍN INDIVIDUAL</b>
━━━━━━━━━━━━━━━━━━

👨‍🎓 <b>Estudiante</b>
${escapeHtml(student.nombre || 'Estudiante')}
Cédula: ${escapeHtml(student.cedula || 'No registrada')}
Curso: ${escapeHtml(student.ano || 'No registrado')} · Sección ${escapeHtml(student.seccion || '—')}
Turno: ${escapeHtml(student.turno || 'No registrado')}
Lapso: <b>${escapeHtml(result.lapso || lapso)}</b>

📋 <b>ASISTENCIA</b>
Presentes: <b>${Number(attendance.presentes || 0)}</b>
Ausentes: <b>${Number(attendance.ausentes || 0)}</b>
Tardanzas: <b>${Number(attendance.tardanzas || 0)}</b>
Justificadas: <b>${Number(attendance.justificadas || 0)}</b>
Asistencia efectiva: <b>${attendancePercent}%</b>

📝 <b>EVALUACIÓN</b>
Actividades: <b>${Number(academic.totalActividades || 0)}</b>
Entregadas: <b>${Number(academic.entregadas || 0)}</b>
No entregadas: <b>${Number(academic.noEntregadas || 0)}</b>

📚 <b>DETALLE DE ACTIVIDADES</b>
${activitiesText}

⭐ <b>NOTA FINAL DEL LAPSO: ${average}</b>

💬 <b>Observación del docente:</b>
No registrada desde Telegram.

━━━━━━━━━━━━━━━━━━
Boletín generado por EduGestión desde el bot de Telegram.`,
    { reply_markup: bulletinDetailKeyboard(Number(index)) },
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

function formatRangeLabel(range = {}) {
  const start = formatPlanningDate(range.inicio || '');
  const end = formatPlanningDate(range.fin || '');
  return start === end ? start : `${start} al ${end}`;
}

async function showStatsMenu(chatId, source) {
  const profile = await linkedProfile(teacherTelegramId(source));
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  await sendMessage(
    chatId,
    `📊 <b>Estadísticas de asistencia</b>

Selecciona el periodo que deseas consultar:`,
    { reply_markup: statsMenuKeyboard() },
  );
}

async function showStatsResult(chatId, source, period) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botEstadisticasAsistencia', {
    telegramId,
    periodo: period,
  });
  const summary = result.resumen || {};
  const labels = {
    dia: 'Resumen de hoy',
    semana: 'Resumen semanal',
    mes: 'Resumen mensual',
  };

  await sendMessage(
    chatId,
    `📊 <b>${labels[result.periodo] || 'Resumen de asistencia'}</b>
Periodo: ${escapeHtml(formatRangeLabel(result.rango || {}))}

Registros: <b>${Number(summary.total || 0)}</b>
Estudiantes: <b>${Number(summary.estudiantes || 0)}</b>
Secciones: <b>${Number(summary.secciones || 0)}</b>

🟢 Presentes: <b>${Number(summary.presentes || 0)}</b>
🔴 Ausentes: <b>${Number(summary.ausentes || 0)}</b>
🟠 Tardanzas: <b>${Number(summary.tardanzas || 0)}</b>
🟣 Justificadas: <b>${Number(summary.justificadas || 0)}</b>

Asistencia efectiva: <b>${Number(summary.porcentajeAsistencia || 0).toFixed(2)}%</b>`,
    { reply_markup: statsResultKeyboard() },
  );
}

async function showAbsenceRanking(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botRankingAusencias', {
    telegramId,
    periodo: 'mes',
  });
  const ranking = Array.isArray(result.ranking) ? result.ranking : [];

  if (!ranking.length) {
    await sendMessage(
      chatId,
      `⚠️ <b>Estudiantes con más ausencias</b>

No hay ausencias ni tardanzas registradas durante el periodo ${escapeHtml(formatRangeLabel(result.rango || {}))}.`,
      { reply_markup: statsResultKeyboard() },
    );
    return;
  }

  const body = ranking.map((item, index) =>
    `${index + 1}. <b>${escapeHtml(item.alumno || 'Estudiante')}</b>
${escapeHtml(item.ano || '')} · Sección ${escapeHtml(item.seccion || '')}
🔴 Ausencias: <b>${Number(item.ausentes || 0)}</b> · 🟠 Tardanzas: <b>${Number(item.tardanzas || 0)}</b>`
  ).join('\n\n');

  await sendMessage(
    chatId,
    `⚠️ <b>Estudiantes con más ausencias</b>
Periodo: ${escapeHtml(formatRangeLabel(result.rango || {}))}

${body}`,
    { reply_markup: statsResultKeyboard() },
  );
}

async function showReportsMenu(chatId, source) {
  const profile = await linkedProfile(teacherTelegramId(source));
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  await sendMessage(
    chatId,
    `📄 <b>Generar informe PDF</b>

Selecciona el periodo. El documento se generará y se enviará directamente a este chat.`,
    { reply_markup: reportsMenuKeyboard() },
  );
}

async function generateAndSendReport(chatId, source, period) {
  const telegramId = teacherTelegramId(source);
  const labels = {
    dia: 'Diario',
    semana: 'Semanal',
    mes: 'Mensual',
  };

  await sendMessage(
    chatId,
    `⏳ <b>Generando informe ${escapeHtml(labels[period] || 'Mensual')}...</b>

Espera unos segundos.`,
  );

  let filename = '';
  try {
    const report = await callEduGestion('botDatosInformeAsistencia', {
      telegramId,
      periodo: period,
    });

    const date = new Date().toISOString().slice(0, 10);
    filename = `Informe_Asistencia_${period}_${date}.pdf`;
    const pdf = buildSimplePdf(report);

    const sent = await sendPdfDocument(
      chatId,
      pdf,
      filename,
      `Informe ${labels[period] || 'Mensual'} de asistencia · EduGestión`,
    );

    await callEduGestion('botRegistrarInformeTelegram', {
      telegramId,
      archivo: filename,
      periodo: labels[period] || period,
      seccion: report.seccion || 'Todas las secciones',
      mensajeId: String(sent.message_id || ''),
      tamanoBytes: pdf.length,
      estado: 'enviado',
      codigo: '',
      detalle: 'Informe generado desde el bot de Telegram.',
    });

    await sendMessage(
      chatId,
      `✅ <b>Informe enviado correctamente</b>

Archivo: <code>${escapeHtml(filename)}</code>
Periodo: <b>${escapeHtml(labels[period] || period)}</b>
Tamaño: <b>${Math.max(1, Math.round(pdf.length / 1024))} KB</b>

El envío quedó registrado en el historial de EduGestión.`,
      { reply_markup: reportsResultKeyboard() },
    );
  } catch (error) {
    try {
      await callEduGestion('botRegistrarInformeTelegram', {
        telegramId,
        archivo: filename || 'Informe_Asistencia_Telegram.pdf',
        periodo: labels[period] || period,
        seccion: 'Todas las secciones',
        mensajeId: '',
        tamanoBytes: 0,
        estado: 'error',
        codigo: error.code || 'REPORT_ERROR',
        detalle: error.message || 'No se pudo generar el informe.',
      });
    } catch (auditError) {
      console.error('No se pudo registrar el error del informe:', auditError);
    }
    throw error;
  }
}

const recordsTypeCache = new Map();

async function showRecordsMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botListarActas', {
    telegramId,
    limite: 30,
  });

  const types = Array.isArray(result.tipos) ? result.tipos : [];
  recordsTypeCache.set(String(chatId), types);

  await sendMessage(
    chatId,
    `📝 <b>Actas académicas</b>

Total registrado: <b>${Number(result.total || 0)}</b>

Consulta las actas creadas para tus estudiantes.`,
    { reply_markup: recordsMenuKeyboard(types) },
  );
}

async function showRecordsList(chatId, source, type = '') {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botListarActas', {
    telegramId,
    limite: 30,
    tipo: type,
  });

  const items = Array.isArray(result.actas) ? result.actas : [];
  recordsTypeCache.set(String(chatId), Array.isArray(result.tipos) ? result.tipos : []);

  if (!items.length) {
    await sendMessage(
      chatId,
      `📝 <b>Actas académicas</b>

No hay actas registradas${type ? ` del tipo <b>${escapeHtml(type)}</b>` : ''}.`,
      { reply_markup: recordsMenuKeyboard(result.tipos || []) },
    );
    return;
  }

  const body = items.map((item, index) =>
    `${index + 1}. <b>${escapeHtml(item.titulo || 'Acta')}</b>
Estudiante: ${escapeHtml(item.alumno || 'No registrado')}
Fecha: ${escapeHtml(formatPlanningDate(item.fecha))}
Tipo: ${escapeHtml(item.tipo || 'general')}`
  ).join('\n\n');

  await sendMessage(
    chatId,
    `📝 <b>Actas${type ? ` · ${escapeHtml(type)}` : ' recientes'}</b>

${body}

Selecciona un acta para ver el contenido completo:`,
    { reply_markup: recordsListKeyboard(items) },
  );
}

async function showRecordDetail(chatId, source, index) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botDetalleActa', {
    telegramId,
    indice: Number(index),
  });

  const item = result.acta || {};
  const email = item.emailRepresentante
    ? escapeHtml(item.emailRepresentante)
    : 'No registrado';

  await sendMessage(
    chatId,
    `📝 <b>${escapeHtml(item.titulo || 'Acta')}</b>

Estudiante: <b>${escapeHtml(item.alumno || 'No registrado')}</b>
Fecha: <b>${escapeHtml(formatPlanningDate(item.fecha))}</b>
Tipo: ${escapeHtml(item.tipo || 'general')}
Correo del representante: ${email}

<b>Contenido</b>
${escapeHtml(item.mensaje || 'Sin contenido registrado.')}`,
    { reply_markup: recordDetailKeyboard() },
  );
}

async function startRecordCreation(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botIniciarCreacionActa', { telegramId });
  const students = Array.isArray(result.estudiantes) ? result.estudiantes : [];
  pendingTextMode.delete(String(chatId));

  if (!students.length) {
    await sendMessage(chatId, '📝 <b>Crear acta</b>\n\nNo tienes estudiantes registrados.', {
      reply_markup: recordsMenuKeyboard(),
    });
    return;
  }

  await sendMessage(chatId, '📝 <b>Crear nueva acta</b>\n\nPaso 1 de 4: selecciona el estudiante.', {
    reply_markup: recordStudentsKeyboard(students),
  });
}

async function selectRecordStudent(chatId, source, index) {
  const result = await callEduGestion('botSeleccionarAlumnoActa', {
    telegramId: teacherTelegramId(source),
    indice: Number(index),
  });

  await sendMessage(
    chatId,
    `📝 <b>Crear nueva acta</b>

Estudiante: <b>${escapeHtml(result.estudiante?.nombre || 'Estudiante')}</b>

Paso 2 de 4: selecciona el tipo de acta.`,
    { reply_markup: recordTypesKeyboard() },
  );
}

async function selectRecordType(chatId, source, type) {
  const result = await callEduGestion('botSeleccionarTipoActa', {
    telegramId: teacherTelegramId(source),
    tipo: type,
  });

  pendingTextMode.set(String(chatId), 'record-title');
  await sendMessage(
    chatId,
    `📝 <b>Crear nueva acta</b>

Estudiante: <b>${escapeHtml(result.alumno || 'Estudiante')}</b>
Tipo: <b>${escapeHtml(result.tipo || type)}</b>

Paso 3 de 4: escribe el título.

Ejemplo:
<code>Compromiso de mejora académica</code>

Escribe <code>cancelar</code> para salir.`,
  );
}

async function saveRecordTitle(chatId, source, title) {
  const result = await callEduGestion('botGuardarTituloActa', {
    telegramId: teacherTelegramId(source),
    titulo: String(title || '').trim(),
  });

  pendingTextMode.set(String(chatId), 'record-message');
  await sendMessage(
    chatId,
    `📝 <b>Crear nueva acta</b>

Título: <b>${escapeHtml(result.titulo || title)}</b>

Paso 4 de 4: escribe el contenido completo.

Escribe <code>cancelar</code> para salir.`,
  );
}

async function previewRecord(chatId, source, messageText) {
  const result = await callEduGestion('botPrevisualizarActa', {
    telegramId: teacherTelegramId(source),
    mensaje: String(messageText || '').trim(),
  });

  pendingTextMode.delete(String(chatId));
  const item = result.vistaPrevia || {};

  await sendMessage(
    chatId,
    `📝 <b>Revisar acta</b>

Estudiante: <b>${escapeHtml(item.alumno || 'Estudiante')}</b>
Tipo: ${escapeHtml(item.tipo || 'general')}
Título: <b>${escapeHtml(item.titulo || 'Acta')}</b>
Fecha: ${escapeHtml(formatPlanningDate(item.fecha))}

<b>Contenido</b>
${escapeHtml(item.mensaje || '')}

Selecciona cómo deseas guardarla:`,
    { reply_markup: recordConfirmKeyboard() },
  );
}

async function confirmRecord(chatId, source, sendEmail) {
  const result = await callEduGestion('botConfirmarActa', {
    telegramId: teacherTelegramId(source),
    enviarCorreo: Boolean(sendEmail),
  });

  const emailText = sendEmail
    ? (result.correo?.enviado
      ? '\n📧 Correo enviado al representante.'
      : `\n⚠️ ${escapeHtml(result.correo?.message || 'No se pudo enviar el correo.')}`)
    : '';

  await sendMessage(
    chatId,
    `✅ <b>Acta creada correctamente</b>

Estudiante: <b>${escapeHtml(result.acta?.alumno || 'Estudiante')}</b>
Título: <b>${escapeHtml(result.acta?.titulo || 'Acta')}</b>${emailText}`,
    { reply_markup: recordsMenuKeyboard() },
  );
}

async function cancelRecordCreation(chatId, source) {
  pendingTextMode.delete(String(chatId));
  try {
    await callEduGestion('botCancelarCreacionActa', {
      telegramId: teacherTelegramId(source),
    });
  } catch (error) {
    if (error.code !== 'FLOW_EXPIRED') throw error;
  }

  await sendMessage(chatId, '❌ Creación del acta cancelada.', {
    reply_markup: recordsMenuKeyboard(),
  });
}

async function showSystemDiagnostic(chatId, source) {
  const result = await callEduGestion('botDiagnosticoSistema', {
    telegramId: teacherTelegramId(source),
  });

  const modules = result.modulos || {};
  const totals = result.totales || {};
  const warnings = Array.isArray(result.advertencias) ? result.advertencias : [];

  const statusLine = key => modules[key] ? '✅' : '❌';
  const warningText = warnings.length
    ? `

<b>Advertencias</b>
${warnings.map(item => `• ${escapeHtml(item)}`).join('\n')}`
    : '\n\n✅ No se detectaron advertencias.';

  await sendMessage(
    chatId,
    `🩺 <b>Diagnóstico de EduGestión</b>

Estado general: <b>${result.salud === 'correcto' ? 'Correcto' : 'Con advertencias'}</b>
Versión: <code>${escapeHtml(result.version || '')}</code>

${statusLine('telegram')} Telegram vinculado
${statusLine('configuracion')} Configuración
${statusLine('estudiantes')} Estudiantes: <b>${Number(totals.estudiantes || 0)}</b>
${statusLine('asistencia')} Asistencias: <b>${Number(totals.asistencia || 0)}</b>
${statusLine('planificacion')} Planificaciones: <b>${Number(totals.planificacion || 0)}</b>
${statusLine('horarios')} Horarios: <b>${Number(totals.horarios || 0)}</b>
${statusLine('actas')} Actas: <b>${Number(totals.actas || 0)}</b>${warningText}`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Ejecutar nuevamente', callback_data: 'system:diagnostic' }],
          [{ text: '🏠 Menú principal', callback_data: 'menu' }],
        ],
      },
    },
  );
}

async function showSecurityStatus(chatId, source) {
  const result = await callEduGestion('botEstadoSeguridad', {
    telegramId: teacherTelegramId(source),
  });

  const checks = result.controles || {};
  const icon = value => value ? '✅' : '❌';
  const warnings = Array.isArray(result.advertencias) ? result.advertencias : [];

  const backupText = result.ultimoRespaldo
    ? escapeHtml(result.ultimoRespaldo)
    : 'No registrado';

  const warningText = warnings.length
    ? `

<b>Atención</b>
${warnings.map(item => `• ${escapeHtml(item)}`).join('\n')}`
    : '\n\n✅ No se detectaron problemas de seguridad.';

  await sendMessage(
    chatId,
    `🔐 <b>Seguridad y respaldo</b>

Estado: <b>${result.salud === 'correcto' ? 'Correcto' : 'Con advertencias'}</b>

${icon(checks.botSecret)} Secreto del bot configurado
${icon(checks.spreadsheetId)} Base de datos vinculada
${icon(checks.passwordPepper)} Protección de contraseñas
${icon(checks.telegramVinculado)} Telegram vinculado
${icon(checks.institucionConfigurada)} Institución configurada
${icon(checks.sesionesTemporales)} Sesiones temporales
${icon(checks.aislamientoDocente)} Aislamiento por docente

Último respaldo: <b>${backupText}</b>${warningText}

Para crear un respaldo, ejecuta <code>crearRespaldoManualEduGestion</code> desde Google Apps Script.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Revisar nuevamente', callback_data: 'system:security' }],
          [{ text: '🏠 Menú principal', callback_data: 'menu' }],
        ],
      },
    },
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
    ? 'ℹ️ <b>Ayuda de EduGestión</b>\n\n• /menu abre el menú principal.\n• /hoy muestra las clases del día.\n• /asistencia inicia el registro.\n• /consultar muestra el detalle de asistencia del día.\n• /estudiantes abre la consulta de estudiantes.\n• /ficha abre la ficha académica completa.\n• /boletin abre los boletines por estudiante.\n• /cierre abre el cierre de lapso.\n• Toca ☰ TODAS LAS OPCIONES para abrir el menú completo sin escribir comandos.\n• /planificacion muestra próximas evaluaciones.\n• /estadisticas muestra resúmenes de asistencia.\n• /informe genera un PDF de asistencia.\n• /actas consulta las actas académicas.\n• /estado muestra la cuenta vinculada.\n• /jornada abre tu asistencia laboral.\n• /ausencia MOTIVO registra una ausencia.\n\nPara pasar o corregir asistencia, abre una clase y escribe:\n<code>A: 2,5; T: 3; J: 4</code>\n\nA = ausente · T = tardanza · J = justificada. Los demás quedan presentes.'
    : 'ℹ️ <b>Ayuda de EduGestión</b>\n\nPrimero vincula tu Telegram con una cuenta docente. Genera un código temporal en EduGestión y envíalo así:\n<code>/vincular 123456</code>';
  await sendMessage(chatId, text, { reply_markup: mainMenuKeyboard(linked) });
}

async function handleMessage(message) {
  const chatId = message?.chat?.id;
  if (!chatId) return;

  const text = normalizeCommand(message.text);

  if (/^(☰\s*)?(TODAS LAS OPCIONES|MENÚ COMPLETO|MENU COMPLETO|MENÚ|MENU)$/i.test(text)) {
    await showMainMenu(chatId, message);
    return;
  }

  if (/^\/(start|menu)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showMainMenu(chatId, message);
    return;
  }

  if (/^\/jornada(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showTeacherTimeMenu(chatId, message);
    return;
  }

  const teacherAbsenceMatch = text.match(/^\/ausencia(?:@\w+)?(?:\s+(.+))?$/i);
  if (teacherAbsenceMatch) {
    if (!teacherAbsenceMatch[1]) {
      await sendMessage(
        chatId,
        `🚫 <b>Informar ausencia</b>\n\nEscribe el comando seguido del motivo:\n<code>/ausencia Reposo médico</code>`,
        { reply_markup: teacherTimeKeyboard() },
      );
    } else {
      await saveTeacherAbsenceFromCommand(message, teacherAbsenceMatch[1]);
    }
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

  if (/^\/estadisticas(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showStatsMenu(chatId, message);
    return;
  }

  if (/^\/informe(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showReportsMenu(chatId, message);
    return;
  }

  if (/^\/actas(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showRecordsMenu(chatId, message);
    return;
  }

  if (/^\/notas(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showGradesMenu(chatId, message);
    return;
  }

  if (/^\/ficha(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showAcademicStudents(chatId, message);
    return;
  }

  if (/^\/boletin(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showBulletinStudents(chatId, message);
    return;
  }

  if (/^\/cierre(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showClosureMenu(chatId, message);
    return;
  }

  if (/^\/diagnostico(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showSystemDiagnostic(chatId, message);
    return;
  }

  if (/^\/seguridad(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showSecurityStatus(chatId, message);
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
    if (mode === 'record-title') {
      if (String(text).trim().toLowerCase() === 'cancelar') {
        await cancelRecordCreation(chatId, message);
      } else {
        await saveRecordTitle(chatId, message, text);
      }
      return;
    }
    if (mode === 'record-message') {
      if (String(text).trim().toLowerCase() === 'cancelar') {
        await cancelRecordCreation(chatId, message);
      } else {
        await previewRecord(chatId, message, text);
      }
      return;
    }

    if (mode === 'grades-entry') {
      if (String(text).trim().toLowerCase() === 'cancelar') {
        pendingTextMode.delete(String(chatId));
        await showGradesActivities(chatId, message);
      } else {
        await saveGradesEntry(chatId, message, text);
      }
      return;
    }

    if (['grades-create-name', 'grades-create-date', 'grades-create-weight'].includes(mode)) {
      await handleGradesCreateText(chatId, message, text, mode);
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
    pendingTextMode.delete(String(chatId));
    await showMainMenu(chatId, callbackQuery);
    return;
  }

  if (data === 'closure:menu') {
    await showClosureMenu(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('closure:lapso:')) {
    await chooseClosureLapso(chatId, callbackQuery, data.split(':')[2]);
    return;
  }
  if (data.startsWith('closure:course:')) {
    const parts = data.split(':');
    await previewClosure(chatId, callbackQuery, parts[2], Number(parts[3]));
    return;
  }
  if (data === 'closure:register') {
    await registerClosure(chatId, callbackQuery);
    return;
  }
  if (data === 'closure:changeCourse') {
    const state = closureState.get(String(chatId));
    if (state?.lapsoCode) await chooseClosureLapso(chatId, callbackQuery, state.lapsoCode);
    else await showClosureMenu(chatId, callbackQuery);
    return;
  }

  if (data === 'bulletin:menu') {
    await showBulletinStudents(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('bulletin:student:')) {
    const index = Number(data.split(':')[2]);
    await chooseBulletinStudent(chatId, callbackQuery, index);
    return;
  }
  if (data.startsWith('bulletin:lapso:')) {
    const parts = data.split(':');
    const index = Number(parts[2]);
    const lapsoCode = parts[3] || 'L1';
    await showStudentBulletin(chatId, callbackQuery, index, lapsoCode);
    return;
  }

  if (data === 'academic:menu') {
    await showAcademicStudents(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('academic:student:')) {
    const index = Number(data.split(':')[2]);
    await chooseAcademicStudent(chatId, callbackQuery, index);
    return;
  }
  if (data.startsWith('academic:lapso:')) {
    const parts = data.split(':');
    const index = Number(parts[2]);
    const lapsoCode = parts[3] || 'L1';
    await showAcademicRecord(chatId, callbackQuery, index, lapsoCode);
    return;
  }

  if (data === 'grades:menu') {
    await showGradesMenu(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('grades:lapso:')) {
    await chooseGradesLapso(chatId, callbackQuery, data.split(':')[2]);
    return;
  }
  if (data.startsWith('grades:course:')) {
    const parts = data.split(':');
    await chooseGradesCourse(chatId, callbackQuery, parts[2], Number(parts[3]));
    return;
  }
  if (data === 'grades:changeCourse') {
    const state = gradesState.get(String(chatId));
    if (state?.lapso) await chooseGradesLapso(chatId, callbackQuery, gradesLapsoCode(state.lapso));
    else await showGradesMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'grades:courseMenu') {
    pendingTextMode.delete(String(chatId));
    await showGradesCourseMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'grades:activities') {
    pendingTextMode.delete(String(chatId));
    await showGradesActivities(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('grades:activity:')) {
    await openGradesActivity(chatId, callbackQuery, Number(data.split(':')[2]));
    return;
  }
  if (data === 'grades:enter') {
    await requestGradesEntry(chatId, callbackQuery);
    return;
  }
  if (data === 'grades:create') {
    await startGradesActivityCreation(chatId, callbackQuery);
    return;
  }
  if (data === 'grades:summary') {
    pendingTextMode.delete(String(chatId));
    await showGradesSummary(chatId, callbackQuery);
    return;
  }

  if (data === 'teacherTime:menu') {
    await showTeacherTimeMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'teacherTime:arrival') {
    await registerTeacherArrival(chatId, callbackQuery);
    return;
  }
  if (data === 'teacherTime:exit') {
    await registerTeacherExit(chatId, callbackQuery);
    return;
  }
  if (data === 'teacherTime:summary') {
    await showTeacherTimeSummary(chatId, callbackQuery);
    return;
  }
  if (data === 'teacherTime:absence') {
    await sendMessage(
      chatId,
      `🚫 <b>Informar ausencia</b>\n\nEscribe el comando seguido del motivo:\n<code>/ausencia Reposo médico</code>`,
      { reply_markup: teacherTimeKeyboard() },
    );
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
  if (data === 'records:menu') {
    await showRecordsMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'records:create') {
    await startRecordCreation(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('records:create:student:')) {
    const index = Number(data.split(':')[3]);
    await selectRecordStudent(chatId, callbackQuery, index);
    return;
  }
  if (data.startsWith('records:create:type:')) {
    const type = data.split(':').slice(3).join(':');
    await selectRecordType(chatId, callbackQuery, type);
    return;
  }
  if (data === 'records:create:save') {
    await confirmRecord(chatId, callbackQuery, false);
    return;
  }
  if (data === 'records:create:save-email') {
    await confirmRecord(chatId, callbackQuery, true);
    return;
  }
  if (data === 'records:create:cancel') {
    await cancelRecordCreation(chatId, callbackQuery);
    return;
  }

  if (data === 'records:list') {
    await showRecordsList(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('records:type:')) {
    const index = Number(data.split(':')[2]);
    const types = recordsTypeCache.get(String(chatId)) || [];
    const type = types[index] || '';
    await showRecordsList(chatId, callbackQuery, type);
    return;
  }
  if (data.startsWith('records:open:')) {
    const index = Number(data.split(':')[2]);
    await showRecordDetail(chatId, callbackQuery, index);
    return;
  }

  if (data === 'system:diagnostic') {
    await showSystemDiagnostic(chatId, callbackQuery);
    return;
  }
  if (data === 'system:security') {
    await showSecurityStatus(chatId, callbackQuery);
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
  if (data === 'stats:menu') {
    await showStatsMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'stats:day') {
    await showStatsResult(chatId, callbackQuery, 'dia');
    return;
  }
  if (data === 'stats:week') {
    await showStatsResult(chatId, callbackQuery, 'semana');
    return;
  }
  if (data === 'stats:month') {
    await showStatsResult(chatId, callbackQuery, 'mes');
    return;
  }
  if (data === 'stats:ranking') {
    await showAbsenceRanking(chatId, callbackQuery);
    return;
  }
  if (data === 'reports:menu') {
    await showReportsMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'reports:day') {
    await generateAndSendReport(chatId, callbackQuery, 'dia');
    return;
  }
  if (data === 'reports:week') {
    await generateAndSendReport(chatId, callbackQuery, 'semana');
    return;
  }
  if (data === 'reports:month') {
    await generateAndSendReport(chatId, callbackQuery, 'mes');
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
        status: 'phase5.3-cierre-lapso-ready',
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
