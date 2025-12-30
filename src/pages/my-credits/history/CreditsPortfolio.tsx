import React, { useState } from 'react';
import PageHeader from '../../../components/PageHeader';
import { PAGE_ICONS, PAGE_NAMES, PAGES } from '../../../types';
import { CreditCardDetails } from '../../../types/CreditCardTypes';
import { CreditPortfolioView } from '../../../components/CreditPortfolio';
import { useFullHeight } from '../../../hooks/useFullHeight';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '../../../components/ui/dialog/dialog';
import CreditsPortfolioHelpModal from './CreditsPortfolioHelpModal';
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
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="standard-page-layout">
      <PageHeader
        title={PAGE_NAMES.MY_CREDITS}
        icon={PAGE_ICONS.MY_CREDITS.MINI}
        subtitle="Full History"
        showHelpButton={true}
        onHelpClick={() => setIsHelpOpen(true)}
        titleLink={PAGES.MY_CREDITS.PATH}
      />

      <div className="standard-page-content--no-padding">
        <CreditPortfolioView
          userCardDetails={userCardDetails}
          reloadTrigger={reloadTrigger}
          onRefreshMonthlyStats={onRefreshMonthlyStats}
          onAddUpdatingCreditId={onAddUpdatingCreditId}
          onRemoveUpdatingCreditId={onRemoveUpdatingCreditId}
          isCreditUpdating={isCreditUpdating}
          onClearAllUpdatingCredits={onClearAllUpdatingCredits}
        />
      </div>

      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credit History Help</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <CreditsPortfolioHelpModal />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreditsPortfolio;
