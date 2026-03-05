import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";

export function OrderSuccessPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
        className="max-w-md w-full text-center bg-card rounded-2xl border border-border p-10 shadow-product"
        data-ocid="order_success.panel"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.15,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </motion.div>

        <h1 className="font-display text-3xl font-bold mb-3">
          Заказ оформлен!
        </h1>
        <p className="text-muted-foreground mb-2">
          Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время для
          подтверждения.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Статус заказа можно уточнить по телефону.
        </p>

        <Link to="/">
          <Button size="lg" className="w-full gap-2">
            <ShoppingBag className="w-4 h-4" />
            Продолжить покупки
          </Button>
        </Link>
      </motion.div>
    </main>
  );
}
