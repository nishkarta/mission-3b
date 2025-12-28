const routes = {
  "/home": {
    html: "./src/routes/homepage/index.html",
    css: "./src/routes/homepage/styles.css",
    title: "Home Page",
  },
  "/register": {
    html: "./src/routes/register/index.html",
    css: "./src/routes/register/styles.css",
    title: "Register",
  },
  "/": {
    html: "./src/routes/login/index.html",
    css: "./src/routes/login/styles.css",
    title: "Login",
  },
};

function getPath() {
  // "#/about" -> "/about"
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
  const route = routes[path] || routes["/"];

  document.title = route.title;
  setRouteCss(route.css);

  document.getElementById("app").innerHTML = await loadHtml(route.html);
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
      window.location.hash = href;
    }
  });

  window.addEventListener("hashchange", renderRoute);
}