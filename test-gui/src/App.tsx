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
import type { IobTheme } from '../../src/types';
import { ObjectBrowser, type ObjectBrowserFilter } from '../../src/Components/ObjectBrowser';
import { PROGRESS } from '../../src/LegacyConnection';
import { AdminConnection } from '@iobroker/socket-client';
import '../../src/index.css';

interface AppState {
    connected: boolean;
    loaded: boolean;
}

export default class App extends Component<object, AppState> {
    private readonly theme: IobTheme;
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
        this.state = {
            connected: false,
            loaded: false,
        };

        I18n.setTranslations(translations);
        I18n.setLanguage('en');
        this.theme = Theme('dark');
        this.socket = new AdminConnection({
            protocol: 'ws',
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

    render(): React.JSX.Element {
        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.theme}>
                    <div style={{ width: '100%', height: '100%' }}>
                        {this.state.loaded ? (
                            <ObjectBrowser
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
                                theme={this.theme}
                                enableStateValueEdit
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
                        ) : (
                            <div style={{ color: 'white' }}>Loading...</div>
                        )}
                    </div>
                </ThemeProvider>
            </StyledEngineProvider>
        );
    }
}
