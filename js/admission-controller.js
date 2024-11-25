/**
 * Controlador principal del sistema de admisión
 */
class AdmissionController {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 7;
    this.formData = {};
    this.isComplete = false;

    // Estado de los pasos
    this.steps = {
      personal: { id: 1, completed: false, route: "personal.html" },
      documents: { id: 2, completed: false, route: "documents.html" },
      general: { id: 3, completed: false, route: "general.html" },
      academic: { id: 4, completed: false, route: "academic.html" },
      accessibility: { id: 5, completed: false, route: "accessibility.html" },
      exam: { id: 6, completed: false, route: "exam.html" },
      payment: { id: 7, completed: false, route: "payment.html" },
    };
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "documents.html") {
      this.currentStep = 2;
    }
    // Inicializar sistema
    this.init();
  }

  init() {
    this.loadSavedState();
    this.setupEventListeners();
    this.validateCurrentStep();
    this.updateProgressBar();
  }

  /**
   * Carga el estado guardado del proceso de admisión
   */
  loadSavedState() {
    Object.keys(this.steps).forEach((step) => {
      const savedData = localStorage.getItem(`admissionForm_${step}`);
      if (savedData) {
        try {
          this.formData[step] = JSON.parse(savedData);
          this.steps[step].completed = true;
        } catch (error) {
          console.error(`Error loading saved state for ${step}:`, error);
        }
      }
    });

    // Determinar paso actual basado en la URL
    const currentPage = window.location.pathname.split("/").pop();
    this.currentStep = this.getStepFromRoute(currentPage);
  }

  /**
   * Configura los event listeners globales
   */
  setupEventListeners() {
    // Listener para cambios en el almacenamiento
    window.addEventListener("storage", (e) => {
      if (e.key && e.key.startsWith("admissionForm_")) {
        this.handleStorageChange(e);
      }
    });

    // Listener para navegación
    window.addEventListener("beforeunload", (e) => {
      if (this.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "";
      }
    });

    // Listener para timeout de sesión
    this.setupSessionTimeout();
  }

  /**
   * Configura el timeout de sesión
   */
  setupSessionTimeout() {
    let timeout;
    const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutos

    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.handleSessionTimeout();
      }, TIMEOUT_DURATION);
    };

    // Reiniciar timeout en cada interacción
    ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(
      (event) => {
        document.addEventListener(event, resetTimeout);
      }
    );

    resetTimeout();
  }

  /**
   * Maneja el timeout de sesión
   */
  handleSessionTimeout() {
    const unsavedChanges = this.hasUnsavedChanges();
    if (unsavedChanges) {
      // Guardar estado actual
      this.saveCurrentState();
    }

    // Mostrar mensaje de timeout
    const modal = document.createElement("div");
    modal.className = "timeout-modal";
    modal.innerHTML = `
            <div class="timeout-content">
                <h2>Sesión Expirada</h2>
                <p>Su sesión ha expirado por inactividad.</p>
                <p>${
                  unsavedChanges ? "Sus cambios han sido guardados." : ""
                }</p>
                <button class="btn" onclick="window.location.reload()">Recargar página</button>
            </div>
        `;
    document.body.appendChild(modal);
  }

  /**
   * Obtiene el número de paso desde la ruta
   */
  getStepFromRoute(route) {
    for (const [key, step] of Object.entries(this.steps)) {
      if (step.route === route) {
        return step.id;
      }
    }
    return 1; // Default a primer paso
  }

  /**
   * Valida el paso actual
   */
  validateCurrentStep() {
    // Verificar que no se salten pasos
    const previousStepsCompleted = this.validatePreviousSteps();
    if (!previousStepsCompleted) {
      // Redirigir al último paso completado o al primero
      const lastCompletedStep = this.getLastCompletedStep();
      const nextStep = lastCompletedStep
        ? this.steps[lastCompletedStep].route
        : this.steps.personal.route;

      window.location.href = nextStep;
      return false;
    }

    return true;
  }

  /**
   * Valida que los pasos anteriores estén completados
   */
  validatePreviousSteps() {
    for (const [key, step] of Object.entries(this.steps)) {
      if (step.id >= this.currentStep) break;
      if (!step.completed) return false;
    }
    return true;
  }

  /**
   * Obtiene el último paso completado
   */
  getLastCompletedStep() {
    let lastCompleted = null;
    for (const [key, step] of Object.entries(this.steps)) {
      if (step.completed) lastCompleted = key;
    }
    return lastCompleted;
  }

  /**
   * Actualiza la barra de progreso
   */
  updateProgressBar() {
    const progressBar = document.querySelector(".progress-fill");
    if (!progressBar) return;

    // Establecer un valor fijo para el paso 2 (28.52%)
    if (this.currentStep === 2) {
      progressBar.style.width = "28.52%";
      return;
    }

    const progress = ((this.currentStep - 1) / this.totalSteps) * 100;
    progressBar.style.width = `${progress}%`;

    // Actualizar estado de los pasos en la barra
    document.querySelectorAll(".step").forEach((step, index) => {
      const stepNum = index + 1;
      if (stepNum < this.currentStep) {
        step.classList.add("completed");
        step.classList.remove("active");
      } else if (stepNum === this.currentStep) {
        step.classList.add("active");
        step.classList.remove("completed");
      } else {
        step.classList.remove("completed", "active");
      }
    });
  }

  /**
   * Verifica si hay cambios sin guardar
   */
  hasUnsavedChanges() {
    const currentForm = document.querySelector("form");
    if (!currentForm) return false;

    const formData = new FormData(currentForm);
    const currentData = Object.fromEntries(formData.entries());
    const savedData =
      this.formData[Object.keys(this.steps)[this.currentStep - 1]];

    return JSON.stringify(currentData) !== JSON.stringify(savedData);
  }

  /**
   * Guarda el estado actual
   */
  saveCurrentState() {
    const currentForm = document.querySelector("form");
    if (!currentForm) return;

    const formData = new FormData(currentForm);
    const stepKey = Object.keys(this.steps)[this.currentStep - 1];
    const data = Object.fromEntries(formData.entries());

    this.formData[stepKey] = data;
    localStorage.setItem(`admissionForm_${stepKey}`, JSON.stringify(data));
  }

  /**
   * Maneja cambios en el almacenamiento
   */
  handleStorageChange(event) {
    const step = event.key.replace("admissionForm_", "");
    if (this.steps[step]) {
      try {
        this.formData[step] = JSON.parse(event.newValue);
        this.steps[step].completed = true;
        this.updateProgressBar();
      } catch (error) {
        console.error(`Error updating state for ${step}:`, error);
      }
    }
  }

  /**
   * Navega al siguiente paso
   */
  nextStep() {
    if (this.currentStep >= this.totalSteps) return;

    const currentStepKey = Object.keys(this.steps)[this.currentStep - 1];
    this.steps[currentStepKey].completed = true;
    this.currentStep++;

    const nextStepKey = Object.keys(this.steps)[this.currentStep - 1];
    window.location.href = this.steps[nextStepKey].route;
  }

  /**
   * Navega al paso anterior
   */
  previousStep() {
    if (this.currentStep <= 1) return;

    this.currentStep--;
    const prevStepKey = Object.keys(this.steps)[this.currentStep - 1];
    window.location.href = this.steps[prevStepKey].route;
  }

  /**
   * Obtiene el resumen del proceso
   */
  getProcessSummary() {
    const summary = {
      complete: this.isComplete,
      progress: this.calculateProgress(),
      steps: {},
    };

    Object.entries(this.steps).forEach(([key, step]) => {
      summary.steps[key] = {
        completed: step.completed,
        data: this.formData[key] || null,
      };
    });

    return summary;
  }

  /**
   * Calcula el progreso total
   */
  calculateProgress() {
    const completedSteps = Object.values(this.steps).filter(
      (step) => step.completed
    ).length;
    return (completedSteps / this.totalSteps) * 100;
  }

  /**
   * Verifica si se puede proceder al siguiente paso
   */
  canProceed() {
    // Verificar requisitos específicos por paso
    switch (this.currentStep) {
      case this.steps.documents.id:
        return this.validateDocuments();
      case this.steps.exam.id:
        return this.validateExamSchedule();
      case this.steps.payment.id:
        return this.validatePayment();
      default:
        return true;
    }
  }

  /**
   * Valida los documentos requeridos
   */
  validateDocuments() {
    const requiredDocs = ["identity", "grades", "photo"];
    const documents = this.formData.documents || {};

    return requiredDocs.every(
      (doc) => documents[doc] && documents[doc].status === "verified"
    );
  }

  /**
   * Valida la programación del examen
   */
  validateExamSchedule() {
    const examData = this.formData.exam || {};
    return examData.selectedDate && examData.selectedTimeSlot;
  }

  /**
   * Valida el pago
   */
  validatePayment() {
    const paymentData = this.formData.payment || {};
    return paymentData.transactionId && paymentData.status === "completed";
  }

  /**
   * Reset completo del proceso
   */
  resetProcess() {
    // Limpiar datos guardados
    Object.keys(this.steps).forEach((step) => {
      localStorage.removeItem(`admissionForm_${step}`);
    });

    // Resetear estado
    this.currentStep = 1;
    this.formData = {};
    this.isComplete = false;

    Object.values(this.steps).forEach((step) => {
      step.completed = false;
    });

    // Redireccionar al inicio
    window.location.href = this.steps.personal.route;
  }
}

// Exportar para uso global
window.AdmissionController = AdmissionController;

// Inicializar controlador cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  window.admissionController = new AdmissionController();
});
