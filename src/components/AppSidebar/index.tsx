import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import HistoryPanel from '../HistoryPanel';
import CreditCardPreviewList from '../CreditCardPreviewList';
import { SidebarItem } from './SidebarItem';
import { Dropdown, DropdownItem } from '../../elements';
import { 
  Conversation, 
  SubscriptionPlan,
  ShowCompletedOnlyPreference,
  DROPDOWN_ICON
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
  user: FirebaseUser | null;
  onLogout: () => void;
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
  quickHistorySize,
  user,
  onLogout
}) => {
  const navigate = useNavigate();

  return (
    <div className={`app-sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Sticky Top Section */}
      <div className="sidebar-top">
        <div className="sidebar-toggle">
          <button 
            className="button outline small toggle-button"
            onClick={onToggle}
            aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isOpen ? '←' : '→'}
          </button>
        </div>
      </div>

      {/* Scrollable Middle Section */}
      <div className="sidebar-middle">
        {/* Recent Transactions as SidebarItem */}
        <SidebarItem 
          icon={DROPDOWN_ICON}
          name="Recent Transactions" 
          page="/history"
          isDropdown={true}
        >
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
        </SidebarItem>

        {/* My Cards as SidebarItem */}
        <SidebarItem 
          icon={DROPDOWN_ICON}
          name="My Cards" 
          page="/my-cards"
          isDropdown={true}
        >
          <CreditCardPreviewList 
            cards={creditCards}
            loading={isLoadingCreditCards}
            showOnlySelected={true}
            onCardSelect={onCardSelect}
          />
        </SidebarItem>

        <div className="panel-section">
          <div className="panel-header">
            <h3>Examples</h3>
          </div>
          
          {/* Simple sidebar items */}
          <SidebarItem 
            icon={DROPDOWN_ICON}
            name="Example 1" 
            page="/example1" 
          />
          
          <SidebarItem 
            icon={DROPDOWN_ICON}
            name="Example 2" 
            page="/example2" 
          />
          
          {/* Dropdown sidebar item with children */}
          <SidebarItem 
            icon={DROPDOWN_ICON}
            name="Example 3" 
            isDropdown={true}
          >
            <SidebarItem name="Sub Example 3.1" page="/example3/sub1" />
            <SidebarItem name="Sub Example 3.2" page="/example3/sub2" />
            <SidebarItem name="Sub Example 3.3" page="/example3/sub3" />
          </SidebarItem>
          
          <SidebarItem 
            icon={DROPDOWN_ICON}
            name="Example 4" 
            page="/example4" 
          />
          
          {/* Another dropdown with nested items */}
          <SidebarItem 
            icon={DROPDOWN_ICON}
            name="Example 5" 
            isDropdown={true}
          >
            <SidebarItem name="Sub Example 5.1" page="/example5/sub1" />
            <SidebarItem 
              name="Sub Example 5.2" 
              isDropdown={true}
            >
              <SidebarItem name="Nested 5.2.1" page="/example5/sub2/nested1" />
              <SidebarItem name="Nested 5.2.2" page="/example5/sub2/nested2" />
            </SidebarItem>
          </SidebarItem>
          
          <SidebarItem 
            icon={DROPDOWN_ICON}
            name="Example 6" 
            page="/example6" 
          />
        </div>
      </div>

      {/* Sticky Bottom Section */}
      {user && (
        <div className="sidebar-bottom">
          <div className="user-profile-section">
            <Dropdown 
              trigger={
                <div className="profile-trigger">
                  {user.photoURL && (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="profile-image"
                    />
                  )}
                  <span className="profile-name">{user.displayName || user.email}</span>
                </div>
              }
              className="sidebar-profile-dropdown"
            >
              <Link to="/preferences">
                <DropdownItem>Preferences</DropdownItem>
              </Link>
              <Link to="/account">
                <DropdownItem icon={DROPDOWN_ICON}>My Account</DropdownItem>
              </Link>
              <DropdownItem onClick={onLogout} className="signout-action" icon={DROPDOWN_ICON}>Sign Out</DropdownItem>
            </Dropdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppSidebar;
