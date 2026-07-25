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
} else {
    deleteFoldersRecursive('build');
    createIconSets('src/assets/devices', 'build/assets/devices.json');
    createIconSets('src/assets/rooms', 'build/assets/rooms.json');
    copyAllFiles();
    patchFiles();
}
