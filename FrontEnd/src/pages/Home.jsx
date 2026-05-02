import { ArrowRight, Bot, CheckCircle2, Clock, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/ui/OptimizedImage.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';

const heroImage = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=85';

const features = [
  {
    icon: Bot,
    title: 'Coach IA',
    description: 'Treinos ajustados por objetivo, historico e ritmo de evolucao.'
  },
  {
    icon: Clock,
    title: 'Acesso 24/7',
    description: 'Entre quando sua rotina permite, com controle digital de acesso.'
  },
  {
    icon: ShieldCheck,
    title: 'Seguranca',
    description: 'Monitoramento, areas bem sinalizadas e fluxo pensado para autonomia.'
  }
];

const gallery = [
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80'
];

export default function Home() {
  return (
    <>
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <OptimizedImage
          src={heroImage}
          alt="Academia moderna com equipamentos de musculacao"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-academy-ink/50 via-academy-ink/70 to-academy-ink" />
        <div className="container-page relative flex min-h-[calc(100vh-4rem)] items-center pb-16 pt-14">
          <div className="max-w-3xl">
            <p className="eyebrow">Academia inteligente</p>
            <h1 className="mt-5 text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
              PulseFit
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-200 sm:text-xl">
              Treine em um ambiente de alta energia, tecnologia embarcada e suporte real para transformar consistencia em resultado.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/assinaturas" className="btn-primary">
                Ver planos <ArrowRight size={18} />
              </Link>
              <Link to="/conheca-o-local" className="btn-secondary">
                Conhecer estrutura
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <SectionHeading
            eyebrow="Diferenciais"
            title="Tudo pensado para voce treinar melhor"
            description="Uma experiencia simples, rapida e segura do primeiro acesso ao checkout."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="surface p-6 shadow-glow">
                <feature.icon className="text-academy-neon" size={30} />
                <h3 className="mt-5 text-xl font-black text-white">{feature.title}</h3>
                <p className="mt-3 leading-7 text-zinc-400">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-black/25">
        <div className="container-page">
          <SectionHeading
            eyebrow="Galeria"
            title="Estrutura preparada para alta performance"
            description="Espacos amplos, equipamentos modernos e areas para treinos livres, musculacao e condicionamento."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {gallery.map((src, index) => (
              <OptimizedImage
                key={src}
                src={src}
                alt={`Estrutura da academia ${index + 1}`}
                className="aspect-[4/5] rounded-lg border border-white/10 object-cover"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-lg border border-academy-neon/30 bg-black shadow-glow">
            <OptimizedImage
              src="https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1600&q=85"
              alt="Treino intenso em academia moderna"
              className="absolute inset-0 h-full w-full object-cover opacity-35"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-academy-ink via-academy-ink/88 to-academy-ink/40" />
            <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-12">
              <div>
                <p className="eyebrow flex items-center gap-2">
                  <Sparkles size={16} /> Comece hoje
                </p>
                <h2 className="mt-4 max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl">
                  Escolha um plano e treine ainda esta semana.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-300">
                  Cadastro rapido, pagamento seguro e acesso liberado para voce encaixar treino na rotina sem enrolacao.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to="/assinaturas" className="btn-primary">
                    Ver assinaturas <ArrowRight size={18} />
                  </Link>
                  <Link to="/conheca-o-local" className="btn-secondary">
                    Conhecer estrutura
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { icon: Zap, title: 'Ativacao rapida', text: 'Finalize online e receba orientacoes de acesso.' },
                  { icon: ShieldCheck, title: 'Pagamento seguro', text: 'Checkout via Mercado Pago gerado pela API.' },
                  { icon: CheckCircle2, title: 'Sem friccao', text: 'Planos claros, cupom validado e token protegido.' }
                ].map((item) => (
                  <div key={item.title} className="rounded-lg border border-white/10 bg-white/8 p-5 backdrop-blur-md">
                    <item.icon className="text-academy-neon" size={24} />
                    <h3 className="mt-4 font-black text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
