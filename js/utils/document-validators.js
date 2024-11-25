/**
 * Utilidades para validación de documentos
 */
class DocumentValidators {
  constructor() {
    // Expresiones regulares para validación
    this.patterns = {
      // Solo letras, espacios y caracteres especiales comunes en nombres
      name: /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s']+$/,

      // Formato de cédula dominicana: XXX-XXXXXXX-X
      cedula: /^\d{3}-\d{7}-\d{1}$/,

      // Formato de teléfono: XXX-XXX-XXXX
      phone: /^\d{3}-\d{3}-\d{4}$/,

      // Formato de email básico
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    };

    // Tipos de archivo permitidos por categoría
    this.allowedTypes = {
      image: ["image/jpeg", "image/png", "image/jpg"],
      document: ["application/pdf"],
      all: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
    };

    // Límites de tamaño por tipo (en bytes)
    this.sizeLimits = {
      photo: 2 * 1024 * 1024, // 2MB para fotos
      document: 5 * 1024 * 1024, // 5MB para documentos
      large: 10 * 1024 * 1024, // 10MB para archivos grandes
    };
  }

  /**
   * Valida el formato de un archivo
   */
  validateFileFormat(file, allowedFormats) {
    const formats = this.allowedTypes[allowedFormats] || allowedFormats;
    return formats.includes(file.type);
  }

  /**
   * Valida el tamaño de un archivo
   */
  validateFileSize(file, maxSize) {
    const limit = this.sizeLimits[maxSize] || maxSize;
    return file.size <= limit;
  }

  /**
   * Valida las dimensiones de una imagen
   */
  async validateImageDimensions(
    file,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight
  ) {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const valid =
          (!minWidth || img.width >= minWidth) &&
          (!minHeight || img.height >= minHeight) &&
          (!maxWidth || img.width <= maxWidth) &&
          (!maxHeight || img.height <= maxHeight);
        resolve(valid);
      };
      img.onerror = () => resolve(false);

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Valida que un archivo PDF no esté corrupto
   */
  async validatePDF(file) {
    if (file.type !== "application/pdf") return false;

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Verificar la firma del PDF (%PDF-) al inicio del archivo
      const signature = new Uint8Array(arrayBuffer.slice(0, 4));
      const decoder = new TextDecoder();
      return decoder.decode(signature) === "%PDF";
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica si una imagen está en blanco y negro
   */
  async isBlackAndWhite(file) {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Si los valores RGB son significativamente diferentes,
          // la imagen tiene color
          if (
            Math.abs(r - g) > 30 ||
            Math.abs(r - b) > 30 ||
            Math.abs(g - b) > 30
          ) {
            resolve(false);
            return;
          }
        }

        resolve(true);
      };
      img.onerror = () => resolve(false);

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Verifica si una imagen cumple con los requisitos de calidad
   */
  async validateImageQuality(file, options = {}) {
    const {
      minWidth = 300,
      minHeight = 300,
      maxSize = this.sizeLimits.photo,
      requireBlackAndWhite = false,
    } = options;

    if (!file.type.startsWith("image/")) {
      return {
        valid: false,
        errors: ["El archivo no es una imagen"],
      };
    }

    const errors = [];

    // Validar formato
    if (!this.validateFileFormat(file, "image")) {
      errors.push("Formato de imagen no soportado");
    }

    // Validar tamaño
    if (!this.validateFileSize(file, maxSize)) {
      errors.push(
        `El archivo excede el tamaño máximo de ${maxSize / (1024 * 1024)}MB`
      );
    }

    // Validar dimensiones
    const dimensionsValid = await this.validateImageDimensions(
      file,
      minWidth,
      minHeight
    );
    if (!dimensionsValid) {
      errors.push(
        `La imagen debe tener al menos ${minWidth}x${minHeight} píxeles`
      );
    }

    // Validar blanco y negro si es requerido
    if (requireBlackAndWhite) {
      const isBlackAndWhite = await this.isBlackAndWhite(file);
      if (!isBlackAndWhite) {
        errors.push("La imagen debe estar en blanco y negro");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Genera un resumen del estado de los documentos
   */
  generateDocumentsSummary(documents) {
    const summary = {
      total: documents.length,
      uploaded: 0,
      verified: 0,
      pending: 0,
      rejected: 0,
    };

    documents.forEach((doc) => {
      if (doc.status === "uploaded") summary.uploaded++;
      else if (doc.status === "verified") summary.verified++;
      else if (doc.status === "rejected") summary.rejected++;
      else summary.pending++;
    });

    return summary;
  }
}

// Exportar para uso global
window.DocumentValidators = DocumentValidators;
