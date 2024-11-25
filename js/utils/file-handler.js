/**
 * Clase utilitaria para manejar la carga y validación de archivos
 */
class FileHandler {
  constructor(options = {}) {
    this.options = {
      maxFileSize: 10 * 1024 * 1024, // 10MB por defecto
      allowedTypes: [],
      onProgress: () => {},
      onError: () => {},
      onSuccess: () => {},
      ...options,
    };
  }

  /**
   * Valida un archivo según las restricciones configuradas
   */
  validateFile(file, specificOptions = {}) {
    const options = { ...this.options, ...specificOptions };
    const errors = [];

    // Validar tamaño
    if (file.size > options.maxFileSize) {
      errors.push(
        `El archivo excede el tamaño máximo permitido (${this.formatSize(
          options.maxFileSize
        )})`
      );
    }

    // Validar tipo
    if (options.allowedTypes && options.allowedTypes.length > 0) {
      const fileType = file.type.toLowerCase();
      if (!options.allowedTypes.includes(fileType)) {
        errors.push(
          `Tipo de archivo no permitido. Tipos permitidos: ${options.allowedTypes.join(
            ", "
          )}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sube un archivo con simulación de progreso
   */
  async uploadFile(file, specificOptions = {}) {
    const options = { ...this.options, ...specificOptions };

    // Validar archivo
    const validation = this.validateFile(file, options);
    if (!validation.isValid) {
      options.onError(validation.errors[0]);
      return false;
    }

    // Crear objeto FormData
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simular carga con promesa
      await this.simulateUpload(options.onProgress);

      // Aquí iría la llamada real al servidor
      // const response = await fetch('/upload', {
      //     method: 'POST',
      //     body: formData
      // });

      // Simular respuesta exitosa
      const response = {
        ok: true,
        url: URL.createObjectURL(file),
      };

      if (response.ok) {
        options.onSuccess(response);
        return true;
      } else {
        throw new Error("Error al cargar el archivo");
      }
    } catch (error) {
      options.onError(error.message);
      return false;
    }
  }

  /**
   * Simula una carga progresiva
   */
  simulateUpload(onProgress) {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  }

  /**
   * Genera una vista previa del archivo
   */
  async generatePreview(file) {
    if (file.type.startsWith("image/")) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) =>
          resolve({
            type: "image",
            content: e.target.result,
          });
        reader.readAsDataURL(file);
      });
    } else if (file.type === "application/pdf") {
      return {
        type: "pdf",
        content: `<div class="pdf-preview">
                    <svg width="50" height="50" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h3v3h-3v-3z"/>
                    </svg>
                    <div>Vista previa PDF</div>
                </div>`,
      };
    }
    return null;
  }

  /**
   * Formatea el tamaño del archivo a una cadena legible
   */
  formatSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Verifica si un archivo es una imagen
   */
  isImage(file) {
    return file.type.startsWith("image/");
  }

  /**
   * Verifica si un archivo es un PDF
   */
  isPDF(file) {
    return file.type === "application/pdf";
  }
}

// Exportar para uso global
window.FileHandler = FileHandler;
