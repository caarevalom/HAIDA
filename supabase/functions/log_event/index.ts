// Using Deno.serve per guidelines
console.info('log_event function starting');
Deno.serve(async (req)=>{
  try {
    if (req.method !== 'POST') return new Response(JSON.stringify({
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const body = await req.json().catch(()=>null);
    if (!body || !body.event_type) return new Response(JSON.stringify({
      error: 'Invalid payload'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const { event_type, message = null, metadata = null, user_id = null } = body;
    // Use SUPABASE_DB_URL env (Postgres URL) to perform a secure insert using built-in fetch to the REST endpoint is not ideal.
    // We'll use the Postgres client via npm:@supabase/postgres-js
    const { createClient } = await import('npm:@supabase/postgres-js@1.1.0');
    const dbUrl = Deno.env.get('SUPABASE_DB_URL');
    if (!dbUrl) return new Response(JSON.stringify({
      error: 'Missing SUPABASE_DB_URL'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const client = createClient(dbUrl);
    const insertQuery = `INSERT INTO public.event_logs (user_id, event_type, message, metadata) VALUES ($1, $2, $3, $4) RETURNING id, created_at;`;
    const params = [
      user_id,
      event_type,
      message,
      metadata ? JSON.stringify(metadata) : null
    ];
    const result = await client.query(insertQuery, params).catch((err)=>{
      console.error('insert error', err);
      throw err;
    });
    const payload = {
      inserted: result.rows?.length ? result.rows[0] : null
    };
    // background cleanup trigger example
    const waitPromise = (async ()=>{
      try {
        // call purge function if header requests it
        const purge = req.headers.get('x-run-purge') || 'false';
        if (purge === 'true') {
          await client.query('SELECT public.purge_old_event_logs($1)', [
            90
          ]);
        }
      } catch (e) {
        console.error('background task error', e);
      }
    })();
    // EdgeRuntime.waitUntil equivalent for Deno.serve is request.respondWith background handling; use setTimeout as safe fallback
    // Use globalThis.EdgeRuntime if available
    if (globalThis.EdgeRuntime?.waitUntil) {
      globalThis.EdgeRuntime.waitUntil(waitPromise);
    } else {
      // best-effort: don't await
      waitPromise.then(()=>{}).catch(()=>{});
    }
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({
      error: 'internal_error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
