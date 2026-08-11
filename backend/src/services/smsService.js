/**
 * Abstract SMS Service Provider
 */
export class SmsService {
  static async sendSms({ phone, message }) {
    console.log(`[SmsService Mock] Dispatching SMS to "${phone}" | Message: "${message.substring(0, 50)}..."`);
    return {
      success: true,
      providerMessageId: `msg_sms_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      channel: 'sms',
    };
  }
}
