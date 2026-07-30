import React, { type JSX } from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    Divider,
    Drawer,
    IconButton,
    InputAdornment,
    LinearProgress,
    Link,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Add,
    Backup,
    Code,
    DarkMode,
    Dns,
    Extension,
    ExpandMore,
    Folder,
    GridView,
    HelpOutlined,
    Info,
    ListAlt,
    Logout,
    Memory,
    MoreVert,
    NotificationsNone,
    Person,
    PlayArrow,
    Refresh,
    Search,
    Settings,
    Storage,
    Subject,
    Timeline,
    Tune,
} from '@mui/icons-material';

import type { IobTheme } from '../../src/types';

/**
 * Accent colors of the dashboard widgets (stat tiles, chart lines).
 * They are intentionally NOT part of the theme palette - the theme itself is blue only.
 */
const ACCENT_PURPLE = '#8B5CF6';

const NAVIGATION: { label: string; icon: JSX.Element; sub?: boolean }[] = [
    { label: 'Übersicht', icon: <GridView /> },
    { label: 'Adapter', icon: <Extension /> },
    { label: 'Instanzen', icon: <ListAlt /> },
    { label: 'Objekte', icon: <Storage /> },
    { label: 'Zustände', icon: <Timeline /> },
    { label: 'Skripte', icon: <Code /> },
    { label: 'Szenen', icon: <GridView /> },
    { label: 'Benutzer', icon: <Person /> },
    { label: 'Hosts', icon: <Dns /> },
    { label: 'Dateien', icon: <Folder /> },
    { label: 'Backup', icon: <Backup /> },
    { label: 'Protokolle', icon: <Subject /> },
    { label: 'Einstellungen', icon: <Settings /> },
    { label: 'System', icon: <Tune />, sub: true },
];

const SYSTEM_INFO: { name: string; value: string }[] = [
    { name: 'Plattform', value: 'linux' },
    { name: 'Architektur', value: 'x64' },
    { name: 'Node.js', value: '18.20.2' },
    { name: 'NPM', value: '10.5.0' },
    { name: 'Betriebszeit', value: '2 Tage, 14:32:18' },
];

const ADAPTERS: { name: string; version: string; title: string; instances: number; color: string }[] = [
    { name: 'admin', version: '6.17.17', title: 'Verwaltung und Überwachung', instances: 1, color: '#3B82F6' },
    { name: 'alexa2', version: '3.24.2', title: 'Amazon Alexa Adapter', instances: 1, color: '#22D3EE' },
    { name: 'backitup', version: '2.6.17', title: 'Backup Adapter', instances: 1, color: '#22C55E' },
    { name: 'devices', version: '1.1.5', title: 'Geräte Adapter', instances: 1, color: '#A855F7' },
    { name: 'javascript', version: '7.0.3', title: 'Skripting und Automatisierung', instances: 2, color: '#F59E0B' },
    { name: 'mqtt', version: '5.2.0', title: 'MQTT Client/Server', instances: 1, color: '#EF4444' },
    { name: 'telegram', version: '3.0.1', title: 'Telegram Bot Adapter', instances: 1, color: '#38BDF8' },
    { name: 'vis', version: '1.5.6', title: 'Visualisierung', instances: 1, color: '#8B5CF6' },
    { name: 'web', version: '6.2.5', title: 'Web-Server', instances: 1, color: '#14B8A6' },
];

const LOG: { time: string; severity: 'info' | 'warn'; message: string }[] = [
    { time: '10:24:31', severity: 'info', message: 'instance system.adapter.admin.0 started with pid 12345' },
    { time: '10:30:30', severity: 'info', message: 'instance system.adapter.javascript.0 started with pid 12344' },
    {
        time: '10:24:30',
        severity: 'warn',
        message: 'State "system.host.ioBroker.memHeapUsed" has no existing object',
    },
    { time: '10:24:29', severity: 'info', message: 'All instances are alive' },
    { time: '10:24:28', severity: 'info', message: 'ioBroker is started' },
    { time: '10:24:28', severity: 'info', message: 'starting. Version 7.0.0 in /opt/iobroker, node: v18.20.2' },
];

/** Deterministic "random" values, so the chart does not jump on every render */
function series(seed: number, base: number, amplitude: number, drift: number, count: number): number[] {
    const values: number[] = [];
    let value = base;
    for (let i = 0; i < count; i++) {
        const noise = Math.sin(seed + i * 1.7) * 0.5 + Math.sin(seed * 2.3 + i * 0.6) * 0.5;
        value = base + drift * i + noise * amplitude;
        values.push(value);
    }
    return values;
}

function toPath(values: number[], width: number, height: number, min: number, max: number): string {
    return values
        .map((v, i) => {
            const x = (i / (values.length - 1)) * width;
            const y = height - ((v - min) / (max - min)) * height;
            return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ');
}

function Chart({ theme }: { theme: IobTheme }): JSX.Element {
    const width = 640;
    const height = 220;
    const cpu = series(1, 12, 5, 0.02, 60);
    const ram = series(4, 66, 4, 0.18, 60);

    return (
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: 'text.secondary',
                    height,
                    pb: 2,
                }}
            >
                <span>%</span>
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="none"
                    style={{ width: '100%', height }}
                >
                    {[0, 0.25, 0.5, 0.75, 1].map(k => (
                        <line
                            key={k}
                            x1={0}
                            x2={width}
                            y1={k * height}
                            y2={k * height}
                            stroke={theme.palette.divider}
                            strokeWidth={1}
                        />
                    ))}
                    <path
                        d={toPath(ram, width, height, 0, 100)}
                        fill="none"
                        stroke={ACCENT_PURPLE}
                        strokeWidth={2}
                        strokeLinejoin="round"
                    />
                    <path
                        d={toPath(cpu, width, height, 0, 100)}
                        fill="none"
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        strokeLinejoin="round"
                    />
                </svg>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'text.secondary' }}>
                    <span>-60 min</span>
                    <span>-45 min</span>
                    <span>-30 min</span>
                    <span>-15 min</span>
                    <span>Jetzt</span>
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: 'text.secondary',
                    height,
                    pb: 2,
                }}
            >
                <span>GB</span>
                <span>8</span>
                <span>6</span>
                <span>4</span>
                <span>2</span>
                <span>0</span>
            </Box>
        </Box>
    );
}

function StatCard(props: {
    title: string;
    value: string;
    hint: string;
    color: string;
    valueColor?: string;
    icon: JSX.Element;
}): JSX.Element {
    return (
        <Card sx={{ flex: '1 1 220px', p: 2.5 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(props.color, 0.16),
                        color: props.color,
                        flexShrink: 0,
                    }}
                >
                    {props.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {props.title}
                    </Typography>
                    <Typography sx={{ fontSize: 30, fontWeight: 700, color: props.valueColor, lineHeight: 1.2 }}>
                        {props.value}
                    </Typography>
                </Box>
            </Box>
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1.5 }}
            >
                {props.hint}
            </Typography>
        </Card>
    );
}

function CardTitle(props: { title: string; action?: string }): JSX.Element {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>{props.title}</Typography>
            {props.action ? (
                <Link
                    href="#"
                    underline="none"
                    sx={{ fontSize: '0.8125rem' }}
                    onClick={e => e.preventDefault()}
                >
                    {props.action}
                </Link>
            ) : null}
        </Box>
    );
}

export default function ThemeDemo({ theme }: { theme: IobTheme }): JSX.Element {
    const [page, setPage] = React.useState<string>('Übersicht');
    const [tab, setTab] = React.useState<number>(0);

    return (
        <Box
            sx={{
                display: 'flex',
                height: '100%',
                backgroundColor: 'background.default',
                color: 'text.primary',
                fontFamily: theme.typography.fontFamily,
            }}
        >
            <Drawer
                variant="permanent"
                sx={{ '& .MuiDrawer-paper': { position: 'relative', width: 232, overflow: 'hidden' } }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, height: 64 }}>
                        <Box
                            sx={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                border: '2px solid',
                                borderColor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Box sx={{ width: 3, height: 12, borderRadius: 2, backgroundColor: 'primary.main' }} />
                        </Box>
                        <Typography sx={{ fontSize: '1.05rem', fontWeight: 600 }}>ioBroker</Typography>
                    </Box>

                    <List sx={{ px: 1.5, flex: 1, overflowY: 'auto' }}>
                        {NAVIGATION.map(item => (
                            <ListItemButton
                                key={item.label}
                                selected={page === item.label}
                                onClick={() => setPage(item.label)}
                                sx={{ mb: 0.25 }}
                            >
                                <ListItemIcon sx={{ '& svg': { fontSize: 19 } }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.label} />
                                {item.sub ? <ExpandMore sx={{ fontSize: 18, opacity: 0.6 }} /> : null}
                            </ListItemButton>
                        ))}
                    </List>

                    <Divider />
                    <Box sx={{ display: 'flex', gap: 0.5, px: 1.5, py: 1 }}>
                        <Tooltip title="Theme wechseln">
                            <IconButton size="small">
                                <DarkMode sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                        <IconButton size="small">
                            <NotificationsNone sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton size="small">
                            <HelpOutlined sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton size="small">
                            <Logout sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5 }}>
                        <Avatar sx={{ width: 34, height: 34, backgroundColor: alpha(theme.palette.primary.main, 0.2) }}>
                            <Person sx={{ fontSize: 20, color: 'primary.main' }} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>admin</Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Administrator
                            </Typography>
                        </Box>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'success.main' }} />
                    </Box>
                </Box>
            </Drawer>

            <Box sx={{ flex: 1, minWidth: 0, overflowY: 'auto', p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                    <Box>
                        <Typography sx={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                            Übersicht
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Systemüberblick und Status
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            ioBroker
                        </Typography>
                        <Typography variant="body2">v7.0.0</Typography>
                        <Chip
                            size="small"
                            label="Aktuell"
                            color="success"
                        />
                        <IconButton size="small">
                            <MoreVert sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <StatCard
                        title="Systemstatus"
                        value="OK"
                        valueColor={theme.palette.success.main}
                        hint="ioBroker läuft stabil"
                        color={theme.palette.success.main}
                        icon={<Memory />}
                    />
                    <StatCard
                        title="Adapter"
                        value="128"
                        hint="56 aktiv / 72 inaktiv"
                        color={theme.palette.primary.main}
                        icon={<Extension />}
                    />
                    <StatCard
                        title="Instanzen"
                        value="167"
                        hint="142 aktiv / 25 inaktiv"
                        color={ACCENT_PURPLE}
                        icon={<Timeline />}
                    />
                    <StatCard
                        title="Objekte"
                        value="45.278"
                        hint="Zuletzt aktualisiert: jetzt"
                        color={theme.palette.warning.main}
                        icon={<Storage />}
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <Card sx={{ flex: '1 1 340px', p: 2.5 }}>
                        <CardTitle title="Systeminformationen" />
                        {SYSTEM_INFO.map(row => (
                            <Box
                                key={row.name}
                                sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {row.name}
                                </Typography>
                                <Typography variant="body2">{row.value}</Typography>
                            </Box>
                        ))}
                        {[
                            { name: 'Speicher', value: '2.1 GB / 7.7 GB (27%)', percent: 27 },
                            { name: 'CPU', value: '12%', percent: 12 },
                        ].map(row => (
                            <Box
                                key={row.name}
                                sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ width: 80 }}
                                >
                                    {row.name}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={row.percent}
                                    sx={{ flex: 1, maxWidth: 160 }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{ flex: 1, textAlign: 'right' }}
                                >
                                    {row.value}
                                </Typography>
                            </Box>
                        ))}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Last (1m / 5m / 15m)
                            </Typography>
                            <Typography variant="body2">0.12 / 0.09 / 0.07</Typography>
                        </Box>
                    </Card>

                    <Card sx={{ flex: '2 1 460px', p: 2.5 }}>
                        <CardTitle title="Ressourcenverbrauch" />
                        <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
                            {[
                                { label: 'CPU (%)', color: theme.palette.primary.main },
                                { label: 'Speicher (GB)', color: ACCENT_PURPLE },
                            ].map(legend => (
                                <Box
                                    key={legend.label}
                                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                >
                                    <Box sx={{ width: 14, height: 2, backgroundColor: legend.color }} />
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {legend.label}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                        <Chart theme={theme} />
                    </Card>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    <Card sx={{ flex: '1 1 340px', p: 2.5 }}>
                        <CardTitle
                            title="Aktive Adapter"
                            action="Alle anzeigen"
                        />
                        {ADAPTERS.slice(0, 5).map(adapter => (
                            <Box
                                key={adapter.name}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    py: 1,
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: '50%',
                                        backgroundColor: alpha(adapter.color, 0.2),
                                        border: `1px solid ${alpha(adapter.color, 0.5)}`,
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{ flex: 1 }}
                                >
                                    {adapter.name}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    v{adapter.version}
                                </Typography>
                                <Chip
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                    label="Aktiv"
                                />
                            </Box>
                        ))}
                    </Card>

                    <Card sx={{ flex: '2 1 460px', p: 2.5 }}>
                        <CardTitle
                            title="Systemprotokoll"
                            action="Alle anzeigen"
                        />
                        {LOG.map((line, i) => (
                            <Box
                                key={i}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.9 }}
                            >
                                <Box
                                    sx={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: '50%',
                                        backgroundColor:
                                            line.severity === 'warn'
                                                ? theme.palette.warning.main
                                                : theme.palette.success.main,
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                    {line.time}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: line.severity === 'warn' ? 'warning.main' : 'text.secondary',
                                        width: 30,
                                    }}
                                >
                                    {line.severity}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ whiteSpace: 'nowrap' }}
                                >
                                    host.ioBroker
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                >
                                    {line.message}
                                </Typography>
                            </Box>
                        ))}
                    </Card>
                </Box>

                <Card sx={{ p: 0, overflow: 'hidden' }}>
                    <Box sx={{ px: 2.5, pt: 2 }}>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>Adapter</Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Verwalten und installieren
                        </Typography>
                    </Box>
                    <Tabs
                        value={tab}
                        onChange={(_e, v) => setTab(v)}
                        sx={{ px: 2.5, mt: 1 }}
                    >
                        <Tab label="INSTALLIERT" />
                        <Tab label="VERFÜGBAR" />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    UPDATES
                                    <Chip
                                        size="small"
                                        color="primary"
                                        label="3"
                                    />
                                </Box>
                            }
                        />
                    </Tabs>

                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', p: 2.5, flexWrap: 'wrap' }}>
                        <TextField
                            size="small"
                            placeholder="Suche Adapter"
                            sx={{ width: 240 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search sx={{ fontSize: 18 }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <TextField
                            size="small"
                            select
                            label="Kategorie"
                            value="all"
                            sx={{ width: 140 }}
                        >
                            <MenuItem value="all">Alle</MenuItem>
                            <MenuItem value="general">Allgemein</MenuItem>
                        </TextField>
                        <TextField
                            size="small"
                            select
                            label="Sortierung"
                            value="name"
                            sx={{ width: 180 }}
                        >
                            <MenuItem value="name">Name (A-Z)</MenuItem>
                            <MenuItem value="date">Datum</MenuItem>
                        </TextField>
                        <Box sx={{ flex: 1 }} />
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                        >
                            Adapter installieren
                        </Button>
                    </Box>

                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Beschreibung</TableCell>
                                <TableCell align="center">Instanzen</TableCell>
                                <TableCell>Version</TableCell>
                                <TableCell align="right">Aktionen</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ADAPTERS.map(adapter => (
                                <TableRow key={adapter.name}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: '50%',
                                                    backgroundColor: alpha(adapter.color, 0.2),
                                                    border: `1px solid ${alpha(adapter.color, 0.5)}`,
                                                }}
                                            />
                                            {adapter.name}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>{adapter.title}</TableCell>
                                    <TableCell align="center">{adapter.instances}</TableCell>
                                    <TableCell>{adapter.version}</TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                            <IconButton size="small">
                                                <PlayArrow sx={{ fontSize: 18, color: 'primary.main' }} />
                                            </IconButton>
                                            <IconButton size="small">
                                                <Refresh sx={{ fontSize: 18 }} />
                                            </IconButton>
                                            <IconButton size="small">
                                                <Info sx={{ fontSize: 18 }} />
                                            </IconButton>
                                            <IconButton size="small">
                                                <MoreVert sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </Box>
        </Box>
    );
}
