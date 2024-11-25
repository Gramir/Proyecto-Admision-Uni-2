/**
 * Utility class for handling tooltips throughout the application
 */
class TooltipManager {
  constructor() {
    this.tooltips = new Map();
    this.activeTooltip = null;
    this.tooltipElement = null;

    // Bind methods
    this.init = this.init.bind(this);
    this.createTooltip = this.createTooltip.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
    this.positionTooltip = this.positionTooltip.bind(this);

    // Initialize
    this.init();
  }

  init() {
    // Create tooltip container
    this.tooltipElement = document.createElement("div");
    this.tooltipElement.className = "tooltip";
    this.tooltipElement.style.display = "none";
    document.body.appendChild(this.tooltipElement);

    // Add global listeners
    document.addEventListener("mouseover", (e) => {
      const target = e.target.closest("[data-tooltip]");
      if (target) {
        this.showTooltip(target);
      }
    });

    document.addEventListener("mouseout", (e) => {
      const target = e.target.closest("[data-tooltip]");
      if (target) {
        this.hideTooltip(target);
      }
    });

    // Handle scroll and resize
    window.addEventListener("scroll", () => {
      if (this.activeTooltip) {
        this.positionTooltip(this.activeTooltip);
      }
    });

    window.addEventListener("resize", () => {
      if (this.activeTooltip) {
        this.positionTooltip(this.activeTooltip);
      }
    });
  }

  createTooltip(element) {
    const text = element.getAttribute("data-tooltip");
    if (!text) return null;

    return {
      text,
      element,
    };
  }

  showTooltip(element) {
    // Get or create tooltip data
    let tooltip = this.tooltips.get(element);
    if (!tooltip) {
      tooltip = this.createTooltip(element);
      if (tooltip) {
        this.tooltips.set(element, tooltip);
      }
    }

    if (!tooltip) return;

    // Update tooltip content and show it
    this.tooltipElement.textContent = tooltip.text;
    this.tooltipElement.style.display = "block";

    // Position the tooltip
    this.positionTooltip(element);

    // Update active tooltip
    this.activeTooltip = element;
  }

  hideTooltip(element) {
    if (this.activeTooltip === element) {
      this.tooltipElement.style.display = "none";
      this.activeTooltip = null;
    }
  }

  positionTooltip(element) {
    const rect = element.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();

    // Position above the element by default
    let top = rect.top - tooltipRect.height - 10;
    let left = rect.left + (rect.width - tooltipRect.width) / 2;

    // Check if tooltip would go off-screen
    if (top < 0) {
      // Position below instead
      top = rect.bottom + 10;
    }

    if (left < 0) {
      left = 0;
    } else if (left + tooltipRect.width > window.innerWidth) {
      left = window.innerWidth - tooltipRect.width;
    }

    // Apply positions
    this.tooltipElement.style.top = `${top + window.scrollY}px`;
    this.tooltipElement.style.left = `${left + window.scrollX}px`;
  }
}

// Initialize tooltip manager when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.tooltipManager = new TooltipManager();
});
