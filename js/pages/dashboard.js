document.addEventListener("DOMContentLoaded", function () {
  // Datos de estado del proceso
  const stateItems = [
    {
      id: "personal",
      icon: "✓",
      title: "Información Personal",
      status: "completed",
      statusText: "Completo",
    },
    {
      id: "documents",
      icon: "!",
      title: "Documentos",
      status: "warning",
      statusText: "4 de 5 documentos",
    },
    {
      id: "academic",
      icon: "✓",
      title: "Información Académica",
      status: "completed",
      statusText: "Completo",
    },
    {
      id: "accessibility",
      icon: "✓",
      title: "Accesibilidad",
      status: "completed",
      statusText: "Completo",
    },
    {
      id: "exam",
      icon: "📅",
      title: "Prueba de Admisión",
      status: "info",
      statusText: "Programado",
    },
    {
      id: "payment",
      icon: "✓",
      title: "Pago",
      status: "completed",
      statusText: "Completado",
    },
  ];

  // Mensajes del sistema
  const messages = [
    {
      from: "Admisiones",
      time: "Hace 2 horas",
      content: "Tu prueba de admisión está programada para el 15 de marzo.",
    },
    {
      from: "Sistema",
      time: "Hace 1 día",
      content: "Documento de identidad verificado correctamente.",
    },
  ];

  // Renderizar items de estado
  function renderStateItems() {
    const editList = document.querySelector(".edit-list");
    if (!editList) return;

    editList.innerHTML = stateItems
      .map(
        (item) => `
            <div class="section-item ${item.status}">
                <div class="item-left">
                    <span class="status-icon">${item.icon}</span>
                    <span>${item.title}</span>
                </div>
                <div class="item-right">
                    <span>${item.statusText}</span>
                    <span class="toggle-icon">▼</span>
                </div>
            </div>
        `
      )
      .join("");

    // Añadir event listeners para los toggles
    document.querySelectorAll(".section-item").forEach((item) => {
      item.addEventListener("click", toggleSection);
    });
  }

  // Renderizar mensajes
  function renderMessages() {
    const messagesList = document.querySelector(".messages-list");
    if (!messagesList) return;

    messagesList.innerHTML = messages
      .map(
        (message) => `
            <div class="message">
                <div class="message-header">
                    <span>${message.from}</span>
                    <span>${message.time}</span>
                </div>
                <div class="message-content">
                    ${message.content}
                </div>
            </div>
        `
      )
      .join("");
  }

  // Toggle para las secciones editables
  function toggleSection() {
    const arrow = this.querySelector(".toggle-icon");
    arrow.style.transform =
      arrow.style.transform === "rotate(180deg)"
        ? "rotate(0deg)"
        : "rotate(180deg)";

    // Aquí se puede agregar lógica adicional para mostrar/ocultar contenido expandible
  }

  // Actualizar barra de progreso
  function updateProgressBar() {
    const progressFill = document.querySelector(".progress-fill");
    if (!progressFill) return;

    const completedItems = stateItems.filter(
      (item) => item.status === "completed"
    ).length;
    const totalItems = stateItems.length;
    const progressPercentage = (completedItems / totalItems) * 100;

    progressFill.style.width = `${progressPercentage}%`;

    const progressText = document.querySelector(".progress-text");
    if (progressText) {
      progressText.textContent = `${Math.round(
        progressPercentage
      )}% Completado`;
    }
  }

  // Función para actualizar el estado de los documentos
  function updateDocumentsStatus() {
    const documentsStatus = stateItems.find((item) => item.id === "documents");
    const statusBox = document.querySelector(
      ".status-box:first-child .status-value"
    );

    if (statusBox && documentsStatus) {
      statusBox.textContent = documentsStatus.statusText;
    }
  }

  // Event listener para los enlaces de estado
  function initializeStatusLinks() {
    document.querySelectorAll(".status-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const action = e.target.textContent.toLowerCase();

        switch (action) {
          case "ver detalles":
            // Navegar a la sección de documentos
            window.location.href = "../pages/admission/documents.html";
            break;
          case "ver recibo":
            // Mostrar recibo de pago
            showPaymentReceipt();
            break;
        }
      });
    });
  }

  // Mostrar recibo de pago (modal o nueva ventana)
  function showPaymentReceipt() {
    // Implementación del modal o redirección a la página de recibo
    console.log("Mostrando recibo de pago...");
  }

  // Función para manejar notificaciones nuevas
  function handleNewNotification(notification) {
    messages.unshift(notification);
    renderMessages();

    // Mostrar notificación en el navegador si está soportado
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Nueva notificación", {
        body: notification.content,
        icon: "/assets/icons/notification.png",
      });
    }
  }

  // Inicializar tooltips
  function initializeTooltips() {
    const tooltips = document.querySelectorAll("[data-tooltip]");
    tooltips.forEach((tooltip) => {
      tooltip.addEventListener("mouseenter", showTooltip);
      tooltip.addEventListener("mouseleave", hideTooltip);
    });
  }

  // Mostrar tooltip
  function showTooltip(e) {
    const tooltip = e.target;
    const tooltipText = tooltip.getAttribute("data-tooltip");

    // La implementación del tooltip está en el CSS usando pseudo-elementos
  }

  // Ocultar tooltip
  function hideTooltip(e) {
    // La implementación del tooltip está en el CSS usando pseudo-elementos
  }

  // Inicializar la página
  function initializeDashboard() {
    renderStateItems();
    renderMessages();
    updateProgressBar();
    updateDocumentsStatus();
    initializeStatusLinks();
    initializeTooltips();

    // Solicitar permiso para notificaciones
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }

  // Iniciar la aplicación
  initializeDashboard();
});
