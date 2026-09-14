import QRCode from "qrcode";

/** URL de base publique de l'application, utilisée pour les liens de vérification. */
export function urlBase(): string {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

/**
 * Génère un QR code PNG pointant vers la page du document dans l'application.
 * Le lien ne fonctionne que pour un utilisateur authentifié et habilité
 * (mêmes règles d'accès que le reste de l'application) — le QR code ne
 * contourne jamais le secret médical.
 */
export async function genererQrCodePng(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, { type: "png", width: 160, margin: 1, color: { dark: "#0f172a", light: "#ffffff" } });
}
