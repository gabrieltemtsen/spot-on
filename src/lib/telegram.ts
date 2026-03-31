export type TelegramSendResult =
  | { ok: true; status: number }
  | { ok: false; status?: number; error: string };

/**
 * Telegram notifications (simple + reliable).
 *
 * Env vars:
 * - TELEGRAM_BOT_TOKEN
 * - TELEGRAM_CHAT_ID (numeric id)
 */
export async function sendTelegram(message: string): Promise<TelegramSendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIdEnv = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatIdEnv) {
    return { ok: false, error: "Telegram not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing)" };
  }

  const chatIds = chatIdEnv.split(",").map((id) => id.trim()).filter(Boolean);

  const results = await Promise.all(
    chatIds.map(async (chatId) => {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            disable_web_page_preview: true,
          }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return { ok: false as const, status: res.status, error: `Chat ${chatId} failed: ${res.status} ${text}`.slice(0, 300) };
        }

        return { ok: true as const, status: res.status };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        return { ok: false as const, error: msg };
      }
    })
  );

  const allOk = results.every((r) => r.ok);
  if (allOk) {
    return { ok: true, status: 200 };
  } else {
    // Collect all errors and return as single combined error message
    const errors = results.filter((r) => !r.ok).map((r) => r.error).join(" | ");
    return { ok: false, error: errors };
  }
}
