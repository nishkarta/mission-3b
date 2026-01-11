const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: block; }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    /* reset inside shadow DOM */
    h1, h2, h3, h4, h5, h6, p { margin: 0; }

    .card {
      border-radius: 16px;
      padding: var(--any-size-40-24);
      background: #181A1CD6;
      width: 529px;
      max-width: calc(100vw - 56px);
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .logo {
      height: 44px;
      object-fit: contain:  
    }
    .title {
      font-size: var(--any-size-32-18);      
      font-weight: 700;
      line-height: 110%;
      margin-top: 20px;
      margin-bottom: 8px;
    }
    .description {
      font-size: var(--any-size-16-10);      
      font-weight: 400;
    }
    ::slotted(*) {
      width: 100%;
    }
  </style>

  <div class="card">
    <div class="card-header">
      <img class="logo" src="../../../assets/images/logo-text.png" alt="" />
      <h3 class="title"></h3>
      <p class="description"></p>
    </div>
    <slot></slot>
  </div>
`;

class AppAuthCard extends HTMLElement {
  static get observedAttributes() {
    return ["title", "description"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const title = this.getAttribute("title") || "";
    const description = this.getAttribute("description") || "";

    this.shadowRoot.querySelector(".title").textContent = title;
    this.shadowRoot.querySelector(".description").textContent = description;
  }
}

customElements.define("app-auth-card", AppAuthCard);
