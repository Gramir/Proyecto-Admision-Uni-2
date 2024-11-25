/**
 * Utility class for handling form operations throughout the application
 */
class FormHandler {
  constructor(formElement, options = {}) {
    this.form = formElement;
    this.options = {
      autoSave: true,
      validateOnChange: true,
      saveDelay: 1000,
      ...options,
    };

    this.saveTimeout = null;
    this.validators = new Map();

    this.init();
  }

  init() {
    if (!this.form) return;

    // Add form event listeners
    this.form.addEventListener("submit", this.handleSubmit.bind(this));

    if (this.options.validateOnChange) {
      this.form.addEventListener("input", this.handleInput.bind(this));
      this.form.addEventListener("change", this.handleChange.bind(this));
    }

    // Initialize character counters
    this.initCharCounters();
    this.setupValidationMessages();
  }

  setupValidationMessages() {
    const inputs = this.form.querySelectorAll(
      "input[required], select[required], textarea[required]"
    );
    inputs.forEach((input) => {
      input.oninvalid = function (e) {
        e.preventDefault();
        if (!e.target.validity.valid) {
          if (e.target.validity.valueMissing) {
            e.target.setCustomValidity("Por favor complete este campo");
          } else if (e.target.validity.patternMismatch) {
            e.target.setCustomValidity("Por favor ingrese un formato válido");
          }
        }
      };

      input.oninput = function (e) {
        e.target.setCustomValidity("");
      };
    });
  }

  initCharCounters() {
    const inputs = this.form.querySelectorAll("[maxlength]");
    inputs.forEach((input) => {
      const counter = input
        .closest(".form-group")
        ?.querySelector(".char-count");
      const maxLength = input.getAttribute("maxlength");

      if (counter && maxLength) {
        // Inicializar contador
        counter.textContent = `${input.value.length}/${maxLength}`;

        // Agregar listener para actualizar contador
        input.addEventListener("input", () => {
          counter.textContent = `${input.value.length}/${maxLength}`;
        });
      }
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.validateForm()) {
      const formData = this.getFormData();
      this.submitForm(formData);
    }
  }

  handleInput(e) {
    const field = e.target;

    // Update char counter if exists
    this.updateCharCounter(field);

    // Handle auto-save
    if (this.options.autoSave) {
      this.scheduleAutoSave();
    }
  }

  handleChange(e) {
    const field = e.target;

    // Validate field if validator exists
    if (this.validators.has(field.name)) {
      this.validateField(field);
    }
  }

  updateCharCounter(field) {
    if (field.maxLength) {
      const counter = field
        .closest(".form-group")
        ?.querySelector(".char-count");
      if (counter) {
        counter.textContent = `${field.value.length}/${field.maxLength}`;
      }
    }
  }

  scheduleAutoSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      if (this.validateForm()) {
        this.autoSave();
      }
    }, this.options.saveDelay);
  }

  validateForm() {
    let isValid = true;
    const formData = this.getFormData();

    for (const [fieldName, validator] of this.validators) {
      const field = this.form.elements[fieldName];
      if (field && !this.validateField(field)) {
        isValid = false;
      }
    }

    return isValid;
  }

  validateField(field) {
    const validator = this.validators.get(field.name);
    if (!validator) return true;

    const isValid = validator(field.value);
    this.toggleFieldError(field, !isValid);

    return isValid;
  }

  toggleFieldError(field, hasError) {
    const formGroup = field.closest(".form-group");
    if (!formGroup) return;

    formGroup.classList.toggle("has-error", hasError);

    // Handle error message
    let errorMessage = formGroup.querySelector(".error-message");
    if (hasError) {
      if (!errorMessage) {
        errorMessage = document.createElement("div");
        errorMessage.className = "error-message";
        formGroup.appendChild(errorMessage);
      }
      errorMessage.textContent =
        field.validationMessage || "Este campo es inválido";
    } else if (errorMessage) {
      errorMessage.remove();
    }
  }

  getFormData() {
    const formData = new FormData(this.form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  }

  async submitForm(data) {
    try {
      // Aquí iría la lógica de envío al servidor
      console.log("Enviando datos:", data);

      // Simular envío exitoso
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.handleSubmitSuccess();
    } catch (error) {
      this.handleSubmitError(error);
    }
  }

  async autoSave() {
    const data = this.getFormData();

    try {
      // Aquí iría la lógica de auto-guardado
      console.log("Auto-guardando:", data);

      // Simular guardado exitoso
      await new Promise((resolve) => setTimeout(resolve, 500));

      this.handleAutoSaveSuccess();
    } catch (error) {
      this.handleAutoSaveError(error);
    }
  }

  handleSubmitSuccess() {
    // Implementar según necesidades
    console.log("Formulario enviado con éxito");
  }

  handleSubmitError(error) {
    // Implementar según necesidades
    console.error("Error al enviar formulario:", error);
  }

  handleAutoSaveSuccess() {
    // Implementar según necesidades
    console.log("Auto-guardado exitoso");
  }

  handleAutoSaveError(error) {
    // Implementar según necesidades
    console.error("Error en auto-guardado:", error);
  }

  // Método para agregar validadores personalizados
  addValidator(fieldName, validatorFn) {
    this.validators.set(fieldName, validatorFn);
  }
}

// Exportar para uso global
window.FormHandler = FormHandler;
