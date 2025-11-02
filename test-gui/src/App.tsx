import React, { Component } from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        grey: true;
    }
}

import langEn from '../../src/i18n/en.json';
import langDe from '../../src/i18n/de.json';
import langRu from '../../src/i18n/ru.json';
import langPt from '../../src/i18n/pt.json';
import langNl from '../../src/i18n/nl.json';
import langFr from '../../src/i18n/fr.json';
import langIt from '../../src/i18n/it.json';
import langEs from '../../src/i18n/es.json';
import langPl from '../../src/i18n/pl.json';
import langUk from '../../src/i18n/uk.json';
import langZhCn from '../../src/i18n/zh-cn.json';
import { I18n } from '../../src/i18n';
import { Theme } from '../../src/Theme';
import type { IobTheme, ThemeName, ThemeType } from '../../src/types';
import { ObjectBrowser, type ObjectBrowserFilter } from '../../src/Components/ObjectBrowser';
import { PROGRESS } from '../../src/LegacyConnection';
import { AdminConnection } from '@iobroker/socket-client';
import '../../src/index.css';
import { Button, Dialog, DialogActions, DialogContent, IconButton, Tab, Tabs, TextField } from '@mui/material';
import { IconExpert, LoaderNW, ToggleThemeMenu } from '../../src';

interface AppState {
    connected: boolean;
    loaded: boolean;
    tab: 'ObjectBrowser' | 'LoaderNW';
    theme: IobTheme;
    themeName: ThemeName;
    expertMode: boolean;
    showInputTextDialog: boolean;
    inputTextDialogValue: string;
}

function InputTextDialog(props: { onClose: (text?: string) => void }): React.JSX.Element | null {
    const [text, setText] = React.useState<string>('');
    return (
        <Dialog
            open={!0}
            onClose={() => props.onClose()}
            maxWidth="md"
            fullWidth
        >
            <DialogContent>
                <TextField
                    variant="standard"
                    multiline
                    rows={15}
                    fullWidth
                    value={text}
                    onChange={e => setText(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => props.onClose(text)}
                >
                    Ok
                </Button>
                <Button
                    variant="contained"
                    color="grey"
                    onClick={() => props.onClose()}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default class App extends Component<object, AppState> {
    private filters: ObjectBrowserFilter = {};
    private readonly socket: AdminConnection;

    constructor(props: any) {
        super(props);
        const translations: Record<ioBroker.Languages, Record<string, string>> = {
            en: langEn,
            de: langDe,
            ru: langRu,
            pt: langPt,
            nl: langNl,
            fr: langFr,
            it: langIt,
            es: langEs,
            pl: langPl,
            uk: langUk,
            'zh-cn': langZhCn,
        };
        const themeName = 'NW';
        const theme = Theme(themeName);
        this.state = {
            connected: false,
            loaded: false,
            theme,
            themeName,
            expertMode: window.localStorage.getItem('gui-test-expert-mode') === 'true',
            tab: (window.localStorage.getItem('gui-test-tab') as AppState['tab']) || 'ObjectBrowser',
            showInputTextDialog: false,
            inputTextDialogValue: '',
        };

        I18n.setTranslations(translations);
        I18n.setLanguage('en');
        this.socket = new AdminConnection({
            protocol: 'http:',
            host: window.location.hostname,
            port: 8081,
            name: 'test',
            doNotLoadAllObjects: true,
            onProgress: (progress: number): void => {
                if (progress === PROGRESS.CONNECTING) {
                    this.setState({ connected: false });
                } else if (progress === PROGRESS.READY) {
                    this.setState({ connected: true });
                } else {
                    this.setState({ connected: true });
                }
            },
            onReady: (/* objects, scripts */) => {
                I18n.setLanguage(this.socket.systemLang);
                this.setState({ loaded: true });
            },
            onError: (err: string) => {
                console.error(err);
            },
        });
    }

    renderObjectBrowser(): React.JSX.Element {
        return (
            <ObjectBrowser
                expertMode={this.state.expertMode}
                key="browser"
                dialogName="admin"
                style={{ width: '100%', height: '100%' }}
                socket={this.socket}
                isFloatComma
                dateFormat="DD.MM.YYYY"
                t={I18n.t}
                lang="en"
                imagePrefix={`${window.location.protocol}//${window.location.hostname}:8081`}
                themeName="dark"
                themeType="dark"
                theme={this.state.theme}
                enableStateValueEdit
                objectBrowserInsertJsonObjects={InputTextDialog}
                onFilterChanged={(filterConfig: ObjectBrowserFilter) => {
                    this.filters = filterConfig;
                    console.log(this.filters);
                }}
                objectEditBoolean
                objectAddBoolean
                objectStatesView
                objectImportExport
                objectEditOfAccessControl
            />
        );
    }

    renderLoaderNW(): React.JSX.Element {
        return <LoaderNW themeType={this.state.themeName as ThemeType} />;
    }

    render(): React.JSX.Element {
        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    <div style={{ width: '100%', height: '100%' }}>
                        <Tabs
                            style={{
                                width: '100%',
                                backgroundColor: this.state.theme.palette.primary.main,
                                color: this.state.theme.palette.text.primary,
                            }}
                            value={this.state.tab}
                            onChange={(_event, newValue) => {
                                this.setState({ tab: newValue });
                                if (!newValue.includes('Loader')) {
                                    window.localStorage.setItem('gui-test-tab', newValue);
                                }
                            }}
                            textColor="inherit"
                            indicatorColor="primary"
                        >
                            <Tab
                                label="Object Browser"
                                value="ObjectBrowser"
                            />
                            <Tab
                                label="Loader NW"
                                value="LoaderNW"
                            />
                            <div style={{ flexGrow: 1 }} />
                            <ToggleThemeMenu
                                style={{
                                    color: this.state.theme.palette.background.default,
                                }}
                                themeName={this.state.themeName}
                                toggleTheme={() => {
                                    const newThemeName: ThemeName = this.state.themeName === 'dark' ? 'light' : 'dark';
                                    const newTheme = Theme(newThemeName);
                                    this.setState({ themeName: newThemeName, theme: newTheme });
                                }}
                                t={I18n.t}
                            />
                            <IconButton
                                onClick={() => {
                                    this.setState({ expertMode: !this.state.expertMode });
                                    window.localStorage.setItem('gui-test-expert-mode', String(!this.state.expertMode));
                                }}
                                style={{ color: this.state.expertMode ? 'orange' : undefined }}
                                title={I18n.t('Expert Mode')}
                            >
                                <IconExpert />
                            </IconButton>
                        </Tabs>
                        {!this.state.loaded && <div style={{ color: 'white' }}>Loading...</div>}
                        {this.state.loaded && this.state.tab === 'ObjectBrowser' && this.renderObjectBrowser()}
                        {this.state.loaded && this.state.tab === 'LoaderNW' && this.renderLoaderNW()}
                    </div>
                </ThemeProvider>
            </StyledEngineProvider>
        );
    }
}
