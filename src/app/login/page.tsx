"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    router.push("/menu");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Decorative Asian Pattern overlay (subtle) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.83-54.628 54.628-.83-.83L54.627 0zM0 54.627l.83.83L.83 55.457 0 54.627zm59.17-54.627l.83.83-59.17 59.17-.83-.83L59.17 0zM0 59.17l.83.83L.83 60 0 59.17z\' fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>
      
      {/* Gradient Blobs for warmth */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border border-border/50 shadow-2xl bg-card rounded-[2rem] overflow-hidden relative">
          {/* Subtle top border accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-accent to-secondary" />
          
          <CardHeader className="text-center pt-10 pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-4 shadow-xl border-4 border-transparent bg-secondary"
            >
              <img src="/logo.png" alt="e-Eatery Logo" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
            </motion.div>
            
            <CardDescription className="text-base text-muted-foreground/80 max-w-[250px] mx-auto leading-relaxed mt-4">
              Selamat datang di pengalaman kuliner oriental autentik.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4 pb-10 px-8 space-y-5">
            <Button
              className="w-full h-14 text-base font-bold bg-white text-black hover:bg-gray-50 border border-gray-200 shadow-sm transition-all hover:shadow-md flex items-center justify-center space-x-3 rounded-xl group"
              onClick={handleLogin}
              disabled={isLoading}
              isLoading={isLoading}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Lanjutkan dengan Google</span>
            </Button>
            
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                <span className="bg-card px-3 text-muted-foreground/60">Atau</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-14 text-base font-bold border-primary/20 text-primary hover:bg-primary/5 hover:text-primary transition-all rounded-xl"
              onClick={handleGuest}
              disabled={isLoading}
            >
              Masuk sebagai Tamu
            </Button>
            
            <div className="pt-6">
              <p className="text-center text-xs text-muted-foreground/70 leading-relaxed">
                Dengan masuk, Anda menyetujui <br/>
                <Link href="#" className="underline hover:text-primary transition-colors">Syarat Ketentuan</Link> & <Link href="#" className="underline hover:text-primary transition-colors">Kebijakan Privasi</Link> kami.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Floating back to home */}
        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
