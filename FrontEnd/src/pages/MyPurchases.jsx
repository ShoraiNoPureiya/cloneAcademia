import { BadgeCheck, Clock3, Loader2, PackageCheck, ReceiptText, WalletCards } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import StatusMessage from '../components/ui/StatusMessage.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getApiErrorMessage } from '../services/api.js';
import { customerService } from '../services/customerService.js';
import { formatCurrency } from '../utils/format.js';

export default function MyPurchases() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let active = true;

    async function load() {
      try {
        const result = await customerService.purchases();
        if (active) {
          setData(result);
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

    load();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const summary = data?.summary;

  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="Minha area"
          title="Minhas compras"
          description="Acompanhe produtos, assinaturas e status de pagamento em um so lugar."
        />
        <StatusMessage type="error">{message}</StatusMessage>

        {loading ? (
          <div className="flex justify-center py-20 text-zinc-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard icon={ReceiptText} label="Itens" value={summary?.totalItems ?? 0} />
              <SummaryCard icon={Clock3} label="Pendentes" value={summary?.pendingItems ?? 0} tone="warning" />
              <SummaryCard icon={BadgeCheck} label="Pagos" value={summary?.paidItems ?? 0} tone="success" />
              <SummaryCard icon={WalletCards} label="Total" value={formatCurrency(summary?.totalAmount)} />
            </div>

            <div className="relative overflow-hidden rounded-lg border border-academy-neon/20 bg-black">
              <div className="absolute inset-0 bg-gradient-to-r from-academy-neon/10 via-academy-violet/10 to-transparent" />
              <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="eyebrow">Status financeiro</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Pedidos pendentes aguardam confirmacao de pagamento.</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                    Quando o webhook do Mercado Pago estiver ativo, os pedidos mudam automaticamente de pendente para pago.
                  </p>
                </div>
                <Link to="/produtos" className="btn-primary shrink-0">
                  Ver loja
                </Link>
              </div>
            </div>

            <PurchaseSection title="Produtos" emptyText="Voce ainda nao comprou produtos.">
              {(data?.products ?? []).map((item) => (
                <PurchaseCard
                  key={item.id}
                  icon={PackageCheck}
                  title={item.productName}
                  subtitle={`${item.quantity} unidade(s)`}
                  amount={item.totalAmount}
                  status={item.status}
                  date={item.createdAt}
                  preferenceId={item.paymentPreferenceId}
                />
              ))}
            </PurchaseSection>

            <PurchaseSection title="Assinaturas" emptyText="Voce ainda nao contratou assinaturas.">
              {(data?.subscriptions ?? []).map((item) => (
                <PurchaseCard
                  key={item.id}
                  icon={BadgeCheck}
                  title={item.planName}
                  subtitle={item.endsAt ? `Valido ate ${formatDate(item.endsAt)}` : 'Plano contratado'}
                  amount={item.finalAmount}
                  status={item.status}
                  date={item.startsAt}
                  preferenceId={item.paymentPreferenceId}
                />
              ))}
            </PurchaseSection>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({ icon: Icon, label, value, tone = 'default' }) {
  const color = tone === 'success' ? 'text-academy-neon' : tone === 'warning' ? 'text-academy-cyan' : 'text-white';

  return (
    <div className="surface p-5">
      <Icon className={color} size={24} />
      <p className="mt-4 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-zinc-500">{label}</p>
    </div>
  );
}

function PurchaseSection({ title, emptyText, children }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];

  return (
    <section>
      <h2 className="mb-4 text-2xl font-black text-white">{title}</h2>
      {items.length === 0 ? (
        <div className="surface p-6 text-zinc-400">{emptyText}</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">{items}</div>
      )}
    </section>
  );
}

function PurchaseCard({ icon: Icon, title, subtitle, amount, status, date, preferenceId }) {
  return (
    <article className="surface overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-academy-neon text-academy-ink">
            <Icon size={22} />
          </span>
          <div>
            <h3 className="text-lg font-black text-white">{title}</h3>
            <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
              {formatDate(date)}
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="grid gap-3 border-t border-academy-line bg-white/[0.03] p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Valor</p>
          <p className="mt-1 text-xl font-black text-academy-neon">{formatCurrency(amount)}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Preferencia Mercado Pago</p>
          <p className="mt-1 truncate text-sm text-zinc-300">{preferenceId ?? '-'}</p>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  const normalized = status?.toLowerCase();
  const styles = normalized === 'paid'
    ? 'border-academy-neon/30 bg-academy-neon/10 text-academy-neon'
    : normalized === 'pending'
      ? 'border-academy-cyan/30 bg-academy-cyan/10 text-cyan-100'
      : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-200';

  const label = normalized === 'paid' ? 'Pago' : normalized === 'pending' ? 'Pendente' : status;

  return <span className={`rounded-md border px-3 py-1 text-xs font-black uppercase ${styles}`}>{label}</span>;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}
