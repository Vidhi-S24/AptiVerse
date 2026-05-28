import "../styles/Profile.css";
import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";
import { AnimatedBee } from "../ui/AnimatedBee";
import { useProfileReview } from "../hooks/useProfileReview.ts";

import RadarChart from "../components/RadarChart";
import TrendLineChart from "../components/TrendLineChart";
import RollingAccuracyChart from "../components/RollingAccuracyChart";
import axios from "axios";

interface UserProfileData {
  name: string;
  email: string;
  attemptedQueries: number;
  score: number;
}

interface RadarItem {
  topic: string;
  score: number;
}

interface TrendItem {
  accuracy: number;
  createdAt: string;
}

interface AnalyticsData {
  attemptedTests: number;
  attemptedQuestions: number;
  totalScore: number;
  radarData: RadarItem[];
  testTrend: TrendItem[];
  recentHistory: boolean[];
}

function Profile() {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    loadSession();
  }, []);

  const {
    review,
    loading: reviewLoading,
    cooldown,
    generateReview,
  } = useProfileReview(session?.access_token);

  const trendData = analytics?.testTrend || [];
  const rollingHistory = analytics?.recentHistory || [];
  const hasTrendData = trendData && trendData.length > 0;
  const hasRadarData = analytics?.radarData && analytics.radarData.length > 0;
  const hasRollingData = rollingHistory && rollingHistory.length > 0;

  const formatReview = (text: string | null) => {
    if (!text) return null;

    const sections = text.split("\n\n");

    return sections.map((section, index) => {
      const lines = section.split("\n");

      const title = lines[0];
      const content = lines.slice(1).join(" ");

      return (
        <div key={index} className="review-section">
          <strong>{title}</strong>
          <p>{content}</p>
        </div>
      );
    });
  };

  const BeeEmptyState = ({ message }: { message: string }) => {
    return (
      <div className="bee-empty-state">
        <p className="bee-message">{message}</p>
      </div>
    );
  };
  const beeMessages = {
    trend: "No buzz yet! Take some tests to see your progress fly ",
    radar: "Your hive is empty! Start solving to build your skill honeycomb ",
    rolling: "No recent buzz! Answer questions to track your streak ",
  };


  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserData({
          name: user.user_metadata?.name,
          email: user.email || "",
          attemptedQueries: 0,
          score: 0,
        });
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const res = await axios.get("http://localhost:3000/api/users/analytics", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        setAnalytics(res.data);
      } catch (err) {
        console.error("Error loading analytics:", err);
      }
    };

    fetchAnalytics();
  }, []);

  useEffect(() => {
    document.title = `${userData?.name ? `${userData?.name} | ` : ""}Profile | AptiVerse`;
    return () => {
      document.title = "AptiVerse";
    };
  }, [userData?.name]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-content">
          <div>
            <AnimatedBee />
          </div>
          <p className="loading-text">LOADING PROFILE...</p>
        </div>
      </div>
    );
  }

  if (!userData)
    return <div className="error">Please log in to view profile.</div>;
  return (
    <div className="profile-page">
      <div className="profile-sidebar">
        <div className="profile-avatar-section">
          <div className="bee-badge">
            <div
              style={{
                position: "absolute",
                top: "-50px",
                left: "-30px",
                scale: "0.7",
                zIndex: "2",
                transform: "rotate(-20deg) scaleX(-1) scale(0.9)",

              }}
            >
              <AnimatedBee />
            </div>
          </div>
          <div className="profile-avatar-large">
            <span className="avatar-icon">👤</span>
          </div>
        </div>

        <div className="profile-info">
          <h2 className="profile-name">{userData.name}</h2>
          <p className="profile-email">{userData.email}</p>
        </div>

        <div className="profile-review">
          <div className="review-btn">
            <button
              onClick={generateReview}
              disabled={reviewLoading || cooldown > 0}
            >
              {/* {reviewLoading
                ? "Generating..."
                : cooldown > 0
                  ? `Wait ${Math.ceil(cooldown / 60000)} min`
                  : "Generate AI Review"} */}
              {reviewLoading ? (
                <>
                  <span className="spinner" />
                  Generating...
                </>
              ) : cooldown > 0 ? (
                `Wait ${Math.ceil(cooldown / 60000)} min`
              ) : (
                "Generate AI Review"
              )}
            </button>
            {review && (
              <div className="ai-review-box">
                <h3>Your AI Performance Review </h3>
                <div>{formatReview(review)}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="profile-main">
        <div className="stats-banner">
          <div
            style={{
              position: "absolute",
              top: "1px",
              right: "5px",
              scale: "0.7",
              zIndex: "2",
              transform: "rotate(15deg)",
            }}
          >
            <AnimatedBee />
          </div>
          <div className="stat-item">
            <span className="stat-label">Attempted Tests:</span>
            <span className="stat-value">
              {analytics?.attemptedTests?.toString().padStart(2, "0") || "00"}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Attempted Questions:</span>
            <span className="stat-value">
              {analytics?.attemptedQuestions?.toString().padStart(2, "0") || "00"}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Score:</span>
            <span className="stat-value">
              {analytics?.totalScore?.toString().padStart(2, "0") || "00"}
            </span>
          </div>
        </div>

        <div className="profile-content-box">
          <div className="line-chart-container">
            <div className="line-chart-wrapper">
              {!analytics ? (
                <p style={{ color: "white" }}>Loading trend...</p>
              ) : hasTrendData ? (
                <TrendLineChart data={trendData} />
              ) : (
                <BeeEmptyState message={beeMessages.trend} />
              )}
            </div>
          </div>
        </div>

        <div className="profile-charts">
          <div className="chart-container">
            <div className="chart-wrapper">
              {!analytics ? (
                <p style={{ color: "white" }}>Loading chart...</p>
              ) : hasRadarData ? (
                <RadarChart radarData={analytics.radarData} />
              ) : (
                <BeeEmptyState message={beeMessages.radar} />
              )}
            </div>
          </div>

          <div className="chart-container empty-chart">
            {!analytics ? (
              <p style={{ color: "white" }}>Loading rolling accuracy...</p>
            ) : hasRollingData ? (
              <RollingAccuracyChart history={rollingHistory} />
            ) : (
              <BeeEmptyState message={beeMessages.rolling} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
