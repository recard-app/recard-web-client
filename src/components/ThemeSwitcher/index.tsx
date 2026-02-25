import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { THEME_REGISTRY } from '../../styling/themes';

const ThemeSwitcher: React.FC = () => {
  const { themeId, setThemeId } = useTheme();

  return (
    <div className="ds-theme-switcher">
      <span className="caps-label">Theme</span>
      <select
        className="default-select"
        value={themeId}
        onChange={(e) => setThemeId(e.target.value)}
      >
        {Object.values(THEME_REGISTRY).map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;
