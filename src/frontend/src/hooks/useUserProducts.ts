import { useCallback, useEffect, useState } from "react";

const USER_PRODUCTS_KEY = "shop_user_products";
const FREE_TIER_LIMIT = 10;

export interface UserProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number; // in cents (e.g. 999 = $9.99)
  inStock: boolean;
  imageUrl?: string; // base64 or URL
  sellerId: string;
  sellerEmail: string;
  createdAt: string;
}

function loadAllUserProducts(): UserProduct[] {
  try {
    const raw = localStorage.getItem(USER_PRODUCTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserProduct[];
  } catch {
    return [];
  }
}

function saveAllUserProducts(products: UserProduct[]): void {
  localStorage.setItem(USER_PRODUCTS_KEY, JSON.stringify(products));
}

function isPremiumActive(userId: string): boolean {
  // Check by expiry key
  const expiryStr = localStorage.getItem(`shop_premium_expiry_${userId}`);
  if (expiryStr) {
    const expiry = Number(expiryStr);
    if (!Number.isNaN(expiry) && expiry > Date.now()) return true;
  }
  // Check by old key pattern
  const premiumStr = localStorage.getItem(`shop_premium_${userId}`);
  if (premiumStr) {
    const expiry = Number(premiumStr);
    if (!Number.isNaN(expiry) && expiry > Date.now()) return true;
  }
  return false;
}

export function useUserProducts(currentUserId?: string) {
  const [products, setProducts] = useState<UserProduct[]>(() =>
    loadAllUserProducts(),
  );

  // Re-sync from localStorage when component mounts or userId changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional re-sync on userId change
  useEffect(() => {
    setProducts(loadAllUserProducts());
  }, [currentUserId]);

  const getAllUserProducts = useCallback((): UserProduct[] => {
    return loadAllUserProducts();
  }, []);

  const getMyProducts = useCallback(
    (userId: string): UserProduct[] => {
      return products.filter((p) => p.sellerId === userId);
    },
    [products],
  );

  const addProduct = useCallback(
    (
      data: Omit<UserProduct, "id" | "createdAt">,
    ): { ok: boolean; error?: string } => {
      if (!currentUserId) return { ok: false, error: "Не авторизованы" };

      const all = loadAllUserProducts();
      const myProducts = all.filter((p) => p.sellerId === currentUserId);
      const userIsPremium = isPremiumActive(currentUserId);

      if (!userIsPremium && myProducts.length >= FREE_TIER_LIMIT) {
        return {
          ok: false,
          error: `Достигнут лимит ${FREE_TIER_LIMIT} товаров. Купите Премиум для неограниченных товаров.`,
        };
      }

      const newProduct: UserProduct = {
        ...data,
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
      };

      const updated = [...all, newProduct];
      saveAllUserProducts(updated);
      setProducts(updated);
      return { ok: true };
    },
    [currentUserId],
  );

  const updateProduct = useCallback(
    (data: UserProduct): { ok: boolean; error?: string } => {
      if (!currentUserId) return { ok: false, error: "Не авторизованы" };

      const all = loadAllUserProducts();
      const idx = all.findIndex((p) => p.id === data.id);
      if (idx === -1) return { ok: false, error: "Товар не найден" };
      if (all[idx].sellerId !== currentUserId)
        return { ok: false, error: "Нет прав на редактирование" };

      const updated = [...all];
      updated[idx] = { ...data };
      saveAllUserProducts(updated);
      setProducts(updated);
      return { ok: true };
    },
    [currentUserId],
  );

  const deleteProduct = useCallback(
    (id: string): { ok: boolean; error?: string } => {
      if (!currentUserId) return { ok: false, error: "Не авторизованы" };

      const all = loadAllUserProducts();
      const product = all.find((p) => p.id === id);
      if (!product) return { ok: false, error: "Товар не найден" };
      if (product.sellerId !== currentUserId)
        return { ok: false, error: "Нет прав на удаление" };

      const updated = all.filter((p) => p.id !== id);
      saveAllUserProducts(updated);
      setProducts(updated);
      return { ok: true };
    },
    [currentUserId],
  );

  const myProducts = currentUserId
    ? products.filter((p) => p.sellerId === currentUserId)
    : [];

  const userIsPremium = currentUserId ? isPremiumActive(currentUserId) : false;
  const productLimit = userIsPremium
    ? Number.POSITIVE_INFINITY
    : FREE_TIER_LIMIT;
  const canAddMore = myProducts.length < productLimit;

  return {
    products,
    myProducts,
    getAllUserProducts,
    getMyProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    productLimit: userIsPremium ? null : FREE_TIER_LIMIT,
    canAddMore,
    isPremium: userIsPremium,
  };
}
