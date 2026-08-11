/**
 * Abstract Web Push Notification Service Provider
 */
export class PushService {
  static async sendPush({ userId, title, body }) {
    console.log(`[PushService Mock] Dispatching Web Push to User "${userId}" | Title: "${title}"`);
    return {
      success: true,
      providerMessageId: `msg_push_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      channel: 'push',
    };
  }
}
