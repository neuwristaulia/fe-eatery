"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/Card";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const loginWithEmail = useAuthStore((s) => s.loginWithEmail);
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [authError, setAuthError] = React.useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);
    try {
      await loginWithEmail(email.trim(), password, "customer");
      router.push("/dashboard");
    } catch (err) {
      setAuthError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Login gagal. Periksa email dan password.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    router.push("/menu");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83-54.628 54.628-.83-.83L54.627 0zM0 54.627l.83.83L.83 55.457 0 54.627zm59.17-54.627l.83.83-59.17 59.17-.83-.83L59.17 0zM0 59.17l.83.83L.83 60 0 59.17z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
        className="w-full max-w-md z-10"
      >
        <Card className="border border-border/50 shadow-2xl bg-card rounded-[2rem] overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-accent to-secondary" />

          <CardHeader className="text-center pt-10 pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-4 shadow-xl border-4 border-transparent bg-secondary"
            >
              <img
                src="/logo.png"
                alt="e-Eatery Logo"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </motion.div>

            <CardDescription className="text-base text-muted-foreground/80 max-w-[280px] mx-auto leading-relaxed mt-4">
              Masuk dengan email dan password.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2 pb-10 px-8 space-y-5">
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Email
                </label>
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
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {authError && (
                <p className="text-sm text-red-600 text-center">{authError}</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl font-bold"
                disabled={isLoading}
                isLoading={isLoading}
              >
                Masuk
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-primary font-semibold hover:underline"
              >
                Daftar sekarang
              </Link>
            </p>

            <Button
              variant="ghost"
              className="w-full h-12 text-base font-medium rounded-xl"
              onClick={handleGuest}
              disabled={isLoading}
            >
              Masuk sebagai Tamu
            </Button>

            <p className="text-center text-xs text-muted-foreground/70 leading-relaxed pt-2">
              Demo customer: lea@customer.com / password
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
