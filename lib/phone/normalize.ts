export function normalizePhone(raw: string): string {
  if (!raw) return raw;
  const trimmed = String(raw).trim();
  const hadPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D+/g, "");
  if (!digits) return "";

  if (hadPlus) {
    // Fix common issue: +225 followed by a local-leading 0 → strip the 0
    if (digits.startsWith("2250")) {
      return "+225" + digits.slice(4);
    }
    return "+" + digits;
  }

  // Handle international format starting with 00
  if (digits.startsWith("00")) {
    const intl = digits.slice(2);
    // Also normalize +2250XXXXXXXX → +225XXXXXXXX
    if (intl.startsWith("2250")) {
      return "+225" + intl.slice(4);
    }
    return "+" + intl;
  }

  // Local number: assume Cote d'Ivoire default +225
  if (digits.startsWith("0")) {
    return "+225" + digits.slice(1);
  }

  return "+225" + digits;
}


