const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: var(--card-w, 220px);
      font-family: var(--font-sans, system-ui, sans-serif);
    }

    *, *::before, *::after { box-sizing: border-box; }

    .link {
      display: block;
      color: inherit;
      text-decoration: none;
      outline: none;
    }

    .card {
      position: relative;
      border-radius: var(--card-radius, 12px);
      overflow: hidden;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(231,227,252,0.10);
      transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
      transform-origin: center;
    }

    /* Hover */
    :host(:hover) .card,
    :host(:focus-within) .card {
      transform: scale(1.04);
      border-color: rgba(231,227,252,0.22);
      box-shadow: 0 16px 40px rgba(0,0,0,0.35);
      z-index: 3;
    }

    .poster {
      width: 100%;
      height: auto;
      display: block;
      aspect-ratio: var(--card-ratio, 16 / 9); /* default thumb */
      object-fit: cover;
    }

    /* Title overlay */
    .title {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 10px 12px;
      font-size: 14px;
      font-weight: 600;
      color: #fff;

      background: linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0));
      pointer-events: none;
    }

    /* badges */
    .badges {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      gap: 8px;
      z-index: 2;
    }

    ::slotted([slot="badge"]) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 8px;
      border-radius: 999px;
      color: #fff;
      background: rgba(0,0,0,0.55);
      border: 1px solid rgba(231,227,252,0.18);
      backdrop-filter: blur(6px);
      white-space: nowrap;
    }

    /* Top-right slot (like Top 10) */
    .corner {
      position: absolute;
      top: -2px;
      right: 10px;
      z-index: 2;
    }

    ::slotted([slot="corner"]) {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
      padding: 6px 8px;
      border-radius: 0 4px 0 4px;
      color: #fff;
      background: var(--color-error-pressed, #B71F1D);
    }

    /* ⭐ rating (bottom-right) */
    .rating {
      position: absolute;
      right: 12px;
      bottom: 12px;
      z-index: 2;

      display: inline-flex;
      align-items: center;
      gap: 6px;

      font-size: 12px;
      font-weight: 600;
      color: #fff;
    }

    .rating[hidden] { display: none; }

    .star {
      font-size: 14px;
      line-height: 1;
    }

    /* variants */
    :host([variant="poster"]) {
      width: var(--card-w, 190px);
    }
    :host([variant="poster"]) .poster {
      aspect-ratio: var(--card-ratio, 2 / 3);
    }

    /* reduce motion */
    @media (prefers-reduced-motion: reduce) {
      .card { transition: none; }
    }
  </style>

  <div class="link">
    <div class="card">
      <div class="badges">
        <slot name="badge"></slot>
      </div>

      <div class="corner">
        <slot name="corner"></slot>
      </div>

      <div class="rating" hidden>
        <span class="star">★</span>
        <span class="rating-text"></span>
      </div>

      <img class="poster" alt="" />
      <div class="title"></div>
    </div>
  </div>
`;

class AppMediaCard extends HTMLElement {
  static get observedAttributes() {
    return ["title", "img", "alt", "show-title", "rating", "rating-max"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._img = this.shadowRoot.querySelector(".poster");
    this._title = this.shadowRoot.querySelector(".title");

    this._ratingWrap = this.shadowRoot.querySelector(".rating");
    this._ratingText = this.shadowRoot.querySelector(".rating-text");
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    this._render();
  }

  _render() {
    const title = this.getAttribute("title") || "";
    const img = this.getAttribute("img") || "";
    const alt = this.getAttribute("alt") || title || "";

    this._img.src = img;
    this._img.alt = alt;

    // title
    const showTitle = !this.hasAttribute("show-title") || this.getAttribute("show-title") !== "false";
    this._title.textContent = title;
    this._title.style.display = showTitle && title ? "block" : "none";

    // rating (optional)
    const rating = this.getAttribute("rating");
    const ratingMax = this.getAttribute("rating-max") || "5";

    if (rating && String(rating).trim() !== "") {
      this._ratingWrap.hidden = false;
      this._ratingText.textContent = `${rating}/${ratingMax}`;
    } else {
      this._ratingWrap.hidden = true;
      this._ratingText.textContent = "";
    }
  }
}

customElements.define("app-media-card", AppMediaCard);
