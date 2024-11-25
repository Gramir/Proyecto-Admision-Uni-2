/**
 * Utilidades para formatear datos de pago
 */
class PaymentFormatter {
  /**
   * Formatea un número de tarjeta
   */
  static formatCardNumber(value) {
    const number = value.replace(/\D/g, "");
    const isAmex = /^3[47]/.test(number);

    if (isAmex) {
      // Format: XXXX XXXXXX XXXXX
      return number.replace(/(\d{4})(\d{6})?(\d{5})?/, (match, p1, p2, p3) => {
        let formatted = p1;
        if (p2) formatted += " " + p2;
        if (p3) formatted += " " + p3;
        return formatted;
      });
    } else {
      // Format: XXXX XXXX XXXX XXXX
      return number.replace(
        /(\d{4})(\d{4})?(\d{4})?(\d{4})?/,
        (match, p1, p2, p3, p4) => {
          let formatted = p1;
          if (p2) formatted += " " + p2;
          if (p3) formatted += " " + p3;
          if (p4) formatted += " " + p4;
          return formatted;
        }
      );
    }
  }

  /**
   * Formatea una fecha de expiración
   */
  static formatExpiry(value) {
    const number = value.replace(/\D/g, "");

    // Si el primer dígito es mayor a 1, agregar 0 al inicio
    if (number.length === 1 && number > 1) {
      return `0${number}/`;
    }

    // Si los dos primeros dígitos son mayores a 12, ajustar a 12
    if (number.length === 2 && number > 12) {
      return "12/";
    }

    // Formato normal: MM/YY
    return number.replace(/(\d{2})(\d{2})?/, (match, p1, p2) => {
      let formatted = p1;
      if (p2) formatted += "/" + p2;
      return formatted;
    });
  }

  /**
   * Formatea un código CVC
   */
  static formatCVC(value, cardType = "default") {
    const number = value.replace(/\D/g, "");
    const maxLength = cardType === "amex" ? 4 : 3;
    return number.slice(0, maxLength);
  }

  /**
   * Formatea un monto como moneda
   */
  static formatCurrency(amount, currency = "USD") {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: currency,
    }).format(amount);
  }

  /**
   * Formatea un nombre de tarjeta
   */
  static formatCardName(value) {
    // Convertir a mayúsculas y remover caracteres especiales
    return value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑáéíóúñ\s]/g, "");
  }

  /**
   * Da formato al resumen de costos
   */
  static formatCostSummary(costs) {
    return {
      admission: this.formatCurrency(costs.admission),
      exam: this.formatCurrency(costs.exam),
      processingFee: this.formatCurrency(costs.processingFee),
      total: this.formatCurrency(
        costs.admission + costs.exam + costs.processingFee
      ),
    };
  }

  /**
   * Formatea el nombre del tipo de tarjeta
   */
  static formatCardType(type) {
    const types = {
      visa: "Visa",
      mastercard: "MasterCard",
      amex: "American Express",
      discover: "Discover",
    };
    return types[type] || "Desconocida";
  }

  /**
   * Formatea el tamaño de un archivo
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Formatea un número de confirmación
   */
  static formatConfirmationNumber(number) {
    return String(number).padStart(8, "0");
  }

  /**
   * Formatea una fecha de transacción
   */
  static formatTransactionDate(date) {
    return new Intl.DateTimeFormat("es-DO", {
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(date);
  }

  /**
   * Formatea un estado de transacción
   */
  static formatTransactionStatus(status) {
    const statuses = {
      pending: "Pendiente",
      processing: "Procesando",
      completed: "Completado",
      failed: "Fallido",
      refunded: "Reembolsado",
    };
    return statuses[status] || status;
  }

  /**
   * Formatea un mensaje de error de pago
   */
  static formatErrorMessage(code) {
    const messages = {
      invalid_number: "Número de tarjeta inválido",
      invalid_expiry: "Fecha de expiración inválida",
      invalid_cvc: "Código de seguridad inválido",
      expired_card: "Tarjeta expirada",
      insufficient_funds: "Fondos insuficientes",
      card_declined: "Tarjeta rechazada",
      processing_error: "Error al procesar el pago",
      default: "Error en la transacción",
    };
    return messages[code] || messages.default;
  }
}

// Exportar para uso global
window.PaymentFormatter = PaymentFormatter;
