import { useNavigate, useLocation } from 'react-router-dom';
import { TabBar } from '@/elements';
import { PAGES } from '../../../types';
import FooterControls from '../FooterControls';
import './CreditsTabFooter.scss';

const CREDITS_TABS = [
  { id: 'summary', label: 'Summary' },
  { id: 'by-card', label: 'By Card' }
];

export default function CreditsTabFooter() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname === PAGES.MY_CREDITS_HISTORY.PATH ? 'by-card' : 'summary';

  const handleTabChange = (tabId: string) => {
    if (tabId === 'summary') {
      navigate(PAGES.MY_CREDITS.PATH);
    } else {
      navigate(PAGES.MY_CREDITS_HISTORY.PATH);
    }
  };

  return (
    <FooterControls className="credits-tab-footer">
      <TabBar
        options={CREDITS_TABS}
        activeId={activeTab}
        onChange={handleTabChange}
      />
    </FooterControls>
  );
}
