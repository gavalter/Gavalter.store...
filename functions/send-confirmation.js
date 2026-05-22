
// Cloudflare Pages Function — handles POST requests to /send-confirmation
// This runs on Cloudflare's servers (not in the browser), which means:
//   1. Your Resend API key stays hidden from the public
//   2. The browser's security restrictions don't apply here
//   3. Email sending works reliably on every order

export async function onRequestPost(context) {

  // Allow requests from any origin (needed so your HTML page can call this)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // Parse the order data sent from your site's checkout page
    const order = await context.request.json();

    // Build a readable list of items for the email body
    const itemRows = order.products_json.map(item =>
      `<tr>
        <td style="padding:10px 16px;border-bottom:1px solid #1e2b22;color:#f0f7f3;font-family:'Courier New',monospace;">${item.name}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #1e2b22;color:#a8bcb0;text-align:center;">${item.qty}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #1e2b22;color:#a8bcb0;text-align:right;">$${Number(item.price).toLocaleString()}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #1e2b22;color:#1cb495;font-weight:700;text-align:right;">$${(item.qty * Number(item.price)).toLocaleString()}</td>
      </tr>`
    ).join('');

    // The full HTML email — styled to match your dark industrial brand
    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#09100e;font-family:Inter,Arial,sans-serif;color:#a8bcb0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09100e;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#111714;border:1px solid #1e2b22;border-radius:12px 12px 0 0;padding:0;overflow:hidden;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="5" style="background:#1cb495;font-size:0;">&nbsp;</td>
                <td style="padding:28px 32px;">
                  <div style="font-family:Arial,sans-serif;font-size:28px;font-weight:900;color:#1cb495;letter-spacing:0.05em;text-transform:uppercase;">GAVALTER</div>
                  <div style="font-size:11px;color:#6e8c78;letter-spacing:0.15em;text-transform:uppercase;margin-top:2px;">Industrial Supply</div>
                </td>
                <td style="padding:28px 32px;text-align:right;vertical-align:top;">
                  <div style="font-size:10px;color:#6e8c78;text-transform:uppercase;letter-spacing:0.1em;">Order Reference</div>
                  <div style="font-family:'Courier New',monospace;font-size:16px;font-weight:700;color:#1cb495;margin-top:4px;">${order.reference_id}</div>
                  <div style="font-size:11px;color:#6e8c78;margin-top:6px;">${new Date(order.created_at || Date.now()).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Order confirmed banner -->
        <tr>
          <td style="background:#0d1a14;border-left:1px solid #1e2b22;border-right:1px solid #1e2b22;padding:24px 32px;text-align:center;">
            <div style="display:inline-block;background:rgba(28,180,149,0.12);border:1px solid rgba(28,180,149,0.3);border-radius:999px;padding:6px 18px;font-size:11px;color:#1cb495;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">● Order Received</div>
            <div style="font-size:26px;font-weight:900;color:#f0f7f3;margin-top:14px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.02em;">Thank You, ${order.customer_name.split(' ')[0]}!</div>
            <div style="font-size:14px;color:#a8bcb0;margin-top:8px;line-height:1.6;">Your procurement request has been recorded.<br/>Please complete your Remitly bank transfer to confirm the order.</div>
          </td>
        </tr>

        <!-- Items table -->
        <tr>
          <td style="background:#111714;border-left:1px solid #1e2b22;border-right:1px solid #1e2b22;padding:0 32px 24px;">
            <div style="font-size:10px;color:#6e8c78;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;padding:20px 0 12px;">Order Items</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #1e2b22;border-radius:8px;overflow:hidden;">
              <thead>
                <tr style="background:#182019;">
                  <th style="padding:10px 16px;text-align:left;font-size:10px;color:#6e8c78;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Item</th>
                  <th style="padding:10px 16px;text-align:center;font-size:10px;color:#6e8c78;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Qty</th>
                  <th style="padding:10px 16px;text-align:right;font-size:10px;color:#6e8c78;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Unit</th>
                  <th style="padding:10px 16px;text-align:right;font-size:10px;color:#6e8c78;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Total</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
              <tfoot>
                <tr style="background:#182019;">
                  <td colspan="3" style="padding:14px 16px;font-size:10px;color:#6e8c78;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Order Total</td>
                  <td style="padding:14px 16px;text-align:right;font-size:18px;font-weight:900;color:#1cb495;font-family:Arial,sans-serif;">$${Number(order.total_price).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </td>
        </tr>

        <!-- Payment instructions -->
        <tr>
          <td style="background:#111714;border-left:1px solid #1e2b22;border-right:1px solid #1e2b22;padding:0 32px 32px;">
            <div style="border:1px solid #1e2b22;border-radius:8px;overflow:hidden;">
              <div style="background:#182019;padding:14px 20px;font-size:10px;color:#1cb495;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Payment Instructions — Remitly Bank Transfer</div>
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:16px 20px;">
                ${[
                  ['1', 'Open Remitly', "Log in and choose 'Send to Bank Account'"],
                  ['2', 'Enter Amount', `$${Number(order.total_price).toLocaleString()} USD`],
                  ['3', 'Beneficiary', 'Gavalter Industrial · Stanbic Bank Uganda · Acc 9023771445'],
                  ['4', 'Reference / Memo', order.reference_id],
                  ['5', 'Send Confirmation', 'Email receipt to evans@gavalter.store'],
                ].map(([num, title, detail]) => `
                <tr>
                  <td width="32" valign="top" style="padding:8px 12px 8px 0;">
                    <div style="width:24px;height:24px;border-radius:50%;background:rgba(28,180,149,0.14);color:#1cb495;font-size:11px;font-weight:700;text-align:center;line-height:24px;">${num}</div>
                  </td>
                  <td style="padding:8px 0;border-bottom:1px solid #1e2b22;">
                    <div style="font-size:12px;font-weight:700;color:#f0f7f3;">${title}</div>
                    <div style="font-size:12px;color:#a8bcb0;margin-top:2px;font-family:'Courier New',monospace;">${detail}</div>
                  </td>
                </tr>`).join('')}
              </table>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0d1a14;border:1px solid #1e2b22;border-radius:0 0 12px 12px;padding:20px 32px;display:flex;justify-content:space-between;align-items:center;">
            <table width="100%"><tr>
              <td style="font-size:11px;color:#6e8c78;">Gavalter Industrial · evans@gavalter.store · wa.me/256780162178</td>
              <td style="text-align:right;font-size:11px;color:#1cb495;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">Built for Industry</td>
            </tr></table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Send the email using Resend's API
    // The API key is stored as a Cloudflare environment variable (RESEND_API_KEY)
    // — never exposed in the HTML file the public can see
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Gavalter Industrial <onboarding@resend.dev>", // uses Resend's shared domain — works without custom domain
        to: [order.email],                                   // sends to the customer's email
        bcc: ["evans@gavalter.store"],                       // you also get a copy of every order
        subject: `Order Confirmed — ${order.reference_id}`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const err = await resendResponse.text();
      throw new Error(`Resend error: ${err}`);
    }

    // Return success to the browser
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    // Return error details so we can debug if something goes wrong
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Handle browser preflight CORS checks (browsers send this before the real POST)
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
                                             }
