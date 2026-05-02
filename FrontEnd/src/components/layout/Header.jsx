import { LayoutDashboard, Menu, ReceiptText, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/assinaturas', label: 'Assinaturas' },
  { to: '/conheca-o-local', label: 'Conheca o local' },
  { to: '/produtos', label: 'Produtos' }
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-academy-ink/86 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-black uppercase tracking-wide">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-academy-neon text-academy-ink">
            <Zap size={20} />
          </span>
          PulseFit
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-semibold transition hover:text-academy-neon ${
                  isActive ? 'text-academy-neon' : 'text-zinc-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAdmin && (
            <Link to="/admin" className="btn-secondary py-2">
              <LayoutDashboard size={17} /> Admin
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <Link to="/minhas-compras" className="btn-secondary py-2">
                <ReceiptText size={17} /> Compras
              </Link>
              <button type="button" onClick={logout} className="btn-secondary py-2">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary py-2">
                Entrar
              </Link>
              <Link to="/registro" className="btn-primary py-2">
                Comecar
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-md border border-academy-line bg-white/5 md:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label="Abrir menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-academy-ink md:hidden">
          <nav className="container-page flex flex-col gap-2 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/5 hover:text-academy-neon"
              >
                {item.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="btn-secondary mt-2" onClick={() => setOpen(false)}>
                    <LayoutDashboard size={17} /> Admin
                  </Link>
                )}
                <Link to="/minhas-compras" className="btn-secondary mt-2" onClick={() => setOpen(false)}>
                  <ReceiptText size={17} /> Compras
                </Link>
                <button type="button" onClick={logout} className="btn-secondary mt-2">
                  Sair
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link to="/login" className="btn-secondary" onClick={() => setOpen(false)}>
                  Entrar
                </Link>
                <Link to="/registro" className="btn-primary" onClick={() => setOpen(false)}>
                  Comecar
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
