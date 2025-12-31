import React, { useState } from 'react';
import { toast } from 'sonner';
import { useFullHeight } from '../../hooks/useFullHeight';
import PageHeader from '../../components/PageHeader';
import ContentContainer from '../../components/ContentContainer';
import { PAGE_ICONS } from '../../types';
import { handleDeleteAllChats as handleDeleteAllChatsUtil } from '../account/utils';
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
import { ChatHistory } from '../../types';
import './DeleteHistory.scss';

interface DeleteHistoryProps {
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistory>>;
  setHistoryRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
}

const DeleteHistory: React.FC<DeleteHistoryProps> = ({ setChatHistory, setHistoryRefreshTrigger }) => {
  useFullHeight(true);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteAllChatsClick = async (): Promise<void> => {
    const result = await handleDeleteAllChatsUtil(setChatHistory, setHistoryRefreshTrigger);
    setIsDeleteDialogOpen(false);
    if (result.type === 'success') {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const renderAlertDialogContent = () => (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete All Chat History</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete all chat history? This action cannot be undone.
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

  return (
    <div className="full-page-layout">
      <PageHeader title="Delete History" icon={PAGE_ICONS.DELETE_HISTORY.MINI} />
      <div className="full-page-content">
        <ContentContainer size="sm">
          <section className="danger-zone">
            <h2 className="danger-zone__title">Danger Zone</h2>
            <p>Once you delete your chat history, there is no going back. Please be certain.</p>
            <button onClick={() => setIsDeleteDialogOpen(true)} className="button destructive">
              Delete All Chat History
            </button>
          </section>
        </ContentContainer>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>{renderAlertDialogContent()}</AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeleteHistory;


