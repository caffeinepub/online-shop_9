import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, DollarSign, Hash, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { adminTopUpUser } from "../../hooks/useBalance";

const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

export function AdminBalancePage() {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [lastTopUp, setLastTopUp] = useState<{
    userId: string;
    amount: number;
  } | null>(null);

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

    const ok = adminTopUpUser(
      trimmedId,
      amountNum,
      `Пополнение от администратора на $${amountNum.toFixed(2)}`,
    );

    if (ok) {
      setLastTopUp({ userId: trimmedId, amount: amountNum });
      toast.success(
        `Баланс пользователя #${trimmedId} пополнен на $${amountNum.toFixed(2)}`,
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
            <DollarSign className="w-3.5 h-3.5" />
            Сумма пополнения ($)
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
        </div>

        {/* Quick amount buttons */}
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((a) => (
            <Button
              key={a}
              variant="outline"
              size="sm"
              onClick={() => setAmount(String(a))}
              className="font-semibold hover:border-primary hover:text-primary transition-colors"
              data-ocid={`admin.balance.quick_button.${a}`}
            >
              +${a}
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
              Пользователь #{lastTopUp.userId} &nbsp;+$
              {lastTopUp.amount.toFixed(2)}
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
