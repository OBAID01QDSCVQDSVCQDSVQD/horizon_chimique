/**
 * WinSMS.tn API Integration
 * API Documentation: https://www.winsmspro.com/
 */

function normalizeTunisianNumber(to) {
  let digits = String(to).replace(/\D/g, '');
  // Si c'est déjà 11 chiffres commençant par 216, c'est bon
  if (digits.length === 11 && digits.startsWith('216')) {
    return digits;
  }
  // Sinon, si c'est 8 chiffres et valide, on ajoute le 216
  if (digits.length === 8 && /^[24579]/.test(digits)) {
    return '216' + digits;
  }
  return digits;
}

export async function sendSMS(to, message) {
  const apiKey = process.env.WIN_SMS_API_KEY;
  // Doit correspondre exactement à l’Entête (Sender ID) validé sur winsmspro.com (ex. SdkBatimant)
  const from = process.env.WIN_SMS_SENDER || 'SdkBatimant';

  if (!apiKey) {
    console.error('WinSMS: WIN_SMS_API_KEY manquant dans .env');
    return { success: false, error: 'Configuration SMS manquante (WIN_SMS_API_KEY)' };
  }

  const formattedTo = normalizeTunisianNumber(to);

  const url = `https://www.winsmspro.com/sms/sms/api?action=send-sms&api_key=${encodeURIComponent(apiKey)}&to=${encodeURIComponent(formattedTo)}&from=${encodeURIComponent(from)}&sms=${encodeURIComponent(message)}`;

  try {
    console.log(`WinSMS: envoi vers ${formattedTo}...`);
    const response = await fetch(url, { cache: 'no-store' });
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      console.error('WinSMS: réponse non-JSON:', text.slice(0, 200));
      return { success: false, error: `Réponse API invalide (${response.status})` };
    }

    const ok =
      result &&
      (result.status === 'OK' ||
        result.status === 'ok' ||
        String(result.code) === '100' ||
        result.code === 100 ||
        result.success === true ||
        text.includes('Successfully Send'));

    if (ok) {
      return { success: true, result };
    }

    console.error('WinSMS Error Response:', result);
    const msg =
      result.message ||
      result.msg ||
      result.error ||
      (typeof result === 'object' ? JSON.stringify(result) : String(result));
    return { success: false, error: msg || 'Erreur WinSMS' };
  } catch (error) {
    console.error('WinSMS connection error:', error);
    return { success: false, error: error?.message || 'Connection to WinSMS failed' };
  }
}
