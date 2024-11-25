/**
 * Validador de datos de pago
 */
class PaymentValidator {
  // Patrones de validación para tarjetas
  static CARD_PATTERNS = {
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/,
    amex: /^3[47][0-9]{13}$/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
  };

  // Longitudes de CVC por tipo de tarjeta
  static CVC_LENGTHS = {
    amex: 4,
    default: 3,
  };

  /**
   * Valida un número de tarjeta
   */
  static validateCardNumber(number) {
    // Remover espacios y guiones
    const cleanNumber = number.replace(/[\s-]/g, "");

    // Verificar longitud básica
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return {
        isValid: false,
        error: "Longitud de tarjeta inválida",
      };
    }

    // Identificar tipo de tarjeta
    const cardType = this.getCardType(cleanNumber);
    if (!cardType) {
      return {
        isValid: false,
        error: "Tipo de tarjeta no soportado",
      };
    }

    // Validar patrón específico
    if (!this.CARD_PATTERNS[cardType].test(cleanNumber)) {
      return {
        isValid: false,
        error: "Número de tarjeta inválido",
      };
    }

    // Validar usando algoritmo de Luhn
    if (!this.luhnCheck(cleanNumber)) {
      return {
        isValid: false,
        error: "Número de tarjeta inválido",
      };
    }

    return {
      isValid: true,
      cardType,
    };
  }

  /**
   * Identifica el tipo de tarjeta
   */
  static getCardType(number) {
    const firstDigit = number.charAt(0);
    const firstTwoDigits = number.substr(0, 2);

    if (number.startsWith("4")) return "visa";
    if (/^5[1-5]/.test(number)) return "mastercard";
    if (/^3[47]/.test(number)) return "amex";
    if (/^6(011|5)/.test(number)) return "discover";

    return null;
  }

  /**
   * Implementa el algoritmo de Luhn
   */
  static luhnCheck(number) {
    let sum = 0;
    let isEven = false;

    // Recorrer de derecha a izquierda
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i));

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Valida una fecha de expiración
   */
  static validateExpiry(expiry) {
    // Formato esperado: MM/YY
    const [month, year] = expiry.split("/").map((part) => part.trim());

    if (!month || !year) {
      return {
        isValid: false,
        error: "Formato de fecha inválido",
      };
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Obtener últimos 2 dígitos
    const currentMonth = currentDate.getMonth() + 1; // getMonth() retorna 0-11

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) {
      return {
        isValid: false,
        error: "Mes inválido",
      };
    }

    if (yearNum < currentYear || yearNum > currentYear + 10) {
      return {
        isValid: false,
        error: "Año inválido",
      };
    }

    if (yearNum === currentYear && monthNum < currentMonth) {
      return {
        isValid: false,
        error: "Tarjeta expirada",
      };
    }

    return { isValid: true };
  }

  /**
   * Valida un código CVC
   */
  static validateCVC(cvc, cardType = "default") {
    const requiredLength =
      this.CVC_LENGTHS[cardType] || this.CVC_LENGTHS.default;

    if (!/^\d+$/.test(cvc)) {
      return {
        isValid: false,
        error: "El CVC debe contener solo números",
      };
    }

    if (cvc.length !== requiredLength) {
      return {
        isValid: false,
        error: `El CVC debe tener ${requiredLength} dígitos`,
      };
    }

    return { isValid: true };
  }

  /**
   * Valida el nombre en la tarjeta
   */
  static validateCardName(name) {
    if (!name || name.trim().length < 5) {
      return {
        isValid: false,
        error: "Nombre demasiado corto",
      };
    }

    // Verificar que solo contiene letras y espacios
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
      return {
        isValid: false,
        error: "El nombre solo puede contener letras",
      };
    }

    // Verificar que tiene al menos dos palabras
    const words = name.trim().split(/\s+/);
    if (words.length < 2) {
      return {
        isValid: false,
        error: "Ingrese nombre y apellido",
      };
    }

    return { isValid: true };
  }

  /**
   * Valida un comprobante de transferencia
   */
  static validateTransferProof(file) {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];

    if (!file) {
      return {
        isValid: false,
        error: "Debe seleccionar un archivo",
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: "Tipo de archivo no permitido",
      };
    }

    if (file.size > MAX_SIZE) {
      return {
        isValid: false,
        error: "El archivo excede el tamaño máximo permitido (5MB)",
      };
    }

    return { isValid: true };
  }
}

// Exportar para uso global
window.PaymentValidator = PaymentValidator;
