import { Link } from 'react-router-dom';
import { APP_NAME, PAGE_ICONS, PAGES } from '../../types';
import { Icon } from '../../icons';

const features = [
  { icon: 'star', title: 'Smart Recommendations', description: 'AI-powered suggestions for the right card to use on every purchase.' },
  { icon: 'calendar-days', title: 'Credit Tracking', description: 'Stay on top of statement credits, annual perks, and renewal deadlines.' },
  { icon: 'wallet', title: 'Card Portfolio', description: 'Manage all your cards in one place with detailed benefits at a glance.' },
  { icon: 'presentation-chart-bar', title: 'Personalized Insights', description: 'Get tailored advice based on your spending habits and card lineup.' },
];

const btnBase: React.CSSProperties = {
  fontFamily: '"Inter", sans-serif',
  fontWeight: 600,
  fontSize: '0.9375rem',
  padding: '12px 32px',
  borderRadius: 10,
  textDecoration: 'none',
  display: 'inline-block',
  lineHeight: 1,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

export default function LandingPage() {
  return (
    <div className="landing-page">
      <style>{`
        .landing-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 24px;
          min-height: 100dvh;
          overflow-y: auto;
        }
        .landing-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 48px 0;
        }
        .landing-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          max-width: 672px;
          width: 100%;
          text-align: left;
        }
        @media (max-width: 640px) {
          .landing-page {
            padding: 48px 20px 48px;
          }
          .landing-features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="landing-main">
      {/* Brand */}
      <div className="flex items-center gap-3" style={{ marginBottom: 32 }}>
        <img src={PAGE_ICONS.LOGO} alt={`${APP_NAME} logo`} className="w-10 h-10" />
        <span
          className="text-2xl tracking-tight"
          style={{ fontFamily: '"Cal Sans", sans-serif', color: '#0B0D0F', fontWeight: 600 }}
        >
          {APP_NAME}
        </span>
        <span
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
            color: '#22CC9D',
            backgroundColor: 'rgba(34,204,157,0.1)',
            border: '1px solid rgba(34,204,157,0.25)',
            borderRadius: 6,
            padding: '3px 8px',
            lineHeight: 1,
          }}
        >
          Beta
        </span>
      </div>

      {/* Hero */}
      <h1
        className="text-4xl sm:text-5xl"
        style={{ fontFamily: '"Cal Sans", sans-serif', color: '#0B0D0F', fontWeight: 700, lineHeight: 1.15, marginBottom: 12 }}
      >
        Your credit cards, optimized.
      </h1>
      <p
        className="text-lg sm:text-xl max-w-md"
        style={{ fontFamily: '"Inter", sans-serif', color: '#5A5F66', marginBottom: 28 }}
      >
        AI-powered recommendations so you always use the best card for every purchase.
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-4" style={{ marginBottom: 48 }}>
        <Link
          to={PAGES.SIGN_IN.PATH}
          style={{
            ...btnBase,
            color: '#0B0D0F',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.12)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          Sign In
        </Link>
        <Link
          to={PAGES.SIGN_UP.PATH}
          style={{
            ...btnBase,
            color: '#ffffff',
            backgroundColor: '#22CC9D',
            border: '1px solid #1db88d',
            boxShadow: '0 2px 8px rgba(34,204,157,0.3)',
          }}
        >
          Get Started
        </Link>
        <span
          style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.8125rem', color: '#8A8F96', marginLeft: 4 }}
        >
          Free while in beta
        </span>
      </div>

      {/* Features */}
      <div className="landing-features">
        {features.map((f) => (
          <div
            key={f.title}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)',
              padding: '20px 24px',
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: 'rgba(34,204,157,0.1)',
                marginBottom: 12,
              }}
            >
              <Icon name={f.icon} variant="solid" size={18} color="#22CC9D" />
            </div>
            <h3
              className="font-semibold mb-1"
              style={{ fontFamily: '"Inter", sans-serif', color: '#0B0D0F', fontSize: '0.9375rem' }}
            >
              {f.title}
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ fontFamily: '"Inter", sans-serif', color: '#5A5F66' }}
            >
              {f.description}
            </p>
          </div>
        ))}
      </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          paddingTop: 24,
          paddingBottom: 32,
          fontFamily: '"Inter", sans-serif',
          fontSize: '0.8125rem',
          color: '#8A8F96',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>
          Questions or feedback? <a href="mailto:getrecarded@gmail.com" style={{ color: '#5A5F66', textDecoration: 'underline' }}>getrecarded@gmail.com</a>
        </span>
        <span>&copy; {new Date().getFullYear()} {APP_NAME}</span>
      </footer>
    </div>
  );
}
