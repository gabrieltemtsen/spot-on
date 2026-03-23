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
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { ok: false, error: "Telegram not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing)" };
  }

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
      return { ok: false, status: res.status, error: `Telegram send failed: ${res.status} ${text}`.slice(0, 300) };
    }

    return { ok: true, status: res.status };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: msg };
  }
}
