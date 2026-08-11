/**
 * Abstract WhatsApp Service Provider
 */
export class WhatsappService {
  static async sendWhatsapp({ phone, message }) {
    console.log(`[WhatsappService Mock] Dispatching WhatsApp to "${phone}" | Message: "${message.substring(0, 50)}..."`);
    return {
      success: true,
      providerMessageId: `msg_wa_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      channel: 'whatsapp',
    };
  }
}
