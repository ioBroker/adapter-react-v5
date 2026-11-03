/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 */
import React, { useRef } from 'react';
import { type AnimatedIconProps, play, rootProps, useAnimatedIconStyles, useChange } from './common';

export interface IconBellProps extends AnimatedIconProps {
    /** Number of the notifications: the bell rings when it grows (not when it gets smaller) */
    count?: number;
    /** Every change of this value rings the bell too */
    ring?: string | number | boolean | null;
}

/**
 * Notification bell, which rings when a new notification arrives.
 *
 * ```tsx
 * <Badge badgeContent={count}><IconBell count={count} /></Badge>
 * ```
 */
export function IconBell(props: IconBellProps): React.JSX.Element {
    useAnimatedIconStyles();
    const body = useRef<SVGGElement>(null);
    const clapper = useRef<SVGPathElement>(null);

    const ringBell = (): void => {
        play(
            body.current,
            [
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(16deg)' },
                { transform: 'rotate(-14deg)' },
                { transform: 'rotate(10deg)' },
                { transform: 'rotate(-6deg)' },
                { transform: 'rotate(3deg)' },
                { transform: 'rotate(0deg)' },
            ],
            { duration: 900, easing: 'ease-in-out' },
        );
        play(
            clapper.current,
            [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-1.8px)' },
                { transform: 'translateX(1.8px)' },
                { transform: 'translateX(-1.2px)' },
                { transform: 'translateX(0.6px)' },
                { transform: 'translateX(0)' },
            ],
            { duration: 900, delay: 60, easing: 'ease-in-out' },
        );
    };

    useChange(props.count || 0, (count, previous) => {
        if (count > previous) {
            ringBell();
        }
    });
    useChange(props.ring, ringBell);

    return (
        <span {...rootProps(props, 'iob-ani-bell')}>
            <svg viewBox="0 0 24 24">
                <g
                    className="iob-ani-bell-body"
                    ref={body}
                >
                    <path
                        fill="currentColor"
                        d="M18 16v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                    />
                </g>
                <path
                    ref={clapper}
                    fill="currentColor"
                    d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2z"
                />
            </svg>
        </span>
    );
}
