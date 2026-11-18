"use client";

import React, { useState } from "react";
import { Settings, Save, AlertCircle, ShieldAlert, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRealtimeData } from "@/hooks/use-realtime-data";
import { ref, set } from "firebase/database";
import { db, DEFAULT_DEVICE_ID } from "@/lib/firebase";
import { toast } from "sonner";

export default function PengaturanPage() {
  const { data: settingsData } = useRealtimeData("settings");

  // State pengaturan adaptif
  const [adaptive, setAdaptive] = useState({
    tier1: { moistureMin: 40, moistureMax: 70, floodDurationMin: 5, floodDurationMax: 15, drainIntervalMin: 60, drainIntervalMax: 180 },
    tier2: { moistureMin: 40, moistureMax: 70, floodDurationMin: 5, floodDurationMax: 15, drainIntervalMin: 60, drainIntervalMax: 180 },
    tier3: { moistureMin: 40, moistureMax: 70, floodDurationMin: 5, floodDurationMax: 15, drainIntervalMin: 60, drainIntervalMax: 180 },
  });

  // State ambang batas alert
  const [alerts, setAlerts] = useState({
    phMin: 5.5,
    phMax: 6.8,
    tdsMin: 600,
    tdsMax: 1400,
    reservoirLevelMin: 30,
  });

  const handleSaveAdaptive = async (tierId: "tier1" | "tier2" | "tier3") => {
    const config = adaptive[tierId];
    if (config.moistureMin >= config.moistureMax) {
      toast.error("Validasi gagal: Kelembaban minimum harus lebih kecil dari maksimum!");
      return;
    }
    if (config.floodDurationMin >= config.floodDurationMax) {
      toast.error("Validasi gagal: Durasi flood minimum harus lebih kecil dari maksimum!");
      return;
    }
    if (config.drainIntervalMin >= config.drainIntervalMax) {
      toast.error("Validasi gagal: Interval drain minimum harus lebih kecil dari maksimum!");
      return;
    }

    try {
      if (db) {
        await set(ref(db, `devices/${DEFAULT_DEVICE_ID}/settings/adaptive/${tierId}`), config);
      }
      toast.success(`Pengaturan adaptif ${tierId.toUpperCase()} berhasil disimpan!`);
    } catch (err: any) {
      toast.error("Gagal menyimpan ke Firebase: " + err.message);
    }
  };

  const handleSaveAlerts = async () => {
    if (alerts.phMin >= alerts.phMax || alerts.tdsMin >= alerts.tdsMax) {
      toast.error("Validasi gagal: Batas minimum harus lebih kecil dari maksimum!");
      return;
    }
    try {
      if (db) {
        await set(ref(db, `devices/${DEFAULT_DEVICE_ID}/settings/alerts`), alerts);
      }
      toast.success("Ambang batas notifikasi/alert berhasil diperbarui!");
    } catch (err: any) {
      toast.error("Gagal menyimpan ke Firebase: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
          <Settings className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          Pengaturan Parameter Adaptif & Alert
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Konfigurasi rentang ambang batas irigasi pasang-surut adaptif dan peringatan anomali sensor
        </p>
      </div>

      <Tabs defaultValue="adaptive" className="w-full">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
          <TabsTrigger value="adaptive">Irigasi Adaptif</TabsTrigger>
          <TabsTrigger value="alerts">Batas Notifikasi</TabsTrigger>
        </TabsList>

        {/* Tab 1: Irigasi Adaptif per Tingkat */}
        <TabsContent value="adaptive" className="mt-5 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {(["tier1", "tier2", "tier3"] as const).map((tierId, idx) => {
              const conf = adaptive[tierId];
              return (
                <Card key={tierId} className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Tingkat {idx + 1} ({idx === 0 ? "Bawah" : idx === 1 ? "Tengah" : "Atas"})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Rentang adaptif kelembaban & durasi pompa
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Kelembaban */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Batas Kelembaban Media (%)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Min (%)</span>
                          <Input
                            type="number"
                            value={conf.moistureMin}
                            onChange={(e) =>
                              setAdaptive((prev) => ({
                                ...prev,
                                [tierId]: { ...prev[tierId], moistureMin: Number(e.target.value) },
                              }))
                            }
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Max (%)</span>
                          <Input
                            type="number"
                            value={conf.moistureMax}
                            onChange={(e) =>
                              setAdaptive((prev) => ({
                                ...prev,
                                [tierId]: { ...prev[tierId], moistureMax: Number(e.target.value) },
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Durasi Flood */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Rentang Durasi Pasang/Flood (Menit)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Min (Mnt)</span>
                          <Input
                            type="number"
                            value={conf.floodDurationMin}
                            onChange={(e) =>
                              setAdaptive((prev) => ({
                                ...prev,
                                [tierId]: { ...prev[tierId], floodDurationMin: Number(e.target.value) },
                              }))
                            }
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Max (Mnt)</span>
                          <Input
                            type="number"
                            value={conf.floodDurationMax}
                            onChange={(e) =>
                              setAdaptive((prev) => ({
                                ...prev,
                                [tierId]: { ...prev[tierId], floodDurationMax: Number(e.target.value) },
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interval Drain */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Rentang Interval Surut/Drain (Menit)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Min (Mnt)</span>
                          <Input
                            type="number"
                            value={conf.drainIntervalMin}
                            onChange={(e) =>
                              setAdaptive((prev) => ({
                                ...prev,
                                [tierId]: { ...prev[tierId], drainIntervalMin: Number(e.target.value) },
                              }))
                            }
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Max (Mnt)</span>
                          <Input
                            type="number"
                            value={conf.drainIntervalMax}
                            onChange={(e) =>
                              setAdaptive((prev) => ({
                                ...prev,
                                [tierId]: { ...prev[tierId], drainIntervalMax: Number(e.target.value) },
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleSaveAdaptive(tierId)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold"
                    >
                      <Save className="w-4 h-4" />
                      Simpan Parameter Rak #{idx + 1}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 2: Ambang Batas Notifikasi */}
        <TabsContent value="alerts" className="mt-5">
          <Card className="max-w-2xl border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Ambang Batas Peringatan Reservoir
              </CardTitle>
              <CardDescription>
                Peringatan otomatis dikirimkan jika parameter nutrisi melewati ambang batas ini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">pH Minimum</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={alerts.phMin}
                    onChange={(e) => setAlerts((prev) => ({ ...prev, phMin: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">pH Maksimum</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={alerts.phMax}
                    onChange={(e) => setAlerts((prev) => ({ ...prev, phMax: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">TDS Minimum (PPM)</Label>
                  <Input
                    type="number"
                    value={alerts.tdsMin}
                    onChange={(e) => setAlerts((prev) => ({ ...prev, tdsMin: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">TDS Maksimum (PPM)</Label>
                  <Input
                    type="number"
                    value={alerts.tdsMax}
                    onChange={(e) => setAlerts((prev) => ({ ...prev, tdsMax: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Level Air Reservoir Minimum (%)</Label>
                <Input
                  type="number"
                  value={alerts.reservoirLevelMin}
                  onChange={(e) => setAlerts((prev) => ({ ...prev, reservoirLevelMin: Number(e.target.value) }))}
                />
              </div>

              <Button
                onClick={handleSaveAlerts}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold"
              >
                <Save className="w-4 h-4" />
                Simpan Ambang Batas Alert
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
