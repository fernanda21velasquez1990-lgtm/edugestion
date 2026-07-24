// EduGestión Fase 2.1 — envío e historial persistente en servidor
const BOT_API_BASE = 'https://api.telegram.org';
const MAX_PDF_BYTES = 3_900_000;
const MAX_CAPTION_LENGTH = 900;

const ALLOWED_ORIGINS = new Set([
  'https://edugestion-a2xh.vercel.app',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
]);

function corsHeaders(request) {
  const origin = String(request?.headers?.get('origin') || '').trim();
  const allowOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : 'https://edugestion-a2xh.vercel.app';
  return {
    'access-control-allow-origin': allowOrigin,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
    'access-control-max-age': '86400',
    'vary': 'Origin',
  };
}

function jsonResponse(payload, status = 200, request = null) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...corsHeaders(request),
    },
  });
}

function getRequiredEnv(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) {
    const error = new Error(`Falta la variable de entorno ${name}`);
    error.code = 'SERVER_NOT_CONFIGURED';
    throw error;
  }
  return value;
}

function safeFilename(value) {
  const cleaned = String(value || 'Informe_Asistencia.pdf')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 160);
  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned}.pdf`;
}

function trimText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
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
  } catch {
    const error = new Error('EduGestión devolvió una respuesta inválida. Revisa la implementación de Apps Script.');
    error.code = 'INVALID_BACKEND_RESPONSE';
    throw error;
  }

  if (!response.ok || data.status !== 'success') {
    const error = new Error(data.message || `EduGestión respondió con estado ${response.status}`);
    error.code = data.code || 'EDUGESTION_ERROR';
    throw error;
  }
  return data;
}

async function sendTelegramDocument({ chatId, pdf, filename, caption }) {
  const token = getRequiredEnv('TELEGRAM_BOT_TOKEN');
  const form = new FormData();
  form.append('chat_id', String(chatId));
  form.append('document', pdf, filename);
  form.append('caption', trimText(caption, MAX_CAPTION_LENGTH));

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

function errorStatus(error) {
  if (error?.code === 'TELEGRAM_NOT_LINKED') return 409;
  if (error?.code === 'UNAUTHORIZED' || error?.code === 'SESSION_REQUIRED') return 401;
  if (error?.code === 'BAD_REQUEST') return 400;
  if (error?.code === 'PDF_TOO_LARGE') return 413;
  return 500;
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }

    if (request.method === 'GET') {
      return jsonResponse({
        ok: true,
        service: 'EduGestion envío de informes',
        status: 'phase2.1-server-history-ready',
      }, 200, request);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Método no permitido' }, 405, request);
    }

    let auditContext = null;
    try {
      const contentType = request.headers.get('content-type') || '';
      if (!contentType.includes('multipart/form-data')) {
        return jsonResponse({ ok: false, error: 'Se esperaba un formulario con el archivo PDF.' }, 415, request);
      }

      const form = await request.formData();
      const token = trimText(form.get('token'), 500);
      const pdf = form.get('pdf');
      const filename = safeFilename(form.get('archivo'));
      const caption = trimText(form.get('mensaje'), MAX_CAPTION_LENGTH) || 'Informe de asistencia generado por EduGestión.';
      const periodo = trimText(form.get('periodo'), 80);
      const seccion = trimText(form.get('seccion'), 80) || 'Todas las secciones';
      auditContext = { token, archivo: filename, periodo, seccion, tamanoBytes: pdf instanceof File ? pdf.size : 0 };

      if (!token) {
        return jsonResponse({ ok: false, code: 'SESSION_REQUIRED', error: 'La sesión docente no está disponible.' }, 401, request);
      }
      if (!(pdf instanceof File) || pdf.size === 0) {
        return jsonResponse({ ok: false, code: 'BAD_REQUEST', error: 'No se recibió un archivo PDF válido.' }, 400, request);
      }
      if (pdf.type && pdf.type !== 'application/pdf') {
        return jsonResponse({ ok: false, code: 'BAD_REQUEST', error: 'El archivo recibido no es un PDF.' }, 400, request);
      }
      if (pdf.size > MAX_PDF_BYTES) {
        return jsonResponse({
          ok: false,
          code: 'PDF_TOO_LARGE',
          error: 'El informe es demasiado pesado para el envío directo. Reduce el periodo o usa Descargar PDF.',
          maxBytes: MAX_PDF_BYTES,
        }, 413, request);
      }

      const destination = await callEduGestion('botResolverDestinoInforme', { token });
      const telegramResult = await sendTelegramDocument({
        chatId: destination.chatId,
        pdf,
        filename,
        caption,
      });

      let auditWarning = '';
      try {
        await callEduGestion('botRegistrarEnvioInforme', {
          token,
          archivo: filename,
          periodo,
          seccion,
          mensajeId: String(telegramResult.message_id || ''),
          tamanoBytes: pdf.size,
          estado: 'enviado',
          codigo: '',
          detalle: '',
        });
      } catch (auditError) {
        console.error('El informe se envió, pero no se pudo registrar la auditoría:', auditError);
        auditWarning = 'El PDF se envió, pero no se pudo registrar la auditoría del envío.';
      }

      return jsonResponse({
        ok: true,
        status: 'sent',
        message: 'El informe fue enviado al Telegram vinculado.',
        destino: destination.telegramNombre || destination.telegramUsuario || 'Telegram vinculado',
        archivo: filename,
        tamanoBytes: pdf.size,
        mensajeId: String(telegramResult.message_id || ''),
        sentAt: new Date().toISOString(),
        warning: auditWarning,
      }, 200, request);
    } catch (error) {
      console.error('No se pudo enviar el informe:', error);
      if (auditContext?.token) {
        try {
          await callEduGestion('botRegistrarEnvioInforme', {
            token: auditContext.token,
            archivo: auditContext.archivo,
            periodo: auditContext.periodo,
            seccion: auditContext.seccion,
            tamanoBytes: auditContext.tamanoBytes,
            estado: 'error',
            codigo: error?.code || 'REPORT_SEND_ERROR',
            detalle: error?.message || 'No se pudo enviar el informe por Telegram.',
          });
        } catch (auditError) {
          console.error('Tampoco se pudo registrar el error del informe:', auditError);
        }
      }
      return jsonResponse({
        ok: false,
        code: error?.code || 'REPORT_SEND_ERROR',
        error: error?.message || 'No se pudo enviar el informe por Telegram.',
      }, errorStatus(error), request);
    }
  },
};
