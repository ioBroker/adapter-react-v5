/**
 * Copyright 2018-2026 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 */
// This script is executed directly by node (>= 22.18 / >= 23.6), which strips the types at load time.
// It therefore must stay CommonJS and use only erasable TypeScript syntax:
// `typeof import(...)` annotations give full typings while `require()` keeps `__dirname` available.
const { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync }: typeof import('node:fs') = require('node:fs');
const { copyFiles, deleteFoldersRecursive }: typeof import('@iobroker/build-tools') = require('@iobroker/build-tools');
const { dirname }: typeof import('node:path') = require('node:path');

function patchFiles(): void {
    const pack: { version: string } = require('./package.json');
    let readme = readFileSync(`${__dirname}/README.md`).toString('utf8');
    readme = readme.replace(
        /"@iobroker\/gui-components": "\^\d+\.\d+\.\d+",/g,
        `"@iobroker/gui-components": "^${pack.version}",`,
    );
    writeFileSync(`${__dirname}/README.md`, readme);
}

function createIconSets(folder: string, destFile: string): void {
    const files = readdirSync(folder).filter(file => file.endsWith('.svg'));
    const result: Record<string, string> = {};
    for (let f = 0; f < files.length; f++) {
        const data = readFileSync(`${folder}/${files[f]}`).toString('utf8');
        result[files[f].replace('.svg', '')] = Buffer.from(data).toString('base64');
    }
    existsSync(dirname(destFile)) || mkdirSync(dirname(destFile), { recursive: true });
    writeFileSync(destFile, JSON.stringify(result));
}

/**
 * Check that the `DeviceType` component is in sync with the `Types` enum of `@iobroker/type-detector`.
 *
 * Every type-detector release may add device types. Without this check they silently reach the UI as a
 * bare first letter with the raw translation key as a label, because `DeviceTypeIcon` falls back to
 * `type[0].toUpperCase()` and `DeviceTypeSelector` labels every entry with `I18n.t('type-' + id)`.
 */
function checkDeviceTypes(): void {
    const { Types }: typeof import('@iobroker/type-detector') = require('@iobroker/type-detector');
    const folder = `${__dirname}/src/Components/DeviceType`;
    const typeIds: string[] = Object.keys(Types);
    const errors: string[] = [];

    // 1. Every type must have an icon in `TYPE_ICONS`.
    //    `tsc` already enforces this, as `TYPE_ICONS` is a complete `Record<TypesExtended, ...>`, but a
    //    single `@ts-expect-error` inside the object literal silently disables that check for the whole
    //    object - which is exactly how ten types once lost their icon.
    const iconSource = readFileSync(`${folder}/DeviceTypeIcon.tsx`).toString('utf8');
    const iconStart = iconSource.indexOf('const TYPE_ICONS');
    const iconEnd = iconSource.indexOf('\n};', iconStart);
    if (iconStart === -1 || iconEnd === -1) {
        errors.push('DeviceTypeIcon.tsx: cannot find the TYPE_ICONS map - please adapt this check');
    } else {
        const block = iconSource.substring(iconStart, iconEnd);
        if (block.includes('@ts-expect-error')) {
            errors.push(
                'DeviceTypeIcon.tsx: "@ts-expect-error" inside TYPE_ICONS disables the completeness check ' +
                    'for the whole map. Move the entry to ROLE_ICONS instead.',
            );
        }
        const mapped: string[] = [];
        for (const line of block.split('\n')) {
            if (line.trim().startsWith('//')) {
                continue;
            }
            const match = /\[Types\.(\w+)\]/.exec(line);
            if (match) {
                mapped.push(match[1]);
            }
        }
        for (const id of typeIds) {
            if (!mapped.includes(id)) {
                errors.push(`DeviceTypeIcon.tsx: no icon for the device type "${id}"`);
            }
        }
    }

    // 2. Every language file must be loaded, otherwise none of its translations is ever used
    const loaderSource = readFileSync(`${folder}/deviceTypeTranslations.ts`).toString('utf8');
    const languages = readdirSync(`${folder}/i18n`)
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));

    for (const lang of languages) {
        if (!loaderSource.includes(`./i18n/${lang}.json`)) {
            errors.push(`deviceTypeTranslations.ts: "${lang}.json" is never imported, so it is never used`);
        }
    }

    // 3. Every language must name every type, and must not name types that no longer exist
    for (const lang of languages) {
        const words: Record<string, string> = JSON.parse(readFileSync(`${folder}/i18n/${lang}.json`).toString('utf8'));
        const translated = Object.keys(words)
            .filter(key => key.startsWith('type-'))
            .map(key => key.substring('type-'.length))
            .filter(id => id !== 'Device type');

        for (const id of typeIds) {
            if (!translated.includes(id)) {
                errors.push(`i18n/${lang}.json: no name for the device type "${id}"`);
            }
        }
        for (const id of translated) {
            if (!typeIds.includes(id)) {
                errors.push(`i18n/${lang}.json: "type-${id}" names a device type that no longer exists`);
            }
        }
        for (const key of Object.keys(words)) {
            if (!words[key] || !words[key].trim()) {
                errors.push(`i18n/${lang}.json: "${key}" is empty`);
            }
        }
    }

    if (errors.length) {
        console.error(`Found ${errors.length} problem(s) in src/Components/DeviceType:\n`);
        for (const error of errors) {
            console.error(`  - ${error}`);
        }
        console.error(
            '\nA new "@iobroker/type-detector" version normally causes this. Add an icon in ' +
                'DeviceTypeIcon.tsx and a name in every src/Components/DeviceType/i18n/*.json.',
        );
        process.exit(1);
    }

    console.log(
        `Device types OK: all ${typeIds.length} types have an icon and a name in all ${languages.length} languages`,
    );
}

function copyAllFiles(): void {
    try {
        !existsSync('build') && mkdirSync('build');
        copyFiles(['src/*.d.ts'], 'build');
        copyFiles(['src/Components/ObjectBrowser/types.d.ts'], 'build/Components/ObjectBrowser');
        copyFiles(
            ['src/assets/lamp_ceiling.svg', 'src/assets/lamp_table.svg', 'src/assets/no_icon.svg'],
            'build/assets',
        );
        copyFiles(['src/i18n/*.json'], 'i18n');
        copyFiles(['src/index.css'], './');
        // copyFiles(['README.md', 'LICENSE'], 'build');
        // copyFileSync('tasksExample.ts', 'build/tasks.ts');
        copyFiles(['src/*.css'], 'build');
        // copyFiles(['craco-module-federation.js'], 'build');
        // copyFiles(['modulefederation.admin.config.js'], 'build');
        // copyFiles(['src/*/*.tsx', 'src/*/*.css', '!src/assets/devices/parseNames.js'], 'build/src');
        // copyFiles(['src/*.tsx', 'src/*.css'], 'build/src');
        // copyFiles(['src/i18n/*.json'], 'build/i18n');
    } catch (e) {
        console.error(`Cannot copy files: ${e}`);
        process.exit(1);
    }
}

if (process.argv.find(arg => arg === '--0-clean')) {
    deleteFoldersRecursive('build');
} else if (process.argv.find(arg => arg === '--2-copy')) {
    createIconSets('src/assets/devices', 'src/assets/devices.json');
    createIconSets('src/assets/rooms', 'src/assets/rooms.json');
    copyAllFiles();
} else if (process.argv.find(arg => arg === '--3-patchReadme')) {
    patchFiles();
} else if (process.argv.find(arg => arg === '--check-device-types')) {
    checkDeviceTypes();
} else {
    deleteFoldersRecursive('build');
    createIconSets('src/assets/devices', 'build/assets/devices.json');
    createIconSets('src/assets/rooms', 'build/assets/rooms.json');
    copyAllFiles();
    patchFiles();
}
