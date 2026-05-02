export default function StatusMessage({ type = 'info', children }) {
  if (!children) {
    return null;
  }

  const styles = {
    info: 'border-academy-cyan/30 bg-academy-cyan/10 text-cyan-100',
    success: 'border-academy-neon/30 bg-academy-neon/10 text-lime-100',
    error: 'border-academy-danger/30 bg-academy-danger/10 text-rose-100'
  };

  return <p className={`rounded-md border px-4 py-3 text-sm ${styles[type]}`}>{children}</p>;
}
