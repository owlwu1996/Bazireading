import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, CreditCard, Calendar, Check, X } from 'lucide-react';
import { useStore } from '../store';
import { useEffect, useState } from 'react';

export default function Account() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, authToken, logout } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authToken) {
      navigate('/auth');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-purchase`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [authToken, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F5F0E8]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-[#F5F0E8]/60 hover:text-[#D4A853] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        <div className="text-center mb-10">
          <User className="w-12 h-12 text-[#D4A853] mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            My Account
          </h1>
          <p className="text-[#F5F0E8]/60">Manage your account and view your purchases</p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#D4A853]/20 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#D4A853]/10">
              <span className="text-[#F5F0E8]/60">Email</span>
              <span className="text-[#F5F0E8]">{user.email}</span>
            </div>
            {user.name && (
              <div className="flex justify-between items-center py-2 border-b border-[#D4A853]/10">
                <span className="text-[#F5F0E8]/60">Name</span>
                <span className="text-[#F5F0E8]">{user.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#D4A853]/20 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Purchase History</h2>
            <Link to="/pricing" className="text-[#D4A853] text-sm hover:underline">
              Make new purchase
            </Link>
          </div>

          {loading ? (
            <p className="text-[#F5F0E8]/60">Loading...</p>
          ) : orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order: any) => (
                <div key={order.id} className="flex justify-between items-center py-3 border-b border-[#D4A853]/10 last:border-0">
                  <div className="flex items-center">
                    {order.status === 'completed' ? (
                      <Check className="w-5 h-5 text-green-400 mr-3" />
                    ) : (
                      <X className="w-5 h-5 text-red-400 mr-3" />
                    )}
                    <div>
                      <p className="text-[#F5F0E8] capitalize">{order.plan_type.replace('_', ' ')}</p>
                      <p className="text-sm text-[#F5F0E8]/60">
                        ${order.amount} {order.currency}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#F5F0E8]/60 text-sm capitalize">{order.status}</p>
                    <p className="text-sm text-[#F5F0E8]/40">{order.paid_at || 'Pending'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#F5F0E8]/60">No purchases yet</p>
          )}
        </div>

        <div className="bg-[#1a1a1a] border border-red-500/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h2>
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-500/20 border border-red-500/50 text-red-400 font-semibold rounded-lg hover:bg-red-500/30 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
