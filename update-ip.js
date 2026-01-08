// Script pour mettre à jour automatiquement l'IP dans la configuration
const os = require("os");
const fs = require("fs");
const path = require("path");

function getCurrentIP() {
  const interfaces = os.networkInterfaces();
  const priorityInterfaces = ["Wi-Fi", "Ethernet", "en0", "eth0"];

  for (const interfaceName of priorityInterfaces) {
    if (interfaces[interfaceName]) {
      for (const iface of interfaces[interfaceName]) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
  }

  // Fallback: première IP non-internale
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }

  return "localhost";
}

function updateEnvFile() {
  const envPath = path.join(__dirname, ".env");
  const currentIP = getCurrentIP();

  console.log(`[update-ip] Détection de l'IP actuelle: ${currentIP}`);

  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");

    // Mettre à jour API_IP_PRIMARY
    const ipRegex = /^API_IP_PRIMARY=.*$/m;
    if (ipRegex.test(envContent)) {
      envContent = envContent.replace(ipRegex, `API_IP_PRIMARY=${currentIP}`);
    } else {
      envContent += `\nAPI_IP_PRIMARY=${currentIP}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`[update-ip] ✅ IP mise à jour dans .env: ${currentIP}`);
  } else {
    console.log("[update-ip] ⚠️ Fichier .env non trouvé");
  }
}

updateEnvFile();
