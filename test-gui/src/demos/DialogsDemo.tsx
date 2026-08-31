import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { Warning as IconWarning } from '@mui/icons-material';

import type { AdminConnection } from '@iobroker/socket-client';

import {
    DialogComplexCron,
    DialogConfirm,
    DialogCron,
    DialogError,
    DialogMessage,
    DialogSelectFile,
    DialogSelectID,
    DialogSimpleCron,
    DialogTextInput,
    type IobTheme,
    type ThemeName,
    type ThemeType,
} from '../../../src';
import DemoCard, { DemoPage } from './DemoCard';

type DialogName =
    'confirm' | 'message' | 'error' | 'textInput' | 'cron' | 'simpleCron' | 'complexCron' | 'selectId' | 'selectFile';

interface DialogsDemoProps {
    theme: IobTheme;
    themeName: ThemeName;
    themeType: ThemeType;
    socket: AdminConnection;
}

export default function DialogsDemo(props: DialogsDemoProps): React.JSX.Element {
    const { theme, themeName, themeType, socket } = props;
    const [open, setOpen] = useState<DialogName | ''>('');
    const [result, setResult] = useState<Record<string, string>>({});

    const close = (name: DialogName, value: string): void => {
        setResult({ ...result, [name]: value });
        setOpen('');
    };

    const openButton = (name: DialogName, label: string): React.JSX.Element => (
        <Button
            variant="contained"
            onClick={() => setOpen(name)}
        >
            {label}
        </Button>
    );

    return (
        <DemoPage>
            <DemoCard
                title="DialogConfirm"
                hint="yes/no question with an optional icon"
                value={result.confirm}
            >
                {openButton('confirm', 'Open confirm')}
            </DemoCard>

            <DemoCard
                title="DialogMessage"
                hint="simple message with one OK button"
                value={result.message}
            >
                {openButton('message', 'Open message')}
            </DemoCard>

            <DemoCard
                title="DialogError"
                hint="message in the error styling"
                value={result.error}
            >
                {openButton('error', 'Open error')}
            </DemoCard>

            <DemoCard
                title="DialogTextInput"
                hint="prompt for a single text value"
                value={result.textInput}
            >
                {openButton('textInput', 'Open text input')}
            </DemoCard>

            <DemoCard
                title="DialogCron"
                hint="wizard, simple and complex cron in one dialog"
                value={result.cron}
            >
                {openButton('cron', 'Open cron')}
            </DemoCard>

            <DemoCard
                title="DialogSimpleCron"
                hint="only the simple cron editor"
                value={result.simpleCron}
            >
                {openButton('simpleCron', 'Open simple cron')}
            </DemoCard>

            <DemoCard
                title="DialogComplexCron"
                hint="only the complex cron editor"
                value={result.complexCron}
            >
                {openButton('complexCron', 'Open complex cron')}
            </DemoCard>

            <DemoCard
                title="DialogSelectID"
                hint="the object browser as a dialog (needs the socket)"
                value={result.selectId}
            >
                {openButton('selectId', 'Select object ID')}
            </DemoCard>

            <DemoCard
                title="DialogSelectFile"
                hint="the file browser as a dialog (needs the socket)"
                value={result.selectFile}
            >
                {openButton('selectFile', 'Select file')}
            </DemoCard>

            {open === 'confirm' ? (
                <DialogConfirm
                    title="Delete the object?"
                    text="This cannot be undone."
                    icon={<IconWarning />}
                    onClose={ok => close('confirm', ok ? 'confirmed' : 'cancelled')}
                />
            ) : null}

            {open === 'message' ? (
                <DialogMessage
                    title="Message"
                    text="The configuration was saved."
                    onClose={() => close('message', 'closed')}
                />
            ) : null}

            {open === 'error' ? (
                <DialogError
                    title="Error"
                    text="Could not connect to the instance."
                    onClose={() => close('error', 'closed')}
                />
            ) : null}

            {open === 'textInput' ? (
                <DialogTextInput
                    titleText="New name"
                    promptText="Enter the name of the new object"
                    labelText="Name"
                    cancelText="Cancel"
                    applyText="Apply"
                    input={result.textInput || ''}
                    onClose={(text: string | null) => close('textInput', text === null ? 'cancelled' : text)}
                />
            ) : null}

            {open === 'cron' ? (
                <DialogCron
                    theme={theme}
                    cron={result.cron || '0 * * * *'}
                    onOk={cron => close('cron', cron)}
                    onClose={() => setOpen('')}
                />
            ) : null}

            {open === 'simpleCron' ? (
                <DialogSimpleCron
                    cron={result.simpleCron || '0 * * * *'}
                    onOk={cron => close('simpleCron', cron)}
                    onClose={() => setOpen('')}
                />
            ) : null}

            {open === 'complexCron' ? (
                <DialogComplexCron
                    cron={result.complexCron || '0 * * * *'}
                    onOk={cron => close('complexCron', cron || '')}
                    onClose={() => setOpen('')}
                />
            ) : null}

            {open === 'selectId' ? (
                <DialogSelectID
                    imagePrefix="../.."
                    theme={theme}
                    themeName={themeName}
                    themeType={themeType}
                    socket={socket}
                    dialogName="demo"
                    title="Select an object"
                    selected={result.selectId}
                    onOk={selected => close('selectId', Array.isArray(selected) ? selected.join(', ') : selected || '')}
                    onClose={() => setOpen('')}
                />
            ) : null}

            {open === 'selectFile' ? (
                <DialogSelectFile
                    imagePrefix="../.."
                    theme={theme}
                    themeName={themeName}
                    themeType={themeType}
                    socket={socket}
                    dialogName="demo"
                    title="Select a file"
                    selected={result.selectFile}
                    onOk={selected =>
                        close('selectFile', Array.isArray(selected) ? selected.join(', ') : selected || '')
                    }
                    onClose={() => setOpen('')}
                />
            ) : null}

            <Box
                component="div"
                sx={{ flexBasis: '100%' }}
            />
        </DemoPage>
    );
}
