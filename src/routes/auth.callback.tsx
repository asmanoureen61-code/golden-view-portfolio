import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing you in — Portfolia" },
      { name: "description", content: "Completing your Portfolia sign-in." },
      { property: "og:title", content: "Signing you in — Portfolia" },
      { property: "og:description", content: "Completing your Portfolia sign-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let done = false;
    const finish = (authed: boolean) => {
      if (done) return;
      done = true;
      navigate({ to: authed ? "/app" : "/login", replace: true });
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish(true);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) finish(true);
    });

    const timer = window.setTimeout(() => finish(false), 6000);
    return () => {
      window.clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Signing you in…
      </p>
    </div>
  );
}
