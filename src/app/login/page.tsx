"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { MessageSquareText, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const USER_PASSWORDS = {
  krishna: "krishna@2006",
  sibbu: "sibbu@2008"
} as const;

function LoginForm() {
  const { profile, signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedName, setSelectedName] = useState<"krishna" | "sibbu" | "">("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextUrl = searchParams.get("next") || "/chat";

  useEffect(() => {
    if (profile) {
      router.replace(nextUrl);
    }
  }, [profile, router, nextUrl]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!selectedName) {
      setError("Please select a name");
      return;
    }

    if (!password) {
      setError("Please enter password");
      return;
    }

    setIsSubmitting(true);
    console.log("Login attempt for:", selectedName);

    try {
      // Validate password
      const correctPassword = USER_PASSWORDS[selectedName];
      if (password !== correctPassword) {
        console.warn("Wrong password entered for:", selectedName);
        setError("Wrong Password");
        // Store failed attempt in localStorage
        const attempts = JSON.parse(localStorage.getItem("ephemeral-chat:failed-attempts") || "[]");
        attempts.push({
          username: selectedName,
          timestamp: new Date().toISOString(),
          enteredPassword: password
        });
        localStorage.setItem("ephemeral-chat:failed-attempts", JSON.stringify(attempts));
        setIsSubmitting(false);
        return;
      }

      console.log("Password correct, signing in...");
      // Store successful login attempt
      localStorage.setItem("ephemeral-chat:last-login", JSON.stringify({
        username: selectedName,
        timestamp: new Date().toISOString()
      }));

      signIn(selectedName);
      console.log("Sign in state updated, redirecting to:", nextUrl);
      
      // The useEffect will handle redirection when profile state updates
    } catch (err) {
      console.error("Login process error:", err);
      setError("An unexpected error occurred during login. Check console for details.");
      setIsSubmitting(false);
    }
  }

  if (profile) {
    return null; // Will redirect via useEffect
  }

  return (
    <main className="safe-area-login-shell flex min-h-dvh items-center justify-center bg-transparent px-4 py-8">
      <div className="w-full max-w-md rounded-[2.5rem] border border-border bg-surface/80 p-8 shadow-cute backdrop-blur-xl sm:p-10">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-fern text-white shadow-soft">
            <MessageSquareText className="h-10 w-10" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">Chatly</h1>
          <p className="mt-3 text-[15px] font-medium text-muted">A modern soft chat experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="mb-4 block text-sm font-bold uppercase tracking-wider text-muted/80">Identify yourself</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`group flex cursor-pointer flex-col items-center gap-3 rounded-[2rem] border-2 p-5 transition-all duration-300 ${
                selectedName === "krishna" 
                  ? "border-fern bg-fern-light/20 shadow-soft" 
                  : "border-border bg-surface hover:border-fern/30 hover:bg-mist"
              }`}>
                <input
                  type="radio"
                  name="name"
                  value="krishna"
                  checked={selectedName === "krishna"}
                  onChange={(e) => setSelectedName(e.target.value as "krishna")}
                  className="hidden"
                />
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold transition-colors ${
                  selectedName === "krishna" ? "bg-fern text-white" : "bg-fern-light/50 text-fern"
                }`}>K</div>
                <div className="text-center">
                  <div className={`font-bold ${selectedName === "krishna" ? "text-fern" : "text-ink"}`}>Krishna</div>
                </div>
              </label>
              
              <label className={`group flex cursor-pointer flex-col items-center gap-3 rounded-[2rem] border-2 p-5 transition-all duration-300 ${
                selectedName === "sibbu" 
                  ? "border-fern bg-fern-light/20 shadow-soft" 
                  : "border-border bg-surface hover:border-fern/30 hover:bg-mist"
              }`}>
                <input
                  type="radio"
                  name="name"
                  value="sibbu"
                  checked={selectedName === "sibbu"}
                  onChange={(e) => setSelectedName(e.target.value as "sibbu")}
                  className="hidden"
                />
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold transition-colors ${
                  selectedName === "sibbu" ? "bg-fern text-white" : "bg-fern-light/50 text-fern"
                }`}>S</div>
                <div className="text-center">
                  <div className={`font-bold ${selectedName === "sibbu" ? "text-fern" : "text-ink"}`}>Sibbu</div>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold uppercase tracking-wider text-muted/80">Secure Access</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-2xl border border-border bg-surface px-5 py-4 text-[15px] text-ink shadow-soft outline-none transition-all focus:border-fern/50 focus:ring-4 focus:ring-fern/10"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-fern"
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="animate-message-in flex items-center gap-2 rounded-2xl border border-coral/20 bg-coral/5 p-4 text-coral">
              <span className="h-2 w-2 rounded-full bg-coral animate-pulse" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !selectedName || !password}
            className="w-full rounded-[1.5rem] bg-fern py-4 text-base font-black tracking-wide text-white shadow-soft transition-all hover:bg-fern-dark hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Authenticating..." : "Enter Chat"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-transparent px-6">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-fern/25 border-t-fern"
            role="status"
            aria-label="Loading"
          />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}