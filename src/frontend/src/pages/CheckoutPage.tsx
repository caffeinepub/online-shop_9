import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../backend.d";
import { useCart } from "../context/CartContext";
import { usePlaceOrder } from "../hooks/useQueries";
import { formatPrice } from "../utils/format";
import { generateId } from "../utils/format";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { mutateAsync: placeOrder, isPending } = usePlaceOrder();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
                  data-ocid="checkout.name_error"
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
                  data-ocid="checkout.phone_error"
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
                  data-ocid="checkout.address_error"
                >
                  {errors.address}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 text-base"
              disabled={isPending}
              data-ocid="checkout.submit_button"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Оформляем…" : "Подтвердить заказ"}
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
          </div>
        </aside>
      </motion.div>
    </main>
  );
}
