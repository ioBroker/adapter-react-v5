import React from 'react';
import { Box } from '@mui/material';

interface DemoCardProps {
    /** Name of the demonstrated component */
    title: string;
    /** Short note about what is shown */
    hint?: string;
    /** Let the card grow wider than the default 320px */
    wide?: boolean;
    children: React.ReactNode;
    /** Current value of the component, rendered below the demo */
    value?: string;
}

/** One component per card - used by every demo page, so all pages look the same */
export default function DemoCard(props: DemoCardProps): React.JSX.Element {
    return (
        <Box
            component="div"
            sx={{
                flex: props.wide ? '1 1 660px' : '0 1 320px',
                minWidth: props.wide ? 400 : 300,
                p: 2,
                borderRadius: 2,
                border: theme => `1px solid ${theme.palette.divider}`,
                backgroundColor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
            }}
        >
            <Box
                component="div"
                sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}
            >
                {props.title}
            </Box>
            {props.hint ? (
                <Box
                    component="div"
                    sx={{ fontSize: '0.78rem', opacity: 0.7, mt: '-4px' }}
                >
                    {props.hint}
                </Box>
            ) : null}
            <Box
                component="div"
                sx={{ mt: 0.5 }}
            >
                {props.children}
            </Box>
            {props.value !== undefined ? (
                <Box
                    component="code"
                    sx={{
                        mt: 'auto',
                        pt: 1,
                        fontSize: '0.75rem',
                        opacity: 0.8,
                        wordBreak: 'break-all',
                    }}
                >
                    {props.value || '<empty>'}
                </Box>
            ) : null}
        </Box>
    );
}

/** The page around the cards */
export function DemoPage(props: { children: React.ReactNode }): React.JSX.Element {
    return (
        <Box
            component="div"
            sx={{
                width: '100%',
                height: 'calc(100% - 48px)',
                overflow: 'auto',
                display: 'flex',
                flexWrap: 'wrap',
                alignContent: 'flex-start',
                gap: 2,
                p: 2,
                boxSizing: 'border-box',
            }}
        >
            {props.children}
        </Box>
    );
}
