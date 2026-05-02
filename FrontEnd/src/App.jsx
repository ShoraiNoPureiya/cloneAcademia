import { Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout.jsx';
import Home from './pages/Home.jsx';
import Plans from './pages/Plans.jsx';
import About from './pages/About.jsx';
import Products from './pages/Products.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import MyPurchases from './pages/MyPurchases.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/assinaturas" element={<Plans />} />
        <Route path="/conheca-o-local" element={<About />} />
        <Route path="/produtos" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/minhas-compras" element={<MyPurchases />} />
      </Route>
    </Routes>
  );
}
