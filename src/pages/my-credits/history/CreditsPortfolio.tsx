import React from 'react';
import PageHeader from '../../../components/PageHeader';
import { PAGE_ICONS, PAGE_NAMES, PAGES } from '../../../types';
import { CreditCardDetails } from '../../../types/CreditCardTypes';
import { CreditPortfolioView } from '../../../components/CreditPortfolio';
import CreditsTabFooter from '@/components/PageControls/CreditsTabFooter';
import { useFullHeight } from '../../../hooks/useFullHeight';
import '../shared-credits-layout.scss';
import './CreditsPortfolio.scss';

interface CreditsPortfolioProps {
  userCardDetails: CreditCardDetails[];
  reloadTrigger?: number;
  onRefreshMonthlyStats?: () => void;
  onAddUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  onRemoveUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  isCreditUpdating?: (cardId: string, creditId: string, periodNumber: number) => boolean;
  onClearAllUpdatingCredits?: () => void;
}

const CreditsPortfolio: React.FC<CreditsPortfolioProps> = ({
  userCardDetails,
  reloadTrigger,
  onRefreshMonthlyStats,
  onAddUpdatingCreditId,
  onRemoveUpdatingCreditId,
  isCreditUpdating,
  onClearAllUpdatingCredits
}) => {
  useFullHeight(true);

  return (
    <div className="standard-page-layout">
      <PageHeader
        title={PAGE_NAMES.MY_CREDITS}
        icon={PAGE_ICONS.MY_CREDITS.MINI}
      />

      <div className="standard-page-content--no-padding">
        <div className="credits-history-panel">
          <CreditPortfolioView
            userCardDetails={userCardDetails}
            reloadTrigger={reloadTrigger}
            onRefreshMonthlyStats={onRefreshMonthlyStats}
            onAddUpdatingCreditId={onAddUpdatingCreditId}
            onRemoveUpdatingCreditId={onRemoveUpdatingCreditId}
            isCreditUpdating={isCreditUpdating}
            onClearAllUpdatingCredits={onClearAllUpdatingCredits}
          />
          <CreditsTabFooter />
        </div>
      </div>
    </div>
  );
};

export default CreditsPortfolio;
