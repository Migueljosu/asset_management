const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  // ============================================================
  // 1. USUÁRIOS (Admin, Técnico, Funcionário)
  // ============================================================
  const hashedPassword = await bcrypt.hash("12345678", 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@asset.com" },
      update: {},
      create: {
        nome: "Administrador",
        email: "admin@asset.com",
        senha: hashedPassword,
        perfil: "admin",
      },
    }),
    prisma.user.upsert({
      where: { email: "tecnico@asset.com" },
      update: {},
      create: {
        nome: "Técnico Silva",
        email: "tecnico@asset.com",
        senha: hashedPassword,
        perfil: "tecnico",
      },
    }),
    prisma.user.upsert({
      where: { email: "funcionario@asset.com" },
      update: {},
      create: {
        nome: "Funcionário Santos",
        email: "funcionario@asset.com",
        senha: hashedPassword,
        perfil: "funcionario",
      },
    }),
  ]);

  console.log(`✅ ${users.length} usuários criados`);
  users.forEach((u) => console.log(`   - ${u.nome} (${u.perfil}) → ${u.email}`));

  // ============================================================
  // 2. SETORES (10+)
  // ============================================================
  const setoresData = [
    "TI e Infraestrutura",
    "Recursos Humanos",
    "Financeiro",
    "Marketing",
    "Operações",
    "Jurídico",
    "Logística",
    "Qualidade",
    "Pesquisa e Desenvolvimento",
    "Atendimento ao Cliente",
    "Produção",
    "Vendas",
  ];

  const setores = [];
  for (const nome of setoresData) {
    const s = await prisma.sector.upsert({
      where: { id: setores.length + 1 },
      update: {},
      create: { nome },
    });
    setores.push(s);
  }

  console.log(`✅ ${setores.length} setores criados`);

  // ============================================================
  // 3. EQUIPAMENTOS (20+)
  // ============================================================
  const equipamentosData = [
    { nome: "Laptop Dell Latitude 5520", codigo: "EQ-LAP-001", estado: "disponivel" },
    { nome: "Laptop HP ProBook 450", codigo: "EQ-LAP-002", estado: "disponivel" },
    { nome: "Laptop Lenovo ThinkPad T14", codigo: "EQ-LAP-003", estado: "em_uso" },
    { nome: "Desktop Dell OptiPlex 7090", codigo: "EQ-DES-001", estado: "disponivel" },
    { nome: "Desktop HP EliteDesk 800", codigo: "EQ-DES-002", estado: "manutencao" },
    { nome: "Monitor Dell 27\" 4K", codigo: "EQ-MON-001", estado: "disponivel" },
    { nome: "Monitor LG 32\" UltraWide", codigo: "EQ-MON-002", estado: "em_uso" },
    { nome: "Monitor Samsung 24\" Curvo", codigo: "EQ-MON-003", estado: "disponivel" },
    { nome: "Impressora HP LaserJet Pro", codigo: "EQ-IMP-001", estado: "disponivel" },
    { nome: "Impressora Epson EcoTank", codigo: "EQ-IMP-002", estado: "manutencao" },
    { nome: "Projetor Epson EB-X51", codigo: "EQ-PRO-001", estado: "disponivel" },
    { nome: "Projetor BenQ MX560", codigo: "EQ-PRO-002", estado: "em_uso" },
    { nome: "Scanner Fujitsu ScanSnap", codigo: "EQ-SCA-001", estado: "disponivel" },
    { nome: "Servidor Dell PowerEdge R750", codigo: "EQ-SRV-001", estado: "em_uso" },
    { nome: "Servidor HPE ProLiant DL380", codigo: "EQ-SRV-002", estado: "disponivel" },
    { nome: "Switch Cisco Catalyst 2960", codigo: "EQ-RED-001", estado: "em_uso" },
    { nome: "Access Point Ubiquiti U6-Pro", codigo: "EQ-RED-002", estado: "disponivel" },
    { nome: "Nobreak APC 3000VA", codigo: "EQ-NOB-001", estado: "disponivel" },
    { nome: "Nobreak Eaton 5PX 1500VA", codigo: "EQ-NOB-002", estado: "manutencao" },
    { nome: "Tablet iPad Pro 12.9\"", codigo: "EQ-TAB-001", estado: "disponivel" },
    { nome: "Tablet Samsung Galaxy Tab S9", codigo: "EQ-TAB-002", estado: "em_uso" },
    { nome: "Câmera Logitech Brio 4K", codigo: "EQ-CAM-001", estado: "disponivel" },
    { nome: "Headset Jabra Evolve2 65", codigo: "EQ-HEA-001", estado: "disponivel" },
    { nome: "Headset Plantronics Voyager", codigo: "EQ-HEA-002", estado: "em_uso" },
    { nome: "Roteador MikroTik RB2011", codigo: "EQ-ROT-001", estado: "inativo" },
  ];

  const equipamentos = [];
  for (const eq of equipamentosData) {
    const e = await prisma.equipment.upsert({
      where: { codigo: eq.codigo },
      update: {},
      create: eq,
    });
    equipamentos.push(e);
  }

  console.log(`✅ ${equipamentos.length} equipamentos criados`);

  // Resumo por estado
  const estados = {};
  for (const e of equipamentos) {
    estados[e.estado] = (estados[e.estado] || 0) + 1;
  }
  for (const [estado, count] of Object.entries(estados)) {
    console.log(`   - ${estado}: ${count}`);
  }

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\nCredenciais de acesso:");
  console.log("  Admin:      admin@asset.com     / 12345678");
  console.log("  Técnico:    tecnico@asset.com   / 12345678");
  console.log("  Funcionário: funcionario@asset.com / 12345678");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
