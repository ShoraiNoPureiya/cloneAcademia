import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerInfoModal from '../components/checkout/CustomerInfoModal.jsx';
import OptimizedImage from '../components/ui/OptimizedImage.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import StatusMessage from '../components/ui/StatusMessage.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getApiErrorMessage } from '../services/api.js';
import { productsService } from '../services/productsService.js';
import { formatCurrency } from '../utils/format.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [buyingId, setBuyingId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const data = await productsService.list();
        if (active) {
          setProducts(data.filter((product) => product.active));
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

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  async function handlePurchase(product, customerInfo) {
    if (!isAuthenticated) {
      setMessage('Entre na sua conta para comprar produtos.');
      return;
    }

    setBuyingId(product.id);
    setMessage('');

    try {
      const purchase = await productsService.purchase(product.id, 1, customerInfo);
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, stockQuantity: Math.max(0, item.stockQuantity - 1) } : item
        )
      );
      setSelectedProduct(null);

      if (purchase.checkoutUrl) {
        window.location.assign(purchase.checkoutUrl);
      }
    } catch (error) {
      setMessage(getApiErrorMessage(error));
      if (error?.response?.status === 401) {
        setSelectedProduct(null);
        navigate('/login');
      }
    } finally {
      setBuyingId(null);
    }
  }

  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="Loja"
          title="Produtos para acelerar sua rotina"
          description="Suplementos selecionados para completar treino, recuperacao e energia."
        />
        <StatusMessage type="error">{message}</StatusMessage>

        {loading ? (
          <p className="text-center text-zinc-400">Carregando produtos...</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="surface overflow-hidden">
                <OptimizedImage
                  src={product.imageUrl}
                  alt={product.name}
                  className="aspect-[4/3] w-full object-cover"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-white">{product.name}</h3>
                      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-academy-cyan">{product.sku}</p>
                    </div>
                    <p className="font-black text-academy-neon">{formatCurrency(product.price)}</p>
                  </div>
                  <p className="mt-4 min-h-14 leading-7 text-zinc-400">{product.description}</p>
                  <button
                    type="button"
                    className="btn-primary mt-5 w-full"
                    onClick={() => {
                      if (!isAuthenticated) {
                        setMessage('Entre na sua conta para comprar produtos.');
                        return;
                      }
                      setSelectedProduct(product);
                    }}
                    disabled={buyingId === product.id || product.stockQuantity <= 0}
                  >
                    <ShoppingCart size={18} /> {product.stockQuantity > 0 ? 'Comprar' : 'Sem estoque'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        <CustomerInfoModal
          open={Boolean(selectedProduct)}
          title="Dados para entrega"
          description="Essas informacoes ficam visiveis para o administrador enviar o produto corretamente."
          loading={Boolean(buyingId)}
          error={message}
          onClose={() => setSelectedProduct(null)}
          onSubmit={(customerInfo) => handlePurchase(selectedProduct, customerInfo)}
        />
      </div>
    </section>
  );
}
