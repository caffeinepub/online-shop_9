import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Crown, UserCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { adminGrantPremiumToUser } from "../../hooks/useBalance";

interface SuccessInfo {
  userId: string;
  days: number;
}

export function AdminPremiumPage() {
  const [userId, setUserId] = useState("");
  const [days, setDays] = useState("30");
  const [lastSuccess, setLastSuccess] = useState<SuccessInfo | null>(null);

  function handleGrant() {
    const trimmedId = userId.trim();
    if (!trimmedId || !/^\d+$/.test(trimmedId)) {
      toast.error("Введите корректный числовой ID пользователя");
      return;
    }

    const daysNum = Number(days);
    if (!daysNum || daysNum < 1) {
      toast.error("Укажите количество дней (минимум 1)");
      return;
    }

    const ok = adminGrantPremiumToUser(trimmedId, daysNum);
    if (ok) {
      toast.success(
        `Премиум выдан пользователю #${trimmedId} на ${daysNum} дней`,
      );
      setLastSuccess({ userId: trimmedId, days: daysNum });
      setUserId("");
      setDays("30");
    } else {
      toast.error("Ошибка выдачи премиума. Проверьте введённые данные.");
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "oklch(var(--premium) / 0.15)" }}
        >
          <Crown
            className="w-5 h-5"
            style={{ color: "oklch(var(--premium-dark))" }}
          />
        </div>
        <h1 className="font-display text-2xl font-bold">
          Управление Премиумом
        </h1>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        {/* User ID input */}
        <div className="space-y-1.5">
          <Label htmlFor="grant-user-id">ID пользователя</Label>
          <Input
            id="grant-user-id"
            placeholder="например: 123456"
            value={userId}
            maxLength={10}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setUserId(val);
            }}
            data-ocid="admin.premium.user_id.input"
          />
          <p className="text-xs text-muted-foreground">
            Введите числовой ID пользователя, которому нужно выдать Премиум.
            Пользователь видит свой ID на странице "Мой баланс".
          </p>
        </div>

        {/* Days input */}
        <div className="space-y-1.5">
          <Label htmlFor="grant-days">Количество дней</Label>
          <Input
            id="grant-days"
            type="number"
            min="1"
            max="365"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            data-ocid="admin.premium.days.input"
          />
        </div>

        <Button
          onClick={handleGrant}
          className="w-full gap-2 font-semibold"
          data-ocid="admin.premium.submit_button"
          style={{
            background:
              "linear-gradient(135deg, oklch(var(--premium)), oklch(var(--premium-dark)))",
            color: "oklch(var(--premium-foreground))",
            border: "none",
          }}
        >
          <UserCheck className="w-4 h-4" />
          Выдать Премиум
        </Button>
      </div>

      {/* Success state */}
      <AnimatePresence>
        {lastSuccess && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3 rounded-xl border px-5 py-4"
            style={{
              borderColor: "oklch(var(--success) / 0.35)",
              background: "oklch(var(--success) / 0.07)",
            }}
            data-ocid="admin.premium.success_state"
          >
            <CheckCircle2
              className="w-5 h-5 mt-0.5 shrink-0"
              style={{ color: "oklch(var(--success))" }}
            />
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "oklch(var(--success))" }}
              >
                Премиум успешно выдан
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Пользователь{" "}
                <span className="font-mono font-bold">
                  #{lastSuccess.userId}
                </span>{" "}
                — {lastSuccess.days}{" "}
                {lastSuccess.days === 1
                  ? "день"
                  : lastSuccess.days < 5
                    ? "дня"
                    : "дней"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-muted-foreground">
        Премиум будет выдан немедленно и активирован на указанное количество
        дней. Повторная выдача продлевает срок действия.
      </p>
    </div>
  );
}
