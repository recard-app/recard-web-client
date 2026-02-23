import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PAGES, PAGE_NAMES, PAGE_ICONS } from '../../types';
import { useAuth } from '../../context/AuthContext';
import ContentContainer from '../../components/ContentContainer';
import PageHeader from '../../components/PageHeader';
import './LegalPageLayout.scss';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
  pageNameKey?: 'TERMS_OF_SERVICE' | 'PRIVACY_POLICY';
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, lastUpdated, children, pageNameKey }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(PAGES.HOME.PATH);
    }
  };

  const content = (
    <ContentContainer size="md">
      <nav className="legal-page__nav">
        <button type="button" className="legal-page__back-link" onClick={handleBack}>
          &larr; Back
        </button>
      </nav>
      {!user && <h1 className="legal-page__title">{title}</h1>}
      <p className="legal-page__updated">Last updated: {lastUpdated}</p>
      <div className="help-content">
        {children}
      </div>
    </ContentContainer>
  );

  if (user && pageNameKey) {
    return (
      <div className="full-page-layout">
        <PageHeader
          title={PAGE_NAMES[pageNameKey]}
          icon={PAGE_ICONS[pageNameKey].MINI}
        />
        <div className="full-page-content">
          <div className="legal-page">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="legal-page">
      {content}
    </div>
  );
};

export default LegalPageLayout;
