// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React, { type JSX } from 'react';

import { Fab, Toolbar } from '@mui/material';

import { Save as IconSave, Close as IconClose } from '@mui/icons-material';

import { I18n } from '../i18n';
import type { IobTheme } from '../types';
import { IconResult } from './AnimatedIcons/IconResult';

const styles: Record<string, React.CSSProperties> = {
    buttonIcon: {
        marginRight: 8,
    },
};

interface SaveCloseButtonsProps {
    /* Are the buttons without text */
    noTextOnButtons?: boolean;
    /* Theme object (from this.state.theme) */
    theme: IobTheme;
    /* bottom position 0 or 38 for iFrame */
    isIFrame?: boolean;
    /* is used in new React */
    newReact?: boolean;
    /* on Save handler */
    onSave: (close: boolean) => void;
    /* on Close handler */
    onClose: () => void;
    dense?: boolean;
    paddingLeft?: number;
    changed: boolean;
    error?: boolean;
}

interface SaveCloseButtonsState {
    /** How often the settings were saved; a check mark is drawn on the save button after each save */
    savedCount: number;
    showSaved: boolean;
}

export class SaveCloseButtons extends React.Component<SaveCloseButtonsProps, SaveCloseButtonsState> {
    private readonly isIFrame: boolean;

    /** The save button was pressed and the settings are not stored yet */
    private saving: ReturnType<typeof setTimeout> | null = null;

    private savedTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(props: SaveCloseButtonsProps) {
        super(props);
        const newReact = props.newReact === undefined ? true : props.newReact;

        if (props.isIFrame !== undefined) {
            this.isIFrame = props.isIFrame;
        } else {
            try {
                this.isIFrame = !newReact && window.self !== window.top;
            } catch {
                this.isIFrame = !newReact;
            }
        }
        this.state = { savedCount: 0, showSaved: false };
    }

    componentDidUpdate(prevProps: Readonly<SaveCloseButtonsProps>): void {
        // the settings are stored, when nothing is changed anymore after a click on "Save"
        if (this.saving && prevProps.changed && !this.props.changed) {
            clearTimeout(this.saving);
            this.saving = null;
            if (this.savedTimer) {
                clearTimeout(this.savedTimer);
            }
            this.savedTimer = setTimeout(() => {
                this.savedTimer = null;
                this.setState({ showSaved: false });
            }, 2000);
            this.setState({ savedCount: this.state.savedCount + 1, showSaved: true });
        }
    }

    componentWillUnmount(): void {
        if (this.saving) {
            clearTimeout(this.saving);
        }
        if (this.savedTimer) {
            clearTimeout(this.savedTimer);
        }
    }

    onSave(): void {
        if (this.saving) {
            clearTimeout(this.saving);
        }
        // if saving fails, the settings stay changed: forget the click after a while
        this.saving = setTimeout(() => (this.saving = null), 10000);
        this.props.onSave(false);
    }

    render(): JSX.Element {
        const noTextOnButtons = this.props.noTextOnButtons;
        const buttonStyle: React.CSSProperties = {
            borderRadius: this.props.theme.saveToolbar.button.borderRadius || 3,
            height: this.props.theme.saveToolbar.button.height || 32,
        };

        const style: React.CSSProperties = {
            bottom: this.isIFrame ? 38 : 0,
            left: this.props.paddingLeft || 0,
            right: 0,
            position: 'absolute',
            background: this.props.theme.saveToolbar.background,
        };
        if (this.props.dense) {
            style.minHeight = 48;
        }

        if (this.props.error) {
            buttonStyle.border = '1px solid red';
        }

        return (
            <Toolbar
                // position="absolute"
                style={style}
            >
                <Fab
                    variant="extended"
                    aria-label="Save"
                    disabled={!this.props.changed || this.props.error}
                    onClick={() => this.onSave()}
                    style={buttonStyle}
                >
                    {this.state.showSaved ? (
                        <IconResult
                            type="success"
                            replay={this.state.savedCount}
                            style={!noTextOnButtons ? styles.buttonIcon : undefined}
                        />
                    ) : (
                        <IconSave style={!noTextOnButtons ? styles.buttonIcon : undefined} />
                    )}
                    {!noTextOnButtons && I18n.t('ra_Save')}
                </Fab>
                <Fab
                    variant="extended"
                    aria-label="Save and close"
                    disabled={!this.props.changed || this.props.error}
                    onClick={() => this.props.onSave(true)}
                    style={{ ...buttonStyle, ...{ marginLeft: 10 } }}
                >
                    <IconSave style={!noTextOnButtons ? styles.buttonIcon : undefined} />
                    {!noTextOnButtons ? I18n.t('ra_Save and close') : '+'}
                    {noTextOnButtons && <IconClose />}
                </Fab>
                <div style={{ flexGrow: 1 }} />
                <Fab
                    variant="extended"
                    aria-label="Close"
                    onClick={() => this.props.onClose()}
                    style={buttonStyle}
                >
                    <IconClose style={!noTextOnButtons ? styles.buttonIcon : undefined} />
                    {!noTextOnButtons && I18n.t('ra_Close')}
                </Fab>
            </Toolbar>
        );
    }
}
