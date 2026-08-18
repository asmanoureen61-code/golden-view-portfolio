import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const result = await lovable.auth.signInWithOAuth("google", {
            redirect_uri: `${window.location.origin}/auth/callback`,
          });

          if ("error" in result && result.error) {
            toast.error(result.error.message || "Google sign-in failed. Please try again.");
            setLoading(false);
            return;
          }
          if ("redirected" in result && result.redirected) return;

          toast.success("Welcome back");
          navigate({ to: "/app", replace: true });
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Google sign-in failed.");
          setLoading(false);
        }
      }}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1a6.2 6.2 0 1 1 0-12.4c1.9 0 3.2.8 4 1.5l2.7-2.6C17 3 14.7 2 12 2a10 10 0 1 0 0 20c5.8 0 9.6-4 9.6-9.7 0-.7-.1-1.2-.2-1.7H12Z"
          />
        </svg>
      )}
      {label}
    </Button>
  );
}
