import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import CheckoutCard from '../components/checkout/CheckoutCard.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import StatusMessage from '../components/ui/StatusMessage.jsx';
import { getApiErrorMessage } from '../services/api.js';
import { plansService } from '../services/plansService.js';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadPlans() {
      try {
        const data = await plansService.list();
        if (active) {
          setPlans(data.filter((plan) => plan.active));
        }
      } catch (error) {
        if (active) {
          setMessage(getApiErrorMessage(error));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPlans();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="Assinaturas"
          title="Escolha o plano e finalize com seguranca"
          description="O cupom e o valor final sao validados pela API antes de gerar a preferencia do Mercado Pago."
        />
        <StatusMessage type="error">{message}</StatusMessage>

        <div className="mb-8 flex items-center justify-center gap-2 text-sm text-zinc-400">
          <ShieldCheck size={18} className="text-academy-neon" />
          Checkout protegido por JWT, rate limiting e validacao no backend.
        </div>

        {loading ? (
          <p className="text-center text-zinc-400">Carregando planos...</p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <CheckoutCard key={plan.id} plan={plan} featured={index === 1} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
