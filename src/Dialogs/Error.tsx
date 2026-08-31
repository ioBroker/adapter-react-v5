/**
 * Copyright 2018-2023 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 *
 */
// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React, { Component, type JSX } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Check as IconCheck, ErrorOutlined as IconError } from '@mui/icons-material';

import { I18n } from '../i18n';

import type { IobTheme } from '../types';

const styles: Record<string, any> = {
    // Accent line on top of the dialog, so it is recognizable as an error at a glance
    paper: (theme: IobTheme) => ({
        '& .MuiDialog-paper': {
            borderTop: `4px solid ${theme.palette.error.main}`,
        },
    }),
    title: (theme: IobTheme) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: theme.palette.error.main,
        backgroundColor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.16 : 0.08),
    }),
    content: {
        pt: '20px !important',
    },
};

interface DialogErrorProps {
    /* The dialog title; default: Error (translated) */
    title?: string;
    /* The dialog text */
    text: string | React.JSX.Element | React.JSX.Element[];
    /* Close handler. */
    onClose?: () => void;
    /* if the dialog must be fill sized */
    fullWidth?: boolean;
}

export class DialogError extends Component<DialogErrorProps> {
    handleOk(): void {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    render(): JSX.Element {
        return (
            <Dialog
                open={!0}
                maxWidth="sm"
                sx={styles.paper}
                fullWidth={this.props.fullWidth !== undefined ? this.props.fullWidth : true}
                onClose={() => this.handleOk()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle
                    id="ar_alert_dialog_title"
                    sx={styles.title}
                >
                    <IconError />
                    {this.props.title || I18n.t('ra_Error')}
                </DialogTitle>
                <DialogContent sx={styles.content}>
                    <DialogContentText id="ar_alert_dialog_description">
                        {this.props.text || I18n.t('ra_Unknown error!')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        id="ar_dialog_error_ok"
                        variant="contained"
                        onClick={() => this.handleOk()}
                        color="error"
                        autoFocus
                        startIcon={<IconCheck />}
                    >
                        {I18n.t('ra_Ok')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
