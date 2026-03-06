import { Link, Outlet } from "@tanstack/react-router";
import {
  ArrowLeft,
  ClipboardList,
  Crown,
  Lightbulb,
  Lock,
  Package,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { AdminPasswordGate } from "./AdminPasswordGate";

export function AdminLayout() {
  // Local password-gate auth state, seeded from sessionStorage
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("admin_authenticated") === "true",
  );

  function handleLogout() {
    sessionStorage.removeItem("admin_authenticated");
    setAuthed(false);
  }

  // Password gate — show login form until correct password is entered
  if (!authed) {
    return <AdminPasswordGate onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-border bg-card">
        <nav className="p-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-3 py-2">
            Управление
          </p>
          <Link
            to="/admin/products"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors [&.active]:bg-primary [&.active]:text-primary-foreground"
          >
            <Package className="w-4 h-4" />
            Товары
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors [&.active]:bg-primary [&.active]:text-primary-foreground"
          >
            <ClipboardList className="w-4 h-4" />
            Заказы
          </Link>
          <Link
            to="/admin/showcase"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors [&.active]:bg-primary [&.active]:text-primary-foreground"
          >
            <Lightbulb className="w-4 h-4" />
            Витрина лампочек
          </Link>
          <Link
            to="/admin/premium"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors [&.active]:bg-primary [&.active]:text-primary-foreground"
            style={{ color: "oklch(var(--premium-dark))" }}
          >
            <Crown className="w-4 h-4" />
            Премиум
          </Link>
          <Link
            to="/admin/balance"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors [&.active]:bg-primary [&.active]:text-primary-foreground"
            data-ocid="admin.nav.balance.link"
          >
            <Wallet className="w-4 h-4" />
            Кошельки
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors [&.active]:bg-primary [&.active]:text-primary-foreground"
            data-ocid="admin.nav.users.link"
          >
            <Users className="w-4 h-4" />
            Пользователи
          </Link>

          <div className="pt-4 border-t border-border mt-2 space-y-1">
            {/* Refresh page */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              data-ocid="admin.refresh.button"
            >
              <RefreshCw className="w-4 h-4" />
              Обновить страницу
            </button>

            <Link
              to="/"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              На сайт
            </Link>

            {/* Logout from admin panel */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
              data-ocid="admin.logout.button"
            >
              <Lock className="w-4 h-4" />
              Выйти из админки
            </button>
          </div>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
