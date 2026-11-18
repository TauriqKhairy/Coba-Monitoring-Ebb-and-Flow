"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  Droplets,
  Radio,
  Activity,
  Layers,
  Power,
  Waves,
  Thermometer,
  Gauge,
  Sparkles,
  SlidersHorizontal,
  Settings,
  History,
  Bell,
  LogIn,
  ArrowUpRight,
  Download,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useRealtimeData } from "@/hooks/use-realtime-data";
import { ref, set } from "firebase/database";
import { db, DEFAULT_DEVICE_ID } from "@/lib/firebase";
import { ClientTimestamp } from "@/components/client-timestamp";
import { toast } from "sonner";

export function DashboardMultiStyle() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [template, setTemplate] = useState<"modern" | "retro" | "genz" | "90s">("modern");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Hook Firebase Realtime Data
  const { data: statusData } = useRealtimeData("status");
  const { data: sensorsData } = useRealtimeData("sensors");
  const { data: actuatorsData } = useRealtimeData("actuators");
  const { data: controlData } = useRealtimeData("control");

  // Fallback data stabil
  const isOnline = statusData?.online ?? true;
  const lastSeen = statusData?.lastSeen ?? 1731913200000;

  const reservoir = sensorsData?.reservoir || {
    ph: 6.2,
    tds: 850,
    waterTemp: 25.4,
    waterLevel: 82,
    updatedAt: 1731913200000,
  };

  const tiers = sensorsData?.tiers || {
    tier1: { mediaMoisture: 65, airTemp: 28.2, humidity: 72, trayWaterLevel: 15, updatedAt: 1731913200000 },
    tier2: { mediaMoisture: 58, airTemp: 28.5, humidity: 70, trayWaterLevel: 12, updatedAt: 1731913200000 },
    tier3: { mediaMoisture: 72, airTemp: 29.1, humidity: 68, trayWaterLevel: 20, updatedAt: 1731913200000 },
  };

  const pumps = actuatorsData || {
    tier1: { pumpState: false },
    tier2: { pumpState: true },
    tier3: { pumpState: false },
  };

  const mode = controlData?.mode || "auto";
  const isAuto = mode === "auto";

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle Mode Otomatis / Manual
  const handleToggleMode = async () => {
    const newMode = isAuto ? "manual" : "auto";
    try {
      if (db) {
        await set(ref(db, `devices/${DEFAULT_DEVICE_ID}/control/mode`), newMode);
      }
      toast.success(`Mode diubah ke ${newMode === "auto" ? "Otomatis (Adaptif)" : "Manual"}`);
    } catch (e: any) {
      toast.info(`Mode beralih ke ${newMode.toUpperCase()} (mode lokal).`);
    }
  };

  // Toggle Saklar Pompa
  const handleTogglePump = async (tier: "tier1" | "tier2" | "tier3") => {
    const currentState = pumps[tier]?.pumpState ?? false;
    const nextState = !currentState;
    try {
      if (db) {
        await set(ref(db, `devices/${DEFAULT_DEVICE_ID}/control/manual/${tier}/pump`), nextState);
        await set(ref(db, `devices/${DEFAULT_DEVICE_ID}/actuators/${tier}`), {
          pumpState: nextState,
          lastChanged: Date.now(),
        });
      }
      toast.success(`Pompa ${tier.toUpperCase()} ${nextState ? "Dinyalakan" : "Dimatikan"}`);
    } catch (e: any) {
      toast.info(`Pompa ${tier.toUpperCase()} ${nextState ? "ON" : "OFF"} (mode lokal).`);
    }
  };

  return (
    <div className="font-[family-name:var(--font-plus-jakarta)] min-h-screen">
      {/* Selector Gaya Tampilan (Modern, Retro, Gen-Z, 90s) & Navigasi Cepat */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center flex-wrap justify-center gap-1.5 md:gap-2 px-3 py-1.5 bg-black/60 dark:bg-black/80 backdrop-blur-md rounded-full border border-white/10 shadow-2xl">
        <span className="text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest px-2 hidden sm:inline">
          Style:
        </span>
        <button
          onClick={() => setTemplate("modern")}
          className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs font-semibold transition-all ${
            template === "modern"
              ? "bg-white text-black shadow-md scale-105"
              : "text-white/80 hover:text-white hover:bg-white/10"
          }`}
        >
          Modern
        </button>
        <button
          onClick={() => setTemplate("retro")}
          className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs font-semibold transition-all ${
            template === "retro"
              ? "bg-[#ccf381] text-black shadow-md scale-105 font-black"
              : "text-white/80 hover:text-white hover:bg-white/10"
          }`}
        >
          Retro
        </button>
        <button
          onClick={() => setTemplate("genz")}
          className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs font-semibold transition-all ${
            template === "genz"
              ? "bg-gradient-to-r from-[#ff6ec4] to-[#7873f5] text-white shadow-md scale-105"
              : "text-white/80 hover:text-white hover:bg-white/10"
          }`}
        >
          Gen Z
        </button>
        <button
          onClick={() => setTemplate("90s")}
          className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs font-semibold transition-all ${
            template === "90s"
              ? "bg-[#00ff00] text-black border border-black shadow-md scale-105 font-mono"
              : "text-white/80 hover:text-white hover:bg-white/10"
          }`}
        >
          90s
        </button>

        {/* Pemisah menu */}
        <span className="w-px h-4 bg-white/20 mx-1 hidden sm:inline" />

        <div className="flex items-center gap-1">
          <Link
            href="/kontrol"
            className="px-2.5 py-1 rounded-full text-[11px] font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            Kontrol
          </Link>
          <Link
            href="/pengaturan"
            className="px-2.5 py-1 rounded-full text-[11px] font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            Pengaturan
          </Link>
          <Link
            href="/riwayat"
            className="px-2.5 py-1 rounded-full text-[11px] font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            Riwayat
          </Link>
          <Link
            href="/notifikasi"
            className="px-2.5 py-1 rounded-full text-[11px] font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            Alert
          </Link>
        </div>
      </div>

      {/* Tombol Scroll To Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full transition-all shadow-xl hover:scale-110 bg-[#ccf381] text-black"
          aria-label="Scroll to top"
        >
          <ArrowUpRight className="w-5 h-5 -rotate-45" />
        </button>
      )}

      {/* ============================================================ */}
      {/* 1. STYLE: MODERN (Bento Grid Dark Neon dengan Space Grotesk) */}
      {/* ============================================================ */}
      {template === "modern" ? (
        <div className="min-h-screen bg-[#050505] text-white flex justify-center px-4 sm:px-6 lg:px-8 pt-18 pb-12 sm:pt-20 sm:pb-16">
          <div ref={contentRef} className="w-full max-w-[1240px] flex flex-col gap-6">
            {/* Header Modern */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 sm:py-5 border-b border-[#262626]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ccf381]/10 border border-[#ccf381]/30 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-[#ccf381] animate-pulse" />
                </div>
                <div>
                  <div className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl sm:text-2xl tracking-tight text-white flex items-center gap-2">
                    Hidroponik<span className="text-[#ccf381]">.EbbFlow</span>
                  </div>
                  <p className="text-xs text-[#a1a1aa] font-medium">
                    Rancang Bangun Irigasi Adaptif Bertingkat (ESP32)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 bg-[#121212] border border-[#262626] py-1.5 px-4 rounded-full text-xs font-semibold">
                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-[#ccf381] animate-ping" : "bg-rose-500"}`} />
                <span className="text-white">{isOnline ? "ESP32 Online" : "ESP32 Terputus"}</span>
                <span className="text-[#a1a1aa] border-l border-[#262626] pl-2">
                  Mode: <strong className="text-[#ccf381] uppercase">{mode}</strong>
                </span>
              </div>
            </header>

            {/* Bento Grid Utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-auto gap-4 sm:gap-6">
              {/* Card 1 (Hero Card Besar: Col-Span 2) */}
              <div className="md:col-span-2 bg-black rounded-[32px] p-6 sm:p-8 relative overflow-hidden flex flex-col justify-end min-h-[380px] border border-[#262626] transition-all hover:border-[#404040]">
                {/* Efek visual gradien fluid */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-cyan-950/20 to-black z-0 pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-sm sm:text-base text-[#ccf381] mb-2 font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#ccf381]" />
                    Sistem Pasang-Surut Cerdas
                  </div>
                  <div className="font-[family-name:var(--font-space-grotesk)] text-5xl sm:text-6xl lg:text-[76px] font-black leading-[0.9] tracking-tighter text-white">
                    3 Tingkat
                    <br />
                    <span className="text-[#ccf381]">Multi-Tier</span>
                  </div>
                  <div className="mt-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm font-medium opacity-90">
                      Durasi banjir (flood) & surut (drain) menyesuaikan kelembaban media tanam realtime, bukan jadwal tetap.
                    </p>
                    <button
                      onClick={handleToggleMode}
                      className="px-4 py-2 rounded-xl bg-[#ccf381] text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors shrink-0"
                    >
                      Mode: {mode.toUpperCase()}
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Kualitas Nutrisi Reservoir (Tandon Air) */}
              <div className="bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-6 sm:p-8 flex flex-col justify-between min-h-[380px] border border-[#262626] transition-all hover:border-[#404040]">
                <div>
                  <div className="text-xs sm:text-sm text-[#a1a1aa] uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-[#ccf381]" /> Kepekatan TDS
                  </div>
                  <div className="font-[family-name:var(--font-space-grotesk)] text-5xl sm:text-6xl font-black leading-none mb-1 bg-gradient-to-br from-[#ccf381] to-[#00d4ff] bg-clip-text text-transparent">
                    {reservoir.tds ?? 850}
                    <span className="text-xl text-[#a1a1aa] font-medium ml-1">PPM</span>
                  </div>
                  <span className="text-[11px] text-[#ccf381] font-semibold bg-[#ccf381]/10 px-2 py-0.5 rounded-full inline-block mt-1">
                    Batas Optimal: 800-1200 PPM
                  </span>
                </div>

                <div className="mt-6 pt-6 border-t border-[#262626] space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#a1a1aa] font-semibold uppercase">Derajat pH</span>
                    <span className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-white">
                      {reservoir.ph?.toFixed(1) ?? "6.2"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#a1a1aa] font-semibold uppercase">Suhu Air Tandon</span>
                    <span className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-[#00d4ff]">
                      {reservoir.waterTemp?.toFixed(1) ?? "25.4"}°C
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#a1a1aa] font-semibold uppercase">Level Volume Tandon</span>
                    <span className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-white">
                      {reservoir.waterLevel ?? "82"}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Persona / Status ESP32 */}
              <div className="bg-white text-black rounded-[32px] p-6 sm:p-8 flex flex-col justify-between min-h-[380px] border border-[#262626] transition-all hover:border-[#404040]">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    ESP32 Controller
                  </span>
                  <Radio className={`w-5 h-5 ${isOnline ? "text-emerald-600 animate-pulse" : "text-rose-600"}`} />
                </div>

                <div className="text-center flex-1 flex flex-col justify-center my-2">
                  <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Waves className="w-10 h-10 text-[#ccf381]" />
                  </div>
                  <div className="text-xs font-semibold uppercase opacity-60 tracking-wider">Metode Irigasi</div>
                  <div className="font-[family-name:var(--font-space-grotesk)] text-2xl sm:text-3xl font-black leading-tight tracking-tight mt-1 text-black">
                    Ebb & Flow
                    <br />
                    Adaptif
                  </div>
                </div>

                <div className="text-xs leading-relaxed font-semibold border-t border-black/10 pt-4 flex items-center justify-between">
                  <span className="text-black/60">Terakhir Update:</span>
                  <ClientTimestamp timestamp={reservoir.updatedAt} />
                </div>
              </div>

              {/* Card 4 (Col-Span 2: Status 3 Tingkat / Rak) */}
              <div className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-[#1a1a1a] to-[#121212] rounded-[32px] p-6 sm:p-8 border border-[#262626] transition-all hover:border-[#404040]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[#ccf381]" />
                      Kelembaban Media Per Tingkat
                    </h3>
                    <p className="text-xs text-[#a1a1aa] mt-0.5">Sensor Media Tanam, Suhu & Level Tray</p>
                  </div>
                  <span className="text-xs bg-[#262626] text-[#ccf381] px-3 py-1 rounded-full font-bold">
                    3 Rak Aktif
                  </span>
                </div>

                <div className="space-y-5">
                  {([
                    { id: "tier1", name: "Tingkat 1 (Bawah)", data: tiers.tier1, pump: pumps.tier1, color: "#ccf381" },
                    { id: "tier2", name: "Tingkat 2 (Tengah)", data: tiers.tier2, pump: pumps.tier2, color: "#00d4ff" },
                    { id: "tier3", name: "Tingkat 3 (Atas)", data: tiers.tier3, pump: pumps.tier3, color: "#ff0080" },
                  ] as const).map((t, idx) => {
                    const isPumping = t.pump?.pumpState ?? false;
                    return (
                      <div key={t.id} className="space-y-1.5 p-3 rounded-2xl bg-[#0e0e0e] border border-[#262626]">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: t.color }}
                            />
                            {t.name}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-[#a1a1aa] text-[11px]">
                              Suhu: {t.data?.airTemp?.toFixed(1) ?? 28}°C | Tray: {t.data?.trayWaterLevel ?? 10} cm
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isPumping ? "bg-[#ccf381] text-black" : "bg-[#262626] text-white/60"
                              }`}
                            >
                              {isPumping ? "POMPA ON" : "POMPA OFF"}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar Kelembaban */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-3 bg-[#262626] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${Math.min(100, Math.max(0, t.data?.mediaMoisture ?? 0))}%`,
                                backgroundColor: t.color,
                              }}
                            />
                          </div>
                          <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-white w-10 text-right">
                            {t.data?.mediaMoisture ?? 0}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 5 (Col-Span 2: Kontrol Cepat Pompa Per Rak) */}
              <div className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-[#1a1a1a] to-[#121212] rounded-[32px] p-6 sm:p-8 border border-[#262626] transition-all hover:border-[#404040] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5 text-[#00d4ff]" />
                      Saklar Kendali Pompa Utama
                    </h3>
                    <span className="text-xs text-[#a1a1aa] uppercase font-semibold">
                      {isAuto ? "Mode: Otomatis" : "Mode: Manual Aktif"}
                    </span>
                  </div>
                  <p className="text-xs text-[#a1a1aa] mb-4">
                    {isAuto
                      ? "Irigasi berjalan adaptif oleh mikrokontroler ESP32. Beralih ke Manual untuk mengontrol saklar langsung."
                      : "Klik tombol di bawah untuk menyalakan atau mematikan pompa masing-masing tingkat secara manual."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
                  {(["tier1", "tier2", "tier3"] as const).map((tierId, idx) => {
                    const pumpActive = pumps[tierId]?.pumpState ?? false;
                    return (
                      <button
                        key={tierId}
                        onClick={() => handleTogglePump(tierId)}
                        disabled={isAuto}
                        className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-wider ${
                          pumpActive
                            ? "bg-[#ccf381] text-black shadow-lg shadow-[#ccf381]/20 scale-102"
                            : "bg-[#262626] text-white/80 hover:bg-[#333333]"
                        } ${isAuto ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <Power className={`w-5 h-5 ${pumpActive ? "text-black" : "text-white/40"}`} />
                        <span>Rak #{idx + 1}</span>
                        <span className="text-[10px] font-mono">{pumpActive ? "AKTIF (ON)" : "MATI (OFF)"}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-[#262626] flex items-center justify-between text-xs text-[#a1a1aa]">
                  <span>Status Aktuator: Relay ESP32 Terhubung</span>
                  <Link href="/kontrol" className="text-[#ccf381] hover:underline font-semibold flex items-center gap-1">
                    Buka Halaman Kontrol Penuh <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 6: Banner Aksi & Link Cepat (Col-Span 4) */}
              <div className="md:col-span-2 lg:col-span-4 bg-gradient-to-r from-emerald-950/60 via-[#121212] to-cyan-950/60 rounded-[32px] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-[#262626]">
                <div>
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl sm:text-2xl font-bold text-white mb-1">
                    Kelola Pengaturan & Analisis Riwayat
                  </h3>
                  <p className="text-xs sm:text-sm text-[#a1a1aa]">
                    Atur ambang batas kelembaban, durasi pasang surut, pantau grafik deret waktu, dan ekspor berkas CSV.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <Link
                    href="/pengaturan"
                    className="px-5 py-2.5 rounded-full bg-[#262626] text-white hover:bg-white hover:text-black font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Pengaturan Adaptif
                  </Link>
                  <Link
                    href="/riwayat"
                    className="px-5 py-2.5 rounded-full bg-[#ccf381] text-black hover:bg-white font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Riwayat & Grafik CSV
                  </Link>
                  <Link
                    href="/notifikasi"
                    className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-[#00d4ff] font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Pusat Notifikasi
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : template === "retro" ? (
        /* ============================================================ */
        /* 2. STYLE: RETRO (Neobrutalism Black & White Chunky Borders)   */
        /* ============================================================ */
        <div className="min-h-screen bg-white text-black flex justify-center px-4 sm:px-6 lg:px-8 pt-18 pb-12 sm:pt-20 sm:pb-16">
          <div ref={contentRef} className="w-full max-w-[1240px] flex flex-col gap-6">
            <header className="flex justify-between items-center py-4 border-b-4 border-black pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border-4 border-black bg-[#ccf381] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Droplets className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase tracking-tight">
                    HIDROPONIK EBB & FLOW [RETRO]
                  </h1>
                  <p className="text-xs font-bold uppercase">Sistem Irigasi Pasang-Surut 3 Tingkat</p>
                </div>
              </div>

              <div className="border-4 border-black bg-white px-4 py-1.5 font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                ESP32: {isOnline ? "ONLINE" : "OFFLINE"} | MODE: {mode.toUpperCase()}
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Retro Hero */}
              <div className="md:col-span-2 border-4 border-black bg-[#ccf381] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-[320px]">
                <div>
                  <span className="border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase">
                    KONTROL ADAPTIF
                  </span>
                  <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-6xl font-black mt-3 leading-none">
                    EBB & FLOW BERTINGKAT
                  </h2>
                </div>
                <div className="border-4 border-black bg-white p-4 font-bold text-xs uppercase flex justify-between items-center">
                  <span>Waktu banjir & surut menyesuaikan kelembaban tanah.</span>
                  <button
                    onClick={handleToggleMode}
                    className="border-2 border-black bg-black text-white px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ccf381] hover:text-black"
                  >
                    TOGGLE: {mode.toUpperCase()}
                  </button>
                </div>
              </div>

              {/* Retro Reservoir */}
              <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div>
                  <span className="border-2 border-black bg-black text-white px-3 py-1 text-xs font-black uppercase">
                    TANDON NUTRISI
                  </span>
                  <div className="font-[family-name:var(--font-space-grotesk)] text-5xl font-black mt-4">
                    {reservoir.tds ?? 850} <span className="text-sm font-bold">PPM</span>
                  </div>
                </div>
                <div className="border-t-2 border-black pt-3 space-y-1 font-bold text-xs uppercase">
                  <div className="flex justify-between">
                    <span>pH Larutan:</span>
                    <span>{reservoir.ph?.toFixed(1) ?? 6.2}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Suhu Air:</span>
                    <span>{reservoir.waterTemp?.toFixed(1) ?? 25}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume Air:</span>
                    <span>{reservoir.waterLevel ?? 82}%</span>
                  </div>
                </div>
              </div>

              {/* Retro Quick Actuator */}
              <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div>
                  <span className="border-2 border-black bg-black text-white px-3 py-1 text-xs font-black uppercase">
                    SAKLAR POMPA
                  </span>
                  <div className="space-y-2 mt-4">
                    {(["tier1", "tier2", "tier3"] as const).map((t, idx) => {
                      const active = pumps[t]?.pumpState ?? false;
                      return (
                        <button
                          key={t}
                          onClick={() => handleTogglePump(t)}
                          disabled={isAuto}
                          className={`w-full py-2 px-3 border-2 border-black font-black text-xs uppercase flex justify-between items-center ${
                            active ? "bg-[#ccf381]" : "bg-white"
                          }`}
                        >
                          <span>RAK #{idx + 1}</span>
                          <span>{active ? "ON" : "OFF"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase mt-2">
                  {isAuto ? "* Mode otomatis aktif" : "* Mode manual diaktifkan"}
                </p>
              </div>

              {/* Retro 3 Tiers Progress */}
              <div className="md:col-span-4 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-black uppercase">
                  STATUS KELEMBABAN 3 TINGKAT RAK
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {([
                    { id: "tier1", name: "Tingkat 1 (Bawah)", data: tiers.tier1 },
                    { id: "tier2", name: "Tingkat 2 (Tengah)", data: tiers.tier2 },
                    { id: "tier3", name: "Tingkat 3 (Atas)", data: tiers.tier3 },
                  ] as const).map((t, i) => (
                    <div key={t.id} className="border-2 border-black p-4 bg-slate-50">
                      <div className="flex justify-between font-black text-xs uppercase">
                        <span>{t.name}</span>
                        <span>{t.data?.mediaMoisture ?? 60}%</span>
                      </div>
                      <div className="w-full h-4 border-2 border-black bg-white mt-2">
                        <div
                          className="h-full bg-black"
                          style={{ width: `${t.data?.mediaMoisture ?? 60}%` }}
                        />
                      </div>
                      <div className="text-[10px] font-bold uppercase mt-2 flex justify-between">
                        <span>Suhu: {t.data?.airTemp ?? 28}°C</span>
                        <span>Tray: {t.data?.trayWaterLevel ?? 10} cm</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : template === "genz" ? (
        /* ============================================================ */
        /* 3. STYLE: GEN-Z (Vibrant Neon Pink/Purple Cyber Gradient)    */
        /* ============================================================ */
        <div className="min-h-screen bg-gradient-to-br from-[#ff6ec4] via-[#7873f5] to-[#4facfe] text-white flex justify-center px-4 sm:px-6 lg:px-8 pt-18 pb-12 sm:pt-20 sm:pb-16">
          <div ref={contentRef} className="w-full max-w-[1240px] flex flex-col gap-6">
            <header className="flex justify-between items-center py-4 border-b border-white/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                  <Droplets className="w-6 h-6 text-white animate-bounce" />
                </div>
                <div>
                  <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black tracking-tight">
                    EbbFlow ✨ Adaptif
                  </h1>
                  <p className="text-xs text-white/80 font-medium">Smart Multi-Tier Hydroponics Controller</p>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                ESP32: {isOnline ? "🟢 ONLINE" : "🔴 OFFLINE"} | MODE: {mode.toUpperCase()}
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Gen-Z Hero */}
              <div className="md:col-span-2 bg-white/10 backdrop-blur-xl border border-white/30 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between min-h-[340px] shadow-2xl">
                <div>
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Adaptive Flow
                  </span>
                  <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-6xl font-black mt-3 leading-tight">
                    Automated
                    <br />
                    Hydroponics 🌿
                  </h2>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center mt-4">
                  <span className="text-xs font-medium">Banjir-surut otomatis membaca kadar air tanah.</span>
                  <button
                    onClick={handleToggleMode}
                    className="px-4 py-2 rounded-xl bg-white text-[#7873f5] font-black text-xs uppercase shadow-md hover:scale-105 transition-transform"
                  >
                    MODE: {mode.toUpperCase()}
                  </button>
                </div>
              </div>

              {/* Gen-Z Reservoir */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-[32px] p-6 flex flex-col justify-between shadow-2xl">
                <div>
                  <span className="text-xs uppercase font-bold text-white/80">TDS PPM</span>
                  <div className="font-[family-name:var(--font-space-grotesk)] text-5xl font-black mt-2">
                    {reservoir.tds ?? 850}
                  </div>
                  <span className="text-xs text-white/90 bg-white/20 px-2 py-0.5 rounded-full inline-block mt-1">
                    pH: {reservoir.ph?.toFixed(1) ?? 6.2}
                  </span>
                </div>
                <div className="space-y-1.5 border-t border-white/20 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span>Suhu Air:</span>
                    <span className="font-bold">{reservoir.waterTemp ?? 25}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level Tandon:</span>
                    <span className="font-bold">{reservoir.waterLevel ?? 82}%</span>
                  </div>
                </div>
              </div>

              {/* Gen-Z Actuators */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-[32px] p-6 flex flex-col justify-between shadow-2xl">
                <div>
                  <span className="text-xs uppercase font-bold text-white/80">Pompa Tray</span>
                  <div className="space-y-2 mt-3">
                    {(["tier1", "tier2", "tier3"] as const).map((t, i) => {
                      const active = pumps[t]?.pumpState ?? false;
                      return (
                        <button
                          key={t}
                          onClick={() => handleTogglePump(t)}
                          disabled={isAuto}
                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs uppercase flex justify-between items-center transition-all ${
                            active ? "bg-white text-[#ff6ec4] shadow-lg" : "bg-white/20 text-white"
                          }`}
                        >
                          <span>Rak #{i + 1}</span>
                          <span>{active ? "ON" : "OFF"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <span className="text-[10px] text-white/70 text-center mt-2">
                  {isAuto ? "Mode otomatis terkunci" : "Mode manual bebas"}
                </span>
              </div>

              {/* Gen-Z 3 Tiers */}
              <div className="md:col-span-4 bg-white/10 backdrop-blur-xl border border-white/30 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-4">
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold">
                  Kondisi 3 Tingkat Rak Bertingkat
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {([
                    { id: "tier1", name: "Tingkat 1 (Bawah)", data: tiers.tier1 },
                    { id: "tier2", name: "Tingkat 2 (Tengah)", data: tiers.tier2 },
                    { id: "tier3", name: "Tingkat 3 (Atas)", data: tiers.tier3 },
                  ] as const).map((t) => (
                    <div key={t.id} className="p-4 rounded-2xl bg-white/10 border border-white/20">
                      <div className="flex justify-between text-xs font-bold">
                        <span>{t.name}</span>
                        <span>{t.data?.mediaMoisture ?? 60}%</span>
                      </div>
                      <div className="w-full h-3 bg-white/20 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all"
                          style={{ width: `${t.data?.mediaMoisture ?? 60}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-white/80 mt-2">
                        <span>Suhu: {t.data?.airTemp ?? 28}°C</span>
                        <span>Tray: {t.data?.trayWaterLevel ?? 10} cm</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* 4. STYLE: 90s (Y2K Neon Green & Magenta Pixel Chunky Vibe)   */
        /* ============================================================ */
        <div className="min-h-screen bg-[#000080] text-[#00ff00] font-mono flex justify-center px-4 sm:px-6 lg:px-8 pt-18 pb-12 sm:pt-20 sm:pb-16">
          <div ref={contentRef} className="w-full max-w-[1240px] flex flex-col gap-6">
            <header className="border-4 border-[#00ff00] bg-black p-4 flex justify-between items-center shadow-[6px_6px_0px_0px_#00ff00]">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌱</span>
                <span className="text-xl font-black text-[#00ff00]">EBB_FLOW_90s.EXE</span>
              </div>
              <span className="bg-[#00ff00] text-black px-3 py-1 font-bold text-xs">
                STATUS: {isOnline ? "ONLINE" : "OFFLINE"} | MODE: {mode.toUpperCase()}
              </span>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 90s Hero */}
              <div className="md:col-span-2 border-4 border-[#ff00ff] bg-black p-6 shadow-[6px_6px_0px_0px_#ff00ff] flex flex-col justify-between min-h-[300px]">
                <div>
                  <span className="bg-[#ff00ff] text-black px-2 py-0.5 text-xs font-bold">
                    ADAPTIVE_IRRIGATION.SYS
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black text-[#00ff00] mt-3">
                    HIDROPONIK 3-TIER
                  </h2>
                </div>
                <div className="border-2 border-[#00ff00] p-3 text-xs text-white flex justify-between items-center">
                  <span>ESP32 SENSOR FEEDBACK ACTIVE</span>
                  <button
                    onClick={handleToggleMode}
                    className="bg-[#00ff00] text-black font-bold px-3 py-1 text-xs hover:bg-[#ff00ff] hover:text-white"
                  >
                    MODE: {mode.toUpperCase()}
                  </button>
                </div>
              </div>

              {/* 90s Reservoir */}
              <div className="border-4 border-[#ffff00] bg-black p-6 shadow-[6px_6px_0px_0px_#ffff00] flex flex-col justify-between">
                <div>
                  <span className="bg-[#ffff00] text-black px-2 py-0.5 text-xs font-bold">RESERVOIR</span>
                  <div className="text-4xl font-black text-[#ffff00] mt-3">
                    {reservoir.tds ?? 850} PPM
                  </div>
                  <div className="text-sm text-[#00ff00] mt-1">pH: {reservoir.ph?.toFixed(1) ?? 6.2}</div>
                </div>
                <div className="border-t border-[#ffff00] pt-2 text-xs text-white space-y-1">
                  <div>TEMP: {reservoir.waterTemp ?? 25}°C</div>
                  <div>LEVEL: {reservoir.waterLevel ?? 82}%</div>
                </div>
              </div>

              {/* 90s Pumps */}
              <div className="border-4 border-[#00ffff] bg-black p-6 shadow-[6px_6px_0px_0px_#00ffff] flex flex-col justify-between">
                <div>
                  <span className="bg-[#00ffff] text-black px-2 py-0.5 text-xs font-bold">RELAY_PUMPS</span>
                  <div className="space-y-2 mt-3">
                    {(["tier1", "tier2", "tier3"] as const).map((t, i) => {
                      const active = pumps[t]?.pumpState ?? false;
                      return (
                        <button
                          key={t}
                          onClick={() => handleTogglePump(t)}
                          disabled={isAuto}
                          className={`w-full py-1.5 px-2 border-2 text-xs font-bold flex justify-between ${
                            active
                              ? "border-[#00ff00] bg-[#00ff00] text-black"
                              : "border-[#00ffff] text-[#00ffff]"
                          }`}
                        >
                          <span>PUMP_0{i + 1}</span>
                          <span>{active ? "[ON]" : "[OFF]"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="text-[10px] text-white/70 mt-2">
                  {isAuto ? "* LOCKED TO AUTO" : "* MANUAL MODE ACTIVE"}
                </div>
              </div>

              {/* 90s Multi-Tier Progress */}
              <div className="md:col-span-4 border-4 border-[#00ff00] bg-black p-6 shadow-[6px_6px_0px_0px_#00ff00] space-y-3">
                <div className="text-sm font-bold text-[#00ff00] uppercase">
                  &gt; MULTI-TIER TRAY MOISTURE STATUS [1, 2, 3]
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {([
                    { id: "tier1", name: "TIER_01 (BOTTOM)", data: tiers.tier1 },
                    { id: "tier2", name: "TIER_02 (MIDDLE)", data: tiers.tier2 },
                    { id: "tier3", name: "TIER_03 (TOP)", data: tiers.tier3 },
                  ] as const).map((t) => (
                    <div key={t.id} className="border-2 border-[#00ff00] p-3">
                      <div className="flex justify-between text-xs">
                        <span>{t.name}</span>
                        <span>{t.data?.mediaMoisture ?? 60}%</span>
                      </div>
                      <div className="w-full h-4 border border-[#00ff00] mt-2 p-0.5">
                        <div
                          className="h-full bg-[#00ff00]"
                          style={{ width: `${t.data?.mediaMoisture ?? 60}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-white/70 mt-1">
                        <span>T: {t.data?.airTemp ?? 28}°C</span>
                        <span>LVL: {t.data?.trayWaterLevel ?? 10} cm</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
