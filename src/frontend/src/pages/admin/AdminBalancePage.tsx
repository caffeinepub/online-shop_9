import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Hash, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { adminTopUpUser } from "../../hooks/useBalance";
import {
  CURRENCIES,
  type CurrencyCode,
  type CurrencyInfo,
  formatInCurrency,
  getCurrencyInfo,
} from "../../hooks/useCurrency";

const QUICK_AMOUNTS_BY_CURRENCY: Record<CurrencyCode, number[]> = {
  USD: [5, 10, 20, 50, 100],
  RUB: [500, 1000, 2000, 5000, 10000],
  TJS: [50, 100, 200, 500, 1000],
};

export function AdminBalancePage() {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("USD");
  const [lastTopUp, setLastTopUp] = useState<{
    userId: string;
    amountUsd: number;
    displayAmount: string;
  } | null>(null);

  const currencyInfo: CurrencyInfo = getCurrencyInfo(selectedCurrency);
  const quickAmounts = QUICK_AMOUNTS_BY_CURRENCY[selectedCurrency];

  function toUsd(localAmount: number): number {
    return localAmount / currencyInfo.rateToUsd;
  }

  function handleTopUp() {
    const trimmedId = userId.trim();
    if (!trimmedId || !/^\d+$/.test(trimmedId)) {
      toast.error("Введите числовой ID пользователя");
      return;
    }

    const amountNum = Number.parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error("Введите корректную сумму");
      return;
    }

    const amountUsd = toUsd(amountNum);
    const displayAmount = formatInCurrency(amountUsd, currencyInfo);

    const ok = adminTopUpUser(
      trimmedId,
      amountUsd,
      `Пополнение от администратора на ${displayAmount}`,
    );

    if (ok) {
      setLastTopUp({ userId: trimmedId, amountUsd, displayAmount });
      toast.success(
        `Баланс пользователя #${trimmedId} пополнен на ${displayAmount}`,
      );
      setUserId("");
      setAmount("");
    } else {
      toast.error("Ошибка: неверный формат ID");
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "oklch(var(--primary) / 0.12)" }}
        >
          <Wallet
            className="w-5 h-5"
            style={{ color: "oklch(var(--primary))" }}
          />
        </div>
        <h1 className="font-display text-2xl font-bold">
          Пополнение кошельков
        </h1>
      </div>

      {/* Form */}
      <div
        className="bg-card border border-border rounded-xl p-6 space-y-5"
        data-ocid="admin.balance.card"
      >
        {/* Currency selector */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Валюта пополнения</Label>
          <div className="flex gap-2 flex-wrap">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setSelectedCurrency(c.code as CurrencyCode);
                  setAmount("");
                }}
                data-ocid={"admin.balance.currency.tab"}
                className={[
                  "px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all",
                  selectedCurrency === c.code
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40",
                ].join(" ")}
                style={
                  selectedCurrency === c.code
                    ? { background: "oklch(var(--primary) / 0.08)" }
                    : {}
                }
              >
                {c.symbol} {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* User ID */}
        <div className="space-y-1.5">
          <Label htmlFor="topup-user-id" className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" />
            ID пользователя (только цифры)
          </Label>
          <Input
            id="topup-user-id"
            placeholder="например: 123456"
            value={userId}
            onChange={(e) =>
              setUserId(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            data-ocid="admin.balance.user_id.input"
          />
          <p className="text-xs text-muted-foreground">
            Пользователь видит свой ID на странице "Мой баланс".
          </p>
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <Label htmlFor="topup-amount" className="flex items-center gap-1.5">
            <span className="font-bold">{currencyInfo.symbol}</span>
            Сумма пополнения ({currencyInfo.name})
          </Label>
          <Input
            id="topup-amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            data-ocid="admin.balance.amount.input"
          />
          {amount && Number.parseFloat(amount) > 0 && (
            <p className="text-xs text-muted-foreground">
              ≈ ${toUsd(Number.parseFloat(amount)).toFixed(2)} USD
            </p>
          )}
        </div>

        {/* Quick amount buttons */}
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map((a) => (
            <Button
              key={a}
              variant="outline"
              size="sm"
              onClick={() => setAmount(String(a))}
              className="font-semibold hover:border-primary hover:text-primary transition-colors"
              data-ocid={`admin.balance.quick_button.${a}`}
            >
              +{currencyInfo.symbol}
              {a}
            </Button>
          ))}
        </div>

        <Separator />

        <Button
          onClick={handleTopUp}
          className="w-full h-11 font-semibold gap-2"
          data-ocid="admin.balance.submit_button"
        >
          <Wallet className="w-4 h-4" />
          Пополнить баланс
        </Button>
      </div>

      {/* Last successful top-up */}
      {lastTopUp && (
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-xl border border-border bg-card"
          data-ocid="admin.balance.success_state"
          style={{ borderColor: "oklch(var(--success) / 0.4)" }}
        >
          <CheckCircle
            className="w-5 h-5 shrink-0"
            style={{ color: "oklch(var(--success))" }}
          />
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "oklch(var(--success))" }}
            >
              Успешно пополнено
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Пользователь #{lastTopUp.userId} &nbsp;+{lastTopUp.displayAmount}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Баланс зачисляется немедленно. Пользователь увидит изменение при
        следующем открытии страницы баланса.
      </p>
    </div>
  );
}
