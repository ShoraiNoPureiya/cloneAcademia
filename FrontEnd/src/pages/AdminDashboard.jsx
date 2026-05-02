import { BadgeDollarSign, Boxes, Loader2, Plus, ReceiptText, Ticket, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import StatusMessage from '../components/ui/StatusMessage.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { adminService } from '../services/adminService.js';
import { getApiErrorMessage } from '../services/api.js';
import { formatCurrency } from '../utils/format.js';

const initialProduct = { name: '', description: '', sku: '', image: null, price: '', stockQuantity: '' };
const initialCoupon = { code: '', discountAmount: '', expiresAt: '' };

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [productForm, setProductForm] = useState(initialProduct);
  const [imagePreview, setImagePreview] = useState('');
  const [couponForm, setCouponForm] = useState(initialCoupon);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    loadAdminData();
  }, [isAdmin]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  async function loadAdminData() {
    setLoading(true);
    setMessage('');

    try {
      const [dashboardData, productData, couponData] = await Promise.all([
        adminService.dashboard(),
        adminService.products(),
        adminService.coupons()
      ]);
      setDashboard(dashboardData);
      setProducts(productData);
      setCoupons(couponData);
    } catch (error) {
      setMessageType('error');
      setMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProduct(event) {
    event.preventDefault();
    setSaving('product');
    setMessage('');

    try {
      await adminService.createProduct({
        ...productForm,
        price: Number(productForm.price),
        stockQuantity: Number(productForm.stockQuantity)
      });
      setProductForm(initialProduct);
      setImagePreview('');
      setMessageType('success');
      setMessage('Produto cadastrado com sucesso.');
      await loadAdminData();
    } catch (error) {
      setMessageType('error');
      setMessage(getApiErrorMessage(error));
    } finally {
      setSaving('');
    }
  }

  async function handleCreateCoupon(event) {
    event.preventDefault();
    setSaving('coupon');
    setMessage('');

    try {
      await adminService.createCoupon({
        code: couponForm.code,
        discountAmount: Number(couponForm.discountAmount),
        expiresAt: new Date(couponForm.expiresAt).toISOString()
      });
      setCouponForm(initialCoupon);
      setMessageType('success');
      setMessage('Cupom cadastrado com sucesso.');
      await loadAdminData();
    } catch (error) {
      setMessageType('error');
      setMessage(getApiErrorMessage(error));
    } finally {
      setSaving('');
    }
  }

  const summary = dashboard?.summary;

  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="Admin"
          title="Dashboard administrativo"
          description="Acompanhe vendas, assinaturas, compras de produtos e cadastre produtos e cupons."
        />
        <StatusMessage type={messageType}>{message}</StatusMessage>

        {loading ? (
          <div className="flex justify-center py-20 text-zinc-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Metric icon={Users} label="Assinaturas vendidas" value={summary?.totalSubscriptions ?? 0} />
              <Metric icon={BadgeDollarSign} label="Receita assinaturas" value={formatCurrency(summary?.subscriptionRevenue)} />
              <Metric icon={ReceiptText} label="Compras de produtos" value={summary?.productPurchases ?? 0} />
              <Metric icon={BadgeDollarSign} label="Receita produtos" value={formatCurrency(summary?.productRevenue)} />
              <Metric icon={Boxes} label="Produtos ativos" value={summary?.activeProducts ?? 0} />
              <Metric icon={Ticket} label="Cupons ativos" value={summary?.activeCoupons ?? 0} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <AdminForm title="Cadastrar produto" icon={Boxes} onSubmit={handleCreateProduct}>
                <input className="field" placeholder="Nome" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                <input className="field" placeholder="SKU" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })} required />
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-zinc-300">Imagem do produto</span>
                  <input
                    className="field file:mr-4 file:rounded-md file:border-0 file:bg-academy-neon file:px-4 file:py-2 file:text-sm file:font-black file:text-academy-ink"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setProductForm({ ...productForm, image: file });
                      setImagePreview(file ? URL.createObjectURL(file) : '');
                    }}
                    required
                  />
                </label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview do produto"
                    className="aspect-[16/9] w-full rounded-md border border-academy-line object-cover"
                  />
                )}
                <textarea className="field min-h-24" placeholder="Descricao" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} required />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="field" type="number" step="0.01" min="0.01" placeholder="Preco" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                  <input className="field" type="number" min="0" placeholder="Estoque" value={productForm.stockQuantity} onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })} required />
                </div>
                <button className="btn-primary w-full" disabled={saving === 'product'}>
                  {saving === 'product' ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Salvar produto
                </button>
              </AdminForm>

              <AdminForm title="Cadastrar cupom" icon={Ticket} onSubmit={handleCreateCoupon}>
                <input className="field" placeholder="Codigo" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} required />
                <input className="field" type="number" step="0.01" min="0.01" placeholder="Valor do desconto" value={couponForm.discountAmount} onChange={(e) => setCouponForm({ ...couponForm, discountAmount: e.target.value })} required />
                <input className="field" type="datetime-local" value={couponForm.expiresAt} onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })} required />
                <button className="btn-primary w-full" disabled={saving === 'coupon'}>
                  {saving === 'coupon' ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Salvar cupom
                </button>
              </AdminForm>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <DataPanel title="Ultimas assinaturas">
                <AdminTable
                  headers={['Aluno', 'Plano', 'Documento', 'Entrega/Cadastro', 'Cupom', 'Total', 'Status']}
                  rows={(dashboard?.recentSubscriptions ?? []).map((item) => [
                    `${item.userName} (${item.userEmail})`,
                    item.planName,
                    `${item.customerFullName} - CPF ${formatCpf(item.customerCpf)}`,
                    `${formatZipCode(item.customerZipCode)} - ${item.customerAddress}`,
                    item.couponCode ?? '-',
                    formatCurrency(item.finalAmount),
                    item.status
                  ])}
                />
              </DataPanel>

              <DataPanel title="Ultimas compras de produtos">
                <AdminTable
                  headers={['Aluno', 'Produto', 'Qtd', 'Documento', 'Endereco de envio', 'Total', 'Status']}
                  rows={(dashboard?.recentProductPurchases ?? []).map((item) => [
                    `${item.userName} (${item.userEmail})`,
                    item.productName,
                    item.quantity,
                    `${item.customerFullName} - CPF ${formatCpf(item.customerCpf)}`,
                    `${formatZipCode(item.customerZipCode)} - ${item.customerAddress}`,
                    formatCurrency(item.totalAmount),
                    item.status
                  ])}
                />
              </DataPanel>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <DataPanel title="Produtos cadastrados">
                <AdminTable
                  headers={['Produto', 'SKU', 'Imagem', 'Preco', 'Estoque', 'Ativo']}
                  rows={products.map((item) => [
                    item.name,
                    item.sku,
                    item.imageUrl ? 'Cadastrada' : '-',
                    formatCurrency(item.price),
                    item.stockQuantity,
                    item.active ? 'Sim' : 'Nao'
                  ])}
                />
              </DataPanel>

              <DataPanel title="Cupons cadastrados">
                <AdminTable
                  headers={['Codigo', 'Desconto', 'Expira em', 'Ativo']}
                  rows={coupons.map((item) => [
                    item.code,
                    formatCurrency(item.discountAmount),
                    new Date(item.expiresAt).toLocaleString('pt-BR'),
                    item.active ? 'Sim' : 'Nao'
                  ])}
                />
              </DataPanel>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="surface p-5">
      <Icon className="text-academy-neon" size={24} />
      <p className="mt-4 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm font-bold uppercase tracking-wide text-zinc-500">{label}</p>
    </div>
  );
}

function AdminForm({ title, icon: Icon, children, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="surface space-y-4 p-6">
      <h2 className="flex items-center gap-2 text-xl font-black text-white">
        <Icon className="text-academy-neon" /> {title}
      </h2>
      {children}
    </form>
  );
}

function DataPanel({ title, children }) {
  return (
    <section className="surface overflow-hidden">
      <div className="border-b border-academy-line p-5">
        <h2 className="text-xl font-black text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function AdminTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-5 py-3 font-black">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-academy-line">
          {rows.length === 0 ? (
            <tr>
              <td className="px-5 py-5 text-zinc-500" colSpan={headers.length}>Nenhum registro encontrado.</td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={`${row[0]}-${index}`} className="text-zinc-300">
                {row.map((cell, cellIndex) => (
                  <td key={`${cell}-${cellIndex}`} className="px-5 py-4">{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatCpf(value = '') {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatZipCode(value = '') {
  return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2');
}
