/**
 * Icône partagée pour app/icon.tsx, app/apple-icon.tsx et la route PWA
 * (/api/pwa-icon). Générée via next/og (Satori) — flexbox uniquement,
 * pas de dépendance à un fichier image externe.
 */
export function IconeApplication({ taille }: { taille: number }) {
  const epaisseurCroix = Math.round(taille * 0.16);
  const longueurCroix = Math.round(taille * 0.52);

  return (
    <div
      style={{
        width: taille,
        height: taille,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#047857",
        borderRadius: Math.round(taille * 0.18),
      }}
    >
      <div style={{ position: "relative", width: longueurCroix, height: longueurCroix, display: "flex" }}>
        <div
          style={{
            position: "absolute",
            top: (longueurCroix - epaisseurCroix) / 2,
            left: 0,
            width: longueurCroix,
            height: epaisseurCroix,
            background: "#ffffff",
            borderRadius: epaisseurCroix / 3,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: (longueurCroix - epaisseurCroix) / 2,
            top: 0,
            height: longueurCroix,
            width: epaisseurCroix,
            background: "#ffffff",
            borderRadius: epaisseurCroix / 3,
          }}
        />
      </div>
    </div>
  );
}
