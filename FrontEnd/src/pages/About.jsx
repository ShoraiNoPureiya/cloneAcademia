import { Award, CalendarCheck, ChevronLeft, ChevronRight, Dumbbell, HeartPulse, MapPin, ShieldCheck, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/ui/OptimizedImage.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';

const images = [
  'https://images.unsplash.com/photo-1549476464-37392f717541?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80'
];

const missionImages = [
  {
    src: images[0],
    alt: 'Aluno treinando em academia escura e moderna',
    label: 'Musculacao'
  },
  {
    src: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80',
    alt: 'Atleta treinando com halteres',
    label: 'Forca'
  },
  {
    src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
    alt: 'Sala de musculacao com equipamentos modernos',
    label: 'Estrutura'
  }
];

const methodImages = [
  {
    src: images[1],
    alt: 'Atleta realizando treino de forca',
    label: 'Metodo'
  },
  {
    src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
    alt: 'Aluno treinando agachamento com barra',
    label: 'Tecnica'
  },
  {
    src: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    alt: 'Pessoa treinando mobilidade em academia',
    label: 'Acompanhamento'
  }
];

const visitImages = [
  {
    src: images[2],
    alt: 'Equipamentos modernos da academia',
    label: 'Equipamentos'
  },
  {
    src: images[3],
    alt: 'Treino acompanhado em academia',
    label: 'Acompanhamento'
  },
  {
    src: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=900&q=80',
    alt: 'Area de pesos livres da academia',
    label: 'Pesos livres'
  },
  {
    src: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?auto=format&fit=crop&w=900&q=80',
    alt: 'Bicicletas ergometricas em academia moderna',
    label: 'Cardio'
  }
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

              <ImageCarousel images={missionImages} shadow="shadow-violet" />
            </div>

            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <ImageCarousel images={methodImages} shadow="shadow-glow" className="lg:order-1" />
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
            <ImageCarousel images={visitImages} className="min-h-72" aspect="aspect-[16/12]" />
          </div>
        </div>
      </section>
    </>
  );
}

function ImageCarousel({ images: carouselImages, className = '', shadow = 'shadow-violet', aspect = 'aspect-[16/11]' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = carouselImages[activeIndex];

  function move(direction) {
    setActiveIndex((current) => (current + direction + carouselImages.length) % carouselImages.length);
  }

  return (
    <div className={`group relative overflow-hidden rounded-lg border border-white/10 bg-black ${shadow} ${className}`}>
      <OptimizedImage
        src={activeImage.src}
        alt={activeImage.alt}
        className={`${aspect} w-full object-cover transition duration-500 group-hover:scale-[1.03]`}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

      <div className="absolute left-4 top-4 rounded-md border border-white/10 bg-black/60 px-3 py-2 text-xs font-black uppercase tracking-wide text-academy-neon backdrop-blur">
        {activeImage.label}
      </div>

      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-md border border-white/10 bg-black/55 text-white backdrop-blur transition hover:bg-academy-neon hover:text-academy-ink"
          onClick={() => move(-1)}
          aria-label="Imagem anterior"
        >
          <ChevronLeft size={22} />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-md border border-white/10 bg-black/55 text-white backdrop-blur transition hover:bg-academy-neon hover:text-academy-ink"
          onClick={() => move(1)}
          aria-label="Proxima imagem"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {carouselImages.map((image, index) => (
          <button
            type="button"
            key={image.src}
            className={`h-2 rounded-full transition ${index === activeIndex ? 'w-8 bg-academy-neon' : 'w-2 bg-white/40 hover:bg-white/70'}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Ir para imagem ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
