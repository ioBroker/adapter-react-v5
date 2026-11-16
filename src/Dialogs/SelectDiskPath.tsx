/*
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 *
 */
import React, { type JSX } from 'react';

import {
    Box,
    Breadcrumbs,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    LinearProgress,
    Link,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    ArrowUpward as IconUp,
    ChevronRight as IconEnter,
    Computer as IconDrives,
    Folder as IconDir,
    InsertDriveFileOutlined as IconFileEntry,
    Search as IconSearch,
} from '@mui/icons-material';

import type { Connection } from '@iobroker/socket-client';

import { I18n } from '../i18n';
import { Utils } from '../Components/Utils';
import { IconRefresh } from '../Components/AnimatedIcons/IconRefresh';

/** The feature flag of js-controller for the host command `readDiskDir` */
const FEATURE = 'CONTROLLER_READ_DISK_DIR';

/** How long to wait for the answer of the host */
const TIMEOUT_MS = 15_000;

/** The error of the socket server, if the user may not send the command */
const PERMISSION_ERROR = 'permissionError';

/** One entry of a listed directory, as the host answers it */
export interface DiskDirEntry {
    name: string;
    /** Absolute path on the host */
    path: string;
    isDir: boolean;
    /** Only files */
    size?: number;
    /** Time of the last modification in ms */
    mtime?: number;
}

/** The answer of the host command `readDiskDir` of js-controller */
export interface DiskDirAnswer {
    error?: string;
    /** The resolved root, `''` for the drives on Windows */
    root: string;
    /** The listed directory, `''` for the drives on Windows */
    path: string;
    /** `null` at the root */
    parent: string | null;
    crumbs: { name: string; path: string }[];
    entries: DiskDirEntry[];
    /** Name of the file the requested path pointed to */
    selected?: string;
    truncated?: boolean;
    sep: string;
}

/** The hosts that can list their disk: asked once per host */
const supportedHosts: Record<string, boolean> = {};

const styles: Record<string, React.CSSProperties> = {
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        minHeight: 40,
    },
    crumbs: {
        flexGrow: 1,
        overflow: 'hidden',
    },
    crumb: {
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        whiteSpace: 'nowrap',
    },
    list: {
        height: 'min(55vh, 520px)',
        overflowY: 'auto',
        padding: 0,
    },
    hint: {
        padding: 16,
        opacity: 0.7,
    },
    selected: {
        flexGrow: 1,
        fontFamily: 'monospace',
        fontSize: 13,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        paddingLeft: 16,
        paddingRight: 8,
        opacity: 0.8,
    },
    entryText: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
};

const noPointerEvents = { popper: { sx: { pointerEvents: 'none' } } };

export interface DialogSelectDiskPathProps {
    /** Socket connection, the user needs the permission for `cmdExec` */
    socket: Connection;
    /** The host whose disk is shown, e.g. `myHost` (the `common.host` of an instance) */
    host: string;
    /** `file` (default) selects a file, `folder` a folder */
    mode?: 'file' | 'folder';
    /** The path to start in: a folder, or a file to start in its folder with this file selected. Empty: the root */
    selected?: string;
    /** The user cannot leave this folder. Empty: the whole disk */
    root?: string;
    /** Only the files matching this pattern are shown, e.g. `*.json`. Not used in the folder mode */
    pattern?: string;
    /** Show hidden files and folders (whose names start with a dot) */
    showHidden?: boolean;
    /** The instance that asks, e.g. `myAdapter.0`. The host writes it into its log */
    instance?: string;
    /** The dialog title; default: Select file / Select folder (translated) */
    title?: string;
    /** The text of the select button; default: Select (translated) */
    ok?: string;
    /** The cancel button text; default: Cancel (translated) */
    cancel?: string;
    /** The z-index of the dialog; default: 1300 */
    zIndex?: number;
    /** Called with the absolute path, when the user selects a file or a folder. `onClose` is called too */
    onOk: (path: string) => void;
    /** Called always when the dialog is closed */
    onClose: () => void;
}

interface DialogSelectDiskPathState {
    /** The listed directory */
    dir: DiskDirAnswer | null;
    loading: boolean;
    /** Why the directory could not be listed */
    error: string;
    /** The clicked entry. None: in the folder mode the listed folder is selected */
    selected: DiskDirEntry | null;
    /** Shows only the entries of the listed directory that contain this text */
    quickFilter: string;
}

/**
 * Selects a file or a folder on the disk of an ioBroker host.
 *
 * The host lists the directories (`sendToHost('readDiskDir')` of js-controller), as the user ioBroker runs as: what
 * this user may not read is not shown. The socket server lets only users with the permission for `cmdExec` send it.
 * The host needs a js-controller with the feature `CONTROLLER_READ_DISK_DIR`, otherwise the dialog says so.
 */
export class DialogSelectDiskPath extends React.Component<DialogSelectDiskPathProps, DialogSelectDiskPathState> {
    /** Only the answer to the last request is shown, if the user clicks faster than the host answers */
    private requestId = 0;

    constructor(props: DialogSelectDiskPathProps) {
        super(props);
        this.state = {
            dir: null,
            loading: false,
            error: '',
            selected: null,
            quickFilter: '',
        };
    }

    componentDidMount(): void {
        void this.readDir((this.props.selected || '').trim());
    }

    componentWillUnmount(): void {
        // an answer that still comes is not shown anymore
        this.requestId++;
    }

    isFolderMode(): boolean {
        return this.props.mode === 'folder';
    }

    /**
     * Send an event to the socket server and wait for its answer, at most {@link TIMEOUT_MS}
     *
     * @param event name of the event, e.g. `sendToHost`
     * @param args the arguments before the callback
     */
    emit<T>(event: string, ...args: any[]): Promise<T[]> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS);
            this.props.socket.getRawSocket().emit(event, ...args, (...result: T[]) => {
                clearTimeout(timer);
                resolve(result);
            });
        });
    }

    /**
     * Throws a message to show, if the host cannot list its disk
     *
     * @param host the host to ask
     */
    async checkSupported(host: string): Promise<void> {
        if (supportedHosts[host]) {
            return;
        }
        let supported: boolean | undefined;
        try {
            const [error, isSupported] = await this.emit<any>('checkFeatureSupportedByHost', host, FEATURE);
            if (!error) {
                supported = !!isSupported;
            }
        } catch {
            // no answer
        }
        if (supported === undefined) {
            throw new Error(I18n.t('ra_Host "%s" is offline or does not answer', host));
        }
        if (!supported) {
            throw new Error(I18n.t('ra_Host "%s" cannot list its disk. Update js-controller on this host', host));
        }
        supportedHosts[host] = true;
    }

    /**
     * List a directory of the host and show it
     *
     * @param path absolute path of the directory, or of a file to list its directory. Empty: the root
     */
    async readDir(path: string): Promise<void> {
        const requestId = ++this.requestId;
        this.setState({ loading: true });

        let dir: DiskDirAnswer | null = null;
        let error = '';
        try {
            const host = this.props.host;
            if (!host) {
                throw new Error(I18n.t('ra_The host is unknown'));
            }
            await this.checkSupported(host);
            const [answer] = await this.emit<DiskDirAnswer>('sendToHost', host, 'readDiskDir', {
                root: this.props.root || '',
                path,
                dirsOnly: this.isFolderMode(),
                filter: this.isFolderMode() ? undefined : this.props.pattern,
                showHidden: !!this.props.showHidden,
                instance: this.props.instance,
            });
            if (answer?.error === PERMISSION_ERROR) {
                throw new Error(I18n.t('ra_You have no permission to read the disk of the host'));
            }
            if (!answer || !Array.isArray(answer.entries)) {
                throw new Error(answer?.error || I18n.t('ra_No answer from the host'));
            }
            if (answer.error) {
                error = I18n.t('ra_Cannot read the folder: %s', answer.error);
            }
            dir = answer;
        } catch (e) {
            error =
                e instanceof Error && e.message === 'timeout'
                    ? I18n.t('ra_Host "%s" is offline or does not answer', this.props.host)
                    : e instanceof Error
                      ? e.message
                      : String(e);
        }

        if (requestId !== this.requestId) {
            return;
        }

        // the file of the current value
        const selected = (dir?.selected && dir.entries.find(entry => entry.name === dir.selected)) || null;
        this.setState({ loading: false, dir, error, selected, quickFilter: '' });
    }

    /**
     * What the button "Select" takes: the clicked entry, or in the folder mode the listed folder.
     * A folder in the file mode is opened instead.
     */
    getSelection(): { path: string; open?: boolean } | null {
        const selected = this.state.selected;
        if (selected) {
            return { path: selected.path, open: selected.isDir && !this.isFolderMode() };
        }
        if (this.isFolderMode() && this.state.dir?.path && !this.state.error) {
            return { path: this.state.dir.path };
        }
        return null;
    }

    select(path: string): void {
        this.props.onOk(path);
        this.props.onClose();
    }

    /**
     * A double click opens a folder and takes a file, like in the file dialogs of the operating systems
     *
     * @param entry the double-clicked entry
     */
    onEntryDoubleClick(entry: DiskDirEntry): void {
        if (entry.isDir) {
            void this.readDir(entry.path);
        } else {
            this.select(entry.path);
        }
    }

    renderCrumbs(): JSX.Element {
        const dir = this.state.dir;
        if (!dir?.crumbs?.length) {
            return <div style={styles.crumbs} />;
        }
        return (
            <Breadcrumbs
                style={styles.crumbs}
                maxItems={6}
                itemsBeforeCollapse={1}
                itemsAfterCollapse={4}
            >
                {dir.crumbs.map((crumb, i) => {
                    const last = i === dir.crumbs.length - 1;
                    // on Windows the list of drives is above the drives
                    const label = crumb.path ? (
                        // the root can be long: its last part, the whole path is the title
                        i === 0 && dir.root ? (
                            crumb.name.split(dir.sep).filter(Boolean).pop() || crumb.name
                        ) : (
                            crumb.name
                        )
                    ) : (
                        <>
                            <IconDrives fontSize="small" />
                            {I18n.t('ra_Drives')}
                        </>
                    );
                    if (last) {
                        return (
                            <Typography
                                key={crumb.path}
                                component="span"
                                color="text.primary"
                                style={styles.crumb}
                                title={crumb.path}
                            >
                                {label}
                            </Typography>
                        );
                    }
                    return (
                        <Link
                            key={crumb.path}
                            component="button"
                            underline="hover"
                            color="inherit"
                            style={styles.crumb}
                            title={crumb.path}
                            onClick={() => this.readDir(crumb.path)}
                        >
                            {label}
                        </Link>
                    );
                })}
            </Breadcrumbs>
        );
    }

    renderEntry(entry: DiskDirEntry): JSX.Element {
        const details: string[] = [];
        if (!entry.isDir && entry.size !== undefined) {
            details.push(Utils.formatBytes(entry.size));
        }
        if (entry.mtime) {
            details.push(new Date(entry.mtime).toLocaleString());
        }

        return (
            <ListItemButton
                key={entry.path}
                dense
                selected={entry.path === this.state.selected?.path}
                onClick={() => this.setState({ selected: entry })}
                onDoubleClick={() => this.onEntryDoubleClick(entry)}
            >
                <ListItemIcon style={{ minWidth: 36 }}>
                    {entry.isDir ? <IconDir color="primary" /> : <IconFileEntry />}
                </ListItemIcon>
                <ListItemText
                    primary={entry.name}
                    secondary={details.join(' · ') || undefined}
                    slotProps={{
                        primary: { style: styles.entryText },
                        secondary: { style: styles.entryText },
                    }}
                />
                {/* opens the folder with one click */}
                {entry.isDir ? (
                    <Tooltip
                        title={I18n.t('ra_Open')}
                        slotProps={noPointerEvents}
                    >
                        <IconButton
                            size="small"
                            edge="end"
                            onClick={e => {
                                e.stopPropagation();
                                void this.readDir(entry.path);
                            }}
                        >
                            <IconEnter />
                        </IconButton>
                    </Tooltip>
                ) : null}
            </ListItemButton>
        );
    }

    renderList(): JSX.Element {
        const dir = this.state.dir;
        if (!dir) {
            return <div style={styles.list} />;
        }
        const quickFilter = this.state.quickFilter.toLowerCase();
        const entries = quickFilter
            ? dir.entries.filter(entry => entry.name.toLowerCase().includes(quickFilter))
            : dir.entries;

        let hint: string | null = null;
        if (!dir.entries.length && !this.state.error) {
            hint = I18n.t('ra_The folder is empty');
        } else if (!entries.length && quickFilter) {
            hint = I18n.t('ra_All items are filtered out');
        }

        return (
            <List style={styles.list}>
                {entries.map(entry => this.renderEntry(entry))}
                {hint ? <div style={styles.hint}>{hint}</div> : null}
                {dir.truncated ? (
                    <div style={styles.hint}>
                        {I18n.t('ra_Only the first %s entries are shown', dir.entries.length)}
                    </div>
                ) : null}
            </List>
        );
    }

    render(): JSX.Element {
        const selection = this.getSelection();
        const title = this.props.title || I18n.t(this.isFolderMode() ? 'ra_Select folder' : 'ra_Select file');

        return (
            <Dialog
                open={!0}
                maxWidth="md"
                fullWidth
                style={{ zIndex: this.props.zIndex || undefined }}
                onClose={() => this.props.onClose()}
            >
                <DialogTitle>
                    {title}
                    <Typography
                        component="span"
                        style={{ marginLeft: 8, opacity: 0.6, fontSize: 'smaller' }}
                    >
                        {this.props.host}
                    </Typography>
                </DialogTitle>
                <DialogContent style={{ paddingBottom: 0 }}>
                    <div style={styles.toolbar}>
                        <Tooltip
                            title={I18n.t('ra_One level up')}
                            slotProps={noPointerEvents}
                        >
                            <span>
                                <IconButton
                                    size="small"
                                    disabled={this.state.dir?.parent === null || this.state.dir?.parent === undefined}
                                    onClick={() => this.readDir(this.state.dir?.parent || '')}
                                >
                                    <IconUp />
                                </IconButton>
                            </span>
                        </Tooltip>
                        {this.renderCrumbs()}
                        <TextField
                            variant="standard"
                            size="small"
                            style={{ width: 160 }}
                            value={this.state.quickFilter}
                            placeholder={I18n.t('ra_Filter')}
                            onChange={e => this.setState({ quickFilter: e.target.value })}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconSearch fontSize="small" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <Tooltip
                            title={I18n.t('ra_Refresh')}
                            slotProps={noPointerEvents}
                        >
                            <span>
                                <IconButton
                                    size="small"
                                    disabled={this.state.loading}
                                    onClick={() => this.readDir(this.state.dir?.path || '')}
                                >
                                    <IconRefresh
                                        loading={this.state.loading}
                                        showDone={false}
                                    />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </div>
                    <Box style={{ height: 4 }}>{this.state.loading ? <LinearProgress /> : null}</Box>
                    {this.state.error ? (
                        <Typography
                            color="error"
                            style={{ padding: '8px 0' }}
                        >
                            {this.state.error}
                        </Typography>
                    ) : null}
                    {this.renderList()}
                </DialogContent>
                <DialogActions>
                    <div
                        style={styles.selected}
                        title={selection?.path}
                    >
                        {selection?.path}
                    </div>
                    <Button
                        variant="contained"
                        disabled={!selection || this.state.loading}
                        onClick={() => {
                            if (selection?.open) {
                                void this.readDir(selection.path);
                            } else if (selection) {
                                this.select(selection.path);
                            }
                        }}
                    >
                        {selection?.open ? I18n.t('ra_Open') : this.props.ok || I18n.t('ra_Select')}
                    </Button>
                    <Button
                        variant="contained"
                        color="grey"
                        onClick={() => this.props.onClose()}
                    >
                        {this.props.cancel || I18n.t('ra_Cancel')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
