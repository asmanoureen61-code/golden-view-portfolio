import { Link, createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset your Portfolia password" },
      {
        name: "description",
        content: "Request a password reset link for your Portfolia PSX portfolio account.",
      },
      { property: "og:title", content: "Reset your Portfolia password" },
      { property: "og:description", content: "Send yourself a secure password reset link." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Enter a valid email address.");
      return;
    }

    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    setSent(true);
    toast.success("Password reset email sent");
  }

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="We'll email you a secure link to set a new password."
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to login
        </Link>
      }
    >
      {sent ? (
        <p className="rounded-md border border-border bg-surface px-3 py-3 text-sm text-muted-foreground">
          If an account exists for this email, a password reset link has been sent.
        </p>
      ) : (
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
