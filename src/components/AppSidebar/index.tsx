import React from 'react';
import { useNavigate } from 'react-router-dom';
import HistoryPanel from '../HistoryPanel';
import CreditCardPreviewList from '../CreditCardPreviewList';
import { 
  Conversation, 
  SubscriptionPlan,
  ShowCompletedOnlyPreference 
} from '../../types';
import { CreditCard } from '../../types/CreditCardTypes';
import './AppSidebar.scss';

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chatHistory: Conversation[];
  currentChatId: string | null;
  onCurrentChatIdChange: (chatId: string | null) => void;
  onHistoryUpdate: (updatedChat: Conversation | ((prevHistory: Conversation[]) => Conversation[])) => Promise<void>;
  subscriptionPlan: SubscriptionPlan;
  creditCards: CreditCard[];
  historyRefreshTrigger: number;
  showCompletedOnlyPreference: ShowCompletedOnlyPreference;
  isLoadingCreditCards: boolean;
  onCardSelect: (card: CreditCard) => void;
  quickHistorySize: number;
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen,
  onToggle,
  chatHistory,
  currentChatId,
  onCurrentChatIdChange,
  onHistoryUpdate,
  subscriptionPlan,
  creditCards,
  historyRefreshTrigger,
  showCompletedOnlyPreference,
  isLoadingCreditCards,
  onCardSelect,
  quickHistorySize
}) => {
  const navigate = useNavigate();

  const handleEditCards = () => {
    navigate('/my-cards');
  };

  return (
    <div className={`app-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-toggle">
        <button 
          className="button outline small toggle-button"
          onClick={onToggle}
          aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isOpen ? '←' : '→'}
        </button>
      </div>
      
      <div className="panel-section">
        <div className="panel-header">
          <h3>Recent Transactions</h3>
          <button 
            className="button outline small"
            onClick={() => navigate('/history')}
          >
            View History
          </button>
        </div>
        <HistoryPanel 
          existingHistoryList={chatHistory} 
          fullListSize={false} 
          listSize={quickHistorySize}
          currentChatId={currentChatId}
          returnCurrentChatId={onCurrentChatIdChange}
          onHistoryUpdate={onHistoryUpdate}
          subscriptionPlan={subscriptionPlan}
          creditCards={creditCards}
          historyRefreshTrigger={historyRefreshTrigger}
          showCompletedOnlyPreference={showCompletedOnlyPreference}
        />
      </div>
      
      <div className="panel-section">
        <div className="panel-header">
          <h3>My Cards</h3>
          <button 
            className="button outline small"
            onClick={handleEditCards}
          >
            Edit Cards
          </button>
        </div>
        <CreditCardPreviewList 
          cards={creditCards}
          loading={isLoadingCreditCards}
          showOnlySelected={true}
          onCardSelect={onCardSelect}
        />
      </div>
    </div>
  );
};

export default AppSidebar;
