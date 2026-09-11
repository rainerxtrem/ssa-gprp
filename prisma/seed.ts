import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const MOT_DE_PASSE_DEMO = "SsaGprp2026!";

async function main() {
  const passwordHash = await hash(MOT_DE_PASSE_DEMO, 10);

  const medecinChef = await prisma.user.upsert({
    where: { email: "medecin.chef@ssa-gprp.fr" },
    update: {},
    create: {
      email: "medecin.chef@ssa-gprp.fr",
      nom: "Dupont",
      prenom: "Marie",
      grade: "Colonel",
      role: "MEDECIN_CHEF",
      passwordHash,
    },
  });

  await prisma.user.upsert({
    where: { email: "infirmier.major@ssa-gprp.fr" },
    update: {},
    create: {
      email: "infirmier.major@ssa-gprp.fr",
      nom: "Bernard",
      prenom: "Luc",
      grade: "Major",
      role: "INFIRMIER_MAJOR",
      passwordHash,
    },
  });

  await prisma.user.upsert({
    where: { email: "commandement@ssa-gprp.fr" },
    update: {},
    create: {
      email: "commandement@ssa-gprp.fr",
      nom: "Martin",
      prenom: "Sophie",
      grade: "Général",
      role: "COMMANDEMENT",
      passwordHash,
    },
  });

  const patient = await prisma.patient.upsert({
    where: { rio: "RIO-000001" },
    update: {},
    create: {
      rio: "RIO-000001",
      nom: "Petit",
      prenom: "Jean",
      ddn: new Date("1995-04-12"),
      grade: "Sergent",
      specialite: "GRIMP",
      unite: "1er Régiment de Marche",
    },
  });

  console.log("Seed terminé :");
  console.log(`  - ${medecinChef.email} / ${MOT_DE_PASSE_DEMO}`);
  console.log("  - infirmier.major@ssa-gprp.fr / " + MOT_DE_PASSE_DEMO);
  console.log("  - commandement@ssa-gprp.fr / " + MOT_DE_PASSE_DEMO);
  console.log(`  - Patient de démonstration : ${patient.nom} ${patient.prenom} (${patient.rio})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
