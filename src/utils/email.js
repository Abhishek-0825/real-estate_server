require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');

const apiKey = process.env.SENDINBLUE_API_KEY;
const apiInstance = SibApiV3Sdk.ApiClient.instance;
apiInstance.authentications['api-key'].apiKey = apiKey;
const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (to, subject, html) => {
  const email = new SibApiV3Sdk.SendSmtpEmail();
  email.sender = { email: process.env.MAIL_SENDER || 'noreply@yourapp.com' };
  email.to = [{ email: to }];
  email.subject = subject;
  email.htmlContent = html;

  try {
    const response = await transactionalEmailsApi.sendTransacEmail(email);
    console.log("Email sent:", response?.messageId || response);
  } catch (err) {
    console.error("Email error:", err.response ? err.response.body : err);
    throw new Error("Email send failed");
  }
};

module.exports = sendEmail;
