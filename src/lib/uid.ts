export function generateId(): string {
  const rnd = Math.random().toString(36).slice(2);
  const now = Date.now().toString(36);
  return `${now}_${rnd}`;
}

