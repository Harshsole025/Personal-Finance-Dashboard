export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  description: string;
  category: string;
  amount: number; // positive number
  type: TransactionType;
}

export interface UserProfile {
  id: string;
  email: string;
}

export interface AuthState {
  user: UserProfile | null;
}

export interface StoragePort {
  getAuth(): AuthState;
  setAuth(next: AuthState): void;

  listTransactions(userId: string): Transaction[];
  saveTransaction(userId: string, tx: Transaction): void;
  deleteTransaction(userId: string, id: string): void;
}

