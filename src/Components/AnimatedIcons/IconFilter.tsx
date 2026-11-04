/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 */
import React from 'react';
import { type AnimatedIconProps, rootProps, useAnimatedIconStyles } from './common';

export interface IconFilterProps extends AnimatedIconProps {
    /** A filter is set: a red cross next to the funnel shows that a click removes it */
    active: boolean;
}

/**
 * Filter symbol for "clear filter" buttons. While a filter is set, a red cross pops up next to the funnel,
 * it turns on hover of the button and jumps away when the filter is cleared. The color of the cross can be
 * changed with the CSS class `iob-ani-filter-x`.
 *
 * ```tsx
 * <IconButton onClick={() => this.clearFilter()}>
 *     <IconFilter active={!!this.state.filter} />
 * </IconButton>
 * ```
 */
export function IconFilter(props: IconFilterProps): React.JSX.Element {
    useAnimatedIconStyles();
    return (
        <span {...rootProps(props, `iob-ani-filter${props.active ? ' iob-ani-filter-on' : ''}`)}>
            <svg viewBox="0 0 24 24">
                {/* filter_alt of the Material icons, Apache 2.0, see IconClearFilter */}
                <path
                    className="iob-ani-filter-funnel"
                    d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39A.998.998 0 0 0 18.95 4H5.04c-.83 0-1.3.95-.79 1.61z"
                />
                <path
                    className="iob-ani-filter-x"
                    d="M16.75 14.5l4.5 4.5M21.25 14.5l-4.5 4.5"
                />
            </svg>
        </span>
    );
}
