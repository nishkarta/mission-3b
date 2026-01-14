const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      position: relative;
      width: 100%;
    }

    *, *::before, *::after { box-sizing: border-box; }

    .wrap {
      position: relative;
    }

    .track {
      position: relative;
      display: flex;
      gap: var(--slider-gap, 16px);
      overflow-x: auto;
      overflow-y: visible;
      scroll-behavior: smooth;
      scroll-snap-type: x mandatory;

      padding: var(--slider-padding-y, 12px) var(--slider-padding-x, 12px);

      /* nicer scrolling */
      -webkit-overflow-scrolling: touch;

      /* hide scrollbar */
      scrollbar-width: none;
    }
    .track::-webkit-scrollbar { display: none; }

    ::slotted(*) {
      scroll-snap-align: start;
      flex: 0 0 auto;
    }

    /* arrows */
    .nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 5;

      /* button itself is just a click target */
      width: var(--slider-arrow-size, 36px);
      height: var(--slider-arrow-size, 36px);
      padding: 0;

      border: 0;
      background: transparent;
      cursor: pointer;
      color: #fff;

      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .nav-bg {
      width: 100%;
      height: 100%;
      border-radius: 999px;

      display: inline-flex;
      align-items: center;
      justify-content: center;

      border: 1px solid rgba(231, 227, 252, 0.24);
      background: rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(6px); /* ✅ now clipped properly */
    }

    .nav:hover .nav-bg {
      background: rgba(0, 0, 0, 0.5);
    }

    .nav:active {
      transform: translateY(-50%) scale(0.98);
    }

    .nav:focus-visible .nav-bg {
      outline: 2px solid var(--color-primary, #3254FF);
      outline-offset: 3px;
    }


    .prev { left: var(--slider-arrow-offset, 8px); }
    .next { right: var(--slider-arrow-offset, 8px); }

    .nav[hidden] { display: none; }

    /* optional edge fade like netflix */
    .fade-left, .fade-right {
      position: absolute;
      top: 0;
      bottom: 0;
      width: var(--slider-fade-width, 48px);
      pointer-events: none;
      z-index: 1;
    }
    .fade-left {
      left: 0;
      // background: linear-gradient(to right, rgba(10,10,10,0.85), rgba(10,10,10,0));
      opacity: var(--slider-fade-left, 0);
      transition: opacity 120ms ease;
    }
    .fade-right {
      right: 0;
      // background: linear-gradient(to left, rgba(10,10,10,0.85), rgba(10,10,10,0));
      opacity: var(--slider-fade-right, 0);
      transition: opacity 120ms ease;
    }

    /* reduce motion */
    @media (prefers-reduced-motion: reduce) {
      .track { scroll-behavior: auto; }
    }

    /* icon */
    .icon { width: 18px; height: 18px; display: block; }
  </style>

  <div class="wrap">
    <div class="fade-left"></div>
    <div class="fade-right"></div>

    <button class="nav prev" type="button" aria-label="Scroll left">
      <span class="nav-bg" aria-hidden="true">
        <svg class="icon" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6"
            stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>

    <div class="track" part="track">
      <slot></slot>
    </div>

    <button class="nav next" type="button" aria-label="Scroll right">
      <span class="nav-bg" aria-hidden="true">
        <svg class="icon" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6"
            stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>

  </div>
`;

class AppSlider extends HTMLElement {
  static get observedAttributes() {
    return ["step"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._track = this.shadowRoot.querySelector(".track");
    this._prev = this.shadowRoot.querySelector(".prev");
    this._next = this.shadowRoot.querySelector(".next");
    this._fadeLeft = this.shadowRoot.querySelector(".fade-left");
    this._fadeRight = this.shadowRoot.querySelector(".fade-right");

    this._onScroll = this._onScroll.bind(this);
    this._ro = new ResizeObserver(() => this._updateNav());
  }

  connectedCallback() {
    if (!this.hasAttribute("step")) this.setAttribute("step", "0.8");

    this._prev.addEventListener("click", () => this._scrollBy(-1));
    this._next.addEventListener("click", () => this._scrollBy(1));
    this._track.addEventListener("scroll", this._onScroll, { passive: true });

    // ✅ update when children/slot changes (cards, images, etc.)
    const slotEl = this.shadowRoot.querySelector("slot");
    slotEl.addEventListener("slotchange", () => {
      this._updateNav();
      // some layouts settle next frame
      requestAnimationFrame(() => this._updateNav());
    });

    this._ro.observe(this._track);

    // ✅ initial update AFTER first paint (layout is real)
    // requestAnimationFrame(() => this._updateNav());
    requestAnimationFrame(() => {
      this._track.scrollLeft = 0;
      this._updateNav();
    });
  }


  disconnectedCallback() {
    this._track.removeEventListener("scroll", this._onScroll);
    this._ro.disconnect();
  }

  attributeChangedCallback() {
    // nothing heavy; step read at click time
  }

  _onScroll() {
    this._updateNav();
  }

  _scrollBy(dir) {
    const stepAttr = this.getAttribute("step") || "0.8";
    const step = Number(stepAttr);

    // if step >= 1 assume pixels, else fraction of track width
    const amount = step >= 1 ? step : Math.round(this._track.clientWidth * step);

    this._track.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  _updateNav() {
    const el = this._track;

    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const left = el.scrollLeft;

    const atStart = left <= 1;
    const atEnd = left >= max - 1;

    this._prev.hidden = atStart || max === 0;
    this._next.hidden = atEnd || max === 0;

    this.style.setProperty("--slider-fade-left", atStart ? "0" : "1");
    this.style.setProperty("--slider-fade-right", atEnd ? "0" : "1");
  }
}

customElements.define("app-slider", AppSlider);
