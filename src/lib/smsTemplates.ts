/**
 * Predefined SMS templates in French.
 * All functions validate character length to warn if message exceeds 1 SMS segment (157 chars limit).
 */
export class SMSTemplates {
  /**
   * Validates that the message doesn't exceed 1 SMS segment.
   */
  private static validateLength(message: string): string {
    if (message.length > 157) {
      console.warn(`[WinSMS Warning] Message exceeds 157 characters (${message.length}). It might be sent as 2 segments.`);
    }
    return message;
  }

  /**
   * Notifies admin of a new lead/quote request.
   * @param clientName Name of the client who submitted the form
   */
  public static newLead(clientName: string): string {
    const text = `Nouveau devis reçu de ${clientName} sur sdkbatiment.com. Connectez-vous pour répondre.`;
    return this.validateLength(text);
  }

  /**
   * Confirms to the client that their order/service request was received.
   * @param clientName Name of the client (mostly unused in the template as per instructions, but kept for signature if needed)
   * @param service Name of the requested service
   */
  public static orderConfirmation(clientName: string, service: string): string {
    const fs = service.substring(0, 40); // prevent overflow
    const text = `SDK Batiment: Votre demande de ${fs} a été reçue. Nous vous contacterons sous 24h.`;
    return this.validateLength(text);
  }

  /**
   * Reminds client of an upcoming appointment.
   * @param clientName Name of the client
   * @param date Date and time of the appointment
   */
  public static appointmentReminder(clientName: string, date: string): string {
    const text = `SDK Batiment: Rappel RDV le ${date}. Info: +216XXXXXXXX`;
    return this.validateLength(text);
  }
}
