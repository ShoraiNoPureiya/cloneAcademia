import { Loader2, ShieldCheck } from 'lucide-react';
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
            </>
          ) : (
            <input
              className="field"
              inputMode="numeric"
              maxLength={6}
              placeholder="Codigo 2FA"
              value={form.code}
              onChange={(event) => setForm({ ...form, code: event.target.value })}
              required
            />
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
