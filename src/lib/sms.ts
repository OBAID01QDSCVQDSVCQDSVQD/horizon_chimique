/**
 * WinSMS.tn API Integration
 * API Documentation: https://www.winsmspro.com/
 */

export interface SMSResult {
  success: boolean;
  reference?: string;
  balance?: number;
  error?: string;
}

export interface SMSStatus {
  success: boolean;
  status?: string; // e.g. "delivered"
  error?: string;
}

// Simple Cache for Check Balance
let balanceCache: { balance: number; licence: string; timestamp: number } | null = null;
const BALANCE_CACHE_TTL = 30 * 1000; // 30 seconds

// Simple Cache for SMS Status Reference
const statusCache = new Map<string, { status: SMSStatus; timestamp: number }>();
const STATUS_CACHE_TTL = 30 * 1000;

export class WinSMS {
  private static BASE_URL = 'https://www.winsmspro.com/sms/sms/api';

  private static getAPIKey(): string {
    const key = process.env.WINSMS_API_KEY || process.env.WIN_SMS_API_KEY;
    if (!key) throw new Error('WINSMS_API_KEY environment variable is not defined.');
    return key;
  }

  private static getSenderID(): string | undefined {
    return process.env.WINSMS_SENDER_ID || process.env.WIN_SMS_SENDER || undefined;
  }

  /**
   * Normalizes a Tunisian phone number to international format.
   * Auto-adds 216 prefix if number starts with 2, 4, 5, 7, 9
   */
  public static normalizeTunisianNumber(phone: string): string {
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length === 8 && /^[24579]/.test(digits)) {
      return '216' + digits;
    }
    return digits;
  }

  /**
   * Translates common WinSMS API error codes to human-readable format.
   */
  private static parseWinSMSError(result: any, httpStatus: number): string {
    if (httpStatus === 429) return "Rate limit exceeded (Too Many Requests)";
    
    const code = Number(result?.code);
    switch (code) {
      case 100: return "Bad gateway (Gateway connection failed)";
      case 101: return "Wrong action or unsupported action";
      case 102: return "Authentication failed (Invalid API key)";
      case 103: return "Invalid phone number format";
      case 105: return "Insufficient balance";
      case 106: return "Invalid sender ID";
      case 111: return "Spam word detected in message";
      case 112: return "Number is blacklisted";
      case 113: return "Maximum allowed numbers exceeded (limit 100)";
      case 555: return "Licence ended or inactive account";
      case 888: return "No Sender ID provided or approved";
      default:
        return result?.message || result?.error || result?.msg || `Unknown error (${code || httpStatus})`;
    }
  }

  /**
   * Evaluates if a given API JSON response indicates success.
   */
  private static isSuccess(result: any, rawText?: string): boolean {
    if (rawText && rawText.includes('Successfully Send')) return true;
    if (!result) return false;
    return (
      result.status === 'OK' ||
      result.status === 'ok' ||
      String(result.code) === '100' ||
      result.code === 100 ||
      result.success === true ||
      result.response?.includes('Successfully Send') ||
      result.message?.includes('Successfully Send')
    );
  }

  /**
   * Sends a single SMS to a specified phone number.
   * @param to Phone number (Tunisian format preferred)
   * @param message SMS text content
   */
  public static async sendSMS(to: string, message: string): Promise<SMSResult> {
    try {
      const apiKey = this.getAPIKey();
      const from = this.getSenderID();
      const formattedTo = this.normalizeTunisianNumber(to);

      const url = new URL(this.BASE_URL);
      url.searchParams.append('action', 'send-sms');
      url.searchParams.append('api_key', apiKey);
      url.searchParams.append('to', formattedTo);
      // Only include 'from' if explicitly configured - let WinSMS use account default otherwise
      if (from) url.searchParams.append('from', from);
      url.searchParams.append('sms', message);

      const response = await fetch(url.toString(), { cache: 'no-store' });
      const text = await response.text();

      if (text.includes('Successfully Send')) return { success: true };

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        return { success: false, error: `Invalid API response: ${response.status}` };
      }

      if (this.isSuccess(result, text)) {
        return { success: true, reference: result.reference || result.id_sms };
      }

      return { success: false, error: this.parseWinSMSError(result, response.status) };

    } catch (error: any) {
      console.error('WinSMS Error [sendSMS]:', error);
      return { success: false, error: error.message || 'Connection failed' };
    }
  }

  /**
   * Sends a bulk SMS campaign to up to 100 numbers.
   * @param numbers Array of phone numbers
   * @param message SMS text content
   */
  public static async sendBulkSMS(numbers: string[], message: string): Promise<SMSResult> {
    if (numbers.length === 0) return { success: false, error: 'Empty recipients array' };
    if (numbers.length > 100) return { success: false, error: 'Maximum 100 numbers allowed per request' };

    try {
      const apiKey = this.getAPIKey();
      const from = this.getSenderID();
      const formattedNumbers = numbers.map(n => this.normalizeTunisianNumber(n)).join(',');

      const url = new URL(this.BASE_URL);
      url.searchParams.append('action', 'send-sms');
      url.searchParams.append('api_key', apiKey);
      url.searchParams.append('to', formattedNumbers);
      url.searchParams.append('from', from);
      url.searchParams.append('sms', message);

      const response = await fetch(url.toString(), { cache: 'no-store' });
      const text = await response.text();

      if (text.includes('Successfully Send')) return { success: true };

      const result = JSON.parse(text);

      if (this.isSuccess(result, text)) {
        return { success: true, reference: result.reference || result.id_sms };
      }

      return { success: false, error: this.parseWinSMSError(result, response.status) };

    } catch (error: any) {
      console.error('WinSMS Error [sendBulkSMS]:', error);
      return { success: false, error: error.message || 'Connection failed' };
    }
  }

  /**
   * Checks the remaining SMS balance. Cached for 30 seconds.
   */
  public static async checkBalance(): Promise<{ balance: number, licence: string } | null> {
    if (balanceCache && (Date.now() - balanceCache.timestamp < BALANCE_CACHE_TTL)) {
      return { balance: balanceCache.balance, licence: balanceCache.licence };
    }

    try {
      const apiKey = this.getAPIKey();
      const url = new URL(this.BASE_URL);
      url.searchParams.append('action', 'check-balance');
      url.searchParams.append('response', 'json');
      url.searchParams.append('api_key', apiKey);

      const response = await fetch(url.toString(), { cache: 'no-store' });
      const result = await response.json();

      if (response.ok && result.balance !== undefined) {
        const data = {
          balance: Number(result.balance) || 0,
          licence: result.licence || result.date_limite || 'N/A'
        };
        balanceCache = { ...data, timestamp: Date.now() };
        return data;
      }
      return null;
    } catch (error) {
      console.error('WinSMS Error [checkBalance]:', error);
      return null;
    }
  }

  /**
   * Checks the delivery status of a sent SMS by reference ID.
   */
  public static async getSMSStatus(reference: string): Promise<SMSStatus | null> {
    if (!reference) return null;

    if (statusCache.has(reference)) {
      const cached = statusCache.get(reference)!;
      if (Date.now() - cached.timestamp < STATUS_CACHE_TTL) {
        return cached.status;
      }
    }

    try {
      const apiKey = this.getAPIKey();
      const url = new URL('https://www.winsmspro.com/sms/sms/api/verifSms');
      url.searchParams.append('api_key', apiKey);
      url.searchParams.append('ref', reference);

      const response = await fetch(url.toString(), { cache: 'no-store' });
      const result = await response.json();

      const success = this.isSuccess(result);
      const output: SMSStatus = {
        success,
        status: result.status || result.etat || (success ? 'Delivered' : 'Failed'),
        error: success ? undefined : this.parseWinSMSError(result, response.status)
      };

      statusCache.set(reference, { status: output, timestamp: Date.now() });
      return output;
    } catch (error: any) {
      console.error('WinSMS Error [getSMSStatus]:', error);
      return { success: false, error: error.message };
    }
  }
}

/*
 * =========================================================================
 * EXAMPLE USAGE IN API ROUTE OR SERVER COMPONENT
 * =========================================================================
 * import { WinSMS } from '@/lib/sms';
 * import { SMSTemplates } from '@/lib/smsTemplates';
 * 
 * // 1. Sending to admin upon new contact form submission
 * export async function POST(req) {
 *    const body = await req.json();
 *    const adminPhone = process.env.ADMIN_PHONE;
 *    
 *    if (adminPhone) {
 *      const msg = SMSTemplates.newLead(body.clientName);
 *      const result = await WinSMS.sendSMS(adminPhone, msg);
 *      console.log('Admin notified:', result);
 *    }
 *    
 *    // 2. Sending bulk
 *    // WinSMS.sendBulkSMS(['55000000', '98000000'], "Promo Spéciale!");
 *    
 *    return new Response('OK');
 * }
 */
