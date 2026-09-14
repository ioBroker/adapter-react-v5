import React, { Component } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    LinearProgress,
    List,
    ListItemButton,
    ListItemText,
    TextField,
} from '@mui/material';

import { Close as CloseIcon, Clear as ClearIcon } from '@mui/icons-material';

import { Icon } from './Icon';
import { Utils } from './Utils';
import { getClassicIconTemplates } from './IconLibrary/classicIcons';
import { getIconLibraryName, getIconLibrarySvg, isIconLibraryMatch, loadIconLibrary } from './IconLibrary/iconLibrary';
import type { IconLibraryCategory, IconLibraryItem } from './IconLibrary/types';
import type { Translate } from '../types';

const styles: Record<string, any> = {
    dialogPaper: {
        height: '80vh',
    },
    title: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        columnGap: 3,
    },
    filter: {
        flexGrow: 1,
        minWidth: 160,
    },
    content: {
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        p: 0,
        overflow: 'hidden',
    },
    categories: (theme: any) => ({
        width: { xs: '100%', sm: 230 },
        maxHeight: { xs: 150, sm: 'none' },
        flexShrink: 0,
        overflowY: 'auto',
        borderRight: { xs: 0, sm: `1px solid ${theme.palette.divider}` },
        borderBottom: { xs: `1px solid ${theme.palette.divider}`, sm: 0 },
    }),
    count: {
        fontSize: 12,
        opacity: 0.6,
        marginLeft: 8,
    },
    icons: {
        flexGrow: 1,
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
        alignContent: 'start',
        gap: 0.5,
        p: 1,
    },
    iconButton: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        gap: 0.5,
        minWidth: 0,
        p: 1,
        textTransform: 'none',
    },
    icon: {
        width: 32,
        height: 32,
        flexShrink: 0,
    },
    iconName: {
        fontSize: 11,
        lineHeight: 1.2,
        textAlign: 'center',
        wordBreak: 'break-word',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
    },
    empty: {
        gridColumn: '1 / -1',
        textAlign: 'center',
        opacity: 0.6,
        p: 3,
    },
};

/** Shown if the icon library cannot be loaded */
const FALLBACK_CATEGORIES: IconLibraryCategory[] = [
    { id: 'classic-rooms', builtin: true, name: { en: 'Rooms' } },
    { id: 'classic-devices', builtin: true, name: { en: 'Devices' } },
];

export interface IconObject {
    icon?: string;
    src?: string;
    href?: string;
    name?: ioBroker.StringOrTranslated;
    _id?: string;
}

export type IconSelectorIcon = IconObject | string;

interface IconSelectorProps {
    /** Own icons. If set, only these icons are offered instead of the icon library */
    icons?: IconSelectorIcon[];
    /** Open the icon library with the rooms (default) */
    onlyRooms?: boolean;
    /** Open the icon library with the lighting icons */
    onlyDevices?: boolean;
    onSelect?: (icon: string) => void; // one of onSelect or onChange are required
    onChange?: (icon: string) => void;
    t: Translate;
    lang: ioBroker.Languages;
}

/** An icon as it is shown in the dialog */
interface ShownIcon {
    key: string;
    name: string;
    /** SVG path of an icon of the library */
    path?: string;
    /** URL or data URL of a classic or own icon */
    src?: string;
}

interface IconSelectorState {
    opened: boolean;
    filter: string;
    loading: boolean;
    category: string;
    categories: IconLibraryCategory[] | null;
    libraryIcons: IconLibraryItem[] | null;
    /** Classic room and device icons by category */
    classicIcons: Record<string, ShownIcon[]> | null;
    /** Icons given in `props.icons` */
    ownIcons: ShownIcon[] | null;
}

export class IconSelector extends Component<IconSelectorProps, IconSelectorState> {
    constructor(props: IconSelectorProps) {
        super(props);

        this.state = {
            opened: false,
            filter: '',
            loading: false,
            category: props.onlyDevices ? 'lighting' : 'rooms',
            categories: null,
            libraryIcons: null,
            classicIcons: null,
            ownIcons: null,
        };
    }

    private getText(name: ioBroker.StringOrTranslated | undefined, fallback: string): string {
        if (name && typeof name === 'object') {
            return name[this.props.lang] || name.en || fallback;
        }
        return name || fallback;
    }

    private getClassicIcons(): Record<string, ShownIcon[]> {
        const result: Record<string, ShownIcon[]> = {};
        const types: ['classic-rooms' | 'classic-devices', 'rooms' | 'devices'][] = [
            ['classic-rooms', 'rooms'],
            ['classic-devices', 'devices'],
        ];
        for (const [category, type] of types) {
            const shown: string[] = [];
            result[category] = getClassicIconTemplates(type)
                .map((template, i) => ({
                    key: `${type}-${i}`,
                    name: this.getText(template.name, template._id),
                    src: template.icon,
                }))
                .filter(icon => {
                    // some templates share the icon and the name
                    const id = `${icon.src}|${icon.name}`;
                    if (shown.includes(id)) {
                        return false;
                    }
                    shown.push(id);
                    return true;
                });
        }
        return result;
    }

    private async readOwnIcons(icons: IconSelectorIcon[]): Promise<ShownIcon[]> {
        const result = await Promise.all(
            icons.map(async (item, i): Promise<ShownIcon> => {
                let href: string;
                let name = '';
                if (typeof item === 'object') {
                    href = item.icon || item.src || item.href || '';
                    name = this.getText(item.name, item._id || '');
                    if (!name) {
                        const parts = href.split('.');
                        parts.pop();
                        name = parts[parts.length - 1] || '';
                    }
                } else {
                    href = item;
                }
                let src = href;
                if (href && !href.startsWith('data:')) {
                    try {
                        src = await Utils.getSvg(href);
                    } catch (error) {
                        console.error(`Cannot load the icon "${href}":`, error);
                    }
                }
                return { key: `own-${i}`, name, src };
            }),
        );
        return result.filter(icon => icon.src);
    }

    private open(): void {
        this.setState({ opened: true }, () => {
            if (this.state.loading) {
                return;
            }
            if (this.props.icons) {
                if (!this.state.ownIcons) {
                    this.setState({ loading: true }, async () => {
                        const ownIcons = await this.readOwnIcons(this.props.icons || []);
                        this.setState({ ownIcons, loading: false });
                    });
                }
            } else if (!this.state.categories) {
                this.setState(
                    { loading: true, classicIcons: this.state.classicIcons || this.getClassicIcons() },
                    async () => {
                        try {
                            const library = await loadIconLibrary();
                            this.setState({
                                categories: library.categories,
                                libraryIcons: library.icons,
                                loading: false,
                            });
                        } catch (error) {
                            console.error('Cannot load the icon library:', error);
                            this.setState({
                                categories: FALLBACK_CATEGORIES,
                                libraryIcons: [],
                                category: FALLBACK_CATEGORIES[0].id,
                                loading: false,
                            });
                        }
                    },
                );
            }
        });
    }

    private select(icon: ShownIcon): void {
        const value = icon.path ? getIconLibrarySvg(icon.path) : icon.src || '';
        this.setState({ opened: false }, () => (this.props.onSelect || this.props.onChange)?.(value));
    }

    private getShownIcons(): ShownIcon[] {
        const filter = this.state.filter.trim().toLowerCase();

        if (this.props.icons) {
            const ownIcons = this.state.ownIcons || [];
            return filter ? ownIcons.filter(icon => icon.name.toLowerCase().includes(filter)) : ownIcons;
        }

        const toShown = (icon: IconLibraryItem): ShownIcon => ({
            key: icon.id,
            name: getIconLibraryName(icon, this.props.lang),
            path: icon.p,
        });
        const libraryIcons = this.state.libraryIcons || [];
        const classicIcons = this.state.classicIcons || {};

        if (filter) {
            return [
                ...libraryIcons.filter(icon => isIconLibraryMatch(icon, filter, this.props.lang)).map(toShown),
                ...([] as ShownIcon[])
                    .concat(...Object.values(classicIcons))
                    .filter(icon => icon.name.toLowerCase().includes(filter)),
            ];
        }
        if (classicIcons[this.state.category]) {
            return classicIcons[this.state.category];
        }
        return libraryIcons.filter(icon => icon.c === this.state.category).map(toShown);
    }

    private getCount(category: IconLibraryCategory): number {
        if (category.builtin) {
            return this.state.classicIcons?.[category.id]?.length || 0;
        }
        return (this.state.libraryIcons || []).filter(icon => icon.c === category.id).length;
    }

    private renderIcon(icon: ShownIcon): React.JSX.Element {
        return (
            <Button
                key={icon.key}
                color="grey"
                title={icon.name}
                sx={styles.iconButton}
                onClick={() => this.select(icon)}
            >
                {icon.path ? (
                    <svg
                        viewBox="0 0 24 24"
                        style={styles.icon}
                    >
                        <path
                            fill="currentColor"
                            d={icon.path}
                        />
                    </svg>
                ) : (
                    <Icon
                        src={icon.src}
                        style={styles.icon}
                    />
                )}
                <span style={styles.iconName}>{icon.name}</span>
            </Button>
        );
    }

    private renderCategories(): React.JSX.Element | null {
        const categories = this.state.categories;
        if (this.props.icons || !categories) {
            return null;
        }
        return (
            <List
                dense
                sx={styles.categories}
            >
                {categories.map(category => (
                    <ListItemButton
                        key={category.id}
                        selected={!this.state.filter && category.id === this.state.category}
                        onClick={() => this.setState({ category: category.id, filter: '' })}
                    >
                        <ListItemText primary={getIconLibraryName(category, this.props.lang)} />
                        <span style={styles.count}>{this.getCount(category)}</span>
                    </ListItemButton>
                ))}
            </List>
        );
    }

    private renderDialog(): React.JSX.Element {
        const icons = this.getShownIcons();

        return (
            <Dialog
                open={!0}
                maxWidth="md"
                fullWidth
                onClose={() => this.setState({ opened: false })}
                sx={{ '& .MuiDialog-paper': styles.dialogPaper }}
            >
                <DialogTitle sx={styles.title}>
                    <span>{this.props.t('ra_Select predefined icon')}</span>
                    <TextField
                        variant="standard"
                        margin="dense"
                        autoFocus
                        sx={styles.filter}
                        value={this.state.filter}
                        onChange={e => this.setState({ filter: e.target.value })}
                        placeholder={this.props.t('ra_Filter')}
                        slotProps={{
                            input: {
                                endAdornment: this.state.filter ? (
                                    <IconButton
                                        tabIndex={-1}
                                        size="small"
                                        onClick={() => this.setState({ filter: '' })}
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                ) : undefined,
                            },
                        }}
                    />
                </DialogTitle>
                {this.state.loading ? <LinearProgress /> : null}
                <DialogContent
                    dividers
                    sx={styles.content}
                >
                    {this.renderCategories()}
                    <Box sx={styles.icons}>
                        {icons.map(icon => this.renderIcon(icon))}
                        {!this.state.loading && !icons.length ? (
                            <Box sx={styles.empty}>{this.props.t('ra_No icons found')}</Box>
                        ) : null}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="grey"
                        variant="contained"
                        onClick={() => this.setState({ opened: false })}
                        startIcon={<CloseIcon />}
                    >
                        {this.props.t('ra_Close')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    render(): React.JSX.Element {
        return (
            <>
                <Button
                    color="grey"
                    variant="outlined"
                    title={this.props.t('ra_Select predefined icon')}
                    onClick={() => this.open()}
                    style={{ minWidth: 40, marginRight: 8 }}
                >
                    ...
                </Button>
                {this.state.opened ? this.renderDialog() : null}
            </>
        );
    }
}
