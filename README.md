# ioBroker GUI components

`@iobroker/gui-components` is the shared React component library for ioBroker adapter configuration
pages, admin tabs and web applications: theme system, i18n, socket connection handling, object and file
browser, and a set of ready-to-use dialogs.

- Requires **React 19** and **MUI 9** (both are peer dependencies)
- Successor of `@iobroker/adapter-react-v5` (React 18 / MUI 6), which is still maintained on the
  `adapter-react-v5` branch for older systems.
  See [migration from 8.x to 10.x](MIGRATION_8_10.md)

You can find a demo on https://github.com/ioBroker/adapter-react-demo

## Getting started

The GUI of an adapter is a standalone React application in the `src` directory of the adapter.
It is built with [vite](https://vite.dev/) and the result is copied into the `admin` directory.

1. Create the GitHub repository for the adapter (e.g., with `npx @iobroker/create-adapter`).

2. Create the GUI project in the `src` directory:

```bash
npm create vite@latest src -- --template react-ts
```

3. Modify `src/package.json`:

```json
{
    "name": "ADAPTERNAME-admin",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "homepage": ".",
    "dependencies": {
        "@emotion/react": "^11.14.0",
        "@emotion/styled": "^11.14.1",
        "@iobroker/gui-components": "^10.1.0",
        "@mui/icons-material": "^9.0.1",
        "@mui/material": "^9.0.1",
        "react": "^19.2.5",
        "react-dom": "^19.2.5"
    },
    "devDependencies": {
        "@types/react": "^19.2.0",
        "@types/react-dom": "^19.2.0",
        "@vitejs/plugin-react": "^6.0.4",
        "typescript": "~5.9.3",
        "vite": "^8.1.5"
    },
    "scripts": {
        "start": "vite",
        "build": "vite build",
        "preview": "vite preview"
    }
}
```

Of course, replace `ADAPTERNAME` with your adapter name. The versions can be higher, but React must
stay at 19 and MUI at 9.

4. Write the vite configuration `src/vite.config.ts`. Important are `base` (the GUI is served from a
   subdirectory of the admin) and `build.outDir` (the build script expects the result in `src/build`):

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: './',
    build: {
        outDir: 'build',
    },
    server: {
        port: 3000,
    },
});
```

5. Install the packages: `cd src && npm install && cd ..`

6. Copy the build script into the root of the adapter:

```bash
cp src/node_modules/@iobroker/gui-components/tasksExample.ts tasks.ts
```

The build script is TypeScript and is executed directly by node, which strips the types at load
time. This requires **node >= 22.18** (or >= 23.6). Note that node does not resolve the extension
for TypeScript, so the scripts below must call `node tasks.ts` and not `node tasks`.

7. Add `@iobroker/build-tools` to the `devDependencies` of the **adapter** `package.json` and the
   following scripts:

```json
{
    "scripts": {
        "0-clean": "node tasks.ts --0-clean",
        "1-npm": "node tasks.ts --1-npm",
        "2-build": "node tasks.ts --2-build",
        "3-copy": "node tasks.ts --3-copy",
        "4-patch": "node tasks.ts --4-patch",
        "build": "node tasks.ts"
    }
}
```

8. Develop with `cd src && npm run start` (vite dev server on port 3000) or build everything with
   `npm run build` in the adapter root. The build copies all files into the `admin` directory and
   patches the socket.io script tag in `index.html`.

## Development

### 1. Load socket.io in `src/index.html`

The GUI does not bundle socket.io. It is delivered by the admin instance and must be loaded before the
application starts. Add this to the `<head>` of `src/index.html`:

```html
<script>
    const script = document.createElement('script');
    window.registerSocketOnLoad = function (cb) {
        window.socketLoadedHandler = cb;
    };
    const parts = (window.location.search || '').replace(/^\?/, '').split('&');
    const query = {};
    parts.forEach(item => {
        const [name, val] = item.split('=');
        query[decodeURIComponent(name)] = val !== undefined ? decodeURIComponent(val) : true;
    });
    script.onload = function () {
        typeof window.socketLoadedHandler === 'function' && window.socketLoadedHandler();
    };
    // On the vite dev server (port 3000) the socket must be loaded from the admin instance (port 8081)
    script.src =
        window.location.port === '3000'
            ? `${window.location.protocol}//${query.host || window.location.hostname}:${query.port || 8081}/lib/js/socket.io.js`
            : './../../lib/js/socket.io.js';

    document.head.appendChild(script);
</script>
```

`node tasks.ts --4-patch` replaces this block in the built `index.html` with a direct include of
`./../../lib/js/socket.io.js`.

### 2. Extend `GenericApp` in `src/src/App.tsx`

`GenericApp` handles the socket connection, the theme, loading and saving of the instance
configuration, the save/close buttons, and the Sentry initialization.

```tsx
import React from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import {
    GenericApp,
    Loader,
    I18n,
    type GenericAppProps,
    type GenericAppSettings,
    type GenericAppState,
} from '@iobroker/gui-components';

import en from './i18n/en.json';
import de from './i18n/de.json';
import ru from './i18n/ru.json';
import pt from './i18n/pt.json';
import nl from './i18n/nl.json';
import fr from './i18n/fr.json';
import it from './i18n/it.json';
import es from './i18n/es.json';
import pl from './i18n/pl.json';
import uk from './i18n/uk.json';
import zhCn from './i18n/zh-cn.json';

interface AppState extends GenericAppState {
    // your own state
}

export default class App extends GenericApp<GenericAppProps, AppState> {
    constructor(props: GenericAppProps) {
        const extendedProps: GenericAppSettings = { ...props };
        // these fields will be encrypted and decrypted automatically
        extendedProps.encryptedFields = ['pass'];
        extendedProps.translations = { en, de, ru, pt, nl, fr, it, es, pl, uk, 'zh-cn': zhCn };
        // get the actual admin port
        extendedProps.socket = { port: parseInt(window.location.port, 10) };

        // only if the save/close buttons at the bottom are not required (e.g., for an admin tab)
        // extendedProps.bottomButtons = false;

        // only for debug purposes: the vite dev server runs on 3000, the admin on 8081
        if (extendedProps.socket.port === 3000) {
            extendedProps.socket.port = 8081;
        }

        // let GenericApp manage the Sentry initialization. Do not set it if no Sentry is available
        extendedProps.sentryDSN = 'https://yyy@sentry.iobroker.net/xx';

        super(props, extendedProps);
    }

    onConnectionReady(): void {
        // called after the socket is connected and the configuration is loaded
    }

    render(): React.JSX.Element {
        if (!this.state.loaded) {
            return (
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={this.state.theme}>
                        <Loader themeType={this.state.themeType} />
                    </ThemeProvider>
                </StyledEngineProvider>
            );
        }

        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    <div
                        className="App"
                        style={{
                            background: this.state.theme.palette.background.default,
                            color: this.state.theme.palette.text.primary,
                        }}
                    >
                        <div>
                            {I18n.t('Port')}:
                            <input
                                value={this.state.native.port || ''}
                                onChange={e => this.updateNativeValue('port', e.target.value)}
                            />
                        </div>
                        {/* renders the error, toast, alert dialogs and the save/close buttons */}
                        {this.renderHelperDialogs()}
                    </div>
                </ThemeProvider>
            </StyledEngineProvider>
        );
    }
}
```

### 3. Entry point `src/src/index.tsx`

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App';
import { version } from '../package.json';

console.log(`iobroker.ADAPTERNAME@${version}`);

const container = document.getElementById('root');
if (container) {
    createRoot(container).render(<App />);
}
```

### 4. Encrypt and decrypt values

Fields listed in `encryptedFields` are encrypted and decrypted automatically. If you need more control,
override the hooks:

```tsx
class App extends GenericApp<GenericAppProps, AppState> {
    // ...
    onPrepareLoad(settings: Record<string, any>, encryptedNative?: string[]): void {
        settings.pass = this.decrypt(settings.pass);
    }

    onPrepareSave(settings: Record<string, any>): boolean {
        settings.pass = this.encrypt(settings.pass);
        return true;
    }
}
```

### 5. Validate the data before saving (optional)

```tsx
onPrepareSave(settings: Record<string, any>): boolean {
    super.onPrepareSave(settings);
    if (DATA_INVALID) {
        return false; // the configuration will not be saved
    }
    return true;
}
```

## Components

All components, dialogs, icons, and types are exported from the package root:

```ts
import { GenericApp, ObjectBrowser, DialogSelectID, I18n, Utils } from '@iobroker/gui-components';
```

### Core modules

| Module                           | Description                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------ |
| `GenericApp`                     | Base class of every adapter GUI: connection, theme, config load/save, save/close buttons, Sentry |
| `Connection` / `AdminConnection` | Re-export of the socket classes from `@iobroker/socket-client`                                   |
| `I18n`                           | Static translation class (`I18n.t`, `I18n.setLanguage`, `I18n.getLanguage`)                      |
| `Theme`                          | MUI theme factory that produces the ioBroker themes (`IobTheme`)                                 |
| `Router`                         | Simple hash-based router                                                                         |
| `Utils`                          | Helper functions for names, icons, colors, clipboard, ...                                        |

### Dialogs

Some dialogs are predefined and can be used out of the box. In all dialogs, the OK button is first (on
the left) and the cancel button is last (on the right).

| Dialog              | Deprecated alias    | Description                           |
| ------------------- | ------------------- | ------------------------------------- |
| `DialogConfirm`     | `Confirm`           | Yes/no question, can be suppressed    |
| `DialogError`       | `Error`             | Error message                         |
| `DialogMessage`     | `Message`           | Information message                   |
| `DialogTextInput`   | `TextInput`         | Ask for a text                        |
| `DialogSelectID`    | `SelectID`          | Object ID selector                    |
| `DialogSelectFile`  | `SelectFile`        | File selector                         |
| `DialogCron`        | `Cron`              | CRON editor (wizard, simple, complex) |
| `DialogSimpleCron`  | `SimpleCronDialog`  | Only the simple CRON editor           |
| `DialogComplexCron` | `ComplexCronDialog` | Only the complex CRON editor          |

#### DialogConfirm

<!-- TODO: Provide screenshot here -->

```tsx
import React from 'react';
import { Button } from '@mui/material';
import { I18n, DialogConfirm } from '@iobroker/gui-components';

export default function ExportImportDialog(): React.JSX.Element {
    const [confirmDialog, setConfirmDialog] = React.useState(false);

    return (
        <div>
            <Button onClick={() => setConfirmDialog(true)}>Click</Button>
            {confirmDialog ? (
                <DialogConfirm
                    title={I18n.t('Scene will be overwritten.')}
                    text={I18n.t('All data will be lost. Confirm?')}
                    ok={I18n.t('Yes')}
                    cancel={I18n.t('Cancel')}
                    suppressQuestionMinutes={5}
                    // `dialogName` is required if `suppressQuestionMinutes` is used
                    dialogName="myConfirmDialogThatCouldBeSuppressed"
                    suppressText={I18n.t('Suppress question for next %s minutes', 5)}
                    onClose={(isYes: boolean) => {
                        setConfirmDialog(false);
                        if (isYes) {
                            // do something
                        }
                    }}
                />
            ) : null}
        </div>
    );
}
```

#### DialogError

<!-- TODO: Provide screenshot here -->

```tsx
{
    this.state.errorText ? (
        <DialogError
            text={this.state.errorText}
            onClose={() => this.setState({ errorText: '' })}
        />
    ) : null;
}
```

#### DialogMessage

<!-- TODO: Provide screenshot here -->

```tsx
{
    this.state.showMessage ? (
        <DialogMessage
            text={this.state.showMessage}
            onClose={() => this.setState({ showMessage: '' })}
        />
    ) : null;
}
```

#### DialogSelectID

<!-- TODO: Provide screenshot here -->

```tsx
import React, { Component } from 'react';
import { DialogSelectID, type IobTheme } from '@iobroker/gui-components';
import type { AdminConnection } from '@iobroker/socket-client';

interface MyComponentProps {
    socket: AdminConnection;
    theme: IobTheme;
    themeType: 'dark' | 'light';
    adapterName: string;
}

class MyComponent extends Component<MyComponentProps, { showSelectId: boolean; selectIdValue: string }> {
    renderSelectIdDialog(): React.JSX.Element | null {
        if (!this.state.showSelectId) {
            return null;
        }
        return (
            <DialogSelectID
                imagePrefix="../.."
                dialogName={this.props.adapterName}
                // `theme` is mandatory, without it the dialog will crash
                theme={this.props.theme}
                themeType={this.props.themeType}
                socket={this.props.socket}
                types={['state']}
                selected={this.state.selectIdValue}
                onClose={() => this.setState({ showSelectId: false })}
                onOk={(selected, _name) => this.setState({ showSelectId: false, selectIdValue: selected as string })}
            />
        );
    }

    render(): React.JSX.Element | null {
        return this.renderSelectIdDialog();
    }
}
```

#### DialogCron

<!-- TODO: Provide screenshot here -->

```tsx
function renderCron(): React.JSX.Element | null {
    if (!showCron) {
        return null;
    }
    return (
        <DialogCron
            cron={this.state.cronValue || '* * * * *'}
            // `theme` is mandatory
            theme={this.props.theme}
            // noWizard, simple or complex can limit the available editors
            onClose={() => this.setState({ showCron: false })}
            onOk={(cronValue: string) => this.setState({ cronValue })}
        />
    );
}
```

### Component examples

#### Utils

##### getObjectNameFromObj

`getObjectNameFromObj(obj, settings, options, isDesc, noTrim)`

Get the name from a single object.

Usage: `Utils.getObjectNameFromObj(this.objects[id], null, { language: I18n.getLanguage() })`

##### getObjectIcon

`getObjectIcon(id, obj)`

Get the icon from the object.

```tsx
const icon = Utils.getObjectIcon(id, this.objects[id]);
return (
    <img
        src={icon}
        alt=""
    />
);
```

##### isUseBright

`isUseBright(color, defaultValue)`

Returns `true` if a bright (white) text must be used on the given background color.

Usage: `const textColor = Utils.isUseBright(backgroundColor) ? '#FFF' : '#000';`

#### Loader

<!-- TODO: Provide screenshot here -->

The loader detects the vendor (`window.vendorPrefix`) and shows the corresponding animation.

```tsx
render(): React.JSX.Element {
    if (!this.state.loaded) {
        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    <Loader themeType={this.state.themeType} />
                </ThemeProvider>
            </StyledEngineProvider>
        );
    }
    // render the loaded data
}
```

#### Logo

<!-- TODO: Provide screenshot here -->

Shows the adapter logo and the import/export buttons for the configuration.

```tsx
render(): React.JSX.Element {
    return (
        <form style={styles.tab}>
            <Logo
                instance={this.props.instance}
                common={this.props.common}
                native={this.props.native}
                onError={(text: string) => this.setState({ errorText: text })}
                onLoad={this.props.onLoad}
            />
            ...
        </form>
    );
}
```

#### ObjectBrowser

It is better to use `DialogSelectID`, but if you want:

<!-- TODO: Provide screenshot here -->

```tsx
<ObjectBrowser
    foldersFirst={this.props.foldersFirst}
    imagePrefix={this.props.imagePrefix}
    defaultFilters={this.filters}
    dialogName={this.dialogName}
    showExpertButton={this.props.showExpertButton !== undefined ? this.props.showExpertButton : true}
    style={{ width: '100%', height: '100%' }}
    columns={this.props.columns || ['name', 'type', 'role', 'room', 'func', 'val']}
    types={this.props.types || ['state']}
    t={I18n.t}
    lang={this.props.lang || I18n.getLanguage()}
    socket={this.props.socket}
    selected={this.state.selected}
    multiSelect={this.props.multiSelect}
    notEditable={this.props.notEditable === undefined ? true : this.props.notEditable}
    name={this.state.name}
    theme={this.props.theme}
    themeName={this.props.themeName}
    themeType={this.props.themeType}
    customFilter={this.props.customFilter}
    onFilterChanged={filterConfig => {
        this.filters = filterConfig;
        window.localStorage.setItem(this.dialogName, JSON.stringify(filterConfig));
    }}
    onSelect={(selected, name, isDouble) => {
        if (JSON.stringify(selected) !== JSON.stringify(this.state.selected)) {
            this.setState({ selected, name }, () => isDouble && this.handleOk());
        } else if (isDouble) {
            this.handleOk();
        }
    }}
/>
```

#### TreeTable

<!-- TODO: Provide screenshot here -->

```tsx
// STYLES
const styles: Record<string, React.CSSProperties> = {
    tableDiv: {
        width: '100%',
        overflow: 'hidden',
        height: 'calc(100% - 48px)',
    },
};

class MyComponent extends Component<MyComponentProps, MyComponentState> {
    // the `Column` type is not exported, the structure is described below
    private readonly columns: Record<string, any>[];

    constructor(props: MyComponentProps) {
        super(props);

        this.state = {
            data: [
                {
                    id: 'UniqueID1', // required
                    fieldIdInData: 'Name1',
                    myType: 'number',
                },
                {
                    id: 'UniqueID2', // required
                    fieldIdInData: 'Name12',
                    myType: 'string',
                },
            ],
        };

        this.columns = [
            {
                title: 'Name of field', // required, else it will be "field"
                field: 'fieldIdInData', // required
                editable: false, // or true [default - true]
                cellStyle: {
                    // CSS style - // optional
                    maxWidth: '12rem',
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                },
                lookup: {
                    // optional => edit will be automatically "SELECT"
                    value1: 'text1',
                    value2: 'text2',
                },
            },
            {
                title: 'Type', // required, else it will be "field"
                field: 'myType', // required
                editable: true, // or true [default - true]
                lookup: {
                    // optional => edit will be automatically "SELECT"
                    number: 'Number',
                    string: 'String',
                    boolean: 'Boolean',
                },
                type: 'number/string/color/oid/icon/boolean', // oid=ObjectID,icon=base64-icon
                editComponent: props => (
                    <div>
                        Prefix&#123; <br />
                        <textarea
                            rows={4}
                            style={{ width: '100%', resize: 'vertical' }}
                            value={props.value}
                            onChange={e => props.onChange(e.target.value)}
                        />
                        Suffix
                    </div>
                ),
            },
        ];
    }

    render(): React.JSX.Element {
        return (
            <div style={styles.tableDiv}>
                <TreeTable
                    columns={this.columns}
                    data={this.state.data}
                    // `theme` and `adapterName` are mandatory
                    theme={this.props.theme}
                    adapterName={this.props.adapterName}
                    onUpdate={(newData, oldData) => {
                        const data = JSON.parse(JSON.stringify(this.state.data));

                        // Added new line
                        if (newData === true) {
                            // find unique ID
                            let i = 1;
                            let id = `line_${i}`;

                            while (this.state.data.find(item => item.id === id)) {
                                i++;
                                id = `line_${i}`;
                            }

                            data.push({
                                id,
                                name: `${I18n.t('New resource')}_${i}`,
                                color: '',
                                icon: '',
                                unit: '',
                                price: 0,
                            });
                        } else {
                            // an existing line was modified
                            const pos = this.state.data.indexOf(oldData);
                            if (pos !== -1) {
                                Object.keys(newData).forEach(attr => (data[pos][attr] = newData[attr]));
                            }
                        }

                        this.setState({ data });
                    }}
                    onDelete={oldData => {
                        const pos = this.state.data.indexOf(oldData);
                        if (pos !== -1) {
                            const data = JSON.parse(JSON.stringify(this.state.data));
                            data.splice(pos, 1);
                            this.setState({ data });
                        }
                    }}
                />
            </div>
        );
    }
}
```

#### Toast

<!-- TODO: Provide screenshot here -->

Toast is not a part of this package, but this is an example of how to use a toast in the application.
`GenericApp` already provides one via `this.showToast('text')`.

```tsx
import React, { Component } from 'react';
import { IconButton, Snackbar } from '@mui/material';
import { Close as IconClose } from '@mui/icons-material';

class MyComponent extends Component<MyComponentProps, { toast: string }> {
    renderToast(): React.JSX.Element | null {
        if (!this.state.toast) {
            return null;
        }
        return (
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                open
                autoHideDuration={6000}
                onClose={() => this.setState({ toast: '' })}
                // MUI 9: `ContentProps` was replaced by `slotProps`
                slotProps={{ content: { 'aria-describedby': 'message-id' } }}
                message={<span id="message-id">{this.state.toast}</span>}
                action={
                    <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        onClick={() => this.setState({ toast: '' })}
                    >
                        <IconClose />
                    </IconButton>
                }
            />
        );
    }

    render(): React.JSX.Element {
        return <div>{this.renderToast()}</div>;
    }
}
```

### Further components

| Component                                 | Description                                                                |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| `ColorPicker`                             | Color selector with a custom palette                                       |
| `CustomModal`                             | Simple modal dialog with OK/Cancel                                         |
| `DeviceTypeSelector` / `DeviceTypeIcon`   | Selector and icons for the device types of `@iobroker/type-detector`       |
| `FileBrowser`                             | Browser for the files of the ioBroker file system                          |
| `FileViewer`                              | Viewer/editor for a single file                                            |
| `IconPicker` / `IconSelector`             | Selection of an icon (base64 or from the icon sets)                        |
| `Icon` / `Image`                          | Renders an icon or an image from any source (base64, URL, UTF-8 character) |
| `InfoBox`                                 | Colored box for hints, warnings, and errors                                |
| `Loader`, `LoaderPT`, `LoaderMV`, ...     | Vendor-specific loading animations                                         |
| `Logo`                                    | Adapter logo with import/export of the configuration                       |
| `SaveCloseButtons`                        | Save and close buttons (used by `GenericApp`)                              |
| `Schedule`                                | Editor for the ioBroker schedule format                                    |
| `SelectWithIcon`                          | Select box with icons (e.g., for rooms and functions)                      |
| `SimpleCron` / `ComplexCron`              | Inline CRON editors                                                        |
| `TabContainer`, `TabHeader`, `TabContent` | Layout components for tabs in the adapter configuration                    |
| `TableResize`                             | Table with resizable columns                                               |
| `TextWithIcon`                            | Text with the icon of the object in front                                  |
| `ToggleThemeMenu`                         | Menu to switch between the themes                                          |
| `UploadImage`                             | Upload with drag-and-drop and cropper                                      |
| `iobUriParse` / `iobUriRead`              | Helpers to parse and read `iob://` URIs                                    |

### Module federation

The ioBroker admin loads the adapter GUIs as micro-frontends. The list of the packages that must be
shared is delivered with this package:

```js
const { moduleFederationShared } = require('@iobroker/gui-components/modulefederation.admin.config');
```

Custom components of the JSON config must additionally be built with `manifest: true` and ship the
generated `mf-manifest.json` next to `customComponents.js`, as the admin reads from it against which
component library the build was made. See
[the migration instructions](MIGRATION_8_10.md#6-custom-admin-components) for the details.

## Test GUI

The `test-gui` directory contains a vite application to develop and test the components visually.
It imports directly from `../../src`, so changes are visible immediately:

```bash
cd test-gui
npm install
npm start
```

It expects a running ioBroker admin on `127.0.0.1:8081`.

## Checks

There is no unit test suite. The following checks run in CI and should be run before a pull request:

```bash
npm run check              # type check (tsc --noEmit)
npm run lint               # eslint
npm run check-device-types # device types are in sync with @iobroker/type-detector
```

`check-device-types` fails if a device type of `@iobroker/type-detector` has no icon in
`DeviceTypeIcon.tsx` or no name in one of the `src/Components/DeviceType/i18n/*.json` files, if a
name is left over for a type that no longer exists, or if a language file is not imported by
`deviceTypeTranslations.ts`. See [the DeviceType readme](src/Components/DeviceType/README.md) for
the details.

## List of adapters that use this library

- Admin
- Backitup
- iot
- echarts
- text2command
- scenes
- javascript
- devices
- eventlist
- cameras
- web
- vis-2
- vis-2-widgets-xxx
- fullcalendar
- openweathermap

## Usability

In dialogs, the OK button is first (on the left) and the cancel button is last (on the right)

## Used icons

This project uses icons from [Flaticon](https://www.flaticon.com/).

ioBroker GmbH has a valid license for all the used icons.
The icons may not be reused in other projects without the proper flaticon license or flaticon subscription.

## Migration instructions

You can find the migration instructions:

- [from adapter-react-v5@8.x to gui-components@10.x](MIGRATION_8_10.md)
- [from adapter-react-v5@6.x to adapter-react-v5@7.x](MIGRATION_6_7.md)
- [from adapter-react-v5@5.x to adapter-react-v5@6.x](MIGRATION_5_6.md)
- [from adapter-react to adapter-react-v5@5.x](MIGRATION_4_5.md)

<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->

## Changelog
### **WORK IN PROGRESS**

- (@krobipd) Corrected: the object browser stayed empty after closing the object customization dialog if any object was changed while the dialog was open (ioBroker/ioBroker.admin#3391)

### 10.1.0 (2026-08-13)

- (@GermanBluefox) Updated `@iobroker/type-detector` to 6.0.0
- (@GermanBluefox) Added icons and names for the device types `airPurifier`, `airQuality`, `coAlarm`, `contact`, `electricity`, `fan`, `fillLevel`, `flow`, `pressure`, `pump` and `unknown`
- (@GermanBluefox) Removed the names of the no longer existing device types `url` and `valve`
- (@GermanBluefox) Corrected the Spanish translations of the device types, as they were never loaded
- (@GermanBluefox) Added `npm run check-device-types` to detect missing device type icons and names

### 10.0.16 (2026-08-10)

- (@GermanBluefox) Corrected the text color of the filled alerts (snackbars) in the dark themes

### 10.0.15 (2026-08-07)

- (@GermanBluefox) Tuned TextWithIcon component

### 10.0.14 (2026-08-07)

- (@GermanBluefox) Allowed to tap empty value to edit the value in the `TreeTable` component (mobile view)
- (@GermanBluefox) Updated packages

### 10.0.12 (2026-08-02)

- (@GermanBluefox) Replaced the spark line

### 10.0.11 (2026-07-31)

- (@GermanBluefox) Added support of styled scrollbars

### 10.0.6 (2026-07-30)

- (@GermanBluefox) Added modern themes

### 10.0.5 (2026-07-27)

- (@GermanBluefox) I18n was improved

### 10.0.4 (2026-07-26)

- (@GermanBluefox) Better typing for the `ObjectBrowser` component

### 10.0.3 (2026-07-25)

- (@GermanBluefox) Split the object browser into the directory `Components/ObjectBrowser` (no API changes)

### 10.0.2 (2026-07-25)

- (@GermanBluefox) BREAKING: Package renamed from `@iobroker/adapter-react-v5` to `@iobroker/gui-components`
- (@GermanBluefox) BREAKING: React19 + MUI9
- (@GermanBluefox) BREAKING: Removed `LegacyConnection`. Use `Connection`/`AdminConnection` instead
- (@GermanBluefox) Used TypeScript 6
- (@GermanBluefox) Updated README and added the migration guide `MIGRATION_8_10.md`

### 8.3.2 (2026-07-22)

- (@GermanBluefox) Corrected tooltip if object is wrong

### 8.3.1 (2026-07-12)

- (@GermanBluefox) Used strict types

### 8.2.13 (2026-06-21)

- (@GermanBluefox) Updated socket-client package to support web-socket-only mode

### 8.2.12 (2026-06-20)

- (@GermanBluefox) Corrected InfoBox color

### 8.2.11 (2026-06-19)

- (@GermanBluefox) Correcting background of state if overloaded
- (@GermanBluefox) Moved translations for json-config to another package

### 8.2.10 (2026-06-16)

- (@GermanBluefox) Corrected the folder creation

### 8.2.9 (2026-06-12)

- (@GermanBluefox) Updated socket-client package to support reverse proxy

### 8.2.8 (2026-06-11)

- (@GermanBluefox) Added object and file navigation

### 8.2.7 (2026-05-29)

- (@GermanBluefox) Updated loader

### 8.2.6 (2026-05-25)

- (@GermanBluefox) Updated loader

### 8.2.4 (2026-05-15)

- (@GermanBluefox) allowed to define the theme by query parameter `?theme=dark` or `?theme=light` or `?theme=auto`

### 8.2.2 (2026-04-21)

- (@GermanBluefox) Force using React 18

### 8.2.0 (2026-04-17)

- (@GermanBluefox) Added support for a new post-message about the theme change
- (@GermanBluefox) Updated packages

### 8.1.8 (2026-04-11)

- (@GermanBluefox) Fixed some minor bugs

### 8.1.6 (2026-03-24)

- (@GermanBluefox) Added translations

### 8.1.4 (2026-03-21)

- (@GermanBluefox) Optimisations of the translation engine

### 8.1.3 (2026-03-09)

- (@GermanBluefox) Added export of the types icons

### 8.1.2 (2026-03-05)

- (@GermanBluefox) Updated packages

### 8.1.1 (2026-03-02)

- (@GermanBluefox) Force react 18

### 8.0.21 (2026-02-10)

- (@GermanBluefox) Added translations

### 8.0.20 (2026-02-09)

- (@GermanBluefox) Small typing fixes

### 8.0.17 (2026-01-27)

- (@GermanBluefox) Added percentage icon

### 8.0.16 (2025-12-16)

- (@GermanBluefox) Updated packages and used standard GitHub actions

### 8.0.13 (2025-11-13)

- (@GermanBluefox) Changed theme for NW

### 8.0.12 (2025-11-09)

- (@GermanBluefox) Fixing ref for Icon and TabContent components

### 8.0.9 (2025-11-02)

- (@GermanBluefox) Added possibility to import objects from text
- (@GermanBluefox) Object browser was split into a few files

### 8.0.7 (2025-10-28)

- (@GermanBluefox) Added `updateSmartNameEx` function to Utils
- (@GermanBluefox) Corrected expert mode toggle in object browser

### 8.0.5 (2025-10-25)

- (@GermanBluefox) Fixed filter in the object browser

### 8.0.3 (2025-10-23)

- (@GermanBluefox) Split packages from mono-repo

### 7.2.3 (2024-10-05)

- (@GermanBluefox) Corrected error in the simple CRON dialog

### 7.2.2 (2024-10-04)

- (@GermanBluefox) Small layout change for Icon Picker

### 7.2.1 (2024-09-30)

- (@GermanBluefox) Allowed using an array of elements in dialogs
- (@GermanBluefox) Allowed to use `socket.iob` instead of `socket.io`

### 7.1.4 (2024-09-15)

- (@GermanBluefox) Updated socket classes

### 7.1.3 (2024-09-15)

- (@GermanBluefox) Updated socket classes
- (@GermanBluefox) Added additional confirmation dialog for CRONs for every minute execution

### 7.1.1 (2024-09-13)

- (@GermanBluefox) Corrected TabContainer

### 7.1.0 (2024-09-12)

- (@GermanBluefox) Optimized the icon picker
- (@GermanBluefox) Used common eslint-config

### 7.0.2 (2024-09-10)

- (@GermanBluefox) Showed the context menu under cursor position in the object browser
- (@GermanBluefox) Added links to aliases in the object browser

### 7.0.1 (2024-08-29)

- (@GermanBluefox) Updated the object browser
- (@GermanBluefox) Used MUI Library 6.0

### 6.1.10 (2024-08-30)

- (@GermanBluefox) Updated the object browser

### 6.1.9 (2024-08-14)

- (@GermanBluefox) Updated JSON schema

### 6.1.8 (2024-08-03)

- (@GermanBluefox) Added translations

### 6.1.6 (2024-07-23)

- (@GermanBluefox) Optimize package

### 6.1.5 (2024-07-20)

- (@GermanBluefox) Added sources to package

### 6.1.3 (2024-07-20)

- (@GermanBluefox) Better typing of legacy connection

### 6.1.1 (2024-07-16)

- (@GermanBluefox) Added translations

### 6.1.0 (2024-07-15)

- (@GermanBluefox) Replace by CRON to text the package to `cronstrue`

### 6.0.19 (2024-07-14)

- (@GermanBluefox) added some packages for federation

### 6.0.17 (2024-07-14)

- (@GermanBluefox) Allowed playing mp3 files in the file browser
- (@GermanBluefox) Corrected jump by object selection

### 6.0.14 (2024-07-07)

- (@GermanBluefox) Corrected theme type selection

### 6.0.13 (2024-06-30)

- (@GermanBluefox) Corrected color picker

### 6.0.12 (2024-06-29)

- (@GermanBluefox) Added support for the overrides in the theme

### 6.0.10 (2024-06-27)

- (@GermanBluefox) Added translation
- (@GermanBluefox) Mobile object browser improved

### 6.0.9 (2024-06-26)

- (@GermanBluefox) Corrected Icons

### 6.0.8 (2024-06-26)

- (@GermanBluefox) Corrected types of the select ID dialog
- (@GermanBluefox) Made the tooltips neutral to the pointer events

### 6.0.6 (2024-06-24)

- (@GermanBluefox) Synchronised with admin
- (@GermanBluefox) Added translations for time scheduler

### 6.0.4 (2024-06-21)

- (@GermanBluefox) Removed the usage of `withStyles` in favor of `sx` and `style` properties (see [Migration from v5 to v6](#migration-from-v5-to-v6)
- (@GermanBluefox) (BREAKING) Higher version of `@mui/material` (5.15.20) is used

### 5.0.8 (2024-06-15)

- (@GermanBluefox) Added `modulefederation.admin.config.js` for module federation

### 5.0.5 (2024-06-10)

- (@GermanBluefox) Sources were synchronized with admin

### 5.0.4 (2024-06-07)

- (@GermanBluefox) Added better typing

### 5.0.2 (2024-05-30)

- (@GermanBluefox) Added better typing
- (@GermanBluefox) Json-Config is now a separate package and must be installed additionally

### 5.0.0 (2024-05-29)

- (@GermanBluefox) Types are now exported
- (@GermanBluefox) Translator renamed to Translate
- (@GermanBluefox) Breaking: Theme renamed to IobTheme because of the naming conflict

### 4.13.24 (2024-05-25)

- (@GermanBluefox) Updated packages

- ### 4.13.22 (2024-05-23)
- (@GermanBluefox) Updated packages

### 4.13.20 (2024-05-22)

- (@GermanBluefox) Better types added
- (@GermanBluefox) updated theme definitions
- (@GermanBluefox) corrected dates in cron dialog

### 4.13.14 (2024-05-19)

- (@GermanBluefox) Updated packages

### 4.13.13 (2024-05-09)

- (@GermanBluefox) Updated ioBroker types

### 4.13.12 (2024-05-06)

- (@GermanBluefox) All files are migrated to TypeScript

### 4.13.11 (2024-04-23)

- (@GermanBluefox) Corrected the size of icons

### 4.13.10 (2024-04-22)

- (@GermanBluefox) Migrated all icons to TypeScript

### 4.13.9 (2024-04-20)

- (@GermanBluefox) Updated socket-client package

### 4.13.8 (2024-04-19)

- (@GermanBluefox) Corrected CRON selector

### 4.13.7 (2024-04-19)

- (@GermanBluefox) Migrated ColorPicker to TypeScript

### 4.13.6 (2024-04-11)

- (@GermanBluefox) Migrated TreeTable to TypeScript
- (@GermanBluefox) corrected the object subscription

### 4.13.5 (2024-04-02)

- (@GermanBluefox) used new connection classes
- (@GermanBluefox) Improved the `SelectID` dialog

### 4.13.3 (2024-04-01)

- (@GermanBluefox) used new connection classes

### 4.12.3 (2024-03-30)

- (@GermanBluefox) Migrated legacy connection to TypeScript

### 4.12.2 (2024-03-25)

- (@GermanBluefox) Added support for remote cloud

### 4.11.6 (2024-03-19)

- (@GermanBluefox) Corrected rendering of LoaderMV

### 4.11.4 (2024-03-18)

- (@GermanBluefox) Corrected types of IconPicker

### 4.11.3 (2024-03-17)

- (@GermanBluefox) Made filters for the file selector dialog optional

### 4.11.2 (2024-03-16)

- (@GermanBluefox) Migrated GenericApp to TypeScript

### 4.10.4 (2024-03-16)

- (@GermanBluefox) Migrated some components to TypeScript

### 4.10.1 (2024-03-11)

- (@GermanBluefox) Migrated some components to TypeScript

### 4.9.11 (2024-03-08)

- (foxriver76) type GenericApp socket correctly

### 4.9.10 (2024-02-21)

- (@GermanBluefox) translations
- (@GermanBluefox) updated JSON config

### 4.9.9 (2024-02-16)

- (foxriver76) also check plugin state of instance to see if Sentry is explicitly disabled

### 4.9.8 (2024-02-13)

- (@GermanBluefox) allowed hiding wizard in cron dialog

### 4.9.7 (2024-02-03)

- (foxriver76) allow passing down the instance number do avoid determining from url

### 4.9.5 (2024-01-01)

- (foxriver76) make `copyToClipboard` event parameter optional

### 4.9.4 (2024-01-01)

- (foxriver76) try to fix `SelectID` scrolling

### 4.9.2 (2023-12-30)

- (foxriver76) bump version of `@iobroker/json-config`

### 4.9.1 (2023-12-22)

- (foxriver76) `@iobroker/json-config` moved to real dependencies

### 4.9.0 (2023-12-22)

- (foxriver76) migrate to `@iobroker/json-config` module to have a single point of truth
- (@GermanBluefox) Allowed using of `filterFunc` as string

### 4.8.1 (2023-12-14)

- (@GermanBluefox) Added Device manager to JSON Config

### 4.7.15 (2023-12-12)

- (@GermanBluefox) Corrected parsing of a text

### 4.7.13 (2023-12-10)

- (@GermanBluefox) Added possibility to define the root style and embedded property

### 4.7.11 (2023-12-06)

- (@GermanBluefox) Extended color picker with "noInputField" option

### 4.7.9 (2023-12-04)

- (@GermanBluefox) Corrected the icon picker

### 4.7.8 (2023-12-04)

- (foxriver76) port to `@iobroker/types`

### 4.7.6 (2023-11-29)

- (@GermanBluefox) Added translations

### 4.7.5 (2023-11-28)

- (@GermanBluefox) Corrected subscribe on objects in the legacy connection

### 4.7.4 (2023-11-23)

- (@GermanBluefox) Updated packages
- (@GermanBluefox) Made getStates method in legacy connection compatible with new one

### 4.7.3 (2023-11-08)

- (@GermanBluefox) Updated packages

### 4.7.2 (2023-11-03)

- (foxriver76) fixed the problem with color picker, where editing TextField was buggy
- (foxriver76) fixed light mode color of a path in FileBrowser

### 4.7.0 (2023-10-31)

- (@GermanBluefox) Synced with admin
- (@GermanBluefox) Added GIF to image files

### 4.6.7 (2023-10-19)

- (@GermanBluefox) Added return value for `subscribeOnInstance` for Connection class

### 4.6.6 (2023-10-13)

- (@GermanBluefox) Fixed the legacy connection

### 4.6.5 (2023-10-12)

- (foxriver76) fixed object browser with date

### 4.6.4 (2023-10-11)

- (@GermanBluefox) Updated the packages

### 4.6.3 (2023-10-09)

- (@GermanBluefox) Just updated the packages
- (@GermanBluefox) Synced with admin

### 4.6.2 (2023-09-29)

- (@GermanBluefox) Experimental feature added: update states on re-subscribe

### 4.5.5 (2023-09-27)

- (@GermanBluefox) Added export for IconNoIcon

### 4.5.4 (2023-09-17)

- (@GermanBluefox) Added the restricting to folder property for select file dialog

### 4.5.3 (2023-08-20)

- (foxriver76) fixed CSS classes of TableResize, see https://github.com/ioBroker/ioBroker.admin/issues/1860

### 4.5.2 (2023-08-20)

- (foxriver76) added missing export of TableResize

### 4.5.1 (2023-08-19)

- (foxriver76) fix dialog TextInput

### 4.5.0 (2023-08-18)

- (@GermanBluefox) Synchronize components with admin

### 4.4.8 (2023-08-17)

- (@GermanBluefox) Added translations

### 4.4.7 (2023-08-10)

- (@GermanBluefox) Added `subscribeStateAsync` method to wait for answer
- (@GermanBluefox) Added support for arrays for un/subscriptions

### 4.4.5 (2023-08-01)

- (@GermanBluefox) Updated packages

### 4.3.3 (2023-07-28)

- (@GermanBluefox) Added translations

### 4.3.0 (2023-07-19)

- (@GermanBluefox) Updated packages
- (@GermanBluefox) Added translations
- (@GermanBluefox) Synced object browser
- (@GermanBluefox) formatting

### 4.2.1 (2023-07-17)

- (@GermanBluefox) Updated packages
- (@GermanBluefox) Added translations

### 4.2.0 (2023-07-07)

- (@GermanBluefox) Updated packages
- (@GermanBluefox) Added new method `getObjectsById` to the socket communication

### 4.1.2 (2023-06-20)

- (@GermanBluefox) Allowed setting theme name directly by theme toggle

### 4.1.0 (2023-05-10)

- (@GermanBluefox) `craco-module-federation.js` was added. For node 16

### 4.0.27 (2023-05-09)

- (@GermanBluefox) Allowed showing only specific root in SelectIDDialog

### 4.0.26 (2023-05-08)

- (@GermanBluefox) Added IDs to the buttons in the dialog for GUI tests

### 4.0.25 (2023-04-23)

- (@GermanBluefox) Extended `TextWithIcon` with defined color and icon

### 4.0.24 (2023-04-03)

- (@GermanBluefox) Updated the file selector in tile mode

### 4.0.23 (2023-03-27)

- (@GermanBluefox) Added translations

### 4.0.22 (2023-03-22)

- (@GermanBluefox) Re-Activate legacy connection

### 4.0.21 (2023-03-22)

- (@GermanBluefox) Added translations

### 4.0.20 (2023-03-21)

- (@GermanBluefox) Color picker was improved

### 4.0.19 (2023-03-20)

- (@GermanBluefox) Packages were updated
- (@GermanBluefox) Added new translations

### 4.0.18 (2023-03-16)

- (@GermanBluefox) Packages were updated

### 4.0.17 (2023-03-15)

- (@GermanBluefox) Added translations
- (@GermanBluefox) Added port controller to JSON config

### 4.0.15 (2023-03-12)

- (@GermanBluefox) Updated the object browser and file browser

### 4.0.14 (2023-03-03)

- (@GermanBluefox) added handler of alert messages

### 4.0.13 (2023-02-15)

- (@GermanBluefox) Corrected the theme button

### 4.0.12 (2023-02-15)

- (@GermanBluefox) made the fix for `echarts`

### 4.0.11 (2023-02-14)

- (@GermanBluefox) Updated packages
- (@GermanBluefox) The `chartReady` event was omitted

### 4.0.10 (2023-02-10)

- (@GermanBluefox) Updated packages
- (@GermanBluefox) made the fix for `material`

### 4.0.9 (2023-02-02)

- (@GermanBluefox) Updated packages

### 4.0.8 (2022-12-19)

- (@GermanBluefox) Extended socket with `log` command

### 4.0.6 (2022-12-19)

- (@GermanBluefox) Corrected URL for the connection

### 4.0.5 (2022-12-14)

- (@GermanBluefox) Added support of custom palette for color picker

### 4.0.2 (2022-12-01)

- (@GermanBluefox) use `@iobroker/socket-client` instead of `Connection.tsx`

### 3.5.3 (2022-11-30)

- (@GermanBluefox) Improved `renderTextWithA` function to support `<b>` and `<i>` tags

### 3.5.2 (2022-11-30)

- (@GermanBluefox) updated json config component

### 3.4.1 (2022-11-29)

- (@GermanBluefox) Added button text for message dialog

### 3.4.0 (2022-11-29)

- (@GermanBluefox) Added file selector

### 3.3.0 (2022-11-26)

- (@GermanBluefox) Added subscribe on files

### 3.2.7 (2022-11-13)

- (@GermanBluefox) Added `fullWidth` property to `Dialog`

### 3.2.6 (2022-11-08)

- (xXBJXx) Improved TreeTable component

### 3.2.5 (2022-11-08)

- (@GermanBluefox) Added the role filter for the object browser

### 3.2.4 (2022-11-03)

- (@GermanBluefox) Added support for alfa channel for `invertColor`

### 3.2.3 (2022-10-26)

- (@GermanBluefox) Corrected expert mode for object browser

### 3.2.2 (2022-10-25)

- (@GermanBluefox) Added support for prefixes for translations

### 3.2.1 (2022-10-24)

- (@GermanBluefox) Corrected color inversion

### 3.2.0 (2022-10-19)

- (@GermanBluefox) Added ukrainian translation

### 3.1.35 (2022-10-17)

- (@GermanBluefox) small changes for material

### 3.1.34 (2022-08-24)

- (@GermanBluefox) Implemented fallback to english by translations

### 3.1.33 (2022-08-24)

- (@GermanBluefox) Added support for onchange flag

### 3.1.30 (2022-08-23)

- (@GermanBluefox) Added method `getCompactSystemRepositories`
- (@GermanBluefox) corrected error in `ObjectBrowser`

### 3.1.27 (2022-08-01)

- (@GermanBluefox) Disable file editing in FileViewer

### 3.1.26 (2022-08-01)

- (@GermanBluefox) Added translations
- (@GermanBluefox) JSON schema was extended with missing definitions

### 3.1.24 (2022-07-28)

- (@GermanBluefox) Updated file browser and object browser

### 3.1.23 (2022-07-25)

- (@GermanBluefox) Extend custom filter for object selector

### 3.1.22 (2022-07-22)

- (@GermanBluefox) Added i18n tools for development

### 3.1.20 (2022-07-14)

- (@GermanBluefox) Allowed showing the select dialog with the expert mode enabled

### 3.1.19 (2022-07-08)

- (@GermanBluefox) Allowed extending translations for all languages together

### 3.1.18 (2022-07-06)

- (@GermanBluefox) Added translation

### 3.1.17 (2022-07-05)

- (@GermanBluefox) Deactivate JSON editor for JSONConfig because of space

### 3.1.16 (2022-06-27)

- (@GermanBluefox) Update object browser

### 3.1.15 (2022-06-27)

- (@GermanBluefox) Allowed using of spaces in name

### 3.1.14 (2022-06-23)

- (@GermanBluefox) Added translations

### 3.1.11 (2022-06-22)

- (@GermanBluefox) Added preparations for iobroker cloud

### 3.1.10 (2022-06-22)

- (@GermanBluefox) Added translations

### 3.1.9 (2022-06-20)

- (@GermanBluefox) Allowed working behind reverse proxy

### 3.1.7 (2022-06-19)

- (@GermanBluefox) Added file select dialog

### 3.1.3 (2022-06-13)

- (@GermanBluefox) Added table with resized headers

### 3.1.2 (2022-06-09)

- (@GermanBluefox) Added new document icon (read only)

### 3.1.1 (2022-06-09)

- (@GermanBluefox) Allowed working behind reverse proxy

### 3.1.0 (2022-06-07)

- (@GermanBluefox) Some german texts were corrected

### 3.0.17 (2022-06-03)

- (@GermanBluefox) Allowed calling getAdapterInstances not for admin too

### 3.0.15 (2022-06-01)

- (@GermanBluefox) Updated JsonConfigComponent: password, table

### 3.0.14 (2022-05-25)

- (@GermanBluefox) Added ConfigGeneric to import

### 3.0.7 (2022-05-25)

- (@GermanBluefox) Made the module definitions

### 3.0.6 (2022-05-25)

- (@GermanBluefox) Added JsonConfigComponent

### 2.1.11 (2022-05-24)

- (@GermanBluefox) Update file browser. It supports now the file changed events.

### 2.1.10 (2022-05-24)

- (@GermanBluefox) Corrected object browser

### 2.1.9 (2022-05-16)

- (@GermanBluefox) Corrected expert mode in object browser

### 2.1.7 (2022-05-09)

- (@GermanBluefox) Changes were synchronized with adapter-react-v5
- (@GermanBluefox) Added `I18n.disableWarning` method

### 2.1.6 (2022-03-28)

- (@GermanBluefox) Added `log` method to connection
- (@GermanBluefox) Corrected translations

### 2.1.1 (2022-03-27)

- (@GermanBluefox) Corrected error in TreeTable

### 2.1.0 (2022-03-26)

- (@GermanBluefox) BREAKING_CHANGE: Corrected error with readFile(base64=false)

### 2.0.0 (2022-03-26)

- (@GermanBluefox) Initial version

### 0.1.0 (2022-03-23)

- (@GermanBluefox) Fixed theme errors

### 0.0.4 (2022-03-22)

- (@GermanBluefox) Fixed eslint warnings

### 0.0.3 (2022-03-19)

- (@GermanBluefox) beta version

### 0.0.2 (2022-02-24)

- (@GermanBluefox) try to publish a first version

### 0.0.1 (2022-02-24)

- initial commit

## License

The MIT License (MIT)

Copyright © 2019-2026 @GermanBluefox <dogafox@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
