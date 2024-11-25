/**
 * Utilidades para manejo de fechas
 */
class DateUtils {
  static MONTHS = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  static DAYS = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  /**
   * Obtiene los días de un mes
   */
  static getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Obtiene el primer día de la semana del mes
   */
  static getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }

  /**
   * Formatea una fecha como string
   */
  static formatDate(date, format = "short") {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    switch (format) {
      case "full":
        return `${this.DAYS[date.getDay()]}, ${day} de ${
          this.MONTHS[month]
        } de ${year}`;
      case "medium":
        return `${day} de ${this.MONTHS[month]} de ${year}`;
      case "short":
        return `${day}/${month + 1}/${year}`;
      case "iso":
        return date.toISOString().split("T")[0];
      default:
        return date.toLocaleDateString();
    }
  }

  /**
   * Verifica si una fecha es hoy
   */
  static isToday(date) {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  /**
   * Compara si dos fechas son el mismo día
   */
  static isSameDay(date1, date2) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  /**
   * Compara si una fecha es posterior a otra
   */
  static isAfter(date1, date2) {
    return date1.getTime() > date2.getTime();
  }

  /**
   * Compara si una fecha es anterior a otra
   */
  static isBefore(date1, date2) {
    return date1.getTime() < date2.getTime();
  }

  /**
   * Suma días a una fecha
   */
  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Suma meses a una fecha
   */
  static addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Obtiene el rango de fechas entre dos fechas
   */
  static getDateRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  /**
   * Formatea una hora en formato de 12 horas
   */
  static formatTime(hours, minutes) {
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    minutes = minutes.toString().padStart(2, "0");
    return `${hours}:${minutes} ${period}`;
  }

  /**
   * Formatea un rango de horas
   */
  static formatTimeRange(startHours, startMinutes, endHours, endMinutes) {
    return `${this.formatTime(startHours, startMinutes)} - ${this.formatTime(
      endHours,
      endMinutes
    )}`;
  }

  /**
   * Verifica si una fecha está dentro de un rango
   */
  static isWithinRange(date, startDate, endDate) {
    return date >= startDate && date <= endDate;
  }

  /**
   * Obtiene el número de días entre dos fechas
   */
  static getDaysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
  }

  /**
   * Verifica si una fecha es un día laboral
   */
  static isWorkday(date) {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  }

  /**
   * Obtiene el próximo día laboral
   */
  static getNextWorkday(date) {
    let nextDay = this.addDays(date, 1);
    while (!this.isWorkday(nextDay)) {
      nextDay = this.addDays(nextDay, 1);
    }
    return nextDay;
  }

  /**
   * Obtiene el día laboral más cercano
   */
  static getNearestWorkday(date) {
    if (this.isWorkday(date)) return date;

    let prevDay = this.addDays(date, -1);
    let nextDay = this.addDays(date, 1);

    while (!this.isWorkday(prevDay) && !this.isWorkday(nextDay)) {
      prevDay = this.addDays(prevDay, -1);
      nextDay = this.addDays(nextDay, 1);
    }

    if (this.isWorkday(prevDay)) return prevDay;
    return nextDay;
  }
}

// Exportar para uso global
window.DateUtils = DateUtils;
