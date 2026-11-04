/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 */
import React from 'react';
import { type AnimatedIconProps, rootProps, useAnimatedIconStyles, useSvgId } from './common';

export interface IconThemeModeProps extends AnimatedIconProps {
    /** light: sun, blue: sun as a ring, colored: half filled sun, dark: moon */
    mode: 'light' | 'blue' | 'colored' | 'dark';
}

/**
 * Symbol of the color theme. The sun and the moon turn into each other: the rays draw back and the shadow
 * slides over the sun until only the crescent is left. Between the light themes the rays spin.
 *
 * ```tsx
 * <IconButton onClick={() => this.toggleTheme()}>
 *     <IconThemeMode mode={this.state.themeType === 'dark' ? 'dark' : 'light'} />
 * </IconButton>
 * ```
 */
export function IconThemeMode(props: IconThemeModeProps): React.JSX.Element {
    useAnimatedIconStyles();
    const maskId = useSvgId('theme');
    return (
        <span {...rootProps(props, `iob-ani-theme iob-ani-theme-${props.mode}`)}>
            <svg viewBox="0 0 24 24">
                <defs>
                    <mask
                        id={maskId}
                        maskUnits="userSpaceOnUse"
                        x="-4"
                        y="-4"
                        width="32"
                        height="32"
                    >
                        {/* a path and not a rect: a CSS `width` (e.g. `* { width: initial }`) would change a rect */}
                        <path
                            d="M-4 -4h32v32h-32z"
                            fill="#fff"
                        />
                        {/* the shadow that makes the moon; outside of the sun for the light themes */}
                        <circle
                            className="iob-ani-theme-cut"
                            cx="18"
                            cy="6"
                            r="7"
                            fill="#000"
                        />
                    </mask>
                </defs>
                <g mask={`url(#${maskId})`}>
                    <circle
                        className="iob-ani-theme-disc"
                        cx="12"
                        cy="12"
                        r="5"
                    />
                    <path
                        className="iob-ani-theme-half"
                        d="M12 7a5 5 0 0 0 0 10z"
                    />
                </g>
                <path
                    className="iob-ani-theme-rays"
                    d="M20.5 12h2M18 18l1.4 1.4M12 20.5v2M6 18l-1.4 1.4M3.5 12h-2M6 6L4.6 4.6M12 3.5v-2M18 6l1.4-1.4"
                />
            </svg>
        </span>
    );
}
