import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PAGES } from '../../types';
import ContentContainer from '../../components/ContentContainer';
import './LegalPageLayout.scss';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, lastUpdated, children }) => {
  const navigate = useNavigate();

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

  return (
    <div className="legal-page">
      <ContentContainer size="md">
        <nav className="legal-page__nav">
          <button type="button" className="legal-page__back-link" onClick={handleBack}>
            &larr; Back
          </button>
        </nav>
        <h1 className="legal-page__title">{title}</h1>
        <p className="legal-page__updated">Last updated: {lastUpdated}</p>
        <div className="help-content">
          {children}
        </div>
      </ContentContainer>
    </div>
  );
};

export default LegalPageLayout;
