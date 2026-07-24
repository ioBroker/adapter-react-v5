/**
 * Copyright 2024-2026 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 * Example of a build script for an adapter GUI that uses `@iobroker/gui-components`.
 * Copy this file into the root of your adapter as `tasks.ts`.
 *
 * The GUI sources are expected in the `src` directory and are built with vite
 * into `src/build` (see `build.outDir` in `src/vite.config.ts`).
 * The result is copied into the `admin` directory of the adapter.
 *
 * It is executed directly by node (>= 22.18 / >= 23.6), which strips the types at load time,
 * so it must stay CommonJS and use only erasable TypeScript syntax: the `typeof import(...)`
 * annotations provide full typings while `require()` keeps `__dirname` available.
 */
'use strict';

const fs: typeof import('node:fs') = require('node:fs');
const {
    deleteFoldersRecursive,
    npmInstall,
    buildReact,
    copyFiles,
}: typeof import('@iobroker/build-tools') = require('@iobroker/build-tools');

const SRC = 'src';

/** Inline script in index.html that loads socket.io from the admin instance */
const SOCKET_IO_LOADER =
    /<script>\s*(?:var|const|let)\s+script\s*=\s*document\.createElement\(["']script["']\)[\s\S]*?<\/script>/;

function copyAllFiles(): void {
    deleteFoldersRecursive('admin', ['.png', '.json', 'i18n']);

    copyFiles([`${SRC}/build/**/*`, `!${SRC}/build/**/*.map`], 'admin');
}

function clean(): void {
    deleteFoldersRecursive('admin', ['.png', '.json', 'i18n']);
    deleteFoldersRecursive(`${SRC}/build`);
}

function installNpmLocal(): Promise<void> {
    if (fs.existsSync(`${SRC}/node_modules`)) {
        return Promise.resolve();
    }
    return npmInstall(`${__dirname.replace(/\\/g, '/')}/${SRC}/`);
}

/**
 * In the development mode socket.io is loaded from the admin instance on port 8081.
 * In the production build it must be loaded from the admin instance that serves the GUI.
 */
function patchFiles(): void {
    for (const file of [`${__dirname}/admin/index.html`, `${__dirname}/${SRC}/build/index.html`]) {
        if (fs.existsSync(file)) {
            const code = fs.readFileSync(file).toString('utf8');
            fs.writeFileSync(
                file,
                code.replace(
                    SOCKET_IO_LOADER,
                    `<script type="text/javascript" src="./../../lib/js/socket.io.js"></script>`,
                ),
            );
        }
    }
}

if (process.argv.find(arg => arg === '--0-clean')) {
    clean();
} else if (process.argv.find(arg => arg === '--1-npm')) {
    npmInstall(`${__dirname.replace(/\\/g, '/')}/${SRC}/`).catch((e: unknown) => {
        console.error(`Cannot install: ${e}`);
        process.exit(1);
    });
} else if (process.argv.find(arg => arg === '--2-build')) {
    buildReact(SRC, { rootDir: __dirname, vite: true }).catch((e: unknown) => {
        console.error(`Cannot build: ${e}`);
        process.exit(1);
    });
} else if (process.argv.find(arg => arg === '--3-copy')) {
    copyAllFiles();
} else if (process.argv.find(arg => arg === '--4-patch')) {
    patchFiles();
} else {
    clean();

    installNpmLocal()
        .then(() => buildReact(SRC, { rootDir: __dirname, vite: true }))
        .then(() => copyAllFiles())
        .then(() => patchFiles());
}
