import React from 'react';

import { Box, Paper } from '@mui/material';

const styles: Record<string, React.CSSProperties> = {
    root: {
        width: '100%',
        height: '100%',
    },
    overflowHidden: {
        overflow: 'hidden',
    },
    container: {
        height: '100%',
    },
};

interface TabContainerProps {
    /* The elevation of the tab container. */
    elevation?: number;
    /* Set to 'visible' show the overflow. */
    overflow?: string;
    styles?: {
        root?: React.CSSProperties;
        container?: React.CSSProperties;
    };
    onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    tabIndex?: number;
    /** The content of the component. */
    children: React.ReactNode;
}

export function TabContainer(props: TabContainerProps): React.JSX.Element {
    return (
        <Paper
            elevation={!Number.isNaN(props.elevation) ? props.elevation : 1}
            style={{
                ...styles.root,
                ...(props.styles?.root || undefined),
                ...(props.overflow !== 'visible' ? styles.overflowHidden : undefined),
            }}
            onKeyDown={props.onKeyDown}
            tabIndex={props.tabIndex}
        >
            {/* MUI 9's Grid only supports 'row' directions, so a plain flex box replaces the former
                column Grid container here. */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    ...styles.container,
                }}
            >
                {props.children}
            </Box>
        </Paper>
    );
}
