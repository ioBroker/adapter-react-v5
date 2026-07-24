import React from 'react';

import { Grid } from '@mui/material';

interface TabHeaderProps {
    children: React.ReactNode;
}

export function TabHeader(props: TabHeaderProps): React.JSX.Element {
    return (
        <Grid
            container
            sx={{ alignItems: 'center' }}
        >
            {props.children}
        </Grid>
    );
}
