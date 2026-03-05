import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Crown,
  LogOut,
  Menu,
  Settings,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsPremiumActive } from "../hooks/useQueries";

export function Header() {
  const { totalItems } = useCart();
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = !!identity;

  const { data: isPremium } = useIsPremiumActive();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-2xl font-bold tracking-tight text-foreground hover:text-primary transition-colors"
          data-ocid="nav.link.1"
        >
          Магазин
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            data-ocid="nav.link.2"
          >
            Каталог
          </Link>
          <Link
            to="/admin/products"
            className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-1.5"
            data-ocid="nav.admin_link"
          >
            <Settings className="w-4 h-4" />
            Администратор
          </Link>
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Premium button */}
          {isPremium ? (
            <Link to="/premium" data-ocid="nav.premium_button">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="premium-glow flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(var(--premium)), oklch(var(--premium-dark)))",
                  color: "oklch(var(--premium-foreground))",
                }}
              >
                <Crown className="w-3.5 h-3.5" />
                PRO
              </motion.div>
            </Link>
          ) : (
            <Link to="/premium" data-ocid="nav.premium_button">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(var(--premium) / 0.12), oklch(var(--premium-dark) / 0.08))",
                  borderColor: "oklch(var(--premium) / 0.4)",
                  color: "oklch(var(--premium-dark))",
                }}
              >
                <Crown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Премиум</span>
              </motion.div>
            </Link>
          )}

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate({ to: "/cart" })}
            data-ocid="nav.cart_button"
            aria-label="Корзина"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 text-xs flex items-center justify-center bg-primary text-primary-foreground">
                {totalItems}
              </Badge>
            )}
          </Button>

          {/* Login/Logout */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-muted-foreground truncate max-w-24">
                {identity.getPrincipal().toString().slice(0, 8)}…
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={clear}
                aria-label="Выйти"
                data-ocid="nav.login_button"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              className="hidden md:flex items-center gap-2"
              data-ocid="nav.login_button"
            >
              <User className="w-4 h-4" />
              {isLoggingIn ? "Вход…" : "Войти"}
            </Button>
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Меню"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border bg-background"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <Link
                to="/"
                className="px-4 py-3 rounded-md text-sm font-medium hover:bg-muted transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Каталог
              </Link>
              <Link
                to="/admin/products"
                className="px-4 py-3 rounded-md text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Администратор
              </Link>
              {/* Premium in mobile menu */}
              <Link
                to="/premium"
                className="px-4 py-3 rounded-md text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
                data-ocid="nav.premium_button"
                style={{ color: "oklch(var(--premium-dark))" }}
              >
                <Crown className="w-4 h-4" />
                {isPremium ? "PRO — Активен" : "Премиум — $5/мес"}
              </Link>
              <div className="pt-2 border-t border-border">
                {isLoggedIn ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      clear();
                      setMobileOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Выйти
                  </Button>
                ) : (
                  <Button
                    className="w-full gap-2"
                    onClick={() => {
                      login();
                      setMobileOpen(false);
                    }}
                    disabled={isLoggingIn}
                  >
                    <User className="w-4 h-4" />
                    {isLoggingIn ? "Вход…" : "Войти"}
                  </Button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
