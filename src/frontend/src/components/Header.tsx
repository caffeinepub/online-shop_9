import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Crown,
  LogOut,
  Menu,
  RefreshCw,
  Settings,
  ShoppingCart,
  User,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useBalance } from "../hooks/useBalance";
import { useIsPremiumActive } from "../hooks/useQueries";

export function Header() {
  const { totalItems } = useCart();
  const { currentUser, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { balance } = useBalance();

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

          {/* Refresh */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.reload()}
            data-ocid="nav.refresh_button"
            aria-label="Обновить страницу"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>

          {/* Wallet / Balance */}
          <Link to="/balance" data-ocid="nav.balance_button">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5 px-2.5"
              aria-label="Мой баланс"
              asChild={false}
            >
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-semibold tabular-nums">
                ${balance.toFixed(2)}
              </span>
            </Button>
          </Link>

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

          {/* Login / Register / User info */}
          {isLoggedIn && currentUser ? (
            <div className="hidden md:flex items-center gap-2">
              <span
                className="text-xs text-muted-foreground truncate max-w-28 font-medium"
                title={currentUser.email}
              >
                {currentUser.email.split("@")[0]}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                aria-label="Выйти"
                data-ocid="nav.logout_button"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/login" })}
                className="flex items-center gap-1.5"
                data-ocid="nav.login_button"
              >
                <User className="w-4 h-4" />
                Войти
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/register" })}
                className="flex items-center gap-1.5"
                data-ocid="nav.register_button"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden lg:inline">Регистрация</span>
              </Button>
            </div>
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
                {isLoggedIn && currentUser ? (
                  <div className="space-y-1">
                    <p className="px-4 py-2 text-xs text-muted-foreground font-medium">
                      {currentUser.email}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      data-ocid="nav.mobile_logout_button"
                    >
                      <LogOut className="w-4 h-4" />
                      Выйти
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      className="w-full gap-2"
                      onClick={() => {
                        navigate({ to: "/login" });
                        setMobileOpen(false);
                      }}
                      data-ocid="nav.mobile_login_button"
                    >
                      <User className="w-4 h-4" />
                      Войти
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        navigate({ to: "/register" });
                        setMobileOpen(false);
                      }}
                      data-ocid="nav.mobile_register_button"
                    >
                      <UserPlus className="w-4 h-4" />
                      Зарегистрироваться
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
