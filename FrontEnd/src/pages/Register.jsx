import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusMessage from '../components/ui/StatusMessage.jsx';
import { getApiErrorMessage } from '../services/api.js';
import { authService } from '../services/authService.js';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const passwordChecks = getPasswordChecks(form.password);
  const passwordIsValid = passwordChecks.every((check) => check.valid);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!passwordIsValid) {
      setType('error');
      setMessage('A senha precisa cumprir todos os criterios de seguranca.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await authService.register(form);
      setType('success');
      setMessage('Cadastro criado. Voce ja pode entrar.');
      setForm({ name: '', email: '', password: '' });
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
          <p className="eyebrow">Novo aluno</p>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Crie sua conta e comece seu acesso.</h1>
          <p className="mt-5 max-w-xl leading-8 text-zinc-400">
            O cadastro usa DTOs, validacao no backend e nao permite envio de campos sensiveis como perfil administrativo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="surface mx-auto w-full max-w-md space-y-4 p-6">
          <StatusMessage type={type}>{message}</StatusMessage>
          <input
            className="field"
            placeholder="Nome"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
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
            placeholder="Senha forte"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
            minLength={12}
          />
          <div className="grid gap-2 rounded-md border border-academy-line bg-black/20 p-3 text-xs">
            {passwordChecks.map((check) => (
              <span key={check.label} className={check.valid ? 'text-academy-neon' : 'text-zinc-500'}>
                {check.valid ? '✓' : '•'} {check.label}
              </span>
            ))}
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading || !passwordIsValid}>
            {loading && <Loader2 className="animate-spin" size={18} />}
            Criar conta
          </button>
          <p className="text-center text-sm text-zinc-400">
            Ja tem conta? <Link className="font-bold text-academy-neon" to="/login">Entrar</Link>
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
