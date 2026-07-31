import React, { type JSX } from 'react';

import { GlobalStyles } from '@mui/material';
import { alpha } from '@mui/material/styles';

import type { IobTheme } from '../types';

interface ScrollbarStylesProps {
    theme: IobTheme;
}

/**
 * Slim scrollbars in the colors of the current theme.
 *
 * Render it once below the `ThemeProvider`. It replaces the fixed grey scrollbars that most GUIs
 * still carry in their own `index.css` - those were copied from this package years ago and do not
 * fit a dark theme.
 *
 * Two mechanisms on purpose:
 * - `scrollbar-width`/`scrollbar-color` is the standard (Firefox, Chromium 121+, Safari 18.2+).
 * - the `::-webkit-scrollbar` rules serve older Chromium and Safari. Newer Chromium ignores them as
 *   soon as `scrollbar-width` is set, so the two do not fight each other.
 *
 * The colors are additionally published as `--iob-scrollbar-thumb` and `--iob-scrollbar-thumb-hover`
 * on `:root`. A GUI can put its own fallback rules on `html` in its `index.css` for the moment
 * before React has mounted - `:root` is more specific and always wins over it.
 */
export function ScrollbarStyles({ theme }: ScrollbarStylesProps): JSX.Element {
    const thumb = alpha(theme.palette.text.primary, 0.25);
    const thumbHover = alpha(theme.palette.text.primary, 0.45);

    return (
        <GlobalStyles
            styles={{
                ':root': {
                    '--iob-scrollbar-thumb': thumb,
                    '--iob-scrollbar-thumb-hover': thumbHover,
                },
                '*': {
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${thumb} transparent`,
                },
                '*::-webkit-scrollbar': {
                    width: 10,
                    height: 10,
                },
                '*::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                },
                '*::-webkit-scrollbar-thumb': {
                    backgroundColor: thumb,
                    borderRadius: 8,
                    // the transparent border plus `content-box` keeps the thumb slim on every
                    // background - a colored border would only fit the one it was picked for
                    border: '2px solid transparent',
                    backgroundClip: 'content-box',
                },
                '*::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: thumbHover,
                },
                '*::-webkit-scrollbar-corner': {
                    backgroundColor: 'transparent',
                },
            }}
        />
    );
}
