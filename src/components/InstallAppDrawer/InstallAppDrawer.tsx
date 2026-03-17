import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '../ui/drawer';
import './InstallAppDrawer.scss';

interface InstallAppDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: 'ios' | 'android' | null;
  onInstall: () => Promise<void>;
  onDismiss: () => void;
}

const ShareIcon: React.FC = () => (
  <svg
    className="install-app-drawer__share-icon"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const IOSContent: React.FC = () => (
  <ol className="install-app-drawer__steps">
    <li>
      <span>Tap the <strong>Share</strong> button <ShareIcon /> in your browser toolbar</span>
    </li>
    <li>
      <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
    </li>
    <li>
      <span>Make sure the <strong>"Open as Web App"</strong> toggle is enabled</span>
    </li>
    <li>
      <span>Tap <strong>"Add"</strong> to confirm</span>
    </li>
  </ol>
);

const AndroidContent: React.FC = () => (
  <p className="install-app-drawer__message">
    Tap Install below to add cardzen to your home screen for quick access.
  </p>
);

const InstallAppDrawer: React.FC<InstallAppDrawerProps> = ({
  open,
  onOpenChange,
  platform,
  onInstall,
  onDismiss,
}) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent fitContent className="install-app-drawer">
        <DrawerHeader>
          <DrawerTitle>Install cardzen</DrawerTitle>
          <DrawerDescription>Add to your home screen for the best experience</DrawerDescription>
        </DrawerHeader>
        <div className="install-app-drawer__body">
          {platform === 'android' ? <AndroidContent /> : <IOSContent />}
        </div>
        <DrawerFooter>
          <div className="button-group">
            <DrawerClose asChild>
              <button className="button outline" onClick={onDismiss}>Not Now</button>
            </DrawerClose>
            {platform === 'android' && (
              <button className="button" onClick={onInstall}>Install</button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export { InstallAppDrawer };
export default InstallAppDrawer;
