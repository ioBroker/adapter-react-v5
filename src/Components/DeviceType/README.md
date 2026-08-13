# Device type selector and the type icon components

This folder contains the `DeviceTypeSelector` and `DeviceTypeIcon` components,
which are used to select and display types in the application.

The `DeviceTypeSelector` component allows users to select a type from a list, while the `DeviceTypeIcon` component displays the selected type.

Types are used from [`type-detector`](https://github.com/ioBroker/ioBroker.type-detector).

## Structure

| File                         | Content                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `DeviceTypeSelector.tsx`     | Select box with all device types, sorted alphabetically in the current language |
| `DeviceTypeIcon.tsx`         | `TYPE_ICONS` (icon per type), `ROLE_ICONS` (icon per state role) and the icon component |
| `DeviceTypeOptions.tsx`      | `STATES_NAME_ICONS` — icon per state name of a device (`ACTUAL`, `SET`, `UNREACH`, ...) |
| `deviceTypeTranslations.ts`  | Loads `i18n/*.json` into `I18n` on demand                                       |
| `i18n/*.json`                | The `type-*` names, one file per language                                       |
| `icons/`                     | The ioBroker-specific SVG icons (the rest comes from `react-icons`)             |

## Adding a device type

Every release of `@iobroker/type-detector` may add new members to the `Types` enum. Each of them
needs **two** things here, otherwise it reaches the user interface as a bare first letter with the
raw translation key as a label:

1. **An icon** — a new entry in `TYPE_ICONS` in `DeviceTypeIcon.tsx`.
2. **A name** — a `type-<id>` key in **every** `i18n/*.json` file.

Both are checked automatically:

```bash
npm run check-device-types
```

The check also runs in CI. It reports missing icons, missing and empty names, names that are left
over for types that no longer exist, and language files that are not imported by
`deviceTypeTranslations.ts`.

### `TYPE_ICONS` must stay complete

`TYPE_ICONS` is typed as a complete `Record<TypesExtended, ...>`, so `tsc` fails as long as a device
type has no icon. Do not add keys that are not part of `TypesExtended` to it — a single
`@ts-expect-error` inside the object literal suppresses the completeness check for the **whole**
object, which is how ten types once lost their icons. State roles that may be passed as `src`
(for example `sensor.alarm.fire`) belong to `ROLE_ICONS` instead.

### Adding a language

Add the `<lang>.json` file to `i18n/` **and** import it in `deviceTypeTranslations.ts`. A file that
is not imported there is never loaded, so none of its translations is ever used.

## Usage

```tsx
<DeviceTypeSelector
    themeType={themeType}
    value={type}
    onChange={newType => setType(newType)}
/>
```

`DeviceTypeIcon` accepts either a device type or, via `src`, a device type or a state role:

```tsx
<DeviceTypeIcon type={Types.thermostat} title />
<DeviceTypeIcon src="sensor.alarm.fire" />
```

With `title={true}` the translated type name is shown as a tooltip.
