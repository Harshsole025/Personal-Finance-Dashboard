import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { localStorageAdapter } from '../../storage/localStorageAdapter';
import type { Transaction } from '../../types';
import { generateId } from '../../lib/uid';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToCsv } from '../../lib/csv';
import { useToast } from '../../components/Toast';
import { ThemeToggle } from '../../components/ThemeToggle';

function useAuthUserId(): string | null {
  return localStorageAdapter.getAuth().user?.id ?? null;
}

export function DashboardLayout() {
  const navigate = useNavigate();
  const userId = useAuthUserId();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 250);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const toast = useToast();

  if (!userId) {
    navigate('/');
  }

  const [form, setForm] = useState<Partial<Transaction>>({
    date: new Date().toISOString().slice(0, 10),
    type: 'expense',
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => (userId ? localStorageAdapter.listTransactions(userId) : []));
  function reload() {
    if (!userId) return;
    setTransactions(localStorageAdapter.listTransactions(userId));
  }
  // Load when user changes
  if (userId && transactions.length === 0 && localStorageAdapter.listTransactions(userId).length !== 0) {
    setTransactions(localStorageAdapter.listTransactions(userId));
  }

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((t) =>
      [t.description, t.category, t.type, t.date].some((v) => v.toLowerCase().includes(q)),
    );
  }, [transactions, debouncedQuery]);

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  type SortKey = 'date' | 'amount' | 'type' | 'category' | 'description';
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  function onSort(key: SortKey) {
    setPage(1);
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      let va: string | number = '';
      let vb: string | number = '';
      if (sortKey === 'amount') { va = a.amount; vb = b.amount; }
      else if (sortKey === 'date') { va = a.date; vb = b.date; }
      else if (sortKey === 'type') { va = a.type; vb = b.type; }
      else if (sortKey === 'category') { va = a.category; vb = b.category; }
      else { va = a.description; vb = b.description; }
      return va > vb ? dir : va < vb ? -dir : 0;
    });
  }, [filtered, sortKey, sortDir]);

  function resetForm() {
    setForm({ date: new Date().toISOString().slice(0, 10), type: 'expense' });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    const next: Transaction = {
      id: (form as Transaction).id ?? generateId(),
      date: form.date!,
      description: form.description || '',
      category: form.category || 'General',
      amount: Number(form.amount || 0),
      type: (form.type as 'income' | 'expense') || 'expense',
    };
    localStorageAdapter.saveTransaction(userId, next);
    toast.add((form as Transaction).id ? 'Transaction updated' : 'Transaction added');
    resetForm();
    reload();
  }

  function handleEdit(tx: Transaction) {
    setForm({ ...tx });
  }

  function handleDelete(id: string) {
    if (!userId) return;
    const ok = window.confirm('Delete this transaction?');
    if (!ok) return;
    localStorageAdapter.deleteTransaction(userId, id);
    toast.add('Transaction deleted');
    reload();
  }

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));

  const chartData = useMemo(() => {
    const byDate: Record<string, { date: string; income: number; expense: number }> = {};
    for (const t of filtered) {
      const d = t.date;
      if (!byDate[d]) byDate[d] = { date: d, income: 0, expense: 0 };
      if (t.type === 'income') byDate[d].income += t.amount;
      else byDate[d].expense += t.amount;
    }
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  function logout() {
    localStorageAdapter.setAuth({ user: null });
    navigate('/');
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold header-link">Dashboard</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={logout} className="text-sm header-link">Logout</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl w-full px-4 py-6 space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card p-4">
            <div className="text-xs text-zinc-500">Income</div>
            <div className="text-2xl font-bold text-emerald-600">${totalIncome.toFixed(2)}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-zinc-500">Expenses</div>
            <div className="text-2xl font-bold text-rose-600">${totalExpense.toFixed(2)}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-zinc-500">Balance</div>
            <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit} className="card p-4 space-y-3 lg:col-span-1">
            <h2 className="font-semibold">Add / Edit Transaction</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm">Date</label>
                <input type="date" className="input" value={form.date || ''} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm">Type</label>
                <select className="input" value={form.type || 'expense'} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Transaction['type'] }))}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm">Description</label>
                <input className="input" placeholder="Description" value={form.description || ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm">Category</label>
                <input className="input" placeholder="Category" value={form.category || ''} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm">Amount</label>
                <input type="number" step="0.01" className="input" value={form.amount?.toString() || ''} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" className="btn-outline" onClick={resetForm}>Reset</button>
            </div>
          </form>

          <div className="card p-4 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <h2 className="font-semibold">Transactions</h2>
              <input className="rounded-md border px-3 py-2 w-full sm:w-64" placeholder="Search..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
            </div>
            {sorted.length === 0 && (
              <div className="text-center text-sm text-zinc-500 py-10">
                No transactions yet. 
                <button className="ml-1 text-zinc-900 underline" onClick={() => {
                  if (!userId) return;
                  const seed: Transaction[] = [
                    { id: generateId(), date: new Date().toISOString().slice(0,10), description: 'Salary', category: 'Income', amount: 2500, type: 'income' },
                    { id: generateId(), date: new Date().toISOString().slice(0,10), description: 'Groceries', category: 'Food', amount: 85.5, type: 'expense' },
                    { id: generateId(), date: new Date().toISOString().slice(0,10), description: 'Transport', category: 'Travel', amount: 20, type: 'expense' },
                  ];
                  seed.forEach((t) => localStorageAdapter.saveTransaction(userId, t));
                  reload();
                  toast.add('Sample data added');
                }}>Add sample data</button>
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs muted">Sorted by <span className="font-medium">{sortKey}</span> ({sortDir})</div>
              <div className="flex gap-2">
                <button className="rounded-md border px-3 py-1 text-sm" onClick={() => exportToCsv('transactions.csv', sorted)}>Export CSV</button>
              </div>
            </div>
            <div className="overflow-x-auto mt-3">
              <table className="table">
                <thead>
                  <tr className="table-th">
                    <th className="py-2 pr-2 cursor-pointer select-none" onClick={() => onSort('date')}>Date</th>
                    <th className="py-2 pr-2 cursor-pointer select-none" onClick={() => onSort('description')}>Desc</th>
                    <th className="py-2 pr-2 cursor-pointer select-none" onClick={() => onSort('category')}>Category</th>
                    <th className="py-2 pr-2 cursor-pointer select-none" onClick={() => onSort('type')}>Type</th>
                    <th className="py-2 pr-2 cursor-pointer select-none" onClick={() => onSort('amount')}>Amount</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t) => (
                    <tr key={t.id} className={`border-b last:border-b-0 ${form.id === t.id ? 'bg-zinc-50' : ''}`}>
                      <td className="py-2 pr-2 whitespace-nowrap">{format(parseISO(t.date), 'MMM d, yyyy')}</td>
                      <td className="py-2 pr-2">{t.description}</td>
                      <td className="py-2 pr-2">{t.category}</td>
                      <td className="py-2 pr-2 capitalize">
                        <span className={t.type === 'income' ? 'badge-green' : 'badge-rose'}>{t.type}</span>
                      </td>
                      <td className="py-2 pr-2">${t.amount.toFixed(2)}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:underline" onClick={() => handleEdit(t)}>Edit</button>
                          <button className="text-rose-600 hover:underline" onClick={() => handleDelete(t.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-3 text-sm">
              <div>Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sorted.length)} of {sorted.length}</div>
              <div className="flex items-center gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-md border px-3 py-1 disabled:opacity-50">Prev</button>
                <div>
                  Page {page} / {pages}
                </div>
                <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="rounded-md border px-3 py-1 disabled:opacity-50">Next</button>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="ml-2 rounded-md border px-2 py-1">
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Income vs Expense</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <defs>
                  <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(d) => format(parseISO(d), 'MMM d')} />
                <YAxis />
                <Tooltip labelFormatter={(d) => format(parseISO(String(d)), 'PP')} />
                <Legend />
                <Area type="monotone" dataKey="income" stroke="#16a34a" fillOpacity={1} fill="url(#income)" />
                <Area type="monotone" dataKey="expense" stroke="#e11d48" fillOpacity={1} fill="url(#expense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}

