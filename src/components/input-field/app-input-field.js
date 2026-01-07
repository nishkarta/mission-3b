const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
      font-family: var(--font-sans, sans-serif);
    }

    *, *::before, *::after { box-sizing: border-box; }

    label, p { margin: 0; }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }

    .label {
      font-size: var(--input-label-fs, 18px);
      font-weight: 500;
      color: #fff;
    }

    .input-wrapper {
      position: relative;
      width: 100%;
    }

    input {
      width: 100%;
      height: var(--input-h, 48px);
      padding: 14px 20px;
      font-size: var(--input-fs, 16px);
      color: var(--color-text-light-secondary);

      background: transparent;
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 999px;

      outline: none;
      transition: border-color 0.2s ease;
    }

    input::placeholder { color: rgba(255,255,255,0.6); }

    input:focus { border-color: var(--color-primary, #3254FF); }

    /* reserve space for the eye button */
    :host([has-toggle]) input { padding-right: 52px; }

    .toggle {
      position: absolute;
      top: 50%;
      right: 16px;
      transform: translateY(-50%);

      width: 32px;
      height: 32px;
      border-radius: 999px;

      display: none;
      align-items: center;
      justify-content: center;

      border: 0;
      background: transparent;
      cursor: pointer;

      color: rgba(255,255,255,0.65);
    }

    .toggle:hover { color: rgba(255,255,255,0.9); }

    .toggle:focus-visible {
      outline: 2px solid var(--color-primary, #3254FF);
      outline-offset: 2px;
    }

    :host([has-toggle]) .toggle { display: inline-flex; }

    :host([disabled]) input {
      opacity: 0.5;
      pointer-events: none;
    }
    :host([disabled]) .toggle {
      opacity: 0.5;
      pointer-events: none;
    }

    /* error state (manual toggle via attribute) */
    :host([error]) input { border-color: var(--color-error, #ff5b3a); }

    .error-text {
      font-size: 12px;
      color: var(--color-error, #ff5b3a);
      display: none;
    }
    :host([error]) .error-text { display: block; }

    .icon {
      width: 22px;
      height: 22px;
      display: block;
    }

    /* optional required indicator */
    :host([required]) .label::after {
      content: " *";
      color: var(--color-error, #ff5b3a);
    }
  </style>

  <div class="field">
    <label class="label"></label>

    <div class="input-wrapper">
      <input />
      <button class="toggle" type="button" aria-label="Toggle password visibility">
        <svg class="icon eye-off" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-3.07 4.45" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M6.11 6.11A18.9 18.9 0 0 0 2 12s3 8 10 8a10.9 10.9 0 0 0 5.05-1.23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M2 2l20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>

        <svg class="icon eye" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="display:none">
          <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <p class="error-text"></p>
  </div>
`;

class AppInputField extends HTMLElement {
  static get observedAttributes() {
    return ["label", "placeholder", "type", "value", "disabled", "required", "name", "error", "error-text"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._input = this.shadowRoot.querySelector("input");
    this._label = this.shadowRoot.querySelector(".label");
    this._toggle = this.shadowRoot.querySelector(".toggle");
    this._error = this.shadowRoot.querySelector(".error-text");

    this._isPasswordVisible = false;

    this._toggle.addEventListener("click", () => {
      this._isPasswordVisible = !this._isPasswordVisible;
      this._applyInputType();
      this._syncToggleIcon();
      this._input.focus();
    });

    this._input.addEventListener("input", (e) => {
      const next = e.target.value;

      // update value
      if (this.getAttribute("value") !== next) {
        this.setAttribute("value", next);
      }

      // clear error ONLY if it's now valid (mainly for required)
      const isRequired = this.hasAttribute("required");
      if (!isRequired || next.trim()) {
        this.clearError();
      }

      this.dispatchEvent(
        new CustomEvent("input", { detail: next, bubbles: true })
      );
    });

  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === "value") {
      if (this._input && this._input.value !== (newValue ?? "")) {
        this._input.value = newValue ?? "";
      }
      return;
    }

    this.render();
  }

  render() {
    const label = this.getAttribute("label") || "";
    const placeholder = this.getAttribute("placeholder") || "";
    const name = this.getAttribute("name") || "";
    const errorText = this.getAttribute("error-text") || "";

    this._label.textContent = label;
    this._input.placeholder = placeholder;
    this._input.name = name;
    this._error.textContent = errorText;

    this._input.required = this.hasAttribute("required");
    this._input.disabled = this.hasAttribute("disabled");

    const baseType = (this.getAttribute("type") || "text").toLowerCase();
    if (baseType === "password") {
      this.setAttribute("has-toggle", "");
    } else {
      this.removeAttribute("has-toggle");
      this._isPasswordVisible = false;
    }

    this._applyInputType();

    const attrVal = this.getAttribute("value") ?? "";
    if (this._input.value !== attrVal) {
      this._input.value = attrVal;
    }

    this._syncToggleIcon();
  }

  _applyInputType() {
    const baseType = (this.getAttribute("type") || "text").toLowerCase();
    if (baseType === "password") {
      this._input.type = this._isPasswordVisible ? "text" : "password";
    } else {
      this._input.type = baseType;
    }
  }

  _syncToggleIcon() {
    const baseType = (this.getAttribute("type") || "text").toLowerCase();
    const eye = this.shadowRoot.querySelector(".eye");
    const eyeOff = this.shadowRoot.querySelector(".eye-off");

    if (baseType !== "password") {
      eye.style.display = "none";
      eyeOff.style.display = "none";
      return;
    }

    eye.style.display = this._isPasswordVisible ? "block" : "none";
    eyeOff.style.display = this._isPasswordVisible ? "none" : "block";

    this._toggle.setAttribute(
      "aria-label",
      this._isPasswordVisible ? "Hide password" : "Show password"
    );
  }

  setError(message) {
    if (message) {
      this.setAttribute("error", "");
      this.setAttribute("error-text", message);
      if (this._error) this._error.textContent = message;
    } else {
      this.clearError();
    }
  }

  clearError() {
    this.removeAttribute("error");
    this.removeAttribute("error-text");
    if (this._error) this._error.textContent = "";
  }

  // API for form helper
  checkValidity() { return this._input.checkValidity(); }
  reportValidity() { return this._input.reportValidity(); }
  focus() { this._input.focus(); }

  get name() { return this._input.name; }
  get value() { return this._input.value; }
  set value(v) { this.setAttribute("value", v ?? ""); }
}

customElements.define("app-input-field", AppInputField);
