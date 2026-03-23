import { sendWhatsApp } from "@/lib/whatsapp";
import { sendTelegram } from "@/lib/telegram";

export type NotifyChannel = "telegram" | "whatsapp";

/**
 * Notify via any configured channel(s).
 *
 * Default behavior:
 * - If Telegram is configured -> send Telegram
 * - If CallMeBot WhatsApp is configured -> send WhatsApp
 * - If none configured -> no-op
 */
export async function notifyNewOrder(message: string) {
  const results: Record<string, any> = {};

  // Telegram (recommended)
  const tg = await sendTelegram(message);
  results.telegram = tg;

  // WhatsApp (CallMeBot)
  const wa = await sendWhatsApp(message);
  results.whatsapp = wa;

  return results;
}
