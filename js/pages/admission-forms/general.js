/**
 * Controlador del formulario de información general
 */
class GeneralFormController {
  constructor() {
    this.form = document.getElementById("generalesForm");

    // Referencias a elementos del formulario
    this.provinciaSelect = document.getElementById("provincia");
    this.municipioSelect = document.getElementById("municipio");
    this.provinciaTrabSelect = document.getElementById("provinciaTrabajo");
    this.municipioTrabSelect = document.getElementById("municipioTrabajo");

    // Referencia a sección laboral
    this.infoLaboral = document.getElementById("infoLaboral");
    this.laboraRadios = document.querySelectorAll('input[name="labora"]');

    // Inicializar manejador de formulario
    this.formHandler = new FormHandler(this.form, {
      autoSave: true,
      validateOnChange: true,
      saveDelay: 1000,
    });

    this.init();
  }

  init() {
    this.setupLocationSelects();
    this.setupValidators();
    this.setupPhoneFormatting();
    this.setupLaboralSection();
    this.setupNavigation();
    this.loadSavedData();
  }

  setupLocationSelects() {
    // Cargar provincias para dirección personal
    const provincias = LocationData.getProvincias();
    this.populateSelect(this.provinciaSelect, provincias, "id", "nombre");
    this.populateSelect(this.provinciaTrabSelect, provincias, "id", "nombre");

    // Manejar cambios en provincia personal
    this.provinciaSelect.addEventListener("change", () => {
      const provinciaId = parseInt(this.provinciaSelect.value);
      this.updateMunicipios(provinciaId, this.municipioSelect);
    });

    // Manejar cambios en provincia laboral
    this.provinciaTrabSelect.addEventListener("change", () => {
      const provinciaId = parseInt(this.provinciaTrabSelect.value);
      this.updateMunicipios(provinciaId, this.municipioTrabSelect);
    });

    // Deshabilitar municipios hasta que se seleccione provincia
    this.municipioSelect.disabled = true;
    this.municipioTrabSelect.disabled = true;
  }

  updateMunicipios(provinciaId, municipioSelect) {
    municipioSelect.disabled = true;
    municipioSelect.innerHTML =
      '<option value="">Seleccione un municipio</option>';

    if (provinciaId) {
      const municipios = LocationData.getMunicipios(provinciaId);
      if (municipios.length > 0) {
        municipios.forEach((municipio) => {
          const option = document.createElement("option");
          option.value = municipio;
          option.textContent = LocationData.formatLocation(municipio);
          municipioSelect.appendChild(option);
        });
        municipioSelect.disabled = false;
      }
    }
  }

  populateSelect(select, items, valueKey, textKey) {
    select.innerHTML = '<option value="">Seleccione una opción</option>';
    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item[valueKey];
      option.textContent = LocationData.formatLocation(item[textKey]);
      select.appendChild(option);
    });
  }

  setupLaboralSection() {
    // Manejar visibilidad de sección laboral
    this.laboraRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        if (e.target.value === "si") {
          this.infoLaboral.classList.remove("hidden");
        } else {
          this.infoLaboral.classList.add("hidden");
          this.clearLaboralFields();
        }
      });
    });
  }

  clearLaboralFields() {
    const laboralFields = [
      "empresa",
      "cargo",
      "telefonoTrabajo",
      "provinciaTrabajo",
      "municipioTrabajo",
      "calleTrabajoNo",
    ];

    laboralFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.value = "";
      }
    });
  }

  setupValidators() {
    // Validador de teléfono
    const phoneValidator = (value) => {
      if (!value) return true; // Permitir vacío si no es requerido
      return /^\d{3}-\d{3}-\d{4}$/.test(value);
    };

    // Validador de email
    const emailValidator = (value) => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(value);
    };

    // Agregar validadores al form handler
    this.formHandler.addValidator("telefono", phoneValidator);
    this.formHandler.addValidator("celular", phoneValidator);
    this.formHandler.addValidator("telefonoTrabajo", phoneValidator);
    this.formHandler.addValidator("email", emailValidator);
  }

  setupPhoneFormatting() {
    const phoneInputs = this.form.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length >= 3) {
          value = value.slice(0, 3) + "-" + value.slice(3);
        }
        if (value.length >= 7) {
          value = value.slice(0, 7) + "-" + value.slice(7);
        }
        if (value.length > 12) {
          value = value.slice(0, 12);
        }
        e.target.value = value;
      });
    });
  }

  setupNavigation() {
    const prevBtn = this.form.querySelector(".btn-prev");
    const nextBtn = this.form.querySelector(".btn-next");

    prevBtn?.addEventListener("click", () => {
      window.location.href = "documents.html";
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

    // Validar campos requeridos
    const requiredFields = this.form.querySelectorAll("[required]");
    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        this.showFieldError(field, "Este campo es requerido");
        isValid = false;
      } else {
        this.clearFieldError(field);
      }
    });

    // Validar que la provincia tenga un municipio seleccionado
    if (this.provinciaSelect.value && !this.municipioSelect.value) {
      this.showFieldError(
        this.municipioSelect,
        "Debe seleccionar un municipio"
      );
      isValid = false;
    }

    // Validar campos laborales si trabaja
    const trabajaActualmente = this.form.querySelector(
      'input[name="labora"]:checked'
    );
    if (trabajaActualmente && trabajaActualmente.value === "si") {
      if (this.provinciaTrabSelect.value && !this.municipioTrabSelect.value) {
        this.showFieldError(
          this.municipioTrabSelect,
          "Debe seleccionar un municipio"
        );
        isValid = false;
      }
    }

    return isValid && this.formHandler.validateForm();
  }

  showFieldError(field, message) {
    const formGroup = field.closest(".form-group");
    if (!formGroup) return;

    formGroup.classList.add("has-error");

    let errorMessage = formGroup.querySelector(".error-message");
    if (!errorMessage) {
      errorMessage = document.createElement("div");
      errorMessage.className = "error-message";
      formGroup.appendChild(errorMessage);
    }
    errorMessage.textContent = message;
  }

  clearFieldError(field) {
    const formGroup = field.closest(".form-group");
    if (!formGroup) return;

    formGroup.classList.remove("has-error");
    const errorMessage = formGroup.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  showValidationErrors() {
    // Crear contenedor de error
    const errorContainer = document.createElement("div");
    errorContainer.className = "form-error";
    errorContainer.textContent =
      "Por favor, complete todos los campos requeridos correctamente.";

    // Encontrar el elemento navigation dentro del formulario
    const navigation = this.form.querySelector(".navigation");

    // Si existe navigation, insertamos antes de él, si no, lo añadimos al final del formulario
    if (navigation) {
      navigation.parentNode.insertBefore(errorContainer, navigation);
    } else {
      this.form.appendChild(errorContainer);
    }

    // Auto remover después de 5 segundos
    setTimeout(() => {
      if (errorContainer.parentNode) {
        errorContainer.remove();
      }
    }, 5000);

    // Hacer scroll al primer error
    const firstError = this.form.querySelector(".has-error");
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  async saveAndNavigate() {
    try {
      await this.saveData();
      window.location.href = "academic.html";
    } catch (error) {
      console.error("Error al guardar:", error);
      this.showValidationErrors();
    }
  }

  async saveData() {
    const formData = this.formHandler.getFormData();
    localStorage.setItem("admissionForm_general", JSON.stringify(formData));
  }

  loadSavedData() {
    const savedData = localStorage.getItem("admissionForm_general");
    if (!savedData) return;

    try {
      const data = JSON.parse(savedData);

      // Restaurar valores en los campos
      Object.entries(data).forEach(([key, value]) => {
        const field = this.form.elements[key];
        if (!field) return;

        field.value = value;

        // Manejar radio buttons de trabajo
        if (key === "labora") {
          const radio = this.form.querySelector(
            `input[name="labora"][value="${value}"]`
          );
          if (radio) {
            radio.checked = true;
            if (value === "si") {
              this.infoLaboral.classList.remove("hidden");
            }
          }
        }

        // Actualizar municipios para ambas direcciones
        if (key === "provincia" && value) {
          this.updateMunicipios(parseInt(value), this.municipioSelect);
          if (data.municipio) {
            setTimeout(() => {
              const municipioField = this.form.elements["municipio"];
              if (municipioField) {
                municipioField.value = data.municipio;
              }
            }, 0);
          }
        }

        if (key === "provinciaTrabajo" && value) {
          this.updateMunicipios(parseInt(value), this.municipioTrabSelect);
          if (data.municipioTrabajo) {
            setTimeout(() => {
              const municipioTrabField = this.form.elements["municipioTrabajo"];
              if (municipioTrabField) {
                municipioTrabField.value = data.municipioTrabajo;
              }
            }, 0);
          }
        }
      });
    } catch (error) {
      console.error("Error al cargar datos guardados:", error);
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new GeneralFormController();
});
