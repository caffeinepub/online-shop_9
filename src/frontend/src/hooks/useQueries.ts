import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, OrderStatus, Product } from "../backend.d";
import { useActor } from "./useActor";

// ─── ChatMessage type (for new backend functions) ────────────
export interface ChatMessage {
  id: string;
  productId: string;
  senderId: Principal;
  senderName: string;
  text: string;
  timestamp: bigint;
}

// ─── Products ───────────────────────────────────────────────
export function useProducts(category: string | null = null) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts(category);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useProductById(productId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getProductById(productId);
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

export function useCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

// ─── Orders (admin) ─────────────────────────────────────────
export function useOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin role check ────────────────────────────────────────
export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutations ───────────────────────────────────────────────
export function usePlaceOrder() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (order: Order) => {
      if (!actor) throw new Error("No actor");
      return actor.placeOrder(order);
    },
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("No actor");
      return actor.createProduct(product);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
      void qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("No actor");
      return actor.updateProduct(product);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteProduct(productId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// ─── Premium ─────────────────────────────────────────────────
export function usePremiumStatus() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint | null>({
    queryKey: ["premiumStatus"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await (actor as any).getPremiumStatus();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useIsPremiumActive() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isPremiumActive"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await (actor as any).isPremiumActive();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useSetPremiumExpiry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (expiryNs: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).setPremiumExpiry(expiryNs);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["premiumStatus"] });
      void qc.invalidateQueries({ queryKey: ["isPremiumActive"] });
    },
  });
}

export function useGrantPremium() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({ user, days }: { user: Principal; days: bigint }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).grantPremium(user, days);
    },
  });
}

// ─── Chat ─────────────────────────────────────────────────────
export function useMessages(productId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ChatMessage[]>({
    queryKey: ["messages", productId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as any).getMessages(productId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!productId,
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      senderName,
      text,
    }: {
      productId: string;
      senderName: string;
      text: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).sendMessage(productId, senderName, text);
    },
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ["messages", vars.productId] });
    },
  });
}
