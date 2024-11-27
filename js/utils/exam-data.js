/**
 * Datos y utilidades para manejo de pruebas de admisión
 */
const ExamData = {
  // Configuración de periodos
  periodos: [
    {
      id: "2024-1",
      nombre: "Enero-Abril 2024",
      fechaInicio: "2024-01-15",
      fechaFin: "2024-04-15",
    },
    {
      id: "2024-2",
      nombre: "Mayo-Agosto 2024",
      fechaInicio: "2024-05-15",
      fechaFin: "2024-08-15",
    },
    {
      id: "2024-3",
      nombre: "Septiembre-Diciembre 2024",
      fechaInicio: "2024-09-15",
      fechaFin: "2024-12-15",
    },
  ],

  // Configuración de horarios disponibles
  horarios: [
    {
      id: 1,
      inicio: "09:00",
      fin: "12:00",
      turno: "mañana",
      capacidad: 30,
    },
    {
      id: 2,
      inicio: "14:00",
      fin: "17:00",
      turno: "tarde",
      capacidad: 30,
    },
    {
      id: 3,
      inicio: "18:00",
      fin: "21:00",
      turno: "noche",
      capacidad: 25,
    },
  ],

  // Ubicaciones de prueba
  ubicaciones: [
    {
      id: 1,
      nombre: "Campus Principal",
      aula: "Aula 101",
      direccion: "Av. Principal #123",
      capacidadPorHorario: 30,
    },
    {
      id: 2,
      nombre: "Campus Este",
      aula: "Aula Magna",
      direccion: "Carretera Este Km 5",
      capacidadPorHorario: 25,
    },
  ],

  // Fechas bloqueadas (feriados, mantenimiento, etc.)
  fechasBloqueadas: [
    "2024-01-01", // Año Nuevo
    "2024-01-21", // Día de la Altagracia
    "2024-01-26", // Día de Duarte
    "2024-02-27", // Independencia Nacional
    "2024-03-29", // Viernes Santo
    "2024-05-01", // Día del Trabajo
    "2024-06-20", // Corpus Christi
    "2024-08-16", // Restauración
    "2024-09-24", // Día de las Mercedes
    "2024-11-06", // Día de la Constitución
    "2024-12-25", // Navidad
  ],

  // Fechas con horarios especiales
  horariosEspeciales: {
    "2024-03-28": [{ id: 1, inicio: "09:00", fin: "12:00" }], // Jueves Santo
    "2024-12-24": [{ id: 1, inicio: "09:00", fin: "12:00" }], // Nochebuena
  },

  // Estado de ocupación (simulado)
  ocupacion: {},

  /**
   * Inicializa los datos de ocupación
   */
  initOcupacion() {
    this.periodos.forEach((periodo) => {
      const fechas = DateUtils.getDateRange(
        new Date(periodo.fechaInicio),
        new Date(periodo.fechaFin)
      );

      fechas.forEach((fecha) => {
        const fechaStr = DateUtils.formatDate(fecha, "iso");

        this.ocupacion[fechaStr] = {};

        this.horarios.forEach((horario) => {
          const disponibles = Math.floor(Math.random() * horario.capacidad);
          this.ocupacion[fechaStr][horario.id] = {
            disponibles: disponibles,
            reservados: horario.capacidad - disponibles,
          };
        });
      });
    });
  },

  /**
   * Verifica si una fecha está disponible para pruebas
   */
  isFechaDisponible(fecha) {
    const fechaStr =
      typeof fecha === "string" ? fecha : DateUtils.formatDate(fecha, "iso");

    // Verificar si es un día bloqueado
    if (this.fechasBloqueadas.includes(fechaStr)) return false;

    // Verificar si es día laboral
    if (!DateUtils.isWorkday(new Date(fechaStr))) return false;

    // Verificar si está dentro de algún periodo
    return this.periodos.some((periodo) =>
      DateUtils.isWithinRange(
        new Date(fechaStr),
        new Date(periodo.fechaInicio),
        new Date(periodo.fechaFin)
      )
    );
  },

  /**
   * Obtiene los horarios disponibles para una fecha
   */
  getHorariosDisponibles(fecha) {
    const fechaStr =
      typeof fecha === "string" ? fecha : DateUtils.formatDate(fecha, "iso");

    // Verificar si hay horarios especiales
    if (this.horariosEspeciales[fechaStr]) {
      return this.horariosEspeciales[fechaStr];
    }

    // Verificar ocupación de horarios regulares
    return this.horarios
      .map((horario) => {
        const ocupacion = this.ocupacion[fechaStr]?.[horario.id] || {
          disponibles: horario.capacidad,
          reservados: 0,
        };

        return {
          ...horario,
          disponibles: ocupacion.disponibles,
          reservados: ocupacion.reservados,
        };
      })
      .filter((horario) => horario.disponibles > 0);
  },

  /**
   * Reserva un horario específico
   */
  reservarHorario(fecha, horarioId) {
    const fechaStr =
      typeof fecha === "string" ? fecha : DateUtils.formatDate(fecha, "iso");

    if (!this.ocupacion[fechaStr]) {
      this.ocupacion[fechaStr] = {};
    }

    if (!this.ocupacion[fechaStr][horarioId]) {
      const horario = this.horarios.find((h) => h.id === horarioId);
      if (!horario) return false;

      this.ocupacion[fechaStr][horarioId] = {
        disponibles: horario.capacidad,
        reservados: 0,
      };
    }

    const ocupacion = this.ocupacion[fechaStr][horarioId];
    if (ocupacion.disponibles > 0) {
      ocupacion.disponibles--;
      ocupacion.reservados++;
      return true;
    }

    return false;
  },

  /**
   * Libera un horario previamente reservado
   */
  liberarHorario(fecha, horarioId) {
    const fechaStr =
      typeof fecha === "string" ? fecha : DateUtils.formatDate(fecha, "iso");

    if (this.ocupacion[fechaStr]?.[horarioId]) {
      const ocupacion = this.ocupacion[fechaStr][horarioId];
      const horario = this.horarios.find((h) => h.id === horarioId);

      if (ocupacion.reservados > 0 && horario) {
        ocupacion.disponibles++;
        ocupacion.reservados--;
        return true;
      }
    }

    return false;
  },

  /**
   * Obtiene la ubicación asignada para una fecha y horario
   */
  getUbicacionAsignada(fecha, horarioId) {
    // Por ahora asignamos siempre la ubicación principal
    return this.ubicaciones[0];
  },

  /**
   * Genera un resumen de disponibilidad para un periodo
   */
  getResumenDisponibilidad(periodoId) {
    const periodo = this.periodos.find((p) => p.id === periodoId);
    if (!periodo) return null;

    const fechas = DateUtils.getDateRange(
      new Date(periodo.fechaInicio),
      new Date(periodo.fechaFin)
    );

    const resumen = {
      totalDias: fechas.length,
      diasDisponibles: 0,
      cuposDisponibles: 0,
      horariosPopulares: {},
    };

    fechas.forEach((fecha) => {
      const fechaStr = DateUtils.formatDate(fecha, "iso");
      if (this.isFechaDisponible(fechaStr)) {
        resumen.diasDisponibles++;

        const horarios = this.getHorariosDisponibles(fechaStr);
        horarios.forEach((horario) => {
          resumen.cuposDisponibles += horario.disponibles;

          if (!resumen.horariosPopulares[horario.id]) {
            resumen.horariosPopulares[horario.id] = 0;
          }
          resumen.horariosPopulares[horario.id] += horario.reservados;
        });
      }
    });

    return resumen;
  },
};

// Inicializar datos
ExamData.initOcupacion();

// Exportar para uso global
window.ExamData = ExamData;
