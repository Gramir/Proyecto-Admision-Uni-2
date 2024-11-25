/**
 * Controlador del formulario académico
 */
class AcademicFormController {
  constructor() {
    this.form = document.getElementById("academicForm");
    this.programsGrid = document.getElementById("programsGrid");

    // Referencias a elementos del formulario
    this.periodoSelect = document.getElementById("periodoIngreso");
    this.tipoCarreraSelect = document.getElementById("tipoCarrera");
    this.recintoSelect = document.getElementById("recinto");
    this.horarioSelect = document.getElementById("horario");

    // Referencias a campos de búsqueda
    this.centroBasicaInput = document.getElementById("centroBasica");
    this.centroSuperiorInput = document.getElementById("centroSuperior");
    this.basicaResults = document.getElementById("basicaResults");
    this.superiorResults = document.getElementById("superiorResults");

    // Estado del formulario
    this.selectedProgram = null;
    this.searchTimeouts = {
      basica: null,
      superior: null,
    };

    // Inicializar manejador de formulario
    this.formHandler = new FormHandler(this.form, {
      autoSave: true,
      validateOnChange: true,
      saveDelay: 1000,
    });

    this.init();
  }

  init() {
    this.setupSelects();
    this.setupSearchFields();
    this.setupCheckboxes();
    this.setupValidation();
    this.setupNavigation();
    this.loadSavedData();
  }

  setupSelects() {
    // Cargar periodos
    const periodos = AcademicData.getPeriodosActivos();
    this.populateSelect(this.periodoSelect, periodos, "id", "nombre");

    // Cargar recintos
    this.populateSelect(
      this.recintoSelect,
      AcademicData.recintos,
      "id",
      "nombre"
    );

    // Event listeners para cambios
    this.recintoSelect.addEventListener("change", () =>
      this.updateProgramsGrid()
    );
    this.tipoCarreraSelect.addEventListener("change", () =>
      this.updateProgramsGrid()
    );
    this.horarioSelect.addEventListener("change", () =>
      this.updateProgramsGrid()
    );
  }

  populateSelect(select, items, valueKey, textKey) {
    const currentValue = select.value;
    select.innerHTML = '<option value="">Seleccione una opción</option>';

    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item[valueKey];
      option.textContent = item[textKey];
      select.appendChild(option);
    });

    if (currentValue) {
      select.value = currentValue;
    }
  }

  updateProgramsGrid() {
    const recintoId = parseInt(this.recintoSelect.value);
    const tipoCarrera = this.tipoCarreraSelect.value;
    const horario = this.horarioSelect.value;

    if (!recintoId) {
      this.programsGrid.innerHTML =
        '<p class="no-programs">Seleccione un recinto para ver los programas disponibles.</p>';
      return;
    }

    const programas = AcademicData.getProgramasByRecinto(recintoId).filter(
      (programa) => !tipoCarrera || programa.tipo === tipoCarrera
    );

    if (programas.length === 0) {
      this.programsGrid.innerHTML =
        '<p class="no-programs">No hay programas disponibles con los criterios seleccionados.</p>';
      return;
    }

    this.programsGrid.innerHTML = programas
      .map((programa) => this.createProgramCard(programa, horario))
      .join("");

    // Restaurar programa seleccionado si existe
    if (this.selectedProgram) {
      const radio = this.programsGrid.querySelector(
        `input[value="${this.selectedProgram}"]`
      );
      if (radio) {
        radio.checked = true;
        radio.closest(".program-card").classList.add("selected");
      }
    }

    // Agregar event listeners
    this.programsGrid.querySelectorAll(".program-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (!e.target.classList.contains("btn-details")) {
          const radio = card.querySelector('input[type="radio"]');
          radio.checked = true;
          this.handleProgramSelection(card);
        }
      });
    });

    this.programsGrid.querySelectorAll(".btn-details").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const programId = btn.closest(".program-card").dataset.programId;
        this.showProgramDetails(programId);
      });
    });
  }

  createProgramCard(programa, horario) {
    const isDisponible = AcademicData.isProgramaDisponible(
      programa.id,
      this.recintoSelect.value,
      horario
    );

    return `
            <div class="program-card ${
              !isDisponible ? "disabled" : ""
            }" data-program-id="${programa.id}">
                <input type="radio" 
                       name="programa" 
                       value="${programa.id}" 
                       class="program-radio" 
                       required
                       ${!isDisponible ? "disabled" : ""}>
                <h3 class="program-title">${programa.nombre}</h3>
                <ul class="program-details">
                    <li>Duración: ${programa.duracion}</li>
                    <li>Modalidad: ${programa.modalidad}</li>
                    <li>Créditos: ${programa.creditos}</li>
                    ${
                      !isDisponible
                        ? '<li class="no-disponible">No disponible en este horario</li>'
                        : ""
                    }
                </ul>
                <button type="button" class="btn-details">Ver detalles</button>
            </div>
        `;
  }

  handleProgramSelection(card) {
    // Remover selección previa
    this.programsGrid
      .querySelectorAll(".program-card")
      .forEach((c) => c.classList.remove("selected"));

    // Agregar nueva selección
    card.classList.add("selected");
    this.selectedProgram = card.dataset.programId;

    // Guardar selección
    this.saveData();
  }

  showProgramDetails(programId) {
    const programa = AcademicData.getDetallesPrograma(programId);
    if (!programa) return;

    const modal = document.createElement("div");
    modal.className = "program-modal";
    modal.innerHTML = `
            <div class="modal-content">
                <button type="button" class="modal-close">&times;</button>
                <h2>${programa.nombre}</h2>
                <div class="program-info">
                    <h3>Descripción</h3>
                    <p>${programa.descripcion}</p>

                    <h3>Requisitos</h3>
                    <ul>
                        ${programa.requisitos
                          .map((req) => `<li>${req}</li>`)
                          .join("")}
                    </ul>

                    <h3>Perfil del Egresado</h3>
                    <ul>
                        ${programa.perfilEgresado
                          .map((perfil) => `<li>${perfil}</li>`)
                          .join("")}
                    </ul>

                    <h3>Campo Laboral</h3>
                    <ul>
                        ${programa.campoLaboral
                          .map((campo) => `<li>${campo}</li>`)
                          .join("")}
                    </ul>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add("active"));

    const closeModal = () => {
      modal.classList.remove("active");
      setTimeout(() => modal.remove(), 300);
    };

    modal.querySelector(".modal-close").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  setupSearchFields() {
    // Configurar búsqueda para centro de educación básica
    this.setupSearch(
      this.centroBasicaInput,
      this.basicaResults,
      "basica",
      this.form.querySelector("#noEncuentroBasica")
    );

    // Configurar búsqueda para centro de educación superior
    this.setupSearch(
      this.centroSuperiorInput,
      this.superiorResults,
      "superior",
      this.form.querySelector("#noEncuentroSuperior")
    );
  }

  setupSearch(input, resultsContainer, tipo, checkbox) {
    // Evento de entrada de texto
    input.addEventListener("input", () => {
      clearTimeout(this.searchTimeouts[tipo]);
      this.searchTimeouts[tipo] = setTimeout(() => {
        const query = input.value.trim();
        if (query.length < 2) {
          resultsContainer.innerHTML = "";
          resultsContainer.classList.remove("active");
          return;
        }

        const results = AcademicData.searchCentrosEducativos(query, tipo);
        this.displaySearchResults(results, resultsContainer, input);
      }, 300);
    });

    // Evento de focus
    input.addEventListener("focus", () => {
      if (input.value.trim().length >= 2) {
        resultsContainer.classList.add("active");
      }
    });

    // Evento de checkbox "No lo encontré"
    checkbox?.addEventListener("change", () => {
      input.disabled = checkbox.checked;
      if (checkbox.checked) {
        input.value = "";
        resultsContainer.innerHTML = "";
        resultsContainer.classList.remove("active");
      } else {
        input.focus();
      }
    });

    // Cerrar resultados al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
        resultsContainer.classList.remove("active");
      }
    });
  }

  displaySearchResults(results, container, input) {
    if (results.length === 0) {
      container.innerHTML =
        '<div class="search-item no-results">No se encontraron resultados</div>';
    } else {
      container.innerHTML = results
        .map(
          (centro) => `
                    <div class="search-item" data-id="${centro.id}">
                        <div class="centro-nombre">${centro.nombre}</div>
                        <div class="centro-tipo">${centro.tipo}</div>
                    </div>
                `
        )
        .join("");
    }

    container.classList.add("active");

    // Agregar event listeners a los resultados
    container.querySelectorAll(".search-item").forEach((item) => {
      item.addEventListener("click", () => {
        input.value = item.querySelector(".centro-nombre").textContent;
        container.classList.remove("active");
      });
    });
  }

  setupCheckboxes() {
    // Habilitar/deshabilitar campos relacionados cuando se marcan los checkboxes
    const checkboxes = {
      noEncuentroBasica: this.centroBasicaInput,
      noEncuentroSuperior: this.centroSuperiorInput,
    };

    Object.entries(checkboxes).forEach(([checkboxId, input]) => {
      const checkbox = document.getElementById(checkboxId);
      if (checkbox) {
        checkbox.addEventListener("change", () => {
          input.disabled = checkbox.checked;
          if (checkbox.checked) {
            input.value = "";
          }
        });
      }
    });
  }

  setupValidation() {
    // Validar fecha de graduación
    this.formHandler.addValidator("fechaGraduacion", (value) => {
      if (!value) return true; // No es obligatorio

      const date = new Date(value);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 50); // Máximo 50 años atrás

      return date <= today && date >= minDate;
    });

    // Validar centros educativos
    const validateCentro = (value, checkboxId) => {
      const checkbox = document.getElementById(checkboxId);
      return checkbox.checked || value.trim().length > 0;
    };

    this.formHandler.addValidator("centroBasica", (value) =>
      validateCentro(value, "noEncuentroBasica")
    );

    this.formHandler.addValidator("centroSuperior", (value) =>
      validateCentro(value, "noEncuentroSuperior")
    );
  }

  setupNavigation() {
    const prevBtn = this.form.querySelector(".btn-prev");
    const nextBtn = this.form.querySelector(".btn-next");

    prevBtn?.addEventListener("click", () => {
      window.location.href = "general.html";
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
    if (!this.formHandler.validateForm()) {
      return false;
    }

    // Validaciones específicas
    const errors = [];

    // Verificar que se haya seleccionado un programa
    if (!this.selectedProgram) {
      errors.push("Debe seleccionar un programa o carrera");
    }

    // Verificar compatibilidad de horario
    if (this.selectedProgram && this.horarioSelect.value) {
      const isDisponible = AcademicData.isProgramaDisponible(
        this.selectedProgram,
        this.recintoSelect.value,
        this.horarioSelect.value
      );
      if (!isDisponible) {
        errors.push(
          "El programa seleccionado no está disponible en el horario elegido"
        );
      }
    }

    if (errors.length > 0) {
      this.showErrors(errors);
      return false;
    }

    return true;
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

    setTimeout(() => {
      errorContainer.remove();
    }, 5000);
  }

  async saveAndNavigate() {
    try {
      await this.saveData();
      window.location.href = "accessibility.html";
    } catch (error) {
      console.error("Error al guardar:", error);
      this.showErrors([
        "Error al guardar los datos. Por favor intente nuevamente.",
      ]);
    }
  }

  async saveData() {
    const formData = this.formHandler.getFormData();
    formData.programa = this.selectedProgram;
    localStorage.setItem("admissionForm_academic", JSON.stringify(formData));
  }

  loadSavedData() {
    const savedData = localStorage.getItem("admissionForm_academic");
    if (!savedData) return;

    try {
      const data = JSON.parse(savedData);

      // Restaurar valores en los campos
      Object.entries(data).forEach(([key, value]) => {
        const field = this.form.elements[key];
        if (!field) return;

        if (key === "programa") {
          this.selectedProgram = value;
        } else {
          field.value = value;
        }
      });

      // Actualizar interfaz
      this.updateProgramsGrid();

      // Restaurar estado de checkboxes y campos relacionados
      ["basica", "superior"].forEach((tipo) => {
        const checkbox = document.getElementById(
          `noEncuentro${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`
        );
        if (checkbox && checkbox.checked) {
          const input = this.form.querySelector(
            `#centro${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`
          );
          if (input) {
            input.disabled = true;
            input.value = "";
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
  new AcademicFormController();
});
