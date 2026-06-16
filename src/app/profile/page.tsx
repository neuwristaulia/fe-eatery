"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { User } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const apiUser = useAuthStore((state) => state.user);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [name, setName] = React.useState(
    () => apiUser?.name ?? session?.user?.name ?? "",
  );
  const [email, setEmail] = React.useState(
    () => apiUser?.email ?? session?.user?.email ?? "",
  );
  const [phone, setPhone] = React.useState(() => apiUser?.phone ?? "");
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(() => {
    try {
      return sessionStorage.getItem("profile:isEditing") === "true";
    } catch {
      return false;
    }
  });
  const renderCount = React.useRef(0);
  const nameRef = React.useRef<HTMLInputElement | null>(null);

  renderCount.current += 1;
  console.log(`[profile render ${renderCount.current}] isEditing=${isEditing}`);

  React.useEffect(() => {
    console.log("[profile] isEditing changed ->", isEditing);
    if (isEditing) {
      // focus first field for better UX
      nameRef.current?.focus();
    }
    try {
      sessionStorage.setItem("profile:isEditing", isEditing ? "true" : "false");
    } catch {}
  }, [isEditing]);

  React.useEffect(() => {
    if (status === "unauthenticated" && !apiUser) {
      router.push("/login");
    }
  }, [status, apiUser, router]);

  // If authenticated but apiUser not loaded yet, fetch it from API
  React.useEffect(() => {
    if (status === "authenticated" && !apiUser && fetchCurrentUser) {
      fetchCurrentUser().catch(() => {});
    }
  }, [status, apiUser, fetchCurrentUser]);

  // form fields initialize from store/session on first render

  // Sync form fields when apiUser or session become available, but don't overwrite while editing
  React.useEffect(() => {
    if (!isEditing) {
      const newName = apiUser?.name ?? session?.user?.name ?? "";
      const newEmail = apiUser?.email ?? session?.user?.email ?? "";
      const sessionUser = session?.user as unknown as
        | { phone?: string | null }
        | undefined;
      const newPhone = apiUser?.phone ?? sessionUser?.phone ?? "";

      // Update state async to avoid synchronous setState inside effect
      setTimeout(() => {
        setName((curr) => (curr === newName ? curr : newName));
        setEmail((curr) => (curr === newEmail ? curr : newEmail));
        setPhone((curr) => (curr === newPhone ? curr : newPhone));
      }, 0);
    }
  }, [apiUser, session, isEditing]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isEditing) {
      console.log("handleSave prevented because isEditing=false");
      return;
    }
    setIsSaving(true);
    setMessage("");
    try {
      if (apiUser) {
        await updateUser({ name, email, phone });
        setMessage("Perubahan profil tersimpan.");
        setIsEditing(false);
      } else {
        setMessage("Tidak ada user terautentikasi untuk diperbarui.");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setMessage("Email sudah digunakan.");
        } else if (err.status === 401) {
          // session expired or invalid
          await signOut({ callbackUrl: "/login" });
        } else if (err.status === 400) {
          setMessage(err.message || "Validasi input tidak valid.");
        } else {
          setMessage(err.message || "Gagal memperbarui profil.");
        }
      } else {
        setMessage("Gagal memperbarui profil.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const userImage = session?.user?.image;
  const displayName = apiUser?.name || session?.user?.name || "Customer";
  const displayEmail = apiUser?.email || session?.user?.email || "";

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-muted text-foreground/70 overflow-hidden">
              {userImage ? (
                <Image
                  src={userImage}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-10 w-10" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {displayName}
              </h1>
              <p className="text-sm text-muted-foreground">{displayEmail}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Kembali
            </Button>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign Out
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="space-y-3 px-6 py-6">
            <div>
              <h2 className="text-2xl font-semibold">Edit Profil</h2>
              <p className="text-sm text-muted-foreground">
                Perbarui nama, email, dan informasi kontak Anda.
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-8 pt-0">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-foreground">
                  Nama Lengkap
                  <input
                    type="text"
                    ref={nameRef}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-foreground">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm font-medium text-foreground">
                Nomor Telepon
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </label>

              {message && <p className="text-sm text-primary">{message}</p>}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {isEditing && (
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      type="submit"
                      className="w-full sm:w-auto"
                      isLoading={isSaving}
                    >
                      Simpan Perubahan
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        // reset fields to latest user/session values
                        setName(apiUser?.name ?? session?.user?.name ?? "");
                        setEmail(apiUser?.email ?? session?.user?.email ?? "");
                        const sessionUser = session?.user as unknown as
                          | { phone?: string | null }
                          | undefined;
                        setPhone(apiUser?.phone ?? sessionUser?.phone ?? "");
                        setIsEditing(false);
                      }}
                      className="text-sm font-semibold text-primary hover:underline self-center"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </form>

            {!isEditing && (
              <div className="mt-4 flex gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    console.log("Edit button clicked - enabling edit mode");
                    setIsEditing(true);
                  }}
                  className="w-full sm:w-auto"
                >
                  Edit Profil
                </Button>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-primary hover:underline self-center"
                >
                  Kembali
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
