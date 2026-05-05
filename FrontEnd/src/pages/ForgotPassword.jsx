import { KeyRound, Loader2, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatusMessage from '../components/ui/StatusMessage.jsx';
import { getApiErrorMessage } from '../services/api.js';
import { authService } from '../services/authService.js';

export default function ForgotPassword() {
  const [step, setStep] = useState('email');
  const [form, setForm] = useState({ email: '', token: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const navigate = useNavigate();
  const passwordChecks = getPasswordChecks(form.newPassword);
  const passwordIsValid = passwordChecks.every((check) => check.valid);

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await authService.forgotPassword({ email: form.email });
      setStep('reset');
      setType('success');
      setMessage('Se o email existir, enviamos um codigo de 6 digitos.');
    } catch (error) {
      setType('error');
      setMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(event) {
    event.preventDefault();

    if (!passwordIsValid) {
      setType('error');
      setMessage('A nova senha precisa cumprir todos os criterios.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await authService.resetPassword(form);
      setType('success');
      setMessage('Senha redefinida. Entre com sua nova senha.');
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
          <p className="eyebrow">Recuperacao</p>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Recupere seu acesso sem suporte manual.</h1>
          <p className="mt-5 max-w-xl leading-8 text-zinc-400">
            Enviaremos um codigo temporario para o email cadastrado. Depois disso, escolha uma senha forte.
          </p>
        </div>

        <form onSubmit={step === 'email' ? handleEmailSubmit : handleResetSubmit} className="surface mx-auto w-full max-w-md space-y-4 p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-academy-neon">
            {step === 'email' ? <Mail size={18} /> : <KeyRound size={18} />}
            {step === 'email' ? 'Enviar codigo' : 'Nova senha'}
          </div>
          <StatusMessage type={type}>{message}</StatusMessage>
          <input
            className="field"
            type="email"
            placeholder="Email da conta"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />

          {step === 'reset' && (
            <>
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
              <input
                className="field"
                type="password"
                placeholder="Nova senha forte"
                value={form.newPassword}
                onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
                required
                minLength={12}
              />
              <div className="grid gap-2 rounded-md border border-academy-line bg-black/20 p-3 text-xs">
                {passwordChecks.map((check) => (
                  <span key={check.label} className={check.valid ? 'text-academy-neon' : 'text-zinc-500'}>
                    {check.valid ? 'OK' : '-'} {check.label}
                  </span>
                ))}
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || (step === 'reset' && (form.token.length !== 6 || !passwordIsValid))}
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {step === 'email' ? 'Enviar codigo' : 'Redefinir senha'}
          </button>
          <p className="text-center text-sm text-zinc-400">
            Lembrou a senha? <Link className="font-bold text-academy-neon" to="/login">Entrar</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

function getPasswordChecks(password) {
  return [
    { label: 'No minimo 12 caracteres', valid: password.length >= 12 },
    { label: 'Uma letra maiuscula', valid: /[A-Z]/.test(password) },
    { label: 'Uma letra minuscula', valid: /[a-z]/.test(password) },
    { label: 'Um numero', valid: /[0-9]/.test(password) },
    { label: 'Um caractere especial', valid: /[^a-zA-Z0-9]/.test(password) }
  ];
}
