/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 */
import React from 'react';
import { type AnimatedIconProps, rootProps, useAnimatedIconStyles } from './common';

export interface IconMenuArrowProps extends AnimatedIconProps {
    /** false: menu symbol (three bars), true: arrow */
    open: boolean;
    /** Direction of the arrow (default: left, e.g. to collapse a menu on the left side) */
    direction?: 'left' | 'right';
}

/**
 * Menu symbol that turns into an arrow, e.g. for the button that opens and closes the side menu.
 *
 * ```tsx
 * <IconButton onClick={() => this.toggleDrawer()}>
 *     <IconMenuArrow open={this.state.drawerOpen} />
 * </IconButton>
 * ```
 */
export function IconMenuArrow(props: IconMenuArrowProps): React.JSX.Element {
    useAnimatedIconStyles();
    return (
        <span
            {...rootProps(
                props,
                `iob-ani-menu${props.open ? ' iob-ani-menu-open' : ''}${props.direction === 'right' ? ' iob-ani-menu-right' : ''}`,
            )}
        >
            <span className="iob-ani-layer iob-ani-menu-rot">
                <span className="iob-ani-layer iob-ani-menu-flip">
                    <span className="iob-ani-menu-bar iob-ani-menu-b1" />
                    <span className="iob-ani-menu-bar iob-ani-menu-b2" />
                    <span className="iob-ani-menu-bar iob-ani-menu-b3" />
                </span>
            </span>
        </span>
    );
}
