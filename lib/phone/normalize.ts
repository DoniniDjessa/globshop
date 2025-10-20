export function normalizePhone(raw: string): string {
  if (!raw) return raw;
  const trimmed = String(raw).trim();
  const hadPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D+/g, "");
  if (!digits) return "";

  if (hadPlus) {
    return "+" + digits;
  }

  // Handle international format starting with 00
  if (digits.startsWith("00")) {
    return "+" + digits.slice(2);
  }

  // Local number: assume Cote d'Ivoire default +225
  if (digits.startsWith("0")) {
    return "+225" + digits.slice(1);
  }

  return "+225" + digits;
}


