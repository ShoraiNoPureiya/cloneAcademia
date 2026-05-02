import { Check, Loader2, Ticket, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getApiErrorMessage } from '../../services/api.js';
import { checkoutService } from '../../services/checkoutService.js';
import { formatCurrency } from '../../utils/format.js';
import CustomerInfoModal from './CustomerInfoModal.jsx';
import StatusMessage from '../ui/StatusMessage.jsx';

export default function CheckoutCard({ plan, featured = false }) {
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const couponState = useMemo(() => {
    if (!coupon.trim()) {
      return { valid: true, text: 'Opcional' };
    }

    if (!/^[A-Za-z0-9_-]{3,40}$/.test(coupon.trim())) {
      return { valid: false, text: 'Use apenas letras, numeros, _ ou -.' };
    }

    return { valid: true, text: 'Cupom sera validado com seguranca no checkout.' };
  }, [coupon]);

  async function handleCheckout(customerInfo) {
    if (!couponState.valid) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const checkout = await checkoutService.createPreference(plan.id, coupon.trim(), customerInfo);
      setMessageType('success');
      setMessage(`Desconto aplicado. Total: ${formatCurrency(checkout.finalAmount)}.`);

      if (checkout.checkoutUrl) {
        window.location.assign(checkout.checkoutUrl);
      }
    } catch (error) {
      setMessageType('error');
      setMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
      setCustomerModalOpen(false);
    }
  }

  return (
    <article className={`surface flex flex-col p-6 ${featured ? 'border-academy-neon shadow-glow' : ''}`}>
      {featured && (
        <span className="mb-4 w-fit rounded-md bg-academy-neon px-3 py-1 text-xs font-black uppercase text-academy-ink">
          Mais escolhido
        </span>
      )}
      <h3 className="text-2xl font-black text-white">{plan.name}</h3>
      <p className="mt-3 min-h-14 leading-7 text-zinc-400">{plan.description}</p>
      <div className="mt-5">
        <span className="text-4xl font-black text-white">{formatCurrency(plan.price)}</span>
        <span className="text-zinc-500"> / {plan.durationMonths} mes(es)</span>
      </div>
      <ul className="mt-6 space-y-3 text-sm text-zinc-300">
        {['Acesso completo', 'Coach IA no app', 'Check-in digital', 'Suporte da equipe'].map((benefit) => (
          <li key={benefit} className="flex items-center gap-3">
            <Check className="text-academy-neon" size={18} /> {benefit}
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2">
        <label className="flex items-center gap-2 text-sm font-bold text-zinc-200" htmlFor={`coupon-${plan.id}`}>
          <Ticket size={16} /> Cupom
        </label>
        <input
          id={`coupon-${plan.id}`}
          className="field"
          value={coupon}
          onChange={(event) => setCoupon(event.target.value.toUpperCase())}
          placeholder="EX: PULSE10"
          maxLength={40}
        />
        <p className={`text-xs ${couponState.valid ? 'text-zinc-400' : 'text-academy-danger'}`}>
          {couponState.text}
        </p>
      </div>

      <div className="mt-5">
        <StatusMessage type={messageType}>{message}</StatusMessage>
      </div>

      {isAuthenticated ? (
        <button
          type="button"
          className="btn-primary mt-6 w-full"
          onClick={() => setCustomerModalOpen(true)}
          disabled={loading || !couponState.valid}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Wallet size={18} />}
          Pagar com Mercado Pago
        </button>
      ) : (
        <Link to="/login" className="btn-primary mt-6 w-full">
          Entrar para assinar
        </Link>
      )}
      <CustomerInfoModal
        open={customerModalOpen}
        title="Dados para assinatura"
        description="Pedimos esses dados somente no checkout para identificar a compra e manter o cadastro financeiro correto."
        loading={loading}
        error={messageType === 'error' ? message : ''}
        onClose={() => setCustomerModalOpen(false)}
        onSubmit={handleCheckout}
      />
    </article>
  );
}
