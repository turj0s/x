import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const DEFAULT_EMBED_ORIGINS = [
  'https://id-preview--5c428605-0f20-4778-aee9-1ad659bf3ce4.lovable.app',
  'https://5c428605-0f20-4778-aee9-1ad659bf3ce4.lovableproject.com',
  'https://pixel-perfect-clone-02726.lovable.app',
  'https://unicv.turjo.dev',
  'https://lovable.dev',
  'http://localhost:8080',
];

const DOCSPACE_FILES: Record<string, { fileId: string; requestToken: string }> = {
  'https://docspace-bg94v1.onlyoffice.com/s/MX8VCKSGCqZPZX9': { fileId: '4556646', requestToken: 'SVpmbTFyeVVEYkNlVEhGa25JUU1JMnRjUUdwZ3YxMWtjcG5Ud1VZdnFHTT0_ImUwN2NjMWU2LTg2NzQtNDhlOS1hMTI0LThlMjM5NTQ2NjI2ZSI' },
  'https://docspace-bg94v1.onlyoffice.com/s/rjVgN5nvLb7YyPY': { fileId: '4556645', requestToken: 'bXVsY1NNc2hrbFNCampZN2JBam52QkRXQnk4KzJvL1g4TFhBUmhiVVQvdz0_ImZjOTc5Y2NlLWNjNjItNDI4MC05ZDA2LTYxMTkyYTYxNjE4YyI' },
  'https://docspace-bg94v1.onlyoffice.com/s/zY78MwDL5n8ZYck': { fileId: '4556644', requestToken: 'Q3R3MGNteEdhL2k3QUUwMU4yU3JGUTVMc3pvNy8rSFlBQnNsVnA4ZkZ1ST0_ImUxZDlmM2ZlLTljNWMtNGNkZC1hYTM2LTVkMWM0NWIwMTZlNCI' },
  'https://docspace-bg94v1.onlyoffice.com/s/4czZycbqW42vtj7': { fileId: '4557237', requestToken: 'MVdFNlc1Q2hjck1IVlBGZUNCRnJFeW5kYWlPUllscjRJMUU2S1ZLZjhzMD0_ImViNzExMDEwLTc1Y2YtNDVlNy1iOGJkLTRhM2MzYWZlY2ZmMyI' },
  'https://docspace-bg94v1.onlyoffice.com/s/cRnbcdkMv7j6_xz': { fileId: '4558401', requestToken: 'bmhrWTBLMkpybTNOc2lwa2JvSVM5TnhuY0ZIWm1BR2wrSjZtUWpVcGdqOD0_IjM1ZmY5MTY3LTdkYjctNDJjYy05NzdhLWFiNWRhYThkNGMxMCI' },
  'https://docspace-bg94v1.onlyoffice.com/s/JDHYLLV8WQjvGXk': { fileId: '4558403', requestToken: 'MjIyR2pQV2FTMWZveDU3RHl1Z0ozclpOWHN4djA5cjREK1VvK0xTQnBZcz0_ImYzNDIwMDMwLTFkZmUtNDc4Yy1hMDk1LTI1NzczMzhiZDA2NyI' },
  'https://docspace-bg94v1.onlyoffice.com/s/XSF7wt7yK_F_hYY': { fileId: '4558404', requestToken: 'SngrbkJWZnIzMjVQRFV3ZUJNSG9sNEVDZFVNRCthUURhdEltSFJoMFU0UT0_IjI0NzBjNWE3LTYzM2EtNDVlNi05Nzk5LTQ3NGRjYWJkMWM4YyI' },
  'https://docspace-bg94v1.onlyoffice.com/s/H75qz74ntMk-s9t': { fileId: '4558402', requestToken: 'RHZ1eG42R2cvWUR0TjFja2x2RjVzY24xQWpIVVRYRjVFOXpnWm5jU3pHTT0_ImU4MGQ4YWU5LTIzOWYtNDlmMC1iNGI0LWYyMTU2MDBjY2RiMSI' },
  'https://docspace-bg94v1.onlyoffice.com/s/7jFkXdmqqgX6zpk': { fileId: '4558405', requestToken: 'dkRwc1lmeDRZMU45WVZwNkRrTldqbW5teUk0VDB5VkdvMTJvazRmNnF5QT0_ImQ5ZmJiZjRiLWYyNTUtNDVhNy04ZTBmLTY4NTAwNGU5NzdmYiI' },
  'https://docspace-bg94v1.onlyoffice.com/s/NQ-NCJ3MF_vyZ6L': { fileId: '4558406', requestToken: 'OVVtYSt6Yit2SmNFalprM24rVEM4ckwzWWRnYko2Q2V4eWlWblNOK3NoUT0_ImUxNTQzNjI5LWM4YTgtNGFkOS04YzhmLTE2YmEzZDUwMzZlMyI' },
  'https://docspace-bg94v1.onlyoffice.com/s/2DSSqnG4mcwtS-s': { fileId: '4558407', requestToken: 'T2hMeEF6WHN1ZE43cW9FYkVNRUdlT3NHVHVSZFBjSHduekRVV05PdWV5WT0_IjEzN2NiZmU0LTJkMjgtNDgzMC05MWQ2LTE4ZmYxZjQ4OGU0ZCI' },
  'https://docspace-bg94v1.onlyoffice.com/s/j_bLxMPLQ5gpd3f': { fileId: '4558408', requestToken: 'b0Nwcm1HN3lDVHB4dnNsaEJXQXFGT2dWYzN3cWhhcjF5UCsvdUdQNFJQdz0_IjVlNWI4ZWQ5LWEyZWUtNDE4YS05ZjRlLTM4MTA5M2E1MmJkMCI' },
  'https://docspace-bg94v1.onlyoffice.com/s/2BgmJmDZv2Pv69y': { fileId: '4558409', requestToken: 'RitQRjJXVGxsekZyNFNuT3hhNjNpR0JNK1J4RWhxZVJMaDhIN3A1QTBhYz0_ImRiODVkNWYzLWVlMGYtNGU0MS1hMDFjLTM1ZGU3YTQ3MDUzZCI' },
};

const normalizeOrigin = (value: string) => {
  try {
    return new URL(value).origin;
  } catch {
    return '';
  }
};

const ensureDocSpaceEmbedOrigins = async (req: Request) => {
  const apiKey = Deno.env.get('DOCSPACE_API_KEY');
  const baseUrl = (Deno.env.get('DOCSPACE_URL') || 'https://docspace-bg94v1.onlyoffice.com').replace(/\/$/, '');
  if (!apiKey) return;

  const dynamicOrigins = [
    req.headers.get('origin') || '',
    normalizeOrigin(req.headers.get('referer') || ''),
  ].filter(Boolean);
  const required = [...DEFAULT_EMBED_ORIGINS, ...dynamicOrigins].map(normalizeOrigin).filter(Boolean);

  const currentResponse = await fetch(`${baseUrl}/api/2.0/security/csp`, {
    headers: { Accept: 'application/json' },
  });
  if (!currentResponse.ok) return;

  const currentJson = await currentResponse.json().catch(() => null) as { response?: { domains?: string[] } } | null;
  const current = (currentJson?.response?.domains || []).map(normalizeOrigin).filter(Boolean);
  const next = Array.from(new Set([...current, ...required]));
  if (next.length === current.length && next.every((origin) => current.includes(origin))) return;

  await fetch(`${baseUrl}/api/2.0/security/csp`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ domains: next }),
  }).catch(() => null);
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const url = typeof body?.url === 'string' ? body.url.replace(/\/$/, '') : '';
    if (!url || url.length > 500) {
      return new Response(JSON.stringify({ error: 'Invalid url' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }


    const direct = DOCSPACE_FILES[url];
    if (direct) {
      await ensureDocSpaceEmbedOrigins(req).catch((error) => console.error('DocSpace CSP sync failed', error));
      return new Response(JSON.stringify(direct), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    try {
      const parsed = new URL(url);
      const fileId = parsed.searchParams.get('fileid') || parsed.searchParams.get('fileId');
      const requestToken = parsed.searchParams.get('share') || parsed.searchParams.get('requestToken');
      if (fileId && requestToken) {
        await ensureDocSpaceEmbedOrigins(req).catch((error) => console.error('DocSpace CSP sync failed', error));
        return new Response(JSON.stringify({ fileId, requestToken }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    } catch { /* noop */ }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
