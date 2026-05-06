import { BadgeDollarSign, Boxes, CalendarClock, Loader2, Minus, Plus, ReceiptText, Save, Ticket, Trash2, Users } from 'lucide-react';
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
const initialPlan = { name: '', description: '', price: '', durationMonths: '' };

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [plans, setPlans] = useState([]);
  const [productForm, setProductForm] = useState(initialProduct);
  const [editingProducts, setEditingProducts] = useState({});
  const [editingPlans, setEditingPlans] = useState({});
  const [editingCoupons, setEditingCoupons] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [couponForm, setCouponForm] = useState(initialCoupon);
  const [planForm, setPlanForm] = useState(initialPlan);
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
      const [dashboardData, productData, couponData, planData] = await Promise.all([
        adminService.dashboard(),
        adminService.products(),
        adminService.coupons(),
        adminService.plans()
      ]);
      setDashboard(dashboardData);
      setProducts(productData);
      setEditingProducts(Object.fromEntries(productData.map((product) => [product.id, toProductEditForm(product)])));
      setCoupons(couponData);
      setEditingCoupons(Object.fromEntries(couponData.map((coupon) => [coupon.id, toCouponEditForm(coupon)])));
      setPlans(planData);
      setEditingPlans(Object.fromEntries(planData.map((plan) => [plan.id, toPlanEditForm(plan)])));
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
        price: parseDecimalInput(productForm.price),
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

  async function handleUpdateProduct(event, id) {
    event.preventDefault();
    const form = editingProducts[id];
    if (!form) {
      return;
    }

    setSaving(`product-${id}`);
    setMessage('');

    try {
      const updated = await adminService.updateProduct(id, {
        ...form,
        price: parseDecimalInput(form.price),
        stockQuantity: Number(form.stockQuantity)
      });
      setProducts((current) => current.map((product) => (product.id === id ? updated : product)));
      setEditingProducts((current) => ({ ...current, [id]: toProductEditForm(updated) }));
      setMessageType('success');
      setMessage('Produto atualizado com sucesso.');
      await loadAdminData();
    } catch (error) {
      setMessageType('error');
      setMessage(getApiErrorMessage(error));
    } finally {
      setSaving('');
    }
  }

  function updateProductDraft(id, patch) {
    setEditingProducts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...patch
      }
    }));
  }

  async function handleDeleteProduct(id, name) {
    if (!window.confirm(`Excluir produto "${name}" do catalogo? O historico de compras sera mantido.`)) {
      return;
    }

    setSaving(`delete-product-${id}`);
    setMessage('');

    try {
      await adminService.deleteProduct(id);
      setMessageType('success');
      setMessage('Produto removido do catalogo.');
      await loadAdminData();
    } catch (error) {
      setMessageType('error');
      setMessage(getApiErrorMessage(error));
    } finally {
      setSaving('');
    }
  }

  async function handleUpdatePlan(event, id) {
    event.preventDefault();
    const form = editingPlans[id];
    if (!form) {
      return;
    }

    setSaving(`plan-${id}`);
    setMessage('');

    try {
      const updated = await adminService.updatePlan(id, {
        name: form.name,
        description: form.description,
        price: parseDecimalInput(form.price),
        durationMonths: Number(form.durationMonths),
        active: Boolean(form.active)
      });
      setPlans((current) => current.map((plan) => (plan.id === id ? updated : plan)));
      setEditingPlans((current) => ({ ...current, [id]: toPlanEditForm(updated) }));
      setMessageType('success');
      setMessage('Assinatura atualizada com sucesso.');
      await loadAdminData();
    } catch (error) {
      setMessageType('error');
      setMessage(getApiErrorMessage(error));
    } finally {
      setSaving('');
    }
  }

  function updatePlanDraft(id, patch) {
    setEditingPlans((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...patch
      }
    }));
  }

  async function handleDeletePlan(id, name) {
    if (!window.confirm(`Excluir assinatura "${name}" do catalogo? O historico de vendas sera mantido.`)) {
      return;
    }

    setSaving(`delete-plan-${id}`);
    setMessage('');

    try {
      await adminService.deletePlan(id);
      setMessageType('success');
      setMessage('Assinatura removida do catalogo.');
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
        discountAmount: parseDecimalInput(couponForm.discountAmount),
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

  async function handleUpdateCoupon(event, id) {
    event.preventDefault();
    const form = editingCoupons[id];
    if (!form) {
      return;
    }

    setSaving(`coupon-${id}`);
    setMessage('');

    try {
      const updated = await adminService.updateCoupon(id, {
        code: form.code,
        discountAmount: parseDecimalInput(form.discountAmount),
        expiresAt: new Date(form.expiresAt).toISOString(),
        active: Boolean(form.active)
      });
      setCoupons((current) => current.map((coupon) => (coupon.id === id ? updated : coupon)));
      setEditingCoupons((current) => ({ ...current, [id]: toCouponEditForm(updated) }));
      setMessageType('success');
      setMessage('Cupom atualizado com sucesso.');
      await loadAdminData();
    } catch (error) {
      setMessageType('error');
      setMessage(getApiErrorMessage(error));
    } finally {
      setSaving('');
    }
  }

  function updateCouponDraft(id, patch) {
    setEditingCoupons((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...patch
      }
    }));
  }

  async function handleDeleteCoupon(id, code) {
    if (!window.confirm(`Excluir cupom "${code}"? Ele nao podera ser usado em novos checkouts.`)) {
      return;
    }

    setSaving(`delete-coupon-${id}`);
    setMessage('');

    try {
      await adminService.deleteCoupon(id);
      setMessageType('success');
      setMessage('Cupom removido.');
      await loadAdminData();
    } catch (error) {
      setMessageType('error');
      setMessage(getApiErrorMessage(error));
    } finally {
      setSaving('');
    }
  }

  async function handleCreatePlan(event) {
    event.preventDefault();
    setSaving('plan');
    setMessage('');

    try {
      await adminService.createPlan({
        name: planForm.name,
        description: planForm.description,
        price: parseDecimalInput(planForm.price),
        durationMonths: Number(planForm.durationMonths)
      });
      setPlanForm(initialPlan);
      setMessageType('success');
      setMessage('Assinatura cadastrada com sucesso.');
      await loadAdminData();
    } catch (error) {
      setMessageType('error');
      setMessage(getApiErrorMessage(error));
    } finally {
      setSaving('');
    }
  }

  const summary = dashboard?.summary;
  const activeProducts = products.filter((product) => product.active);
  const activePlans = plans.filter((plan) => plan.active);
  const activeCoupons = coupons.filter((coupon) => coupon.active);

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

            <div className="grid gap-6 lg:grid-cols-3">
              <AdminForm title="Cadastrar assinatura" icon={CalendarClock} onSubmit={handleCreatePlan}>
                <input className="field" placeholder="Nome do plano" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} required />
                <textarea className="field min-h-24" placeholder="Descricao do plano" value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} required />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="field" type="number" step="0.01" min="0.01" placeholder="Preco" value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} required />
                  <input className="field" type="number" min="1" max="36" placeholder="Meses" value={planForm.durationMonths} onChange={(e) => setPlanForm({ ...planForm, durationMonths: e.target.value })} required />
                </div>
                <button className="btn-primary w-full" disabled={saving === 'plan'}>
                  {saving === 'plan' ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Salvar assinatura
                </button>
              </AdminForm>

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

            <DataPanel title="Controle de produtos">
              <div className="grid gap-4 p-5 lg:grid-cols-2">
                {activeProducts.length === 0 ? (
                  <p className="text-zinc-500">Nenhum produto cadastrado.</p>
                ) : (
                  activeProducts.map((product) => (
                    <ProductControlCard
                      key={product.id}
                      product={product}
                      form={editingProducts[product.id] ?? toProductEditForm(product)}
                      saving={saving === `product-${product.id}`}
                      deleting={saving === `delete-product-${product.id}`}
                      onChange={(patch) => updateProductDraft(product.id, patch)}
                      onSubmit={(event) => handleUpdateProduct(event, product.id)}
                      onDelete={() => handleDeleteProduct(product.id, product.name)}
                    />
                  ))
                )}
              </div>
            </DataPanel>

            <div className="grid gap-6 xl:grid-cols-2">
              <DataPanel title="Controle de assinaturas">
                <div className="grid gap-4 p-5">
                  {activePlans.length === 0 ? (
                    <EmptyPanel icon={CalendarClock} text="Nenhuma assinatura cadastrada." />
                  ) : (
                    activePlans.map((plan) => (
                      <PlanControlCard
                        key={plan.id}
                        form={editingPlans[plan.id] ?? toPlanEditForm(plan)}
                        saving={saving === `plan-${plan.id}`}
                        deleting={saving === `delete-plan-${plan.id}`}
                        onChange={(patch) => updatePlanDraft(plan.id, patch)}
                        onSubmit={(event) => handleUpdatePlan(event, plan.id)}
                        onDelete={() => handleDeletePlan(plan.id, plan.name)}
                      />
                    ))
                  )}
                </div>
              </DataPanel>

              <DataPanel title="Controle de cupons">
                <div className="grid gap-4 p-5">
                  {activeCoupons.length === 0 ? (
                    <EmptyPanel icon={Ticket} text="Nenhum cupom cadastrado." />
                  ) : (
                    activeCoupons.map((coupon) => (
                      <CouponControlCard
                        key={coupon.id}
                        form={editingCoupons[coupon.id] ?? toCouponEditForm(coupon)}
                        saving={saving === `coupon-${coupon.id}`}
                        deleting={saving === `delete-coupon-${coupon.id}`}
                        onChange={(patch) => updateCouponDraft(coupon.id, patch)}
                        onSubmit={(event) => handleUpdateCoupon(event, coupon.id)}
                        onDelete={() => handleDeleteCoupon(coupon.id, coupon.code)}
                      />
                    ))
                  )}
                </div>
              </DataPanel>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <DataPanel title="Ultimas assinaturas">
                <AdminTable
                  headers={['Aluno', 'Plano', 'Documento', 'Entrega/Cadastro', 'Cupom', 'Total', 'Status']}
                  rows={(dashboard?.recentSubscriptions ?? []).map((item) => [
                    `${item.userName} (${item.userEmail})`,
                    item.planName,
                    `${item.customerFullName} - CPF ${formatCpf(item.customerCpf)}`,
                    `${formatZipCode(item.customerZipCode)} - ${item.customerAddress}, ${item.customerCity}/${item.customerState}`,
                    item.couponCode ?? '-',
                    formatCurrency(item.finalAmount),
                    item.status
                  ])}
                />
              </DataPanel>

              <DataPanel title="Ultimas compras de produtos">
                <AdminTable
                  headers={['Aluno', 'Produto', 'Cupom', 'Qtd', 'Documento', 'Endereco de envio', 'Total', 'Status']}
                  rows={(dashboard?.recentProductPurchases ?? []).map((item) => [
                    `${item.userName} (${item.userEmail})`,
                    item.productName,
                    item.couponCode ?? '-',
                    item.quantity,
                    `${item.customerFullName} - CPF ${formatCpf(item.customerCpf)}`,
                    item.fulfillmentType === 'Pickup'
                      ? 'Retirada no local'
                      : `${formatZipCode(item.customerZipCode)} - ${item.customerAddress}, ${item.customerCity}/${item.customerState}`,
                    formatCurrency(item.totalAmount),
                    item.status
                  ])}
                />
              </DataPanel>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <DataPanel title="Assinaturas cadastradas">
                <AdminTable
                  headers={['Plano', 'Descricao', 'Preco', 'Duracao', 'Ativo']}
                  rows={plans.map((item) => [
                    item.name,
                    item.description,
                    formatCurrency(item.price),
                    `${item.durationMonths} mes${item.durationMonths === 1 ? '' : 'es'}`,
                    item.active ? 'Sim' : 'Nao'
                  ])}
                />
              </DataPanel>

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

function ProductControlCard({ product, form, saving, deleting, onChange, onSubmit, onDelete }) {
  const stock = Number(form.stockQuantity) || 0;

  return (
    <form onSubmit={onSubmit} className="rounded-md border border-academy-line bg-white/[0.03] p-4">
      <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
        <img
          src={form.previewUrl || product.imageUrl}
          alt={product.name}
          className="aspect-square w-full rounded-md border border-academy-line object-cover"
        />
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <input className="field" placeholder="Nome" value={form.name} onChange={(e) => onChange({ name: e.target.value })} required />
            <input className="field" placeholder="SKU" value={form.sku} onChange={(e) => onChange({ sku: e.target.value.toUpperCase() })} required />
          </div>
          <textarea className="field min-h-20" placeholder="Descricao" value={form.description} onChange={(e) => onChange({ description: e.target.value })} required />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <input className="field" type="number" step="0.01" min="0.01" placeholder="Preco" value={form.price} onChange={(e) => onChange({ price: e.target.value })} required />
        <div className="flex overflow-hidden rounded-md border border-academy-line bg-academy-panel">
          <button type="button" className="grid w-12 place-items-center text-academy-neon hover:bg-white/5" onClick={() => onChange({ stockQuantity: Math.max(0, stock - 1) })} aria-label="Remover estoque">
            <Minus size={16} />
          </button>
          <input className="min-w-0 flex-1 bg-transparent px-3 text-center font-bold text-white outline-none" type="number" min="0" value={form.stockQuantity} onChange={(e) => onChange({ stockQuantity: e.target.value })} required />
          <button type="button" className="grid w-12 place-items-center text-academy-neon hover:bg-white/5" onClick={() => onChange({ stockQuantity: stock + 1 })} aria-label="Adicionar estoque">
            <Plus size={16} />
          </button>
        </div>
        <label className="flex items-center justify-between gap-3 rounded-md border border-academy-line bg-academy-panel px-4 py-3 text-sm font-bold text-zinc-300">
          Ativo
          <input type="checkbox" checked={Boolean(form.active)} onChange={(e) => onChange({ active: e.target.checked })} />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input
          className="field file:mr-4 file:rounded-md file:border-0 file:bg-academy-neon file:px-4 file:py-2 file:text-sm file:font-black file:text-academy-ink"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            onChange({ image: file, previewUrl: file ? URL.createObjectURL(file) : product.imageUrl });
          }}
        />
        <button className="btn-primary" disabled={saving}>
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Atualizar
        </button>
        <button type="button" className="btn-secondary border-academy-danger/40 text-red-100 hover:border-academy-danger hover:bg-academy-danger/15" disabled={deleting} onClick={onDelete}>
          {deleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />} Excluir
        </button>
      </div>
    </form>
  );
}

function PlanControlCard({ form, saving, deleting, onChange, onSubmit, onDelete }) {
  return (
    <form onSubmit={onSubmit} className="rounded-md border border-academy-line bg-white/[0.03] p-4">
      <div className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
          <input className="field" placeholder="Nome do plano" value={form.name} onChange={(e) => onChange({ name: e.target.value })} required />
          <label className="flex items-center justify-between gap-3 rounded-md border border-academy-line bg-academy-panel px-4 py-3 text-sm font-bold text-zinc-300">
            Ativo
            <input type="checkbox" checked={Boolean(form.active)} onChange={(e) => onChange({ active: e.target.checked })} />
          </label>
        </div>
        <textarea className="field min-h-24" placeholder="Descricao do plano" value={form.description} onChange={(e) => onChange({ description: e.target.value })} required />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_150px_auto_auto]">
        <input className="field" type="number" step="0.01" min="0.01" placeholder="Preco" value={form.price} onChange={(e) => onChange({ price: e.target.value })} required />
        <input className="field" type="number" min="1" max="36" placeholder="Meses" value={form.durationMonths} onChange={(e) => onChange({ durationMonths: e.target.value })} required />
        <button className="btn-primary" disabled={saving}>
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Atualizar
        </button>
        <button type="button" className="btn-secondary border-academy-danger/40 text-red-100 hover:border-academy-danger hover:bg-academy-danger/15" disabled={deleting} onClick={onDelete}>
          {deleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />} Excluir
        </button>
      </div>
    </form>
  );
}

function CouponControlCard({ form, saving, deleting, onChange, onSubmit, onDelete }) {
  return (
    <form onSubmit={onSubmit} className="rounded-md border border-academy-line bg-white/[0.03] p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
        <input className="field" placeholder="Codigo" value={form.code} onChange={(e) => onChange({ code: e.target.value.toUpperCase() })} required />
        <label className="flex items-center justify-between gap-3 rounded-md border border-academy-line bg-academy-panel px-4 py-3 text-sm font-bold text-zinc-300">
          Ativo
          <input type="checkbox" checked={Boolean(form.active)} onChange={(e) => onChange({ active: e.target.checked })} />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input className="field" type="number" step="0.01" min="0.01" placeholder="Desconto" value={form.discountAmount} onChange={(e) => onChange({ discountAmount: e.target.value })} required />
        <input className="field" type="datetime-local" value={form.expiresAt} onChange={(e) => onChange({ expiresAt: e.target.value })} required />
        <button className="btn-primary" disabled={saving}>
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Atualizar
        </button>
        <button type="button" className="btn-secondary border-academy-danger/40 text-red-100 hover:border-academy-danger hover:bg-academy-danger/15" disabled={deleting} onClick={onDelete}>
          {deleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />} Excluir
        </button>
      </div>
    </form>
  );
}

function EmptyPanel({ icon: Icon, text }) {
  return (
    <div className="rounded-md border border-dashed border-academy-line bg-black/20 p-6 text-center">
      <Icon className="mx-auto text-zinc-600" size={28} />
      <p className="mt-3 text-sm text-zinc-500">{text}</p>
    </div>
  );
}

function AdminTable({ headers, rows }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
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

      <div className="grid gap-3 p-4 md:hidden">
        {rows.length === 0 ? (
          <div className="rounded-md border border-dashed border-academy-line bg-black/20 p-6 text-center">
            <ReceiptText className="mx-auto text-zinc-600" size={28} />
            <p className="mt-3 text-sm text-zinc-500">Nenhum registro encontrado.</p>
          </div>
        ) : (
          rows.map((row, index) => (
            <article key={`${row[0]}-${index}`} className="overflow-hidden rounded-md border border-academy-line bg-white/[0.03]">
              <div className="border-b border-academy-line bg-white/[0.04] p-4">
                <p className="text-[11px] font-black uppercase tracking-wide text-academy-neon">{headers[0]}</p>
                <p className="mt-1 break-words text-base font-black leading-6 text-white">{row[0]}</p>
              </div>
              <dl className="grid gap-0">
                {row.slice(1).map((cell, cellIndex) => {
                  const label = headers[cellIndex + 1];
                  const isStatus = label?.toLowerCase() === 'status' || label?.toLowerCase() === 'ativo';
                  return (
                    <div key={`${label}-${cellIndex}`} className="grid grid-cols-[104px_1fr] gap-3 border-b border-academy-line/70 px-4 py-3 last:border-b-0">
                      <dt className="text-[10px] font-black uppercase tracking-wide text-zinc-500">{label}</dt>
                      <dd className="min-w-0 break-words text-sm leading-6 text-zinc-300">
                        {isStatus ? <StatusPill value={cell} /> : cell}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </article>
          ))
        )}
      </div>
    </>
  );
}

function StatusPill({ value }) {
  const normalized = String(value ?? '').toLowerCase();
  const isPositive = ['sim', 'paid', 'pago', 'ativo'].includes(normalized);
  const isPending = ['pending', 'pendente'].includes(normalized);
  const styles = isPositive
    ? 'border-academy-neon/30 bg-academy-neon/10 text-academy-neon'
    : isPending
      ? 'border-academy-cyan/30 bg-academy-cyan/10 text-cyan-100'
      : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-200';

  return <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-black uppercase ${styles}`}>{value}</span>;
}

function toPlanEditForm(plan) {
  return {
    name: plan.name ?? '',
    description: plan.description ?? '',
    price: plan.price ?? '',
    durationMonths: plan.durationMonths ?? 1,
    active: Boolean(plan.active)
  };
}

function toCouponEditForm(coupon) {
  return {
    code: coupon.code ?? '',
    discountAmount: coupon.discountAmount ?? '',
    expiresAt: toDateTimeLocal(coupon.expiresAt),
    active: Boolean(coupon.active)
  };
}

function toDateTimeLocal(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function toProductEditForm(product) {
  return {
    name: product.name ?? '',
    description: product.description ?? '',
    sku: product.sku ?? '',
    price: product.price ?? '',
    stockQuantity: product.stockQuantity ?? 0,
    active: Boolean(product.active),
    image: null,
    previewUrl: product.imageUrl ?? ''
  };
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

function parseDecimalInput(value) {
  if (typeof value === 'number') {
    return value;
  }

  return Number(String(value ?? '').trim().replace(',', '.'));
}
