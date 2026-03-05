import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OrderItem {
    productId: string;
    quantity: bigint;
}
export interface Order {
    id: string;
    customerName: string;
    status: OrderStatus;
    address: string;
    items: Array<OrderItem>;
    phoneNumber: string;
    totalPrice: bigint;
}
export interface UserProfile {
    name: string;
    email?: string;
    phone?: string;
}
export interface Product {
    id: string;
    inStock: boolean;
    name: string;
    description: string;
    category: string;
    imageId?: string;
    price: bigint;
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProduct(product: Product): Promise<void>;
    deleteProduct(productId: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<string>>;
    getOrders(): Promise<Array<Order>>;
    getProductById(productId: string): Promise<Product>;
    getProducts(category: string | null): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(order: Order): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
    updateProduct(product: Product): Promise<void>;
}
