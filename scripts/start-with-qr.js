const { spawn } = require("child_process");

console.log("📱 Lancement d'Expo avec QR code (API sur VPS)...");
console.log("─".repeat(50));
console.log("\n💡 Astuce: Scannez le QR code directement avec l'application Expo Go");
console.log("   L'application s'ouvrira automatiquement!\n");

// Lancer Expo (le serveur tourne sur le VPS, pas en local)
const expoProcess = spawn("npx", ["expo", "start", "--clear"], { // NOSONAR — script de développement local uniquement
  stdio: "inherit",
  shell: true,
});

expoProcess.on("close", (code) => {
  console.log(`\n📱 Expo terminé avec le code: ${code}`);
});

// Gérer l'arrêt propre
process.on("SIGINT", () => {
  console.log("\n🛑 Arrêt en cours...");
  if (expoProcess && !expoProcess.killed) {
    expoProcess.kill();
  }
  process.exit(0);
});
