/**
 * Controlador del formulario de prueba de admisión
 * Gestiona la selección de fechas y horarios para pruebas de admisión
 */
class ExamFormController {
  constructor() {
    // Inicializar referencias al DOM y estado
    this.initializeDOMReferences();

    // Inicializar estado del controlador
    this.initializeState();

    // Crear manejador de formulario
    this.formHandler = new FormHandler(this.form, {
      autoSave: true,
      validateOnChange: true,
      saveDelay: 1000,
    });

    this.init();
  }

  initializeDOMReferences() {
    this.form = document.getElementById("examForm");
    this.calendarDates = document.querySelector(".calendar-dates");
    this.currentMonthElement = document.querySelector(".current-month");
    this.timeSlotsContainer = document.getElementById("timeSlots");
    this.selectedDateInfo = document.getElementById("selectedDate");
    this.examDetails = document.querySelector(".exam-details");
    this.examLocation = document.getElementById("examLocation");
    this.specialAccommodations = document.getElementById(
      "specialAccommodations"
    );
    this.periodSelect = document.getElementById("examPeriod");

    // Verificar elementos críticos
    if (!this.calendarDates)
      console.error("Calendar dates container not found");
    if (!this.currentMonthElement)
      console.error("Current month element not found");
    if (!this.periodSelect) console.error("Period select not found");
  }

  initializeState() {
    this.currentMonth = new Date();
    this.selectedDate = null;
    this.selectedTimeSlot = null;
    this.activePeriod = null; // Controla el periodo actualmente seleccionado
  }

  init() {
    this.setupPeriodSelector();
    this.setupCalendarNavigation();
    this.setupAccessibilityAdaptations();
    this.setupNavigation();
    this.loadSavedData();
    this.renderCalendar(); // Renderiza el calendario inicial (deshabilitado)
  }

  setupPeriodSelector() {
    // Obtener periodos activos filtrados por fecha
    const activePeriods = ExamData.periodos.filter((periodo) => {
      const endDate = new Date(periodo.fechaFin);
      return endDate >= new Date();
    });

    // Poblar selector de periodos
    activePeriods.forEach((periodo) => {
      const option = document.createElement("option");
      option.value = periodo.id;
      option.textContent = periodo.nombre;
      this.periodSelect.appendChild(option);
    });

    // Manejar cambio de periodo
    this.periodSelect.addEventListener("change", () => {
      const selectedPeriodId = this.periodSelect.value;

      if (selectedPeriodId) {
        // Activar periodo y actualizar vista
        this.activePeriod = ExamData.periodos.find(
          (p) => p.id === selectedPeriodId
        );
        this.currentMonth = new Date(this.activePeriod.fechaInicio);
        this.selectedDate = null; // Resetear selección anterior
        this.selectedTimeSlot = null;
        this.renderCalendar();
        this.resetDateSelection();
      } else {
        // Desactivar selección de fechas
        this.activePeriod = null;
        this.renderCalendar();
      }
    });
  }

  resetDateSelection() {
    // Limpiar información de fecha seleccionada
    this.selectedDateInfo.textContent = "Seleccione una fecha disponible";
    this.timeSlotsContainer.innerHTML = "";
    this.examDetails.classList.add("hidden");
  }

  setupCalendarNavigation() {
    const prevBtn = document.querySelector(".prev-month");
    const nextBtn = document.querySelector(".next-month");

    prevBtn?.addEventListener("click", () => {
      if (this.activePeriod) {
        // Solo permitir navegación con periodo activo
        this.currentMonth = DateUtils.addMonths(this.currentMonth, -1);
        this.renderCalendar();
      }
    });

    nextBtn?.addEventListener("click", () => {
      if (this.activePeriod) {
        // Solo permitir navegación con periodo activo
        this.currentMonth = DateUtils.addMonths(this.currentMonth, 1);
        this.renderCalendar();
      }
    });
  }

  renderCalendar() {
    // Actualizar título del mes
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    this.currentMonthElement.textContent = `${DateUtils.MONTHS[month]} ${year}`;

    if (!this.calendarDates) return;

    // Limpiar y renderizar calendario
    this.calendarDates.innerHTML = "";

    // Calcular días a mostrar
    const firstDay = DateUtils.getFirstDayOfMonth(year, month);
    const daysInMonth = DateUtils.getDaysInMonth(year, month);
    const totalDays = firstDay + daysInMonth + (42 - (firstDay + daysInMonth));

    // Configurar fecha inicial
    let currentDate = new Date(year, month, 1);
    currentDate.setDate(currentDate.getDate() - firstDay);

    // Renderizar días
    for (let i = 0; i < totalDays; i++) {
      const isOtherMonth = currentDate.getMonth() !== month;
      const dateElement = this.createDateElement(currentDate, isOtherMonth);
      this.calendarDates.appendChild(dateElement);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    this.updateNavigationButtons();
  }

  createDateElement(date, isOtherMonth) {
    const dateElement = document.createElement("div");
    dateElement.className = `calendar-date${
      isOtherMonth ? " other-month" : ""
    }`;
    dateElement.textContent = date.getDate();

    // Solo habilitar selección si hay periodo activo y la fecha está dentro del rango
    if (this.activePeriod && !isOtherMonth) {
      const fechaActual = new Date(date);
      const fechaInicio = new Date(this.activePeriod.fechaInicio);
      const fechaFin = new Date(this.activePeriod.fechaFin);

      if (
        fechaActual >= fechaInicio &&
        fechaActual <= fechaFin &&
        ExamData.isFechaDisponible(date)
      ) {
        const horarios = ExamData.getHorariosDisponibles(date);
        if (horarios.length > 0) {
          dateElement.classList.add("available");
          dateElement.classList.add("has-spots");

          if (horarios.some((h) => h.disponibles < 5)) {
            dateElement.classList.add("few-spots");
          }

          const totalSpots = horarios.reduce(
            (sum, h) => sum + h.disponibles,
            0
          );
          dateElement.setAttribute(
            "data-tooltip",
            `${totalSpots} cupos disponibles`
          );

          dateElement.addEventListener("click", () => {
            this.handleDateSelection(new Date(date));
          });
        }
      }
    }

    // Marcar día actual y selección
    if (DateUtils.isToday(date)) {
      dateElement.classList.add("today");
    }

    if (this.selectedDate && DateUtils.isSameDay(date, this.selectedDate)) {
      dateElement.classList.add("selected");
    }

    return dateElement;
  }

  updateNavigationButtons() {
    const prevBtn = document.querySelector(".prev-month");
    const nextBtn = document.querySelector(".next-month");

    if (this.activePeriod) {
      const minDate = new Date(this.activePeriod.fechaInicio);
      const maxDate = new Date(this.activePeriod.fechaFin);

      prevBtn.disabled = this.currentMonth <= minDate;
      nextBtn.disabled = DateUtils.addMonths(this.currentMonth, 1) >= maxDate;
    } else {
      // Si no hay periodo seleccionado, deshabilitar navegación
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    }
  }

  handleDateSelection(date) {
    this.selectedDate = date;

    // Actualizar UI del calendario
    document.querySelectorAll(".calendar-date").forEach((el) => {
      el.classList.remove("selected");
    });

    const dateElement = Array.from(
      document.querySelectorAll(".calendar-date")
    ).find(
      (el) =>
        !el.classList.contains("other-month") &&
        parseInt(el.textContent) === date.getDate()
    );

    if (dateElement) {
      dateElement.classList.add("selected");
    }

    // Actualizar información de fecha seleccionada
    this.selectedDateInfo.textContent = DateUtils.formatDate(date, "full");

    // Mostrar horarios disponibles
    this.renderTimeSlots(date);

    // Guardar selección
    this.saveData();
  }

  renderTimeSlots(date) {
    const horarios = ExamData.getHorariosDisponibles(date);
    this.timeSlotsContainer.innerHTML = "";

    horarios.forEach((horario) => {
      const slot = document.createElement("div");
      slot.className = "time-slot";
      if (this.selectedTimeSlot === horario.id) {
        slot.classList.add("selected");
      }

      slot.innerHTML = `
        <div class="time-slot-time">${horario.inicio} - ${horario.fin}</div>
        <div class="spots-left">${horario.disponibles} cupos disponibles</div>
      `;

      if (horario.disponibles === 0) {
        slot.classList.add("disabled");
      } else {
        slot.addEventListener("click", () =>
          this.handleTimeSlotSelection(horario)
        );
      }

      this.timeSlotsContainer.appendChild(slot);
    });
  }

  handleTimeSlotSelection(horario) {
    this.selectedTimeSlot = horario.id;

    // Actualizar UI de horarios
    document.querySelectorAll(".time-slot").forEach((slot) => {
      slot.classList.remove("selected");
    });

    const slotElement = Array.from(
      document.querySelectorAll(".time-slot")
    ).find((el) =>
      el.querySelector(".time-slot-time").textContent.includes(horario.inicio)
    );

    if (slotElement) {
      slotElement.classList.add("selected");
    }

    // Mostrar detalles del examen
    this.showExamDetails(horario);

    // Guardar selección
    this.saveData();
  }

  showExamDetails(horario) {
    const ubicacion = ExamData.getUbicacionAsignada(
      this.selectedDate,
      horario.id
    );
    this.examLocation.textContent = `${ubicacion.nombre}, ${ubicacion.aula}`;
    this.examDetails.classList.remove("hidden");
  }

  setupAccessibilityAdaptations() {
    const savedAccessibility = localStorage.getItem(
      "admissionForm_accessibility"
    );
    if (savedAccessibility) {
      try {
        const data = JSON.parse(savedAccessibility);
        if (data.responses && this.requiresSpecialAdaptations(data.responses)) {
          this.showAccessibilityAdaptations(data.responses);
        }
      } catch (error) {
        console.error("Error loading accessibility data:", error);
      }
    }
  }

  requiresSpecialAdaptations(responses) {
    return Object.values(responses).some((response) =>
      ["no_puedo", "mucha"].includes(response.value)
    );
  }

  showAccessibilityAdaptations(responses) {
    const adaptationsList = document.querySelector(".accommodations-list");
    if (!adaptationsList) return;

    adaptationsList.innerHTML = "";

    Object.entries(responses).forEach(([category, response]) => {
      if (["no_puedo", "mucha"].includes(response.value)) {
        const adaptations = this.getAdaptationsForCategory(
          category,
          response.value
        );
        adaptations.forEach((adaptation) => {
          const li = document.createElement("li");
          li.textContent = adaptation;
          adaptationsList.appendChild(li);
        });
      }
    });

    this.specialAccommodations.classList.remove("hidden");
  }

  getAdaptationsForCategory(category, severity) {
    const adaptations = {
      vision: {
        no_puedo: [
          "Asistente personal para guía y lectura",
          "Material en formato braille o audio",
          "Tiempo adicional del 50%",
        ],
        mucha: [
          "Material en formato ampliado",
          "Iluminación especial",
          "Tiempo adicional del 25%",
        ],
      },
      audicion: {
        no_puedo: [
          "Intérprete de lenguaje de señas",
          "Instrucciones por escrito",
          "Asiento preferencial",
        ],
        mucha: ["Instrucciones escritas detalladas", "Asiento preferencial"],
      },
      movilidad: {
        no_puedo: [
          "Ubicación en planta baja",
          "Mesa adaptada",
          "Asistente personal",
        ],
        mucha: ["Ubicación de fácil acceso", "Mobiliario adaptado"],
      },
    };

    return adaptations[category]?.[severity] || [];
  }

  setupNavigation() {
    const prevBtn = this.form.querySelector(".btn-prev");
    const nextBtn = this.form.querySelector(".btn-next");

    prevBtn?.addEventListener("click", () => {
      window.location.href = "accessibility.html";
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
    const errors = [];

    if (!this.selectedDate) {
      errors.push("Por favor, seleccione una fecha para la prueba");
    }

    if (!this.selectedTimeSlot) {
      errors.push("Por favor, seleccione un horario para la prueba");
    }

    const confirmAdaptations = document.querySelector(
      'input[name="confirmAdaptations"]'
    );
    if (
      confirmAdaptations &&
      !this.specialAccommodations.classList.contains("hidden")
    ) {
      if (!confirmAdaptations.checked) {
        errors.push("Por favor, confirme las adaptaciones especiales");
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
      <ul>${errors.map((error) => `<li>${error}</li>`).join("")}</ul>
    `;

    const navigation = this.form.querySelector(".navigation");
    this.form.insertBefore(errorContainer, navigation);

    setTimeout(() => {
      errorContainer.remove();
    }, 5000);
  }

  async saveAndNavigate() {
    try {
      // Intentar reservar el horario
      const success = ExamData.reservarHorario(
        this.selectedDate,
        this.selectedTimeSlot
      );
      if (!success) {
        throw new Error("El horario seleccionado ya no está disponible");
      }

      await this.saveData();
      window.location.href = "payment.html";
    } catch (error) {
      console.error("Error al guardar:", error);
      this.showErrors([error.message]);

      // Actualizar la vista de horarios disponibles para reflejar cambios
      this.renderTimeSlots(this.selectedDate);
    }
  }

  async saveData() {
    // Preparar los datos para guardar
    const formData = this.formHandler.getFormData();

    // Convertir la fecha seleccionada a formato ISO para almacenamiento
    formData.selectedDate = this.selectedDate
      ? DateUtils.formatDate(this.selectedDate, "iso")
      : null;

    // Guardar el horario seleccionado
    formData.selectedTimeSlot = this.selectedTimeSlot;

    // Almacenar en localStorage para persistencia
    localStorage.setItem("admissionForm_exam", JSON.stringify(formData));
  }

  loadSavedData() {
    // Intentar cargar datos guardados previamente
    const savedData = localStorage.getItem("admissionForm_exam");
    if (!savedData) return;

    try {
      const data = JSON.parse(savedData);

      // Si hay una fecha seleccionada previamente, restaurarla
      if (data.selectedDate) {
        // Convertir la fecha ISO guardada a objeto Date
        this.selectedDate = new Date(data.selectedDate);
        // Establecer el mes actual al de la fecha guardada
        this.currentMonth = new Date(data.selectedDate);
        // Restaurar el horario seleccionado
        this.selectedTimeSlot = data.selectedTimeSlot;

        // Actualizar la interfaz con los datos cargados
        this.renderCalendar();
        this.handleDateSelection(this.selectedDate);
      }
    } catch (error) {
      console.error("Error al cargar datos guardados:", error);
      // Si hay error al cargar, continuar con estado limpio
    }
  }
}

// Inicializar el controlador cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  new ExamFormController();
});
