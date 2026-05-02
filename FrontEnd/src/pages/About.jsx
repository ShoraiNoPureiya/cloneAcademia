import { Award, CalendarCheck, Dumbbell, HeartPulse, MapPin, ShieldCheck, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/ui/OptimizedImage.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';

const images = [
  'https://images.unsplash.com/photo-1549476464-37392f717541?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80'
];

const pillars = [
  { icon: Users, label: 'Equipe presente', text: 'Instrutores atentos para orientar postura, carga e progressao.' },
  { icon: HeartPulse, label: 'Saude em foco', text: 'Treinos ajustados para evoluir sem sacrificar recuperacao.' },
  { icon: Award, label: 'Performance', text: 'Ambiente preparado para hipertrofia, resistencia e condicionamento.' }
];

const zones = [
  { icon: Dumbbell, title: 'Musculacao completa', text: 'Maquinas guiadas, pesos livres, racks e bancos para treinos de forca.' },
  { icon: Zap, title: 'Area funcional', text: 'Espaco para HIIT, mobilidade, core e condicionamento metabolico.' },
  { icon: ShieldCheck, title: 'Acesso monitorado', text: 'Entrada digital, cameras e fluxo organizado para treinar com autonomia.' }
];

export default function About() {
  return (
    <>
      <section className="section-y">
        <div className="container-page">
          <SectionHeading
            eyebrow="Conheca o local"
            title="Uma academia criada para rotina real"
            description="A PulseFit nasceu para unir treino serio, tecnologia acessivel e uma experiencia que nao atrapalha o aluno."
          />

          <div className="space-y-16">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="space-y-5 text-zinc-300">
                <p className="eyebrow">Nossa missao</p>
                <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">
                  Consistencia antes de promessa vazia.
                </h2>
                <p className="text-lg leading-8">
                  Nossa missao e ajudar pessoas a construirem consistencia. O ambiente foi desenhado para quem treina antes do trabalho, no intervalo, a noite ou de madrugada, com acesso 24/7 e suporte digital.
                </p>
                <p className="leading-8">
                  Cada detalhe reduz atrito: entrada rapida, equipamentos bem distribuidos, areas intuitivas e tecnologia para acompanhar sua evolucao sem complicar o treino.
                </p>
              </div>

              <OptimizedImage
                src={images[0]}
                alt="Aluno treinando em academia escura e moderna"
                className="aspect-[16/11] rounded-lg border border-white/10 object-cover shadow-violet"
              />
            </div>

            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <OptimizedImage
                src={images[1]}
                alt="Atleta realizando treino de forca"
                className="aspect-[16/11] rounded-lg border border-white/10 object-cover shadow-glow lg:order-1"
              />
              <div className="space-y-5 text-zinc-300 lg:order-2">
                <p className="eyebrow">Equipe e metodo</p>
                <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">
                  Orientacao humana com dados no apoio.
                </h2>
                <p className="text-lg leading-8">
                  Misturamos equipe preparada, equipamentos robustos, acompanhamento por dados e atendimento direto para reduzir friccao em tudo que normalmente atrasa a evolucao.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {pillars.map((item) => (
                    <div key={item.label} className="surface p-4">
                      <item.icon className="text-academy-neon" />
                      <p className="mt-3 font-bold text-white">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-y bg-black/25">
        <div className="container-page">
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              ['24/7', 'acesso todos os dias'],
              ['3', 'areas de treino integradas'],
              ['100%', 'foco em progresso mensuravel']
            ].map(([value, label]) => (
              <div key={label} className="surface p-6 text-center">
                <p className="text-4xl font-black text-academy-neon">{value}</p>
                <p className="mt-2 text-sm font-bold uppercase tracking-wide text-zinc-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {zones.map((zone) => (
              <article key={zone.title} className="surface p-6">
                <zone.icon className="text-academy-cyan" size={28} />
                <h3 className="mt-5 text-xl font-black text-white">{zone.title}</h3>
                <p className="mt-3 leading-7 text-zinc-400">{zone.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <div className="surface flex flex-col justify-between p-7">
              <div>
                <p className="eyebrow">Visite a PulseFit</p>
                <h2 className="mt-4 text-3xl font-black leading-tight text-white">
                  Veja a estrutura antes de escolher seu plano.
                </h2>
                <p className="mt-4 leading-8 text-zinc-400">
                  Agende uma visita, conheca os equipamentos e tire duvidas sobre planos, acesso, avaliacao e acompanhamento.
                </p>
              </div>
              <div className="mt-8 grid gap-3 text-sm text-zinc-300">
                <span className="flex items-center gap-3"><MapPin className="text-academy-neon" size={18} /> Centro fitness com acesso digital</span>
                <span className="flex items-center gap-3"><CalendarCheck className="text-academy-neon" size={18} /> Horarios flexiveis para visita</span>
              </div>
              <Link to="/assinaturas" className="btn-primary mt-8 w-full sm:w-fit">
                Ver planos
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <OptimizedImage
                src={images[2]}
                alt="Equipamentos modernos da academia"
                className="h-full min-h-72 rounded-lg border border-white/10 object-cover"
              />
              <OptimizedImage
                src={images[3]}
                alt="Treino acompanhado em academia"
                className="h-full min-h-72 rounded-lg border border-white/10 object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
