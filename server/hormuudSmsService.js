import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Load .env ka hor inta aadan isticmaalin process.env

class HormuudSmsService {
  constructor() {
    this.baseUrl = process.env.HORMUUD_SMS_API_URL;
    this.username = process.env.HORMUUD_SMS_USERNAME;
    this.password = process.env.HORMUUD_SMS_PASSWORD;
    this.senderid = process.env.HORMUUD_SENDERID || 'HaypeConst';
    this.accessToken = null;
    this.tokenExpiry = null;

    console.log('🔧 Hormuud SMS Service initialized');
    console.log('🔧 Username:', this.username);
    console.log('🔧 Password exists:', !!this.password);
    console.log('🔧 API URL:', this.baseUrl);

    if (!this.username || !this.password || !this.baseUrl) {
      throw new Error('❌ Hormuud SMS Service: Missing username, password, or API URL in .env');
    }
  }

  // Get Bearer token
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const params = new URLSearchParams();
      params.append('Username', this.username);
      params.append('Password', this.password);
      params.append('grant_type', 'password');

      const response = await axios.post(`${this.baseUrl}/token`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      this.accessToken = response.data.access_token;
      const expiresIn = response.data.expires_in || 3600;
      this.tokenExpiry = Date.now() + expiresIn * 1000;

      console.log('✅ Hormuud SMS API token obtained successfully');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Error getting Hormuud SMS API token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Hormuud SMS API');
    }
  }

  // Send SMS using Basic Auth
  async sendSmsWithBasicAuth(mobile, message) {
    try {
      const payload = {
        mobile,
        message,
        senderid: this.senderid,
        refid: `ref_${Date.now()}`,
        validity: 0
      };

      const basicAuth = Buffer.from(`${this.username}:${this.password}`).toString('base64');

      const response = await axios.post(`${this.baseUrl}/api/sms/Send`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        }
      });

      if (response.data.ResponseCode === '200') {
        console.log('✅ SMS sent successfully to:', mobile);
        return { success: true, messageId: response.data.Data?.MessageID };
      } else {
        console.warn('❌ SMS send failed:', response.data.ResponseMessage);
        return { success: false, error: response.data.ResponseMessage };
      }
    } catch (error) {
      console.warn('❌ Basic Auth failed:', error.response?.data || error.message);
      return { success: false };
    }
  }

  // Send SMS (Basic Auth first, then Bearer Token)
  async sendSms(mobile, message) {
    // Try Basic Auth
    let result = await this.sendSmsWithBasicAuth(mobile, message);
    if (result.success) return result;

    console.log('⚠️ Basic Auth failed, trying Bearer Token...');
    try {
      const token = await this.getAccessToken();

      const payload = {
        mobile,
        message,
        senderid: this.senderid,
        refid: `ref_${Date.now()}`,
        validity: 0
      };

      const response = await axios.post(`${this.baseUrl}/api/SendSMS`, payload, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });

      if (response.data.ResponseCode === '200') {
        console.log('✅ SMS sent successfully to:', mobile);
        return { success: true, messageId: response.data.Data?.MessageID };
      } else {
        console.error('❌ SMS send failed:', response.data.ResponseMessage);
        return { success: false, error: response.data.ResponseMessage };
      }
    } catch (error) {
      console.error('❌ Error sending SMS:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.ResponseMessage || error.message };
    }
  }

  // Send bulk SMS
  async sendBulkSms(messages) {
    const results = [];
    for (const msg of messages) {
      const res = await this.sendSms(msg.mobile, msg.message);
      results.push({ mobile: msg.mobile, ...res });
      await new Promise(resolve => setTimeout(resolve, 100)); // Delay 100ms
    }
    return results;
  }
}

export default new HormuudSmsService();
