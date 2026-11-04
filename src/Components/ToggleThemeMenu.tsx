import React, { type JSX } from 'react';

import { IconButton, Tooltip } from '@mui/material';

import { IconThemeMode, type IconThemeModeProps } from './AnimatedIcons/IconThemeMode';
import type { ThemeName } from '../types';

function getMode(themeName: ThemeName): IconThemeModeProps['mode'] {
    if (themeName === 'dark' || themeName === 'modernDark') {
        return 'dark';
    }
    if (themeName === 'blue' || themeName === 'colored') {
        return themeName;
    }
    return 'light';
}

interface ToggleThemeMenuProps {
    themeName: ThemeName;
    toggleTheme: () => void;
    t: (key: string) => string;
    className?: string;
    style?: React.CSSProperties;
    size?: 'small' | 'medium' | 'large';
}

export function ToggleThemeMenu({
    themeName,
    toggleTheme,
    t,
    className,
    style,
    size,
}: ToggleThemeMenuProps): JSX.Element {
    return (
        <div
            className={className || undefined}
            style={style || undefined}
        >
            <Tooltip
                title={t('ra_Change color theme')}
                slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
            >
                <IconButton
                    onClick={() => toggleTheme()}
                    size={size || 'medium'}
                >
                    {/* one icon for all themes, so that the change is animated */}
                    <IconThemeMode
                        mode={getMode(themeName)}
                        className={className}
                    />
                </IconButton>
            </Tooltip>
        </div>
    );
}
