import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Principal as PrincipalClass } from "@dfinity/principal";
import type { Principal } from "@icp-sdk/core/principal";
import { Crown, Loader2, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGrantPremium } from "../../hooks/useQueries";

export function AdminPremiumPage() {
  const { mutateAsync: grantPremium, isPending } = useGrantPremium();
  const [principalStr, setPrincipalStr] = useState("");
  const [days, setDays] = useState("30");

  async function handleGrant() {
    if (!principalStr.trim()) {
      toast.error("Введите Principal");
      return;
    }
    const daysNum = Number(days);
    if (!daysNum || daysNum < 1) {
      toast.error("Укажите количество дней");
      return;
    }

    let principal: Principal;
    try {
      principal = PrincipalClass.fromText(
        principalStr.trim(),
      ) as unknown as Principal;
    } catch {
      toast.error("Неверный формат Principal");
      return;
    }

    try {
      await grantPremium({ user: principal, days: BigInt(daysNum) });
      toast.success(`Премиум выдан на ${daysNum} дней`);
      setPrincipalStr("");
      setDays("30");
    } catch {
      toast.error("Ошибка выдачи премиума");
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
        <div className="space-y-1.5">
          <Label htmlFor="grant-principal">Principal пользователя</Label>
          <Input
            id="grant-principal"
            placeholder="xxxxx-xxxxx-xxxxx-xxxxx-cai"
            value={principalStr}
            onChange={(e) => setPrincipalStr(e.target.value)}
            data-ocid="admin.premium.input"
          />
          <p className="text-xs text-muted-foreground">
            Введите Principal ID пользователя, которому нужно выдать Премиум.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="grant-days">Количество дней</Label>
          <Input
            id="grant-days"
            type="number"
            min="1"
            max="365"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            data-ocid="admin.premium.input"
          />
        </div>

        <Button
          onClick={handleGrant}
          disabled={isPending}
          className="w-full gap-2 font-semibold"
          data-ocid="admin.premium.submit_button"
          style={{
            background:
              "linear-gradient(135deg, oklch(var(--premium)), oklch(var(--premium-dark)))",
            color: "oklch(var(--premium-foreground))",
            border: "none",
          }}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserCheck className="w-4 h-4" />
          )}
          Выдать Премиум
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Премиум будет выдан немедленно и активирован на указанное количество
        дней. Повторная выдача продлевает срок действия.
      </p>
    </div>
  );
}
