import React from 'react';
import FullHistoryPanel from '../../components/HistoryPanel/FullHistoryPanel';
import { Conversation, CreditCard, FREE_PLAN_HISTORY_DAYS, PAGE_NAMES, ShowCompletedOnlyPreference, SubscriptionPlan } from '../../types';
import PageHeader from '../../components/PageHeader';
import { useFullHeight } from '../../hooks/useFullHeight';
import { Modal, useModal } from '../../components/Modal';
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
}

function History({ 
  existingHistoryList, 
  currentChatId, 
  returnCurrentChatId,
  onHistoryUpdate,
  subscriptionPlan,
  creditCards,
  historyRefreshTrigger,
  showCompletedOnlyPreference
}: HistoryProps): React.ReactElement {
  // Use the full height hook for this page
  useFullHeight(true);

  // Help modal
  const helpModal = useModal();

  const getHistorySubtitle = (): string | undefined => {
    if (subscriptionPlan === 'free') {
      return `Last ${FREE_PLAN_HISTORY_DAYS} Days`;
    }
    return undefined;
  };

  return (
    <div className="history-page-wrapper">
      <PageHeader 
        title={PAGE_NAMES.TRANSACTION_HISTORY} 
        subtitle={getHistorySubtitle()}
        showHelpButton={true}
        onHelpClick={helpModal.open}
      />
      <div className="history-page-content">
        <FullHistoryPanel 
          currentChatId={currentChatId}
          returnCurrentChatId={returnCurrentChatId}
          onHistoryUpdate={onHistoryUpdate}
          subscriptionPlan={subscriptionPlan}
          creditCards={creditCards}
          historyRefreshTrigger={historyRefreshTrigger}
          showCompletedOnlyPreference={showCompletedOnlyPreference}
        />
      </div>

      <Modal isOpen={helpModal.isOpen} onClose={helpModal.close}>
        <HistoryHelpModal />
      </Modal>
    </div>
  );
}

export default History;