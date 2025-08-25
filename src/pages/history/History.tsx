import React, { useState } from 'react';
import FullHistoryPanel from '../../components/HistoryPanel/FullHistoryPanel';
import { Conversation, CreditCard, FREE_PLAN_HISTORY_DAYS, PAGE_NAMES, PAGE_ICONS, ShowCompletedOnlyPreference, SubscriptionPlan } from '../../types';
import PageHeader from '../../components/PageHeader';
import { useFullHeight } from '../../hooks/useFullHeight';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '../../components/ui/dialog/dialog';
import HistoryHelpModal from './HistoryHelpModal';
import './History.scss';

interface HistoryProps {
  existingHistoryList: Conversation[];
  currentChatId: string | null;
  returnCurrentChatId: (chatId: string | null) => void;
  onHistoryUpdate: (updater: (prevHistory: Conversation[]) => Conversation[]) => void;
  subscriptionPlan: SubscriptionPlan;
  creditCards: CreditCard[];
  historyRefreshTrigger: number;
  showCompletedOnlyPreference: ShowCompletedOnlyPreference;
  // Mobile filters drawer control (optional)
  filtersDrawerOpen?: boolean;
  onFiltersDrawerOpenChange?: (open: boolean) => void;
}

function History({ 
  existingHistoryList, 
  currentChatId, 
  returnCurrentChatId,
  onHistoryUpdate,
  subscriptionPlan,
  creditCards,
  historyRefreshTrigger,
  showCompletedOnlyPreference,
  filtersDrawerOpen,
  onFiltersDrawerOpenChange
}: HistoryProps): React.ReactElement {
  // Use the full height hook for this page
  useFullHeight(true);

  // Help modal state
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const getHistorySubtitle = (): string | undefined => {
    if (subscriptionPlan === 'free') {
      return `Last ${FREE_PLAN_HISTORY_DAYS} Days`;
    }
    return undefined;
  };

  return (
    <div className="standard-page-layout">
      <PageHeader 
        title={PAGE_NAMES.TRANSACTION_HISTORY} 
        icon={PAGE_ICONS.TRANSACTION_HISTORY.MINI}
        subtitle={getHistorySubtitle()}
        showHelpButton={true}
        onHelpClick={() => setIsHelpOpen(true)}
      />
      <div className="standard-page-content--no-padding">
        <FullHistoryPanel 
          currentChatId={currentChatId}
          returnCurrentChatId={returnCurrentChatId}
          onHistoryUpdate={onHistoryUpdate}
          subscriptionPlan={subscriptionPlan}
          creditCards={creditCards}
          historyRefreshTrigger={historyRefreshTrigger}
          showCompletedOnlyPreference={showCompletedOnlyPreference}
          filtersDrawerOpen={filtersDrawerOpen}
          onFiltersDrawerOpenChange={onFiltersDrawerOpenChange}
        />
      </div>

      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction History Help</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <HistoryHelpModal />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default History;