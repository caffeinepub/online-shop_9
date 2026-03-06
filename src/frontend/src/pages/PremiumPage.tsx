import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  CheckCircle,
  Crown,
  ExternalLink,
  MessageSquare,
  Package,
  Shield,
  Sparkles,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useBalance } from "../hooks/useBalance";
import { useIsPremiumActive, usePremiumStatus } from "../hooks/useQueries";

// TODO: Replace with your real Stripe Payment Link from dashboard.stripe.com
// Create a Payment Link for $5 (or equivalent) and paste the URL here.
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_3cs9Dvfgwbzz8LC000";

const BENEFITS = [
  {
    icon: Package,
    title: "Безлимитные объявления",
    desc: "Добавляйте сколько угодно товаров. Без ограничений.",
  },
  {
    icon: BadgeCheck,
    title: "Значок Премиум-продавца",
    desc: "Ваши товары выделяются золотой отметкой доверия.",
  },
  {
    icon: Shield,
    title: "Приоритетная поддержка",
    desc: "Ответ в течение нескольких часов, не дней.",
  },
  {
    icon: MessageSquare,
    title: "Расширенный чат",
    desc: "История переписки и уведомления о новых сообщениях.",
  },
];

function formatExpiry(ns: bigint): string {
  const ms = Number(ns / BigInt(1_000_000));
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(ms));
}

export function PremiumPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { balance, spendBalance } = useBalance();

  const { data: isPremium } = useIsPremiumActive();
  const { data: premiumExpiry } = usePremiumStatus();

  function handlePayWithBalance() {
    const ok = spendBalance(5, "Активация Премиум-подписки");
    if (!ok) {
      toast.error("Недостаточно средств. Пополните баланс.");
      return;
    }
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem("shop_premium_expiry", expiry.toString());
    toast.success("Премиум активирован!");
    navigate({ to: "/premium-success" });
  }

  function handleBuyPremium() {
    if (!isLoggedIn) {
      toast("Сначала войдите в аккаунт", {
        action: {
          label: "Войти",
          onClick: () => navigate({ to: "/login" }),
        },
      });
      return;
    }
    // Redirect to Stripe-hosted payment page.
    // After payment, Stripe redirects to /premium-success?session_id=...
    const successUrl = `${window.location.origin}/premium-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/premium`;
    // Build the payment link with return URLs if supported, otherwise redirect directly
    const paymentUrl = `${STRIPE_PAYMENT_LINK}?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
    window.location.href = paymentUrl;
  }

  return (
    <main className="flex-1">
      {/* Hero section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Decorative background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(var(--premium) / 0.12) 0%, transparent 70%)",
          }}
        />
        <div className="container mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="premium-glow w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(var(--premium)), oklch(var(--premium-dark)))",
                }}
              >
                <Crown
                  className="w-10 h-10"
                  style={{ color: "oklch(var(--premium-foreground))" }}
                />
              </motion.div>
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Магазин{" "}
              <span style={{ color: "oklch(var(--premium-dark))" }}>
                Премиум
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Продавайте без ограничений. Выделяйтесь среди тысяч объявлений.
            </p>

            {isPremium && premiumExpiry ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full border-2 text-base font-semibold"
                style={{
                  borderColor: "oklch(var(--premium) / 0.6)",
                  background: "oklch(var(--premium) / 0.1)",
                  color: "oklch(var(--premium-dark))",
                }}
              >
                <CheckCircle className="w-5 h-5" />
                Премиум активен до {formatExpiry(premiumExpiry)}
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-card rounded-xl p-6 border border-border hover:border-premium/40 transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-lg mb-4 flex items-center justify-center"
                  style={{
                    background: "oklch(var(--premium) / 0.12)",
                  }}
                >
                  <b.icon
                    className="w-5 h-5"
                    style={{ color: "oklch(var(--premium-dark))" }}
                  />
                </div>
                <h3 className="font-display font-semibold text-base mb-2">
                  {b.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {b.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Pricing card */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative w-full max-w-sm rounded-2xl overflow-hidden border-2"
              style={{ borderColor: "oklch(var(--premium) / 0.5)" }}
            >
              {/* Gold gradient header */}
              <div
                className="px-8 pt-8 pb-6 text-center"
                style={{
                  background:
                    "linear-gradient(160deg, oklch(var(--premium)), oklch(var(--premium-dark)))",
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Crown
                    className="w-5 h-5"
                    style={{ color: "oklch(var(--premium-foreground))" }}
                  />
                  <span
                    className="text-sm font-bold tracking-widest uppercase"
                    style={{ color: "oklch(var(--premium-foreground))" }}
                  >
                    Премиум
                  </span>
                </div>
                <div
                  className="font-display text-5xl font-bold mt-2"
                  style={{ color: "oklch(var(--premium-foreground))" }}
                >
                  $5
                </div>
                <div
                  className="text-sm mt-1 opacity-80"
                  style={{ color: "oklch(var(--premium-foreground))" }}
                >
                  за 30 дней
                </div>
              </div>

              {/* Features list */}
              <div className="bg-card px-8 py-6 space-y-3">
                {[
                  "Безлимитные объявления",
                  "Приоритетная поддержка",
                  "Значок Премиум-продавца",
                  "Расширенный чат",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle
                      className="w-4 h-4 shrink-0"
                      style={{ color: "oklch(var(--premium-dark))" }}
                    />
                    <span className="text-sm text-foreground">{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="bg-card px-8 pb-8">
                {isPremium ? (
                  <div className="space-y-3">
                    <Badge
                      className="w-full justify-center py-2 text-sm"
                      style={{
                        background: "oklch(var(--premium) / 0.15)",
                        color: "oklch(var(--premium-dark))",
                        borderColor: "oklch(var(--premium) / 0.3)",
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Активен
                    </Badge>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleBuyPremium}
                      data-ocid="premium.primary_button"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Продлить через Stripe
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      className="w-full h-12 text-base font-bold premium-glow"
                      onClick={handleBuyPremium}
                      data-ocid="premium.primary_button"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(var(--premium)), oklch(var(--premium-dark)))",
                        color: "oklch(var(--premium-foreground))",
                        border: "none",
                      }}
                    >
                      <Crown className="w-5 h-5 mr-2" />
                      Купить за $5
                      <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                    </Button>

                    {/* Pay with balance */}
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled={balance < 5}
                      onClick={handlePayWithBalance}
                      data-ocid="premium.balance_button"
                      style={
                        balance >= 5
                          ? {
                              borderColor: "oklch(var(--primary) / 0.4)",
                              color: "oklch(var(--primary))",
                            }
                          : {}
                      }
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Оплатить с баланса ($
                      {balance.toFixed(2)})
                    </Button>

                    {/* Stripe branding */}
                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                      <svg
                        viewBox="0 0 60 25"
                        xmlns="http://www.w3.org/2000/svg"
                        width="38"
                        height="16"
                        aria-label="Stripe"
                        className="opacity-50"
                      >
                        <title>Stripe</title>
                        <path
                          fill="currentColor"
                          d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.23c0-1.85-1.05-2.58-2.06-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.07zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-9.73h2.96V5.57h1.07V2.7l4.01-.86v3.73h3.13v3.36h-3.13l-.01 5.72zm-5.51-.05c-.82 0-1.79.3-1.79 1.43 0 1.06.82 1.5 1.82 1.5.47 0 .85-.08 1.15-.2V14.6c-.3.12-.72.2-1.18.2zm-4.7-8.54c.96 0 1.71-.76 1.71-1.7s-.76-1.69-1.7-1.69-1.7.76-1.7 1.69.76 1.7 1.7 1.7zm0 1.27c-2.73 0-4.73-1.41-4.73-3.52C.43 3.16 2.43 1.75 5.16 1.75c2.72 0 4.73 1.4 4.73 3.52 0 2.11-2.01 3.52-4.73 3.52z"
                        />
                      </svg>
                      Безопасная оплата через Stripe
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Free tier comparison */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center text-sm text-muted-foreground"
          >
            <p>
              Бесплатный план: до <strong>10 товаров</strong>. Премиум —
              безлимитно.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
