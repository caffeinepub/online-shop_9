import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

export function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } =
    useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <main className="flex-1 container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
          data-ocid="cart.empty_state"
        >
          <ShoppingCart className="w-20 h-20 mx-auto text-muted-foreground/30 mb-6" />
          <h2 className="font-display text-3xl font-bold mb-2">
            Корзина пуста
          </h2>
          <p className="text-muted-foreground mb-8">
            Добавьте товары из каталога, чтобы продолжить
          </p>
          <Link to="/">
            <Button size="lg" className="gap-2">
              Перейти в каталог
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-10">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">
        Корзина
        <span className="ml-3 text-muted-foreground font-normal text-2xl">
          ({totalItems})
        </span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence initial={false}>
            {items.map((item, i) => {
              const displayIndex = i + 1;
              return (
                <motion.article
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-4 bg-card rounded-lg p-4 shadow-xs border border-border"
                  data-ocid={`cart.item.${displayIndex}`}
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
                    {item.imageSrc ? (
                      <img
                        src={item.imageSrc}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-snug line-clamp-2 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-primary font-display font-bold text-base">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        aria-label="Уменьшить количество"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        aria-label="Увеличить количество"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Subtotal + delete */}
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive h-8 w-8"
                      onClick={() => removeItem(item.productId)}
                      aria-label="Удалить товар"
                      data-ocid={`cart.delete_button.${displayIndex}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <p className="font-display font-bold text-sm">
                      {formatPrice(item.price * BigInt(item.quantity))}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-1">
          <div className="bg-card rounded-lg border border-border p-6 shadow-xs sticky top-24">
            <h2 className="font-display text-xl font-bold mb-4">Итого</h2>
            <div className="space-y-3 text-sm">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between gap-2"
                >
                  <span className="text-muted-foreground truncate">
                    {item.name}
                  </span>
                  <span className="shrink-0 font-medium">
                    {item.quantity} × {formatPrice(item.price)}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold">Сумма заказа</span>
              <span className="font-display font-bold text-xl">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <Button
              className="w-full gap-2 text-base"
              size="lg"
              onClick={() => navigate({ to: "/checkout" })}
              data-ocid="cart.submit_button"
            >
              Оформить заказ
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}
