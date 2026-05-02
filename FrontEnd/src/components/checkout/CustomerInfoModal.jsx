import { Loader2, ShieldCheck, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import StatusMessage from '../ui/StatusMessage.jsx';

const initialForm = {
  fullName: '',
  cpf: '',
  zipCode: '',
  address: ''
};

export default function CustomerInfoModal({ open, title, description, loading, error, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);

  const isValid = useMemo(() => {
    return (
      form.fullName.trim().length >= 5 &&
      onlyDigits(form.cpf).length === 11 &&
      onlyDigits(form.zipCode).length === 8 &&
      form.address.trim().length >= 8
    );
  }, [form]);

  if (!open) {
    return null;
  }

  function submit(event) {
    event.preventDefault();
    if (!isValid) {
      return;
    }

    onSubmit({
      fullName: form.fullName.trim(),
      cpf: onlyDigits(form.cpf),
      zipCode: onlyDigits(form.zipCode),
      address: form.address.trim()
    });
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/75 px-4 backdrop-blur-sm">
      <form onSubmit={submit} className="surface w-full max-w-xl overflow-hidden shadow-glow">
        <div className="flex items-start justify-between gap-4 border-b border-academy-line p-5">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <ShieldCheck size={15} /> Dados obrigatorios
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-academy-line bg-white/5"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <StatusMessage type="error">{error}</StatusMessage>
          <input
            className="field"
            placeholder="Nome completo"
            value={form.fullName}
            onChange={(event) => setForm({ ...form, fullName: event.target.value })}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className="field"
              placeholder="CPF"
              inputMode="numeric"
              maxLength={14}
              value={form.cpf}
              onChange={(event) => setForm({ ...form, cpf: formatCpf(event.target.value) })}
              required
            />
            <input
              className="field"
              placeholder="CEP"
              inputMode="numeric"
              maxLength={9}
              value={form.zipCode}
              onChange={(event) => setForm({ ...form, zipCode: formatZipCode(event.target.value) })}
              required
            />
          </div>
          <textarea
            className="field min-h-24"
            placeholder="Endereco completo: rua, numero, bairro, cidade e UF"
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
            required
          />
          <button type="submit" className="btn-primary w-full" disabled={!isValid || loading}>
            {loading && <Loader2 className="animate-spin" size={18} />}
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
}

function onlyDigits(value) {
  return value.replace(/\D/g, '');
}

function formatCpf(value) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatZipCode(value) {
  return onlyDigits(value).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}
