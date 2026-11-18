"use client";

import React, { useState } from "react";
import { Bell, AlertTriangle, CheckCircle, Check, ShieldAlert, Radio, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRealtimeData } from "@/hooks/use-realtime-data";
import { ref, update } from "firebase/database";
import { db, DEFAULT_DEVICE_ID } from "@/lib/firebase";
import { formatTimestamp } from "@/lib/utils";
import { toast } from "sonner";

interface AlertItem {
  id: string;
  timestamp: number;
  type: "warning" | "danger" | "info";
  message: string;
  resolved: boolean;
}

const initialAlerts: AlertItem[] = [
  {
    id: "alert-001",
    timestamp: Date.now() - 1000 * 60 * 15,
    type: "warning",
    message: "Level air tandon reservoir mendekati batas minimum (< 35%)",
    resolved: false,
  },
  {
    id: "alert-002",
    timestamp: Date.now() - 1000 * 60 * 45,
    type: "danger",
    message: "Nilai pH nutrisi 6.9 di luar batas optimal (5.5 - 6.5)",
    resolved: false,
  },
  {
    id: "alert-003",
    timestamp: Date.now() - 1000 * 60 * 180,
    type: "info",
    message: "Siklus pasang (flood) adaptif Tingkat 2 selesai dijalankan (12 menit)",
    resolved: true,
  },
];

export default function NotifikasiPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("active");

  const handleResolve = async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );

    try {
      if (db) {
        await update(ref(db, `alerts/${DEFAULT_DEVICE_ID}/${id}`), {
          resolved: true,
        });
      }
      toast.success("Peringatan berhasil ditandai selesai.");
    } catch (err: any) {
      toast.info("Status diperbarui di antarmuka (offline/demo mode).");
    }
  };

  const filtered = alerts.filter((a) => {
    if (filter === "active") return !a.resolved;
    if (filter === "resolved") return a.resolved;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <Bell className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            Pusat Notifikasi & Alert
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daftar notifikasi anomali sensor, status tandon, dan log peringatan sistem irigasi
          </p>
        </div>

        {/* Filter Tab */}
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg text-xs">
          <Button
            size="sm"
            variant={filter === "active" ? "default" : "ghost"}
            className={filter === "active" ? "bg-emerald-600 text-white text-xs h-7" : "text-xs h-7"}
            onClick={() => setFilter("active")}
          >
            Aktif ({alerts.filter((a) => !a.resolved).length})
          </Button>
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "ghost"}
            className={filter === "all" ? "bg-emerald-600 text-white text-xs h-7" : "text-xs h-7"}
            onClick={() => setFilter("all")}
          >
            Semua
          </Button>
          <Button
            size="sm"
            variant={filter === "resolved" ? "default" : "ghost"}
            className={filter === "resolved" ? "bg-emerald-600 text-white text-xs h-7" : "text-xs h-7"}
            onClick={() => setFilter("resolved")}
          >
            Selesai
          </Button>
        </div>
      </div>

      {/* List Notifikasi */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="border-border p-12 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
            <h3 className="text-base font-semibold text-foreground">Tidak Ada Peringatan Aktif</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Semua parameter sensor dalam batas aman dan normal.
            </p>
          </Card>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              className={`border-border transition-all ${
                item.resolved
                  ? "opacity-60 bg-muted/20"
                  : item.type === "danger"
                  ? "border-rose-500/40 bg-rose-500/5"
                  : "border-amber-500/40 bg-amber-500/5"
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      item.type === "danger"
                        ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                        : item.type === "warning"
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-500/20 text-emerald-600"
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{item.message}</span>
                      <Badge
                        variant={item.resolved ? "secondary" : item.type === "danger" ? "destructive" : "default"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {item.resolved ? "Terselesaikan" : item.type.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      Waktu terdeteksi: {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                </div>

                {!item.resolved && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs gap-1.5 shrink-0"
                    onClick={() => handleResolve(item.id)}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Tandai Selesai
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
