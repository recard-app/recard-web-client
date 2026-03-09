export type TabType = 'overview' | 'multipliers' | 'credits' | 'perks';

export const CARD_TABS = [
    { id: 'overview', label: 'Overview', icon: 'home' as const, hideLabel: true },
    { id: 'multipliers', label: 'Multipliers', icon: 'chart-bar' as const },
    { id: 'credits', label: 'Credits', icon: 'banknotes' as const },
    { id: 'perks', label: 'Perks', icon: 'gift' as const },
];
