const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
     display: inline-block; 
     font-family: var(--font-sans, sans-serif); 
     }

    *, *::before, *::after { box-sizing: border-box; }


    button {
      appearance: none;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
      padding: 0;
      margin: 0;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 14px;

      height: var(--btn-h);
      padding: 0 28px;

      border-radius: 999px;
      font-size: var(--btn-fs, 16px);
      font-weight: 500;
      letter-spacing: 0.2px;

      transition: transform 0.05s ease, background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
      user-select: none;
      white-space: nowrap;
    }

    :host([full]) { display: block; }
    :host([full]) .btn { width: 100%; }

    /* ---------- Variants ---------- */

    /* Primary (Mulai) */
    :host([variant="primary"]) .btn {
      background: var(--color-primary, #3254FF);
      color: #fff;
    }
    :host([variant="primary"]) .btn:hover { background: var(--color-primary-100, #243FDB); }
    :host([variant="primary"]) .btn:active { transform: translateY(1px); }

    /* Secondary filled (Daftar) */
    :host([variant="secondary"]) .btn {
      background: rgba(231, 227, 252, 0.18);
      color: #fff;
      border: 1px solid rgba(231, 227, 252, 0.20);
      backdrop-filter: blur(6px);
    }
    :host([variant="secondary"]) .btn:hover {
      background: rgba(231, 227, 252, 0.22);
      border-color: rgba(231, 227, 252, 0.28);
    }
    :host([variant="secondary"]) .btn:active { transform: translateY(1px); }

    /* Outline (Google) */
    :host([variant="outline"]) .btn {
      background: transparent;
      color: #fff;
      border: 1px solid rgba(231, 227, 252, 0.24);
      backdrop-filter: blur(6px);
    }
    :host([variant="outline"]) .btn:hover {
      border-color: rgba(231, 227, 252, 0.36);
      background: rgba(231, 227, 252, 0.06);
    }
    :host([variant="outline"]) .btn:active { transform: translateY(1px); }

    /* ---------- Shape / Size ---------- */

    /* icon sizes */
    :host([size="sm"]) { --btn-size: 36px; }
    :host([size="md"]) { --btn-size: 44px; }
    :host([size="lg"]) { --btn-size: 56px; }

    /* circle button */
  :host([shape="circle"]) .btn {
  width: var(--btn-size, 44px);
  height: var(--btn-size, 44px);
  padding: 0 !important; 
  border-radius: 50% !important;
  gap: 0;
  line-height: 1;
}

    :host([shape="circle"]) ::slotted([slot="icon"]),
    :host([shape="circle"]) ::slotted(svg),
    :host([shape="circle"]) ::slotted(img) {
      width: calc(0.5 * var(--btn-size));
      height: calc(0.5 * var(--btn-size));
      display: block;
    }

    :host([shape="circle"][full]) .btn {
      width: var(--btn-size);
    }

    :host([variant="glass"]) .btn {
      background: rgba(0, 0, 0, 0.35);
      color: #fff;
      border: 1px solid rgba(231, 227, 252, 0.24);
      backdrop-filter: blur(6px);
    }
    :host([variant="glass"]) .btn:hover {
      background: rgba(0, 0, 0, 0.5);
      border-color: rgba(231, 227, 252, 0.36);
    }
    :host([variant="glass"]) .btn:active { transform: translateY(1px); }

    .btn:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 3px;
    }

    :host([disabled]) .btn {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    ::slotted([slot="icon"]) {
      width: var(--any-size-20-12);
      height: var(--any-size-20-12);
      display: block;
    }

    :host([variant="outline"]) .btn {
      padding: 0 34px;
    }
  </style>

  <button class="btn" part="button" type="button">
    <slot name="icon"></slot>
    <slot></slot>
  </button>
`;

class AppButton extends HTMLElement {
  static get observedAttributes() {
    return ["type", "disabled", "variant", "shape", "size"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._btn = this.shadowRoot.querySelector("button");
  }

  connectedCallback() {
    // default variant
    if (!this.hasAttribute("variant")) this.setAttribute("variant", "primary");
    this._sync();
  }

  attributeChangedCallback() {
    this._sync();
  }

  _sync() {
    const type = this.getAttribute("type") || "button";
    this._btn.type = type;

    const isDisabled = this.hasAttribute("disabled");
    this._btn.disabled = isDisabled;

    this._btn.onclick = (e) => {
      if (isDisabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // ✅ make submit work across shadow DOM
      if (type === "submit") {
        e.preventDefault();

        const form = this.closest("form");
        if (!form) return;

        // trigger native submit event (so your listener runs)
        if (form.requestSubmit) form.requestSubmit();
        else form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      }

      // reset support (optional)
      if (type === "reset") {
        const form = this.closest("form");
        form?.reset?.();
      }
    };
  }

}

customElements.define("app-button", AppButton);
