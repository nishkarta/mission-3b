const routes = {
  "/login": {
    html: "./src/routes/login/index.html",
    css: "./src/routes/login/styles.css",
    init: () => import("../routes/login/page.js").then((m) => m.initLoginPage()),
    title: "Login",
  },
  "/register": {
    html: "./src/routes/register/index.html",
    css: "./src/routes/register/styles.css",
    title: "Register",
  },
  "/home": {
    html: "./src/routes/homepage/index.html",
    css: "./src/routes/homepage/styles.css",
    title: "Home Page",
  },

};

function getPath() {
  const hash = window.location.hash || "#/";
  return hash.replace("#", "");
}

let activeRouteCssLink = null;

function setRouteCss(href) {
  if (activeRouteCssLink) activeRouteCssLink.remove();
  activeRouteCssLink = document.createElement("link");
  activeRouteCssLink.rel = "stylesheet";
  activeRouteCssLink.href = href;
  document.head.appendChild(activeRouteCssLink);
}

async function loadHtml(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load: ${url}`);
  return res.text();
}

export async function renderRoute() {
  const path = getPath();

  if (path === "/") {
    window.location.hash = "/login";
    return;
  }

  const route = routes[path];

  if (!route) {
    console.error("Route not found:", path);
    window.location.hash = "/login";
    return;
  }

  document.title = route.title;
  setRouteCss(route.css);

  document.getElementById("app").innerHTML = await loadHtml(route.html);

  // ✅ IMPORTANT: run route JS after DOM exists
  await route.init?.();
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