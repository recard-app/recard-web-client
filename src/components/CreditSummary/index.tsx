import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCreditService } from '../../services/UserServices/UserCreditService';
import { MonthlyStatsResponse } from '../../types';
import Icon from '@/icons';

const CreditSummary: React.FC = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState<MonthlyStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await UserCreditService.fetchMonthlyStats();
        setStatsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch monthly stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading monthly stats...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!statsData) {
    return <div>No stats data available</div>;
  }

  return (
    <div>
      <div>Monthly Credits: ${statsData.MonthlyCredits.used} / ${statsData.MonthlyCredits.possible}</div>
      <div>All Credits: ${statsData.AllCredits.used} / ${statsData.AllCredits.possible}</div>
      <div>{statsData.ExpiringCredits.Total.count} Total credits worth ${statsData.ExpiringCredits.Total.unusedValue} expiring soon</div>
      <div>
        <button
          className="button ghost icon with-text"
          onClick={() => navigate('/my-credits/history')}
        >
          <Icon name="history-clock" variant="micro" size={14} />
          See Credit History
        </button>
      </div>
    </div>
  );
};

export default CreditSummary;