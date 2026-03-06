import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Ban,
  CheckCircle,
  DollarSign,
  Hash,
  MessageCircle,
  MinusCircle,
  RefreshCw,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type ShopUser, useAuth } from "../../context/AuthContext";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function getBalance(userId: string): number {
  const raw = localStorage.getItem(`shop_balance_${userId}`);
  const parsed = Number.parseFloat(raw ?? "0");
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function AdminUsersPage() {
  const { getAllUsers, blockUser, unblockUser, deductBalance } = useAuth();
  const [users, setUsers] = useState<ShopUser[]>(() => getAllUsers());
  const [deductUserId, setDeductUserId] = useState("");
  const [deductAmount, setDeductAmount] = useState("");
  const [deductError, setDeductError] = useState("");

  function refresh() {
    setUsers(getAllUsers());
  }

  function handleBlock(userId: string) {
    blockUser(userId);
    toast.success(`Пользователь #${userId} заблокирован`);
    refresh();
  }

  function handleUnblock(userId: string) {
    unblockUser(userId);
    toast.success(`Пользователь #${userId} разблокирован`);
    refresh();
  }

  function handleDeduct() {
    setDeductError("");
    const trimId = deductUserId.trim();
    if (!trimId || !/^\d+$/.test(trimId)) {
      setDeductError("Введите числовой ID пользователя");
      return;
    }
    const amt = Number.parseFloat(deductAmount);
    if (!amt || amt <= 0) {
      setDeductError("Введите корректную сумму");
      return;
    }

    const result = deductBalance(trimId, amt);
    if (!result.ok) {
      setDeductError(result.error ?? "Ошибка списания");
      return;
    }

    toast.success(`С кошелька #${trimId} списано $${amt.toFixed(2)}`);
    setDeductUserId("");
    setDeductAmount("");
    refresh();
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(var(--primary) / 0.12)" }}
          >
            <Users
              className="w-5 h-5"
              style={{ color: "oklch(var(--primary))" }}
            />
          </div>
          <h1 className="font-display text-2xl font-bold">Пользователи</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          className="gap-1.5"
          data-ocid="admin.users.refresh.button"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Обновить
        </Button>
      </div>

      {/* Deduct from wallet */}
      <div
        className="bg-card border border-border rounded-xl p-6 space-y-4"
        data-ocid="admin.users.deduct.card"
      >
        <h2 className="font-semibold flex items-center gap-2">
          <MinusCircle
            className="w-4 h-4"
            style={{ color: "oklch(var(--destructive))" }}
          />
          Списать с кошелька
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="deduct-id"
              className="flex items-center gap-1.5 text-xs"
            >
              <Hash className="w-3 h-3" />
              ID пользователя
            </Label>
            <Input
              id="deduct-id"
              placeholder="например: 123456"
              value={deductUserId}
              onChange={(e) =>
                setDeductUserId(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              data-ocid="admin.users.deduct.user_id.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="deduct-amount"
              className="flex items-center gap-1.5 text-xs"
            >
              <DollarSign className="w-3 h-3" />
              Сумма ($)
            </Label>
            <Input
              id="deduct-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={deductAmount}
              onChange={(e) => setDeductAmount(e.target.value)}
              data-ocid="admin.users.deduct.amount.input"
            />
          </div>
        </div>

        {deductError && (
          <p
            className="text-sm rounded-lg px-3 py-2"
            style={{
              color: "oklch(var(--destructive))",
              background: "oklch(var(--destructive) / 0.08)",
              border: "1px solid oklch(var(--destructive) / 0.2)",
            }}
            data-ocid="admin.users.deduct.error_state"
          >
            {deductError}
          </p>
        )}

        <Button
          onClick={handleDeduct}
          variant="destructive"
          className="gap-2"
          data-ocid="admin.users.deduct.submit_button"
        >
          <MinusCircle className="w-4 h-4" />
          Списать средства
        </Button>
      </div>

      <Separator />

      {/* Users list */}
      {users.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="admin.users.empty_state"
        >
          <Users className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            Нет зарегистрированных пользователей
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Пользователи появятся после регистрации через форму
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="admin.users.list">
          <p className="text-sm text-muted-foreground">
            Всего пользователей: {users.length}
          </p>
          {users.map((user, idx) => {
            const balance = getBalance(user.userId);
            return (
              <div
                key={user.userId}
                className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                data-ocid={`admin.users.item.${idx + 1}`}
                style={
                  user.isBlocked
                    ? {
                        borderColor: "oklch(var(--destructive) / 0.3)",
                        background: "oklch(var(--destructive) / 0.03)",
                      }
                    : {}
                }
              >
                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{user.userId}
                    </span>
                    <span className="font-semibold text-sm truncate">
                      {user.email}
                    </span>
                    {user.isBlocked ? (
                      <Badge
                        variant="destructive"
                        className="text-xs"
                        data-ocid={`admin.users.blocked_badge.${idx + 1}`}
                      >
                        Заблокирован
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          color: "oklch(var(--success))",
                          borderColor: "oklch(var(--success) / 0.3)",
                          background: "oklch(var(--success) / 0.07)",
                        }}
                      >
                        Активен
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    {user.contact && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {user.contact}
                      </span>
                    )}
                    <span>Зарег. {formatDate(user.registeredAt)}</span>
                    <span
                      className="font-semibold"
                      style={{
                        color:
                          balance > 0 ? "oklch(var(--success))" : undefined,
                      }}
                    >
                      Баланс: ${balance.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {user.isBlocked ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnblock(user.userId)}
                      className="gap-1.5 text-xs"
                      style={{
                        borderColor: "oklch(var(--success) / 0.4)",
                        color: "oklch(var(--success))",
                      }}
                      data-ocid={`admin.users.unblock.button.${idx + 1}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Разблокировать
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBlock(user.userId)}
                      className="gap-1.5 text-xs"
                      style={{
                        borderColor: "oklch(var(--destructive) / 0.4)",
                        color: "oklch(var(--destructive))",
                      }}
                      data-ocid={`admin.users.block.button.${idx + 1}`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Заблокировать
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
