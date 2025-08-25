import React from 'react';
import PageHeader from '../../components/PageHeader';
import { PAGE_ICONS, PAGE_NAMES, PAGES } from '../../types';
import { Link } from 'react-router-dom';
import './MyCredits.scss';

const MyCredits: React.FC = () => {
  return (
    <div className="standard-page-layout">
      <PageHeader 
        title={PAGE_NAMES.MY_CREDITS}
        icon={PAGE_ICONS.MY_CREDITS.MINI}
      />
      <div className="standard-page-content--padded" style={{ paddingTop: 12 }}>
        <Link to={`${PAGES.MY_CREDITS.PATH}/history`} className="button icon with-text">See Credits History</Link>
      </div>
    </div>
  );
};

export default MyCredits;


