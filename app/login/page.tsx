"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets, LogIn, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Harap isi email dan kata sandi!");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Akun berhasil dibuat! Mengalihkan ke Dashboard...");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Berhasil masuk! Selamat datang.");
      }
      router.push("/dashboard");
    } catch (err: any) {
      console.warn("Auth Firebase:", err.message);
      // Jika mode testing/mock atau Firebase kredensial belum diisi
      if (err.code === "auth/invalid-api-key" || err.message.includes("api-key")) {
        toast.info("Mode Demo/Pengujian: Masuk tanpa API Key Firebase asli.");
        router.push("/dashboard");
      } else {
        toast.error(`Gagal autentikasi: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-950/50">
            <Droplets className="w-9 h-9 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Hidroponik Ebb & Flow
          </h1>
          <p className="text-xs text-emerald-400 font-semibold mt-1">
            Monitoring & Irigasi Adaptif Bertingkat (ESP32)
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl text-slate-100">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-white text-center">
              {isRegister ? "Buat Akun Baru" : "Masuk ke Sistem"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 text-center">
              {isRegister
                ? "Daftarkan akun operator untuk akses sistem kontrol"
                : "Masukkan email dan kata sandi yang telah terdaftar"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-300">Alamat Email</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <Input
                    type="email"
                    placeholder="operator@hidroponik.local"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-300">Kata Sandi</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 gap-2 mt-2 shadow-lg shadow-emerald-900/40"
              >
                {loading ? "Memproses..." : isRegister ? "Daftar Akun" : "Masuk"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pt-2 border-t border-slate-800 flex flex-col gap-2 text-center text-xs text-slate-400">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-emerald-400 hover:underline font-semibold"
            >
              {isRegister
                ? "Sudah punya akun? Masuk di sini"
                : "Belum punya akun? Klik untuk mendaftar"}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Dilindungi oleh Firebase Authentication
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
