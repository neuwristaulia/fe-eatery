"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/Card";

export default function RegisterPage() {
  const router = useRouter();
  const registerWithEmail = useAuthStore((s) => s.registerWithEmail);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      await registerWithEmail({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Registrasi gagal. Coba lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border border-border/50 shadow-2xl bg-card rounded-[2rem] overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-accent to-secondary" />

          <CardHeader className="text-center pt-10 pb-4">
            <div className="mx-auto w-20 h-20 rounded-full overflow-hidden mb-4 shadow-lg bg-secondary">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <CardDescription className="text-base text-muted-foreground/80 max-w-[280px] mx-auto">
              Buat akun customer untuk memesan dan mengumpulkan poin.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2 pb-10 px-8">
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Nama / Username</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  autoComplete="name"
                  placeholder="Nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="contoh@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Nomor Telepon</label>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl font-bold mt-2"
                disabled={isLoading}
                isLoading={isLoading}
              >
                Daftar
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Masuk di sini
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
