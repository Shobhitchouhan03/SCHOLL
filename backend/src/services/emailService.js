/**
 * Abstract Email Service Provider
 */
export class EmailService {
  static async sendEmail({ to, subject, body }) {
    console.log(`[EmailService Mock] Dispatching email to "${to}" | Subject: "${subject}"`);
    return {
      success: true,
      providerMessageId: `msg_email_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      channel: 'email',
    };
  }
}
