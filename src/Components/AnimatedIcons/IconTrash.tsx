/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 */
import React from 'react';
import { type AnimatedIconProps, rootProps, useAnimatedIconStyles } from './common';

export interface IconTrashProps extends AnimatedIconProps {
    /** Keeps the lid open, e.g. while a delete confirmation is shown */
    open?: boolean;
}

/**
 * Trash can for delete buttons. The lid opens when the mouse is over the icon or over the button around it
 * (`IconButton`, the start icon of a `Button`, a link...), or when that button has the keyboard focus.
 *
 * ```tsx
 * <IconButton onClick={...}><IconTrash /></IconButton>
 * ```
 */
export function IconTrash(props: IconTrashProps): React.JSX.Element {
    useAnimatedIconStyles();
    return (
        <span {...rootProps(props, `iob-ani-trash${props.open ? ' iob-ani-trash-open' : ''}`)}>
            <svg viewBox="0 0 24 24">
                <path
                    className="iob-ani-trash-lid"
                    fill="currentColor"
                    d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                />
                <path
                    fill="currentColor"
                    d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"
                />
            </svg>
        </span>
    );
}
