import { sendWhatsApp, type WhatsAppSendResult } from "@/lib/whatsapp";
import { sendTelegram, type TelegramSendResult } from "@/lib/telegram";

export interface NotifyNewOrderResult {
  telegram: TelegramSendResult;
  whatsapp: WhatsAppSendResult;
}

/**
 * Notify admins about a new order.
 *
 * Behavior:
 * - Always attempts Telegram (recommended)
 * - Always attempts WhatsApp (CallMeBot) as a secondary channel
 *
 * Both are non-blocking in callers; failures are returned in result.
 */
export async function notifyNewOrder(message: string): Promise<NotifyNewOrderResult> {
  const [telegram, whatsapp] = await Promise.all([sendTelegram(message), sendWhatsApp(message)]);
  return { telegram, whatsapp };
}
