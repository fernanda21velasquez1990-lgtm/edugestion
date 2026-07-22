const BOT_API_BASE = 'https://api.telegram.org';

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

function mainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '✅ Pasar asistencia', callback_data: 'attendance:start' },
        { text: '📅 Clases de hoy', callback_data: 'classes:today' },
      ],
      [
        { text: '🔗 Vincular cuenta', callback_data: 'link:start' },
        { text: 'ℹ️ Ayuda', callback_data: 'help' },
      ],
    ],
  };
}

async function showMainMenu(chatId, firstName = 'Docente') {
  const safeName = String(firstName || 'Docente').replace(/[<>]/g, '');
  await sendMessage(
    chatId,
    `🎓 <b>EduGestión Docente</b>\n\nHola, <b>${safeName}</b>. El bot ya está conectado correctamente.\n\nEn el siguiente paso vincularemos tu cuenta docente para consultar horarios, estudiantes y guardar asistencia.`,
    { reply_markup: mainMenuKeyboard() },
  );
}

async function handleMessage(message) {
  const chatId = message?.chat?.id;
  if (!chatId) return;

  const text = String(message.text || '').trim();
  const firstName = message?.from?.first_name || 'Docente';

  if (/^\/(start|menu)(?:@\w+)?(?:\s|$)/i.test(text)) {
    await showMainMenu(chatId, firstName);
    return;
  }

  if (/^\/ayuda(?:@\w+)?(?:\s|$)/i.test(text)) {
    await sendMessage(
      chatId,
      'ℹ️ <b>Ayuda de EduGestión</b>\n\nUsa /menu para abrir el menú principal.\n\nLa vinculación y el registro de asistencia se habilitarán en el siguiente paso.',
      { reply_markup: mainMenuKeyboard() },
    );
    return;
  }

  await sendMessage(
    chatId,
    'No reconocí ese mensaje. Pulsa el botón inferior o escribe /menu.',
    { reply_markup: mainMenuKeyboard() },
  );
}

async function handleCallbackQuery(callbackQuery) {
  const callbackId = callbackQuery?.id;
  const chatId = callbackQuery?.message?.chat?.id;
  const data = String(callbackQuery?.data || '');
  if (!callbackId || !chatId) return;

  await answerCallbackQuery(callbackId);

  if (data === 'help') {
    await sendMessage(
      chatId,
      'ℹ️ <b>Ayuda de EduGestión</b>\n\nEl webhook funciona. A continuación agregaremos la vinculación segura del docente y el flujo completo de asistencia.',
      { reply_markup: mainMenuKeyboard() },
    );
    return;
  }

  if (data === 'link:start') {
    await sendMessage(
      chatId,
      '🔗 <b>Vincular cuenta</b>\n\nLa conexión técnica ya está lista. En el siguiente paso crearemos el código temporal que vincula este Telegram con tu cuenta de EduGestión.',
      { reply_markup: mainMenuKeyboard() },
    );
    return;
  }

  if (data === 'attendance:start' || data === 'classes:today') {
    await sendMessage(
      chatId,
      '🔐 Primero debemos vincular tu cuenta docente. Esa función será el siguiente módulo que instalaremos.',
      { reply_markup: mainMenuKeyboard() },
    );
    return;
  }

  await showMainMenu(chatId, callbackQuery?.from?.first_name || 'Docente');
}

export default {
  async fetch(request) {
    if (request.method === 'GET') {
      return jsonResponse({
        ok: true,
        service: 'EduGestion Telegram webhook',
        status: 'ready',
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Método no permitido' }, 405);
    }

    try {
      const expectedSecret = getRequiredEnv('TELEGRAM_WEBHOOK_SECRET');
      const receivedSecret = request.headers.get('x-telegram-bot-api-secret-token') || '';
      if (receivedSecret !== expectedSecret) {
        return jsonResponse({ ok: false, error: 'Webhook no autorizado' }, 401);
      }

      const update = await request.json();

      if (update.message) {
        await handleMessage(update.message);
      } else if (update.callback_query) {
        await handleCallbackQuery(update.callback_query);
      }

      return jsonResponse({ ok: true });
    } catch (error) {
      console.error('Error en webhook de Telegram:', error);
      return jsonResponse({ ok: false, error: 'Error interno del webhook' }, 500);
    }
  },
};
