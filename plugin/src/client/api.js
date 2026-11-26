// api.js — generated from the original single-file client; edit here, then run node build-client.mjs.
// Requests are retried on transport and 5xx failures, de-duplicated per GET and
// bounded in time so a hung socket can never freeze a panel.
const API_TIMEOUT_MS = 15000;
const API_INFLIGHT = new Map();

function api(method, body, { fresh = false } = {}) {
  const key = body === undefined && !fresh ? `GET ${method}` : '';
  if (key && API_INFLIGHT.has(key)) return API_INFLIGHT.get(key);
  const request = apiRequest(method, body, 2);
  if (key) {
    API_INFLIGHT.set(key, request);
    request.then(
      () => API_INFLIGHT.delete(key),
      () => API_INFLIGHT.delete(key),
    );
  }
  return request;
}

async function apiRequest(method, body, retriesLeft) {
  const url = new URL('life-planner/api/' + method, document.baseURI);
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), API_TIMEOUT_MS) : null;
  const init =
    body === undefined
      ? { method: 'GET', signal: controller ? controller.signal : undefined }
      : {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller ? controller.signal : undefined,
        };
  let response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    // A boot-time race makes the first calls fail; retry before surfacing it.
    if (retriesLeft > 0) {
      await new Promise((resolve) => setTimeout(resolve, 250 * (3 - retriesLeft)));
      return apiRequest(method, body, retriesLeft - 1);
    }
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
  }
  if (response.status >= 500 && retriesLeft > 0) {
    await new Promise((resolve) => setTimeout(resolve, 250 * (3 - retriesLeft)));
    return apiRequest(method, body, retriesLeft - 1);
  }
  const payload = await response
    .json()
    .catch(() => ({ ok: false, error: `HTTP ${response.status}: ${url.pathname}` }));
  if (!payload.ok) throw new Error(payload.error || 'request failed');
  return payload.data;
}
