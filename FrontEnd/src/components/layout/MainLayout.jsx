import { Outlet } from 'react-router-dom';
import Footer from './Footer.jsx';
import Header from './Header.jsx';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-academy-ink bg-radial-energy text-zinc-100">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
