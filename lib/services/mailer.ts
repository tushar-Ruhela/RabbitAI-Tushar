import { Resend } from 'resend';

// Replace string to prevent errors if not set
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export const sendSummaryEmail = async (to: string, summaryHtml: string) => {
  try {
    const data = await resend.emails.send({
      from: 'support@support.nippongo.app',
      to: [to],
      subject: 'Your AI-Generated Sales Data Summary',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px;">
            <p>Hello! Your sales data has been processed by <strong>Rabbit-Sync</strong> AI pipeline.</p>
            <hr />
            <div>
              ${summaryHtml}
            </div>
            <hr />
            <p style="font-size: 12px; color: #6b7280;">Automated message from your RabbitAI Internal Tool</p>
          </div>
        </div>
      `,
    });
    console.log("Email Sent via Resend:", data);
    return data;
  } catch (error) {
    console.error("Resend Error:", error);
    throw new Error("Failed to send email");
  }
};
