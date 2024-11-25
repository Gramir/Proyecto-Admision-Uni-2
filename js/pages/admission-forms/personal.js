/**
 * Controlador del formulario de información personal
 */
class PersonalFormController {
  constructor() {
    this.form = document.getElementById("personalForm");
    this.contactsContainer = document.getElementById("contacts-container");
    this.maxContacts = 3;
    this.currentContacts = 0;

    // Inicializar manejador de formulario
    this.formHandler = new FormHandler(this.form, {
      autoSave: true,
      validateOnChange: true,
      saveDelay: 1000,
    });

    this.init();

    this.validationMessages = {
      required: "Por favor complete este campo",
      pattern: "Por favor ingrese un formato válido",
    };
  }

  init() {
    // Agregar validadores personalizados
    this.setupValidators();

    // Inicializar contactos de emergencia
    this.initializeContacts();

    // Configurar navegación
    this.setupNavigation();

    // Cargar datos guardados si existen
    this.loadSavedData();

    // Configurar autoguardado
    this.setupAutoSave();
  }

  setupValidators() {
    // Validador de cédula
    this.formHandler.addValidator("cedula", (value) => {
      const cedulaPattern = /^\d{3}-\d{7}-\d{1}$/;
      return cedulaPattern.test(value);
    });

    // Validador de fecha de nacimiento
    this.formHandler.addValidator("fechaNacimiento", (value) => {
      const date = new Date(value);
      const today = new Date();
      const minAge = 15;
      const maxAge = 100;

      const age = today.getFullYear() - date.getFullYear();
      return age >= minAge && age <= maxAge;
    });

    // Validador de nombres y apellidos
    const nameValidator = (value) => {
      return value.length >= 2 && /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s']+$/.test(value);
    };
    this.formHandler.addValidator("nombres", nameValidator);
    this.formHandler.addValidator("apellidos", nameValidator);
  }

  initializeContacts() {
    this.addContactEntry();

    // Observer para contactos dinámicos
    this.setupContactsObserver();
  }

  setupContactsObserver() {
    // Observar cambios en el contenedor de contactos
    const observer = new MutationObserver(() => {
      this.updateContactsState();
    });

    observer.observe(this.contactsContainer, {
      childList: true,
      subtree: true,
    });
  }

  createContactEntry() {
    const entry = document.createElement("div");
    entry.className = "contact-entry";
    entry.innerHTML = `
            <div class="contact-fields">
                <div class="form-group">
                    <input type="text" 
                           class="form-control" 
                           name="contactName[]" 
                           placeholder="Nombre del contacto"
                           required>
                </div>
                <div class="form-group">
                    <input type="tel" 
                           class="form-control" 
                           name="contactPhone[]" 
                           placeholder="Teléfono"
                           pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                           required>
                </div>
                <div class="form-group">
                    <input type="text" 
                           class="form-control" 
                           name="contactRelation[]" 
                           placeholder="Parentesco"
                           required>
                </div>
            </div>
            <button type="button" class="add-contact" aria-label="Agregar contacto">+</button>
        `;

    // Configurar mensajes de validación para los campos nuevos
    const inputs = entry.querySelectorAll("input[required]");
    inputs.forEach((input) => {
      input.addEventListener("invalid", (e) => {
        e.preventDefault();
        if (e.target.validity.valueMissing) {
          e.target.setCustomValidity(this.validationMessages.required);
        } else if (e.target.validity.patternMismatch) {
          e.target.setCustomValidity(this.validationMessages.pattern);
        }
      });

      input.addEventListener("input", (e) => {
        e.target.setCustomValidity("");
      });
    });
    // Configurar el botón de agregar/eliminar
    const button = entry.querySelector("button");
    button.addEventListener("click", () => {
      if (button.classList.contains("remove-contact")) {
        this.removeContactEntry(entry);
      } else {
        this.addContactEntry();
      }
    });

    return entry;
  }

  addContactEntry() {
    if (this.currentContacts >= this.maxContacts) return;

    const entry = this.createContactEntry();
    this.contactsContainer.appendChild(entry);
    this.currentContacts++;
    this.updateContactsState();
  }

  removeContactEntry(entry) {
    entry.remove();
    this.currentContacts--;
    this.updateContactsState();
  }

  updateContactsState() {
    const entries = this.contactsContainer.querySelectorAll(".contact-entry");

    entries.forEach((entry, index) => {
      const button = entry.querySelector("button");

      // El último entrada siempre tiene botón de agregar si no se ha alcanzado el máximo
      if (
        index === entries.length - 1 &&
        this.currentContacts < this.maxContacts
      ) {
        button.textContent = "+";
        button.classList.remove("remove-contact");
        button.classList.add("add-contact");
      } else {
        button.textContent = "×";
        button.classList.remove("add-contact");
        button.classList.add("remove-contact");
      }
    });
  }

  setupNavigation() {
    const nextBtn = this.form.querySelector(".btn-next");
    nextBtn.addEventListener("click", () => {
      if (this.form.checkValidity() && this.validateForm()) {
        this.saveAndNavigate();
      } else {
        this.showValidationErrors();
      }
    });
  }

  validateForm() {
    return this.formHandler.validateForm();
  }

  showValidationErrors() {
    // Mostrar mensajes de error para campos inválidos
    this.form.querySelectorAll(":invalid").forEach((field) => {
      const formGroup = field.closest(".form-group");
      formGroup.classList.add("has-error");

      // Mostrar mensaje específico según el tipo de error
      let errorMessage = "Este campo es requerido";
      if (field.validity.patternMismatch) {
        errorMessage = "Formato inválido";
      } else if (field.validity.typeMismatch) {
        errorMessage = "Tipo de dato inválido";
      }

      this.formHandler.toggleFieldError(field, true, errorMessage);
    });
  }

  async saveAndNavigate() {
    try {
      await this.saveData();
      window.location.href = "documents.html";
    } catch (error) {
      console.error("Error al guardar:", error);
      // Mostrar mensaje de error al usuario
    }
  }

  async saveData() {
    const formData = this.formHandler.getFormData();
    // Aquí iría la lógica para guardar en el backend
    localStorage.setItem("admissionForm_personal", JSON.stringify(formData));
  }

  loadSavedData() {
    const savedData = localStorage.getItem("admissionForm_personal");
    if (savedData) {
      const data = JSON.parse(savedData);
      Object.entries(data).forEach(([key, value]) => {
        const field = this.form.elements[key];
        if (field) {
          field.value = value;
        }
      });

      // Restaurar contactos guardados
      if (data.contactName) {
        this.restoreContacts(data);
      }
    }
  }

  restoreContacts(data) {
    // Limpiar contactos existentes
    this.contactsContainer.innerHTML = "";
    this.currentContacts = 0;

    // Restaurar contactos guardados
    const contactCount = data.contactName.length;
    for (let i = 0; i < contactCount; i++) {
      const entry = this.createContactEntry();
      entry.querySelector('[name="contactName[]"]').value = data.contactName[i];
      entry.querySelector('[name="contactPhone[]"]').value =
        data.contactPhone[i];
      entry.querySelector('[name="contactRelation[]"]').value =
        data.contactRelation[i];
      this.contactsContainer.appendChild(entry);
      this.currentContacts++;
    }

    this.updateContactsState();
  }

  setupAutoSave() {
    let autoSaveTimeout;
    this.form.addEventListener("input", () => {
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = setTimeout(() => {
        if (this.form.checkValidity()) {
          this.saveData();
        }
      }, 1000);
    });
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new PersonalFormController();
});
