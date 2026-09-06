/* EDUGESTION_TELEGRAM_NOTAS_CONTROL_ESTUDIO_FASE1_V1 */
const BOT_API_BASE = 'https://api.telegram.org';
const MAX_TELEGRAM_MESSAGE = 3900;
const pendingTextMode = new Map();



const studyControlState = new Map();

function studyControlLapsoKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '1️⃣ 1er Lapso', callback_data: 'studyControl:lapso:L1' },
        { text: '2️⃣ 2do Lapso', callback_data: 'studyControl:lapso:L2' },
      ],
      [{ text: '3️⃣ 3er Lapso', callback_data: 'studyControl:lapso:L3' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

function studyControlCoursesKeyboard(courses = [], lapsoCode = 'L1') {
  const rows = courses.slice(0, 30).map((course, index) => [{
    text: `${course.ano || ''} · Sección ${course.seccion || ''}${course.turno ? ` · ${course.turno}` : ''}`.slice(0, 60),
    callback_data: `studyControl:course:${lapsoCode}:${index}`,
  }]);
  rows.push([{ text: '🔄 Cambiar lapso', callback_data: 'studyControl:menu' }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function studyControlSectionKeyboard(students = []) {
  const rows = students.slice(0, 30).map((student, index) => [{
    text: `${index + 1}. ${student.alumno || 'Estudiante'}${student.notaFinal === null || student.notaFinal === undefined ? '' : ` · ${Number(student.notaFinal).toFixed(2)}/20`}`.slice(0, 60),
    callback_data: `studyControl:student:${index}`,
  }]);
  rows.push([{ text: '🔄 Elegir otro curso', callback_data: 'studyControl:backCourses' }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function studyControlStudentKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '⬅️ Volver a la sección', callback_data: 'studyControl:section' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

const closureHistoryState = new Map();

function closureHistoryListKeyboard(items = []) {
  const rows = items.slice(0, 30).map((item, index) => [{
    text: `${item.enviado ? '✅' : '🕓'} ${item.lapso || 'Lapso'} · ${item.ano || ''} ${item.seccion || ''}`.slice(0, 60),
    callback_data: `closureHistory:detail:${index}`,
  }]);
  rows.push([{ text: '🔄 Actualizar', callback_data: 'closureHistory:menu' }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function closureHistoryDetailKeyboard(index, enviado) {
  return {
    inline_keyboard: [
      [{
        text: enviado ? '🕓 Marcar pendiente' : '✅ Marcar enviado',
        callback_data: `closureHistory:toggle:${Number(index)}`,
      }],
      [{ text: '⬅️ Volver al historial', callback_data: 'closureHistory:menu' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

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
      { text: '📚 Historial de cierres', callback_data: 'closureHistory:menu' },
    ]);
    rows.push([
      { text: '📊 Control de Estudio', callback_data: 'studyControl:menu' },
    ]);
    rows.push([
      { text: '👤 Mi perfil docente', callback_data: 'teacherProfile:menu' },
    ]);
    rows.push([
      { text: '🤖 Asistente IA', callback_data: 'teacherAI:menu' },
    ]);
    rows.push([
      { text: '🧠 Evaluaciones IA', callback_data: 'evalAI:menu' },
      { text: '📚 Biblioteca evaluaciones', callback_data: 'evalLibrary:menu' },
    ]);
    rows.push([
      { text: '📘 Cuadernillo EF', callback_data: 'curriculumEF:menu' },
      { text: '📈 Seguimiento curricular', callback_data: 'currTrack:menu' },
    ]);
    rows.push([
      { text: '📅 Panel por lapso', callback_data: 'currPanel:menu' },
      { text: '📊 Panel anual', callback_data: 'currPanel:annualMenu' },
    ]);
    rows.push([
      { text: '🗓️ Calendario docente', callback_data: 'teacherCalendar:menu' },
      { text: '📚 Biblioteca digital', callback_data: 'digitalLibrary:menu' },
    ]);
    rows.push([
      { text: '💾 Respuestas IA guardadas', callback_data: 'savedAI:menu' },
    ]);
    rows.push([
      { text: '🏫 Dirección', callback_data: 'director:menu' },
    ]);
    rows.push([
      { text: '🔔 Alertas', callback_data: 'alerts:menu' },
          { text: '💬 Chat interno', callback_data: 'chat:menu' },
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















function alertPriorityIcon(priority) {
  const p = String(priority || '').toUpperCase();
  if (p === 'ALTA') return '🔴';
  if (p === 'MEDIA') return '🟠';
  return '🟡';
}

function alertTypeIcon(type) {
  return ({
    EVENTO_HOY: '📅',
    EVENTO_PROXIMO: '🗓️',
    CIERRE_PENDIENTE: '📦',
    ASISTENCIA_ESTUDIANTE: '👨‍🎓',
  })[String(type || '').toUpperCase()] || '🔔';
}

function alertsMainKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📋 Ver todas', callback_data: 'alerts:list' }],
      [{ text: '🔴 Prioridad alta', callback_data: 'alerts:high' }],
      [{ text: '📊 Resumen', callback_data: 'alerts:summary' }],
      [{ text: '🔄 Actualizar', callback_data: 'alerts:menu' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

function alertsListKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '🔴 Solo prioridad alta', callback_data: 'alerts:high' }],
      [{ text: '📊 Resumen', callback_data: 'alerts:summary' }],
      [{ text: '⬅️ Alertas', callback_data: 'alerts:menu' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

async function showAlertsMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botAlertasContexto', { telegramId });

  await sendMessage(
    chatId,
    `🔔 <b>CENTRO DE ALERTAS</b>
━━━━━━━━━━━━━━━━━━

Alertas activas: <b>${Number(result.total || 0)}</b>

🔴 Prioridad alta: <b>${Number(result.altas || 0)}</b>
🟠 Prioridad media: <b>${Number(result.medias || 0)}</b>
🟡 Prioridad baja: <b>${Number(result.bajas || 0)}</b>

Se revisan automáticamente:
• calendario docente;
• cierres de lapso pendientes;
• seguimiento de asistencia.`,
    { reply_markup: alertsMainKeyboard() },
  );
}

async function showAlertsList(chatId, source, filter = {}) {
  const telegramId = teacherTelegramId(source);

  const result = await callEduGestion('botAlertasListar', {
    telegramId,
    tipo: filter.tipo || '',
    prioridad: filter.prioridad || '',
  });

  const alerts = Array.isArray(result.alertas) ? result.alertas : [];

  if (!alerts.length) {
    await sendMessage(
      chatId,
      filter.prioridad === 'ALTA'
        ? '✅ No tienes alertas de prioridad alta en este momento.'
        : '✅ No tienes alertas pendientes en este momento.',
      { reply_markup: alertsMainKeyboard() },
    );
    return;
  }

  const blocks = alerts.slice(0, 30).map((a, index) => {
    const fecha = [a.fecha, a.hora].filter(Boolean).join(' · ');
    const context = [a.grado, a.seccion, a.lapso].filter(Boolean).join(' · ');

    return `${index + 1}. ${alertPriorityIcon(a.prioridad)} ${alertTypeIcon(a.tipo)} <b>${escapeHtml(a.titulo || 'Alerta')}</b>
${escapeHtml(a.mensaje || '')}${fecha ? `\n📆 ${escapeHtml(fecha)}` : ''}${context ? `\n📚 ${escapeHtml(context)}` : ''}
<small>Origen: ${escapeHtml(a.origen || 'EduGestión')}</small>`;
  });

  const title = filter.prioridad === 'ALTA'
    ? '🔴 <b>ALERTAS DE PRIORIDAD ALTA</b>'
    : '📋 <b>ALERTAS ACTIVAS</b>';

  await sendLongTelegramText(
    chatId,
    `${title}
━━━━━━━━━━━━━━━━━━

Total: <b>${Number(result.total || alerts.length)}</b>`,
    blocks.join('\n\n'),
    alertsListKeyboard(),
  );
}

async function showAlertsSummary(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botAlertasResumen', { telegramId });
  const r = result.resumen || {};

  await sendMessage(
    chatId,
    `📊 <b>RESUMEN DE ALERTAS</b>
━━━━━━━━━━━━━━━━━━

Total activas: <b>${Number(r.total || 0)}</b>

🔴 Prioridad alta: <b>${Number(r.altas || 0)}</b>
🟠 Prioridad media: <b>${Number(r.medias || 0)}</b>

📅 Eventos de hoy: <b>${Number(r.eventosHoy || 0)}</b>
🗓️ Eventos próximos: <b>${Number(r.eventosProximos || 0)}</b>
📦 Cierres pendientes: <b>${Number(r.cierresPendientes || 0)}</b>
👨‍🎓 Seguimientos de asistencia: <b>${Number(r.seguimientoAsistencia || 0)}</b>`,
    { reply_markup: alertsMainKeyboard() },
  );
}

const directorState = new Map();

function directorMainKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '👩‍🏫 Profesores', callback_data: 'director:teachers' }],
      [{ text: '📊 Resumen institucional', callback_data: 'director:summary' }],
      [{ text: '🔎 Buscar profesor', callback_data: 'director:search' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

function directorTeachersKeyboard(docentes = []) {
  const rows = docentes.slice(0, 40).map((d) => [{
    text: `${d.activo ? '🟢' : '🔴'} ${d.nombre || d.usuario || 'Docente'}`.slice(0, 60),
    callback_data: `director:teacher:${d.id}`,
  }]);
  rows.push([{ text: '🔎 Buscar profesor', callback_data: 'director:search' }]);
  rows.push([{ text: '📊 Resumen institucional', callback_data: 'director:summary' }]);
  rows.push([{ text: '⬅️ Dirección', callback_data: 'director:menu' }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function directorTeacherDetailKeyboard(id) {
  return {
    inline_keyboard: [
      [{ text: '⬅️ Volver a profesores', callback_data: 'director:teachers' }],
      [{ text: '📊 Resumen institucional', callback_data: 'director:summary' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

async function showDirectorMenu(chatId, source) {
  try {
    const telegramId = teacherTelegramId(source);
    const result = await callEduGestion('botDirectorContexto', { telegramId });

    await sendMessage(
      chatId,
      `🏫 <b>DIRECCIÓN · EDUGESTIÓN</b>
━━━━━━━━━━━━━━━━━━

👤 Director: <b>${escapeHtml(result.director?.nombre || result.director?.usuario || 'Dirección')}</b>

👩‍🏫 Profesores registrados: <b>${Number(result.totalDocentes || 0)}</b>
🟢 Activos: <b>${Number(result.docentesActivos || 0)}</b>
🔴 Inactivos: <b>${Number(result.docentesInactivos || 0)}</b>

🔒 Modo institucional de <b>solo lectura</b>.`,
      { reply_markup: directorMainKeyboard() },
    );
  } catch (err) {
    await sendMessage(
      chatId,
      `⛔ <b>ACCESO RESTRINGIDO</b>

Esta sección es exclusiva de una cuenta con rol <b>director</b> vinculada a Telegram.`,
      { reply_markup: { inline_keyboard: [[{ text: '☰ Todas las opciones', callback_data: 'menu' }]] } },
    );
  }
}

async function showDirectorTeachers(chatId, source, extra = {}) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botDirectorProfesores', {
    telegramId,
    busqueda: extra.busqueda || '',
    estado: extra.estado || '',
    materia: extra.materia || '',
  });

  const docentes = Array.isArray(result.docentes) ? result.docentes : [];
  directorState.set(String(chatId), { ...(directorState.get(String(chatId)) || {}), docentes });

  if (!docentes.length) {
    await sendMessage(
      chatId,
      `👩‍🏫 <b>PROFESORES</b>

No encontré profesores con esos criterios.`,
      { reply_markup: directorMainKeyboard() },
    );
    return;
  }

  await sendMessage(
    chatId,
    `👩‍🏫 <b>PROFESORES · DIRECCIÓN</b>
━━━━━━━━━━━━━━━━━━

Resultados: <b>${Number(result.total || docentes.length)}</b>

🟢 Activo · 🔴 Inactivo

Selecciona un profesor para abrir su detalle institucional.`,
    { reply_markup: directorTeachersKeyboard(docentes) },
  );
}

async function showDirectorTeacherDetail(chatId, source, idProfesor) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botDirectorDetalleProfesor', { telegramId, idProfesor });

  const d = result.docente || {};
  const estudiantes = Array.isArray(result.estudiantes) ? result.estudiantes : [];
  const asistencia = Array.isArray(result.asistencia) ? result.asistencia : [];
  const evaluaciones = Array.isArray(result.evaluaciones) ? result.evaluaciones : [];
  const horarios = Array.isArray(result.horarios) ? result.horarios : [];
  const actas = Array.isArray(result.actas) ? result.actas : [];
  const auditoria = Array.isArray(result.auditoria) ? result.auditoria : [];

  directorState.set(String(chatId), { ...(directorState.get(String(chatId)) || {}), profesor: d });

  const assignment = [d.seccion, d.turno].filter(Boolean).join(' · ') || 'Sin asignar';

  const msg = `👤 <b>DETALLE DEL PROFESOR</b>
━━━━━━━━━━━━━━━━━━

<b>${escapeHtml(d.nombre || d.usuario || 'Docente')}</b>
${d.usuario ? `Usuario: <code>${escapeHtml(d.usuario)}</code>\n` : ''}${d.email ? `Correo: ${escapeHtml(d.email)}\n` : ''}
Materia: <b>${escapeHtml(d.materia || 'Sin asignar')}</b>
Asignación: <b>${escapeHtml(assignment)}</b>
Estado: <b>${d.activo ? '🟢 Activo' : '🔴 Inactivo'}</b>

📚 Estudiantes: <b>${Number(d.estudiantes ?? estudiantes.length)}</b>
✅ Asistencia: <b>${Number(d.porcentajeAsistencia || 0)}%</b>
🟢 Presentes: <b>${Number(d.presentes || 0)}</b>
🔴 Ausentes: <b>${Number(d.ausentes || 0)}</b>
🟠 Tardanzas: <b>${Number(d.tardanzas || 0)}</b>
🔵 Justificados: <b>${Number(d.justificados || 0)}</b>

📝 Evaluaciones: <b>${Number(d.evaluaciones ?? evaluaciones.length)}</b>
🗓️ Bloques de horario: <b>${Number(d.bloquesHorario ?? horarios.length)}</b>
📄 Actas: <b>${Number(d.actas ?? actas.length)}</b>
🕘 Movimientos de auditoría: <b>${Number(d.movimientosAuditoria ?? auditoria.length)}</b>

🔒 Consulta de solo lectura.`;

  await sendMessage(chatId, msg, { reply_markup: directorTeacherDetailKeyboard(d.id || idProfesor) });
}

async function showDirectorSummary(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botDirectorResumenInstitucional', { telegramId });
  const r = result.resumen || {};

  await sendMessage(
    chatId,
    `📊 <b>RESUMEN INSTITUCIONAL</b>
━━━━━━━━━━━━━━━━━━

👩‍🏫 Profesores: <b>${Number(r.docentes || 0)}</b>
🟢 Activos: <b>${Number(r.docentesActivos || 0)}</b>
🔴 Inactivos: <b>${Number(r.docentesInactivos || 0)}</b>

👨‍🎓 Estudiantes: <b>${Number(r.estudiantes || 0)}</b>

📋 Registros de asistencia: <b>${Number(r.registrosAsistencia || 0)}</b>
✅ Asistencia general: <b>${Number(r.porcentajeAsistencia || 0)}%</b>
🟢 Presentes: <b>${Number(r.presentes || 0)}</b>
🔴 Ausentes: <b>${Number(r.ausentes || 0)}</b>
🟠 Tardanzas: <b>${Number(r.tardanzas || 0)}</b>
🔵 Justificados: <b>${Number(r.justificados || 0)}</b>

📝 Evaluaciones: <b>${Number(r.evaluaciones || 0)}</b>
🗓️ Bloques de horario: <b>${Number(r.bloquesHorario || 0)}</b>
📄 Actas: <b>${Number(r.actas || 0)}</b>
🕘 Auditoría: <b>${Number(r.movimientosAuditoria || 0)}</b>

🔒 Información institucional en modo de solo lectura.`,
    { reply_markup: directorMainKeyboard() },
  );
}

async function startDirectorSearch(chatId) {
  pendingTextMode.set(String(chatId), 'director-search');

  await sendMessage(
    chatId,
    `🔎 <b>BUSCAR PROFESOR</b>

Escribe el nombre, usuario, correo, materia, sección o turno.

Para cancelar escribe <code>cancelar</code>.`,
  );
}

async function handleDirectorText(chatId, source, text, mode) {
  if (mode !== 'director-search') return false;

  const raw = String(text || '').trim();

  if (raw.toLowerCase() === 'cancelar') {
    pendingTextMode.delete(String(chatId));
    await showDirectorMenu(chatId, source);
    return true;
  }

  if (!raw) {
    await sendMessage(chatId, '⚠️ Escribe un dato para buscar al profesor.');
    return true;
  }

  pendingTextMode.delete(String(chatId));
  await showDirectorTeachers(chatId, source, { busqueda: raw });
  return true;
}

const savedAIState = new Map();

function savedAIMainKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📚 Ver respuestas guardadas', callback_data: 'savedAI:list' }],
      [{ text: '🔎 Buscar respuestas', callback_data: 'savedAI:search' }],
      [{ text: '📊 Resumen', callback_data: 'savedAI:summary' }],
      [{ text: '🤖 Abrir Asistente IA', callback_data: 'teacherAI:menu' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

function savedAIListKeyboard(items = []) {
  const rows = items.slice(0, 30).map((item) => [{
    text: `${savedAITypeIcon(item.tipo)} ${item.titulo || 'Respuesta IA'}`.slice(0, 60),
    callback_data: `savedAI:item:${item.id}`,
  }]);
  rows.push([{ text: '🔎 Buscar', callback_data: 'savedAI:search' }]);
  rows.push([{ text: '📊 Resumen', callback_data: 'savedAI:summary' }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function savedAIDetailKeyboard(id) {
  return {
    inline_keyboard: [
      [{ text: '♻️ Reutilizar con IA', callback_data: `savedAI:reuse:${id}` }],
      [{ text: '🗑️ Eliminar', callback_data: `savedAI:deleteAsk:${id}` }],
      [{ text: '⬅️ Volver a respuestas', callback_data: 'savedAI:list' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

function savedAITypeIcon(tipo) {
  return ({
    'Consulta libre': '💬',
    'Planificación': '📋',
    'Actividad': '🎯',
    'Observación pedagógica': '📝',
    'Evaluación': '🧠',
    'Cuadernillo': '📘',
    'Otro': '✨',
  })[tipo] || '✨';
}

function savedAIInferTypeFromTitle(title = '') {
  const t = String(title || '').toLowerCase();
  if (t.includes('planific')) return 'Planificación';
  if (t.includes('actividad')) return 'Actividad';
  if (t.includes('observ')) return 'Observación pedagógica';
  if (t.includes('evalu')) return 'Evaluación';
  if (t.includes('cuadernillo') || t.includes('curricular')) return 'Cuadernillo';
  return 'Consulta libre';
}

function savedAIMakeTitle(text = '', fallback = 'Respuesta IA guardada') {
  const clean = String(text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[*_`#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return (clean || fallback).slice(0, 110);
}

async function saveAIResponseToBackend(chatId, source, data = {}) {
  const telegramId = teacherTelegramId(source);

  const payload = {
    telegramId,
    titulo: String(data.titulo || '').trim() || savedAIMakeTitle(data.consulta || data.tema || data.respuesta),
    tipo: data.tipo || savedAIInferTypeFromTitle(data.titulo || data.origen || ''),
    consulta: String(data.consulta || '').trim(),
    respuesta: String(data.respuesta || '').trim(),
    materia: String(data.materia || '').trim(),
    grado: String(data.grado || '').trim(),
    tema: String(data.tema || '').trim(),
    origen: String(data.origen || 'Telegram').trim(),
  };

  if (!payload.respuesta) {
    await sendMessage(chatId, '⚠️ No hay una respuesta de IA disponible para guardar.');
    return null;
  }

  const result = await callEduGestion('botRespuestasIAGuardar', payload);
  const r = result.registro || {};

  await sendMessage(
    chatId,
    `💾 <b>RESPUESTA IA GUARDADA</b>
━━━━━━━━━━━━━━━━━━

${savedAITypeIcon(r.tipo)} <b>${escapeHtml(r.titulo || payload.titulo)}</b>

Tipo: <b>${escapeHtml(r.tipo || payload.tipo)}</b>
${r.materia ? `Materia: <b>${escapeHtml(r.materia)}</b>\n` : ''}${r.grado ? `Grado/Año: <b>${escapeHtml(r.grado)}</b>\n` : ''}${r.tema ? `Tema: <b>${escapeHtml(r.tema)}</b>\n` : ''}`,
    { reply_markup: savedAIMainKeyboard() },
  );

  return r;
}

async function showSavedAIMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  await callEduGestion('botRespuestasIAContexto', { telegramId });

  await sendMessage(
    chatId,
    `💾 <b>RESPUESTAS IA GUARDADAS</b>
━━━━━━━━━━━━━━━━━━

Consulta, busca y reutiliza las respuestas que has guardado desde el Asistente IA de EduGestión.`,
    { reply_markup: savedAIMainKeyboard() },
  );
}

async function showSavedAIList(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botRespuestasIAListar', { telegramId });
  const items = Array.isArray(result.registros) ? result.registros : [];

  if (!items.length) {
    await sendMessage(
      chatId,
      `📚 <b>RESPUESTAS IA GUARDADAS</b>

Todavía no tienes respuestas guardadas.`,
      { reply_markup: savedAIMainKeyboard() },
    );
    return;
  }

  await sendMessage(
    chatId,
    `📚 <b>RESPUESTAS IA GUARDADAS</b>
━━━━━━━━━━━━━━━━━━

Total: <b>${Number(result.total || items.length)}</b>

Selecciona una respuesta para ver el detalle:`,
    { reply_markup: savedAIListKeyboard(items) },
  );
}

async function showSavedAIItem(chatId, source, id) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botRespuestasIADetalle', { telegramId, id });
  const r = result.registro || {};

  savedAIState.set(String(chatId), { id, registro: r });

  const head = `${savedAITypeIcon(r.tipo)} <b>${escapeHtml(r.titulo || 'Respuesta IA')}</b>
━━━━━━━━━━━━━━━━━━

Tipo: <b>${escapeHtml(r.tipo || 'Otro')}</b>
${r.materia ? `Materia: <b>${escapeHtml(r.materia)}</b>\n` : ''}${r.grado ? `Grado/Año: <b>${escapeHtml(r.grado)}</b>\n` : ''}${r.tema ? `Tema: <b>${escapeHtml(r.tema)}</b>\n` : ''}${r.consulta ? `\n<b>Consulta original</b>\n${escapeHtml(r.consulta)}\n` : ''}

<b>Respuesta</b>`;

  await sendLongTelegramText(
    chatId,
    head,
    r.respuesta || 'Sin contenido.',
    savedAIDetailKeyboard(r.id),
  );
}

async function startSavedAISearch(chatId) {
  pendingTextMode.set(String(chatId), 'saved-ai-search');

  await sendMessage(
    chatId,
    `🔎 <b>BUSCAR RESPUESTAS IA</b>

Escribe una palabra o frase.

Puedes buscar por título, consulta, respuesta, materia, grado o tema.

Para cancelar escribe <code>cancelar</code>.`,
  );
}

async function handleSavedAIText(chatId, source, text, mode) {
  const raw = String(text || '').trim();

  if (mode === 'saved-ai-search') {
    if (raw.toLowerCase() === 'cancelar') {
      pendingTextMode.delete(String(chatId));
      await showSavedAIMenu(chatId, source);
      return true;
    }

    if (!raw) {
      await sendMessage(chatId, '⚠️ Escribe una palabra o frase para buscar.');
      return true;
    }

    const telegramId = teacherTelegramId(source);
    const result = await callEduGestion('botRespuestasIABuscar', {
      telegramId,
      busqueda: raw,
    });

    pendingTextMode.delete(String(chatId));

    const items = Array.isArray(result.registros) ? result.registros : [];

    if (!items.length) {
      await sendMessage(
        chatId,
        `🔎 No encontré respuestas para <b>${escapeHtml(raw)}</b>.`,
        { reply_markup: savedAIMainKeyboard() },
      );
      return true;
    }

    await sendMessage(
      chatId,
      `🔎 <b>RESULTADOS DE BÚSQUEDA</b>

Búsqueda: <b>${escapeHtml(raw)}</b>
Resultados: <b>${Number(result.total || items.length)}</b>`,
      { reply_markup: savedAIListKeyboard(items) },
    );
    return true;
  }

  if (mode === 'saved-ai-reuse') {
    const state = savedAIState.get(String(chatId)) || {};
    const registro = state.registro || {};

    if (!registro.respuesta) {
      pendingTextMode.delete(String(chatId));
      await sendMessage(chatId, '⚠️ No pude recuperar la respuesta guardada.');
      return true;
    }

    if (raw.toLowerCase() === 'cancelar') {
      pendingTextMode.delete(String(chatId));
      await showSavedAIItem(chatId, source, registro.id);
      return true;
    }

    const prompt = [
      'Actúa como asistente docente.',
      'Reutiliza y adapta la siguiente respuesta previamente guardada por el docente.',
      'No realices búsqueda web.',
      '',
      registro.consulta ? `Consulta original: ${registro.consulta}` : '',
      registro.materia ? `Materia: ${registro.materia}` : '',
      registro.grado ? `Grado/Año: ${registro.grado}` : '',
      registro.tema ? `Tema: ${registro.tema}` : '',
      '',
      'RESPUESTA GUARDADA:',
      registro.respuesta,
      '',
      'NUEVA INDICACIÓN DEL DOCENTE:',
      raw || 'Mejora y adapta esta respuesta manteniendo su propósito.',
      '',
      'Entrega una versión completa y lista para usar.'
    ].filter(Boolean).join('\n');

    await sendMessage(chatId, '⏳ <b>Reutilizando respuesta con IA…</b>');

    const answer = await callTeacherGemini(prompt);
    pendingTextMode.delete(String(chatId));

    savedAIState.set(String(chatId), {
      ...state,
      reusedAnswer: answer,
      reuseInstruction: raw,
    });

    await sendLongTelegramText(
      chatId,
      '♻️ <b>RESPUESTA REUTILIZADA CON IA</b>',
      answer,
      {
        inline_keyboard: [
          [{ text: '💾 Guardar nueva respuesta', callback_data: 'savedAI:saveReuse' }],
          [{ text: '📚 Ver guardadas', callback_data: 'savedAI:list' }],
          [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
        ],
      },
    );
    return true;
  }

  return false;
}

async function reuseSavedAIItem(chatId, source, id) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botRespuestasIADetalle', { telegramId, id });
  const registro = result.registro || {};

  savedAIState.set(String(chatId), { id, registro });
  pendingTextMode.set(String(chatId), 'saved-ai-reuse');

  await sendMessage(
    chatId,
    `♻️ <b>REUTILIZAR CON IA</b>

Escribe cómo deseas modificar o adaptar esta respuesta.

Ejemplos:
<code>Hazla más corta</code>
<code>Adáptala para 1ero A</code>
<code>Conviértela en una actividad práctica</code>

Para cancelar escribe <code>cancelar</code>.`,
  );
}

async function saveReusedAIItem(chatId, source) {
  const state = savedAIState.get(String(chatId)) || {};
  const registro = state.registro || {};
  const answer = state.reusedAnswer || '';

  if (!answer) {
    await sendMessage(chatId, '⚠️ No hay una respuesta reutilizada para guardar.');
    return;
  }

  await saveAIResponseToBackend(chatId, source, {
    titulo: `${registro.titulo || 'Respuesta IA'} · reutilizada`,
    tipo: registro.tipo || 'Otro',
    consulta: state.reuseInstruction || registro.consulta || '',
    respuesta: answer,
    materia: registro.materia || '',
    grado: registro.grado || '',
    tema: registro.tema || '',
    origen: 'Telegram · Reutilizada',
  });
}

async function deleteSavedAIItem(chatId, source, id) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botRespuestasIAEliminar', { telegramId, id });

  await sendMessage(
    chatId,
    `🗑️ <b>RESPUESTA ELIMINADA</b>

${escapeHtml(result.titulo || '')}`,
    { reply_markup: savedAIMainKeyboard() },
  );
}

async function showSavedAISummary(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botRespuestasIAResumen', { telegramId });
  const t = result.porTipo || {};

  await sendMessage(
    chatId,
    `📊 <b>RESUMEN · RESPUESTAS IA</b>
━━━━━━━━━━━━━━━━━━

Total guardadas: <b>${Number(result.total || 0)}</b>

💬 Consulta libre: <b>${Number(t['Consulta libre'] || 0)}</b>
📋 Planificación: <b>${Number(t['Planificación'] || 0)}</b>
🎯 Actividad: <b>${Number(t['Actividad'] || 0)}</b>
📝 Observación pedagógica: <b>${Number(t['Observación pedagógica'] || 0)}</b>
🧠 Evaluación: <b>${Number(t['Evaluación'] || 0)}</b>
📘 Cuadernillo: <b>${Number(t['Cuadernillo'] || 0)}</b>
✨ Otro: <b>${Number(t['Otro'] || 0)}</b>`,
    { reply_markup: savedAIMainKeyboard() },
  );
}

const digitalLibraryDraft = new Map();

function digitalLibraryMainKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '➕ Guardar recurso', callback_data: 'digitalLibrary:create' }],
      [{ text: '🔎 Buscar recurso', callback_data: 'digitalLibrary:search' }],
      [{ text: '📋 Ver biblioteca', callback_data: 'digitalLibrary:list' }],
      [{ text: '📊 Resumen', callback_data: 'digitalLibrary:summary' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

function digitalLibraryTypesKeyboard() {
  const items = [
    ['📄 Documento', 'Documento'],
    ['🔗 Enlace', 'Enlace'],
    ['🎬 Video', 'Video'],
    ['🖼️ Imagen', 'Imagen'],
    ['🎧 Audio', 'Audio'],
    ['📝 Otro', 'Otro'],
  ];
  return {
    inline_keyboard: [
      ...items.map(([label, value]) => [{
        text: label,
        callback_data: `digitalLibrary:type:${encodeURIComponent(value)}`,
      }]),
      [{ text: '⬅️ Volver', callback_data: 'digitalLibrary:menu' }],
    ],
  };
}

function digitalLibraryCategoriesKeyboard() {
  const items = [
    ['🗂️ Planificación', 'Planificación'],
    ['🧠 Evaluación', 'Evaluación'],
    ['🎯 Actividad', 'Actividad'],
    ['🧰 Recurso didáctico', 'Recurso didáctico'],
    ['📜 Normativa', 'Normativa'],
    ['📝 Otro', 'Otro'],
  ];
  return {
    inline_keyboard: [
      ...items.map(([label, value]) => [{
        text: label,
        callback_data: `digitalLibrary:category:${encodeURIComponent(value)}`,
      }]),
      [{ text: '⬅️ Volver', callback_data: 'digitalLibrary:menu' }],
    ],
  };
}

function digitalLibraryListKeyboard(items = []) {
  const rows = items.slice(0, 30).map((item) => [{
    text: `${digitalLibraryTypeIcon(item.tipo)} ${item.titulo || 'Recurso'}`.slice(0, 60),
    callback_data: `digitalLibrary:item:${item.id}`,
  }]);
  rows.push([{ text: '➕ Guardar recurso', callback_data: 'digitalLibrary:create' }]);
  rows.push([{ text: '🔎 Buscar', callback_data: 'digitalLibrary:search' }]);
  rows.push([{ text: '📊 Resumen', callback_data: 'digitalLibrary:summary' }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function digitalLibraryDetailKeyboard(id, url) {
  const rows = [];
  if (url) rows.push([{ text: '🔗 Abrir enlace', url }]);
  rows.push([{ text: '🗑️ Eliminar recurso', callback_data: `digitalLibrary:deleteAsk:${id}` }]);
  rows.push([{ text: '⬅️ Ver biblioteca', callback_data: 'digitalLibrary:list' }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function digitalLibraryTypeIcon(tipo) {
  return ({
    Documento: '📄',
    Enlace: '🔗',
    Video: '🎬',
    Imagen: '🖼️',
    Audio: '🎧',
    Otro: '📝',
  })[tipo] || '📝';
}

async function showDigitalLibraryMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  await callEduGestion('botBibliotecaContexto', { telegramId });

  await sendMessage(
    chatId,
    `📚 <b>BIBLIOTECA DIGITAL DOCENTE</b>
━━━━━━━━━━━━━━━━━━

Guarda, organiza y consulta tus materiales, documentos, enlaces y recursos docentes desde Telegram.`,
    { reply_markup: digitalLibraryMainKeyboard() },
  );
}

async function startDigitalLibraryCreate(chatId) {
  digitalLibraryDraft.set(String(chatId), {});
  pendingTextMode.delete(String(chatId));

  await sendMessage(
    chatId,
    `➕ <b>GUARDAR RECURSO</b>

Selecciona el tipo de recurso:`,
    { reply_markup: digitalLibraryTypesKeyboard() },
  );
}

async function chooseDigitalLibraryType(chatId, type) {
  const draft = digitalLibraryDraft.get(String(chatId)) || {};
  draft.tipo = type;
  digitalLibraryDraft.set(String(chatId), draft);

  await sendMessage(
    chatId,
    `${digitalLibraryTypeIcon(type)} Tipo seleccionado: <b>${escapeHtml(type)}</b>

Ahora selecciona la categoría:`,
    { reply_markup: digitalLibraryCategoriesKeyboard() },
  );
}

async function chooseDigitalLibraryCategory(chatId, category) {
  const draft = digitalLibraryDraft.get(String(chatId)) || {};
  draft.categoria = category;
  digitalLibraryDraft.set(String(chatId), draft);
  pendingTextMode.set(String(chatId), 'library-title');

  await sendMessage(
    chatId,
    `🗂️ Categoría: <b>${escapeHtml(category)}</b>

Escribe el <b>título</b> del recurso.

Para cancelar escribe <code>cancelar</code>.`,
  );
}

async function handleDigitalLibraryText(chatId, source, text, mode) {
  const draft = digitalLibraryDraft.get(String(chatId)) || {};
  const raw = String(text || '').trim();

  if (raw.toLowerCase() === 'cancelar') {
    pendingTextMode.delete(String(chatId));
    digitalLibraryDraft.delete(String(chatId));
    await showDigitalLibraryMenu(chatId, source);
    return true;
  }

  if (mode === 'library-title') {
    if (!raw) {
      await sendMessage(chatId, '⚠️ El título no puede quedar vacío.');
      return true;
    }
    draft.titulo = raw;
    digitalLibraryDraft.set(String(chatId), draft);
    pendingTextMode.set(String(chatId), 'library-url');
    await sendMessage(
      chatId,
      `Escribe el <b>enlace URL</b> del recurso.

Debe comenzar por <code>http://</code> o <code>https://</code>.

Si no tiene enlace, escribe <code>sin enlace</code>.`,
    );
    return true;
  }

  if (mode === 'library-url') {
    if (!/^sin enlace$/i.test(raw) && !/^https?:\/\/\S+$/i.test(raw)) {
      await sendMessage(chatId, '⚠️ El enlace debe comenzar por <code>http://</code> o <code>https://</code>, o escribe <code>sin enlace</code>.');
      return true;
    }
    draft.url = /^sin enlace$/i.test(raw) ? '' : raw;
    digitalLibraryDraft.set(String(chatId), draft);
    pendingTextMode.set(String(chatId), 'library-description');
    await sendMessage(chatId, 'Escribe una <b>descripción</b> o escribe <code>sin descripción</code>.');
    return true;
  }

  if (mode === 'library-description') {
    draft.descripcion = /^sin descripci[oó]n$/i.test(raw) ? '' : raw;
    digitalLibraryDraft.set(String(chatId), draft);
    pendingTextMode.set(String(chatId), 'library-grade');
    await sendMessage(chatId, 'Escribe el <b>grado/año</b> o escribe <code>sin grado</code>.');
    return true;
  }

  if (mode === 'library-grade') {
    draft.grado = /^sin grado$/i.test(raw) ? '' : raw;
    digitalLibraryDraft.set(String(chatId), draft);
    pendingTextMode.set(String(chatId), 'library-matter');
    await sendMessage(chatId, 'Escribe la <b>materia</b> o escribe <code>usar mi materia</code>.');
    return true;
  }

  if (mode === 'library-matter') {
    draft.materia = /^usar mi materia$/i.test(raw) ? '' : raw;
    digitalLibraryDraft.set(String(chatId), draft);
    pendingTextMode.set(String(chatId), 'library-tags');
    await sendMessage(
      chatId,
      `Escribe algunas <b>etiquetas</b> separadas por comas.

Ejemplo:
<code>coordinación, equilibrio, 1ero</code>

Si no deseas etiquetas, escribe <code>sin etiquetas</code>.`,
    );
    return true;
  }

  if (mode === 'library-tags') {
    draft.etiquetas = /^sin etiquetas$/i.test(raw) ? '' : raw;

    const telegramId = teacherTelegramId(source);
    const result = await callEduGestion('botBibliotecaGuardar', {
      telegramId,
      ...draft,
    });

    pendingTextMode.delete(String(chatId));
    digitalLibraryDraft.delete(String(chatId));

    const r = result.recurso || {};

    await sendMessage(
      chatId,
      `✅ <b>RECURSO GUARDADO</b>
━━━━━━━━━━━━━━━━━━

${digitalLibraryTypeIcon(r.tipo)} <b>${escapeHtml(r.titulo || '')}</b>

Tipo: <b>${escapeHtml(r.tipo || '')}</b>
Categoría: <b>${escapeHtml(r.categoria || '')}</b>
${r.grado ? `Grado/Año: <b>${escapeHtml(r.grado)}</b>\n` : ''}${r.materia ? `Materia: <b>${escapeHtml(r.materia)}</b>\n` : ''}${r.url ? `Enlace: ${escapeHtml(r.url)}\n` : ''}${r.etiquetas ? `Etiquetas: <b>${escapeHtml(r.etiquetas)}</b>\n` : ''}${r.descripcion ? `\n📝 ${escapeHtml(r.descripcion)}` : ''}`,
      { reply_markup: digitalLibraryMainKeyboard() },
    );
    return true;
  }

  if (mode === 'library-search') {
    const telegramId = teacherTelegramId(source);
    const result = await callEduGestion('botBibliotecaBuscar', {
      telegramId,
      busqueda: raw,
    });

    pendingTextMode.delete(String(chatId));

    const items = Array.isArray(result.recursos) ? result.recursos : [];

    if (!items.length) {
      await sendMessage(
        chatId,
        `🔎 No encontré recursos para <b>${escapeHtml(raw)}</b>.`,
        { reply_markup: digitalLibraryMainKeyboard() },
      );
      return true;
    }

    await sendMessage(
      chatId,
      `🔎 <b>RESULTADOS DE BÚSQUEDA</b>

Búsqueda: <b>${escapeHtml(raw)}</b>
Resultados: <b>${Number(result.total || items.length)}</b>`,
      { reply_markup: digitalLibraryListKeyboard(items) },
    );
    return true;
  }

  return false;
}

async function startDigitalLibrarySearch(chatId) {
  pendingTextMode.set(String(chatId), 'library-search');

  await sendMessage(
    chatId,
    `🔎 <b>BUSCAR RECURSO</b>

Escribe una palabra o frase.

Puedes buscar por título, descripción, grado, materia o etiquetas.

Para cancelar escribe <code>cancelar</code>.`,
  );
}

async function showDigitalLibraryList(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botBibliotecaListar', { telegramId });
  const items = Array.isArray(result.recursos) ? result.recursos : [];

  if (!items.length) {
    await sendMessage(
      chatId,
      `📋 <b>BIBLIOTECA DIGITAL</b>

Todavía no tienes recursos guardados.`,
      { reply_markup: digitalLibraryMainKeyboard() },
    );
    return;
  }

  await sendMessage(
    chatId,
    `📋 <b>BIBLIOTECA DIGITAL</b>
━━━━━━━━━━━━━━━━━━

Total de recursos: <b>${Number(result.total || items.length)}</b>

Selecciona un recurso para ver el detalle:`,
    { reply_markup: digitalLibraryListKeyboard(items) },
  );
}

async function showDigitalLibraryItem(chatId, source, id) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botBibliotecaDetalle', { telegramId, id });
  const r = result.recurso || {};

  await sendMessage(
    chatId,
    `${digitalLibraryTypeIcon(r.tipo)} <b>${escapeHtml(r.titulo || '')}</b>
━━━━━━━━━━━━━━━━━━

Tipo: <b>${escapeHtml(r.tipo || '')}</b>
Categoría: <b>${escapeHtml(r.categoria || '')}</b>
${r.grado ? `Grado/Año: <b>${escapeHtml(r.grado)}</b>\n` : ''}${r.materia ? `Materia: <b>${escapeHtml(r.materia)}</b>\n` : ''}${r.etiquetas ? `Etiquetas: <b>${escapeHtml(r.etiquetas)}</b>\n` : ''}${r.descripcion ? `\n📝 ${escapeHtml(r.descripcion)}\n` : ''}${r.url ? `\n🔗 ${escapeHtml(r.url)}` : ''}`,
    { reply_markup: digitalLibraryDetailKeyboard(r.id, r.url) },
  );
}

async function deleteDigitalLibraryItem(chatId, source, id) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botBibliotecaEliminar', { telegramId, id });

  await sendMessage(
    chatId,
    `🗑️ <b>RECURSO ELIMINADO</b>

${escapeHtml(result.titulo || '')}`,
    { reply_markup: digitalLibraryMainKeyboard() },
  );
}

async function showDigitalLibrarySummary(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botBibliotecaResumen', { telegramId });

  const tipos = result.porTipo || {};
  const cats = result.porCategoria || {};

  await sendMessage(
    chatId,
    `📊 <b>RESUMEN DE LA BIBLIOTECA</b>
━━━━━━━━━━━━━━━━━━

Total de recursos: <b>${Number(result.total || 0)}</b>

<b>Por tipo</b>
📄 Documentos: <b>${Number(tipos.Documento || 0)}</b>
🔗 Enlaces: <b>${Number(tipos.Enlace || 0)}</b>
🎬 Videos: <b>${Number(tipos.Video || 0)}</b>
🖼️ Imágenes: <b>${Number(tipos.Imagen || 0)}</b>
🎧 Audios: <b>${Number(tipos.Audio || 0)}</b>
📝 Otros: <b>${Number(tipos.Otro || 0)}</b>

<b>Por categoría</b>
🗂️ Planificación: <b>${Number(cats['Planificación'] || 0)}</b>
🧠 Evaluación: <b>${Number(cats['Evaluación'] || 0)}</b>
🎯 Actividad: <b>${Number(cats.Actividad || 0)}</b>
🧰 Recurso didáctico: <b>${Number(cats['Recurso didáctico'] || 0)}</b>
📜 Normativa: <b>${Number(cats.Normativa || 0)}</b>
📝 Otros: <b>${Number(cats.Otro || 0)}</b>`,
    { reply_markup: digitalLibraryMainKeyboard() },
  );
}

const teacherCalendarDraft = new Map();

function teacherCalendarMainKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '➕ Crear evento', callback_data: 'teacherCalendar:create' }],
      [{ text: '📋 Ver eventos', callback_data: 'teacherCalendar:list' }],
      [{ text: '📊 Resumen', callback_data: 'teacherCalendar:summary' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

function teacherCalendarTypesKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📚 Actividad', callback_data: 'teacherCalendar:type:Actividad' }],
      [{ text: '🧠 Evaluación', callback_data: 'teacherCalendar:type:Evaluaci%C3%B3n' }],
      [{ text: '👥 Reunión', callback_data: 'teacherCalendar:type:Reuni%C3%B3n' }],
      [{ text: '⏰ Recordatorio', callback_data: 'teacherCalendar:type:Recordatorio' }],
      [{ text: '📝 Otro', callback_data: 'teacherCalendar:type:Otro' }],
      [{ text: '⬅️ Volver', callback_data: 'teacherCalendar:menu' }],
    ],
  };
}

function teacherCalendarEventKeyboard(id, estado) {
  const rows = [];
  if (estado !== 'Completado') rows.push([{ text: '✅ Marcar completado', callback_data: `teacherCalendar:status:${id}:Completado` }]);
  if (estado !== 'Cancelado') rows.push([{ text: '🚫 Cancelar', callback_data: `teacherCalendar:status:${id}:Cancelado` }]);
  if (estado !== 'Pendiente') rows.push([{ text: '⏳ Volver a pendiente', callback_data: `teacherCalendar:status:${id}:Pendiente` }]);
  rows.push([{ text: '🗑️ Eliminar', callback_data: `teacherCalendar:deleteAsk:${id}` }]);
  rows.push([{ text: '⬅️ Ver eventos', callback_data: 'teacherCalendar:list' }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function teacherCalendarListKeyboard(eventos = []) {
  const rows = eventos.slice(0, 30).map((e) => [{
    text: `${e.fecha || ''}${e.hora ? ` ${e.hora}` : ''} · ${e.titulo || 'Evento'}`.slice(0, 60),
    callback_data: `teacherCalendar:event:${e.id}`,
  }]);
  rows.push([{ text: '➕ Crear evento', callback_data: 'teacherCalendar:create' }]);
  rows.push([{ text: '📊 Resumen', callback_data: 'teacherCalendar:summary' }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function teacherCalendarStatusIcon(estado) {
  return ({ Pendiente:'⏳', Completado:'✅', Cancelado:'🚫' })[estado] || '⏳';
}

function teacherCalendarTypeIcon(tipo) {
  return ({ Actividad:'📚', Evaluación:'🧠', Reunión:'👥', Recordatorio:'⏰', Otro:'📝' })[tipo] || '📝';
}

async function showTeacherCalendarMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  await callEduGestion('botCalendarioContexto', { telegramId });

  await sendMessage(
    chatId,
    `🗓️ <b>CALENDARIO DOCENTE</b>
━━━━━━━━━━━━━━━━━━

Organiza actividades, evaluaciones, reuniones y recordatorios directamente desde Telegram.`,
    { reply_markup: teacherCalendarMainKeyboard() },
  );
}

async function startTeacherCalendarCreate(chatId) {
  teacherCalendarDraft.set(String(chatId), {});
  pendingTextMode.delete(String(chatId));

  await sendMessage(
    chatId,
    `➕ <b>CREAR EVENTO</b>

Selecciona el tipo de evento:`,
    { reply_markup: teacherCalendarTypesKeyboard() },
  );
}

async function chooseTeacherCalendarType(chatId, type) {
  const draft = teacherCalendarDraft.get(String(chatId)) || {};
  draft.tipo = type;
  teacherCalendarDraft.set(String(chatId), draft);
  pendingTextMode.set(String(chatId), 'calendar-date');

  await sendMessage(
    chatId,
    `${teacherCalendarTypeIcon(type)} Tipo: <b>${escapeHtml(type)}</b>

Escribe la fecha en formato:

<code>AAAA-MM-DD</code>

Ejemplo: <code>2026-09-15</code>

Para cancelar escribe <code>cancelar</code>.`,
  );
}

async function handleTeacherCalendarText(chatId, source, text, mode) {
  const draft = teacherCalendarDraft.get(String(chatId)) || {};
  const raw = String(text || '').trim();

  if (raw.toLowerCase() === 'cancelar') {
    pendingTextMode.delete(String(chatId));
    teacherCalendarDraft.delete(String(chatId));
    await showTeacherCalendarMenu(chatId, source);
    return true;
  }

  if (mode === 'calendar-date') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      await sendMessage(chatId, '⚠️ Usa el formato <code>AAAA-MM-DD</code>. Ejemplo: <code>2026-09-15</code>.');
      return true;
    }
    draft.fecha = raw;
    teacherCalendarDraft.set(String(chatId), draft);
    pendingTextMode.set(String(chatId), 'calendar-time');
    await sendMessage(chatId, 'Escribe la hora en formato <code>HH:MM</code> o escribe <code>sin hora</code>.');
    return true;
  }

  if (mode === 'calendar-time') {
    if (!/^sin hora$/i.test(raw) && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(raw)) {
      await sendMessage(chatId, '⚠️ Hora inválida. Usa <code>HH:MM</code> o escribe <code>sin hora</code>.');
      return true;
    }
    draft.hora = /^sin hora$/i.test(raw) ? '' : raw;
    teacherCalendarDraft.set(String(chatId), draft);
    pendingTextMode.set(String(chatId), 'calendar-title');
    await sendMessage(chatId, 'Escribe el <b>título</b> del evento.');
    return true;
  }

  if (mode === 'calendar-title') {
    if (!raw) {
      await sendMessage(chatId, '⚠️ El título no puede quedar vacío.');
      return true;
    }
    draft.titulo = raw;
    teacherCalendarDraft.set(String(chatId), draft);
    pendingTextMode.set(String(chatId), 'calendar-description');
    await sendMessage(chatId, 'Escribe una <b>descripción</b> o escribe <code>sin descripción</code>.');
    return true;
  }

  if (mode === 'calendar-description') {
    draft.descripcion = /^sin descripci[oó]n$/i.test(raw) ? '' : raw;
    teacherCalendarDraft.set(String(chatId), draft);
    pendingTextMode.set(String(chatId), 'calendar-grade');
    await sendMessage(chatId, 'Escribe el <b>grado/año</b> o escribe <code>sin grado</code>.');
    return true;
  }

  if (mode === 'calendar-grade') {
    draft.grado = /^sin grado$/i.test(raw) ? '' : raw;
    teacherCalendarDraft.set(String(chatId), draft);
    pendingTextMode.set(String(chatId), 'calendar-section');
    await sendMessage(chatId, 'Escribe la <b>sección</b> o escribe <code>sin sección</code>.');
    return true;
  }

  if (mode === 'calendar-section') {
    draft.seccion = /^sin secci[oó]n$/i.test(raw) ? '' : raw;
    teacherCalendarDraft.set(String(chatId), draft);
    pendingTextMode.set(String(chatId), 'calendar-lapso');
    await sendMessage(chatId, 'Escribe el <b>lapso</b> o escribe <code>sin lapso</code>.');
    return true;
  }

  if (mode === 'calendar-lapso') {
    draft.lapso = /^sin lapso$/i.test(raw) ? '' : raw;

    const telegramId = teacherTelegramId(source);
    const result = await callEduGestion('botCalendarioCrear', {
      telegramId,
      ...draft,
    });

    pendingTextMode.delete(String(chatId));
    teacherCalendarDraft.delete(String(chatId));

    const e = result.evento || {};

    await sendMessage(
      chatId,
      `✅ <b>EVENTO CREADO</b>
━━━━━━━━━━━━━━━━━━

${teacherCalendarTypeIcon(e.tipo)} <b>${escapeHtml(e.titulo || '')}</b>

Fecha: <b>${escapeHtml(e.fecha || '')}</b>
${e.hora ? `Hora: <b>${escapeHtml(e.hora)}</b>\n` : ''}Tipo: <b>${escapeHtml(e.tipo || '')}</b>
Estado: <b>${teacherCalendarStatusIcon(e.estado)} ${escapeHtml(e.estado || 'Pendiente')}</b>
${e.grado ? `Grado/Año: <b>${escapeHtml(e.grado)}</b>\n` : ''}${e.seccion ? `Sección: <b>${escapeHtml(e.seccion)}</b>\n` : ''}${e.lapso ? `Lapso: <b>${escapeHtml(e.lapso)}</b>\n` : ''}${e.descripcion ? `\n📝 ${escapeHtml(e.descripcion)}` : ''}`,
      { reply_markup: teacherCalendarMainKeyboard() },
    );
    return true;
  }

  return false;
}

async function showTeacherCalendarList(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botCalendarioListar', { telegramId });
  const eventos = Array.isArray(result.eventos) ? result.eventos : [];

  if (!eventos.length) {
    await sendMessage(
      chatId,
      `📋 <b>EVENTOS DEL CALENDARIO</b>

Todavía no tienes eventos registrados.`,
      { reply_markup: teacherCalendarMainKeyboard() },
    );
    return;
  }

  await sendMessage(
    chatId,
    `📋 <b>EVENTOS DEL CALENDARIO</b>
━━━━━━━━━━━━━━━━━━

Total: <b>${Number(result.total || eventos.length)}</b>

Selecciona un evento para ver el detalle:`,
    { reply_markup: teacherCalendarListKeyboard(eventos) },
  );
}

async function showTeacherCalendarEvent(chatId, source, id) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botCalendarioDetalle', { telegramId, id });
  const e = result.evento || {};

  await sendMessage(
    chatId,
    `${teacherCalendarTypeIcon(e.tipo)} <b>${escapeHtml(e.titulo || '')}</b>
━━━━━━━━━━━━━━━━━━

Fecha: <b>${escapeHtml(e.fecha || '')}</b>
${e.hora ? `Hora: <b>${escapeHtml(e.hora)}</b>\n` : ''}Tipo: <b>${escapeHtml(e.tipo || '')}</b>
Estado: <b>${teacherCalendarStatusIcon(e.estado)} ${escapeHtml(e.estado || 'Pendiente')}</b>
${e.grado ? `Grado/Año: <b>${escapeHtml(e.grado)}</b>\n` : ''}${e.seccion ? `Sección: <b>${escapeHtml(e.seccion)}</b>\n` : ''}${e.lapso ? `Lapso: <b>${escapeHtml(e.lapso)}</b>\n` : ''}${e.descripcion ? `\n📝 ${escapeHtml(e.descripcion)}` : ''}`,
    { reply_markup: teacherCalendarEventKeyboard(e.id, e.estado) },
  );
}

async function updateTeacherCalendarStatus(chatId, source, id, estado) {
  const telegramId = teacherTelegramId(source);
  await callEduGestion('botCalendarioActualizarEstado', { telegramId, id, estado });
  await showTeacherCalendarEvent(chatId, source, id);
}

async function deleteTeacherCalendarEvent(chatId, source, id) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botCalendarioEliminar', { telegramId, id });

  await sendMessage(
    chatId,
    `🗑️ <b>EVENTO ELIMINADO</b>

${escapeHtml(result.titulo || '')}`,
    { reply_markup: teacherCalendarMainKeyboard() },
  );
}

async function showTeacherCalendarSummary(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botCalendarioResumen', { telegramId });
  const s = result.resumen || {};

  await sendMessage(
    chatId,
    `📊 <b>RESUMEN DEL CALENDARIO</b>
━━━━━━━━━━━━━━━━━━

Total: <b>${Number(s.total || 0)}</b>

⏳ Pendientes: <b>${Number(s.pendientes || 0)}</b>
✅ Completados: <b>${Number(s.completados || 0)}</b>
🚫 Cancelados: <b>${Number(s.cancelados || 0)}</b>

📚 Actividades: <b>${Number(s.actividades || 0)}</b>
🧠 Evaluaciones: <b>${Number(s.evaluaciones || 0)}</b>
👥 Reuniones: <b>${Number(s.reuniones || 0)}</b>
⏰ Recordatorios: <b>${Number(s.recordatorios || 0)}</b>
📝 Otros: <b>${Number(s.otros || 0)}</b>`,
    { reply_markup: teacherCalendarMainKeyboard() },
  );
}

const currPanelState = new Map();

function currPanelLevelsKeyboard(levels = [], mode = 'lapso') {
  const prefix = mode === 'annual' ? 'currPanel:annualLevel:' : 'currPanel:level:';
  const rows = levels.map((item) => [{
    text: `📚 ${item.nivel} · ${Number(item.totalTemas || 0)} temas`,
    callback_data: `${prefix}${encodeURIComponent(item.nivel)}`,
  }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function currPanelLapsosKeyboard(level) {
  return {
    inline_keyboard: [
      [{ text: '1️⃣ 1er Lapso', callback_data: `currPanel:lapso:${encodeURIComponent(level)}:1er%20Lapso` }],
      [{ text: '2️⃣ 2do Lapso', callback_data: `currPanel:lapso:${encodeURIComponent(level)}:2do%20Lapso` }],
      [{ text: '3️⃣ 3er Lapso', callback_data: `currPanel:lapso:${encodeURIComponent(level)}:3er%20Lapso` }],
      [{ text: '⬅️ Cambiar grado/año', callback_data: 'currPanel:menu' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

function currPanelTopicsKeyboard(items = [], level = '', lapso = '') {
  const rows = items.slice(0, 40).map((item) => [{
    text: `${currTrackStatusIcon(item.estado)} ${item.tema || 'Tema curricular'}`.slice(0, 60),
    callback_data: `currPanel:topic:${encodeURIComponent(level)}:${encodeURIComponent(lapso)}:${Number(item.indice)}`,
  }]);
  rows.push([{ text: '➕ Asignar tema al lapso', callback_data: `currPanel:assignMenu:${encodeURIComponent(level)}:${encodeURIComponent(lapso)}` }]);
  rows.push([{ text: '⬅️ Cambiar lapso', callback_data: `currPanel:level:${encodeURIComponent(level)}` }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function currPanelAssignTopicsKeyboard(items = [], level = '', lapso = '') {
  const rows = items.slice(0, 40).map((item) => [{
    text: `➕ ${item.tema || 'Tema curricular'}`.slice(0, 60),
    callback_data: `currPanel:assign:${encodeURIComponent(level)}:${encodeURIComponent(lapso)}:${Number(item.indice)}`,
  }]);
  rows.push([{ text: '⬅️ Volver al lapso', callback_data: `currPanel:lapso:${encodeURIComponent(level)}:${encodeURIComponent(lapso)}` }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

async function showCurrPanelMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  const result = await callEduGestion('botPanelCurricularContexto', { telegramId });
  const levels = Array.isArray(result.niveles) ? result.niveles : [];

  currPanelState.set(String(chatId), {
    levels,
    level: '',
    lapso: '',
  });

  await sendMessage(
    chatId,
    `📅 <b>PANEL CURRICULAR POR LAPSO</b>
━━━━━━━━━━━━━━━━━━

Organiza los temas del Cuadernillo de Educación Física por período escolar.

Año escolar: <b>${escapeHtml(result.anoEscolar || 'No registrado')}</b>

Selecciona un grado o año:`,
    { reply_markup: currPanelLevelsKeyboard(levels, 'lapso') },
  );
}

async function showCurrPanelLevel(chatId, source, level) {
  currPanelState.set(String(chatId), {
    ...(currPanelState.get(String(chatId)) || {}),
    level,
    lapso: '',
  });

  await sendMessage(
    chatId,
    `📅 <b>${escapeHtml(level)}</b>

Selecciona el lapso que deseas consultar o planificar:`,
    { reply_markup: currPanelLapsosKeyboard(level) },
  );
}

async function showCurrPanelLapso(chatId, source, level, lapso) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botPanelCurricularLapso', {
    telegramId,
    nivel: level,
    lapso,
  });

  const topics = Array.isArray(result.temas) ? result.temas : [];
  const summary = result.resumen || {};

  currPanelState.set(String(chatId), {
    ...(currPanelState.get(String(chatId)) || {}),
    level: result.nivel || level,
    lapso: result.lapso || lapso,
  });

  const noTopicsText = topics.length
    ? 'Selecciona un tema para ver su estado curricular.'
    : 'Todavía no hay temas asignados a este lapso.';

  await sendMessage(
    chatId,
    `📅 <b>${escapeHtml(result.lapso || lapso)} · ${escapeHtml(result.nivel || level)}</b>
━━━━━━━━━━━━━━━━━━

⚪ Pendientes: <b>${Number(summary.Pendiente || 0)}</b>
🔵 Planificados: <b>${Number(summary.Planificado || 0)}</b>
🟠 Trabajados: <b>${Number(summary.Trabajado || 0)}</b>
🟢 Evaluados: <b>${Number(summary.Evaluado || 0)}</b>

Temas asignados: <b>${Number(result.total || topics.length)}</b>
Avance del lapso: <b>${Number(result.avance || 0)}%</b>

${noTopicsText}`,
    { reply_markup: currPanelTopicsKeyboard(topics, result.nivel || level, result.lapso || lapso) },
  );
}

async function showCurrPanelAssignMenu(chatId, source, level, lapso) {
  const telegramId = teacherTelegramId(source);

  const all = await callEduGestion('botSeguimientoCurricularNivel', {
    telegramId,
    nivel: level,
  });

  const current = await callEduGestion('botPanelCurricularLapso', {
    telegramId,
    nivel: level,
    lapso,
  });

  const assignedNames = new Set((current.temas || []).map((x) => String(x.tema || '').trim().toLowerCase()));
  const available = (all.temas || []).filter((x) => !assignedNames.has(String(x.tema || '').trim().toLowerCase()));

  if (!available.length) {
    await sendMessage(
      chatId,
      `✅ Todos los temas disponibles de <b>${escapeHtml(level)}</b> ya están asignados a este lapso.`,
      { reply_markup: currPanelTopicsKeyboard(current.temas || [], level, lapso) },
    );
    return;
  }

  await sendMessage(
    chatId,
    `➕ <b>ASIGNAR TEMA AL ${escapeHtml(lapso.toUpperCase())}</b>

Grado/Año: <b>${escapeHtml(level)}</b>

Selecciona un tema del cuadernillo:`,
    { reply_markup: currPanelAssignTopicsKeyboard(available, level, lapso) },
  );
}

async function assignCurrPanelTopic(chatId, source, level, lapso, index) {
  const telegramId = teacherTelegramId(source);

  const result = await callEduGestion('botPanelCurricularAsignarLapso', {
    telegramId,
    nivel: level,
    lapso,
    indice: Number(index),
  });

  await sendMessage(
    chatId,
    `✅ <b>TEMA ASIGNADO AL LAPSO</b>

Tema: <b>${escapeHtml(result.tema || '')}</b>
Lapso: <b>${escapeHtml(result.lapso || lapso)}</b>
Grado/Año: <b>${escapeHtml(result.nivel || level)}</b>`,
  );

  await showCurrPanelLapso(chatId, source, result.nivel || level, result.lapso || lapso);
}

async function showCurrPanelTopic(chatId, source, level, lapso, index) {
  const telegramId = teacherTelegramId(source);

  const tracking = await callEduGestion('botSeguimientoCurricularNivel', {
    telegramId,
    nivel: level,
  });

  const item = (tracking.temas || []).find((x) => Number(x.indice) === Number(index));
  if (!item) {
    await sendMessage(chatId, 'No encontré ese tema curricular.');
    return;
  }

  await sendMessage(
    chatId,
    `📅 <b>TEMA DEL ${escapeHtml(lapso.toUpperCase())}</b>
━━━━━━━━━━━━━━━━━━

<b>${escapeHtml(item.tema || '')}</b>

Grado/Año: <b>${escapeHtml(level)}</b>
Estado curricular: <b>${currTrackStatusIcon(item.estado)} ${escapeHtml(item.estado || 'Pendiente')}</b>
${item.pagina ? `Página del cuadernillo: <b>${escapeHtml(item.pagina)}</b>\n` : ''}

Puedes cambiar su estado desde Seguimiento curricular.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📈 Abrir seguimiento curricular', callback_data: `currTrack:topic:${encodeURIComponent(level)}:${Number(index)}` }],
          [{ text: '⬅️ Volver al lapso', callback_data: `currPanel:lapso:${encodeURIComponent(level)}:${encodeURIComponent(lapso)}` }],
          [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
        ],
      },
    },
  );
}

async function showCurrPanelAnnualMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  const result = await callEduGestion('botPanelCurricularContexto', { telegramId });
  const levels = Array.isArray(result.niveles) ? result.niveles : [];

  await sendMessage(
    chatId,
    `📊 <b>PANEL CURRICULAR ANUAL</b>
━━━━━━━━━━━━━━━━━━

Año escolar: <b>${escapeHtml(result.anoEscolar || 'No registrado')}</b>

Selecciona un grado o año para ver el resumen anual:`,
    { reply_markup: currPanelLevelsKeyboard(levels, 'annual') },
  );
}

async function showCurrPanelAnnual(chatId, source, level) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botPanelCurricularAnual', {
    telegramId,
    nivel: level,
  });

  const lapsos = Array.isArray(result.lapsos) ? result.lapsos : [];
  const lapsoLines = lapsos.map((item) => (
    `📅 <b>${escapeHtml(item.lapso || '')}</b>
Temas: <b>${Number(item.total || 0)}</b> · Avance: <b>${Number(item.avance || 0)}%</b>
⚪ ${Number(item.pendiente || 0)} · 🔵 ${Number(item.planificado || 0)} · 🟠 ${Number(item.trabajado || 0)} · 🟢 ${Number(item.evaluado || 0)}`
  )).join('\n\n');

  const general = result.seguimientoGeneral || {};

  await sendMessage(
    chatId,
    `📊 <b>PANEL ANUAL · ${escapeHtml(result.nivel || level)}</b>
━━━━━━━━━━━━━━━━━━

Año escolar: <b>${escapeHtml(result.anoEscolar || 'No registrado')}</b>

Total de temas: <b>${Number(result.totalTemas || 0)}</b>
Asignados a lapsos: <b>${Number(result.temasAsignados || 0)}</b>
Sin asignar: <b>${Number(result.temasSinAsignar || 0)}</b>
Avance anual: <b>${Number(result.avanceAnual || 0)}%</b>

<b>Seguimiento general</b>
⚪ Pendiente: ${Number(general.Pendiente || 0)}
🔵 Planificado: ${Number(general.Planificado || 0)}
🟠 Trabajado: ${Number(general.Trabajado || 0)}
🟢 Evaluado: ${Number(general.Evaluado || 0)}

${lapsoLines || 'No hay información por lapso todavía.'}

Fuente: <b>${escapeHtml(result.fuente || 'Cuadernillo Curricular MPPE · Educación Física')}</b>`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📅 Abrir panel por lapso', callback_data: `currPanel:level:${encodeURIComponent(result.nivel || level)}` }],
          [{ text: '⬅️ Cambiar grado/año', callback_data: 'currPanel:annualMenu' }],
          [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
        ],
      },
    },
  );
}

const currTrackState = new Map();

function currTrackLevelsKeyboard(levels = []) {
  const rows = levels.map((item) => [{
    text: `📚 ${item.nivel} · ${Number(item.totalTemas || 0)} temas`,
    callback_data: `currTrack:level:${encodeURIComponent(item.nivel)}`,
  }]);
  rows.push([{ text: '📊 Resumen general', callback_data: 'currTrack:summary' }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function currTrackStatusIcon(status) {
  const map = {
    Pendiente: '⚪',
    Planificado: '🔵',
    Trabajado: '🟠',
    Evaluado: '🟢',
  };
  return map[status] || '⚪';
}

function currTrackTopicsKeyboard(items = [], level = '') {
  const rows = items.slice(0, 40).map((item) => [{
    text: `${currTrackStatusIcon(item.estado)} ${item.tema || 'Tema curricular'}`.slice(0, 60),
    callback_data: `currTrack:topic:${encodeURIComponent(level)}:${Number(item.indice)}`,
  }]);

  rows.push([{ text: '⬅️ Cambiar grado/año', callback_data: 'currTrack:menu' }]);
  rows.push([{ text: '📊 Resumen general', callback_data: 'currTrack:summary' }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function currTrackStatusKeyboard(level, index, current) {
  const statuses = [
    ['⚪ Pendiente', 'Pendiente'],
    ['🔵 Planificado', 'Planificado'],
    ['🟠 Trabajado', 'Trabajado'],
    ['🟢 Evaluado', 'Evaluado'],
  ];

  const rows = statuses.map(([label, value]) => [{
    text: `${current === value ? '✅ ' : ''}${label}`,
    callback_data: `currTrack:set:${encodeURIComponent(level)}:${Number(index)}:${value}`,
  }]);

  rows.push([{ text: '⬅️ Volver a los temas', callback_data: `currTrack:back:${encodeURIComponent(level)}` }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);

  return { inline_keyboard: rows };
}

async function showCurrTrackMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  const result = await callEduGestion('botSeguimientoCurricularContexto', { telegramId });
  const levels = Array.isArray(result.niveles) ? result.niveles : [];

  currTrackState.set(String(chatId), {
    levels,
    level: '',
    topics: [],
    selected: null,
  });

  await sendMessage(
    chatId,
    `📈 <b>SEGUIMIENTO CURRICULAR</b>
━━━━━━━━━━━━━━━━━━

Controla el avance de los temas del Cuadernillo Curricular de Educación Física.

Estados disponibles:
⚪ Pendiente
🔵 Planificado
🟠 Trabajado
🟢 Evaluado

Selecciona un grado o año:`,
    { reply_markup: currTrackLevelsKeyboard(levels) },
  );
}

async function showCurrTrackLevel(chatId, source, level) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botSeguimientoCurricularNivel', {
    telegramId,
    nivel: level,
  });

  const topics = Array.isArray(result.temas) ? result.temas : [];
  const summary = result.resumen || {};

  currTrackState.set(String(chatId), {
    ...(currTrackState.get(String(chatId)) || {}),
    level: result.nivel || level,
    topics,
  });

  await sendMessage(
    chatId,
    `📈 <b>${escapeHtml(result.nivel || level)}</b>
━━━━━━━━━━━━━━━━━━

⚪ Pendientes: <b>${Number(summary.Pendiente || 0)}</b>
🔵 Planificados: <b>${Number(summary.Planificado || 0)}</b>
🟠 Trabajados: <b>${Number(summary.Trabajado || 0)}</b>
🟢 Evaluados: <b>${Number(summary.Evaluado || 0)}</b>

Total de temas: <b>${Number(result.total || topics.length)}</b>

Selecciona un tema para cambiar su estado:`,
    { reply_markup: currTrackTopicsKeyboard(topics, result.nivel || level) },
  );
}

async function showCurrTrackTopic(chatId, source, level, index) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botSeguimientoCurricularNivel', {
    telegramId,
    nivel: level,
  });

  const topics = Array.isArray(result.temas) ? result.temas : [];
  const item = topics.find((x) => Number(x.indice) === Number(index));

  if (!item) {
    await sendMessage(chatId, 'No encontré ese tema curricular.');
    return;
  }

  currTrackState.set(String(chatId), {
    ...(currTrackState.get(String(chatId)) || {}),
    level: result.nivel || level,
    topics,
    selected: item,
  });

  await sendMessage(
    chatId,
    `📈 <b>ESTADO CURRICULAR</b>
━━━━━━━━━━━━━━━━━━

<b>${escapeHtml(item.tema || 'Tema curricular')}</b>

Grado/Año: <b>${escapeHtml(item.grado || result.nivel || level)}</b>
Estado actual: <b>${currTrackStatusIcon(item.estado)} ${escapeHtml(item.estado || 'Pendiente')}</b>
${item.pagina ? `Página del cuadernillo: <b>${escapeHtml(item.pagina)}</b>\n` : ''}

Selecciona el nuevo estado:`,
    { reply_markup: currTrackStatusKeyboard(result.nivel || level, Number(index), item.estado || 'Pendiente') },
  );
}

async function setCurrTrackStatus(chatId, source, level, index, status) {
  const telegramId = teacherTelegramId(source);

  const result = await callEduGestion('botSeguimientoCurricularActualizar', {
    telegramId,
    nivel: level,
    indice: Number(index),
    estado: status,
  });

  await sendMessage(
    chatId,
    `✅ <b>SEGUIMIENTO ACTUALIZADO</b>

Tema: <b>${escapeHtml(result.tema || '')}</b>
Estado: <b>${currTrackStatusIcon(result.estado)} ${escapeHtml(result.estado || '')}</b>`,
  );

  await showCurrTrackLevel(chatId, source, result.nivel || level);
}

async function showCurrTrackSummary(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botSeguimientoCurricularResumen', { telegramId });
  const levels = Array.isArray(result.niveles) ? result.niveles : [];

  const lines = levels.map((item) => {
    return `📚 <b>${escapeHtml(item.nivel || '')}</b>
⚪ ${Number(item.pendiente || 0)} · 🔵 ${Number(item.planificado || 0)} · 🟠 ${Number(item.trabajado || 0)} · 🟢 ${Number(item.evaluado || 0)}
Avance: <b>${Number(item.avance || 0)}%</b>`;
  });

  await sendMessage(
    chatId,
    `📊 <b>RESUMEN GENERAL · SEGUIMIENTO CURRICULAR</b>
━━━━━━━━━━━━━━━━━━

${lines.join('\n\n')}

Fuente: <b>${escapeHtml(result.fuente || 'Cuadernillo Curricular MPPE · Educación Física')}</b>`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📈 Ver por grado/año', callback_data: 'currTrack:menu' }],
          [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
        ],
      },
    },
  );
}

const curriculumEFState = new Map();

function curriculumLevelsKeyboard(levels = []) {
  const rows = levels.map((item) => [{
    text: `📘 ${item.nivel} · ${Number(item.totalTemas || 0)} tema${Number(item.totalTemas || 0) === 1 ? '' : 's'}`,
    callback_data: `curriculumEF:level:${encodeURIComponent(item.nivel)}`,
  }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function curriculumTopicsKeyboard(items = [], level = '') {
  const rows = items.slice(0, 40).map((item) => [{
    text: `${Number(item.indice) + 1}. ${item.tema || 'Tema curricular'}`.slice(0, 60),
    callback_data: `curriculumEF:topic:${encodeURIComponent(level)}:${Number(item.indice)}`,
  }]);
  rows.push([{ text: '⬅️ Cambiar grado/año', callback_data: 'curriculumEF:menu' }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function curriculumDetailKeyboard(level, index) {
  return {
    inline_keyboard: [
      [{ text: '🤖 Planificar con IA', callback_data: `curriculumEF:plan:${encodeURIComponent(level)}:${Number(index)}` }],
      [{ text: '🧠 Crear evaluación IA', callback_data: `curriculumEF:eval:${encodeURIComponent(level)}:${Number(index)}` }],
      [{ text: '⬅️ Volver a los temas', callback_data: `curriculumEF:back:${encodeURIComponent(level)}` }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

async function showCurriculumEFMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  const result = await callEduGestion('botCuadernilloEFContexto', { telegramId });
  const levels = Array.isArray(result.niveles) ? result.niveles : [];
  curriculumEFState.set(String(chatId), { levels, level: '', topics: [], selected: null });

  await sendMessage(
    chatId,
    `📘 <b>CUADERNILLO CURRICULAR · EDUCACIÓN FÍSICA</b>
━━━━━━━━━━━━━━━━━━

Fuente: <b>${escapeHtml(result.fuente || 'Ministerio del Poder Popular para la Educación')}</b>

Usa la misma base curricular oficial de Educación Física de EduGestión.

Selecciona el nivel, grado o año:`,
    { reply_markup: curriculumLevelsKeyboard(levels) },
  );
}

async function showCurriculumEFTopics(chatId, source, level) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botCuadernilloEFTemas', { telegramId, nivel: level });
  const topics = Array.isArray(result.temas) ? result.temas : [];
  const state = curriculumEFState.get(String(chatId)) || {};
  state.level = result.nivel || level;
  state.topics = topics;
  state.selected = null;
  curriculumEFState.set(String(chatId), state);

  await sendMessage(
    chatId,
    `📘 <b>${escapeHtml(result.nivel || level)}</b>

Temas curriculares disponibles: <b>${Number(result.total || topics.length)}</b>

Selecciona un tema para ver la base curricular completa:`,
    { reply_markup: curriculumTopicsKeyboard(topics, result.nivel || level) },
  );
}

async function showCurriculumEFDetail(chatId, source, level, index) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botCuadernilloEFDetalle', {
    telegramId,
    nivel: level,
    indice: Number(index),
  });

  const item = result.tema || {};
  const state = curriculumEFState.get(String(chatId)) || {};
  state.level = result.nivel || level;
  state.selected = item;
  curriculumEFState.set(String(chatId), state);

  const blocks = [];
  if (item.descripcion && item.descripcion !== item.tema) blocks.push(`📖 <b>Descripción / Tema generador</b>\n${escapeHtml(item.descripcion)}`);
  if (item.temaIndispensable) blocks.push(`🌎 <b>Tema indispensable</b>\n${escapeHtml(item.temaIndispensable)}`);
  if (item.intencionalidad) blocks.push(`🎯 <b>Intencionalidad pedagógica</b>\n${escapeHtml(item.intencionalidad)}`);
  if (item.tejido) blocks.push(`🧩 <b>Tejido temático</b>\n${escapeHtml(item.tejido)}`);
  if (item.referentes) blocks.push(`📚 <b>Referentes teórico-prácticos</b>\n${escapeHtml(item.referentes)}`);

  await sendMessage(
    chatId,
    `📘 <b>BASE CURRICULAR OFICIAL</b>
━━━━━━━━━━━━━━━━━━

<b>${escapeHtml(item.tema || 'Tema curricular')}</b>

Grado/Año: <b>${escapeHtml(item.grado || item.nivel || result.nivel || level)}</b>
${item.pagina ? `Página del cuadernillo: <b>${escapeHtml(item.pagina)}</b>\n` : ''}
${blocks.length ? blocks.join('\n\n') : 'No hay detalle adicional extraído para este tema.'}

━━━━━━━━━━━━━━━━━━
Fuente: <b>${escapeHtml(result.fuente || item.fuente || 'Cuadernillo Curricular MPPE · Educación Física')}</b>

La IA debe usar esta base como referencia principal y no sustituirla por otro currículo.`,
    { reply_markup: curriculumDetailKeyboard(result.nivel || level, Number(index)) },
  );
}

async function curriculumPlanWithAI(chatId, source, level, index) {
  const telegramId = teacherTelegramId(source);
  const detail = await callEduGestion('botCuadernilloEFDetalle', { telegramId, nivel: level, indice: Number(index) });
  const item = detail.tema || {};

  const prompt = [
    'Actúa como asistente docente de Educación Física y prepara una planificación completa y práctica en español.',
    'No realices búsqueda web.',
    '',
    'BASE CURRICULAR OBLIGATORIA - Cuadernillo Curricular MPPE · Educación Física:',
    `- Grado/Año curricular: ${item.grado || item.nivel || level || 'No indicado'}`,
    `- Tema generador: ${item.tema || 'No indicado'}`,
    item.temaIndispensable ? `- Tema indispensable: ${item.temaIndispensable}` : '',
    item.intencionalidad ? `- Intencionalidad pedagógica: ${item.intencionalidad}` : '',
    item.tejido ? `- Tejido temático: ${item.tejido}` : '',
    item.referentes ? `- Referentes teórico-prácticos: ${item.referentes}` : '',
    item.pagina ? `- Fuente: Cuadernillo Curricular MPPE · Educación Física, página ${item.pagina}` : '- Fuente: Cuadernillo Curricular MPPE · Educación Física',
    '',
    'REGLA: usa esta base curricular como referencia principal. No la sustituyas por otro currículo ni inventes referentes oficiales.',
    '',
    'Organiza con: Título, Objetivo, Aprendizajes esperados, Materiales, Inicio, Desarrollo, Cierre, Evaluación formativa, Adaptaciones y Observaciones.'
  ].filter(Boolean).join('\n');

  await sendMessage(chatId, '⏳ <b>Preparando planificación con IA…</b>');
  const answer = await callTeacherGemini(prompt);
  await sendLongTelegramText(
    chatId,
    '🤖 <b>PLANIFICACIÓN BASADA EN EL CUADERNILLO</b>',
    answer,
    curriculumDetailKeyboard(level, Number(index))
  );
}

async function curriculumEvalWithAI(chatId, source, level, index) {
  const telegramId = teacherTelegramId(source);
  const detail = await callEduGestion('botCuadernilloEFDetalle', { telegramId, nivel: level, indice: Number(index) });
  const item = detail.tema || {};

  const prompt = [
    'Actúa como asistente docente de Educación Física y crea una evaluación práctica y formativa en español.',
    'No realices búsqueda web.',
    '',
    'BASE CURRICULAR OBLIGATORIA - Cuadernillo Curricular MPPE · Educación Física:',
    `- Grado/Año curricular: ${item.grado || item.nivel || level || 'No indicado'}`,
    `- Tema generador: ${item.tema || 'No indicado'}`,
    item.intencionalidad ? `- Intencionalidad pedagógica: ${item.intencionalidad}` : '',
    item.tejido ? `- Tejido temático: ${item.tejido}` : '',
    item.referentes ? `- Referentes teórico-prácticos: ${item.referentes}` : '',
    '',
    'No inventes contenidos oficiales. Incluye propósito, actividad, técnica, instrumento, criterios observables, ponderación sugerida y recomendaciones.'
  ].filter(Boolean).join('\n');

  await sendMessage(chatId, '⏳ <b>Generando evaluación basada en el cuadernillo…</b>');
  const answer = await callTeacherGemini(prompt);

  evalAIState.set(String(chatId), {
    typeCode: 'curriculum',
    type: 'Evaluación curricular',
    generated: answer,
    saved: false,
    title: `Evaluación curricular · ${item.tema || 'Tema'}`.slice(0, 100),
    topic: item.tema || '',
    matter: 'Educación Física',
    grade: item.grado || item.nivel || level || '',
  });

  await sendLongTelegramText(
    chatId,
    '🧠 <b>EVALUACIÓN BASADA EN EL CUADERNILLO</b>',
    answer,
    evalAIResultKeyboard(false)
  );
}

const evalAIState = new Map();
const evalLibraryState = new Map();

function evalAIMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📝 Prueba corta', callback_data: 'evalAI:type:short' }],
      [{ text: '✍️ Preguntas abiertas', callback_data: 'evalAI:type:open' }],
      [{ text: '🔘 Selección simple', callback_data: 'evalAI:type:choice' }],
      [{ text: '✅ Lista de cotejo', callback_data: 'evalAI:type:checklist' }],
      [{ text: '📏 Rúbrica', callback_data: 'evalAI:type:rubric' }],
      [{ text: '🎯 Actividad evaluativa', callback_data: 'evalAI:type:activity' }],
      [{ text: '📚 Biblioteca de evaluaciones', callback_data: 'evalLibrary:menu' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

function evalAIResultKeyboard(saved = false) {
  const rows = [];
  if (!saved) rows.push([{ text: '💾 Guardar en biblioteca', callback_data: 'evalAI:save' }]);
  rows.push([{ text: '🔄 Crear otra evaluación', callback_data: 'evalAI:menu' }]);
  rows.push([{ text: '📚 Ver biblioteca', callback_data: 'evalLibrary:menu' }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function evalLibraryKeyboard(items = []) {
  const rows = items.slice(0, 30).map((item, index) => [{
    text: `${index + 1}. ${item.titulo || 'Evaluación'} · ${item.tipo || ''}`.slice(0, 60),
    callback_data: `evalLibrary:detail:${index}`,
  }]);
  rows.push([{ text: '🔄 Actualizar', callback_data: 'evalLibrary:menu' }]);
  rows.push([{ text: '🧠 Crear evaluación IA', callback_data: 'evalAI:menu' }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function evalLibraryDetailKeyboard(index) {
  return {
    inline_keyboard: [
      [{ text: '♻️ Reutilizar con IA', callback_data: `evalLibrary:reuse:${Number(index)}` }],
      [{ text: '🗑️ Eliminar', callback_data: `evalLibrary:delete:${Number(index)}` }],
      [{ text: '⬅️ Volver a biblioteca', callback_data: 'evalLibrary:menu' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

function evalTypeLabel(code) {
  return ({
    short: 'Prueba corta',
    open: 'Preguntas abiertas',
    choice: 'Selección simple',
    checklist: 'Lista de cotejo',
    rubric: 'Rúbrica',
    activity: 'Actividad evaluativa',
  })[code] || 'Evaluación IA';
}

function evalTypeInstruction(code) {
  if (code === 'short') return 'Crea una prueba corta con preguntas variadas, instrucciones claras y clave de respuestas al final.';
  if (code === 'open') return 'Crea preguntas abiertas con criterios orientativos de respuesta o indicadores de logro.';
  if (code === 'choice') return 'Crea preguntas de selección simple con 4 opciones cada una e indica la respuesta correcta al final.';
  if (code === 'checklist') return 'Crea una lista de cotejo clara con indicadores observables, organizada en una tabla de Sí/No o Logrado/En proceso.';
  if (code === 'rubric') return 'Crea una rúbrica con criterios claros y niveles de desempeño apropiados para el grado o año.';
  if (code === 'activity') return 'Crea una actividad evaluativa práctica con propósito, consignas, materiales, criterios e instrumento de evaluación.';
  return 'Crea una evaluación clara, útil y apropiada para el perfil docente.';
}

async function showEvalAIMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  pendingTextMode.delete(String(chatId));
  const result = await callEduGestion('botEvaluacionesIAContexto', { telegramId });
  const data = result.perfil || {};
  const grades = Array.isArray(data.grados) ? data.grados : [];

  await sendMessage(
    chatId,
    `🧠 <b>EVALUACIONES IA</b>
━━━━━━━━━━━━━━━━━━

Docente: <b>${escapeHtml(data.nombre || 'Docente')}</b>
Materia: <b>${escapeHtml(data.materia || 'No registrada')}</b>
Grados/Años: <b>${escapeHtml(grades.length ? grades.join(', ') : 'No registrados')}</b>

La evaluación se adaptará automáticamente a tu perfil docente.

Selecciona el tipo de evaluación:`,
    { reply_markup: evalAIMenuKeyboard() },
  );
}

async function startEvalAI(chatId, source, typeCode) {
  const profile = await linkedProfile(teacherTelegramId(source));
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  evalAIState.set(String(chatId), {
    typeCode,
    type: evalTypeLabel(typeCode),
    generated: null,
    saved: false,
  });
  pendingTextMode.set(String(chatId), `eval-ai:${typeCode}`);

  await sendMessage(
    chatId,
    `🧠 <b>${escapeHtml(evalTypeLabel(typeCode))}</b>

Escribe el <b>tema</b> o contenido que deseas evaluar.

Ejemplo:
<code>Coordinación y equilibrio para 1ero</code>

También puedes incluir cantidad de preguntas, tiempo o cualquier indicación especial.

Escribe <code>cancelar</code> para salir.`,
    { reply_markup: { inline_keyboard: [[{ text: '❌ Cancelar', callback_data: 'evalAI:menu' }], [{ text: '☰ Todas las opciones', callback_data: 'menu' }]] } },
  );
}

async function generateEvalAI(chatId, source, userText, typeCode) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botEvaluacionesIAContexto', { telegramId });
  const data = result.perfil || {};
  const grades = Array.isArray(data.grados) ? data.grados.filter(Boolean) : [];

  const prompt = [
    'CONTEXTO DEL PERFIL DOCENTE DE EDUGESTIÓN:',
    `- Docente: ${data.nombre || 'No indicado'}`,
    `- Área o materia principal: ${data.materia || 'No indicada'}`,
    `- Grados/Años que atiende: ${grades.length ? grades.join(', ') : 'No indicados'}`,
    `- Año escolar: ${data.anoEscolar || 'No indicado'}`,
    '',
    'INSTRUCCIONES:',
    '- No realices búsqueda web.',
    '- No inventes contenidos oficiales ni referencias curriculares que no hayan sido proporcionadas.',
    '- Si el docente escribe un grado, materia o contexto específico, eso tiene prioridad.',
    '- Usa lenguaje claro, profesional y apropiado al nivel.',
    `- Tipo solicitado: ${evalTypeLabel(typeCode)}.`,
    `- Tarea específica: ${evalTypeInstruction(typeCode)}`,
    '- Presenta el material listo para usar por el docente.',
    '',
    'SOLICITUD DEL DOCENTE:',
    String(userText || '').trim(),
  ].join('\n');

  await sendMessage(chatId, '⏳ <b>Generando evaluación con IA…</b>');

  const answer = await callTeacherGemini(prompt);

  const titleBase = String(userText || '').trim().split('\n')[0].slice(0, 70);
  const state = {
    typeCode,
    type: evalTypeLabel(typeCode),
    generated: answer,
    saved: false,
    title: `${evalTypeLabel(typeCode)} · ${titleBase || 'Evaluación'}`.slice(0, 100),
    topic: titleBase,
    matter: data.materia || '',
    grade: grades.length === 1 ? grades[0] : '',
  };
  evalAIState.set(String(chatId), state);
  pendingTextMode.delete(String(chatId));

  await sendLongTelegramText(
    chatId,
    `🧠 <b>${escapeHtml(evalTypeLabel(typeCode))}</b>`,
    answer,
    evalAIResultKeyboard(false),
  );
}

async function saveGeneratedEval(chatId, source) {
  const state = evalAIState.get(String(chatId));
  if (!state?.generated) {
    await showEvalAIMenu(chatId, source);
    return;
  }

  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botGuardarEvaluacionIA', {
    telegramId,
    titulo: state.title || state.type || 'Evaluación IA',
    tipo: state.type || 'Evaluación IA',
    materia: state.matter || '',
    grado: state.grade || '',
    tema: state.topic || '',
    contenido: state.generated,
  });

  state.saved = true;
  state.savedId = result.evaluacion?.id || '';
  evalAIState.set(String(chatId), state);

  await sendMessage(
    chatId,
    `💾 <b>EVALUACIÓN GUARDADA</b>

La evaluación quedó guardada en tu Biblioteca de evaluaciones.`,
    { reply_markup: evalAIResultKeyboard(true) },
  );
}

async function showEvalLibrary(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  const result = await callEduGestion('botListarEvaluacionesIA', {
    telegramId,
    limite: 30,
  });

  const items = Array.isArray(result.evaluaciones) ? result.evaluaciones : [];
  evalLibraryState.set(String(chatId), { items });

  if (!items.length) {
    await sendMessage(
      chatId,
      `📚 <b>BIBLIOTECA DE EVALUACIONES</b>

Todavía no tienes evaluaciones guardadas.`,
      { reply_markup: { inline_keyboard: [[{ text: '🧠 Crear evaluación IA', callback_data: 'evalAI:menu' }], [{ text: '☰ Todas las opciones', callback_data: 'menu' }]] } },
    );
    return;
  }

  await sendMessage(
    chatId,
    `📚 <b>BIBLIOTECA DE EVALUACIONES</b>

Total guardadas: <b>${Number(result.total || items.length)}</b>

Selecciona una evaluación para abrirla:`,
    { reply_markup: evalLibraryKeyboard(items) },
  );
}

async function showEvalLibraryDetail(chatId, source, index) {
  const state = evalLibraryState.get(String(chatId));
  if (!state || !Array.isArray(state.items) || !state.items[Number(index)]) {
    await showEvalLibrary(chatId, source);
    return;
  }

  const item = state.items[Number(index)];
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botDetalleEvaluacionIA', {
    telegramId,
    id: item.id,
  });

  const detail = result.evaluacion || item;
  state.items[Number(index)] = { ...item, ...detail };
  evalLibraryState.set(String(chatId), state);

  const header = [
    `📚 <b>${escapeHtml(detail.titulo || 'Evaluación')}</b>`,
    '',
    `Tipo: <b>${escapeHtml(detail.tipo || 'Evaluación IA')}</b>`,
    `Materia: <b>${escapeHtml(detail.materia || 'No registrada')}</b>`,
    `Grado/Año: <b>${escapeHtml(detail.grado || 'No registrado')}</b>`,
    `Tema: <b>${escapeHtml(detail.tema || 'No registrado')}</b>`,
  ].join('\n');

  await sendLongTelegramText(
    chatId,
    header,
    detail.contenido || 'Sin contenido.',
    evalLibraryDetailKeyboard(Number(index)),
  );
}

async function reuseEvalLibrary(chatId, source, index) {
  const state = evalLibraryState.get(String(chatId));
  if (!state || !Array.isArray(state.items) || !state.items[Number(index)]) {
    await showEvalLibrary(chatId, source);
    return;
  }

  const item = state.items[Number(index)];
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botDetalleEvaluacionIA', {
    telegramId,
    id: item.id,
  });
  const detail = result.evaluacion || item;

  evalAIState.set(String(chatId), {
    typeCode: 'reuse',
    type: detail.tipo || 'Evaluación IA',
    generated: detail.contenido || '',
    saved: true,
    title: detail.titulo || 'Evaluación reutilizada',
    topic: detail.tema || '',
    matter: detail.materia || '',
    grade: detail.grado || '',
  });

  pendingTextMode.set(String(chatId), 'eval-ai-reuse');

  await sendMessage(
    chatId,
    `♻️ <b>REUTILIZAR EVALUACIÓN</b>

Escribe cómo quieres modificarla.

Ejemplos:
<code>Hazla más corta</code>
<code>Adáptala a 2do grado</code>
<code>Cambia a 10 preguntas</code>

Escribe <code>cancelar</code> para salir.`,
    { reply_markup: { inline_keyboard: [[{ text: '❌ Cancelar', callback_data: 'evalLibrary:menu' }], [{ text: '☰ Todas las opciones', callback_data: 'menu' }]] } },
  );
}

async function regenerateEvalFromLibrary(chatId, source, userText) {
  const state = evalAIState.get(String(chatId));
  if (!state?.generated) {
    await showEvalLibrary(chatId, source);
    return;
  }

  const telegramId = teacherTelegramId(source);
  const context = await callEduGestion('botEvaluacionesIAContexto', { telegramId });
  const data = context.perfil || {};

  const prompt = [
    'Eres un asistente pedagógico de EduGestión.',
    `Docente: ${data.nombre || 'No indicado'}`,
    `Materia: ${data.materia || 'No indicada'}`,
    '',
    'EVALUACIÓN ORIGINAL:',
    state.generated,
    '',
    'CAMBIO SOLICITADO POR EL DOCENTE:',
    String(userText || '').trim(),
    '',
    'Devuelve la evaluación completa ya modificada, lista para usar. No hagas búsqueda web y no inventes referencias oficiales.',
  ].join('\n');

  await sendMessage(chatId, '⏳ <b>Adaptando evaluación con IA…</b>');
  const answer = await callTeacherGemini(prompt);

  state.generated = answer;
  state.saved = false;
  state.title = `${state.type || 'Evaluación IA'} · Adaptada`.slice(0, 100);
  evalAIState.set(String(chatId), state);
  pendingTextMode.delete(String(chatId));

  await sendLongTelegramText(
    chatId,
    '♻️ <b>EVALUACIÓN ADAPTADA</b>',
    answer,
    evalAIResultKeyboard(false),
  );
}

async function deleteEvalLibrary(chatId, source, index) {
  const state = evalLibraryState.get(String(chatId));
  if (!state || !Array.isArray(state.items) || !state.items[Number(index)]) {
    await showEvalLibrary(chatId, source);
    return;
  }

  const item = state.items[Number(index)];
  const telegramId = teacherTelegramId(source);

  await callEduGestion('botEliminarEvaluacionIA', {
    telegramId,
    id: item.id,
  });

  await sendMessage(
    chatId,
    `🗑️ <b>EVALUACIÓN ELIMINADA</b>

La evaluación fue retirada de tu biblioteca.`,
    { reply_markup: { inline_keyboard: [[{ text: '📚 Volver a biblioteca', callback_data: 'evalLibrary:menu' }], [{ text: '☰ Todas las opciones', callback_data: 'menu' }]] } },
  );
}

function teacherAIKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '✏️ Consulta libre', callback_data: 'teacherAI:ask:free' }],
      [{ text: '📋 Ayúdame con una planificación', callback_data: 'teacherAI:ask:planning' }],
      [{ text: '💡 Crear una actividad de clase', callback_data: 'teacherAI:ask:activity' }],
      [{ text: '🧾 Redactar observación pedagógica', callback_data: 'teacherAI:ask:observation' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

function teacherAIResultKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '✏️ Hacer otra consulta', callback_data: 'teacherAI:ask:free' }],
      [{ text: '🤖 Volver al Asistente IA', callback_data: 'teacherAI:menu' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

function teacherAIModeLabel(mode) {
  return ({
    free: 'Consulta libre',
    planning: 'Planificación',
    activity: 'Actividad de clase',
    observation: 'Observación pedagógica',
  })[mode] || 'Consulta libre';
}

function teacherAIInstruction(mode) {
  if (mode === 'planning') {
    return 'Prepara una planificación docente completa, práctica y aplicable. Incluye objetivo, materiales, inicio, desarrollo, cierre, evaluación formativa y variantes cuando sean pertinentes.';
  }
  if (mode === 'activity') {
    return 'Propón una actividad de clase clara y práctica, con propósito, materiales, pasos, duración aproximada, cierre y forma sencilla de observar el aprendizaje.';
  }
  if (mode === 'observation') {
    return 'Redacta una observación pedagógica profesional, respetuosa, constructiva y lista para copiar. No hagas diagnósticos ni inventes información sobre el estudiante.';
  }
  return 'Responde la consulta del docente de forma clara, útil, pedagógica y directamente aplicable.';
}

function geminiEndpointUrl() {
  const raw = String(
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    ''
  ).trim();

  if (!raw) {
    throw new Error('No pude determinar la URL publicada de EduGestión para consultar el Asistente IA.');
  }

  const base = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return `${base.replace(/\/+$/, '')}/api/gemini`;
}

async function callTeacherGemini(message) {
  const response = await fetch(geminiEndpointUrl(), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok) {
    throw new Error(data?.message || 'No se pudo consultar el Asistente IA.');
  }

  return String(data.answer || 'La IA no devolvió una respuesta.').trim();
}

function stripBasicMarkdownForTelegram(value) {
  return String(value || '')
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```[a-z]*\n?/gi, '').replace(/```/g, ''))
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

async function sendLongTelegramText(chatId, title, body, replyMarkup) {
  const clean = stripBasicMarkdownForTelegram(body);
  const max = 3300;
  const parts = [];
  let remaining = clean;

  while (remaining.length > max) {
    let cut = remaining.lastIndexOf('\n', max);
    if (cut < 1800) cut = remaining.lastIndexOf(' ', max);
    if (cut < 1800) cut = max;
    parts.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) parts.push(remaining);

  for (let i = 0; i < parts.length; i++) {
    const prefix = i === 0 ? `${title}\n\n` : `🤖 <b>Continuación</b>\n\n`;
    await sendMessage(
      chatId,
      `${prefix}${escapeHtml(parts[i])}`,
      i === parts.length - 1 && replyMarkup ? { reply_markup: replyMarkup } : {},
    );
  }
}

async function showTeacherAIMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  pendingTextMode.delete(String(chatId));

  const result = await callEduGestion('botPerfilDocente', { telegramId });
  const data = result.perfil || {};
  const grades = Array.isArray(data.grados) ? data.grados : [];

  await sendMessage(
    chatId,
    `🤖 <b>ASISTENTE IA · ADAPTADO A TU PERFIL</b>
━━━━━━━━━━━━━━━━━━

Docente: <b>${escapeHtml(data.nombre || 'Docente')}</b>
Materia: <b>${escapeHtml(data.materia || 'No registrada')}</b>
Grados/Años: <b>${escapeHtml(grades.length ? grades.join(', ') : 'No registrados')}</b>
Año escolar: <b>${escapeHtml(data.anoEscolar || 'No registrado')}</b>

La IA usará automáticamente estos datos como contexto cuando tu consulta sea pedagógica.

Si en tu mensaje indicas otra materia, grado o contexto específico, tendrá prioridad lo que tú escribas.

Selecciona qué deseas hacer:`,
    { reply_markup: teacherAIKeyboard() },
  );
}

async function requestTeacherAIText(chatId, source, mode) {
  const profile = await linkedProfile(teacherTelegramId(source));
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  pendingTextMode.set(String(chatId), `teacher-ai:${mode}`);

  const examples = {
    free: 'Ejemplo: Dame ideas para trabajar coordinación óculo-manual con mi grupo.',
    planning: 'Ejemplo: Equilibrio y coordinación para una clase de 45 minutos.',
    activity: 'Ejemplo: Una actividad divertida para practicar desplazamientos y cambios de dirección.',
    observation: 'Ejemplo: Marcos participa activamente, cumple las actividades y debe mejorar el control del balón.',
  };

  await sendMessage(
    chatId,
    `🤖 <b>${escapeHtml(teacherAIModeLabel(mode))}</b>

Escribe ahora lo que necesitas.

${escapeHtml(examples[mode] || examples.free)}

La respuesta se adaptará automáticamente a tu perfil docente.

Escribe <code>cancelar</code> para salir.`,
    { reply_markup: { inline_keyboard: [[{ text: '❌ Cancelar', callback_data: 'teacherAI:menu' }], [{ text: '☰ Todas las opciones', callback_data: 'menu' }]] } },
  );
}

async function answerTeacherAI(chatId, source, userText, mode) {
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botPerfilDocente', { telegramId });
  const data = result.perfil || {};
  const grades = Array.isArray(data.grados) ? data.grados.filter(Boolean) : [];
  const sections = Array.isArray(data.secciones) ? data.secciones : [];

  const prompt = [
    'CONTEXTO DEL PERFIL DOCENTE DE EDUGESTIÓN:',
    `- Docente: ${data.nombre || 'No indicado'}`,
    `- Área o materia principal: ${data.materia || 'No indicada'}`,
    `- Grados/Años que atiende: ${grades.length ? grades.join(', ') : 'No indicados'}`,
    `- Año escolar: ${data.anoEscolar || 'No indicado'}`,
    `- Cursos/secciones: ${sections.length ? sections.map(x => `${x.ano || ''} ${x.seccion || ''} ${x.turno || ''}`.trim()).join('; ') : 'No indicados'}`,
    '',
    'INSTRUCCIONES DE PERSONALIZACIÓN:',
    '- Adapta la respuesta al área o materia del perfil cuando la consulta sea pedagógica o escolar.',
    '- Si la consulta indica otra materia, grado, año, tema o contexto específico, respeta primero lo escrito por el docente.',
    '- No inventes datos institucionales, contenidos oficiales, diagnósticos ni referencias curriculares no proporcionadas.',
    '- No realices búsqueda web.',
    '- Usa lenguaje claro, profesional y útil para un docente.',
    `- Tarea solicitada: ${teacherAIInstruction(mode)}`,
    '',
    'CONSULTA DEL DOCENTE:',
    String(userText || '').trim(),
  ].join('\n');

  await sendMessage(chatId, '⏳ <b>Consultando al Asistente IA…</b>');

  const answer = await callTeacherGemini(prompt);
  pendingTextMode.delete(String(chatId));

  await sendLongTelegramText(
    chatId,
    '🤖 <b>RESPUESTA DE LA IA</b>',
    answer,
    teacherAIResultKeyboard(),
  );
}

function teacherProfileKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '🔄 Actualizar perfil', callback_data: 'teacherProfile:menu' }],
      [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
    ],
  };
}

async function showTeacherProfile(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  const result = await callEduGestion('botPerfilDocente', { telegramId });
  const data = result.perfil || {};
  const tg = result.telegram || {};
  const sections = Array.isArray(data.secciones) ? data.secciones : [];
  const grades = Array.isArray(data.grados) ? data.grados : [];

  const sectionsText = sections.length
    ? sections.map((item, i) =>
        `${i + 1}. ${escapeHtml(item.ano || 'Curso')} · Sección ${escapeHtml(item.seccion || '—')}${item.turno ? ` · ${escapeHtml(item.turno)}` : ''}`
      ).join('\n')
    : 'Sin cursos o secciones asignadas.';

  const gradesText = grades.length
    ? grades.map((g) => escapeHtml(g)).join(', ')
    : 'No registrados';

  const telegramUser = tg.usuarioTelegram
    ? `@${escapeHtml(String(tg.usuarioTelegram).replace(/^@/, ''))}`
    : 'No registrado';

  await sendMessage(
    chatId,
    `👤 <b>MI PERFIL DOCENTE</b>
━━━━━━━━━━━━━━━━━━

<b>Nombre:</b> ${escapeHtml(data.nombre || 'No registrado')}
<b>Usuario:</b> ${escapeHtml(data.usuario || 'No registrado')}
<b>Correo:</b> ${escapeHtml(data.email || 'No registrado')}
<b>Materia:</b> ${escapeHtml(data.materia || 'No registrada')}
<b>Año escolar:</b> ${escapeHtml(data.anoEscolar || 'No registrado')}
<b>Estado:</b> ${data.activo ? '✅ ACTIVO' : '⛔ INACTIVO'}

🎓 <b>GRADOS / AÑOS</b>
${gradesText}

🏫 <b>CURSOS Y SECCIONES</b>
${sectionsText}

📚 <b>Total de cursos:</b> ${Number(data.totalCursos || sections.length)}

📲 <b>TELEGRAM</b>
Vinculado: ${tg.vinculado ? '✅ Sí' : '❌ No'}
Usuario Telegram: ${telegramUser}

━━━━━━━━━━━━━━━━━━
Este perfil se toma directamente de tu cuenta vinculada de EduGestión.`,
    { reply_markup: teacherProfileKeyboard() },
  );
}

async function showStudyControlMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  const result = await callEduGestion('botControlEstudioContexto', { telegramId });
  const courses = Array.isArray(result.cursos) ? result.cursos : [];

  studyControlState.set(String(chatId), {
    courses,
    lapso: '',
    lapsoCode: '',
    course: null,
    section: null,
  });

  await sendMessage(
    chatId,
    `📊 <b>CONTROL DE ESTUDIO</b>

Docente: <b>${escapeHtml(result.profesor?.nombre || 'Docente')}</b>
Materia: <b>${escapeHtml(result.profesor?.materia || 'Sin materia asignada')}</b>

Desde aquí puedes revisar el control académico de cada sección y estudiante.

Selecciona el lapso:`,
    { reply_markup: studyControlLapsoKeyboard() },
  );
}

async function chooseStudyControlLapso(chatId, source, lapsoCode) {
  const telegramId = teacherTelegramId(source);
  let state = studyControlState.get(String(chatId));

  if (!state || !Array.isArray(state.courses)) {
    const result = await callEduGestion('botControlEstudioContexto', { telegramId });
    state = {
      courses: Array.isArray(result.cursos) ? result.cursos : [],
      lapso: '',
      lapsoCode: '',
      course: null,
      section: null,
    };
  }

  const lapso = gradesLapsoFromCode(lapsoCode);
  state.lapso = lapso;
  state.lapsoCode = lapsoCode;
  state.course = null;
  state.section = null;
  studyControlState.set(String(chatId), state);

  if (!state.courses.length) {
    await sendMessage(
      chatId,
      `⚠️ No encontré cursos con estudiantes registrados.`,
      { reply_markup: studyControlLapsoKeyboard() },
    );
    return;
  }

  await sendMessage(
    chatId,
    `📊 <b>${escapeHtml(lapso)}</b>

Selecciona el curso o sección:`,
    { reply_markup: studyControlCoursesKeyboard(state.courses, lapsoCode) },
  );
}

async function showStudyControlSection(chatId, source, lapsoCode, index) {
  const state = studyControlState.get(String(chatId));
  if (!state || !Array.isArray(state.courses)) {
    await showStudyControlMenu(chatId, source);
    return;
  }

  const course = state.courses[Number(index)];
  if (!course) {
    await showStudyControlMenu(chatId, source);
    return;
  }

  const telegramId = teacherTelegramId(source);
  const lapso = gradesLapsoFromCode(lapsoCode);

  const result = await callEduGestion('botControlEstudioSeccion', {
    telegramId,
    lapso,
    ano: course.ano,
    seccion: course.seccion,
    turno: course.turno || '',
  });

  state.lapso = result.lapso || lapso;
  state.lapsoCode = lapsoCode;
  state.course = course;
  state.section = result;
  studyControlState.set(String(chatId), state);

  const avg = result.promedioSeccion === null || result.promedioSeccion === undefined
    ? 'Sin promedio'
    : `${Number(result.promedioSeccion).toFixed(2)}/20`;

  const attendance = result.asistencia || {};
  const students = Array.isArray(result.estudiantes) ? result.estudiantes : [];
  const closureText = result.cierre
    ? `${result.cierre.estado === 'ENVIADO' ? '✅' : '🕓'} ${escapeHtml(result.cierre.estado)}${result.cierre.fecha ? ` · ${escapeHtml(result.cierre.fecha)}` : ''}`
    : 'Sin cierre registrado';

  await sendMessage(
    chatId,
    `📊 <b>CONTROL DE ESTUDIO · SECCIÓN</b>
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

📦 <b>CIERRE DEL LAPSO</b>
${closureText}

━━━━━━━━━━━━━━━━━━
Selecciona un estudiante para ver su control individual:`,
    { reply_markup: studyControlSectionKeyboard(students) },
  );
}

async function showStudyControlStudent(chatId, source, studentIndex) {
  const state = studyControlState.get(String(chatId));
  if (!state?.section || !Array.isArray(state.section.estudiantes)) {
    await showStudyControlMenu(chatId, source);
    return;
  }

  const studentRow = state.section.estudiantes[Number(studentIndex)];
  if (!studentRow) {
    await sendMessage(chatId, '⚠️ No encontré ese estudiante en la sección.', {
      reply_markup: studyControlStudentKeyboard(),
    });
    return;
  }

  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botControlEstudioEstudiante', {
    telegramId,
    idAlumno: studentRow.idAlumno || '',
    lapso: state.lapso,
  });

  const student = result.estudiante || {};
  const academic = result.resumenAcademico || {};
  const attendance = result.asistencia || {};
  const activities = Array.isArray(result.actividades) ? result.actividades : [];

  const avg = academic.promedioLapso === null || academic.promedioLapso === undefined
    ? 'Sin promedio'
    : `${Number(academic.promedioLapso).toFixed(2)}/20`;

  const activitiesText = activities.length
    ? activities.map((item, i) => {
        const grade = item.nota === null || item.nota === undefined
          ? 'Sin nota'
          : `${Number(item.nota).toFixed(2)}/20`;
        return `${i + 1}. ${item.entrego ? '✅' : '❌'} ${escapeHtml(item.actividad || 'Actividad')}\n   ${Number(item.ponderacion || 0)}% · ${grade}`;
      }).join('\n')
    : 'Sin actividades registradas.';

  const statusLabel = result.estadoAcademico === 'APROBADO'
    ? '✅ APROBADO'
    : result.estadoAcademico === 'REPROBADO'
      ? '❌ REPROBADO'
      : '⚪ SIN NOTA';

  await sendMessage(
    chatId,
    `📊 <b>CONTROL INDIVIDUAL</b>
━━━━━━━━━━━━━━━━━━

👨‍🎓 <b>${escapeHtml(student.nombre || studentRow.alumno || 'Estudiante')}</b>
Cédula: ${escapeHtml(student.cedula || 'No registrada')}
Curso: ${escapeHtml(student.ano || state.course?.ano || 'No registrado')} · Sección ${escapeHtml(student.seccion || state.course?.seccion || '—')}
Lapso: <b>${escapeHtml(result.lapso || state.lapso)}</b>

📋 <b>ASISTENCIA</b>
Presentes: <b>${Number(attendance.presentes || 0)}</b>
Ausentes: <b>${Number(attendance.ausentes || 0)}</b>
Tardanzas: <b>${Number(attendance.tardanzas || 0)}</b>
Justificadas: <b>${Number(attendance.justificadas || 0)}</b>

📝 <b>RENDIMIENTO</b>
Actividades: <b>${Number(academic.totalActividades || 0)}</b>
Entregadas: <b>${Number(academic.entregadas || 0)}</b>
No entregadas: <b>${Number(academic.noEntregadas || 0)}</b>
Promedio: <b>${avg}</b>
Estado: <b>${statusLabel}</b>

📚 <b>DETALLE DE ACTIVIDADES</b>
${activitiesText}`,
    { reply_markup: studyControlStudentKeyboard() },
  );
}

async function showClosureHistory(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const profile = await linkedProfile(telegramId);
  if (!profile) {
    await showLinkInstructions(chatId);
    return;
  }

  const result = await callEduGestion('botHistorialCierres', {
    telegramId,
    limite: 30,
  });

  const items = Array.isArray(result.cierres) ? result.cierres : [];
  closureHistoryState.set(String(chatId), { items });

  if (!items.length) {
    await sendMessage(
      chatId,
      `📚 <b>HISTORIAL DE CIERRES</b>

Todavía no hay cierres registrados para este profesor.`,
      { reply_markup: mainMenuKeyboard(true) },
    );
    return;
  }

  await sendMessage(
    chatId,
    `📚 <b>HISTORIAL DE CIERRES</b>

Total: <b>${Number(result.total || items.length)}</b>
✅ Enviados: <b>${Number(result.enviados || 0)}</b>
🕓 Pendientes: <b>${Number(result.pendientes || 0)}</b>

Selecciona un cierre para ver su detalle:`,
    { reply_markup: closureHistoryListKeyboard(items) },
  );
}

async function showClosureHistoryDetail(chatId, source, index) {
  let state = closureHistoryState.get(String(chatId));
  if (!state || !Array.isArray(state.items) || !state.items[Number(index)]) {
    await showClosureHistory(chatId, source);
    return;
  }

  const item = state.items[Number(index)];
  const telegramId = teacherTelegramId(source);
  const result = await callEduGestion('botDetalleCierre', {
    telegramId,
    id: item.id,
  });

  const cierre = result.cierre || item;
  state.items[Number(index)] = cierre;
  closureHistoryState.set(String(chatId), state);

  await sendMessage(
    chatId,
    `📚 <b>DETALLE DEL CIERRE</b>
━━━━━━━━━━━━━━━━━━

Estado: <b>${cierre.enviado ? '✅ ENVIADO' : '🕓 PENDIENTE'}</b>
Lapso: <b>${escapeHtml(cierre.lapso || 'No registrado')}</b>
Curso: <b>${escapeHtml(cierre.ano || 'No registrado')} · Sección ${escapeHtml(cierre.seccion || '—')}</b>
Turno: <b>${escapeHtml(cierre.turno || 'No registrado')}</b>

Docente: <b>${escapeHtml(cierre.docente || 'No registrado')}</b>
Materia: <b>${escapeHtml(cierre.materia || 'No registrada')}</b>

Acción: ${escapeHtml(cierre.accion || 'Cierre registrado')}
Medio: ${escapeHtml(cierre.medio || 'No registrado')}
Fecha: ${escapeHtml(cierre.fecha || cierre.creadoEn || 'No registrada')}

━━━━━━━━━━━━━━━━━━
Puedes cambiar el estado del cierre desde aquí.`,
    { reply_markup: closureHistoryDetailKeyboard(Number(index), Boolean(cierre.enviado)) },
  );
}

async function toggleClosureHistoryState(chatId, source, index) {
  const state = closureHistoryState.get(String(chatId));
  if (!state || !Array.isArray(state.items) || !state.items[Number(index)]) {
    await showClosureHistory(chatId, source);
    return;
  }

  const current = state.items[Number(index)];
  const telegramId = teacherTelegramId(source);

  const result = await callEduGestion('botActualizarEstadoCierre', {
    telegramId,
    id: current.id,
    enviado: !Boolean(current.enviado),
  });

  const updated = result.cierre || { ...current, enviado: !Boolean(current.enviado) };
  state.items[Number(index)] = updated;
  closureHistoryState.set(String(chatId), state);

  await sendMessage(
    chatId,
    `${updated.enviado ? '✅' : '🕓'} <b>ESTADO ACTUALIZADO</b>

El cierre quedó marcado como <b>${updated.enviado ? 'ENVIADO' : 'PENDIENTE'}</b>.`,
    { reply_markup: closureHistoryDetailKeyboard(Number(index), Boolean(updated.enviado)) },
  );
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
    ? 'ℹ️ <b>Ayuda de EduGestión</b>\n\n• /menu abre el menú principal.\n• /hoy muestra las clases del día.\n• /asistencia inicia el registro.\n• /consultar muestra el detalle de asistencia del día.\n• /estudiantes abre la consulta de estudiantes.\n• /ficha abre la ficha académica completa.\n• /boletin abre los boletines por estudiante.\n• /cierre abre el cierre de lapso.\n• /historialcierre abre el historial de cierres.\n• /controlestudio abre Control de Estudio.\n• /perfil abre Mi perfil docente.\n• /ia abre el Asistente IA adaptado a tu perfil.\n• /evaluacion abre Evaluaciones IA.\n• /bibliotecaeval abre la Biblioteca de evaluaciones.\n• /cuadernillo abre el Cuadernillo Curricular de Educación Física.\n• /seguimiento abre el Seguimiento curricular.\n• /panellapso abre el Panel curricular por lapso.\n• /panelanual abre el Panel curricular anual.\n• /calendario abre el Calendario docente.\n• /biblioteca abre la Biblioteca digital.\n• /respuestasia abre las Respuestas IA guardadas.\n• /direccion abre el panel de Dirección (solo director).\n• /alertas abre el Centro de alertas.\n• Toca ☰ TODAS LAS OPCIONES para abrir el menú completo sin escribir comandos.\n• /planificacion muestra próximas evaluaciones.\n• /estadisticas muestra resúmenes de asistencia.\n• /informe genera un PDF de asistencia.\n• /actas consulta las actas académicas.\n• /estado muestra la cuenta vinculada.\n• /jornada abre tu asistencia laboral.\n• /ausencia MOTIVO registra una ausencia.\n\nPara pasar o corregir asistencia, abre una clase y escribe:\n<code>A: 2,5; T: 3; J: 4</code>\n\nA = ausente · T = tardanza · J = justificada. Los demás quedan presentes.'
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

  if (/^\/(historialcierre|historialcierres)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showClosureHistory(chatId, message);
    return;
  }

  if (/^\/(controlestudio|control)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showStudyControlMenu(chatId, message);
    return;
  }

  if (/^\/(perfil|miperfil)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showTeacherProfile(chatId, message);
    return;
  }

  if (/^\/(ia|asistente)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showTeacherAIMenu(chatId, message);
    return;
  }

  if (/^\/(evaluacion|evaluaciones|evaluacionia)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showEvalAIMenu(chatId, message);
    return;
  }

  if (/^\/(bibliotecaeval|bibliotecaevaluaciones)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showEvalLibrary(chatId, message);
    return;
  }

  if (/^\/(cuadernillo|curriculo|curriculum)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showCurriculumEFMenu(chatId, message);
    return;
  }

  if (/^\/(seguimiento|seguimientocurricular|curricular)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showCurrTrackMenu(chatId, message);
    return;
  }

  if (/^\/(panelcurricular|panellapso|lapso)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showCurrPanelMenu(chatId, message);
    return;
  }

  if (/^\/(panelanual|anual)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showCurrPanelAnnualMenu(chatId, message);
    return;
  }

  if (/^\/(calendario|calendar)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showTeacherCalendarMenu(chatId, message);
    return;
  }

  if (/^\/(biblioteca|bibliotecadigital|recursos)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showDigitalLibraryMenu(chatId, message);
    return;
  }

  if (/^\/(respuestasia|ia_guardada|respuestasguardadas)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showSavedAIMenu(chatId, message);
    return;
  }

  if (/^\/(direccion|director|paneldirector)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showDirectorMenu(chatId, message);
    return;
  }

  
  if (/^\/(chat|chatinterno|mensajes)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showChatMenu(chatId, message);
    return;
  }

if (/^\/(alertas|alerta|avisos)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showAlertsMenu(chatId, message);
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

    if (String(mode || '').startsWith('calendar-')) {
      await handleTeacherCalendarText(chatId, message, text, mode);
      return;
    }

    if (String(mode || '').startsWith('library-')) {
      await handleDigitalLibraryText(chatId, message, text, mode);
      return;
    }

    if (String(mode || '').startsWith('saved-ai-')) {
      await handleSavedAIText(chatId, message, text, mode);
      return;
    }

    if (String(mode || '').startsWith('director-')) {
      await handleDirectorText(chatId, message, text, mode);
      return;
    }

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
    
    if (mode === 'chat-reply') {
      if (String(text).trim().toLowerCase() === 'cancelar') {
        clearPendingTextMode(message);
        await showChatMenu(chatId, message);
      } else {
        await sendChatReply(chatId, message, text);
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

    if (String(mode || '').startsWith('teacher-ai:')) {
      if (String(text).trim().toLowerCase() === 'cancelar') {
        pendingTextMode.delete(String(chatId));
        await showTeacherAIMenu(chatId, message);
      } else {
        const aiMode = String(mode).split(':')[1] || 'free';
        await answerTeacherAI(chatId, message, text, aiMode);
      }
      return;
    }

    if (String(mode || '').startsWith('eval-ai:')) {
      if (String(text).trim().toLowerCase() === 'cancelar') {
        pendingTextMode.delete(String(chatId));
        await showEvalAIMenu(chatId, message);
      } else {
        const typeCode = String(mode).split(':')[1] || 'short';
        await generateEvalAI(chatId, message, text, typeCode);
      }
      return;
    }

    if (String(mode || '') === 'eval-ai-reuse') {
      if (String(text).trim().toLowerCase() === 'cancelar') {
        pendingTextMode.delete(String(chatId));
        await showEvalLibrary(chatId, message);
      } else {
        await regenerateEvalFromLibrary(chatId, message, text);
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
    pendingTextMode.delete(String(chatId));
    await showMainMenu(chatId, callbackQuery);
    return;
  }

  
  if (data === 'chat:menu') {
    await showChatMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'chat:list') {
    await showChatConversations(chatId, callbackQuery);
    return;
  }
  if (data === 'chat:unread') {
    await showChatUnread(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('chat:open:')) {
    const index = Number(data.split(':')[2]);
    await openChatConversation(chatId, callbackQuery, index);
    return;
  }
  if (data === 'chat:reply') {
    await startChatReply(chatId, callbackQuery);
    return;
  }
  if (data === 'chat:mark') {
    await markChatRead(chatId, callbackQuery);
    return;
  }

if (data === 'alerts:menu') {
    await showAlertsMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'alerts:list') {
    await showAlertsList(chatId, callbackQuery);
    return;
  }
  if (data === 'alerts:high') {
    await showAlertsList(chatId, callbackQuery, { prioridad: 'ALTA' });
    return;
  }
  if (data === 'alerts:summary') {
    await showAlertsSummary(chatId, callbackQuery);
    return;
  }

  if (data === 'director:menu') {
    await showDirectorMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'director:teachers') {
    await showDirectorTeachers(chatId, callbackQuery);
    return;
  }
  if (data === 'director:summary') {
    await showDirectorSummary(chatId, callbackQuery);
    return;
  }
  if (data === 'director:search') {
    await startDirectorSearch(chatId);
    return;
  }
  if (data.startsWith('director:teacher:')) {
    await showDirectorTeacherDetail(chatId, callbackQuery, data.slice('director:teacher:'.length));
    return;
  }

  if (data === 'savedAI:menu') {
    await showSavedAIMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'savedAI:list') {
    await showSavedAIList(chatId, callbackQuery);
    return;
  }
  if (data === 'savedAI:search') {
    await startSavedAISearch(chatId);
    return;
  }
  if (data === 'savedAI:summary') {
    await showSavedAISummary(chatId, callbackQuery);
    return;
  }
  if (data === 'savedAI:saveReuse') {
    await saveReusedAIItem(chatId, callbackQuery);
    return;
  }
  if (data === 'savedAI:saveEvalCurrent') {
    const state = evalAIState.get(String(chatId)) || {};
    const answer = state.generated || '';
    await saveAIResponseToBackend(chatId, callbackQuery, {
      titulo: state.title || `Evaluación IA · ${state.topic || 'Tema'}`,
      tipo: 'Evaluación',
      consulta: state.topic || '',
      respuesta: answer,
      materia: state.matter || '',
      grado: state.grade || '',
      tema: state.topic || '',
      origen: 'Telegram · Evaluaciones IA',
    });
    return;
  }
  if (data.startsWith('savedAI:item:')) {
    await showSavedAIItem(chatId, callbackQuery, data.slice('savedAI:item:'.length));
    return;
  }
  if (data.startsWith('savedAI:reuse:')) {
    await reuseSavedAIItem(chatId, callbackQuery, data.slice('savedAI:reuse:'.length));
    return;
  }
  if (data.startsWith('savedAI:deleteAsk:')) {
    const id = data.slice('savedAI:deleteAsk:'.length);
    await sendMessage(
      chatId,
      '⚠️ ¿Seguro que deseas eliminar esta respuesta IA?',
      { reply_markup: { inline_keyboard: [
        [{ text: '🗑️ Sí, eliminar', callback_data: `savedAI:delete:${id}` }],
        [{ text: '❌ No eliminar', callback_data: `savedAI:item:${id}` }],
      ] } },
    );
    return;
  }
  if (data.startsWith('savedAI:delete:')) {
    await deleteSavedAIItem(chatId, callbackQuery, data.slice('savedAI:delete:'.length));
    return;
  }

  if (data === 'digitalLibrary:menu') {
    await showDigitalLibraryMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'digitalLibrary:create') {
    await startDigitalLibraryCreate(chatId);
    return;
  }
  if (data === 'digitalLibrary:search') {
    await startDigitalLibrarySearch(chatId);
    return;
  }
  if (data === 'digitalLibrary:list') {
    await showDigitalLibraryList(chatId, callbackQuery);
    return;
  }
  if (data === 'digitalLibrary:summary') {
    await showDigitalLibrarySummary(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('digitalLibrary:type:')) {
    await chooseDigitalLibraryType(chatId, decodeURIComponent(data.slice('digitalLibrary:type:'.length)));
    return;
  }
  if (data.startsWith('digitalLibrary:category:')) {
    await chooseDigitalLibraryCategory(chatId, decodeURIComponent(data.slice('digitalLibrary:category:'.length)));
    return;
  }
  if (data.startsWith('digitalLibrary:item:')) {
    await showDigitalLibraryItem(chatId, callbackQuery, data.slice('digitalLibrary:item:'.length));
    return;
  }
  if (data.startsWith('digitalLibrary:deleteAsk:')) {
    const id = data.slice('digitalLibrary:deleteAsk:'.length);
    await sendMessage(
      chatId,
      '⚠️ ¿Seguro que deseas eliminar este recurso?',
      { reply_markup: { inline_keyboard: [
        [{ text: '🗑️ Sí, eliminar', callback_data: `digitalLibrary:delete:${id}` }],
        [{ text: '❌ No eliminar', callback_data: `digitalLibrary:item:${id}` }],
      ] } },
    );
    return;
  }
  if (data.startsWith('digitalLibrary:delete:')) {
    await deleteDigitalLibraryItem(chatId, callbackQuery, data.slice('digitalLibrary:delete:'.length));
    return;
  }

  if (data === 'teacherCalendar:menu') {
    await showTeacherCalendarMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'teacherCalendar:create') {
    await startTeacherCalendarCreate(chatId);
    return;
  }
  if (data === 'teacherCalendar:list') {
    await showTeacherCalendarList(chatId, callbackQuery);
    return;
  }
  if (data === 'teacherCalendar:summary') {
    await showTeacherCalendarSummary(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('teacherCalendar:type:')) {
    await chooseTeacherCalendarType(chatId, decodeURIComponent(data.slice('teacherCalendar:type:'.length)));
    return;
  }
  if (data.startsWith('teacherCalendar:event:')) {
    await showTeacherCalendarEvent(chatId, callbackQuery, data.slice('teacherCalendar:event:'.length));
    return;
  }
  if (data.startsWith('teacherCalendar:status:')) {
    const parts = data.split(':');
    await updateTeacherCalendarStatus(chatId, callbackQuery, parts[2] || '', parts[3] || 'Pendiente');
    return;
  }
  if (data.startsWith('teacherCalendar:deleteAsk:')) {
    const id = data.slice('teacherCalendar:deleteAsk:'.length);
    await sendMessage(
      chatId,
      '⚠️ ¿Seguro que deseas eliminar este evento?',
      { reply_markup: { inline_keyboard: [
        [{ text: '🗑️ Sí, eliminar', callback_data: `teacherCalendar:delete:${id}` }],
        [{ text: '❌ No eliminar', callback_data: `teacherCalendar:event:${id}` }],
      ] } },
    );
    return;
  }
  if (data.startsWith('teacherCalendar:delete:')) {
    await deleteTeacherCalendarEvent(chatId, callbackQuery, data.slice('teacherCalendar:delete:'.length));
    return;
  }

  if (data === 'currPanel:menu') {
    await showCurrPanelMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'currPanel:annualMenu') {
    await showCurrPanelAnnualMenu(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('currPanel:annualLevel:')) {
    const level = decodeURIComponent(data.slice('currPanel:annualLevel:'.length));
    await showCurrPanelAnnual(chatId, callbackQuery, level);
    return;
  }
  if (data.startsWith('currPanel:level:')) {
    const level = decodeURIComponent(data.slice('currPanel:level:'.length));
    await showCurrPanelLevel(chatId, callbackQuery, level);
    return;
  }
  if (data.startsWith('currPanel:lapso:')) {
    const parts = data.split(':');
    const level = decodeURIComponent(parts[2] || '');
    const lapso = decodeURIComponent(parts[3] || '');
    await showCurrPanelLapso(chatId, callbackQuery, level, lapso);
    return;
  }
  if (data.startsWith('currPanel:assignMenu:')) {
    const parts = data.split(':');
    const level = decodeURIComponent(parts[2] || '');
    const lapso = decodeURIComponent(parts[3] || '');
    await showCurrPanelAssignMenu(chatId, callbackQuery, level, lapso);
    return;
  }
  if (data.startsWith('currPanel:assign:')) {
    const parts = data.split(':');
    const level = decodeURIComponent(parts[2] || '');
    const lapso = decodeURIComponent(parts[3] || '');
    const index = Number(parts[4]);
    await assignCurrPanelTopic(chatId, callbackQuery, level, lapso, index);
    return;
  }
  if (data.startsWith('currPanel:topic:')) {
    const parts = data.split(':');
    const level = decodeURIComponent(parts[2] || '');
    const lapso = decodeURIComponent(parts[3] || '');
    const index = Number(parts[4]);
    await showCurrPanelTopic(chatId, callbackQuery, level, lapso, index);
    return;
  }

  if (data === 'currTrack:menu') {
    await showCurrTrackMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'currTrack:summary') {
    await showCurrTrackSummary(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('currTrack:level:')) {
    const level = decodeURIComponent(data.slice('currTrack:level:'.length));
    await showCurrTrackLevel(chatId, callbackQuery, level);
    return;
  }
  if (data.startsWith('currTrack:topic:')) {
    const parts = data.split(':');
    const level = decodeURIComponent(parts[2] || '');
    const index = Number(parts[3]);
    await showCurrTrackTopic(chatId, callbackQuery, level, index);
    return;
  }
  if (data.startsWith('currTrack:back:')) {
    const level = decodeURIComponent(data.slice('currTrack:back:'.length));
    await showCurrTrackLevel(chatId, callbackQuery, level);
    return;
  }
  if (data.startsWith('currTrack:set:')) {
    const parts = data.split(':');
    const level = decodeURIComponent(parts[2] || '');
    const index = Number(parts[3]);
    const status = parts[4] || 'Pendiente';
    await setCurrTrackStatus(chatId, callbackQuery, level, index, status);
    return;
  }

  if (data === 'curriculumEF:menu') {
    await showCurriculumEFMenu(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('curriculumEF:level:')) {
    const level = decodeURIComponent(data.slice('curriculumEF:level:'.length));
    await showCurriculumEFTopics(chatId, callbackQuery, level);
    return;
  }
  if (data.startsWith('curriculumEF:topic:')) {
    const parts = data.split(':');
    await showCurriculumEFDetail(chatId, callbackQuery, decodeURIComponent(parts[2] || ''), Number(parts[3]));
    return;
  }
  if (data.startsWith('curriculumEF:back:')) {
    await showCurriculumEFTopics(chatId, callbackQuery, decodeURIComponent(data.slice('curriculumEF:back:'.length)));
    return;
  }
  if (data.startsWith('curriculumEF:plan:')) {
    const parts = data.split(':');
    await curriculumPlanWithAI(chatId, callbackQuery, decodeURIComponent(parts[2] || ''), Number(parts[3]));
    return;
  }
  if (data.startsWith('curriculumEF:eval:')) {
    const parts = data.split(':');
    await curriculumEvalWithAI(chatId, callbackQuery, decodeURIComponent(parts[2] || ''), Number(parts[3]));
    return;
  }

  if (data === 'evalAI:menu') {
    await showEvalAIMenu(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('evalAI:type:')) {
    await startEvalAI(chatId, callbackQuery, data.split(':')[2] || 'short');
    return;
  }
  if (data === 'evalAI:save') {
    await saveGeneratedEval(chatId, callbackQuery);
    return;
  }
  if (data === 'evalLibrary:menu') {
    await showEvalLibrary(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('evalLibrary:detail:')) {
    await showEvalLibraryDetail(chatId, callbackQuery, Number(data.split(':')[2]));
    return;
  }
  if (data.startsWith('evalLibrary:reuse:')) {
    await reuseEvalLibrary(chatId, callbackQuery, Number(data.split(':')[2]));
    return;
  }
  if (data.startsWith('evalLibrary:delete:')) {
    await deleteEvalLibrary(chatId, callbackQuery, Number(data.split(':')[2]));
    return;
  }

  if (data === 'teacherAI:menu') {
    await showTeacherAIMenu(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('teacherAI:ask:')) {
    const mode = data.split(':')[2] || 'free';
    await requestTeacherAIText(chatId, callbackQuery, mode);
    return;
  }

  if (data === 'teacherProfile:menu') {
    await showTeacherProfile(chatId, callbackQuery);
    return;
  }

  if (data === 'studyControl:menu') {
    await showStudyControlMenu(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('studyControl:lapso:')) {
    await chooseStudyControlLapso(chatId, callbackQuery, data.split(':')[2]);
    return;
  }
  if (data.startsWith('studyControl:course:')) {
    const parts = data.split(':');
    await showStudyControlSection(chatId, callbackQuery, parts[2], Number(parts[3]));
    return;
  }
  if (data.startsWith('studyControl:student:')) {
    await showStudyControlStudent(chatId, callbackQuery, Number(data.split(':')[2]));
    return;
  }
  if (data === 'studyControl:section') {
    const state = studyControlState.get(String(chatId));
    if (state?.lapsoCode && state?.course && Array.isArray(state.courses)) {
      const index = state.courses.findIndex((course) =>
        String(course.ano || '') === String(state.course.ano || '') &&
        String(course.seccion || '') === String(state.course.seccion || '') &&
        String(course.turno || '') === String(state.course.turno || '')
      );
      if (index >= 0) {
        await showStudyControlSection(chatId, callbackQuery, state.lapsoCode, index);
        return;
      }
    }
    await showStudyControlMenu(chatId, callbackQuery);
    return;
  }
  if (data === 'studyControl:backCourses') {
    const state = studyControlState.get(String(chatId));
    if (state?.lapsoCode) await chooseStudyControlLapso(chatId, callbackQuery, state.lapsoCode);
    else await showStudyControlMenu(chatId, callbackQuery);
    return;
  }

  if (data === 'closureHistory:menu') {
    await showClosureHistory(chatId, callbackQuery);
    return;
  }
  if (data.startsWith('closureHistory:detail:')) {
    const index = Number(data.split(':')[2]);
    await showClosureHistoryDetail(chatId, callbackQuery, index);
    return;
  }
  if (data.startsWith('closureHistory:toggle:')) {
    const index = Number(data.split(':')[2]);
    await toggleClosureHistoryState(chatId, callbackQuery, index);
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


/* =========================================================
   EduGestión · FASE 18 · CHAT INTERNO TELEGRAM UI
   Dirección ↔ Docente usando la misma hoja ChatInterno.
   ========================================================= */

function chatRoleLabel(role) {
  return String(role || '').toLowerCase() === 'director' ? 'Dirección' : 'Docente';
}

function formatChatDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw.slice(0, 19);
  try {
    return new Intl.DateTimeFormat('es-VE', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Caracas',
    }).format(date);
  } catch (_) {
    return raw.slice(0, 19);
  }
}

function chatMenuKeyboard(role) {
  const rows = [];
  if (String(role || '').toLowerCase() === 'director') {
    rows.push([{ text: '👩‍🏫 Conversaciones', callback_data: 'chat:list' }]);
  } else {
    rows.push([{ text: '💬 Abrir conversación', callback_data: 'chat:list' }]);
  }
  rows.push([{ text: '🔵 No leídos', callback_data: 'chat:unread' }]);
  rows.push([{ text: '🔄 Actualizar', callback_data: 'chat:menu' }]);
  rows.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

async function showChatMenu(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const data = await callEduGestion('botChatContexto', { telegramId });
  const role = String(data.rol || 'docente').toLowerCase();
  const unread = Number(data.noLeidos || 0);
  const account = data.cuenta || {};

  const roleLine = role === 'director'
    ? 'Puedes conversar con los docentes desde Telegram.'
    : 'Puedes conversar directamente con Dirección desde Telegram.';

  await sendMessage(
    chatId,
    `💬 <b>Chat interno</b>\n\n` +
    `Cuenta: <b>${escapeHtml(account.nombre || teacherName(source) || 'Usuario')}</b>\n` +
    `Rol: <b>${escapeHtml(chatRoleLabel(role))}</b>\n` +
    `Mensajes no leídos: <b>${unread}</b>\n\n` +
    `${escapeHtml(roleLine)}\n\n` +
    `Los mensajes se sincronizan con el chat de la plataforma web.`,
    { reply_markup: chatMenuKeyboard(role) },
  );
}

async function showChatConversations(chatId, source, onlyUnread = false) {
  const telegramId = teacherTelegramId(source);
  const context = await callEduGestion('botChatContexto', { telegramId });
  const role = String(context.rol || 'docente').toLowerCase();

  if (role !== 'director') {
    await openChatConversation(chatId, source, 0, true);
    return;
  }

  const data = await callEduGestion('botChatConversaciones', { telegramId });
  let items = Array.isArray(data.conversaciones) ? data.conversaciones : [];
  if (onlyUnread) items = items.filter(item => Number(item.noLeidos || 0) > 0);

  setPendingData(source, 'chat-conversations', {
    role,
    items,
  });

  if (!items.length) {
    await sendMessage(
      chatId,
      onlyUnread
        ? '✅ <b>No tienes mensajes nuevos</b>\n\nNo hay conversaciones pendientes por leer.'
        : '💬 <b>Conversaciones</b>\n\nAún no hay conversaciones disponibles.',
      { reply_markup: chatMenuKeyboard(role) },
    );
    return;
  }

  const keyboard = items.slice(0, 40).map((item, index) => {
    const unread = Number(item.noLeidos || 0);
    const prefix = unread > 0 ? `🔵 ${unread} · ` : '';
    const name = String(item.docente || 'Docente').slice(0, 36);
    return [{
      text: `${prefix}${name}`,
      callback_data: `chat:open:${index}`,
    }];
  });

  keyboard.push([{ text: '⬅️ Volver', callback_data: 'chat:menu' }]);
  keyboard.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);

  await sendMessage(
    chatId,
    `${onlyUnread ? '🔵' : '👩‍🏫'} <b>${onlyUnread ? 'Conversaciones con mensajes no leídos' : 'Conversaciones'}</b>\n\n` +
    `Selecciona un docente para abrir la conversación.`,
    { reply_markup: { inline_keyboard: keyboard } },
  );
}

async function showChatUnread(chatId, source) {
  const telegramId = teacherTelegramId(source);
  const context = await callEduGestion('botChatContexto', { telegramId });
  const role = String(context.rol || 'docente').toLowerCase();

  if (role === 'director') {
    await showChatConversations(chatId, source, true);
    return;
  }

  if (Number(context.noLeidos || 0) <= 0) {
    await sendMessage(
      chatId,
      '✅ <b>No tienes mensajes nuevos</b>\n\nTu conversación con Dirección está al día.',
      { reply_markup: chatMenuKeyboard(role) },
    );
    return;
  }

  await openChatConversation(chatId, source, 0, true);
}

function selectChatConversationFromCache(source, index) {
  const cached = getPendingData(source, 'chat-conversations');
  const items = cached && Array.isArray(cached.items) ? cached.items : [];
  if (!Number.isInteger(index) || index < 0 || index >= items.length) return null;
  return items[index];
}

function chatMessagesText(messages, currentRole) {
  const visible = Array.isArray(messages) ? messages.slice(-12) : [];
  if (!visible.length) {
    return 'Aún no hay mensajes en esta conversación.';
  }

  return visible.map(m => {
    const role = String(m.rolRemitente || '').toLowerCase();
    const mine = role === String(currentRole || '').toLowerCase();
    const who = mine ? 'Tú' : (m.nombreRemitente || chatRoleLabel(role));
    return `${mine ? '🔵' : '⚪'} <b>${escapeHtml(who)}</b>\n` +
      `${escapeHtml(String(m.mensaje || ''))}\n` +
      `<i>${escapeHtml(formatChatDate(m.creadoEn))}</i>`;
  }).join('\n\n');
}

async function openChatConversation(chatId, source, index, directTeacher = false) {
  const telegramId = teacherTelegramId(source);
  const context = await callEduGestion('botChatContexto', { telegramId });
  const role = String(context.rol || 'docente').toLowerCase();
  let idDocente = '';

  if (role === 'director') {
    let item = selectChatConversationFromCache(source, index);

    if (!item) {
      const data = await callEduGestion('botChatConversaciones', { telegramId });
      const items = Array.isArray(data.conversaciones) ? data.conversaciones : [];
      setPendingData(source, 'chat-conversations', { role, items });
      item = items[index];
    }

    if (!item) {
      await showChatConversations(chatId, source);
      return;
    }
    idDocente = String(item.idDocente || '');
  }

  const payload = { telegramId };
  if (role === 'director') payload.idDocente = idDocente;

  const data = await callEduGestion('botChatConversacion', payload);
  const docente = data.docente || {};
  const messages = Array.isArray(data.mensajes) ? data.mensajes : [];

  setPendingData(source, 'chat-current', {
    role,
    idDocente: role === 'director' ? String(docente.id || idDocente) : '',
    docente: String(docente.nombre || 'Docente'),
  });

  if (Number(data.noLeidos || 0) > 0) {
    await callEduGestion('botChatMarcarLeido', payload);
  }

  const title = role === 'director'
    ? `💬 <b>${escapeHtml(docente.nombre || 'Docente')}</b>`
    : '💬 <b>Conversación con Dirección</b>';

  const keyboard = [
    [{ text: '✍️ Responder', callback_data: 'chat:reply' }],
    [{ text: '✅ Marcar leído', callback_data: 'chat:mark' }],
    [{ text: '🔄 Actualizar', callback_data: `chat:open:${Number.isInteger(index) ? index : 0}` }],
  ];
  if (role === 'director') keyboard.push([{ text: '⬅️ Conversaciones', callback_data: 'chat:list' }]);
  else keyboard.push([{ text: '⬅️ Chat interno', callback_data: 'chat:menu' }]);
  keyboard.push([{ text: '☰ Todas las opciones', callback_data: 'menu' }]);

  await sendMessage(
    chatId,
    `${title}\n\n${chatMessagesText(messages, role)}\n\n` +
    `<i>Mostrando hasta los últimos 12 mensajes.</i>`,
    { reply_markup: { inline_keyboard: keyboard } },
  );
}

async function startChatReply(chatId, source) {
  const current = getPendingData(source, 'chat-current');
  if (!current) {
    await showChatMenu(chatId, source);
    return;
  }

  setPendingTextMode(source, 'chat-reply');
  await sendMessage(
    chatId,
    `✍️ <b>Responder mensaje</b>\n\n` +
    `Escribe tu respuesta y envíala normalmente.\n\n` +
    `Para salir sin enviar, escribe <code>cancelar</code>.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '⬅️ Cancelar', callback_data: 'chat:menu' }],
          [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
        ],
      },
    },
  );
}

async function sendChatReply(chatId, source, messageText) {
  const current = getPendingData(source, 'chat-current');
  if (!current) {
    clearPendingTextMode(source);
    await showChatMenu(chatId, source);
    return;
  }

  const telegramId = teacherTelegramId(source);
  const payload = {
    telegramId,
    mensaje: String(messageText || '').trim(),
  };
  if (String(current.role || '') === 'director') {
    payload.idDocente = String(current.idDocente || '');
  }

  await callEduGestion('botChatEnviar', payload);
  clearPendingTextMode(source);

  await sendMessage(
    chatId,
    '✅ <b>Mensaje enviado</b>\n\nLa respuesta también aparecerá en el chat de la plataforma web.',
  );

  await openChatConversation(chatId, source, 0, true);
}

async function markChatRead(chatId, source) {
  const current = getPendingData(source, 'chat-current');
  if (!current) {
    await showChatMenu(chatId, source);
    return;
  }

  const payload = { telegramId: teacherTelegramId(source) };
  if (String(current.role || '') === 'director') {
    payload.idDocente = String(current.idDocente || '');
  }

  const data = await callEduGestion('botChatMarcarLeido', payload);
  await sendMessage(
    chatId,
    `✅ <b>Chat actualizado</b>\n\n${escapeHtml(data.message || 'Mensajes marcados como leídos.')}`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Volver al chat', callback_data: 'chat:menu' }],
          [{ text: '☰ Todas las opciones', callback_data: 'menu' }],
        ],
      },
    },
  );
}

/* EDUGESTION_FASE_18_CHAT_INTERNO_TELEGRAM_UI_END */


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
        status: 'phase6.7-chat-interno-ready',
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
