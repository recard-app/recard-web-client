import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useFullHeight } from '../../hooks/useFullHeight';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import ContentContainer from '../../components/ContentContainer';
import { PAGE_ICONS, PAGES } from '../../types';
import { AuthService } from '../../services';
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
import './DeleteAccount.scss';

const DELETION_REASONS = [
  { value: '', label: 'Select a reason (optional)' },
  { value: 'not_useful', label: 'Not useful for my needs' },
  { value: 'too_complicated', label: 'Too complicated to use' },
  { value: 'privacy_concerns', label: 'Privacy concerns' },
  { value: 'switching_service', label: 'Switching to another service' },
  { value: 'temporary_account', label: 'Only needed temporarily' },
  { value: 'other', label: 'Other reason' },
];

const DeleteAccount: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  useFullHeight(true);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async (): Promise<void> => {
    if (confirmText !== 'DELETE' || isDeleting) return;

    setIsDeleting(true);
    const toastId = toast.loading('Deleting your account...');

    try {
      await AuthService.deleteAccount(deletionReason || undefined);

      toast.success('Account deleted successfully', { id: toastId });

      // Brief delay so user sees success message before redirect
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Logout may fail since the Firebase Auth user is already deleted
      // This is expected - we just need to clear local state and redirect
      try {
        await logout();
      } catch {
        // Silently ignore logout errors - account is already deleted
      }

      navigate(PAGES.SIGN_IN.PATH);
    } catch (error) {
      toast.error('Failed to delete account. Please try again.', { id: toastId });
      setIsDeleting(false);
    }
  };

  const handleOpenDialog = () => {
    setConfirmText('');
    setIsDeleteDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    if (!isDeleting) {
      setIsDeleteDialogOpen(open);
      if (!open) {
        setConfirmText('');
      }
    }
  };

  const isDeleteEnabled = confirmText === 'DELETE' && !isDeleting;

  const renderAlertDialogContent = () => (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Account</AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div>
            <p>This will permanently delete your account and all associated data including:</p>
            <ul className="deletion-list">
              <li>All chat history and conversations</li>
              <li>Saved credit cards</li>
              <li>Credit tracking history</li>
              <li>Account preferences</li>
            </ul>
            <p className="warning-text">This action cannot be undone.</p>
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="delete-account-form">
        <div className="form-field">
          <label htmlFor="deletion-reason">Why are you deleting your account?</label>
          <select
            id="deletion-reason"
            value={deletionReason}
            onChange={(e) => setDeletionReason(e.target.value)}
            className="default-select"
            disabled={isDeleting}
          >
            {DELETION_REASONS.map(reason => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="confirm-delete">Type "DELETE" to confirm:</label>
          <input
            id="confirm-delete"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="default-input"
            disabled={isDeleting}
            autoComplete="off"
          />
        </div>
      </div>

      <AlertDialogFooter>
        <div className="button-group">
          <AlertDialogAction
            destructive
            onClick={handleDeleteAccount}
            disabled={!isDeleteEnabled}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </AlertDialogAction>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
        </div>
      </AlertDialogFooter>
    </>
  );

  return (
    <div className="full-page-layout">
      <PageHeader title="Delete Account" icon={PAGE_ICONS.DELETE_ACCOUNT.MINI} />
      <div className="full-page-content">
        <ContentContainer size="sm">
          <section className="danger-zone">
            <h2 className="danger-zone__title">Danger Zone</h2>
            <p>
              Once you delete your account, all of your data will be permanently removed.
              This includes your chat history, saved cards, credit tracking data, and preferences.
            </p>
            <p className="warning-text">This action cannot be undone. Please be certain.</p>
            <button onClick={handleOpenDialog} className="button destructive">
              Delete My Account
            </button>
          </section>
        </ContentContainer>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleDialogChange}>
        <AlertDialogContent>{renderAlertDialogContent()}</AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeleteAccount;
