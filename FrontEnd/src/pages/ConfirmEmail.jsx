import { CheckCircle2, Loader2, MailCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import StatusMessage from '../components/ui/StatusMessage.jsx';
import { getApiErrorMessage } from '../services/api.js';
import { authService } from '../services/authService.js';

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get('email') ?? '', [searchParams]);
  const [form, setForm] = useState({ email: initialEmail, token: '' });
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await authService.confirmEmail(form);
      setConfirmed(true);
      setType('success');
      setMessage('Email confirmado. Agora entre para receber o codigo de duas etapas.');
      setTimeout(() => navigate('/login'), 1400);
    } catch (error) {
      setType('error');
      setMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-y">
      <div className="container-page grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="eyebrow">Confirmacao</p>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Ative sua conta com o codigo do email.</h1>
          <p className="mt-5 max-w-xl leading-8 text-zinc-400">
            O codigo expira em 24 horas e libera seu login com verificacao em duas etapas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="surface mx-auto w-full max-w-md space-y-4 p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-academy-neon">
            {confirmed ? <CheckCircle2 size={18} /> : <MailCheck size={18} />} Codigo de 6 digitos
          </div>
          <StatusMessage type={type}>{message}</StatusMessage>
          <input
            className="field"
            type="email"
            placeholder="Email usado no cadastro"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <input
            className="field text-center text-lg font-black tracking-[0.35em]"
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]{6}"
            placeholder="000000"
            value={form.token}
            onChange={(event) => setForm({ ...form, token: event.target.value.replace(/\D/g, '').slice(0, 6) })}
            required
          />
          <button type="submit" className="btn-primary w-full" disabled={loading || form.token.length !== 6}>
            {loading && <Loader2 className="animate-spin" size={18} />}
            Confirmar email
          </button>
          <p className="text-center text-sm text-zinc-400">
            Ja confirmou? <Link className="font-bold text-academy-neon" to="/login">Entrar</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
