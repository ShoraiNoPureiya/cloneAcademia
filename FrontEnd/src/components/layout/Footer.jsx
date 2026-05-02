import { Dumbbell } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/30">
      <div className="container-page flex flex-col gap-4 py-8 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 font-bold text-zinc-100">
          <Dumbbell className="text-academy-neon" size={18} />
          PulseFit Academia
        </div>
        <p>Treino, tecnologia e performance. Aberto 24/7.</p>
      </div>
    </footer>
  );
}
