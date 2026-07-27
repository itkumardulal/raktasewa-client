/** Normalize phone for tel: / wa.me (digits only; keep leading country code if present). */
export function cleanPhone(phone) {
  if (!phone) return "";
  return String(phone).replace(/[^0-9]/g, "");
}

export function buildTelHref(phone) {
  const n = cleanPhone(phone);
  return n ? `tel:${n}` : null;
}

export function buildWhatsAppHref(phone, message = "") {
  const n = cleanPhone(phone);
  if (!n) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${n}${text}`;
}

export function openWhatsApp(phone, message = "") {
  const href = buildWhatsAppHref(phone, message);
  if (!href) {
    window.alert("Phone number is missing.");
    return false;
  }
  window.open(href, "_blank", "noopener,noreferrer");
  return true;
}

export function openCall(phone) {
  const href = buildTelHref(phone);
  if (!href) {
    window.alert("Phone number is missing.");
    return false;
  }
  window.location.href = href;
  return true;
}
