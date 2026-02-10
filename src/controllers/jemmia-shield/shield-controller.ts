export default class JemmiaShieldAuthController {
  static index(c: any) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Lark Bot App Install</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f2f5; margin: 0; }
              .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; width: 300px; }
              h1 { margin-bottom: 24px; font-size: 24px; color: #1f2329; }
              .btn { display: inline-block; padding: 12px 24px; background-color: #3370ff; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; transition: background-color 0.2s; }
              .btn:hover { background-color: #2b5ac2; }
          </style>
      </head>
      <body>
          <div class="card">
              <h1>Add JEMMIA SHIELD to your groups</h1>
              <p style="margin-bottom: 30px; color: #646a73;">Please login to continue</p>
              <a href="/jemmia-shield/login/lark" class="btn">Login with Lark</a>
          </div>
      </body>
      </html>
    `;
    return c.html(html);
  }
}
