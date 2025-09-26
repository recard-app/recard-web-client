import React, { useState, useEffect } from 'react';
import { UserCreditService } from '../../services/UserServices/UserCreditService';
import { MonthlyStatsResponse } from '../../types';

const CreditSummary: React.FC = () => {
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
      <div>{statsData.ExpiringCredits.Monthly.count} Monthly credits worth ${statsData.ExpiringCredits.Monthly.unusedValue} expiring soon</div>
      <div>{statsData.ExpiringCredits.Quarterly.count} Quarterly credits worth ${statsData.ExpiringCredits.Quarterly.unusedValue} expiring soon</div>
      <div>{statsData.ExpiringCredits.Semiannually.count} Semiannual credits worth ${statsData.ExpiringCredits.Semiannually.unusedValue} expiring soon</div>
      <div>{statsData.ExpiringCredits.Annually.count} Annual credits worth ${statsData.ExpiringCredits.Annually.unusedValue} expiring soon</div>
      <div>{statsData.ExpiringCredits.Total.count} Total credits worth ${statsData.ExpiringCredits.Total.unusedValue} expiring soon</div>
    </div>
  );
};

export default CreditSummary;