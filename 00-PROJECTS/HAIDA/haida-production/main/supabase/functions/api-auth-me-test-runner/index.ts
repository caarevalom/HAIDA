console.info('api-auth-me test runner starting');
Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SERVICE_KEY) return new Response(JSON.stringify({ error: 'env_missing' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

    const fnUrl = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/api-auth-me`;

    const res = await fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'smoke' })
    });

    const text = await res.text();
    return new Response(JSON.stringify({ status: res.status, body: text }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});