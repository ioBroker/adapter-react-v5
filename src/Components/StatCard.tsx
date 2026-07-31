import React, { type JSX, type ReactNode } from 'react';

import { alpha, Box, Card, Chip, Link, Typography } from '@mui/material';

interface StatCardProps {
    /** Small line above the value, e.g. "Adapters" */
    title: string;
    /** The value itself - a string so that "--" can be shown while it is still unknown */
    value: string;
    /** Quiet line below, e.g. "6 active / 102 inactive" */
    hint?: string;
    /** Accent color: tints the icon square and can color the value */
    color: string;
    /** Color of the value, defaults to the normal text color */
    valueColor?: string;
    icon: JSX.Element;
    /** Marker next to the value, e.g. the number of available updates */
    chip?: { label: string; color: 'warning' | 'primary' | 'success' | 'error' };
    onClick?: () => void;
    /** Overrides the flex basis - by default the card grows from 220px */
    flex?: string;
}

/**
 * A number with a title, an accented icon and a hint - the tile that a dashboard is built from.
 *
 * Kept here rather than in one GUI so that the admin, devices, javascript and the rest can show the
 * same tile instead of each rebuilding its own.
 */
export function StatCard(props: StatCardProps): JSX.Element {
    return (
        <Card
            sx={{
                flex: props.flex || '1 1 220px',
                p: 2.5,
                cursor: props.onClick ? 'pointer' : undefined,
            }}
            onClick={props.onClick}
        >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(props.color, 0.16),
                        color: props.color,
                        flexShrink: 0,
                    }}
                >
                    {props.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {props.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: 30, fontWeight: 700, color: props.valueColor, lineHeight: 1.2 }}>
                            {props.value}
                        </Typography>
                        {props.chip ? (
                            <Chip
                                size="small"
                                color={props.chip.color}
                                label={props.chip.label}
                            />
                        ) : null}
                    </Box>
                </Box>
            </Box>
            {props.hint ? (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1.5 }}
                >
                    {props.hint}
                </Typography>
            ) : null}
        </Card>
    );
}

interface CardTitleProps {
    title: string;
    /** Optional link on the right, e.g. "Show all" */
    action?: { text: string; onClick: () => void };
}

/** Heading of a content card, with an optional action on the right */
export function CardTitle({ title, action }: CardTitleProps): JSX.Element {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>{title}</Typography>
            {action ? (
                <Link
                    component="button"
                    underline="none"
                    sx={{ fontSize: '0.8125rem' }}
                    onClick={action.onClick}
                >
                    {action.text}
                </Link>
            ) : null}
        </Box>
    );
}

interface InfoRowProps {
    name: string;
    /** A node, not only a string, so that a value can carry a chip or an icon */
    value: ReactNode;
}

/** One line "name .......... value" inside a card */
export function InfoRow({ name, value }: InfoRowProps): JSX.Element {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1 }}>
            <Typography
                variant="body2"
                color="text.secondary"
            >
                {name}
            </Typography>
            <Typography
                variant="body2"
                sx={{ fontWeight: 500, textAlign: 'right' }}
            >
                {value}
            </Typography>
        </Box>
    );
}
