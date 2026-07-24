# Migration from adapter-react-v5@8.x to gui-components@9.x

Version 9 is the first release under the new package name `@iobroker/gui-components`.
Together with the rename, the peer dependencies were lifted to **React 19** and **MUI 9**, and the
long-deprecated `LegacyConnection` was removed.

If you cannot migrate to React 19 / MUI 9 yet, stay on `@iobroker/adapter-react-v5@8.x`.
That version is maintained on the `adapter-react-v5` branch and still works with React 18 / MUI 6.

## 1. Package renamed

`@iobroker/adapter-react-v5` => `@iobroker/gui-components`

The exported API (except the points below) is unchanged, so in most cases a search and replace of the
package name is enough.

`package.json`:

```json
{
    "dependencies": {
        "@iobroker/gui-components": "^9.0.0"
    }
}
```

All imports:

```ts
// before
import { GenericApp, I18n, Loader } from '@iobroker/adapter-react-v5';
// after
import { GenericApp, I18n, Loader } from '@iobroker/gui-components';
```

If you use module federation, the shared list delivered by this package already contains the new name.
Only the import of the helper itself must be adapted:

```js
// before
const { moduleFederationShared } = require('@iobroker/adapter-react-v5/modulefederation.admin.config');
// after
const { moduleFederationShared } = require('@iobroker/gui-components/modulefederation.admin.config');
```

The GitHub repository moved too: https://github.com/ioBroker/gui-components

## 2. React 19 and MUI 9 are required

The peer dependencies changed:

| Package               | 8.x       | 9.x       |
| --------------------- | --------- | --------- |
| `react`               | `^18.3.1` | `^19.0.0` |
| `react-dom`           | `^18.3.1` | `^19.0.0` |
| `@mui/material`       | `^6.5.0`  | `^9.0.0`  |
| `@mui/icons-material` | `^6.5.0`  | `^9.0.0`  |

Update them together with `@types/react` and `@types/react-dom` (`^19.x`). If your build still pins
React 18 somewhere in the tree, add an `overrides` section, otherwise two React copies will be bundled
and hooks will crash:

```json
{
    "overrides": {
        "react": "^19.2.5",
        "react-dom": "^19.2.5",
        "@types/react": "^19.2.0",
        "@types/react-dom": "^19.2.0"
    }
}
```

`create-react-app` / `react-scripts` does not support React 19. If your adapter GUI is still built with
`react-scripts`, migrate the build to **Vite** (see the "Getting started" chapter of the [README](README.md)).

### React 19 typing changes

`React.createRef()` and `useRef()` now include `null` in the ref type:

```tsx
// before
private readonly myRef: React.RefObject<HTMLDivElement> = React.createRef();
// after
private readonly myRef: React.RefObject<HTMLDivElement | null> = React.createRef();
```

`forwardRef` is no longer necessary — `ref` is a normal prop of function components now. Existing
`forwardRef` code keeps working, so this is optional.

Additionally React 19 removed `propTypes` and `defaultProps` for function components, string refs, and
the legacy context API. If your adapter still uses them, they must be replaced.

## 3. MUI 9 changes

### `Grid2` => `Grid`

`Grid2` was removed. The former `Grid2` is now simply `Grid` (the old v1 grid does not exist anymore).

```tsx
// before
import { Grid2 } from '@mui/material';
<Grid2 size={{ xs: 6, sm: 4 }}>...</Grid2>;
// after
import { Grid } from '@mui/material';
<Grid size={{ xs: 6, sm: 4 }}>...</Grid>;
```

### `Grid` supports only rows

`direction="column"` and `direction="column-reverse"` are not supported anymore. Use `Stack` or a plain
flex `Box` for vertical layouts:

```tsx
// before
<Grid2 container direction="column" wrap="nowrap">{children}</Grid2>
// after
<Box sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap' }}>{children}</Box>
```

The same applies inside this library: `TabContainer` renders a `Box` now instead of a column grid. Its
own props did not change.

### Layout props of `Grid` moved to `sx`

`alignItems`, `justifyContent` and friends are not props of `Grid` anymore:

```tsx
// before
<Grid2 container alignItems="center">...</Grid2>
// after
<Grid container sx={{ alignItems: 'center' }}>...</Grid>
```

### `slotProps` everywhere

The remaining `*Props` escape hatches were removed in favor of `slotProps`. In v7 this was already true
for `inputProps` / `InputProps`; in v9 the rest follows, e.g. `ContentProps` of `Snackbar`:

```tsx
// before
<Snackbar ContentProps={{ 'aria-describedby': 'message-id' }} />
// after
<Snackbar slotProps={{ content: { 'aria-describedby': 'message-id' } }} />
```

```tsx
// before
<Checkbox inputProps={{ 'aria-label': 'checkbox' }} />
<TextField inputProps={{ style: { color: '#FFF' } }} />
// after
<Checkbox slotProps={{ input: { 'aria-label': 'checkbox' } }} />
<TextField slotProps={{ htmlInput: { style: { color: '#FFF' } } }} />
```

Note the difference for `TextField`: `input` addresses the MUI input component, `htmlInput` the native
`<input>` element.

### `Dialog`

`disableEscapeKeyDown` was removed. Closing by `ESC` is reported via `onClose(event, 'escapeKeyDown')`,
so ignore that reason if you want to prevent it.

### `Select` value typing

The value of `Select` is typed properly now, so the casts in the change handler can be dropped:

```tsx
// before
<Select value={mode} onChange={e => onModeChange(e.target.value as SimpleCronType)} />
// after
<Select value={mode} onChange={e => onModeChange(e.target.value)} />
```

If the value is a number, `e.target.value` is a number now, too — a `parseInt(e.target.value, 10)` on it
does not compile anymore.

## 4. `LegacyConnection` was removed

`LegacyConnection` (the ~3700 lines old socket implementation) is gone. Use `Connection` or
`AdminConnection`, which are re-exported from `@iobroker/socket-client`:

```ts
// before
import { LegacyConnection } from '@iobroker/adapter-react-v5';
const socket = new LegacyConnection({ ... });
// after
import { AdminConnection } from '@iobroker/gui-components';
const socket = new AdminConnection({ ... });
```

In `GenericApp` the property `Connection` does not accept `LegacyConnection` anymore:

```ts
extendedProps.Connection = AdminConnection;
```

The symbols that used to come from `LegacyConnection.tsx` are still exported by this package, only from
another source:

| Export                                   | 8.x                    | 9.x                                          |
| ---------------------------------------- | ---------------------- | -------------------------------------------- |
| `PROGRESS`, `ERRORS`, `PERMISSION_ERROR` | `LegacyConnection.tsx` | `Connection.tsx` (`@iobroker/socket-client`) |
| `ConnectOptions`, `SocketClient`         | `LegacyConnection.tsx` | re-export of `@iobroker/socket-client`       |
| `BinaryStateChangeHandler`               | `LegacyConnection.tsx` | re-export of `@iobroker/socket-client`       |
| `pattern2RegEx`                          | `LegacyConnection.tsx` | `Components/objectBrowserUtils.tsx`          |

All of them are still imported from the package root, so no code change is required:

```ts
import { PROGRESS, pattern2RegEx, type SocketClient } from '@iobroker/gui-components';
```

Only `CompactSystemRepository` and `CompactSystemRepositoryEntry` are not exported anymore, as
`@iobroker/socket-client` does not export them publicly. If you need the type, derive it from the method:

```ts
import type { AdminConnection } from '@iobroker/gui-components';

type CompactSystemRepository = Awaited<ReturnType<AdminConnection['getCompactSystemRepositories']>>;
```

## 5. Checklist

- [ ] Replace `@iobroker/adapter-react-v5` with `@iobroker/gui-components` in `package.json` and all imports
- [ ] Update React to 19, MUI to 9, `@types/react(-dom)` to 19 (and `overrides`, if needed)
- [ ] Replace `react-scripts` build by Vite
- [ ] `Grid2` => `Grid`, column grids => `Box`/`Stack`, layout props => `sx`
- [ ] `inputProps` / `InputProps` / `ContentProps` => `slotProps`
- [ ] `React.RefObject<T>` => `React.RefObject<T | null>`
- [ ] Replace `LegacyConnection` by `Connection` / `AdminConnection`
- [ ] `npm run lint` and a full build to catch the rest
