export type WhatsAppProvider = "callmebot";

export type WhatsAppSendResult =
  | { ok: true; provider: WhatsAppProvider; status: number }
  | { ok: false; provider: WhatsAppProvider; status?: number; error: string };

/**
 * Minimal WhatsApp notifications (personal alerts) via CallMeBot.
 *
 * Env vars:
 * - WHATSAPP_PROVIDER=callmebot
 * - CALLMEBOT_PHONE=2348012345678 (country code + number, no +)
 * - CALLMEBOT_API_KEY=xxxxxx
 */
export async function sendWhatsApp(message: string): Promise<WhatsAppSendResult> {
  const provider = (process.env.WHATSAPP_PROVIDER as WhatsAppProvider | undefined) ?? "callmebot";

  if (provider !== "callmebot") {
    return { ok: false, provider: "callmebot", error: `Unsupported WHATSAPP_PROVIDER: ${provider}` };
  }

  const phone = process.env.CALLMEBOT_PHONE;
  const apiKey = process.env.CALLMEBOT_API_KEY;

  // If not configured, silently no-op (don’t break checkout)
  if (!phone || !apiKey) {
    return { ok: false, provider: "callmebot", error: "CallMeBot not configured (CALLMEBOT_PHONE / CALLMEBOT_API_KEY missing)" };
  }

  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", phone);
  url.searchParams.set("text", message);
  url.searchParams.set("apikey", apiKey);

  try {
    const res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        provider: "callmebot",
        status: res.status,
        error: `CallMeBot request failed: ${res.status} ${text}`.slice(0, 300),
      };
    }
    return { ok: true, provider: "callmebot", status: res.status };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, provider: "callmebot", error: msg };
  }
}
