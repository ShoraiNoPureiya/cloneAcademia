import { KeyRound, Loader2, MailCheck, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatusMessage from '../components/ui/StatusMessage.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getApiErrorMessage } from '../services/api.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', code: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const { login, verifyTwoFactor, pendingEmail } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (pendingEmail) {
        await verifyTwoFactor(form.code);
        navigate('/assinaturas');
        return;
      }

      const result = await login(form.email, form.password);
      if (result.requiresTwoFactor) {
        setType('success');
        setMessage('Codigo 2FA enviado. Verifique seu email.');
        return;
      }

      navigate('/assinaturas');
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
          <p className="eyebrow">Acesso seguro</p>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Entre para finalizar sua assinatura.</h1>
          <p className="mt-5 max-w-xl leading-8 text-zinc-400">
            O token JWT fica armazenado no navegador e e enviado automaticamente nas requisicoes protegidas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="surface mx-auto w-full max-w-md space-y-4 p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-academy-neon">
            <ShieldCheck size={18} /> Login seguro
          </div>
          <Link
            to="/confirmar-email"
            className="flex items-center justify-between gap-3 rounded-md border border-academy-neon/35 bg-academy-neon/10 px-4 py-3 text-sm font-bold text-academy-neon transition hover:bg-academy-neon/15"
          >
            <span className="inline-flex items-center gap-2">
              <MailCheck size={18} /> Confirmar email com codigo
            </span>
            <span>Abrir</span>
          </Link>
          <StatusMessage type={type}>{message}</StatusMessage>

          {!pendingEmail ? (
            <>
              <input
                className="field"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
              <input
                className="field"
                type="password"
                placeholder="Senha"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
              <div className="flex justify-end">
                <Link className="text-sm font-bold text-academy-neon hover:brightness-110" to="/esqueci-senha">
                  Esqueci minha senha
                </Link>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-academy-line bg-black/25 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-academy-neon">
                <KeyRound size={17} /> Verificacao em duas etapas
              </div>
              <p className="mb-4 text-sm leading-6 text-zinc-400">
                Enviamos um codigo de 6 digitos para {pendingEmail}. Digite para liberar seu acesso.
              </p>
              <input
                className="field text-center text-lg font-black tracking-[0.35em]"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                placeholder="000000"
                value={form.code}
                onChange={(event) => setForm({ ...form, code: event.target.value.replace(/\D/g, '').slice(0, 6) })}
                required
              />
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" size={18} />}
            {pendingEmail ? 'Validar codigo' : 'Entrar'}
          </button>
          <p className="text-center text-sm text-zinc-400">
            Ainda nao tem conta? <Link className="font-bold text-academy-neon" to="/registro">Criar cadastro</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
