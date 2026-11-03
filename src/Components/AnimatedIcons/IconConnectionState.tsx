/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 */
import React from 'react';
import { type AnimatedIconProps, rootProps, useAnimatedIconStyles } from './common';

export interface IconConnectionStateProps extends AnimatedIconProps {
    /** connected: all waves, connecting: the waves run outwards, disconnected: dimmed and crossed out */
    state: 'connected' | 'connecting' | 'disconnected';
}

/**
 * Connection symbol with three states.
 *
 * ```tsx
 * <IconConnectionState state={connected ? 'connected' : reconnecting ? 'connecting' : 'disconnected'} />
 * ```
 */
export function IconConnectionState(props: IconConnectionStateProps): React.JSX.Element {
    useAnimatedIconStyles();
    return (
        <span {...rootProps(props, `iob-ani-wifi iob-ani-wifi-${props.state}`)}>
            <svg viewBox="0 0 24 24">
                <path
                    className="iob-ani-wifi-w iob-ani-wifi-w3"
                    d="M2.45 8.95A13.5 13.5 0 0 1 21.55 8.95"
                />
                <path
                    className="iob-ani-wifi-w iob-ani-wifi-w2"
                    d="M5.64 12.14A9 9 0 0 1 18.36 12.14"
                />
                <path
                    className="iob-ani-wifi-w iob-ani-wifi-w1"
                    d="M8.82 15.32A4.5 4.5 0 0 1 15.18 15.32"
                />
                <circle
                    className="iob-ani-wifi-w"
                    cx="12"
                    cy="18.5"
                    r="1.7"
                />
                <path
                    className="iob-ani-wifi-slash"
                    d="M4 3.5L20 20.5"
                    pathLength={1}
                />
            </svg>
        </span>
    );
}
