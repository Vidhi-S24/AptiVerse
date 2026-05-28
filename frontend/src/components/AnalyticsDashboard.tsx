import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { supabase } from "../lib/supabaseClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// --- INTERFACES ---
interface RadarPoint { 
  topic: string; 
  score: number; 
}

interface TestTrendEntry { 
  accuracy: number; 
  createdAt: string; 
}

interface UserAnalytics {
  radarData: RadarPoint[];
  testTrend: TestTrendEntry[];
  recentHistory: boolean[];
}

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await axios.get<UserAnalytics>(`${API_URL}/api/users/analytics`, {
          withCredentials: true, 
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });

        setData(response.data);
        setError(null);
      } catch (err: any) {
        console.error("Error loading analytics:", err);
        setError(err.response?.data?.message || "Failed to load performance data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Analyzing performance data...</div>;
  if (error) return <div style={{ color: '#ef4444', padding: '20px' }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: '20px' }}>No data found.</div>;

  // Calculate quick stats for the "Normal Print" section
  const correctCount = data.recentHistory.filter(x => x).length;
  const rollingAccuracy = data.recentHistory.length > 0 
    ? Math.round((correctCount / data.recentHistory.length) * 100) 
    : 0;

  return (
    <div>
        {/* 4. RAW DATA INSPECTION (FOR DEVELOPER) */}
        <section style={{ marginTop: '20px' }}>
          <details>
            <summary style={{ cursor: 'pointer', color: '#64748b', fontSize: '13px' }}>
                View Raw API Response (JSON)
            </summary>
            <div style={{ marginTop: '10px', backgroundColor: '#1e293b', color: '#f8fafc', padding: '16px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto' }}>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          </details>
        </section>
      </div>
  );
};

export default AnalyticsDashboard;