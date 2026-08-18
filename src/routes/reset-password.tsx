import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new Portfolia password" },
      { name: "description", content: "Choose a new password for your Portfolia account." },
      { property: "og:title", content: "Set a new Portfolia password" },
      { property: "og:description", content: "Complete your password reset securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    toast.success("Password updated. Please log in with your new password.");
    navigate({ to: "/login", replace: true });
  }

  return (
    <AuthLayout
      title="Set a new password"
      {...(ready ? { subtitle: "Choose a strong password you don't use elsewhere." } : {})}
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to login
        </Link>
      }
    >
      {!ready ? (
        <p className="text-sm text-muted-foreground">
          Open this page from the reset link in your email to continue. If the link expired, request a new
          one from the{" "}
          <Link to="/forgot-password" className="text-primary hover:underline">
            forgot password
          </Link>{" "}
          page.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              className="mt-1.5"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              type="password"
              className="mt-1.5"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
