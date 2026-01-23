import RecallLarkService from "services/larksuite/recall-lark.service";

export default class RecallCallbackController {
  static async index(c: any) {
    const code = c.req.query("code");

    if (!code) {
      return c.text("No code provided", 400);
    }

    try {
      const tokenData = await RecallLarkService.getUserAccessToken(c.env, code);
      const accessToken = tokenData.access_token;

      const userInfo = await RecallLarkService.getUserInfo(c.env, accessToken);
      const userId = userInfo.user_id || userInfo.open_id;
      const userName = userInfo.name || userInfo.en_name || "Unknown";
      const openId = userInfo.open_id;

      const userData = { ...tokenData, ...userInfo };

      // 1. List all groups
      const allGroups = await RecallLarkService.getUserGroups(
        c.env,
        accessToken
      );

      // 2. Filter groups where user is owner
      const ownedGroups = allGroups.filter(
        (group: any) => group.owner_id === userId || group.owner_id === openId
      );

      // 3. Add bot as manager to these groups
      const results = [];
      for (const group of ownedGroups) {
        try {
          // Add bot to group first
          try {
            await RecallLarkService.addBotToGroup(
              c.env,
              group.chat_id,
              accessToken
            );
          } catch (e: any) {
            console.warn(
              `Bot might already be in group or failed to add: ${e.message}`
            );
            // Continue to try adding as manager regardless, or check error code?
            // For now we continue, as the main goal is to make it manager.
          }

          // Then add as manager
          await RecallLarkService.addBotAsManager(
            c.env,
            group.chat_id,
            accessToken
          );
          results.push({ name: group.name, status: "Success" });
        } catch (err: any) {
          results.push({
            name: group.name,
            status: "Failed",
            error: err.message
          });
        }
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Add Bot Successful</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f0f2f5; margin: 0; }
                .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 600px; word-wrap: break-word; }
                h1 { color: #1f2329; margin-top: 0; }
                pre { background: #f5f6f7; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 12px; }
                .success { color: #00b660; font-weight: bold; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .status-Success { color: green; }
                .status-Failed { color: red; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Successful!</h1>
                <div class="success">✓ Jemmia Bot added to your groups</div>
                <p><strong>User Name:</strong> ${userName}</p>

                <h3>Processed Groups (${results.length})</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Group Name</th>
                            <th>Status</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results
    .map(
      (r) => `
        <tr>
            <td>${r.name}</td>
            <td class="status-${r.status}">${r.status}</td>
            <td>${r.error || "-"}</td>
        </tr>
      `
    )
    .join("")}
                    </tbody>
                </table>

                <!-- <p><strong>Raw User Data:</strong></p>
                <pre>${JSON.stringify(userData, null, 2)}</pre> -->
                <div style="margin-top: 20px; text-align: center;">
                    <a href="/recall" style="color: #3370ff; text-decoration: none;">Back to Home</a>
                </div>
            </div>
        </body>
        </html>
      `;
      return c.html(html);
    } catch (error: any) {
      console.warn("Authentication or Automation Failed:", error);
      // Return the error to the browser so we can see it
      return c.text(
        `Authentication Failed: ${error.message}\n\nStack: ${error.stack}`,
        500
      );
    }
  }
}
