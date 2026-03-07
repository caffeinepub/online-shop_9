import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CreditCard,
  Crown,
  Hash,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { creditBalance, useBalance } from "../hooks/useBalance";
import {
  CURRENCIES,
  type CurrencyCode,
  formatInCurrency,
  useCurrency,
} from "../hooks/useCurrency";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const TOP_UP_AMOUNTS_USD = [5, 10, 20, 50];

export function BalancePage() {
  const { balance, history, userId, spendBalance } = useBalance();
  const navigate = useNavigate();
  const { currency, setCurrency, currencyInfo, format } = useCurrency();

  // Handle Stripe return with topup_amount param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const topupOk = params.get("topup_ok");
    const topupAmount = params.get("topup_amount");

    if (topupOk === "1" && topupAmount) {
      const amount = Number.parseFloat(topupAmount);
      if (!Number.isNaN(amount) && amount > 0) {
        const ok = creditBalance(
          userId,
          amount,
          `Пополнение через банковскую карту $${amount.toFixed(2)}`,
        );
        if (ok) {
          toast.success(`Баланс пополнен на ${format(amount)}`);
        }
      }
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [userId, format]);

  function handlePayPremium() {
    const ok = spendBalance(5, "Активация Премиум-подписки");
    if (!ok) {
      toast.error("Недостаточно средств на балансе");
      return;
    }
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem("shop_premium_expiry", expiry.toString());
    toast.success("Премиум активирован на 30 дней!");
    navigate({ to: "/premium" });
  }

  function handleCardTopUp(amountUsd: number) {
    const successUrl = `${window.location.origin}/balance?topup_amount=${amountUsd}&topup_ok=1`;
    const stripeUrl = `https://buy.stripe.com/test_3cs9Dvfgwbzz8LC000?success_url=${encodeURIComponent(successUrl)}`;
    window.location.href = stripeUrl;
  }

  return (
    <main className="flex-1 py-10 px-4" data-ocid="balance.page">
      <div className="container mx-auto max-w-2xl">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-8"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(var(--primary) / 0.12)" }}
          >
            <Wallet
              className="w-6 h-6"
              style={{ color: "oklch(var(--primary))" }}
            />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Мой баланс
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Пополните баланс картой или через администратора
            </p>
          </div>
        </motion.div>

        {/* Currency selector */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.01 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground font-medium">
              Валюта:
            </span>
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrency(c.code as CurrencyCode)}
                data-ocid={"balance.currency.tab"}
                className={[
                  "px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all",
                  currency === c.code
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                ].join(" ")}
                style={
                  currency === c.code
                    ? { background: "oklch(var(--primary) / 0.08)" }
                    : {}
                }
              >
                {c.symbol} {c.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* User ID card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.02 }}
          className="mb-4"
        >
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border bg-card"
            data-ocid="balance.user_id.card"
          >
            <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Ваш ID:</span>
            <span className="font-mono font-bold text-lg tracking-widest text-foreground select-all">
              {userId}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              Сообщите этот номер администратору для пополнения
            </span>
          </div>
        </motion.div>

        {/* Balance card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <Card
            className="mb-6 overflow-hidden border-2"
            style={{ borderColor: "oklch(var(--primary) / 0.25)" }}
          >
            <div
              className="px-8 pt-8 pb-6"
              style={{
                background:
                  "linear-gradient(135deg, oklch(var(--primary) / 0.08) 0%, oklch(var(--primary) / 0.03) 100%)",
              }}
            >
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Текущий баланс
              </p>
              <div className="font-display text-5xl font-bold text-foreground tracking-tight">
                {format(balance)}
              </div>
              {/* Secondary value in USD if not USD */}
              {currency !== "USD" && (
                <p className="text-sm text-muted-foreground mt-1">
                  ≈ ${balance.toFixed(2)} USD
                </p>
              )}
            </div>

            {balance >= 5 && (
              <CardContent className="pt-6 pb-6">
                <Separator className="mb-5" />

                {/* Pay premium with balance */}
                <Button
                  className="w-full h-12 text-base font-semibold gap-2"
                  variant="outline"
                  onClick={handlePayPremium}
                  data-ocid="balance.pay_premium_button"
                  style={{
                    borderColor: "oklch(var(--premium) / 0.5)",
                    color: "oklch(var(--premium-dark))",
                    background: "oklch(var(--premium) / 0.06)",
                  }}
                >
                  <Crown className="w-5 h-5" />
                  Оплатить премиум с баланса (
                  {formatInCurrency(5, currencyInfo)})
                </Button>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* Top-up via bank card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <Card
            className="overflow-hidden border-2"
            style={{ borderColor: "oklch(var(--primary) / 0.18)" }}
          >
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "oklch(var(--primary) / 0.1)" }}
                >
                  <CreditCard
                    className="w-4 h-4"
                    style={{ color: "oklch(var(--primary))" }}
                  />
                </div>
                Пополнить картой
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Мгновенное зачисление после оплаты
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {TOP_UP_AMOUNTS_USD.map((amountUsd) => (
                  <motion.button
                    key={amountUsd}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleCardTopUp(amountUsd)}
                    data-ocid={`balance.topup.button.${amountUsd}`}
                    className="relative flex flex-col items-center justify-center py-4 rounded-xl border-2 font-semibold transition-all cursor-pointer"
                    style={{
                      borderColor: "oklch(var(--primary) / 0.25)",
                      background: "oklch(var(--primary) / 0.04)",
                      color: "oklch(var(--foreground))",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "oklch(var(--primary) / 0.1)";
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "oklch(var(--primary) / 0.5)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "oklch(var(--primary) / 0.04)";
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "oklch(var(--primary) / 0.25)";
                    }}
                  >
                    <span
                      className="text-xl font-bold font-display leading-tight"
                      style={{ color: "oklch(var(--primary))" }}
                    >
                      {formatInCurrency(amountUsd, currencyInfo)}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      ≈ ${amountUsd}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Stripe trust badge */}
              <Separator className="mb-4" />
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Безопасная оплата через</span>
                <span
                  className="font-bold tracking-tight"
                  style={{ color: "oklch(var(--primary))" }}
                >
                  Stripe
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction history */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-display">
                <Clock className="w-5 h-5 text-muted-foreground" />
                История операций
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-10 text-center"
                  data-ocid="balance.history.empty_state"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                    style={{ background: "oklch(var(--muted))" }}
                  >
                    <Clock className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Операций пока нет
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Пополните баланс картой или обратитесь к администратору
                  </p>
                </div>
              ) : (
                <ul className="space-y-1" data-ocid="balance.history.list">
                  {history.map((tx, idx) => (
                    <motion.li
                      key={tx.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex items-center gap-3 py-3 px-1 rounded-lg hover:bg-muted/40 transition-colors"
                      data-ocid={`balance.history.item.${idx + 1}`}
                    >
                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background:
                            tx.type === "deposit"
                              ? "oklch(var(--success) / 0.12)"
                              : "oklch(var(--destructive) / 0.12)",
                        }}
                      >
                        {tx.type === "deposit" ? (
                          <ArrowDownLeft
                            className="w-4 h-4"
                            style={{ color: "oklch(var(--success))" }}
                          />
                        ) : (
                          <ArrowUpRight
                            className="w-4 h-4"
                            style={{ color: "oklch(var(--destructive))" }}
                          />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {tx.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(tx.date)}
                        </p>
                      </div>

                      {/* Amount */}
                      <Badge
                        variant="outline"
                        className="text-sm font-bold shrink-0"
                        style={{
                          color:
                            tx.type === "deposit"
                              ? "oklch(var(--success))"
                              : "oklch(var(--destructive))",
                          borderColor:
                            tx.type === "deposit"
                              ? "oklch(var(--success) / 0.3)"
                              : "oklch(var(--destructive) / 0.3)",
                          background:
                            tx.type === "deposit"
                              ? "oklch(var(--success) / 0.08)"
                              : "oklch(var(--destructive) / 0.08)",
                        }}
                      >
                        {tx.type === "deposit" ? "+" : "-"}
                        {format(tx.amount)}
                      </Badge>
                    </motion.li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
