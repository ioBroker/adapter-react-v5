/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 */
import React from 'react';
import { type AnimatedIconProps, rootProps, useAnimatedIconStyles } from './common';

export interface IconResultProps extends AnimatedIconProps {
    /** success: check mark (green), warning: exclamation mark (orange), error: cross (red). The color can be changed with `style.color`. */
    type: 'success' | 'warning' | 'error';
    /** Every change of this value draws the icon again, e.g. a counter of the save clicks */
    replay?: string | number;
}

/**
 * Result of an action: a circle and the mark draw themselves, a warning or an error shakes once.
 *
 * ```tsx
 * {saved ? <IconResult type="success" replay={saveCount} /> : null}
 * ```
 */
export function IconResult(props: IconResultProps): React.JSX.Element {
    useAnimatedIconStyles();
    let mark: React.JSX.Element;
    if (props.type === 'success') {
        mark = (
            <path
                className="iob-ani-res-mark"
                d="M7.5 12.5l3 3 6-6.5"
                pathLength={1}
            />
        );
    } else if (props.type === 'warning') {
        mark = (
            <>
                <path
                    className="iob-ani-res-mark"
                    d="M12 7.5v5"
                    pathLength={1}
                />
                <path
                    className="iob-ani-res-mark2"
                    d="M12 16.4v.1"
                    pathLength={1}
                />
            </>
        );
    } else {
        mark = (
            <>
                <path
                    className="iob-ani-res-mark"
                    d="M8.7 8.7l6.6 6.6"
                    pathLength={1}
                />
                <path
                    className="iob-ani-res-mark2"
                    d="M15.3 8.7l-6.6 6.6"
                    pathLength={1}
                />
            </>
        );
    }

    return (
        <span {...rootProps(props, `iob-ani-res iob-ani-res-${props.type}`)}>
            <svg
                key={`${props.type}-${props.replay ?? ''}`}
                viewBox="0 0 24 24"
            >
                <circle
                    className="iob-ani-res-circle"
                    cx="12"
                    cy="12"
                    r="10"
                    pathLength={1}
                />
                {mark}
            </svg>
        </span>
    );
}
