import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Crown, Home, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useSetPremiumExpiry } from "../hooks/useQueries";

export function PremiumSuccessPage() {
  const { isLoggedIn } = useAuth();

  // session_id may be present in URL query params from Stripe redirect
  const search = useSearch({ strict: false }) as { session_id?: string };
  const sessionId = search?.session_id;

  const { mutateAsync: setPremiumExpiry } = useSetPremiumExpiry();
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState(false);
  // Prevent double-activation across re-renders
  const hasTriedRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || hasTriedRef.current) return;
    hasTriedRef.current = true;

    // Activate premium for 30 days from now
    async function activate() {
      setActivating(true);
      try {
        // 30 days from now in nanoseconds
        const expiryNs =
          BigInt(Date.now()) * BigInt(1_000_000) +
          BigInt(30 * 24 * 60 * 60) * BigInt(1_000_000_000);
        await setPremiumExpiry(expiryNs);
        setActivated(true);
        toast.success("Премиум активирован на 30 дней!");
      } catch {
        setError(true);
        toast.error("Ошибка активации. Обратитесь в поддержку.");
      } finally {
        setActivating(false);
      }
    }

    void activate();
  }, [isLoggedIn, setPremiumExpiry]);

  if (!isLoggedIn) {
    return (
      <main
        className="flex-1 flex items-center justify-center px-4 py-20"
        data-ocid="premium_success.panel"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
          className="max-w-md w-full text-center bg-card rounded-2xl border border-border p-10 shadow-product"
        >
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ background: "oklch(var(--premium) / 0.15)" }}
          >
            <Crown
              className="w-10 h-10"
              style={{ color: "oklch(var(--premium-dark))" }}
            />
          </div>
          <h1 className="font-display text-3xl font-bold mb-3">
            Оплата прошла!
          </h1>
          <p className="text-muted-foreground mb-6">
            Войдите в аккаунт, чтобы активировать Премиум.
          </p>
          <Link to="/premium">
            <Button
              size="lg"
              className="w-full gap-2"
              data-ocid="premium_success.primary_button"
            >
              <Crown className="w-4 h-4" />
              Активировать Премиум
            </Button>
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main
      className="flex-1 flex items-center justify-center px-4 py-20"
      data-ocid="premium_success.panel"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
        className="max-w-md w-full text-center bg-card rounded-2xl border-2 p-10"
        style={{ borderColor: "oklch(var(--premium) / 0.4)" }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.15,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
          style={{
            background:
              "linear-gradient(135deg, oklch(var(--premium)), oklch(var(--premium-dark)))",
          }}
        >
          {activating ? (
            <Loader2
              className="w-12 h-12 animate-spin"
              style={{ color: "oklch(var(--premium-foreground))" }}
              data-ocid="premium_success.loading_state"
            />
          ) : error ? (
            <Crown
              className="w-12 h-12"
              style={{ color: "oklch(var(--premium-foreground))" }}
              data-ocid="premium_success.error_state"
            />
          ) : (
            <CheckCircle2
              className="w-12 h-12"
              style={{ color: "oklch(var(--premium-foreground))" }}
              data-ocid="premium_success.success_state"
            />
          )}
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {activating && (
            <>
              <h1 className="font-display text-3xl font-bold mb-3">
                Активируем Премиум…
              </h1>
              <p className="text-muted-foreground mb-8">
                Пожалуйста, подождите — настраиваем ваш доступ.
              </p>
            </>
          )}
          {activated && (
            <>
              <h1 className="font-display text-3xl font-bold mb-3">
                Добро пожаловать в{" "}
                <span style={{ color: "oklch(var(--premium-dark))" }}>
                  Премиум!
                </span>
              </h1>
              <p className="text-muted-foreground mb-2">
                Ваш Премиум активирован на <strong>30 дней</strong>. Теперь вы
                можете добавлять неограниченное количество товаров.
              </p>
              {sessionId && (
                <p className="text-xs text-muted-foreground mb-6 font-mono opacity-60">
                  ID сессии: {sessionId.slice(0, 20)}…
                </p>
              )}
            </>
          )}
          {error && (
            <>
              <h1 className="font-display text-3xl font-bold mb-3">
                Ошибка активации
              </h1>
              <p className="text-muted-foreground mb-6">
                Оплата прошла успешно, но активация не удалась. Обратитесь в
                поддержку с ID сессии.
              </p>
              {sessionId && (
                <p className="text-xs text-muted-foreground font-mono mb-6 bg-muted px-3 py-2 rounded">
                  {sessionId}
                </p>
              )}
            </>
          )}
        </motion.div>

        {/* CTA */}
        {!activating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/">
              <Button
                size="lg"
                className="w-full gap-2 font-semibold"
                data-ocid="premium_success.primary_button"
                style={
                  activated
                    ? {
                        background:
                          "linear-gradient(135deg, oklch(var(--premium)), oklch(var(--premium-dark)))",
                        color: "oklch(var(--premium-foreground))",
                        border: "none",
                      }
                    : {}
                }
              >
                <Home className="w-4 h-4" />
                На главную
              </Button>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
