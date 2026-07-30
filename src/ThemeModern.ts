import { alpha, type Shadows } from '@mui/material/styles';

import type { ThemeName, ThemeType } from './types';
import type { ThemeOptions } from './Theme';

/**
 * Flat design tokens of the "modern" themes.
 * Everything that is used more than once in the theme definition below is listed here,
 * so a new variation can be created by copying this object only.
 */
export interface ModernTokens {
    /** Background of the page (behind the cards) */
    background: string;
    /** Background of cards, tables and dialogs */
    paper: string;
    /** Background of the left navigation */
    sidebar: string;
    /** Background of menus, popovers and dialogs (one step above `paper`) */
    elevated: string;
    /** Color of the dividers inside of the cards (table rows, lists) */
    border: string;
    /** Border of the cards. In the dark theme the cards are separated by the background, not by a border */
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    textDisabled: string;
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    /** Background of the selected navigation item */
    gradient: string;
    /** Background of the selected navigation item if hovered */
    gradientHover: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    /** Color of the expert-mode elements */
    expert: string;
    /** Color of the not acknowledged values in the object browser */
    nonAck: string;
    /** Background of the hovered rows and list items */
    hover: string;
    /** Background of the selected rows and list items */
    selected: string;
}

export const MODERN_DARK: ModernTokens = {
    background: '#0A121D',
    paper: '#121A26',
    sidebar: '#141C29',
    elevated: '#1A2434',
    border: '#1E2837',
    cardBorder: '#1B2533',
    textPrimary: '#E8EDF5',
    textSecondary: '#8B97A8',
    textDisabled: '#586576',
    primary: '#137BF8',
    primaryDark: '#0B62D6',
    primaryLight: '#4B9BFA',
    secondary: '#436A93',
    gradient: 'linear-gradient(90deg, #2E93F9 0%, #0B76F5 100%)',
    gradientHover: 'linear-gradient(90deg, #48A1FA 0%, #1B84F8 100%)',
    success: '#2EA043',
    warning: '#E8A33D',
    error: '#E5534B',
    info: '#3FA9F5',
    expert: '#2EA043',
    nonAck: '#E5534B',
    hover: 'rgba(255, 255, 255, 0.05)',
    selected: 'rgba(19, 123, 248, 0.16)',
};

export const MODERN_LIGHT: ModernTokens = {
    background: '#F4F7FB',
    paper: '#FFFFFF',
    sidebar: '#FFFFFF',
    elevated: '#FFFFFF',
    border: '#E2E8F0',
    cardBorder: '#E2E8F0',
    textPrimary: '#101827',
    textSecondary: '#5B6878',
    textDisabled: '#98A4B3',
    primary: '#137BF8',
    primaryDark: '#0B62D6',
    primaryLight: '#4B9BFA',
    secondary: '#164477',
    gradient: 'linear-gradient(90deg, #2E93F9 0%, #0B76F5 100%)',
    gradientHover: 'linear-gradient(90deg, #48A1FA 0%, #1B84F8 100%)',
    success: '#1E8E3E',
    warning: '#C77700',
    error: '#D93025',
    info: '#0B72D9',
    expert: '#1E8E3E',
    nonAck: '#D93025',
    hover: 'rgba(16, 24, 39, 0.04)',
    selected: 'rgba(19, 123, 248, 0.10)',
};

const FONT_FAMILY = '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/**
 * Build the 25 MUI shadows. The default MUI shadows are too heavy for this design,
 * so they are replaced by a soft two-layer shadow.
 */
function buildShadows(type: ThemeType): Shadows {
    const rgb = type === 'dark' ? '0, 0, 0' : '15, 23, 42';
    const nearOpacity = type === 'dark' ? 0.24 : 0.04;
    const farOpacity = type === 'dark' ? 0.36 : 0.08;

    const shadows: string[] = ['none'];
    for (let i = 1; i <= 24; i++) {
        const y = Math.round(1 + i * 0.7);
        const blur = Math.round(2 + i * 1.6);
        shadows.push(
            `0px ${Math.max(1, Math.round(y / 2))}px ${Math.max(2, Math.round(blur / 2))}px rgba(${rgb}, ${nearOpacity}), ` +
                `0px ${y}px ${blur}px rgba(${rgb}, ${farOpacity})`,
        );
    }

    return shadows as unknown as Shadows;
}

/**
 * Options and component overrides of the "modern" themes (`modernDark` and `modernLight`).
 */
export function getModernTheme(
    name: ThemeName,
    type: ThemeType,
): { options: ThemeOptions; components: Record<string, any> } {
    const t: ModernTokens = type === 'dark' ? MODERN_DARK : MODERN_LIGHT;

    const options: ThemeOptions = {
        name,
        shape: { borderRadius: 10 },
        shadows: buildShadows(type),
        typography: {
            fontFamily: FONT_FAMILY,
            h1: { fontWeight: 700, letterSpacing: '-0.02em' },
            h2: { fontWeight: 700, letterSpacing: '-0.02em' },
            h3: { fontWeight: 600, letterSpacing: '-0.02em' },
            h4: { fontWeight: 600, letterSpacing: '-0.01em' },
            h5: { fontWeight: 600 },
            h6: { fontWeight: 600, fontSize: '1.05rem' },
            subtitle1: { fontWeight: 500 },
            subtitle2: { fontWeight: 500 },
            body2: { fontSize: '0.875rem' },
            button: { fontWeight: 500, textTransform: 'none', letterSpacing: 0 },
            caption: { fontSize: '0.75rem' },
        },
        palette: {
            mode: type,
            background: {
                default: t.background,
                paper: t.paper,
            },
            primary: {
                main: t.primary,
                dark: t.primaryDark,
                light: t.primaryLight,
                contrastText: '#FFFFFF',
            },
            secondary: {
                main: t.secondary,
                contrastText: '#FFFFFF',
            },
            success: { main: t.success },
            warning: { main: t.warning },
            error: { main: t.error },
            info: { main: t.info },
            divider: t.border,
            text: {
                primary: t.textPrimary,
                secondary: t.textSecondary,
                disabled: t.textDisabled,
            },
            action: {
                hover: t.hover,
                hoverOpacity: type === 'dark' ? 0.06 : 0.04,
                selected: t.selected,
                selectedOpacity: type === 'dark' ? 0.16 : 0.1,
            },
            expert: t.expert,
            nonAck: t.nonAck,
        },
        toolbar: {
            height: 52,
        },
        saveToolbar: {
            background: t.primary,
            button: {
                borderRadius: 8,
                height: 34,
            },
        },
    };

    const components: Record<string, any> = {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: t.background,
                    color: t.textPrimary,
                    scrollbarColor: `${t.border} transparent`,
                },
                '*::-webkit-scrollbar': {
                    width: 10,
                    height: 10,
                },
                '*::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                },
                '*::-webkit-scrollbar-thumb': {
                    backgroundColor: t.border,
                    borderRadius: 8,
                    border: `2px solid ${t.background}`,
                },
                '*::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: t.textDisabled,
                },
            },
        },
        MuiPaper: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    // remove the MUI overlay gradient of the dark mode - the colors are defined explicitly
                    backgroundImage: 'none',
                    backgroundColor: t.paper,
                },
                outlined: {
                    border: `1px solid ${t.border}`,
                },
                rounded: {
                    borderRadius: 12,
                },
            },
        },
        MuiCard: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    backgroundColor: t.paper,
                    border: `1px solid ${t.cardBorder}`,
                    borderRadius: 12,
                    backgroundImage: 'none',
                    boxShadow: type === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.4)' : '0 1px 2px rgba(15, 23, 42, 0.05)',
                },
            },
        },
        MuiCardHeader: {
            styleOverrides: {
                root: {
                    padding: '16px 20px 8px 20px',
                },
                title: {
                    fontSize: '1rem',
                    fontWeight: 600,
                },
                subheader: {
                    fontSize: '0.8125rem',
                    color: t.textSecondary,
                },
            },
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: 20,
                    '&:last-child': { paddingBottom: 20 },
                },
            },
        },
        MuiAppBar: {
            defaultProps: {
                elevation: 0,
                color: 'default',
            },
            styleOverrides: {
                root: {
                    backgroundColor: t.paper,
                    backgroundImage: 'none',
                    color: t.textPrimary,
                    borderBottom: `1px solid ${t.border}`,
                },
                colorDefault: {
                    backgroundColor: t.paper,
                },
                colorPrimary: {
                    backgroundColor: t.paper,
                    color: t.textPrimary,
                },
            },
        },
        MuiToolbar: {
            styleOverrides: {
                root: {
                    minHeight: 52,
                    '@media (min-width: 600px)': { minHeight: 52 },
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: t.sidebar,
                    backgroundImage: 'none',
                    borderRight: `1px solid ${t.border}`,
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: t.border,
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    paddingTop: 7,
                    paddingBottom: 7,
                    '&:hover': {
                        backgroundColor: t.hover,
                    },
                    '&.Mui-selected': {
                        // the active navigation item is filled with a gradient
                        background: t.gradient,
                        color: '#FFFFFF',
                        boxShadow: `0 2px 8px ${alpha(t.primary, type === 'dark' ? 0.35 : 0.25)}`,
                        '& .MuiListItemIcon-root': { color: '#FFFFFF' },
                        '&:hover': { background: t.gradientHover },
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: t.textSecondary,
                    minWidth: 36,
                },
            },
        },
        MuiListItemText: {
            styleOverrides: {
                primary: {
                    fontSize: '0.9rem',
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    backgroundColor: t.elevated,
                    backgroundImage: 'none',
                    border: `1px solid ${t.border}`,
                    borderRadius: 10,
                },
                list: {
                    padding: 6,
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontSize: '0.875rem',
                    '&.Mui-selected': {
                        backgroundColor: t.selected,
                    },
                },
            },
        },
        MuiPopover: {
            styleOverrides: {
                paper: {
                    backgroundColor: t.elevated,
                    backgroundImage: 'none',
                    border: `1px solid ${t.border}`,
                    borderRadius: 10,
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: t.elevated,
                    backgroundImage: 'none',
                    border: `1px solid ${t.border}`,
                    borderRadius: 14,
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontSize: '1.05rem',
                    fontWeight: 600,
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 500,
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' },
                },
                sizeSmall: {
                    borderRadius: 6,
                },
                outlined: {
                    borderColor: t.border,
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    color: t.textSecondary,
                    '&:hover': { backgroundColor: t.hover, color: t.textPrimary },
                },
            },
        },
        MuiToggleButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    borderColor: t.border,
                    textTransform: 'none',
                    '&.Mui-selected': {
                        backgroundColor: t.selected,
                        color: t.primaryLight,
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: '0.75rem',
                },
                sizeSmall: {
                    height: 22,
                },
                outlined: {
                    borderColor: t.border,
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: type === 'dark' ? '#242C37' : '#1F2937',
                    border: type === 'dark' ? `1px solid ${t.border}` : undefined,
                    borderRadius: 8,
                    fontSize: '0.75rem',
                    padding: '6px 10px',
                },
                arrow: {
                    color: type === 'dark' ? '#242C37' : '#1F2937',
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    backgroundColor: type === 'dark' ? alpha('#FFFFFF', 0.03) : alpha('#0F172A', 0.02),
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: t.border },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.textDisabled },
                },
                input: {
                    padding: '10px 12px',
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    fontSize: '0.875rem',
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: t.textSecondary,
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                select: {
                    fontSize: '0.875rem',
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    minHeight: 42,
                    borderBottom: `1px solid ${t.border}`,
                },
                indicator: {
                    height: 2,
                    borderRadius: 2,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    minHeight: 42,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.8125rem',
                    letterSpacing: '0.02em',
                    color: t.textSecondary,
                    '&.Mui-selected': { color: t.primaryLight },
                },
            },
        },
        MuiTable: {
            styleOverrides: {
                root: {
                    borderCollapse: 'separate',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${t.border}`,
                    fontSize: '0.8125rem',
                    padding: '10px 14px',
                },
                head: {
                    color: t.textSecondary,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    backgroundColor: t.paper,
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': { backgroundColor: t.hover },
                    '&.Mui-selected': {
                        backgroundColor: t.selected,
                        '&:hover': { backgroundColor: t.selected },
                    },
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    height: 6,
                    borderRadius: 4,
                    backgroundColor: type === 'dark' ? alpha('#FFFFFF', 0.08) : alpha('#0F172A', 0.08),
                },
                bar: {
                    borderRadius: 4,
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                track: {
                    borderRadius: 12,
                },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: t.textDisabled,
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    border: `1px solid ${t.border}`,
                },
            },
        },
        MuiAccordion: {
            styleOverrides: {
                root: {
                    backgroundColor: t.paper,
                    backgroundImage: 'none',
                    border: `1px solid ${t.border}`,
                    borderRadius: 10,
                    '&::before': { display: 'none' },
                },
            },
        },
        MuiLink: {
            styleOverrides: {
                root: {
                    color: t.primaryLight,
                    textDecorationColor: alpha(t.primaryLight, 0.4),
                    transition: 'color .2s ease',
                    '&:hover': { color: t.primary },
                },
            },
        },
    };

    return { options, components };
}
