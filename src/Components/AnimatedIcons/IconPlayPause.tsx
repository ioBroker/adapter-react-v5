/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 */
import React from 'react';
import { type AnimatedIconProps, rootProps, useAnimatedIconStyles } from './common';

export interface IconPlayPauseProps extends AnimatedIconProps {
    /** true: the pause symbol (it runs and can be paused or stopped), false: the play symbol */
    running: boolean;
    /** Waiting for the result of the click, e.g. until the instance really started: a ring turns around the symbol */
    pending?: boolean;
}

/**
 * Play and pause symbol that turns into each other.
 *
 * ```tsx
 * <IconButton onClick={...}>
 *     <IconPlayPause running={instance.running} pending={instance.starting} />
 * </IconButton>
 * ```
 */
export function IconPlayPause(props: IconPlayPauseProps): React.JSX.Element {
    useAnimatedIconStyles();
    return (
        <span
            {...rootProps(
                props,
                `iob-ani-pp${props.running ? ' iob-ani-on' : ''}${props.pending ? ' iob-ani-pp-pending' : ''}`,
            )}
        >
            <span className="iob-ani-pp-a" />
            <span className="iob-ani-pp-b" />
            <svg
                className="iob-ani-pp-ring"
                viewBox="0 0 24 24"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="11"
                    pathLength={1}
                />
            </svg>
        </span>
    );
}
