document.addEventListener("DOMContentLoaded", function () {
  // Elementos del DOM
  const dynamicPanel = document.querySelector(".dynamic-panel");
  const options = document.querySelectorAll(".option");

  // Templates de contenido
  const templates = {
    new: `
            <h2 class="panel-title">
                Comienza tu Proceso de Admisión
            </h2>
            <div class="panel-content">
                <a href="./admission/personal.html" class="button">Iniciar Inscripción</a>
                
                <ul class="bullet-list">
                    <li>Proceso guiado paso a paso</li>
                    <li>Duración aprox. 15 minutos</li>
                    <li>Documentos necesarios</li>
                </ul>
                
                <a href="#" class="link">Ver requisitos completos</a>
            </div>
        `,
    existing: `
            <h2 class="panel-title">
                Accede a tu Proceso de Admisión
            </h2>
            <div class="panel-content">
                <form id="loginForm" class="login-form">
                    <div class="form-group">
                        <label for="cedula">Cédula:</label>
                        <input type="text" 
                               id="cedula" 
                               name="cedula" 
                               placeholder="000-0000000-0"
                               pattern="[0-9]{3}-[0-9]{7}-[0-9]{1}"
                               required>
                    </div>
                    
                    <div class="form-group">
                        <label for="codigo">Código:</label>
                        <input type="text" 
                               id="codigo" 
                               name="codigo" 
                               placeholder="1234"
                               required>
                    </div>
                    
                    <button type="submit" class="button">Iniciar Sesión</button>
                </form>
                <a href="#" class="link">¿Olvidaste el código?</a>
            </div>
        `,
  };

  // Manejador de eventos para las opciones
  function handleOptionClick(e) {
    e.preventDefault();

    // Remover clase active de todas las opciones
    options.forEach((opt) => opt.classList.remove("active"));

    // Añadir clase active a la opción seleccionada
    this.classList.add("active");

    // Actualizar el contenido del panel según la opción seleccionada
    const panelType = this.dataset.panel;
    dynamicPanel.innerHTML = templates[panelType];

    // Si es el panel de login, inicializar el formulario
    if (panelType === "existing") {
      initLoginForm();
    }
  }

  // Inicializar formulario de login
  function initLoginForm() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = {
          cedula: document.getElementById("cedula").value,
          codigo: document.getElementById("codigo").value,
        };

        // Aquí iría la lógica de autenticación
        console.log("Intentando iniciar sesión con:", formData);

        // Redireccionar al dashboard después de la autenticación exitosa
        window.location.href = "./dashboard.html";
      });
    }
  }

  // Añadir event listeners a las opciones
  options.forEach((option) => {
    option.addEventListener("click", handleOptionClick);
  });

  // Mostrar panel de nuevo usuario por defecto
  options[0].click();
});
