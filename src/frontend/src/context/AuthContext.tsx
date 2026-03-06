import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getUserId } from "../hooks/useBalance";

export interface ShopUser {
  userId: string; // numeric string, same as balance userId
  email: string;
  passwordHash: string; // simple hash stored in localStorage
  contact: string; // WhatsApp or Telegram number/username
  isBlocked: boolean;
  registeredAt: string;
}

interface AuthContextValue {
  currentUser: ShopUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (
    email: string,
    password: string,
    contact: string,
  ) => { ok: boolean; error?: string };
  logout: () => void;
  getAllUsers: () => ShopUser[];
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  deductBalance: (
    userId: string,
    amount: number,
  ) => { ok: boolean; error?: string };
}

const USERS_KEY = "shop_registered_users";
const SESSION_KEY = "shop_current_session";

function simpleHash(str: string): string {
  // Very simple hash — just for demo; not cryptographically secure
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    h = (h << 5) - h + char;
    h = h & h;
  }
  return Math.abs(h).toString(36);
}

function loadUsers(): ShopUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ShopUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: ShopUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadSession(): ShopUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShopUser;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<ShopUser | null>(() =>
    loadSession(),
  );

  // Keep session fresh: re-read from users list so blocked status propagates
  const currentUserId = currentUser?.userId;
  useEffect(() => {
    if (!currentUserId) return;
    const users = loadUsers();
    const fresh = users.find((u) => u.userId === currentUserId);
    if (fresh) {
      setCurrentUser(fresh);
      localStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
    }
  }, [currentUserId]);

  const login = useCallback(
    (email: string, password: string): { ok: boolean; error?: string } => {
      const users = loadUsers();
      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      if (!user) return { ok: false, error: "Пользователь не найден" };
      if (user.passwordHash !== simpleHash(password))
        return { ok: false, error: "Неверный пароль" };
      if (user.isBlocked)
        return {
          ok: false,
          error: "Ваш аккаунт заблокирован. Обратитесь к администратору.",
        };

      setCurrentUser(user);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return { ok: true };
    },
    [],
  );

  const register = useCallback(
    (
      email: string,
      password: string,
      contact: string,
    ): { ok: boolean; error?: string } => {
      const users = loadUsers();
      const exists = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      if (exists)
        return {
          ok: false,
          error: "Пользователь с таким email уже существует",
        };

      // Re-use existing userId from balance system or generate new one
      const userId = getUserId();

      const newUser: ShopUser = {
        userId,
        email,
        passwordHash: simpleHash(password),
        contact,
        isBlocked: false,
        registeredAt: new Date().toISOString(),
      };

      const updated = [...users, newUser];
      saveUsers(updated);
      setCurrentUser(newUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      return { ok: true };
    },
    [],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const getAllUsers = useCallback((): ShopUser[] => {
    return loadUsers();
  }, []);

  const blockUser = useCallback((userId: string) => {
    const users = loadUsers();
    const updated = users.map((u) =>
      u.userId === userId ? { ...u, isBlocked: true } : u,
    );
    saveUsers(updated);
    // If blocked user is current session, force logout
    setCurrentUser((prev) => {
      if (prev?.userId === userId) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return prev;
    });
  }, []);

  const unblockUser = useCallback((userId: string) => {
    const users = loadUsers();
    const updated = users.map((u) =>
      u.userId === userId ? { ...u, isBlocked: false } : u,
    );
    saveUsers(updated);
  }, []);

  const deductBalance = useCallback(
    (userId: string, amount: number): { ok: boolean; error?: string } => {
      if (!/^\d+$/.test(userId)) return { ok: false, error: "Неверный ID" };
      if (amount <= 0) return { ok: false, error: "Неверная сумма" };

      const balanceKey = `shop_balance_${userId}`;
      const historyKey = `shop_balance_history_${userId}`;

      const currentBalance = (() => {
        const raw = localStorage.getItem(balanceKey);
        const parsed = Number.parseFloat(raw ?? "0");
        return Number.isNaN(parsed) ? 0 : parsed;
      })();

      if (currentBalance < amount)
        return { ok: false, error: "Недостаточно средств на кошельке" };

      const newBalance = Number.parseFloat(
        (currentBalance - amount).toFixed(2),
      );
      localStorage.setItem(balanceKey, newBalance.toFixed(2));

      const tx = {
        id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: "spend",
        amount,
        description: `Списание администратором $${amount.toFixed(2)}`,
        date: new Date().toISOString(),
      };

      const existingHistory = (() => {
        try {
          const raw = localStorage.getItem(historyKey);
          if (!raw) return [];
          return JSON.parse(raw);
        } catch {
          return [];
        }
      })();

      localStorage.setItem(
        historyKey,
        JSON.stringify([tx, ...existingHistory]),
      );

      return { ok: true };
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        login,
        register,
        logout,
        getAllUsers,
        blockUser,
        unblockUser,
        deductBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
