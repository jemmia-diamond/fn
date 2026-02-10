import JemmiaShieldOnboardingService from "services/jemmia-shield/jemmia-shield-onboarding-service";

export default class JemmiaShieldCallbackController {
  static async index(c: any) {
    const code = c.req.query("code");

    if (!code) {
      return c.text("No code provided", 400);
    }

    try {
      const { userInfo, ownedGroups, botGroupIds, accessToken } =
        await JemmiaShieldOnboardingService.getGroupSelectionData(c.env, code);

      const userName = userInfo.name || userInfo.en_name || "Unknown";

      // 4. Prepare groups for display
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Select Groups to Add Bot</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f0f2f5; margin: 0; }
                .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 800px; word-wrap: break-word; }
                h1 { color: #1f2329; margin-top: 0; }
                p { color: #666; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: 600; }
                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    background-color: #3370ff;
                    color: white;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background 0.2s;
                }
                .btn:hover { background-color: #285dc8; }
                .btn:disabled { background-color: #a0c0ff; cursor: not-allowed; }
                .btn.done { background-color: #00b660; cursor: default; }
                .status-success { color: #00b660; font-weight: 500; }
                .status-failed { color: #ff4d4f; font-weight: 500; }
                .spinner {
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: #fff;
                    animation: spin 1s ease-in-out infinite;
                    margin-right: 8px;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Add Jemmia Shield to Groups</h1>
                <p>Hello <strong>${userName}</strong>, please select the groups where you want to add the bot as a manager.</p>

                <h3>Your Groups (${ownedGroups.length})</h3>

                <table>
                    <thead>
                        <tr>
                            <th>Group Name</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ownedGroups
    .map((group) => {
      const isAdded = botGroupIds.has(group.chat_id);
      return `
        <tr>
            <td>${group.name}</td>
            <td id="status-${group.chat_id}" class="status-cell">
                ${isAdded ? "<span class=\"status-success\">Active</span>" : ""}
            </td>
            <td>
                <button 
                    class="btn ${isAdded ? "done" : ""}" 
                    onclick="addBot('${group.chat_id}', this)"
                    ${isAdded ? "disabled" : ""}
                >
                    ${isAdded ? "Done" : "Add Bot"}
                </button>
            </td>
        </tr>
      `;
    })
    .join("")}
                    </tbody>
                </table>

                <script>
                    const accessToken = "${accessToken}";

                    async function addBot(chatId, btn) {
                        const statusCell = document.getElementById('status-' + chatId);
                        const originalText = btn.innerText;

                        // Show loading state
                        btn.disabled = true;
                        btn.innerHTML = '<span class="spinner"></span>Adding...';
                        statusCell.innerText = '';
                        statusCell.className = 'status-cell';

                        try {
                            const response = await fetch('/auth/recall/add-bot', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    chatId: chatId,
                                    accessToken: accessToken
                                })
                            });

                            const result = await response.json();

                            if (result.success) {
                                statusCell.innerText = 'Success';
                                statusCell.classList.add('status-success');
                                btn.innerHTML = 'Added';
                                // Keep button disabled after success? Or allow retry/re-add?
                                // Usually if success, we don't need to add again immediately
                                btn.disabled = true;
                                btn.style.backgroundColor = '#00b660';
                            } else {
                                throw new Error(result.message || 'Unknown error');
                            }
                        } catch (error) {
                            console.error(error);
                            statusCell.innerText = 'Failed: ' + error.message;
                            statusCell.classList.add('status-failed');
                            btn.innerHTML = 'Retry';
                            btn.disabled = false;
                        }
                    }
                </script>

                <div style="margin-top: 20px; text-align: center;">
                    <a href="/recall" style="color: #666; text-decoration: none; font-size: 14px;">Back to Home</a>
                </div>
            </div>
        </body>
        </html>
      `;
      return c.html(html);
    } catch (error: any) {
      console.warn("Authentication Failed:", error);
      return c.text(
        `Authentication Failed: ${error.message}\n\nStack: ${error.stack}`,
        500
      );
    }
  }
}
