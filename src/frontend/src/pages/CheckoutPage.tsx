import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CreditCard, Loader2, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useBalance } from "../hooks/useBalance";
import { useCurrency } from "../hooks/useCurrency";
import { usePlaceOrder } from "../hooks/useQueries";
import { formatPrice } from "../utils/format";
import { generateId } from "../utils/format";

type PaymentMethod = "delivery" | "balance";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { mutateAsync: placeOrder, isPending } = usePlaceOrder();
  const { currentUser, isLoggedIn } = useAuth();
  const { balance, spendBalance } = useBalance();
  const { format: formatBalance } = useCurrency();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("delivery");

  const orderTotalInDollars = Number(totalPrice) / 100;
  const hasEnoughBalance = balance >= orderTotalInDollars;

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Введите имя";
    if (!form.phone.trim()) e.phone = "Введите номер телефона";
    else if (!/^[\d\s+\-()]{7,}$/.test(form.phone)) e.phone = "Неверный формат";
    if (!form.address.trim()) e.address = "Введите адрес доставки";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});

    // Balance payment check
    if (paymentMethod === "balance") {
      if (!isLoggedIn || !currentUser) {
        toast.error("Войдите в аккаунт для оплаты с баланса");
        return;
      }
      if (!hasEnoughBalance) {
        toast.error(
          `Недостаточно средств. Ваш баланс: ${formatBalance(balance)}, необходимо: ${formatBalance(orderTotalInDollars)}`,
        );
        return;
      }
      const spent = spendBalance(
        orderTotalInDollars,
        `Оплата заказа на $${orderTotalInDollars.toFixed(2)}`,
      );
      if (!spent) {
        toast.error("Не удалось списать средства с баланса. Попробуйте снова.");
        return;
      }
    }

    try {
      await placeOrder({
        id: generateId(),
        customerName: form.name,
        phoneNumber: form.phone,
        address: form.address,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: BigInt(i.quantity),
        })),
        totalPrice,
        status: OrderStatus.pending,
      });
      clearCart();
      void navigate({ to: "/order-success" });
    } catch {
      // If balance was already spent, refund it
      toast.error("Ошибка оформления заказа. Попробуйте снова.");
    }
  }

  if (items.length === 0) {
    void navigate({ to: "/cart" });
    return null;
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate({ to: "/cart" })}
        data-ocid="checkout.secondary_button"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад в корзину
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid lg:grid-cols-2 gap-8"
      >
        {/* Form */}
        <section>
          <h1 className="font-display text-3xl font-bold mb-6">
            Оформление заказа
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Имя и фамилия</Label>
              <Input
                id="name"
                placeholder="Иван Иванов"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className={errors.name ? "border-destructive" : ""}
                autoComplete="name"
                data-ocid="checkout.input"
              />
              {errors.name && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="checkout.error_state"
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className={errors.phone ? "border-destructive" : ""}
                autoComplete="tel"
                data-ocid="checkout.input"
              />
              {errors.phone && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="checkout.error_state"
                >
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address">Адрес доставки</Label>
              <Input
                id="address"
                placeholder="г. Москва, ул. Ленина, д. 1, кв. 10"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                className={errors.address ? "border-destructive" : ""}
                autoComplete="street-address"
                data-ocid="checkout.input"
              />
              {errors.address && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="checkout.error_state"
                >
                  {errors.address}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2.5">
              <Label>Способ оплаты</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Pay on delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("delivery")}
                  data-ocid="checkout.payment_method.tab"
                  className={[
                    "relative flex flex-col gap-1.5 rounded-xl border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    paymentMethod === "delivery"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-primary/40 hover:bg-muted/30",
                  ].join(" ")}
                >
                  {paymentMethod === "delivery" && (
                    <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-primary" />
                  )}
                  <span className="flex items-center gap-2">
                    <CreditCard
                      className={[
                        "w-4 h-4",
                        paymentMethod === "delivery"
                          ? "text-primary"
                          : "text-muted-foreground",
                      ].join(" ")}
                    />
                    <span
                      className={[
                        "text-sm font-semibold",
                        paymentMethod === "delivery"
                          ? "text-primary"
                          : "text-foreground",
                      ].join(" ")}
                    >
                      При получении
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground leading-snug">
                    Оплата наличными или картой курьеру
                  </span>
                </button>

                {/* Pay with balance */}
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (hasEnoughBalance) setPaymentMethod("balance");
                    }}
                    disabled={!hasEnoughBalance}
                    data-ocid="checkout.balance_pay.button"
                    className={[
                      "relative flex flex-col gap-1.5 rounded-xl border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      !hasEnoughBalance
                        ? "cursor-not-allowed opacity-60 border-border bg-muted/20"
                        : paymentMethod === "balance"
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30",
                    ].join(" ")}
                  >
                    {paymentMethod === "balance" && hasEnoughBalance && (
                      <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                    <span className="flex items-center gap-2">
                      <Wallet
                        className={[
                          "w-4 h-4",
                          paymentMethod === "balance" && hasEnoughBalance
                            ? "text-primary"
                            : "text-muted-foreground",
                        ].join(" ")}
                      />
                      <span
                        className={[
                          "text-sm font-semibold",
                          paymentMethod === "balance" && hasEnoughBalance
                            ? "text-primary"
                            : "text-foreground",
                        ].join(" ")}
                      >
                        С баланса
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground leading-snug">
                      Доступно:{" "}
                      <span
                        className={
                          hasEnoughBalance
                            ? "text-green-600 dark:text-green-400 font-medium"
                            : "text-destructive font-medium"
                        }
                      >
                        {formatBalance(balance)}
                      </span>
                    </span>
                    {!hasEnoughBalance && (
                      <span className="text-xs text-destructive mt-0.5">
                        Нужно ещё {formatBalance(orderTotalInDollars - balance)}
                      </span>
                    )}
                  </button>
                ) : (
                  <div className="flex flex-col gap-1.5 rounded-xl border-2 border-border bg-muted/20 p-4 opacity-60">
                    <span className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">
                        С баланса
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground leading-snug">
                      Войдите в аккаунт для оплаты с баланса
                    </span>
                  </div>
                )}
              </div>

              {/* Insufficient balance warning when balance method is selected */}
              {paymentMethod === "balance" && !hasEnoughBalance && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                  data-ocid="checkout.error_state"
                >
                  Недостаточно средств на балансе. Ваш баланс:{" "}
                  {formatBalance(balance)}, необходимо:{" "}
                  {formatBalance(orderTotalInDollars)}
                </motion.p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 text-base"
              disabled={
                isPending ||
                (paymentMethod === "balance" && !hasEnoughBalance) ||
                (paymentMethod === "balance" && !isLoggedIn)
              }
              data-ocid="checkout.submit_button"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending
                ? "Оформляем…"
                : paymentMethod === "balance"
                  ? `Оплатить с баланса ${formatBalance(orderTotalInDollars)}`
                  : "Подтвердить заказ"}
            </Button>
          </form>
        </section>

        {/* Summary */}
        <aside>
          <div className="bg-card rounded-lg border border-border p-6 shadow-xs">
            <h2 className="font-display text-xl font-bold mb-4">
              Состав заказа
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between gap-2 text-sm"
                >
                  <span className="text-muted-foreground truncate">
                    {item.name}{" "}
                    <span className="text-foreground">×{item.quantity}</span>
                  </span>
                  <span className="font-medium shrink-0">
                    {formatPrice(item.price * BigInt(item.quantity))}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Итого</span>
              <span className="font-display font-bold text-2xl text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Balance info in summary */}
            {isLoggedIn && paymentMethod === "balance" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 rounded-lg bg-primary/5 border border-primary/20 p-3"
              >
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ваш баланс</span>
                  <span className="font-semibold text-foreground">
                    {formatBalance(balance)}
                  </span>
                </div>
                {hasEnoughBalance && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">После оплаты</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {formatBalance(balance - orderTotalInDollars)}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </aside>
      </motion.div>
    </main>
  );
}
