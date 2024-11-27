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
    const editList = document.querySelector(".edit-sections");
    if (!editList) return;

    editList.innerHTML = stateItems
      .map(
        (item) => `
          <div class="section-item" data-section="${item.id}">
              <div class="section-header">
                  <div class="section-title">
                      <span class="status-icon ${item.status}">${
          item.icon
        }</span>
                      <span>${item.title}</span>
                  </div>
                  <div class="section-controls">
                      <span class="status-text">${item.statusText}</span>
                      <button class="btn-edit" aria-label="Editar ${
                        item.title
                      }">
                          <span class="edit-icon">✎</span>
                      </button>
                      <button class="btn-toggle" aria-label="Mostrar/ocultar detalles">
                          <span class="toggle-icon">▾</span>
                      </button>
                  </div>
              </div>
              <div class="section-content">
                  ${getSectionContent(item.id)}
              </div>
          </div>
      `
      )
      .join("");

    setupEventListeners();
  }

  // Obtener contenido específico para cada sección
  function getSectionContent(sectionId) {
    const contents = {
      personal: `
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Tipo Admisión:</span>
                    <span class="info-value">Nuevo Ingreso</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nombres:</span>
                    <span class="info-value">Juan Carlos</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Apellidos:</span>
                    <span class="info-value">Pérez Gómez</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sexo:</span>
                    <span class="info-value">Masculino</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha de Nacimiento:</span>
                    <span class="info-value">01/01/1990</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Estado Civil:</span>
                    <span class="info-value">Soltero</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Cédula:</span>
                    <span class="info-value">001-0000000-0</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Contactos de Emergencia:</span>
                    <span class="info-value">María Gómez (Madre) - 829-555-5555</span>
                </div>
            </div>`,
      documents: `
            <div class="documents-list">
                <div class="document-item verified">
                    <span class="doc-icon">✓</span>
                    <span class="doc-name">Documento de Identidad</span>
                    <span class="doc-status">Verificado</span>
                    <button class="btn-view" aria-label="Ver documento">👁</button>
                </div>
                <div class="document-item verified">
                    <span class="doc-icon">✓</span>
                    <span class="doc-name">Record de Notas</span>
                    <span class="doc-status">Verificado</span>
                    <button class="btn-view" aria-label="Ver documento">👁</button>
                </div>
                <div class="document-item verified">
                    <span class="doc-icon">✓</span>
                    <span class="doc-name">Foto 2x2</span>
                    <span class="doc-status">Verificado</span>
                    <button class="btn-view" aria-label="Ver documento">👁</button>
                </div>
                <div class="document-item verified">
                    <span class="doc-icon">✓</span>
                    <span class="doc-name">Acta de Nacimiento</span>
                    <span class="doc-status">Verificado</span>
                    <button class="btn-view" aria-label="Ver documento">👁</button>
                </div>
                <div class="document-item pending">
                    <span class="doc-icon">!</span>
                    <span class="doc-name">Certificado Médico</span>
                    <span class="doc-status">Pendiente</span>
                    <button class="btn-upload" aria-label="Subir documento">📤</button>
                </div>
            </div>`,
      academic: `
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Periodo de Ingreso:</span>
                    <span class="info-value">Mayo-Agosto 2024</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tipo de Carrera:</span>
                    <span class="info-value">Grado</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Carrera:</span>
                    <span class="info-value">Ingeniería de Software</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Recinto:</span>
                    <span class="info-value">Campus Principal</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Horario:</span>
                    <span class="info-value">Vespertino</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Centro Educación Básica:</span>
                    <span class="info-value">Liceo Nacional A</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Centro Educación Superior:</span>
                    <span class="info-value">Universidad Nacional</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Financiamiento:</span>
                    <span class="info-value">Recursos Propios</span>
                </div>
            </div>`,
      accessibility: `
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Condición Visual:</span>
                    <span class="info-value">No, ninguna dificultad</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Condición Auditiva:</span>
                    <span class="info-value">No, ninguna dificultad</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Condición de Movilidad:</span>
                    <span class="info-value">No, ninguna dificultad</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Condición de Concentración:</span>
                    <span class="info-value">No, ninguna dificultad</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Condición de Comunicación:</span>
                    <span class="info-value">No, ninguna dificultad</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Adaptaciones Requeridas:</span>
                    <span class="info-value">Ninguna</span>
                </div>
            </div>`,
      exam: `
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Fecha:</span>
                    <span class="info-value">15 de marzo de 2024</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Horario:</span>
                    <span class="info-value">9:00 AM - 12:00 PM</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Ubicación:</span>
                    <span class="info-value">Campus Principal, Aula 101</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Estado:</span>
                    <span class="info-value">Confirmado</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Adaptaciones Especiales:</span>
                    <span class="info-value">No requeridas</span>
                </div>
            </div>`,
      payment: `
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Método de Pago:</span>
                    <span class="info-value">Tarjeta de Crédito</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha de Pago:</span>
                    <span class="info-value">01/03/2024</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Monto Total:</span>
                    <span class="info-value">RD$ 4,100.00</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Número de Confirmación:</span>
                    <span class="info-value">TX2024030100123</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Estado:</span>
                    <span class="info-value">Completado</span>
                </div>
            </div>`,
    };

    return contents[sectionId] || "";
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

  // Configurar event listeners
  function setupEventListeners() {
    const sections = document.querySelectorAll(".section-item");

    sections.forEach((section) => {
      const header = section.querySelector(".section-header");
      const content = section.querySelector(".section-content");
      const toggleIcon = section.querySelector(".toggle-icon");

      // Asegurar que el contenido inicie oculto
      if (content) {
        content.style.display = "none";
      }

      // Manejar clic en el header
      header.addEventListener("click", function (e) {
        // No activar si se hace clic en los controles
        if (!e.target.closest(".section-controls")) {
          toggleSection(section);
        }
      });

      // Manejar clic en el botón de toggle específicamente
      const toggleBtn = section.querySelector(".btn-toggle");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          toggleSection(section);
        });
      }

      // Manejar clic en el botón de edición
      const editBtn = section.querySelector(".btn-edit");
      if (editBtn) {
        editBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          handleEdit(section.dataset.section);
        });
      }
    });
  }

  // Toggle de sección
  function toggleSection(section) {
    if (!section) return;

    const content = section.querySelector(".section-content");
    const toggleIcon = section.querySelector(".toggle-icon");
    const isExpanded = section.classList.contains("expanded");

    // Si la sección está colapsada, primero ocultar todas las demás
    if (!isExpanded) {
      document.querySelectorAll(".section-item").forEach((otherSection) => {
        if (
          otherSection !== section &&
          otherSection.classList.contains("expanded")
        ) {
          const otherContent = otherSection.querySelector(".section-content");
          const otherIcon = otherSection.querySelector(".toggle-icon");

          otherSection.classList.remove("expanded");
          if (otherContent) {
            otherContent.style.display = "none";
          }
          if (otherIcon) {
            otherIcon.style.transform = "rotate(0deg)";
          }
        }
      });
    }

    // Toggle estado actual
    section.classList.toggle("expanded");

    if (content) {
      if (!isExpanded) {
        content.style.display = "block";
        content.style.animation = "slideDown 0.3s ease-out forwards";
      } else {
        content.style.animation = "slideUp 0.3s ease-out forwards";
        setTimeout(() => {
          content.style.display = "none";
        }, 300);
      }
    }

    if (toggleIcon) {
      toggleIcon.style.transform = isExpanded
        ? "rotate(0deg)"
        : "rotate(180deg)";
    }
  }

  // Manejar edición
  function handleEdit(sectionId) {
    const modal = document.getElementById("editModal");
    if (!modal) return;

    const modalTitle = modal.querySelector(".modal-title");
    const modalBody = modal.querySelector(".modal-body");

    // Actualizar contenido del modal según la sección
    modalTitle.textContent = `Editar ${
      stateItems.find((item) => item.id === sectionId)?.title || "Información"
    }`;
    modalBody.innerHTML = `<p>Editando sección: ${sectionId}</p>`;

    // Mostrar modal
    modal.classList.add("active");

    // Configurar cierre del modal
    const closeBtn = modal.querySelector(".modal-close");
    const cancelBtn = modal.querySelector(".modal-cancel");

    function closeModal() {
      modal.classList.remove("active");
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }

  // Actualizar barra de progreso
  function updateProgressBar() {
    const progressFill = document.querySelector(".progress-fill");
    if (!progressFill) return;

    const completedItems = stateItems.filter(
      (item) => item.status === "completed"
    ).length;
    const progressPercentage = (completedItems / stateItems.length) * 100;

    progressFill.style.width = `${progressPercentage}%`;
  }

  // Inicializar dashboard
  function initializeDashboard() {
    renderStateItems();
    renderMessages();
    updateProgressBar();
  }

  // Iniciar la aplicación
  initializeDashboard();
});
