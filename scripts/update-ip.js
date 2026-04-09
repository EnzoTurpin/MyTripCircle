// Script pour mettre à jour automatiquement l'IP dans la configuration
const os = require("node:os");
const fs = require("node:fs");
const path = require("node:path");

function findIPv4(ifaces) {
  for (const iface of ifaces) {
    if (iface.family === "IPv4" && !iface.internal) return iface.address;
  }
  return null;
}

function getCurrentIP() {
  const interfaces = os.networkInterfaces();
  const priorityInterfaces = ["Wi-Fi", "Ethernet", "en0", "eth0"];

  for (const name of priorityInterfaces) {
    if (interfaces[name]) {
      const ip = findIPv4(interfaces[name]);
      if (ip) return ip;
    }
  }

  // Fallback: première IP non-interne
  for (const name of Object.keys(interfaces)) {
    const ip = findIPv4(interfaces[name]);
    if (ip) return ip;
  }

  return "localhost";
}

function updateEnvFile() {
  const envPath = path.join(__dirname, "..", ".env");
  const apiTsPath = path.join(__dirname, "..", "src", "config", "api.ts");
  const currentIP = getCurrentIP();

  console.log(`[update-ip] Détection de l'IP actuelle: ${currentIP}`);

  // Mettre à jour .env
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

  // Mettre à jour api.ts
  if (fs.existsSync(apiTsPath)) {
    let apiContent = fs.readFileSync(apiTsPath, "utf8");

    // Mettre à jour la valeur par défaut dans api.ts
    const apiIpRegex =
      /const API_IP_PRIMARY = process\.env\.API_IP_PRIMARY \|\| ".*?";/;
    if (apiIpRegex.test(apiContent)) {
      apiContent = apiContent.replace(
        apiIpRegex,
        `const API_IP_PRIMARY = process.env.API_IP_PRIMARY || "${currentIP}";`
      );
      fs.writeFileSync(apiTsPath, apiContent);
      console.log(
        `[update-ip] ✅ IP mise à jour dans src/config/api.ts: ${currentIP}`
      );
    }
  } else {
    console.log("[update-ip] ⚠️ Fichier src/config/api.ts non trouvé");
  }
}

updateEnvFile();
