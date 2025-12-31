import React from 'react';
import FullHistoryPanel from '../../components/HistoryPanel/FullHistoryPanel';
import { Conversation, CreditCard, FREE_PLAN_HISTORY_DAYS, PAGE_NAMES, PAGE_ICONS, SubscriptionPlan } from '../../types';
import PageHeader from '../../components/PageHeader';
import { useFullHeight } from '../../hooks/useFullHeight';
import './History.scss';

interface HistoryProps {
  existingHistoryList: Conversation[];
  currentChatId: string | null;
  returnCurrentChatId: (chatId: string | null) => void;
  onHistoryUpdate: (updater: (prevHistory: Conversation[]) => Conversation[]) => void;
  subscriptionPlan: SubscriptionPlan;
  creditCards: CreditCard[];
  historyRefreshTrigger: number;
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
  filtersDrawerOpen,
  onFiltersDrawerOpenChange
}: HistoryProps): React.ReactElement {
  // Use the full height hook for this page
  useFullHeight(true);

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
      />
      <div className="standard-page-content--no-padding">
        <FullHistoryPanel
          currentChatId={currentChatId}
          returnCurrentChatId={returnCurrentChatId}
          onHistoryUpdate={onHistoryUpdate}
          subscriptionPlan={subscriptionPlan}
          creditCards={creditCards}
          historyRefreshTrigger={historyRefreshTrigger}
          filtersDrawerOpen={filtersDrawerOpen}
          onFiltersDrawerOpenChange={onFiltersDrawerOpenChange}
        />
      </div>
    </div>
  );
}

export default History;