import { validateForm } from "../../js/formValidation.js";

export function initLoginPage() {
  const form = document.querySelector(".page.login form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const result = validateForm(form);
    if (!result.ok) return;

    window.location.hash = "/home";
  });
}
