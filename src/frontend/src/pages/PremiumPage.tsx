import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  CheckCircle,
  Crown,
  Loader2,
  MessageSquare,
  Package,
  Shield,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useIsPremiumActive,
  usePremiumStatus,
  useSetPremiumExpiry,
} from "../hooks/useQueries";

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
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: isPremium } = useIsPremiumActive();
  const { data: premiumExpiry } = usePremiumStatus();
  const { mutateAsync: setPremiumExpiry } = useSetPremiumExpiry();

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  async function handlePay() {
    if (!cardNumber || !expiry || !cvv) {
      toast.error("Заполните данные карты");
      return;
    }
    setPaying(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      // 30 days from now in nanoseconds
      const expiryNs =
        BigInt(Date.now()) * BigInt(1_000_000) +
        BigInt(30 * 24 * 60 * 60) * BigInt(1_000_000_000);
      await setPremiumExpiry(expiryNs);
      setPaid(true);
      setTimeout(() => {
        setPayModalOpen(false);
        navigate({ to: "/" });
      }, 2000);
    } catch {
      toast.error("Ошибка оплаты. Попробуйте ещё раз.");
    } finally {
      setPaying(false);
    }
  }

  function formatCardNumber(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatCardExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
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
                      onClick={() => setPayModalOpen(true)}
                      data-ocid="premium.primary_button"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Продлить
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full h-12 text-base font-bold premium-glow"
                    onClick={() => {
                      if (!isLoggedIn) {
                        toast("Сначала войдите в аккаунт", {
                          action: {
                            label: "Войти",
                            onClick: login,
                          },
                        });
                      } else {
                        setPayModalOpen(true);
                      }
                    }}
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
                  </Button>
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

      {/* Payment Modal */}
      <Dialog
        open={payModalOpen}
        onOpenChange={(v) => !paying && setPayModalOpen(v)}
      >
        <DialogContent className="max-w-sm" data-ocid="premium.dialog">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Crown
                className="w-5 h-5"
                style={{ color: "oklch(var(--premium-dark))" }}
              />
              Оплата Премиума
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {paid ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
                data-ocid="premium.success_state"
              >
                <CheckCircle
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: "oklch(var(--premium-dark))" }}
                />
                <h3 className="font-display text-xl font-bold mb-2">
                  Оплата прошла!
                </h3>
                <p className="text-muted-foreground text-sm">
                  Премиум активирован на 30 дней. Перенаправление…
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 py-2"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="card-num">Номер карты</Label>
                  <Input
                    id="card-num"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    inputMode="numeric"
                    data-ocid="premium.input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="card-exp">Срок</Label>
                    <Input
                      id="card-exp"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) =>
                        setExpiry(formatCardExpiry(e.target.value))
                      }
                      inputMode="numeric"
                      maxLength={5}
                      data-ocid="premium.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="card-cvv">CVV</Label>
                    <Input
                      id="card-cvv"
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      inputMode="numeric"
                      type="password"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPayModalOpen(false)}
                    disabled={paying}
                    data-ocid="premium.cancel_button"
                  >
                    Отмена
                  </Button>
                  <Button
                    className="flex-1 font-semibold"
                    onClick={handlePay}
                    disabled={paying}
                    data-ocid="premium.submit_button"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(var(--premium)), oklch(var(--premium-dark)))",
                      color: "oklch(var(--premium-foreground))",
                      border: "none",
                    }}
                  >
                    {paying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Оплата…
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 mr-2" />
                        Оплатить $5
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Это демо-форма. Реальные данные карты не отправляются.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </main>
  );
}
