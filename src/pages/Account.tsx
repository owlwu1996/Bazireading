import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, Calendar, Download, Eye, Sparkles } from 'lucide-react';
import { useStore } from '../store';
import { useEffect, useState } from 'react';
import { API_URLS } from '../lib/api';

interface HistoryItem {
  id: number;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  gender: string;
  readingId: number;
  readingType: string;
  readingSections: any[];
  createdAt: string;
  readingDate: string;
}

export default function Account() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, authToken, logout, setCurrentChart, setCurrentReading } = useStore();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authToken) {
      navigate('/auth');
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await fetch(API_URLS.baziHistory, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        if (data.charts) {
          setHistory(data.charts);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [authToken, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewReport = async (item: HistoryItem) => {
    try {
      const chartResponse = await fetch(API_URLS.baziChart(item.id), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const chart = await chartResponse.json();

      setCurrentChart({
        ...chart,
        dbId: item.id,
        userName: item.name || user?.name || '',
      });

      if (item.readingId && item.readingSections) {
        setCurrentReading({
          id: item.readingId.toString(),
          baziId: item.id.toString(),
          type: (item.readingType || 'basic') as 'basic' | 'full' | 'compatibility',
          sections: item.readingSections,
          createdAt: item.readingDate || item.createdAt,
        });
      } else {
        setCurrentReading(null);
      }

      navigate('/report');
    } catch (error) {
      console.error('Failed to load chart:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getReportType = (type: string) => {
    switch (type) {
      case 'full': return 'Full Report';
      case 'basic': return 'Basic Report';
      case 'compatibility': return 'Compatibility';
      default: return 'Report';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F5F0E8]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-[#F5F0E8]/60 hover:text-[#D4A853] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        <div className="text-center mb-10">
          <div className="relative inline-block">
            <User className="w-12 h-12 text-[#D4A853] mx-auto mb-4" />
            <div className="absolute -top-1 -right-1 w-4 h-4 opacity-60">
              <svg viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="9" fill="none" stroke="#D4A853" strokeWidth="1"/>
                <path d="M10,1 A4.5,4.5 0 0,1 10,9.5 A4.5,4.5 0 0,0 10,19 A9,9 0 0,1 10,1" fill="#D4A853"/>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            My Account
          </h1>
          <p className="text-[#F5F0E8]/60">Welcome back, {user.name || user.email}</p>
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
            <h2 className="text-lg font-semibold flex items-center">
              <Sparkles className="w-5 h-5 text-[#D4A853] mr-2" />
              Report History
            </h2>
            <Link 
              to="/input" 
              className="flex items-center px-4 py-2 bg-[#D4A853]/20 border border-[#D4A853]/30 text-[#D4A853] rounded-lg hover:bg-[#D4A853]/30 transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              New Report
            </Link>
          </div>

          {loading ? (
            <p className="text-[#F5F0E8]/60">Loading...</p>
          ) : history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-4 bg-[#0F0F0F]/50 rounded-lg border border-[#D4A853]/10 hover:border-[#D4A853]/30 transition-all"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-[#D4A853]/10 rounded-lg flex items-center justify-center mr-4">
                      <Sparkles className="w-6 h-6 text-[#D4A853]" />
                    </div>
                    <div>
                      <p className="text-[#F5F0E8] font-medium">
                        {item.birthDate} {item.birthTime !== '12:00' && `at ${item.birthTime}`}
                      </p>
                      <div className="flex items-center text-sm text-[#F5F0E8]/60 mt-1">
                        <span className="capitalize">{item.gender}</span>
                        {item.birthCity && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{item.birthCity}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-xs px-2 py-0.5 bg-[#D4A853]/20 text-[#D4A853] rounded">
                          {getReportType(item.readingType)}
                        </span>
                        <span className="text-xs text-[#F5F0E8]/40 ml-2 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(item.readingDate || item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewReport(item)}
                    className="flex items-center px-4 py-2 bg-[#D4A853]/20 text-[#D4A853] rounded-lg hover:bg-[#D4A853]/30 transition-all"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-[#D4A853]/30 mx-auto mb-4" />
              <p className="text-[#F5F0E8]/60 mb-4">No reports generated yet</p>
              <Link 
                to="/input" 
                className="inline-flex items-center px-6 py-3 bg-[#D4A853] text-[#0F0F0F] font-semibold rounded-lg hover:bg-[#D4A853]/90 transition-all"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Your First Report
              </Link>
            </div>
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
