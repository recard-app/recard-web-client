import React, { useState } from 'react';
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

const MyCredits: React.FC = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="my-credits-wrapper">
      <PageHeader 
        title={PAGE_NAMES.MY_CREDITS}
        icon={PAGE_ICONS.MY_CREDITS.MINI}
        showHelpButton={true}
        onHelpClick={() => setIsHelpOpen(true)}
      />
      <div className="page-content">
        <p>Coming Soon...</p>
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


