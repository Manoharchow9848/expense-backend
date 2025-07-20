// brevo/sendResetEmail.js
import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

dotenv.config();

const sendResetEmail = async ({ email, name, token }) => {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  defaultClient.authentications['api-key'].apiKey = process.env.API_KEY; 

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.to = [{ email, name }];
  sendSmtpEmail.templateId = 1; // your Brevo template ID
  sendSmtpEmail.params = {
    name,
     resetLink: `${process.env.RESET_LINK_BASE_URL}?token=${token}`,
  };
  sendSmtpEmail.headers = { 'X-Mailin-custom': 'password-reset' };

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Reset email sent successfully:', data);
  } catch (error) {
    console.error('Failed to send reset email:', error.response?.body || error);
    throw error;
  }
};

export default sendResetEmail;
