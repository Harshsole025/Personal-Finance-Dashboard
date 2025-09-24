import { AuthState, StoragePort, Transaction } from '../types';

const AUTH_KEY = 'pf_auth_v1';
const TX_PREFIX = 'pf_txs_v1_';

function getTxKey(userId: string): string {
  return `${TX_PREFIX}${userId}`;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (_e) {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const localStorageAdapter: StoragePort = {
  getAuth(): AuthState {
    return readJSON<AuthState>(AUTH_KEY, { user: null });
  },
  setAuth(next: AuthState): void {
    writeJSON<AuthState>(AUTH_KEY, next);
  },
  listTransactions(userId: string): Transaction[] {
    return readJSON<Transaction[]>(getTxKey(userId), []);
  },
  saveTransaction(userId: string, tx: Transaction): void {
    const list = readJSON<Transaction[]>(getTxKey(userId), []);
    const idx = list.findIndex((t) => t.id === tx.id);
    if (idx >= 0) {
      list[idx] = tx;
    } else {
      list.unshift(tx);
    }
    writeJSON(getTxKey(userId), list);
  },
  deleteTransaction(userId: string, id: string): void {
    const list = readJSON<Transaction[]>(getTxKey(userId), []);
    const next = list.filter((t) => t.id !== id);
    writeJSON(getTxKey(userId), next);
  },
};

export type { StoragePort };

