/**
 * Controlador del formulario de pago
 */
class PaymentFormController {
  constructor() {
    this.form = document.getElementById("paymentForm");

    // Referencias a elementos del formulario
    this.paymentMethods = document.querySelectorAll(".payment-method input");
    this.cardForm = document.getElementById("cardForm");
    this.transferForm = document.getElementById("transferForm");
    this.qrForm = document.getElementById("qrForm");

    // Referencias a campos de tarjeta
    this.cardNumber = document.getElementById("cardNumber");
    this.cardExpiry = document.getElementById("cardExpiry");
    this.cardCvc = document.getElementById("cardCvc");
    this.cardName = document.getElementById("cardName");

    // Referencia a archivo de transferencia
    this.transferProof = document.getElementById("transferProof");
    this.uploadArea = document.getElementById("uploadArea");

    // Costos
    this.costs = {
      admission: 2500,
      exam: 1500,
      processingFee: 100,
    };

    // Estado actual
    this.currentCardType = null;
    this.isProcessing = false;

    this.init();
  }

  init() {
    this.setupCostSummary();
    this.setupPaymentMethodToggle();
    this.setupCardValidation();
    this.setupFileUpload();
    this.setupFormSubmission();
    this.loadSavedData();
  }

  loadSavedData() {
    // Intentar cargar datos guardados
    const savedData = localStorage.getItem("admissionForm_payment");
    if (!savedData) return;

    try {
      const data = JSON.parse(savedData);

      // Restaurar método de pago seleccionado
      if (data.paymentMethod) {
        const methodInput = this.form.querySelector(
          `input[name="paymentMethod"][value="${data.paymentMethod}"]`
        );
        if (methodInput) {
          methodInput.checked = true;
          // Mostrar el formulario correspondiente
          this.showPaymentForm(data.paymentMethod);
        }
      }

      // Restaurar datos de tarjeta si existen
      if (data.cardData) {
        Object.entries(data.cardData).forEach(([field, value]) => {
          const input = this.form.elements[field];
          if (input) {
            input.value = value;
          }
        });
      }

      // Restaurar estado de términos y condiciones
      const termsCheckbox = this.form.querySelector(
        'input[name="acceptTerms"]'
      );
      if (termsCheckbox && data.acceptTerms) {
        termsCheckbox.checked = data.acceptTerms;
      }
    } catch (error) {
      console.error("Error al cargar datos guardados:", error);
    }
  }

  /**
   * Muestra el formulario correspondiente al método de pago
   */
  showPaymentForm(method) {
    // Ocultar todos los formularios
    ["cardForm", "transferForm", "qrForm"].forEach((formId) => {
      const form = document.getElementById(formId);
      if (form) {
        form.classList.add("hidden");
      }
    });

    // Mostrar el formulario seleccionado
    const formId = `${method}Form`;
    const selectedForm = document.getElementById(formId);
    if (selectedForm) {
      selectedForm.classList.remove("hidden");
    }

    // Actualizar campos requeridos
    this.updateRequiredFields(method);
  }

  /**
   * Actualiza los campos requeridos según el método de pago
   */
  updateRequiredFields(method) {
    // Campos de tarjeta
    const cardFields = ["cardNumber", "cardExpiry", "cardCvc", "cardName"];
    cardFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.required = method === "card";
      }
    });

    // Campo de comprobante de transferencia
    if (this.transferProof) {
      this.transferProof.required = method === "transfer";
    }
  }

  /**
   * Guarda el estado actual del formulario
   */
  saveCurrentState() {
    const formData = this.formHandler.getFormData();

    // Preparar datos para guardar
    const dataToSave = {
      paymentMethod: formData.paymentMethod,
      acceptTerms: formData.acceptTerms === "on",
      cardData:
        formData.paymentMethod === "card"
          ? {
              cardNumber: formData.cardNumber,
              cardName: formData.cardName,
              cardExpiry: formData.cardExpiry,
              // No guardamos el CVC por seguridad
            }
          : null,
    };

    localStorage.setItem("admissionForm_payment", JSON.stringify(dataToSave));
  }

  setupCostSummary() {
    const formatted = PaymentFormatter.formatCostSummary(this.costs);

    document.getElementById("admissionCost").textContent = formatted.admission;
    document.getElementById("examCost").textContent = formatted.exam;
    document.getElementById("processingFee").textContent =
      formatted.processingFee;
    document.getElementById("totalCost").textContent = formatted.total;
  }

  setupPaymentMethodToggle() {
    this.paymentMethods.forEach((method) => {
      method.addEventListener("change", () => {
        // Ocultar todos los formularios
        this.cardForm.classList.add("hidden");
        this.transferForm.classList.add("hidden");
        this.qrForm.classList.add("hidden");

        // Mostrar el formulario seleccionado
        switch (method.value) {
          case "card":
            this.cardForm.classList.remove("hidden");
            break;
          case "transfer":
            this.transferForm.classList.remove("hidden");
            break;
          case "qr":
            this.qrForm.classList.remove("hidden");
            break;
        }

        // Actualizar validaciones requeridas
        this.updateRequiredFields(method.value);
      });
    });
  }

  updateRequiredFields(paymentMethod) {
    // Campos de tarjeta
    const cardFields = this.cardForm.querySelectorAll("input");
    cardFields.forEach((field) => {
      field.required = paymentMethod === "card";
    });

    // Campo de comprobante de transferencia
    if (this.transferProof) {
      this.transferProof.required = paymentMethod === "transfer";
    }
  }

  setupCardValidation() {
    // Formateo y validación del número de tarjeta
    this.cardNumber.addEventListener("input", (e) => {
      let value = e.target.value;
      value = PaymentFormatter.formatCardNumber(value);
      e.target.value = value;

      // Validar y actualizar tipo de tarjeta
      const validation = PaymentValidator.validateCardNumber(value);
      if (validation.isValid) {
        this.currentCardType = validation.cardType;
        this.cardNumber.classList.remove("error");
      } else {
        this.currentCardType = null;
        if (value.length > 0) {
          this.cardNumber.classList.add("error");
        }
      }

      // Actualizar longitud del CVC según tipo de tarjeta
      this.cardCvc.maxLength = this.currentCardType === "amex" ? 4 : 3;
    });

    // Formateo y validación de fecha de expiración
    this.cardExpiry.addEventListener("input", (e) => {
      let value = e.target.value;
      value = PaymentFormatter.formatExpiry(value);
      e.target.value = value;

      const validation = PaymentValidator.validateExpiry(value);
      if (validation.isValid) {
        this.cardExpiry.classList.remove("error");
      } else {
        if (value.length > 0) {
          this.cardExpiry.classList.add("error");
        }
      }
    });

    // Formateo y validación de CVC
    this.cardCvc.addEventListener("input", (e) => {
      let value = e.target.value;
      value = PaymentFormatter.formatCVC(value, this.currentCardType);
      e.target.value = value;

      const validation = PaymentValidator.validateCVC(
        value,
        this.currentCardType
      );
      if (validation.isValid) {
        this.cardCvc.classList.remove("error");
      } else {
        if (value.length > 0) {
          this.cardCvc.classList.add("error");
        }
      }
    });

    // Formateo y validación del nombre
    this.cardName.addEventListener("input", (e) => {
      let value = e.target.value;
      value = PaymentFormatter.formatCardName(value);
      e.target.value = value;

      const validation = PaymentValidator.validateCardName(value);
      if (validation.isValid) {
        this.cardName.classList.remove("error");
      } else {
        if (value.length > 0) {
          this.cardName.classList.add("error");
        }
      }
    });
  }

  setupFileUpload() {
    if (!this.uploadArea || !this.transferProof) return;

    // Manejar drag & drop
    this.uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.uploadArea.classList.add("dragover");
    });

    this.uploadArea.addEventListener("dragleave", () => {
      this.uploadArea.classList.remove("dragover");
    });

    this.uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      this.uploadArea.classList.remove("dragover");

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileSelection(files[0]);
      }
    });

    // Manejar clic para selección
    this.uploadArea.addEventListener("click", () => {
      this.transferProof.click();
    });

    this.transferProof.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        this.handleFileSelection(e.target.files[0]);
      }
    });
  }

  handleFileSelection(file) {
    const validation = PaymentValidator.validateTransferProof(file);
    if (!validation.isValid) {
      this.showError(validation.error);
      return;
    }

    // Actualizar UI
    const fileName = file.name;
    const fileSize = PaymentFormatter.formatFileSize(file.size);
    this.uploadArea.innerHTML = `
            <div class="selected-file">
                <span class="file-icon">📄</span>
                <div class="file-info">
                    <div class="file-name">${fileName}</div>
                    <div class="file-size">${fileSize}</div>
                </div>
                <button type="button" class="btn-remove">×</button>
            </div>
        `;

    // Agregar evento para remover archivo
    const removeBtn = this.uploadArea.querySelector(".btn-remove");
    if (removeBtn) {
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.resetFileUpload();
      });
    }
  }

  resetFileUpload() {
    this.transferProof.value = "";
    this.uploadArea.innerHTML = `
            <span class="upload-icon">📤</span>
            <span class="upload-text">Arrastra o haz clic para subir el comprobante</span>
        `;
  }

  setupFormSubmission() {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (this.isProcessing) return;

      if (!this.validateForm()) {
        return;
      }
      try {
        this.isProcessing = true;
        this.startLoadingState();

        const paymentMethod = this.getSelectedPaymentMethod();
        let paymentResult;

        switch (paymentMethod) {
          case "card":
            paymentResult = await this.processCardPayment();
            break;
          case "transfer":
            paymentResult = await this.processTransferPayment();
            break;
          case "qr":
            paymentResult = await this.processQRPayment();
            break;
        }

        if (paymentResult.success) {
          await this.handlePaymentSuccess(paymentResult);
        } else {
          this.handlePaymentError(paymentResult.error);
        }
      } catch (error) {
        this.handlePaymentError(error);
      } finally {
        this.isProcessing = false;
        this.stopLoadingState();
      }
    });
  }

  validateForm() {
    const paymentMethod = this.getSelectedPaymentMethod();
    let isValid = true;
    const errors = [];

    // Validar campos según método de pago
    if (paymentMethod === "card") {
      // Validar número de tarjeta
      const cardValidation = PaymentValidator.validateCardNumber(
        this.cardNumber.value
      );
      if (!cardValidation.isValid) {
        errors.push(cardValidation.error);
        this.cardNumber.classList.add("error");
        isValid = false;
      }

      // Validar fecha de expiración
      const expiryValidation = PaymentValidator.validateExpiry(
        this.cardExpiry.value
      );
      if (!expiryValidation.isValid) {
        errors.push(expiryValidation.error);
        this.cardExpiry.classList.add("error");
        isValid = false;
      }

      // Validar CVC
      const cvcValidation = PaymentValidator.validateCVC(
        this.cardCvc.value,
        this.currentCardType
      );
      if (!cvcValidation.isValid) {
        errors.push(cvcValidation.error);
        this.cardCvc.classList.add("error");
        isValid = false;
      }

      // Validar nombre
      const nameValidation = PaymentValidator.validateCardName(
        this.cardName.value
      );
      if (!nameValidation.isValid) {
        errors.push(nameValidation.error);
        this.cardName.classList.add("error");
        isValid = false;
      }
    } else if (paymentMethod === "transfer") {
      // Validar comprobante de transferencia
      if (!this.transferProof.files[0]) {
        errors.push("Debe subir el comprobante de transferencia");
        isValid = false;
      }
    }

    // Validar aceptación de términos
    const termsCheckbox = this.form.querySelector('input[name="acceptTerms"]');
    if (!termsCheckbox.checked) {
      errors.push("Debe aceptar los términos y condiciones");
      isValid = false;
    }

    if (!isValid) {
      this.showErrors(errors);
    }

    return isValid;
  }

  async processCardPayment() {
    // Simulación de proceso de pago con tarjeta
    await this.simulateProcessing();

    // En un entorno real, aquí se enviarían los datos a un procesador de pagos
    return {
      success: true,
      transactionId: this.generateTransactionId(),
      confirmationNumber: this.generateConfirmationNumber(),
    };
  }

  async processTransferPayment() {
    // Simulación de proceso de pago por transferencia
    await this.simulateProcessing();

    return {
      success: true,
      transactionId: this.generateTransactionId(),
      confirmationNumber: this.generateConfirmationNumber(),
    };
  }

  async processQRPayment() {
    // Simulación de proceso de pago por QR
    await this.simulateProcessing();

    return {
      success: true,
      transactionId: this.generateTransactionId(),
      confirmationNumber: this.generateConfirmationNumber(),
    };
  }

  async handlePaymentSuccess(result) {
    // Guardar resultado del pago
    this.savePaymentResult(result);

    // Mostrar mensaje de éxito
    this.showSuccessMessage(result.confirmationNumber);

    // Redireccionar al dashboard después de un momento
    setTimeout(() => {
      window.location.href = "../dashboard.html";
    }, 3000);
  }

  handlePaymentError(error) {
    const errorMessage = PaymentFormatter.formatErrorMessage(
      error.code || "default"
    );
    this.showError(errorMessage);
  }

  showSuccessMessage(confirmationNumber) {
    const message = document.createElement("div");
    message.className = "payment-success";
    message.innerHTML = `
            <div class="success-icon">✓</div>
            <div class="success-content">
                <h4>¡Pago Exitoso!</h4>
                <p>Su número de confirmación es: ${confirmationNumber}</p>
                <p>Será redirigido en unos momentos...</p>
            </div>
        `;

    this.insertMessage(message);
  }

  showError(error) {
    const message = document.createElement("div");
    message.className = "payment-error";
    message.innerHTML = `
            <div class="error-icon">⚠</div>
            <div class="error-content">
                <h4>Error en el Pago</h4>
                <p>${error}</p>
            </div>
        `;

    this.insertMessage(message);
  }

  showErrors(errors) {
    const message = document.createElement("div");
    message.className = "payment-error";
    message.innerHTML = `
            <div class="error-icon">⚠</div>
            <div class="error-content">
                <h4>Por favor corrija los siguientes errores:</h4>
                <ul>
                    ${errors.map((error) => `<li>${error}</li>`).join("")}
                </ul>
            </div>
        `;

    this.insertMessage(message);
  }

  insertMessage(messageElement) {
    // Remover mensajes anteriores
    const existingMessages = this.form.querySelectorAll(
      ".payment-error, .payment-success"
    );
    existingMessages.forEach((msg) => msg.remove());

    // Insertar nuevo mensaje
    const navigation = this.form.querySelector(".navigation");
    this.form.insertBefore(messageElement, navigation);

    // Scroll al mensaje
    messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  startLoadingState() {
    this.form.classList.add("loading");
    const submitButton = this.form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Procesando...";
  }

  stopLoadingState() {
    this.form.classList.remove("loading");
    const submitButton = this.form.querySelector('button[type="submit"]');
    submitButton.disabled = false;
    submitButton.textContent = "Procesar Pago";
  }

  getSelectedPaymentMethod() {
    const selected = document.querySelector(
      'input[name="paymentMethod"]:checked'
    );
    return selected ? selected.value : null;
  }

  generateTransactionId() {
    return "TX" + Date.now() + Math.random().toString(36).substr(2, 6);
  }

  generateConfirmationNumber() {
    return PaymentFormatter.formatConfirmationNumber(
      Math.floor(Math.random() * 100000000)
    );
  }

  savePaymentResult(result) {
    const paymentData = {
      ...result,
      date: new Date().toISOString(),
      method: this.getSelectedPaymentMethod(),
      amount: this.costs.admission + this.costs.exam + this.costs.processingFee,
    };

    localStorage.setItem("admissionForm_payment", JSON.stringify(paymentData));
  }

  simulateProcessing() {
    return new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new PaymentFormController();
});
