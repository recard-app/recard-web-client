import React, { useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import { PAGE_ICONS, PAGE_NAMES, PAGES } from '../../types';
import { Link } from 'react-router-dom';
import { UserCreditService } from '../../services';
import './MyCredits.scss';

const MyCredits: React.FC = () => {
  // Sync credit history when visiting the my-credits page
  useEffect(() => {
    const syncCredits = async () => {
      try {
        await UserCreditService.syncCurrentYearCreditsDebounced();
      } catch (syncError) {
        console.warn('Failed to sync credit history on my-credits page visit:', syncError);
      }
    };

    syncCredits();
  }, []);

  return (
    <div className="standard-page-layout">
      <PageHeader
        title={PAGE_NAMES.MY_CREDITS}
        icon={PAGE_ICONS.MY_CREDITS.MINI}
      />
      <div className="standard-page-content--padded" style={{ paddingTop: 12 }}>
        <Link to={`${PAGES.MY_CREDITS.PATH}/history`} className="button icon with-text">See Credits History</Link>
      </div>
    </div>
  );
};

export default MyCredits;


