/**
 * Utilidades para manejar adaptaciones de accesibilidad
 */
class AccessibilityUtils {
  constructor() {
    this.preferences = {
      fontSize: "normal",
      contrast: "normal",
      reducedMotion: false,
      screenReader: false,
    };

    this.init();
  }

  init() {
    this.loadPreferences();
    this.applyPreferences();
    this.setupMediaQueryListeners();
  }

  /**
   * Carga las preferencias guardadas
   */
  loadPreferences() {
    const saved = localStorage.getItem("accessibility_preferences");
    if (saved) {
      try {
        this.preferences = { ...this.preferences, ...JSON.parse(saved) };
      } catch (error) {
        console.error("Error loading accessibility preferences:", error);
      }
    }

    // Detectar preferencias del sistema
    this.detectSystemPreferences();
  }

  /**
   * Detecta las preferencias del sistema operativo
   */
  detectSystemPreferences() {
    // Detectar preferencia de movimiento reducido
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.preferences.reducedMotion = true;
    }

    // Detectar preferencia de alto contraste
    if (window.matchMedia("(prefers-contrast: high)").matches) {
      this.preferences.contrast = "high";
    }
  }

  /**
   * Configura listeners para cambios en las preferencias del sistema
   */
  setupMediaQueryListeners() {
    // Listener para cambios en preferencia de movimiento
    window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .addEventListener("change", (e) => {
        this.preferences.reducedMotion = e.matches;
        this.applyPreferences();
        this.savePreferences();
      });

    // Listener para cambios en preferencia de contraste
    window
      .matchMedia("(prefers-contrast: high)")
      .addEventListener("change", (e) => {
        this.preferences.contrast = e.matches ? "high" : "normal";
        this.applyPreferences();
        this.savePreferences();
      });
  }

  /**
   * Aplica las preferencias de accesibilidad
   */
  applyPreferences() {
    const html = document.documentElement;

    // Aplicar tamaño de fuente
    html.style.fontSize = this.getFontSize();

    // Aplicar contraste
    html.setAttribute("data-contrast", this.preferences.contrast);

    // Aplicar movimiento reducido
    if (this.preferences.reducedMotion) {
      html.style.setProperty("--transition-speed", "0s");
      html.classList.add("reduced-motion");
    } else {
      html.style.removeProperty("--transition-speed");
      html.classList.remove("reduced-motion");
    }

    // Configurar para lectores de pantalla
    if (this.preferences.screenReader) {
      this.enhanceScreenReaderSupport();
    }
  }

  /**
   * Obtiene el tamaño de fuente basado en las preferencias
   */
  getFontSize() {
    const sizes = {
      small: "14px",
      normal: "16px",
      large: "18px",
      xlarge: "20px",
    };
    return sizes[this.preferences.fontSize] || sizes.normal;
  }

  /**
   * Mejora el soporte para lectores de pantalla
   */
  enhanceScreenReaderSupport() {
    // Asegurar que todos los elementos interactivos tienen roles ARIA apropiados
    document
      .querySelectorAll("button, a, input, select, textarea")
      .forEach((element) => {
        if (!element.hasAttribute("role")) {
          const role = this.getAppropriateRole(element);
          if (role) element.setAttribute("role", role);
        }
      });

    // Asegurar que las imágenes tienen textos alternativos
    document.querySelectorAll("img:not([alt])").forEach((img) => {
      img.setAttribute("alt", "");
      console.warn("Image without alt text:", img);
    });
  }

  /**
   * Obtiene el rol ARIA apropiado para un elemento
   */
  getAppropriateRole(element) {
    switch (element.tagName.toLowerCase()) {
      case "button":
        return "button";
      case "a":
        return element.hasAttribute("href") ? "link" : "button";
      case "input":
        switch (element.type) {
          case "checkbox":
            return "checkbox";
          case "radio":
            return "radio";
          case "text":
          case "email":
          case "tel":
          case "number":
            return "textbox";
          default:
            return null;
        }
      case "select":
        return "combobox";
      case "textarea":
        return "textbox";
      default:
        return null;
    }
  }

  /**
   * Guarda las preferencias de accesibilidad
   */
  savePreferences() {
    localStorage.setItem(
      "accessibility_preferences",
      JSON.stringify(this.preferences)
    );
  }

  /**
   * Actualiza una preferencia específica
   */
  updatePreference(key, value) {
    if (key in this.preferences) {
      this.preferences[key] = value;
      this.applyPreferences();
      this.savePreferences();
    }
  }

  /**
   * Restablece las preferencias a los valores predeterminados
   */
  resetPreferences() {
    this.preferences = {
      fontSize: "normal",
      contrast: "normal",
      reducedMotion: false,
      screenReader: false,
    };
    this.applyPreferences();
    this.savePreferences();
  }

  /**
   * Verifica si el formulario es accesible
   */
  checkFormAccessibility(form) {
    const issues = [];

    // Verificar labels
    form.querySelectorAll("input, select, textarea").forEach((field) => {
      if (!field.id || !form.querySelector(`label[for="${field.id}"]`)) {
        issues.push(
          `Campo sin label: ${field.name || field.id || "desconocido"}`
        );
      }
    });

    // Verificar contraste de colores
    form.querySelectorAll("*").forEach((element) => {
      const style = window.getComputedStyle(element);
      const backgroundColor = style.backgroundColor;
      const color = style.color;

      if (this.hasInsufficientContrast(backgroundColor, color)) {
        issues.push(
          `Contraste insuficiente en elemento: ${element.tagName.toLowerCase()}`
        );
      }
    });

    return {
      isAccessible: issues.length === 0,
      issues,
    };
  }

  /**
   * Verifica si hay suficiente contraste entre dos colores
   */
  hasInsufficientContrast(bg, fg) {
    // Implementación simplificada - en producción usar una biblioteca de contraste
    return false;
  }
}

// Exportar para uso global
window.AccessibilityUtils = AccessibilityUtils;
