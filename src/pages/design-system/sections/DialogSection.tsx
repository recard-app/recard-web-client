import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

const DialogSection: React.FC = () => {
  const [dialogs, setDialogs] = useState({
    default: false,
    fullWidth: false,
    fullScreen: false,
    noClose: false,
    customWidth: false,
  });

  const [drawers, setDrawers] = useState({
    bottom: false,
    right: false,
    fitContent: false,
  });

  const openDialog = (key: keyof typeof dialogs) => {
    setDialogs({ ...dialogs, [key]: true });
  };

  const closeDialog = (key: keyof typeof dialogs) => {
    setDialogs({ ...dialogs, [key]: false });
  };

  const openDrawer = (key: keyof typeof drawers) => {
    setDrawers({ ...drawers, [key]: true });
  };

  const closeDrawer = (key: keyof typeof drawers) => {
    setDrawers({ ...drawers, [key]: false });
  };

  return (
    <>
      <h2 className="ds-section-title">Dialogs & Drawers</h2>
      <p className="ds-section-description">
        Modal overlays for focused content, forms, and confirmations
      </p>

      {/* Dialog Variants */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Dialog Variants</h3>
        <div className="ds-trigger-section">
          <div className="ds-component-item">
            <span className="ds-component-name">Default</span>
            <button className="button" onClick={() => openDialog('default')}>Open Dialog</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">fullWidth=true</span>
            <button className="button outline" onClick={() => openDialog('fullWidth')}>Full Width</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">fullScreen=true</span>
            <button className="button outline" onClick={() => openDialog('fullScreen')}>Full Screen</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">showCloseButton=false</span>
            <button className="button outline" onClick={() => openDialog('noClose')}>No Close Button</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">width="600px"</span>
            <button className="button outline" onClick={() => openDialog('customWidth')}>Custom Width</button>
          </div>
        </div>
      </div>

      {/* Drawer Variants */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Drawer Variants</h3>
        <div className="ds-trigger-section">
          <div className="ds-component-item">
            <span className="ds-component-name">direction="bottom"</span>
            <button className="button" onClick={() => openDrawer('bottom')}>Bottom Drawer</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">direction="right"</span>
            <button className="button outline" onClick={() => openDrawer('right')}>Right Drawer</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">fitContent=true</span>
            <button className="button outline" onClick={() => openDrawer('fitContent')}>Fit Content</button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={dialogs.default} onOpenChange={(open) => !open && closeDialog('default')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Default Dialog</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p>This is the default dialog configuration with a close button in the header.</p>
            <p style={{ marginTop: '12px' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
            </p>
          </DialogBody>
          <DialogFooter>
            <button className="button outline" onClick={() => closeDialog('default')}>Cancel</button>
            <button className="button" onClick={() => closeDialog('default')}>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogs.fullWidth} onOpenChange={(open) => !open && closeDialog('fullWidth')}>
        <DialogContent fullWidth>
          <DialogHeader>
            <DialogTitle>Full Width Dialog</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p>This dialog takes up 90% of the viewport width.</p>
          </DialogBody>
          <DialogFooter>
            <button className="button" onClick={() => closeDialog('fullWidth')}>Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogs.fullScreen} onOpenChange={(open) => !open && closeDialog('fullScreen')}>
        <DialogContent fullScreen>
          <DialogHeader>
            <DialogTitle>Full Screen Dialog</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p>This dialog covers the entire viewport.</p>
          </DialogBody>
          <DialogFooter>
            <button className="button" onClick={() => closeDialog('fullScreen')}>Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogs.noClose} onOpenChange={(open) => !open && closeDialog('noClose')}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>No Close Button</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p>This dialog has no X button in the header. User must use the action buttons.</p>
          </DialogBody>
          <DialogFooter>
            <button className="button" onClick={() => closeDialog('noClose')}>Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogs.customWidth} onOpenChange={(open) => !open && closeDialog('customWidth')}>
        <DialogContent width="600px">
          <DialogHeader>
            <DialogTitle>Custom Width (600px)</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p>This dialog has a specific width of 600px.</p>
          </DialogBody>
          <DialogFooter>
            <button className="button" onClick={() => closeDialog('customWidth')}>Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drawers */}
      <Drawer open={drawers.bottom} onOpenChange={(open) => !open && closeDrawer('bottom')}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Bottom Drawer</DrawerTitle>
          </DrawerHeader>
          <div style={{ padding: '16px' }}>
            <p>This drawer slides up from the bottom of the screen.</p>
            <p style={{ marginTop: '12px' }}>Perfect for mobile-friendly actions and content.</p>
            <button className="button" onClick={() => closeDrawer('bottom')} style={{ marginTop: '16px' }}>
              Close
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={drawers.right} onOpenChange={(open) => !open && closeDrawer('right')} direction="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Right Drawer</DrawerTitle>
          </DrawerHeader>
          <div style={{ padding: '16px' }}>
            <p>This drawer slides in from the right side.</p>
            <p style={{ marginTop: '12px' }}>Great for side panels and detail views.</p>
            <button className="button" onClick={() => closeDrawer('right')} style={{ marginTop: '16px' }}>
              Close
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={drawers.fitContent} onOpenChange={(open) => !open && closeDrawer('fitContent')}>
        <DrawerContent fitContent maxHeight="50vh">
          <DrawerHeader>
            <DrawerTitle>Fit Content Drawer</DrawerTitle>
          </DrawerHeader>
          <div style={{ padding: '16px' }}>
            <p>This drawer adjusts its height to fit the content.</p>
            <button className="button" onClick={() => closeDrawer('fitContent')} style={{ marginTop: '16px' }}>
              Close
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default DialogSection;
