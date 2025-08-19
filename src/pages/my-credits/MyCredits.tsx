import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { PAGE_ICONS, PAGE_NAMES } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '../../components/ui/dialog/dialog';
import MyCreditsHelpModal from './MyCreditsHelpModal';
import { UserCreditService } from '../../services/UserServices';

const MyCredits: React.FC = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Check for existing credit history; if missing, create it
        await UserCreditService.fetchCreditHistory();
      } catch (error) {
        // If not found, try to generate it
        try {
          await UserCreditService.generateCreditHistory();
        } catch (e) {
          // Ignore errors here; page can handle empty state
          console.error('Failed to ensure credit history exists:', e);
        }
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="my-credits-wrapper">
      <PageHeader 
        title={PAGE_NAMES.MY_CREDITS}
        icon={PAGE_ICONS.MY_CREDITS.MINI}
        showHelpButton={true}
        onHelpClick={() => setIsHelpOpen(true)}
      />
      <div className="page-content">
        {isInitializing ? (
          <p>Loading your credits...</p>
        ) : (
          <p>Coming Soon...</p>
        )}
      </div>

      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>My Credits Help</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <MyCreditsHelpModal />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyCredits;


