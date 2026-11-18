"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  Power,
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRealtimeData } from "@/hooks/use-realtime-data";
import { ref, set } from "firebase/database";
import { db, DEFAULT_DEVICE_ID } from "@/lib/firebase";
import { toast } from "sonner";

export default function KontrolPage() {
  const { data: controlData } = useRealtimeData("control");
  const { data: actuatorsData } = useRealtimeData("actuators");

  const [localMode, setLocalMode] = useState<"auto" | "manual">("auto");
  const [localPumps, setLocalPumps] = useState({
    tier1: false,
    tier2: true,
    tier3: false,
  });

  const mode = controlData?.mode || localMode;
  const isAuto = mode === "auto";

  const handleModeToggle = async (checked: boolean) => {
    const newMode = checked ? "auto" : "manual";
    setLocalMode(newMode);
    try {
      if (db) {
        await set(ref(db, `devices/${DEFAULT_DEVICE_ID}/control/mode`), newMode);
      }
      toast.success(`Mode irigasi berhasil diubah ke ${newMode === "auto" ? "Otomatis (Adaptif)" : "Manual"}`);
    } catch (err: any) {
      toast.error("Gagal memperbarui mode di Firebase: " + err.message);
    }
  };

  const handlePumpToggle = async (tier: "tier1" | "tier2" | "tier3", state: boolean) => {
    setLocalPumps((prev) => ({ ...prev, [tier]: state }));
    try {
      if (db) {
        await set(ref(db, `devices/${DEFAULT_DEVICE_ID}/control/manual/${tier}/pump`), state);
        await set(ref(db, `devices/${DEFAULT_DEVICE_ID}/actuators/${tier}`), {
          pumpState: state,
          lastChanged: Date.now(),
        });
      }
      toast.success(`Pompa ${tier.toUpperCase()} ${state ? "dinyalakan" : "dimatikan"}`);
    } catch (err: any) {
      toast.error("Gagal mengubah status pompa: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
          <SlidersHorizontal className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          Pengendalian Pompa & Mode Irigasi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pilih mode irigasi cerdas otomatis atau kontrol manual saklar pompa per tingkat tray
        </p>
      </div>

      {/* Card Mode Control */}
      <Card className="border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Mode Pengendalian Sistem
              </CardTitle>
              <CardDescription>
                {isAuto
                  ? "Sistem Adaptif Aktif: Waktu banjir (flood) dan surut (drain) dihitung otomatis oleh ESP32 berdasarkan sensor."
                  : "Mode Manual Aktif: Anda memiliki kontrol penuh saklar ON/OFF tiap pompa."}
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${!isAuto ? "text-emerald-600" : "text-muted-foreground"}`}>
                Manual
              </span>
              <Switch checked={isAuto} onCheckedChange={handleModeToggle} />
              <span className={`text-sm font-semibold ${isAuto ? "text-emerald-600" : "text-muted-foreground"}`}>
                Otomatis (Adaptif)
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grid Pompa per Tingkat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {([
          { id: "tier1", name: "Tingkat 1 (Bawah)", desc: "Pompa Utama Tray 1" },
          { id: "tier2", name: "Tingkat 2 (Tengah)", desc: "Pompa Utama Tray 2" },
          { id: "tier3", name: "Tingkat 3 (Atas)", desc: "Pompa Utama Tray 3" },
        ] as const).map((tier, idx) => {
          const pumpState = actuatorsData?.[tier.id]?.pumpState ?? localPumps[tier.id];
          return (
            <Card key={tier.id} className="relative overflow-hidden border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center text-sm">
                    {idx + 1}
                  </div>
                  <Badge variant={pumpState ? "default" : "secondary"} className={pumpState ? "bg-emerald-600" : ""}>
                    {pumpState ? "Status: AKTIF" : "Status: MATI"}
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">{tier.name}</CardTitle>
                <CardDescription className="text-xs">{tier.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kontrol:</span>
                    <span className="font-semibold">{isAuto ? "Terkunci (Auto)" : "Manual Tersedia"}</span>
                  </div>
                </div>

                <Button
                  disabled={isAuto}
                  variant={pumpState ? "destructive" : "default"}
                  className={`w-full py-5 text-sm font-bold gap-2 ${
                    !pumpState && !isAuto ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                  }`}
                  onClick={() => handlePumpToggle(tier.id, !pumpState)}
                >
                  <Power className="w-4 h-4" />
                  {pumpState ? "Matikan Pompa" : "Nyalakan Pompa"}
                </Button>

                {isAuto && (
                  <p className="text-[11px] text-center text-muted-foreground">
                    Ubah ke mode Manual untuk mengaktifkan saklar
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
