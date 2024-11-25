/**
 * Controlador del formulario de prueba de admisión
 */
class ExamFormController {
  constructor() {
    this.form = document.getElementById("examForm");

    // Referencias a elementos del calendario
    this.currentMonth = new Date();
    this.selectedDate = null;
    this.selectedTimeSlot = null;

    // Referencias a elementos del DOM
    this.calendarDates = document.querySelector(".calendar-dates");
    this.currentMonthElement = document.querySelector(".current-month");
    this.timeSlotsContainer = document.getElementById("timeSlots");
    this.selectedDateInfo = document.getElementById("selectedDate");
    this.examDetails = document.querySelector(".exam-details");
    this.examLocation = document.getElementById("examLocation");
    this.specialAccommodations = document.getElementById(
      "specialAccommodations"
    );

    // Inicializar manejador de formulario
    this.formHandler = new FormHandler(this.form, {
      autoSave: true,
      validateOnChange: true,
      saveDelay: 1000,
    });

    this.init();
  }

  init() {
    this.setupPeriodSelector();
    this.setupCalendarNavigation();
    this.setupAccessibilityAdaptations();
    this.setupNavigation();
    this.loadSavedData();

    // Renderizar calendario inicial
    this.renderCalendar();
  }

  setupPeriodSelector() {
    const periodSelect = document.getElementById("examPeriod");
    const activePeriods = ExamData.periodos.filter((periodo) => {
      const endDate = new Date(periodo.fechaFin);
      return endDate >= new Date();
    });

    // Poblar selector de periodos
    activePeriods.forEach((periodo) => {
      const option = document.createElement("option");
      option.value = periodo.id;
      option.textContent = periodo.nombre;
      periodSelect.appendChild(option);
    });

    // Event listener para cambios de periodo
    periodSelect.addEventListener("change", () => {
      const periodo = ExamData.periodos.find(
        (p) => p.id === periodSelect.value
      );
      if (periodo) {
        this.currentMonth = new Date(periodo.fechaInicio);
        this.renderCalendar();
      }
    });
  }

  setupCalendarNavigation() {
    const prevBtn = document.querySelector(".prev-month");
    const nextBtn = document.querySelector(".next-month");

    prevBtn.addEventListener("click", () => {
      this.currentMonth = DateUtils.addMonths(this.currentMonth, -1);
      this.renderCalendar();
    });

    nextBtn.addEventListener("click", () => {
      this.currentMonth = DateUtils.addMonths(this.currentMonth, 1);
      this.renderCalendar();
    });
  }

  renderCalendar() {
    // Actualizar título del mes
    this.currentMonthElement.textContent = `${
      DateUtils.MONTHS[this.currentMonth.getMonth()]
    } ${this.currentMonth.getFullYear()}`;

    // Obtener días del mes
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = DateUtils.getFirstDayOfMonth(year, month);
    const daysInMonth = DateUtils.getDaysInMonth(year, month);
    const today = new Date();

    // Limpiar calendario
    this.calendarDates.innerHTML = "";

    // Agregar días del mes anterior
    for (let i = 0; i < firstDay; i++) {
      const prevMonthDays = DateUtils.getDaysInMonth(year, month - 1);
      this.createDateElement(
        prevMonthDays - firstDay + i + 1,
        new Date(year, month - 1, prevMonthDays - firstDay + i + 1),
        "other-month"
      );
    }

    // Agregar días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      let classes = [];

      if (DateUtils.isToday(date)) classes.push("today");
      if (ExamData.isFechaDisponible(date)) {
        classes.push("available");
        const horarios = ExamData.getHorariosDisponibles(date);
        if (horarios.length > 0) {
          classes.push("has-spots");
          if (horarios.some((h) => h.disponibles < 5)) {
            classes.push("few-spots");
          }
        }
      }

      this.createDateElement(i, date, classes.join(" "));
    }

    // Agregar días del mes siguiente
    const totalDays = firstDay + daysInMonth;
    const remainingDays = 42 - totalDays; // 6 semanas * 7 días
    for (let i = 1; i <= remainingDays; i++) {
      this.createDateElement(i, new Date(year, month + 1, i), "other-month");
    }

    // Actualizar estado de botones de navegación
    this.updateNavigationButtons();
  }

  createDateElement(day, date, classes = "") {
    const div = document.createElement("div");
    div.className = `calendar-date ${classes}`;
    div.textContent = day;

    if (ExamData.isFechaDisponible(date)) {
      const horarios = ExamData.getHorariosDisponibles(date);
      if (horarios.length > 0) {
        const spots = horarios.reduce((total, h) => total + h.disponibles, 0);
        div.setAttribute("data-tooltip", `${spots} cupos disponibles`);

        div.addEventListener("click", () => this.handleDateSelection(date));
      }
    }

    if (DateUtils.isSameDay(date, this.selectedDate)) {
      div.classList.add("selected");
    }

    this.calendarDates.appendChild(div);
  }

  updateNavigationButtons() {
    const prevBtn = document.querySelector(".prev-month");
    const nextBtn = document.querySelector(".next-month");

    // Obtener el periodo seleccionado
    const periodSelect = document.getElementById("examPeriod");
    const periodo = ExamData.periodos.find((p) => p.id === periodSelect.value);

    if (periodo) {
      const minDate = new Date(periodo.fechaInicio);
      const maxDate = new Date(periodo.fechaFin);

      prevBtn.disabled = this.currentMonth <= minDate;
      nextBtn.disabled = DateUtils.addMonths(this.currentMonth, 1) >= maxDate;
    } else {
      // Si no hay periodo seleccionado, solo permitir navegación limitada
      const today = new Date();
      prevBtn.disabled =
        this.currentMonth.getMonth() === today.getMonth() &&
        this.currentMonth.getFullYear() === today.getFullYear();
      nextBtn.disabled = DateUtils.addMonths(this.currentMonth, 12) <= today;
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
    // Cargar adaptaciones guardadas
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

    // Generar lista de adaptaciones basada en las respuestas
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

    // Verificar confirmación de adaptaciones si son necesarias
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

      // Actualizar la vista de horarios disponibles
      this.renderTimeSlots(this.selectedDate);
    }
  }

  async saveData() {
    const formData = this.formHandler.getFormData();
    formData.selectedDate = this.selectedDate
      ? DateUtils.formatDate(this.selectedDate, "iso")
      : null;
    formData.selectedTimeSlot = this.selectedTimeSlot;

    localStorage.setItem("admissionForm_exam", JSON.stringify(formData));
  }

  loadSavedData() {
    const savedData = localStorage.getItem("admissionForm_exam");
    if (!savedData) return;

    try {
      const data = JSON.parse(savedData);

      if (data.selectedDate) {
        this.selectedDate = new Date(data.selectedDate);
        this.currentMonth = new Date(data.selectedDate);
        this.selectedTimeSlot = data.selectedTimeSlot;

        this.renderCalendar();
        this.handleDateSelection(this.selectedDate);
      }
    } catch (error) {
      console.error("Error al cargar datos guardados:", error);
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new ExamFormController();
});
