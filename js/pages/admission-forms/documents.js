/**
 * Controlador del formulario de documentos
 */
class DocumentsController {
  constructor() {
    // Configuración de documentos
    this.documentConfig = {
      identity: {
        name: "Documento de Identidad",
        allowedTypes: ["application/pdf", "image/jpeg", "image/png"],
        maxSize: 5 * 1024 * 1024, // 5MB
      },
      grades: {
        name: "Record de Notas",
        allowedTypes: ["application/pdf"],
        maxSize: 10 * 1024 * 1024, // 10MB
      },
      photo: {
        name: "Foto 2x2",
        allowedTypes: ["image/jpeg", "image/png"],
        maxSize: 2 * 1024 * 1024, // 2MB
      },
      medical: {
        name: "Certificado Médico",
        allowedTypes: ["application/pdf", "image/jpeg"],
        maxSize: 5 * 1024 * 1024, // 5MB
      },
    };

    this.fileHandler = new FileHandler();
    this.init();
  }

  init() {
    this.setupDocumentItems();
    this.setupGlobalDropzone();
    this.setupNavigation();
    this.loadSavedData();
  }

  setupDocumentItems() {
    document.querySelectorAll(".document-item").forEach((item) => {
      const docType = item.dataset.document;
      const config = this.documentConfig[docType];

      if (!config) return;

      // Configurar botón de carga
      const uploadBtn = item.querySelector(".btn-upload");
      uploadBtn.addEventListener("click", () =>
        this.handleUploadClick(item, config)
      );

      // Configurar drag and drop para cada documento
      this.setupDocumentDragDrop(item, config);
    });
  }

  setupDocumentDragDrop(item, config) {
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      item.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    item.addEventListener("dragenter", () => item.classList.add("dragover"));
    item.addEventListener("dragover", () => item.classList.add("dragover"));
    item.addEventListener("dragleave", () => item.classList.remove("dragover"));
    item.addEventListener("drop", (e) => {
      item.classList.remove("dragover");
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileUpload(item, files[0], config);
      }
    });
  }

  setupGlobalDropzone() {
    const dropzone = document.getElementById("dropzone");
    if (!dropzone) return;

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    dropzone.addEventListener("dragenter", () =>
      dropzone.classList.add("dragover")
    );
    dropzone.addEventListener("dragover", () =>
      dropzone.classList.add("dragover")
    );
    dropzone.addEventListener("dragleave", () =>
      dropzone.classList.remove("dragover")
    );
    dropzone.addEventListener("drop", (e) => {
      dropzone.classList.remove("dragover");
      const files = e.dataTransfer.files;
      this.handleGlobalDrop(files);
    });

    dropzone.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
          this.handleGlobalDrop(e.target.files);
        }
      });
      input.click();
    });
  }

  handleGlobalDrop(files) {
    Array.from(files).forEach((file) => {
      // Intentar determinar el tipo de documento por el tipo de archivo
      const docType = this.determineDocumentType(file);
      if (docType) {
        const item = document.querySelector(`[data-document="${docType}"]`);
        if (item) {
          this.handleFileUpload(item, file, this.documentConfig[docType]);
        }
      }
    });
  }

  determineDocumentType(file) {
    // Lógica para determinar el tipo de documento basado en el tipo de archivo
    if (file.type === "application/pdf") {
      return "grades"; // Por defecto, asumimos que es record de notas
    } else if (file.type.startsWith("image/")) {
      if (file.size <= 2 * 1024 * 1024) {
        return "photo"; // Si es una imagen pequeña, asumimos que es la foto 2x2
      }
      return "identity"; // Por defecto, asumimos que es documento de identidad
    }
    return null;
  }

  async handleFileUpload(item, file, config) {
    const progressBar = item.querySelector(".upload-progress");
    const progressFill = progressBar.querySelector(".progress-bar");
    const preview = item.querySelector(".document-preview");
    const status = item.querySelector(".document-status");
    const verificationStatus = item.querySelector(".verification-status");

    progressBar.style.display = "block";

    try {
      const success = await this.fileHandler.uploadFile(file, {
        ...config,
        onProgress: (progress) => {
          progressFill.style.width = `${progress}%`;
        },
        onError: (error) => {
          this.showError(item, error);
          progressBar.style.display = "none";
        },
        onSuccess: async (response) => {
          status.textContent = "Archivo cargado";
          status.style.color = "var(--success-color)";

          // Generar vista previa
          const previewData = await this.fileHandler.generatePreview(file);
          if (previewData) {
            preview.style.display = "block";
            if (previewData.type === "image") {
              preview.innerHTML = `<img src="${previewData.content}" alt="Vista previa">`;
            } else {
              preview.innerHTML = previewData.content;
            }
          }

          // Actualizar estado de verificación
          verificationStatus.textContent = "En revisión";
          verificationStatus.className = "verification-status pending";

          // Simular proceso de verificación
          setTimeout(() => {
            verificationStatus.textContent = "Verificado";
            verificationStatus.className = "verification-status verified";
          }, 2000);

          // Guardar en localStorage
          this.saveDocumentState(item.dataset.document, {
            name: file.name,
            type: file.type,
            url: response.url,
            status: "verified",
          });
        },
      });

      if (!success) {
        throw new Error("Error en la carga del archivo");
      }
    } catch (error) {
      this.showError(item, error.message);
      progressBar.style.display = "none";
    }
  }

  handleUploadClick(item, config) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = config.allowedTypes.join(",");
    input.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        this.handleFileUpload(item, e.target.files[0], config);
      }
    });
    input.click();
  }

  showError(item, message) {
    const errorDiv = item.querySelector(".upload-error");
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    setTimeout(() => {
      errorDiv.style.display = "none";
    }, 3000);
  }

  saveDocumentState(docType, data) {
    const savedData = JSON.parse(
      localStorage.getItem("admissionForm_documents") || "{}"
    );
    savedData[docType] = data;
    localStorage.setItem("admissionForm_documents", JSON.stringify(savedData));
  }

  loadSavedData() {
    const savedData = JSON.parse(
      localStorage.getItem("admissionForm_documents") || "{}"
    );
    Object.entries(savedData).forEach(([docType, data]) => {
      const item = document.querySelector(`[data-document="${docType}"]`);
      if (item && data) {
        // Restaurar estado del documento
        const status = item.querySelector(".document-status");
        const verificationStatus = item.querySelector(".verification-status");
        const preview = item.querySelector(".document-preview");

        status.textContent = "Archivo cargado";
        status.style.color = "var(--success-color)";

        verificationStatus.textContent = "Verificado";
        verificationStatus.className = "verification-status verified";

        // Restaurar vista previa
        if (data.type.startsWith("image/")) {
          preview.style.display = "block";
          preview.innerHTML = `<img src="${data.url}" alt="Vista previa">`;
        } else if (data.type === "application/pdf") {
          preview.style.display = "block";
          preview.innerHTML = `<div class="pdf-preview">
                        <svg width="50" height="50" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h3v3h-3v-3z"/>
                        </svg>
                        <div>Vista previa PDF</div>
                    </div>`;
        }
      }
    });

    this.updateFormProgress();
  }

  updateFormProgress() {
    const totalDocs = Object.keys(this.documentConfig).length;
    const uploadedDocs = document.querySelectorAll(
      ".verification-status.verified"
    ).length;
    const progress = (uploadedDocs / totalDocs) * 100;

    const progressBar = document.querySelector(".progress-bar .progress-fill");
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }

  setupNavigation() {
    const prevBtn = document.querySelector(".btn-prev");
    const nextBtn = document.querySelector(".btn-next");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        window.location.href = "personal.html";
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (this.validateForm()) {
          window.location.href = "general.html";
        } else {
          this.showFormError();
        }
      });
    }
  }

  validateForm() {
    const requiredDocs = ["identity", "grades", "photo"];
    const uploadedDocs = document.querySelectorAll(
      ".verification-status.verified"
    );
    const uploadedTypes = Array.from(uploadedDocs).map(
      (status) => status.closest(".document-item").dataset.document
    );

    const missingRequired = requiredDocs.filter(
      (doc) => !uploadedTypes.includes(doc)
    );

    if (missingRequired.length > 0) {
      const missingNames = missingRequired
        .map((doc) => this.documentConfig[doc].name)
        .join(", ");

      this.showGlobalError(`Documentos requeridos faltantes: ${missingNames}`);
      return false;
    }

    return true;
  }

  showFormError() {
    const errorContainer = document.createElement("div");
    errorContainer.className = "form-error";
    errorContainer.textContent =
      "Por favor, sube todos los documentos requeridos antes de continuar.";

    const form = document.getElementById("documentsForm");
    form.insertBefore(errorContainer, form.querySelector(".navigation"));

    setTimeout(() => {
      errorContainer.remove();
    }, 5000);
  }

  showGlobalError(message) {
    if (!this.errorToast) {
      this.errorToast = document.createElement("div");
      this.errorToast.className = "error-toast";
      document.body.appendChild(this.errorToast);
    }

    this.errorToast.textContent = message;
    this.errorToast.classList.add("show");

    setTimeout(() => {
      this.errorToast.classList.remove("show");
    }, 5000);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new DocumentsController();
});
