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

type LoginSearch = { email?: string; redirect?: string };

function safePath(value: string | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/app";
}

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    ...(typeof search['email'] === "string" ? { email: search['email'] } : {}),
    ...(typeof search['redirect'] === "string" ? { redirect: search['redirect'] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Log in to Portfolia" },
      {
        name: "description",
        content: "Log in to Portfolia to see your PSX holdings, profit and loss, analytics and price alerts.",
      },
      { property: "og:title", content: "Log in to Portfolia" },
      { property: "og:description", content: "Access your PSX portfolio dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: safePath(search.redirect) });
  },
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState(search.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError) {
      setPassword("");
      setError("Incorrect email or password. Please try again.");
      toast.error("Incorrect email or password. Please try again.");
      setLoading(false);
      return;
    }

    toast.success("Welcome back");
    navigate({ to: safePath(search.redirect), replace: true });
  }

  return (
    <AuthLayout
      title="Log in"
      subtitle="Welcome back — your portfolio is waiting."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            className="mt-1.5"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            className="mt-1.5"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!error}
          />
        </div>

        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
          {loading ? "Logging in…" : "Log In"}
        </Button>

        <p className="text-xs text-subtle-foreground">
          You&apos;ll stay signed in on this device until you log out.
        </p>
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
