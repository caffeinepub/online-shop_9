import { useCallback, useEffect, useState } from "react";

export interface Transaction {
  id: string;
  type: "deposit" | "spend";
  amount: number;
  description: string;
  date: string;
}

const USER_ID_KEY = "shop_user_id";

/** Returns a stable 6-digit numeric ID for this browser session. */
export function getUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    // Generate a random 6-digit number (100000–999999)
    id = String(Math.floor(100000 + Math.random() * 900000));
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

function balanceKey(userId: string) {
  return `shop_balance_${userId}`;
}

function historyKey(userId: string) {
  return `shop_balance_history_${userId}`;
}

function readBalance(userId: string): number {
  const raw = localStorage.getItem(balanceKey(userId));
  const parsed = Number.parseFloat(raw ?? "0");
  return Number.isNaN(parsed) ? 0 : parsed;
}

function readHistory(userId: string): Transaction[] {
  try {
    const raw = localStorage.getItem(historyKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as Transaction[];
  } catch {
    return [];
  }
}

export function useBalance() {
  const userId = getUserId();
  const [balance, setBalance] = useState<number>(() => readBalance(userId));
  const [history, setHistory] = useState<Transaction[]>(() =>
    readHistory(userId),
  );

  // Sync balance to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(balanceKey(userId), balance.toFixed(2));
  }, [balance, userId]);

  // Sync history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(historyKey(userId), JSON.stringify(history));
  }, [history, userId]);

  const spendBalance = useCallback(
    (amount: number, description?: string): boolean => {
      const current = readBalance(userId);
      if (current < amount) return false;

      const tx: Transaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: "spend",
        amount,
        description: description ?? `Списание $${amount.toFixed(2)}`,
        date: new Date().toISOString(),
      };
      setBalance((prev) => Number.parseFloat((prev - amount).toFixed(2)));
      setHistory((prev) => [tx, ...prev]);
      return true;
    },
    [userId],
  );

  return { balance, history, userId, spendBalance };
}

/** Called by admin to top up a user's wallet by numeric ID. */
export function adminTopUpUser(
  targetUserId: string,
  amount: number,
  description?: string,
): boolean {
  if (!/^\d+$/.test(targetUserId)) return false;
  const current = (() => {
    const raw = localStorage.getItem(balanceKey(targetUserId));
    const parsed = Number.parseFloat(raw ?? "0");
    return Number.isNaN(parsed) ? 0 : parsed;
  })();

  const newBalance = Number.parseFloat((current + amount).toFixed(2));
  localStorage.setItem(balanceKey(targetUserId), newBalance.toFixed(2));

  const tx: Transaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type: "deposit",
    amount,
    description:
      description ?? `Пополнение от администратора на $${amount.toFixed(2)}`,
    date: new Date().toISOString(),
  };

  const existingHistory = (() => {
    try {
      const raw = localStorage.getItem(historyKey(targetUserId));
      if (!raw) return [];
      return JSON.parse(raw) as Transaction[];
    } catch {
      return [];
    }
  })();

  localStorage.setItem(
    historyKey(targetUserId),
    JSON.stringify([tx, ...existingHistory]),
  );

  return true;
}
