import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/dialog/alert-dialog';
import { ChatHistory, SubscriptionPlan, PAGE_NAMES, PAGE_ICONS } from '../../types';
import { SHOW_SUBSCRIPTION_MENTIONS } from '../../types';
import { 
  DeleteStatusType, 
  handleVerificationEmail as handleVerificationEmailUtil,
  handleDeleteAllChats as handleDeleteAllChatsUtil,
} from './utils';
import PageHeader from '../../components/PageHeader';
import { useScrollHeight } from '../../hooks/useScrollHeight';
import { InfoDisplay } from '../../elements';
import './Account.scss';

/**
 * Props for the Account component
 * @interface AccountProps
 * @property {React.Dispatch<React.SetStateAction<ChatHistory>>} setChatHistory - Function to update the chat history state
 * @property {React.Dispatch<React.SetStateAction<number>>} setHistoryRefreshTrigger - Function to trigger a refresh of the chat history
 * @property {SubscriptionPlan} subscriptionPlan - The user's current subscription plan ('free' or 'premium')
 */
interface AccountProps {
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistory>>;
  setHistoryRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
  subscriptionPlan: SubscriptionPlan;
}

const Account: React.FC<AccountProps> = ({ setChatHistory, setHistoryRefreshTrigger, subscriptionPlan }) => {
  const { user, sendVerificationEmail } = useAuth();
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [deleteStatus, setDeleteStatus] = useState<DeleteStatusType>({ type: 'confirm', message: '' });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Use the scroll height hook for this page
  useScrollHeight(true);

  const handleVerificationEmailClick = async (): Promise<void> => {
    const result = await handleVerificationEmailUtil(sendVerificationEmail);
    setMessageType(result.messageType);
    setMessage(result.message);
  };

  const handleDeleteAllChatsClick = async (): Promise<void> => {
    const result = await handleDeleteAllChatsUtil(setChatHistory, setHistoryRefreshTrigger);
    setDeleteStatus(result);
    setIsDeleteDialogOpen(false);
  };

  const renderAlertDialogContent = () => {
    return (
      <>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete All Chat History</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete all chat history? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="button-group">
            <AlertDialogAction destructive onClick={handleDeleteAllChatsClick}>
              Delete All
            </AlertDialogAction>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </div>
        </AlertDialogFooter>
      </>
    );
  };

  return (
    <div className="full-page-layout">
      <PageHeader title={PAGE_NAMES.MY_ACCOUNT} icon={PAGE_ICONS.MY_ACCOUNT.MINI} />
      <div className="full-page-content">
        {user ? (
          <div className="user-info">
            {user.photoURL && (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="profile-image"
              />
            )}
            <p><strong>Name:</strong> {user.displayName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p className="email-status">
              <strong>Email Status:</strong>{' '}
              {user.emailVerified ? (
                <span className="verified">Verified ✓</span>
              ) : (
                <span className="unverified">Not Verified</span>
              )}
            </p>
            {SHOW_SUBSCRIPTION_MENTIONS && (
              <p>
                <strong>Subscription Plan:</strong>{' '}
                <span className="subscription-plan">
                  {subscriptionPlan}
                </span>
              </p>
            )}
            {!user.emailVerified && (
              <>
                <button 
                  className="verify-button"
                  onClick={handleVerificationEmailClick}
                >
                  Send Verification Email
                </button>
                {message && (
                  <InfoDisplay
                    type={messageType || 'info'}
                    message={message}
                  />
                )}
              </>
            )}

            <div className="danger-zone">
              <h2 className="danger-zone__title">Danger Zone</h2>
              <p>Once you delete your chat history, there is no going back. Please be certain.</p>
              <button 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="button destructive"
              >
                Delete All Chat History
              </button>
              
              {/* Show success/error messages below the delete button */}
              {deleteStatus.type === 'success' && (
                <InfoDisplay
                  type="success"
                  message={deleteStatus.message}
                />
              )}
              {deleteStatus.type === 'error' && (
                <InfoDisplay
                  type="error"
                  message={deleteStatus.message}
                />
              )}
            </div>
          </div>
        ) : (
          <p>Please sign in to view your account details.</p>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          {renderAlertDialogContent()}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Account;
