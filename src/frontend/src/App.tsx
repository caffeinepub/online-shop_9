import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { CartProvider } from "./context/CartContext";
import { BalancePage } from "./pages/BalancePage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { HomePage } from "./pages/HomePage";
import { OrderSuccessPage } from "./pages/OrderSuccessPage";
import { PremiumPage } from "./pages/PremiumPage";
import { PremiumSuccessPage } from "./pages/PremiumSuccessPage";
import { ProductPage } from "./pages/ProductPage";
import { AdminBalancePage } from "./pages/admin/AdminBalancePage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminPremiumPage } from "./pages/admin/AdminPremiumPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminShowcasePage } from "./pages/admin/AdminShowcasePage";

// ─── Root Layout ───────────────────────────────────────────
function RootLayout() {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <Outlet />
        <Footer />
      </div>
      <Toaster richColors position="top-right" />
    </CartProvider>
  );
}

// ─── Routes ────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: RootLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/product/$id",
  component: ProductPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: CheckoutPage,
});

const orderSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order-success",
  component: OrderSuccessPage,
});

const premiumRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/premium",
  component: PremiumPage,
});

const premiumSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/premium-success",
  component: PremiumSuccessPage,
});

const balanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/balance",
  component: BalancePage,
});

// Admin layout wrapper — no header/footer separation needed (uses RootLayout)
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
});

// Redirect /admin → /admin/products
const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/admin/products" });
  },
});

const adminProductsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/products",
  component: AdminProductsPage,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/orders",
  component: AdminOrdersPage,
});

const adminPremiumRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/premium",
  component: AdminPremiumPage,
});

const adminShowcaseRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/showcase",
  component: AdminShowcasePage,
});

const adminBalanceRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/balance",
  component: AdminBalancePage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  productRoute,
  cartRoute,
  checkoutRoute,
  orderSuccessRoute,
  premiumRoute,
  premiumSuccessRoute,
  balanceRoute,
  adminLayoutRoute.addChildren([
    adminIndexRoute,
    adminProductsRoute,
    adminOrdersRoute,
    adminPremiumRoute,
    adminShowcaseRoute,
    adminBalanceRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
