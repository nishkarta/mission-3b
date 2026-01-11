const routes = {
  "/login": {
    html: "./src/routes/login/index.html",
    css: "./src/routes/login/styles.css",
    init: () => import("../routes/login/page.js").then((m) => m.initLoginPage()),
    title: "Login - Chill",
  },
  "/register": {
    html: "./src/routes/register/index.html",
    css: "./src/routes/register/styles.css",
    title: "Register - Chill",
  },
  "/home": {
    html: "./src/routes/homepage/index.html",
    css: "./src/routes/homepage/styles.css",
    title: "Home Page - Chill",
  },

};

function getPath() {
  const hash = window.location.hash || "#/";
  return hash.replace("#", "");
}

let activeRouteCssLink = null;

function setRouteCss(href) {
  return new Promise((resolve, reject) => {
    if (activeRouteCssLink) activeRouteCssLink.remove();

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));

    document.head.appendChild(link);
    activeRouteCssLink = link;
  });
}

async function loadHtml(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load: ${url}`);
  return res.text();
}

let renderToken = 0;

export async function renderRoute() {
  const path = getPath();

  if (path === "/") {
    window.location.hash = "/login";
    return;
  }

  const route = routes[path];
  if (!route) {
    window.location.hash = "/login";
    return;
  }

  const app = document.getElementById("app");

  // 🔒 fully hide (no paint, no flash)
  app.style.visibility = "hidden";

  document.title = route.title;

  // load HTML + CSS
  const htmlPromise = loadHtml(route.html);
  await setRouteCss(route.css);

  // inject AFTER css is ready
  app.innerHTML = await htmlPromise;

  // init page JS
  await route.init?.();

  // 🧠 wait one frame so layout settles
  requestAnimationFrame(() => {
    app.style.visibility = "visible";
  });
}


export function initRouter() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href) return;

    const isExternal = a.target === "_blank" || href.startsWith("http");
    if (isExternal) return;

    // Only intercept "#/..."
    if (href.startsWith("#/")) {
      e.preventDefault();
      window.location.hash = href.slice(1);
    }
  });

  window.addEventListener("hashchange", renderRoute);
}