const MAX_REQUEST_BYTES = 8 * 1024 * 1024;

module.exports = async function (context, req) {
  try {
    const configuredUrl = process.env.POWER_AUTOMATE_URL;
    if (!configuredUrl) {
      context.log.warn('POWER_AUTOMATE_URL is not configured');
      context.res = {
        status: 503,
        body: {
          ok: false,
          message: 'Bridge is not configured yet.'
        }
      };
      return;
    }

    const raw = typeof req.rawBody === 'string' ? req.rawBody : JSON.stringify(req.body ?? {});
    const bytes = Buffer.byteLength(raw, 'utf8');
    if (bytes > MAX_REQUEST_BYTES) {
      context.res = {
        status: 413,
        body: {
          ok: false,
          message: 'Payload too large.'
        }
      };
      return;
    }

    const validationError = validatePayload(req.body);
    if (validationError) {
      context.res = {
        status: 400,
        body: {
          ok: false,
          message: validationError
        }
      };
      return;
    }

    const upstreamResponse = await fetch(configuredUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    if (!upstreamResponse.ok) {
      context.log.warn(`Power Automate rejected payload with status ${upstreamResponse.status}`);
      context.res = {
        status: 502,
        body: {
          ok: false,
          message: 'Upstream flow rejected the payload.'
        }
      };
      return;
    }

    context.res = {
      status: 200,
      body: {
        ok: true,
        message: 'Payload forwarded to Power Automate.'
      }
    };
  } catch (error) {
    context.log.error('submit-warranty failed', error);
    context.res = {
      status: 500,
      body: {
        ok: false,
        message: 'Unexpected server error.'
      }
    };
  }
};

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return 'Payload must be a JSON object.';
  }

  if (typeof payload.schema_version !== 'string' || !payload.schema_version.trim()) {
    return 'schema_version is required.';
  }

  if (!payload.grunddaten || typeof payload.grunddaten !== 'object') {
    return 'grunddaten is required.';
  }

  if (!payload.reklamiertes_bauteil || typeof payload.reklamiertes_bauteil !== 'object') {
    return 'reklamiertes_bauteil is required.';
  }

  if (!Array.isArray(payload.arbeitsablauf)) {
    return 'arbeitsablauf must be an array.';
  }

  return null;
}
