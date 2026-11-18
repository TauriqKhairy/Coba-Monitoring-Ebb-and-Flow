/**
 * Simulator Perangkat ESP32 Hidroponik Ebb and Flow
 * Menyimulasikan telemetri sensor dan merespons kontrol pompa
 * Jalankan: node scripts/mock-device.mjs
 */

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import fs from "fs";
import path from "path";

// Load .env manual tanpa dependensi eksternal
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const [key, ...rest] = trimmed.split("=");
          if (key && rest.length > 0) {
            process.env[key.trim()] = rest.join("=").trim();
          }
        }
      });
    }
  }
}

loadEnv();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
};

const deviceId = process.env.NEXT_PUBLIC_DEFAULT_DEVICE_ID || "esp32_hidroponik_01";

console.log(`=======================================================`);
console.log(`[ESP32 SIMULATOR] Memulai simulasi untuk ID: ${deviceId}`);
console.log(`Database URL: ${firebaseConfig.databaseURL}`);
console.log(`=======================================================`);

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (e) {
  console.log("[ESP32 SIMULATOR] Menggunakan mode standalone (local simulation).");
}

// State awal simulator
let systemState = {
  status: { online: true, lastSeen: Date.now() },
  reservoir: { ph: 6.2, tds: 860, waterTemp: 25.4, waterLevel: 85, updatedAt: Date.now() },
  tiers: {
    tier1: { mediaMoisture: 65, airTemp: 28.1, humidity: 72, trayWaterLevel: 5, updatedAt: Date.now() },
    tier2: { mediaMoisture: 58, airTemp: 28.4, humidity: 70, trayWaterLevel: 3, updatedAt: Date.now() },
    tier3: { mediaMoisture: 72, airTemp: 28.9, humidity: 68, trayWaterLevel: 8, updatedAt: Date.now() },
  },
  actuators: {
    tier1: { pumpState: false, lastChanged: Date.now() },
    tier2: { pumpState: false, lastChanged: Date.now() },
    tier3: { pumpState: false, lastChanged: Date.now() },
  },
  control: { mode: "auto", manual: { tier1: { pump: false }, tier2: { pump: false }, tier3: { pump: false } } },
};

// Mendengarkan perintah kendali jika Firebase aktif
if (db) {
  try {
    const controlRef = ref(db, `devices/${deviceId}/control`);
    onValue(controlRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        systemState.control = val;
        console.log(`[KONTROL DITERIMA] Mode: ${val.mode}`);
        if (val.mode === "manual" && val.manual) {
          Object.keys(val.manual).forEach((t) => {
            const pumpReq = val.manual[t]?.pump ?? false;
            systemState.actuators[t] = { pumpState: pumpReq, lastChanged: Date.now() };
          });
        }
      }
    });
  } catch (err) {
    console.log("[KONTROL] Listener offline/mock fallback.");
  }
}

// Siklus loop pengiriman sensor berkala (setiap 3 detik)
setInterval(async () => {
  const now = Date.now();
  systemState.status.lastSeen = now;
  systemState.reservoir.updatedAt = now;

  // Fluktuasi kecil pH dan TDS
  systemState.reservoir.ph = Number((6.1 + Math.random() * 0.3).toFixed(2));
  systemState.reservoir.tds = Math.round(850 + (Math.random() * 20 - 10));

  // Simulasi dinamika pasang-surut per tingkat
  ["tier1", "tier2", "tier3"].forEach((t) => {
    const isPumping = systemState.actuators[t]?.pumpState;
    const tierData = systemState.tiers[t];

    if (isPumping) {
      // Saat banjir (flood), kelembaban dan level tray naik
      tierData.mediaMoisture = Math.min(95, tierData.mediaMoisture + 4);
      tierData.trayWaterLevel = Math.min(25, tierData.trayWaterLevel + 3);
    } else {
      // Saat surut (drain), kelembaban turun perlahan dan air tuntas
      tierData.mediaMoisture = Math.max(35, tierData.mediaMoisture - 1);
      tierData.trayWaterLevel = Math.max(0, tierData.trayWaterLevel - 4);
    }
    tierData.updatedAt = now;
  });

  console.log(`[TELEMETRI] ${new Date().toLocaleTimeString("id-ID")} | Reservoir pH: ${systemState.reservoir.ph} | Tier 1: ${systemState.tiers.tier1.mediaMoisture}% (Pompa: ${systemState.actuators.tier1.pumpState ? "ON" : "OFF"})`);

  if (db) {
    try {
      await set(ref(db, `devices/${deviceId}/status`), systemState.status);
      await set(ref(db, `devices/${deviceId}/sensors/reservoir`), systemState.reservoir);
      await set(ref(db, `devices/${deviceId}/sensors/tiers`), systemState.tiers);
      await set(ref(db, `devices/${deviceId}/actuators`), systemState.actuators);
    } catch (e) {
      // Abaikan error jika Firebase belum terhubung internet
    }
  }
}, 3000);
