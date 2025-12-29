const template = document.createElement("template");
template.innerHTML = `
  <style>
    .card {
      border: 1px solid var(--color-border, #e5e7eb);
      border-radius: 12px;
      padding: 16px;
      background: var(--color-bg, #fff);
    }
    .title {
      margin: 0 0 8px;
      font-weight: 700;
    }
    .body {
      margin: 0;
      color: var(--color-muted, #64748b);
    }
  </style>

  <div class="card">
    <h3 class="title"></h3>
    <p class="body"></p>
    <slot></slot>
  </div>
`;

class AppAuthCard extends HTMLElement {
  static get observedAttributes() {
    return ["title", "content"];
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
    const content = this.getAttribute("content") || "";

    this.shadowRoot.querySelector(".title").textContent = title;
    this.shadowRoot.querySelector(".body").textContent = content;
  }
}

customElements.define("app-auth-card", AppAuthCard);
