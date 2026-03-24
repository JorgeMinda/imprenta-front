// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  Package, Clock, CheckCircle, DollarSign, ArrowRight, AlertTriangle,
  Plus, Users, ShoppingBag, Paintbrush
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductoAlert {
  id: number;
  nombre: string;
  stock: number;
}

interface Stats {
  diseno: number;      // estado 'diseño'  (antes "pendientes")
  en_proceso: number;  // estado 'en proceso'
  terminadas: number;  // estado 'terminada'
  ganancias: number;
}

export default function Dashboard() {
  const { user, token } = useAuth();

  const [stats, setStats] = useState<Stats>({
    diseno: 0,
    en_proceso: 0,
    terminadas: 0,
    ganancias: 0,
  });

  const [alertasStock, setAlertasStock] = useState<ProductoAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const toastStyle = {
    background: '#1F2937',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.75rem',
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, productosRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/stats/dashboard`, { headers }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/productos`, { headers }),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          // Soporta tanto la respuesta nueva (diseno) como la vieja (pendientes)
          // para no romper nada si el backend aún no se actualizó
          setStats({
            diseno:     data.diseno     ?? data.pendientes ?? 0,
            en_proceso: data.en_proceso ?? 0,
            terminadas: data.terminadas ?? 0,
            ganancias:  data.ganancias  ?? 0,
          });
        }

        if (productosRes.ok) {
          const productos = await productosRes.json();
          const bajos = productos.filter(
            (p: ProductoAlert) => p.stock !== undefined && p.stock <= 5
          );
          setAlertasStock(bajos);
        }

        if (user?.nombre && !sessionStorage.getItem('welcomeToastShown')) {
          toast(`¡Qué bueno verte de nuevo, ${user.nombre}!`, {
            icon: '👋',
            style: toastStyle,
            duration: 3000,
          });
          sessionStorage.setItem('welcomeToastShown', 'true');
        }
      } catch (err) {
        console.error('Error cargando dashboard:', err);
        toast.error('Error al sincronizar datos', { style: toastStyle });
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token, user]);

  // ── Tarjetas KPI — ahora "DISEÑO" en lugar de "PENDIENTES" ────────────────
  const statsCards = [
    {
      id: 'card-diseno',
      title: 'EN DISEÑO',
      value: stats.diseno,
      icon: Paintbrush,
      color: '#8B5CF6',          // violet — igual que el badge en Ordenes
    },
    {
      id: 'card-proc',
      title: 'EN PROCESO',
      value: stats.en_proceso,
      icon: Clock,
      color: '#F59E0B',          // amber
    },
    {
      id: 'card-term',
      title: 'TERMINADAS',
      value: stats.terminadas,
      icon: CheckCircle,
      color: '#10B981',          // emerald
    },
    {
      id: 'card-ganan',
      title: 'GANANCIAS',
      value: `$${Number(stats.ganancias).toLocaleString('es-EC')}`,
      icon: DollarSign,
      color: '#3B82F6',          // blue
    },
  ];

  const quickActions = [
    { id: 'qa-cotiz', title: 'Nueva Cotización', to: '/cotizaciones', icon: Plus,       gradient: 'from-indigo-600 to-blue-700',   desc: 'Crea presupuestos y envía cotizaciones' },
    { id: 'qa-ord',   title: 'Ver Órdenes',      to: '/ordenes',      icon: Package,    gradient: 'from-emerald-600 to-teal-700',  desc: 'Controla producción y entregas' },
    { id: 'qa-clie',  title: 'Clientes',          to: '/clientes',     icon: Users,      gradient: 'from-blue-600 to-cyan-700',    desc: 'Gestiona contactos y datos' },
    { id: 'qa-prod',  title: 'Productos',         to: '/productos',    icon: ShoppingBag,gradient: 'from-purple-600 to-violet-700',desc: 'Catálogo y stock actualizado' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex space-x-2">
          {[0, 0.1, 0.2].map((d, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce"
              style={{ animationDelay: `${d}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          Bienvenido{user?.nombre ? `, ${user.nombre}` : ''}
          <span className="inline-block origin-bottom-right">👋</span>
        </h2>
        <p className="text-sm text-gray-400">Resumen general y panel de control</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="relative bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden group"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
              style={{ background: `radial-gradient(circle at center, ${stat.color}, transparent 70%)` }}
            />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-gray-800/50 border border-white/5 shadow-inner"
                style={{ boxShadow: `0 0 20px ${stat.color}33` }}
              >
                <stat.icon className="w-7 h-7" style={{ color: stat.color }} />
              </div>
              <p className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">{stat.title}</p>
              <p className="text-4xl font-black tracking-tight text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alertas de Stock */}
      {alertasStock.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
        >
          <div className="flex items-center gap-3 mb-5">
            <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
            <h3 className="text-lg font-bold text-red-400">Atención: Stock Crítico</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {alertasStock.map((p, idx) => (
              <div
                key={`stock-alert-${p.id}-${idx}`}
                className="bg-gray-900/60 p-4 rounded-xl border border-white/5 flex justify-between items-center"
              >
                <p className="font-medium text-gray-200 truncate pr-2">{p.nombre}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  {p.stock} unids.
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Accesos Rápidos */}
      <div className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, i) => (
            <Link key={action.id} to={action.to}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`h-full bg-gradient-to-br ${action.gradient} text-white rounded-2xl p-6 shadow-lg relative overflow-hidden group border border-white/10`}
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex flex-col items-start h-full">
                  <div className="bg-white/20 p-3 rounded-xl mb-4 backdrop-blur-md border border-white/10 shadow-inner">
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2 group-hover:gap-3 transition-all">
                    {action.title}
                    <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                  </h3>
                  <p className="text-white/80 font-medium text-sm mt-auto leading-relaxed">{action.desc}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}