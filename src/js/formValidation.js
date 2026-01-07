function requiredMsg(field) {
  const label = field.getAttribute("label") || "Field";
  return `${label} wajib diisi`;
}

export function validateForm(formEl) {
  const fields = Array.from(formEl.querySelectorAll("app-input-field"));

  let firstInvalid = null;

  for (const field of fields) {
    const isRequired = field.hasAttribute("required");
    const value = (field.value || "").trim();

    // clear previous error first
    field.clearError?.();

    if (isRequired && !value) {
      field.setError?.(requiredMsg(field));
      if (!firstInvalid) firstInvalid = field;
    }
  }

  if (firstInvalid) {
    firstInvalid.focus?.();
    return { ok: false };
  }

  const values = {};
  for (const field of fields) {
    const key = field.getAttribute("name") || field.name;
    values[key] = field.value;
  }

  return { ok: true, values };
}
