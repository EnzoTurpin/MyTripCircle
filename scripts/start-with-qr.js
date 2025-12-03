const { spawn } = require("child_process");

console.log("🚀 Démarrage du backend et Expo...");
console.log("─".repeat(50));

// Démarrer le serveur backend
const serverProcess = spawn("node", ["server/index.js"], {
  stdio: "inherit", // Afficher les logs du serveur
  detached: false,
});

// Attendre un peu que le serveur démarre
setTimeout(() => {
  console.log("📱 Lancement d'Expo avec QR code...");
  console.log("─".repeat(50));

  // Lancer Expo
  const expoProcess = spawn("npx", ["expo", "start", "--clear"], {
    stdio: "inherit",
    shell: true,
  });

  expoProcess.on("close", (code) => {
    console.log(`\n📱 Expo terminé avec le code: ${code}`);
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill();
    }
  });

  // Gérer l'arrêt propre
  process.on("SIGINT", () => {
    console.log("\n🛑 Arrêt en cours...");
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill();
    }
    if (expoProcess && !expoProcess.killed) {
      expoProcess.kill();
    }
    process.exit(0);
  });
}, 2000); // Attendre 2 secondes que le serveur démarre
