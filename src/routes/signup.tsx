import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create your Portfolia account" },
      {
        name: "description",
        content:
          "Sign up for Portfolia to track your Pakistan Stock Exchange portfolio, profit and loss, alerts and analytics.",
      },
      { property: "og:title", content: "Create your Portfolia account" },
      {
        property: "og:description",
        content: "Start tracking your PSX portfolio with premium dashboards and alerts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/app" });
  },
  component: SignUpPage,
});

type Errors = Partial<Record<"fullName" | "email" | "password" | "confirm" | "form", string>>;

function SignUpPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const next: Errors = {};
    if (fullName.trim().length < 2) next.fullName = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (password !== confirm) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    setExisting(false);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: fullName.trim() },
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        setExisting(true);
        setErrors({ form: "This email is already registered. Log in to your account." });
        toast.error("An account with this email already exists. Please log in instead.");
      } else {
        setErrors({ form: error.message });
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }

    // Supabase returns a user with an empty identities array when the email is
    // already registered, instead of an explicit error.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setExisting(true);
      setErrors({ form: "This email is already registered. Log in to your account." });
      toast.error("An account with this email already exists. Please log in instead.");
      setLoading(false);
      return;
    }

    // Never leave a half-signed-in state: the flow always ends at login.
    await supabase.auth.signOut();
    toast.success("Account created successfully. Please log in to continue.");
    navigate({ to: "/login", search: { email: email.trim().toLowerCase() }, replace: true });
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Track your PSX portfolio, profit and loss and alerts in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <Label htmlFor="full-name">Full name</Label>
          <Input
            id="full-name"
            className="mt-1.5"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={!!errors.fullName}
            placeholder="Ahmed Hassan"
          />
          {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            className="mt-1.5"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            className="mt-1.5"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
        </div>

        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            className="mt-1.5"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={!!errors.confirm}
          />
          {errors.confirm && <p className="mt-1 text-xs text-destructive">{errors.confirm}</p>}
        </div>

        {errors.form && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errors.form}
            {existing && (
              <div className="mt-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/login" search={{ email: email.trim().toLowerCase() }}>
                    Go to Login
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
          {loading ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-subtle-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton />
    </AuthLayout>
  );
}
