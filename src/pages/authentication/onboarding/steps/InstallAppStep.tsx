import React, { useEffect } from 'react';
import { usePWAInstall } from '../../../../hooks/usePWAInstall';
import { APP_NAME } from '../../../../types/Constants';

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

const InstallAppStep: React.FC = () => {
  const { platform, promptInstall, markProactiveShown } = usePWAInstall();

  // Mark proactive shown on mount to prevent future auto-popup
  useEffect(() => {
    markProactiveShown();
  }, [markProactiveShown]);

  return (
    <div className="onboarding-step">
      <div>
        <h2 className="onboarding-step__title">Install the App</h2>
        <p className="onboarding-step__subtitle">
          Install {APP_NAME} on your device for the best experience. Get instant access from your home screen, faster load times, and a full-screen interface without browser tabs getting in the way.
        </p>
      </div>

      {platform === 'ios' ? (
        <ol className="install-app-drawer__steps">
          <li>
            <span>Tap the <strong>Share</strong> button <ShareIcon /> in your browser toolbar</span>
          </li>
          <li>
            <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
          </li>
          <li>
            <span>Tap <strong>"Add"</strong> to confirm</span>
          </li>
        </ol>
      ) : platform === 'android' ? (
        <div>
          <p className="onboarding-step__description">
            Tap Install below to add {APP_NAME} directly to your home screen.
          </p>
        </div>
      ) : (
        <p className="onboarding-step__description">
          {APP_NAME} works best as an installed app on mobile. Visit this page on your phone to install it to your home screen.
        </p>
      )}

      {platform === 'android' && (
        <button className="button" onClick={promptInstall}>
          Install
        </button>
      )}
    </div>
  );
};

export default InstallAppStep;
