/**
 * Controlador del formulario de accesibilidad
 */
class AccessibilityFormController {
  constructor() {
    this.form = document.getElementById("accessibilityForm");
    this.questionsContainer = document.querySelector(".questions-container");

    // Estado de las respuestas
    this.responses = {};

    // Inicializar manejador de formulario
    this.formHandler = new FormHandler(this.form, {
      autoSave: true,
      validateOnChange: true,
      saveDelay: 1000,
    });

    this.init();
  }

  init() {
    this.setupQuestionBlocks();
    this.setupConfirmation();
    this.setupNavigation();
    this.loadSavedData();
  }

  setupQuestionBlocks() {
    // Configurar listeners para cada bloque de pregunta
    document.querySelectorAll(".question-block").forEach((block) => {
      const category = block.dataset.category;
      const radioInputs = block.querySelectorAll('input[type="radio"]');
      const additionalInfo = block.querySelector(".additional-info");
      const detailsInput = additionalInfo?.querySelector("textarea");

      // Manejar cambios en las opciones de radio
      radioInputs.forEach((input) => {
        input.addEventListener("change", () => {
          this.handleOptionSelection(category, input.value, block);
          this.updateQuestionStatus(block);

          // Mostrar/ocultar información adicional
          if (additionalInfo && detailsInput) {
            const needsDetails = ["no_puedo", "mucha", "cierta"].includes(
              input.value
            );
            this.toggleAdditionalInfo(additionalInfo, needsDetails);

            if (needsDetails) {
              detailsInput.required = true;
              detailsInput.focus();
            } else {
              detailsInput.required = false;
              detailsInput.value = "";
            }
          }
        });
      });

      // Validar detalles adicionales si son necesarios
      if (detailsInput) {
        detailsInput.addEventListener("input", () => {
          this.validateDetails(category, detailsInput.value);
        });
      }
    });
  }

  handleOptionSelection(category, value, block) {
    // Actualizar estado de respuestas
    this.responses[category] = {
      value: value,
      needsDetails: ["no_puedo", "mucha", "cierta"].includes(value),
    };

    // Actualizar UI
    block.querySelectorAll(".option-label").forEach((label) => {
      const input = label.querySelector('input[type="radio"]');
      label.classList.toggle("selected", input.checked);
    });

    // Guardar datos
    this.saveData();
  }

  updateQuestionStatus(block) {
    const category = block.dataset.category;
    const response = this.responses[category];

    if (!response) return;

    block.classList.remove("invalid", "completed");

    if (this.validateQuestion(category)) {
      block.classList.add("completed");
    } else {
      block.classList.add("invalid");
    }
  }

  toggleAdditionalInfo(infoElement, show) {
    if (show) {
      infoElement.classList.remove("hidden");
    } else {
      infoElement.classList.add("hidden");
    }
  }

  validateQuestion(category) {
    const response = this.responses[category];
    if (!response) return false;

    const detailsInput = document.querySelector(
      `textarea[name="${category}_details"]`
    );

    if (response.needsDetails && detailsInput) {
      return detailsInput.value.trim().length >= 10;
    }

    return true;
  }

  validateDetails(category, value) {
    const response = this.responses[category];
    if (!response || !response.needsDetails) return true;

    return value.trim().length >= 10;
  }

  setupConfirmation() {
    const confirmationCheckbox = document.querySelector(
      'input[name="confirmacion"]'
    );
    if (confirmationCheckbox) {
      confirmationCheckbox.addEventListener("change", () => {
        this.saveData();
      });
    }
  }

  setupNavigation() {
    const prevBtn = this.form.querySelector(".btn-prev");
    const nextBtn = this.form.querySelector(".btn-next");

    prevBtn?.addEventListener("click", () => {
      window.location.href = "academic.html";
    });

    nextBtn?.addEventListener("click", () => {
      if (this.validateForm()) {
        this.saveAndNavigate();
      } else {
        this.showValidationErrors();
      }
    });
  }

  validateForm() {
    let isValid = true;
    const errors = [];

    // Validar cada pregunta
    document.querySelectorAll(".question-block").forEach((block) => {
      const category = block.dataset.category;
      const radioSelected = block.querySelector('input[type="radio"]:checked');

      if (!radioSelected) {
        isValid = false;
        errors.push(
          `Por favor, responda la pregunta sobre ${this.getCategoryLabel(
            category
          )}`
        );
        block.classList.add("invalid");
      } else if (!this.validateQuestion(category)) {
        isValid = false;
        errors.push(
          `Por favor, proporcione más detalles sobre su condición de ${this.getCategoryLabel(
            category
          )}`
        );
        block.classList.add("invalid");
      }
    });

    // Validar confirmación
    const confirmationCheckbox = document.querySelector(
      'input[name="confirmacion"]'
    );
    if (!confirmationCheckbox.checked) {
      isValid = false;
      errors.push(
        "Por favor, confirme que la información proporcionada es verdadera"
      );
      confirmationCheckbox
        .closest(".confirmation-section")
        .classList.add("invalid");
    }

    if (!isValid) {
      this.showErrors(errors);
    }

    return isValid;
  }

  getCategoryLabel(category) {
    const labels = {
      vision: "visión",
      audicion: "audición",
      movilidad: "movilidad",
      concentracion: "concentración",
      comunicacion: "comunicación",
    };
    return labels[category] || category;
  }

  showErrors(errors) {
    const errorContainer = document.createElement("div");
    errorContainer.className = "validation-errors";
    errorContainer.innerHTML = `
            <div class="error-title">Por favor corrija los siguientes errores:</div>
            <ul>
                ${errors.map((error) => `<li>${error}</li>`).join("")}
            </ul>
        `;

    const navigation = this.form.querySelector(".navigation");
    this.form.insertBefore(errorContainer, navigation);

    // Scroll al primer error
    const firstError = this.form.querySelector(".invalid");
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setTimeout(() => {
      errorContainer.remove();
    }, 5000);
  }

  async saveAndNavigate() {
    try {
      await this.saveData();
      window.location.href = "exam.html";
    } catch (error) {
      console.error("Error al guardar:", error);
      this.showErrors([
        "Error al guardar los datos. Por favor intente nuevamente.",
      ]);
    }
  }

  async saveData() {
    const formData = this.formHandler.getFormData();
    formData.responses = this.responses;
    localStorage.setItem(
      "admissionForm_accessibility",
      JSON.stringify(formData)
    );
  }

  loadSavedData() {
    const savedData = localStorage.getItem("admissionForm_accessibility");
    if (!savedData) return;

    try {
      const data = JSON.parse(savedData);

      // Restaurar respuestas guardadas
      if (data.responses) {
        Object.entries(data.responses).forEach(([category, response]) => {
          const block = document.querySelector(`[data-category="${category}"]`);
          if (!block) return;

          // Restaurar selección de radio
          const radio = block.querySelector(`input[value="${response.value}"]`);
          if (radio) {
            radio.checked = true;
            this.handleOptionSelection(category, response.value, block);
          }

          // Restaurar detalles adicionales
          const detailsInput = block.querySelector(
            `textarea[name="${category}_details"]`
          );
          if (detailsInput && data[`${category}_details`]) {
            detailsInput.value = data[`${category}_details`];
            this.validateDetails(category, detailsInput.value);
          }
        });
      }

      // Restaurar comentarios adicionales
      const comentarios = document.querySelector(
        'textarea[name="comentarios_adicionales"]'
      );
      if (comentarios && data.comentarios_adicionales) {
        comentarios.value = data.comentarios_adicionales;
      }

      // Restaurar confirmación
      const confirmacion = document.querySelector('input[name="confirmacion"]');
      if (confirmacion && data.confirmacion) {
        confirmacion.checked = data.confirmacion;
      }

      // Actualizar estado de todos los bloques
      document.querySelectorAll(".question-block").forEach((block) => {
        const category = block.dataset.category;
        this.updateQuestionStatus(block);

        // Mostrar/ocultar información adicional si es necesario
        const additionalInfo = block.querySelector(".additional-info");
        if (additionalInfo && data.responses[category]) {
          this.toggleAdditionalInfo(
            additionalInfo,
            data.responses[category].needsDetails
          );
        }
      });
    } catch (error) {
      console.error("Error al cargar datos guardados:", error);
    }
  }

  /**
   * Genera un resumen de las necesidades de accesibilidad
   */
  generateAccessibilitySummary() {
    const summary = {
      needsAssistance: false,
      conditions: [],
      recommendations: [],
    };

    Object.entries(this.responses).forEach(([category, response]) => {
      if (response.value !== "ninguna") {
        summary.needsAssistance = true;

        const details = document.querySelector(
          `textarea[name="${category}_details"]`
        )?.value;

        summary.conditions.push({
          category: this.getCategoryLabel(category),
          severity: response.value,
          details: details || "",
        });

        // Agregar recomendaciones basadas en la categoría y severidad
        summary.recommendations.push(
          ...this.getRecommendations(category, response.value)
        );
      }
    });

    return summary;
  }

  /**
   * Genera recomendaciones basadas en la condición
   */
  getRecommendations(category, severity) {
    const recommendations = {
      vision: {
        no_puedo: [
          "Proporcionar materiales en formato de audio",
          "Asegurar compatibilidad con lectores de pantalla",
          "Asignar asistente para apoyo en clases prácticas",
        ],
        mucha: [
          "Materiales con alto contraste",
          "Textos en formato ampliado",
          "Ubicación preferencial en el aula",
        ],
        cierta: [
          "Considerar iluminación adecuada",
          "Proporcionar documentos digitales adaptables",
        ],
      },
      audicion: {
        no_puedo: [
          "Intérprete de lenguaje de señas",
          "Material visual y transcripciones",
          "Sistemas de comunicación alternativos",
        ],
        mucha: [
          "Subtítulos en contenido audiovisual",
          "Ubicación preferencial para lectura labial",
          "Instrucciones por escrito",
        ],
        cierta: [
          "Sistema de amplificación de sonido",
          "Material escrito de apoyo",
        ],
      },
      movilidad: {
        no_puedo: [
          "Asegurar accesibilidad total en instalaciones",
          "Proporcionar espacios adaptados",
          "Considerar tiempo adicional para desplazamientos",
        ],
        mucha: [
          "Mobiliario adaptado",
          "Rutas accesibles prioritarias",
          "Asistencia para actividades específicas",
        ],
        cierta: [
          "Evaluación de barreras arquitectónicas",
          "Ajustes en mobiliario según necesidad",
        ],
      },
      concentracion: {
        mucha: [
          "Tiempo adicional en evaluaciones",
          "Ambiente controlado para exámenes",
          "Descansos programados",
        ],
        cierta: [
          "Instrucciones escritas paso a paso",
          "Recordatorios y agenda estructurada",
        ],
      },
      comunicacion: {
        mucha: [
          "Sistemas de comunicación alternativos",
          "Tiempo adicional para expresión",
          "Evaluaciones adaptadas",
        ],
        cierta: ["Material de apoyo visual", "Instrucciones claras y concisas"],
      },
    };

    return recommendations[category]?.[severity] || [];
  }

  /**
   * Verifica si se requieren adaptaciones específicas
   */
  requiresSpecialAdaptations() {
    return Object.values(this.responses).some(
      (response) => response.value === "no_puedo" || response.value === "mucha"
    );
  }

  /**
   * Guarda los datos y procesa las necesidades especiales si es necesario
   */
  async processSpecialNeeds() {
    const summary = this.generateAccessibilitySummary();

    if (summary.needsAssistance) {
      // Guardar el resumen para uso posterior
      localStorage.setItem(
        "admissionForm_accessibility_summary",
        JSON.stringify(summary)
      );

      // Si hay necesidades críticas, marcar para seguimiento
      if (this.requiresSpecialAdaptations()) {
        await this.notifySpecialNeeds(summary);
      }
    }

    return summary;
  }

  /**
   * Notifica al sistema sobre necesidades especiales
   * (Simulación - en producción se conectaría con un sistema real)
   */
  async notifySpecialNeeds(summary) {
    console.log("Notificando necesidades especiales:", summary);
    // Aquí iría la lógica de notificación real
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const controller = new AccessibilityFormController();
});
