/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 *
 * Part of the object browser, see ./ObjectBrowserClass.tsx
 *
 * Placeholder while the objects are loading: a toolbar, a header and rows that look like an object tree,
 * with a shimmer running over them. With many objects the loading takes some seconds, and so the page
 * does not stay empty.
 */
import React, { type JSX } from 'react';
import { Box, Skeleton } from '@mui/material';
import { prefersReducedMotion } from '../AnimatedIcons/common';
import { ROW_HEIGHT } from './utils';
import type { ObjectBrowserClass } from './ObjectBrowserClass';

/** Level, width of the ID and width of the name (0: no name, like a folder) of the placeholder rows, in % */
const ROWS: [number, number, number][] = [
    [0, 30, 0],
    [1, 42, 0],
    [2, 55, 46],
    [2, 48, 38],
    [2, 60, 52],
    [1, 38, 30],
    [2, 52, 0],
    [3, 64, 44],
    [3, 58, 56],
    [0, 26, 0],
    [1, 46, 40],
    [1, 40, 34],
    [2, 57, 48],
    [0, 34, 0],
    [1, 50, 42],
    [2, 62, 36],
    [2, 54, 50],
    [1, 44, 0],
    [2, 59, 39],
    [2, 51, 47],
];

const styles: Record<string, React.CSSProperties> = {
    root: {
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 48,
        padding: '0 12px',
        flexShrink: 0,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        height: 38,
        padding: '0 8px',
        flexShrink: 0,
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        height: ROW_HEIGHT,
        paddingRight: 8,
        flexShrink: 0,
    },
    id: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '45%',
        // the indentation of the level is inside of the width, so the name column starts at the same place
        boxSizing: 'border-box',
        flexShrink: 0,
        minWidth: 0,
    },
    name: {
        flexGrow: 1,
        minWidth: 0,
        paddingLeft: 8,
    },
    value: {
        width: '14%',
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'flex-end',
    },
};

/** The placeholder of the object browser while the objects are loading */
export function renderSkeleton(that: ObjectBrowserClass): JSX.Element {
    const animation = prefersReducedMotion() ? false : 'wave';
    return (
        <Box
            key={`${that.props.dialogName}_c`}
            style={{ ...styles.root, ...that.props.style }}
            aria-busy="true"
        >
            <div style={styles.toolbar}>
                {[0, 1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton
                        key={i}
                        variant="circular"
                        width={28}
                        height={28}
                        animation={animation}
                    />
                ))}
            </div>
            <div style={styles.header}>
                <Skeleton
                    variant="rounded"
                    width="42%"
                    height={26}
                    animation={animation}
                />
                <Skeleton
                    variant="rounded"
                    width="30%"
                    height={26}
                    animation={animation}
                />
            </div>
            {ROWS.map(([level, idWidth, nameWidth], i) => (
                <div
                    key={i}
                    style={styles.row}
                >
                    <div style={{ ...styles.id, paddingLeft: 8 + level * 20 }}>
                        <Skeleton
                            variant="rounded"
                            width={18}
                            height={18}
                            animation={animation}
                            sx={{ flexShrink: 0 }}
                        />
                        <Skeleton
                            variant="text"
                            width={`${idWidth}%`}
                            animation={animation}
                        />
                    </div>
                    <div style={styles.name}>
                        {nameWidth ? (
                            <Skeleton
                                variant="text"
                                width={`${nameWidth}%`}
                                animation={animation}
                            />
                        ) : null}
                    </div>
                    <div style={styles.value}>
                        {nameWidth ? (
                            <Skeleton
                                variant="text"
                                width="60%"
                                animation={animation}
                            />
                        ) : null}
                    </div>
                </div>
            ))}
        </Box>
    );
}
