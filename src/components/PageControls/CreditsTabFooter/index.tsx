import { useNavigate, useLocation } from 'react-router-dom';
import { PAGES } from '../../../types';
import './CreditsTabFooter.scss';

export default function CreditsTabFooter() {
  const navigate = useNavigate();
  const location = useLocation();

  const isSummary = location.pathname === PAGES.MY_CREDITS.PATH;
  const isByCard = location.pathname === PAGES.MY_CREDITS_HISTORY.PATH;

  return (
    <div className="credits-tab-footer">
      <div className="credits-tabs">
        <button
          type="button"
          className={`tab-button ${isSummary ? 'active' : ''}`}
          onClick={() => navigate(PAGES.MY_CREDITS.PATH)}
        >
          Summary
        </button>
        <button
          type="button"
          className={`tab-button ${isByCard ? 'active' : ''}`}
          onClick={() => navigate(PAGES.MY_CREDITS_HISTORY.PATH)}
        >
          By Card
        </button>
      </div>
    </div>
  );
}
