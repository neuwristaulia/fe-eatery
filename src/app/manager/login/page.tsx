"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, User, AlertCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useManagerStore } from "@/store/useManagerStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ManagerLoginPage() {
  const router = useRouter();
  const { login } = useManagerStore();

  const [managerId, setManagerId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Mock authentication
    setTimeout(() => {
      setIsLoading(false);
      if (managerId.toUpperCase() === "MGR-01" && password === "manager123") {
        login({ id: "MGR-01", name: "Budi Santoso", role: "General Manager" });
        router.push("/manager/dashboard");
      } else {
        setError("Manager ID atau Password salah.");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.83-54.628 54.628-.83-.83L54.627 0zM0 54.627l.83.83L.83 55.457 0 54.627zm59.17-54.627l.83.83-59.17 59.17-.83-.83L59.17 0zM0 59.17l.83.83L.83 60 0 59.17z\' fill=\'%231F4D3A\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-md p-4 relative z-10"
      >
        <Card className="border-none shadow-2xl rounded-2xl overflow-hidden bg-card/80 backdrop-blur-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4 relative overflow-hidden">
                <img src="/logo.png" alt="e-Eatery Logo" className="w-14 h-14 object-contain" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextElementSibling?.classList.remove("hidden"); }} />
                <span className="hidden font-serif font-bold text-2xl text-primary">KL</span>
              </div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Manager Portal</h1>
              <p className="text-muted-foreground mt-2">Masuk untuk memantau analitik cafe.</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 bg-red-500/10 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Manager ID</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MGR-01"
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" className="w-5 h-5 rounded border-border text-primary focus:ring-primary accent-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Ingat saya</span>
                </label>
                <a href="#" className="text-sm text-primary hover:underline font-medium">Lupa password?</a>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Memproses...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Masuk Sekarang
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground bg-muted/50 p-4 rounded-xl">
              <p>Demo Credentials:</p>
              <p>ID: <strong className="text-foreground">MGR-01</strong> | Pass: <strong className="text-foreground">manager123</strong></p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
