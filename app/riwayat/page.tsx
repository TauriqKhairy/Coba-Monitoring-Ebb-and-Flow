"use client";

import React, { useState } from "react";
import { History, Download, Calendar, Filter, Layers, Droplets } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatTimestamp } from "@/lib/utils";
import { toast } from "sonner";

// Sample mock history data for demonstration
const mockHistory = [
  { time: "10:00", timestamp: Date.now() - 3600000 * 5, ph: 6.2, tds: 850, tier1: 65, tier2: 58, tier3: 70, waterTemp: 25.1 },
  { time: "11:00", timestamp: Date.now() - 3600000 * 4, ph: 6.3, tds: 860, tier1: 62, tier2: 55, tier3: 68, waterTemp: 25.3 },
  { time: "12:00", timestamp: Date.now() - 3600000 * 3, ph: 6.1, tds: 870, tier1: 75, tier2: 72, tier3: 78, waterTemp: 25.8 },
  { time: "13:00", timestamp: Date.now() - 3600000 * 2, ph: 6.2, tds: 855, tier1: 70, tier2: 67, tier3: 74, waterTemp: 25.6 },
  { time: "14:00", timestamp: Date.now() - 3600000 * 1, ph: 6.4, tds: 840, tier1: 66, tier2: 60, tier3: 71, waterTemp: 25.4 },
  { time: "15:00", timestamp: Date.now(), ph: 6.2, tds: 850, tier1: 64, tier2: 58, tier3: 69, waterTemp: 25.2 },
];

export default function RiwayatPage() {
  const [filterRange, setFilterRange] = useState<"1h" | "24h" | "7d">("24h");
  const [activeMetric, setActiveMetric] = useState<"moisture" | "nutrisi">("moisture");

  const exportCSV = () => {
    try {
      const headers = ["Waktu", "Kelembaban Tier 1 (%)", "Kelembaban Tier 2 (%)", "Kelembaban Tier 3 (%)", "pH Nutrisi", "TDS (PPM)", "Suhu Air (°C)"];
      const rows = mockHistory.map((item) => [
        item.time,
        item.tier1,
        item.tier2,
        item.tier3,
        item.ph,
        item.tds,
        item.waterTemp,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `riwayat_sensor_hidroponik_${filterRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Data riwayat sensor berhasil diekspor ke CSV!");
    } catch (err: any) {
      toast.error("Gagal mengekspor CSV: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <History className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            Riwayat Sensor & Analitik Grafik
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualisasi tren parameter lingkungan, kelembaban media tanam, dan ekspor berkas CSV
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={exportCSV}
            variant="outline"
            className="border-emerald-600/30 text-emerald-600 dark:text-emerald-400 gap-1.5 text-xs font-semibold"
          >
            <Download className="w-4 h-4" />
            Ekspor CSV
          </Button>
        </div>
      </div>

      {/* Filter Waktu & Metrik */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Rentang:
          </span>
          {(["1h", "24h", "7d"] as const).map((r) => (
            <Button
              key={r}
              variant={filterRange === r ? "default" : "secondary"}
              size="sm"
              className={filterRange === r ? "bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8" : "text-xs h-8"}
              onClick={() => setFilterRange(r)}
            >
              {r === "1h" ? "1 Jam Terakhir" : r === "24h" ? "24 Jam Terakhir" : "7 Hari Terakhir"}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeMetric === "moisture" ? "default" : "outline"}
            size="sm"
            className={activeMetric === "moisture" ? "bg-emerald-600 text-white text-xs h-8" : "text-xs h-8"}
            onClick={() => setActiveMetric("moisture")}
          >
            Kelembaban Media
          </Button>
          <Button
            variant={activeMetric === "nutrisi" ? "default" : "outline"}
            size="sm"
            className={activeMetric === "nutrisi" ? "bg-emerald-600 text-white text-xs h-8" : "text-xs h-8"}
            onClick={() => setActiveMetric("nutrisi")}
          >
            Nutrisi (pH & TDS)
          </Button>
        </div>
      </div>

      {/* Grafik Recharts */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold">
            {activeMetric === "moisture"
              ? "Grafik Kelembaban Media Tanam per Tingkat Tray (%)"
              : "Grafik Kualitas Nutrisi Reservoir (pH & TDS)"}
          </CardTitle>
          <CardDescription className="text-xs">
            Menunjukkan dinamika pasang-surut saat pompa aktif dan menyerap air
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeMetric === "moisture" ? (
                <LineChart data={mockHistory}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tier1" name="Tingkat 1 (Bawah)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="tier2" name="Tingkat 2 (Tengah)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="tier3" name="Tingkat 3 (Atas)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              ) : (
                <LineChart data={mockHistory}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#888888" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#10b981" fontSize={12} domain={[4, 9]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={12} domain={[500, 1500]} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="ph" name="pH Larutan" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="tds" name="TDS (PPM)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Data Riwayat */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold">Tabel Log Sensor Terbaru</CardTitle>
          <CardDescription className="text-xs">Daftar log data mentah yang tersimpan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted text-muted-foreground uppercase font-bold border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Tier 1 (%)</th>
                  <th className="py-2.5 px-3">Tier 2 (%)</th>
                  <th className="py-2.5 px-3">Tier 3 (%)</th>
                  <th className="py-2.5 px-3">pH</th>
                  <th className="py-2.5 px-3">TDS (PPM)</th>
                  <th className="py-2.5 px-3">Suhu Air (°C)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockHistory.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-foreground">{row.time}</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-600">{row.tier1}%</td>
                    <td className="py-2.5 px-3 font-semibold text-blue-600">{row.tier2}%</td>
                    <td className="py-2.5 px-3 font-semibold text-amber-600">{row.tier3}%</td>
                    <td className="py-2.5 px-3">{row.ph}</td>
                    <td className="py-2.5 px-3 font-mono">{row.tds}</td>
                    <td className="py-2.5 px-3">{row.waterTemp}°C</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
