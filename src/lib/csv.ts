export function exportToCsv(filename: string, rows: Record<string, unknown>[]): void {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (val: unknown) => {
    const s = String(val ?? '');
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const csv = [headers.join(',')]
    .concat(rows.map((r) => headers.map((h) => escape((r as any)[h])).join(',')))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

