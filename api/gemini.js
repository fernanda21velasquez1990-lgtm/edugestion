/* EduGestión — API privada de Gemini (modo gratuito, sin búsqueda web) */

const ALLOWED_ORIGINS = new Set([
  'https://edugestion-a2xh.vercel.app',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'null',
]);

function corsHeaders(request) {
  const origin = String(request?.headers?.get('origin') || '').trim();
  const allowOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : 'https://edugestion-a2xh.vercel.app';

  return {
    'access-control-allow-origin': allowOrigin,
    'access-control-allow-methods': 'POST, OPTIONS',
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

function cleanText(value, max = 8000) {
  return String(value || '').trim().slice(0, max);
}

function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .filter(Boolean)
    .join('\n')
    .trim();
}

function statusFromError(error) {
  if (error?.code === 'BAD_REQUEST') return 400;
  if (error?.code === 'SERVER_NOT_CONFIGURED') return 500;
  if (error?.code === 'GEMINI_AUTH_ERROR') return 502;
  if (error?.code === 'GEMINI_LIMIT_ERROR') return 429;
  return 500;
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, message: 'Método no permitido.' }, 405, request);
    }

    try {
      const body = await request.json().catch(() => ({}));
      const message = cleanText(body?.message, 8000);

      if (!message) {
        const error = new Error('Escribe una pregunta para Gemini.');
        error.code = 'BAD_REQUEST';
        throw error;
      }

      const apiKey = getRequiredEnv('GEMINI_API_KEY');
      const model = String(process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite').trim();

      const systemInstruction = [
        'Eres el asistente educativo privado de EduGestión.',
        'Responde siempre en español claro, práctico y útil para un docente.',
        'Ayuda con planificación, actividades, explicaciones, resúmenes, efemérides, estrategias y apoyo pedagógico.',
        'No afirmes que consultaste Internet ni inventes fuentes actuales.',
        'Si el usuario pide información reciente o en tiempo real, explica brevemente que esta versión trabaja sin búsqueda web y ofrece ayuda con conocimiento general.',
        'No reveles claves, variables de entorno ni información interna del servidor.',
      ].join(' ');

      const payload = {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 3072,
        },
      };

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const apiMessage = cleanText(data?.error?.message || `Gemini respondió con estado ${response.status}`, 1200);
        const error = new Error(apiMessage || 'No se pudo consultar Gemini.');
        if (response.status === 401 || response.status === 403) {
          error.code = 'GEMINI_AUTH_ERROR';
        } else if (response.status === 429) {
          error.code = 'GEMINI_LIMIT_ERROR';
        }
        throw error;
      }

      const answer = extractText(data);
      if (!answer) throw new Error('Gemini no devolvió una respuesta de texto.');

      return jsonResponse({ ok: true, answer, sources: [], usedSearch: false, model }, 200, request);
    } catch (error) {
      console.error('EduGestión Gemini API:', error);
      return jsonResponse({
        ok: false,
        message: error?.message || 'No se pudo consultar Gemini en este momento.',
        code: error?.code || 'GEMINI_ERROR',
      }, statusFromError(error), request);
    }
  },
};
