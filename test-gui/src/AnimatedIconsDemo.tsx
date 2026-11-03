import React, { useEffect, useRef, useState } from 'react';

import { IconBell } from '../../src/Components/AnimatedIcons/IconBell';
import { IconConnectionState } from '../../src/Components/AnimatedIcons/IconConnectionState';
import { IconExpertMode } from '../../src/Components/AnimatedIcons/IconExpertMode';
import { IconFolder } from '../../src/Components/AnimatedIcons/IconFolder';
import { IconMenuArrow } from '../../src/Components/AnimatedIcons/IconMenuArrow';
import { IconPlayPause } from '../../src/Components/AnimatedIcons/IconPlayPause';
import { IconRefresh } from '../../src/Components/AnimatedIcons/IconRefresh';
import { IconResult } from '../../src/Components/AnimatedIcons/IconResult';
import { IconStatusLed } from '../../src/Components/AnimatedIcons/IconStatusLed';
import { IconTrash } from '../../src/Components/AnimatedIcons/IconTrash';

const css = `
.aid {
    --aid-bg: #0A0F1E; --aid-surface: #111933; --aid-raised: #18223F; --aid-line: rgba(126, 195, 243, 0.14);
    --aid-fg: #E6EEF7; --aid-muted: #8EA2BE; --aid-accent: #1D90CA; --aid-ink: #7EC3F3; --aid-hover: rgba(126, 195, 243, 0.1);
    --aid-display: 'Audiowide', 'Roboto', system-ui, sans-serif; --aid-body: 'Roboto', system-ui, sans-serif; --aid-mono: 'Roboto Mono', ui-monospace, Consolas, monospace;
    color-scheme: dark;
}
.aid-light {
    --aid-bg: #F3F6FA; --aid-surface: #FFFFFF; --aid-raised: #EAF0F7; --aid-line: rgba(0, 88, 148, 0.14);
    --aid-fg: #0F2236; --aid-muted: #55667D; --aid-accent: #1D90CA; --aid-ink: #005894; --aid-hover: rgba(0, 88, 148, 0.08);
    color-scheme: light;
}
@media (prefers-color-scheme: light) {
    :root:not([data-theme="dark"]) .aid-auto {
        --aid-bg: #F3F6FA; --aid-surface: #FFFFFF; --aid-raised: #EAF0F7; --aid-line: rgba(0, 88, 148, 0.14);
        --aid-fg: #0F2236; --aid-muted: #55667D; --aid-accent: #1D90CA; --aid-ink: #005894; --aid-hover: rgba(0, 88, 148, 0.08);
        color-scheme: light;
    }
}
:root[data-theme="light"] .aid-auto {
    --aid-bg: #F3F6FA; --aid-surface: #FFFFFF; --aid-raised: #EAF0F7; --aid-line: rgba(0, 88, 148, 0.14);
    --aid-fg: #0F2236; --aid-muted: #55667D; --aid-accent: #1D90CA; --aid-ink: #005894; --aid-hover: rgba(0, 88, 148, 0.08);
    color-scheme: light;
}

.aid { background: var(--aid-bg); color: var(--aid-fg); font: 400 15px/1.55 var(--aid-body); padding-block: 32px 96px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); box-sizing: border-box; min-height: 100%; }
.aid *, .aid *::before, .aid *::after { box-sizing: border-box; }
.aid-wrap { max-width: 1120px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; }
.aid-label { font: 500 12px/1.4 var(--aid-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--aid-ink); }
.aid-label::before { content: '// '; }

.aid-head { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px 32px; align-items: end; }
.aid-head h1 { font: 400 clamp(28px, 4.4vw, 44px)/1.1 var(--aid-display); margin: 6px 0 12px; letter-spacing: 0.01em; text-wrap: balance; }
.aid-head p { margin: 0; max-width: 62ch; color: var(--aid-muted); }
.aid-switch { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; color: var(--aid-fg); font-size: 14px; white-space: nowrap; }
.aid-switch input { width: 18px; height: 18px; accent-color: var(--aid-accent); margin: 0; }
@media (max-width: 640px) { .aid-head { grid-template-columns: minmax(0, 1fr); } }

.aid-ibtn { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: inherit; cursor: pointer; transition: background-color 0.15s; flex-shrink: 0; }
.aid-ibtn:hover { background: var(--aid-hover); }
.aid-ibtn:focus-visible, .aid-btn:focus-visible, .aid-chip:focus-visible { outline: 2px solid var(--aid-accent); outline-offset: 2px; }
.aid-btn { display: inline-flex; align-items: center; gap: 8px; min-height: 32px; padding: 4px 12px; border: 1px solid var(--aid-line); border-radius: 6px; background: var(--aid-surface); color: var(--aid-fg); font: 500 13px/1.2 var(--aid-body); cursor: pointer; transition: border-color 0.15s, background-color 0.15s; }
.aid-btn:hover { border-color: var(--aid-accent); }
.aid-btn[aria-pressed="true"] { background: var(--aid-accent); border-color: var(--aid-accent); color: #FFFFFF; }
.aid-badge { position: absolute; top: 3px; right: 2px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; background: #F44336; color: #FFFFFF; font: 600 11px/18px var(--aid-body); text-align: center; animation: aid-pop 0.3s cubic-bezier(0.3, 1.6, 0.5, 1); }
@keyframes aid-pop { from { transform: scale(0.3); } }
.aid-stage .aid-badge { top: 12px; right: 10px; min-width: 22px; height: 22px; border-radius: 11px; font-size: 12px; line-height: 22px; }

.aid-window { border: 1px solid var(--aid-line); border-radius: 12px; background: var(--aid-surface); overflow: hidden; }
.aid-bar { display: flex; align-items: center; gap: 4px; padding: 6px 8px; background: var(--aid-accent); color: #FFFFFF; }
.aid-bar-title { font: 400 15px/1 var(--aid-display); margin: 0 auto 0 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.aid-bar-title span { opacity: 0.7; }
.aid-main { display: flex; min-height: 260px; }
.aid-nav { width: 176px; flex-shrink: 0; border-right: 1px solid var(--aid-line); padding: 8px 0; transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; }
.aid-nav-closed { width: 52px; }
.aid-nav div { display: flex; align-items: center; gap: 14px; height: 38px; padding: 0 17px; white-space: nowrap; color: var(--aid-muted); font-size: 14px; }
.aid-nav div::before { content: ''; width: 18px; height: 18px; border-radius: 5px; background: currentColor; opacity: 0.35; flex-shrink: 0; }
.aid-nav .aid-nav-on { color: var(--aid-ink); background: var(--aid-hover); }
.aid-nav .aid-nav-on::before { opacity: 0.9; }
.aid-list { flex: 1; min-width: 0; display: flex; flex-direction: column; transition: opacity 0.3s; }
.aid-list-off { opacity: 0.45; }
.aid-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; align-items: center; gap: 4px 12px; padding: 6px 12px 6px 16px; border-bottom: 1px solid var(--aid-line); }
.aid-row-name { font: 500 14px/1.3 var(--aid-mono); }
.aid-row-sub { font-size: 12px; color: var(--aid-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.aid-row-btns { display: flex; }
.aid-scene-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 12px 16px; margin-top: auto; }
.aid-toast { display: inline-flex; align-items: center; gap: 8px; margin-left: auto; font-size: 13px; color: var(--aid-muted); min-height: 32px; }

.aid-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 16px; }
.aid-card { display: flex; flex-direction: column; min-width: 0; border: 1px solid var(--aid-line); border-radius: 12px; background: var(--aid-surface); overflow: hidden; transition: border-color 0.2s; }
.aid-card-picked { border-color: var(--aid-accent); }
.aid-stage { display: flex; align-items: center; justify-content: center; height: 132px; background: var(--aid-raised); color: var(--aid-fg); }
.aid-stage .aid-ibtn { width: 88px; height: 88px; }
.aid-card-body { display: flex; flex-direction: column; gap: 10px; padding: 16px; flex: 1; }
.aid-card h3 { margin: 0; font: 500 16px/1.3 var(--aid-mono); }
.aid-card p { margin: 0; color: var(--aid-muted); font-size: 14px; }
.aid-controls { display: flex; flex-wrap: wrap; gap: 6px; }
.aid-chip { width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--aid-surface); box-shadow: 0 0 0 1px var(--aid-line); cursor: pointer; padding: 0; }
.aid-chip[aria-pressed="true"] { box-shadow: 0 0 0 2px var(--aid-accent); }
.aid-code { margin: 0; padding: 8px 10px; border-radius: 6px; background: var(--aid-raised); font: 12px/1.5 var(--aid-mono); color: var(--aid-fg); white-space: pre-wrap; overflow-wrap: anywhere; }
.aid-pick-toggle { display: flex; align-items: center; gap: 8px; margin-top: auto; padding-top: 6px; font-size: 13px; cursor: pointer; }
.aid-pick-toggle input { width: 16px; height: 16px; accent-color: var(--aid-accent); margin: 0; }

.aid-pickbar { position: sticky; bottom: max(12px, env(safe-area-inset-bottom, 0px)); display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding: 10px 12px 10px 16px; border: 1px solid var(--aid-line); border-radius: 10px; background: var(--aid-surface); box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25); }
.aid-pickbar-text { flex: 1; min-width: 0; font-size: 14px; }
.aid-pickbar-text code { font-family: var(--aid-mono); font-size: 13px; color: var(--aid-ink); }
.aid-copyfield { width: 100%; font: 12px var(--aid-mono); padding: 6px 8px; border: 1px solid var(--aid-line); border-radius: 6px; background: var(--aid-raised); color: var(--aid-fg); }
`;

type ConnState = 'connected' | 'connecting' | 'disconnected';

interface SceneInstance {
    id: string;
    title: string;
    running: boolean;
    pending: boolean;
    connected: boolean;
    beat: number;
}

const SCENE_START: SceneInstance[] = [
    { id: 'javascript.0', title: 'Skripte', running: true, pending: false, connected: true, beat: 0 },
    { id: 'mqtt.0', title: 'MQTT Broker', running: true, pending: false, connected: false, beat: 0 },
    { id: 'history.0', title: 'Historie', running: false, pending: false, connected: false, beat: 0 },
];

const NAV = ['Übersicht', 'Adapter', 'Instanzen', 'Objekte', 'Protokolle'];

const PICK_KEY = 'iob-animated-icons-pick';

function ledColor(instance: SceneInstance): string {
    if (!instance.running) {
        return 'grey';
    }
    return instance.connected ? 'green' : 'orange';
}

function Scene(): React.JSX.Element {
    const [instances, setInstances] = useState<SceneInstance[]>(SCENE_START);
    const [navOpen, setNavOpen] = useState(true);
    const [notifications, setNotifications] = useState(2);
    const [loading, setLoading] = useState(false);
    const [connection, setConnection] = useState<ConnState>('connected');
    const [saveCount, setSaveCount] = useState(0);
    const [toast, setToast] = useState(false);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    const later = (cb: () => void, ms: number): void => {
        timers.current.push(setTimeout(cb, ms));
    };

    useEffect(() => {
        const list = timers.current;
        const interval = setInterval(
            () =>
                setInstances(all =>
                    all.map(i => (i.running && !i.pending && Math.random() < 0.75 ? { ...i, beat: i.beat + 1 } : i)),
                ),
            2000,
        );
        return () => {
            clearInterval(interval);
            list.forEach(t => clearTimeout(t));
        };
    }, []);

    const toggle = (id: string): void => {
        setInstances(all => all.map(i => (i.id === id ? { ...i, pending: true } : i)));
        later(
            () =>
                setInstances(all =>
                    all.map(i =>
                        i.id === id
                            ? { ...i, pending: false, running: !i.running, connected: !i.running && i.id !== 'mqtt.0' }
                            : i,
                    ),
                ),
            1200,
        );
    };

    const disconnect = (): void => {
        if (connection !== 'connected') {
            return;
        }
        setConnection('disconnected');
        later(() => setConnection('connecting'), 1400);
        later(() => setConnection('connected'), 3800);
    };

    const reload = (): void => {
        if (!loading) {
            setLoading(true);
            later(() => setLoading(false), 1600);
        }
    };

    const save = (): void => {
        setSaveCount(c => c + 1);
        setToast(true);
        later(() => setToast(false), 2600);
    };

    const offline = connection !== 'connected';

    return (
        <div className="aid-window">
            <div className="aid-bar">
                <button
                    type="button"
                    className="aid-ibtn"
                    aria-label={navOpen ? 'Menü einklappen' : 'Menü ausklappen'}
                    onClick={() => setNavOpen(!navOpen)}
                >
                    <IconMenuArrow open={navOpen} />
                </button>
                <div className="aid-bar-title">
                    ioBroker.admin <span>/ Instanzen</span>
                </div>
                <button
                    type="button"
                    className="aid-ibtn"
                    aria-label="Verbindung trennen"
                    onClick={disconnect}
                >
                    <IconConnectionState state={connection} />
                </button>
                <button
                    type="button"
                    className="aid-ibtn"
                    aria-label="Meldungen gelesen"
                    onClick={() => setNotifications(0)}
                >
                    <IconBell count={notifications} />
                    {notifications ? (
                        <span
                            key={notifications}
                            className="aid-badge"
                        >
                            {notifications}
                        </span>
                    ) : null}
                </button>
                <button
                    type="button"
                    className="aid-ibtn"
                    aria-label="Neu laden"
                    onClick={reload}
                >
                    <IconRefresh loading={loading} />
                </button>
            </div>
            <div className="aid-main">
                <nav className={`aid-nav${navOpen ? '' : ' aid-nav-closed'}`}>
                    {NAV.map(item => (
                        <div
                            key={item}
                            className={item === 'Instanzen' ? 'aid-nav-on' : undefined}
                        >
                            {item}
                        </div>
                    ))}
                </nav>
                <div className={`aid-list${offline ? ' aid-list-off' : ''}`}>
                    {instances.map(i => {
                        let sub = i.running
                            ? i.connected
                                ? 'läuft'
                                : 'läuft, nicht mit dem Gerät verbunden'
                            : 'gestoppt';
                        if (i.pending) {
                            sub = i.running ? 'wird gestoppt' : 'startet';
                        }
                        return (
                            <div
                                className="aid-row"
                                key={i.id}
                            >
                                <IconStatusLed
                                    color={ledColor(i)}
                                    beat={i.beat}
                                    blink={i.pending}
                                    fontSize="small"
                                />
                                <div style={{ minWidth: 0 }}>
                                    <div className="aid-row-name">{i.id}</div>
                                    <div className="aid-row-sub">
                                        {i.title}: {sub}
                                    </div>
                                </div>
                                <div className="aid-row-btns">
                                    <button
                                        type="button"
                                        className="aid-ibtn"
                                        aria-label={i.running ? 'Instanz stoppen' : 'Instanz starten'}
                                        disabled={i.pending}
                                        onClick={() => toggle(i.id)}
                                        style={{ color: i.running ? '#4CAF50' : undefined }}
                                    >
                                        <IconPlayPause
                                            running={i.running}
                                            pending={i.pending}
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        className="aid-ibtn"
                                        aria-label="Instanz löschen"
                                        onClick={() => setInstances(all => all.filter(x => x.id !== i.id))}
                                    >
                                        <IconTrash />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    <div className="aid-scene-foot">
                        <button
                            type="button"
                            className="aid-btn"
                            onClick={() => setNotifications(n => n + 1)}
                        >
                            Neue Meldung
                        </button>
                        <button
                            type="button"
                            className="aid-btn"
                            onClick={disconnect}
                            disabled={offline}
                        >
                            Verbindung trennen
                        </button>
                        <button
                            type="button"
                            className="aid-btn"
                            onClick={save}
                        >
                            Speichern
                        </button>
                        {instances.length < SCENE_START.length ? (
                            <button
                                type="button"
                                className="aid-btn"
                                onClick={() => setInstances(SCENE_START)}
                            >
                                Instanzen zurückholen
                            </button>
                        ) : null}
                        <span
                            className="aid-toast"
                            aria-live="polite"
                        >
                            {toast ? (
                                <>
                                    <IconResult
                                        type="success"
                                        replay={saveCount}
                                        fontSize="small"
                                    />
                                    Gespeichert
                                </>
                            ) : null}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface CardProps {
    name: string;
    picked: boolean;
    onPick: (picked: boolean) => void;
    stage: React.ReactNode;
    text: string;
    where: string;
    controls: React.ReactNode;
    code: string;
}

function Card(props: CardProps): React.JSX.Element {
    return (
        <article className={`aid-card${props.picked ? ' aid-card-picked' : ''}`}>
            <div className="aid-stage">{props.stage}</div>
            <div className="aid-card-body">
                <h3>{props.name}</h3>
                <p>{props.text}</p>
                <div className="aid-label">admin: {props.where}</div>
                <div className="aid-controls">{props.controls}</div>
                <pre className="aid-code">{props.code}</pre>
                <label className="aid-pick-toggle">
                    <input
                        type="checkbox"
                        id={`aid-pick-${props.name}`}
                        checked={props.picked}
                        onChange={e => props.onPick(e.target.checked)}
                    />
                    Für admin vormerken
                </label>
            </div>
        </article>
    );
}

function Btn(props: { onClick: () => void; pressed?: boolean; children: React.ReactNode }): React.JSX.Element {
    return (
        <button
            type="button"
            className="aid-btn"
            aria-pressed={props.pressed}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
}

const BIG = 48;

function useTimers(): (cb: () => void, ms: number) => void {
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
    useEffect(() => {
        const list = timers.current;
        return () => list.forEach(t => clearTimeout(t));
    }, []);
    return (cb, ms) => {
        timers.current.push(setTimeout(cb, ms));
    };
}

function Cards(props: { picked: string[]; onPick: (name: string, picked: boolean) => void }): React.JSX.Element {
    const later = useTimers();
    const [ppRunning, setPpRunning] = useState(false);
    const [ppPending, setPpPending] = useState(false);
    const [ledColorName, setLedColorName] = useState('green');
    const [ledBeat, setLedBeat] = useState(0);
    const [ledBlink, setLedBlink] = useState(false);
    const [result, setResult] = useState<'success' | 'warning' | 'error'>('success');
    const [resultCount, setResultCount] = useState(0);
    const [rfLoading, setRfLoading] = useState(false);
    const [rfDone, setRfDone] = useState(true);
    const [bell, setBell] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuRight, setMenuRight] = useState(false);
    const [trashOpen, setTrashOpen] = useState(false);
    const [conn, setConn] = useState<ConnState>('connecting');
    const [expert, setExpert] = useState(false);
    const [folderOpen, setFolderOpen] = useState(false);

    const togglePp = (): void => {
        if (ppPending) {
            return;
        }
        setPpPending(true);
        later(() => {
            setPpPending(false);
            setPpRunning(r => !r);
        }, 1000);
    };
    const loadRf = (): void => {
        if (!rfLoading) {
            setRfLoading(true);
            later(() => setRfLoading(false), 1800);
        }
    };
    const showResult = (type: 'success' | 'warning' | 'error'): void => {
        setResult(type);
        setResultCount(c => c + 1);
    };

    const pick = (name: string): { picked: boolean; onPick: (p: boolean) => void } => ({
        picked: props.picked.includes(name),
        onPick: (p: boolean) => props.onPick(name, p),
    });

    return (
        <div className="aid-grid">
            <Card
                name="IconPlayPause"
                {...pick('IconPlayPause')}
                text="Play und Pause gehen ineinander über. Bis die Instanz wirklich läuft, dreht sich ein Ring um das Symbol."
                where="Instanzen, Start und Stopp; Protokoll, Pause"
                stage={
                    <button
                        type="button"
                        className="aid-ibtn"
                        aria-label="Umschalten"
                        onClick={togglePp}
                    >
                        <IconPlayPause
                            running={ppRunning}
                            pending={ppPending}
                            fontSize={BIG}
                        />
                    </button>
                }
                controls={
                    <>
                        <Btn onClick={togglePp}>Klicken wie in admin</Btn>
                        <Btn onClick={() => setPpRunning(!ppRunning)}>Sofort umschalten</Btn>
                        <Btn
                            pressed={ppPending}
                            onClick={() => setPpPending(!ppPending)}
                        >
                            Warten
                        </Btn>
                    </>
                }
                code={`<IconPlayPause running={${ppRunning}} pending={${ppPending}} />`}
            />
            <Card
                name="IconStatusLed"
                {...pick('IconStatusLed')}
                text="Jedes Lebenszeichen der Instanz sendet einen Puls. Wechselt die Farbe, springt die LED kurz auf. Bei Rot wackelt sie."
                where="Instanzen, Status; Hosts"
                stage={
                    <IconStatusLed
                        color={ledColorName}
                        beat={ledBeat}
                        blink={ledBlink}
                        fontSize={BIG}
                    />
                }
                controls={
                    <>
                        <Btn onClick={() => setLedBeat(b => b + 1)}>Lebenszeichen</Btn>
                        {['green', 'orange', 'red', 'grey'].map(c => (
                            <button
                                key={c}
                                type="button"
                                className="aid-chip"
                                aria-label={c}
                                aria-pressed={ledColorName === c}
                                style={{
                                    background: {
                                        green: '#4CAF50',
                                        orange: '#FF9800',
                                        red: '#F44336',
                                        grey: '#9E9E9E',
                                    }[c],
                                }}
                                onClick={() => setLedColorName(c)}
                            />
                        ))}
                        <Btn
                            pressed={ledBlink}
                            onClick={() => setLedBlink(!ledBlink)}
                        >
                            Warten
                        </Btn>
                    </>
                }
                code={`<IconStatusLed color="${ledColorName}" beat={alive.ts}${ledBlink ? ' blink' : ''} />`}
            />
            <Card
                name="IconResult"
                {...pick('IconResult')}
                text="Ergebnis einer Aktion: Kreis und Zeichen zeichnen sich. Warnung und Fehler schütteln einmal."
                where="Einstellungen speichern, Befehlsdialog am Ende"
                stage={
                    <IconResult
                        type={result}
                        replay={resultCount}
                        fontSize={BIG}
                    />
                }
                controls={
                    <>
                        <Btn onClick={() => showResult('success')}>Erfolg</Btn>
                        <Btn onClick={() => showResult('warning')}>Warnung</Btn>
                        <Btn onClick={() => showResult('error')}>Fehler</Btn>
                    </>
                }
                code={`<IconResult type="${result}" replay={saveCount} />`}
            />
            <Card
                name="IconRefresh"
                {...pick('IconRefresh')}
                text="Dreht sich, solange geladen wird, und läuft weich aus. Danach steht kurz ein Häkchen da."
                where="Objekte, Adapter, History-Dialog: Neu laden"
                stage={
                    <button
                        type="button"
                        className="aid-ibtn"
                        aria-label="Neu laden"
                        onClick={loadRf}
                    >
                        <IconRefresh
                            loading={rfLoading}
                            showDone={rfDone}
                            fontSize={BIG}
                        />
                    </button>
                }
                controls={
                    <>
                        <Btn onClick={loadRf}>Laden</Btn>
                        <Btn
                            pressed={rfLoading}
                            onClick={() => setRfLoading(!rfLoading)}
                        >
                            Dauerhaft laden
                        </Btn>
                        <Btn
                            pressed={rfDone}
                            onClick={() => setRfDone(!rfDone)}
                        >
                            Häkchen
                        </Btn>
                    </>
                }
                code={`<IconRefresh loading={${rfLoading}}${rfDone ? '' : ' showDone={false}'} />`}
            />
            <Card
                name="IconBell"
                {...pick('IconBell')}
                text="Klingelt, wenn eine neue Meldung dazukommt. Sinkt die Zahl, weil Meldungen gelesen wurden, bleibt sie still."
                where="Kopfzeile, Benachrichtigungen"
                stage={
                    <button
                        type="button"
                        className="aid-ibtn"
                        aria-label="Meldungen gelesen"
                        onClick={() => setBell(0)}
                    >
                        <IconBell
                            count={bell}
                            fontSize={BIG}
                        />
                        {bell ? (
                            <span
                                key={bell}
                                className="aid-badge"
                            >
                                {bell}
                            </span>
                        ) : null}
                    </button>
                }
                controls={
                    <>
                        <Btn onClick={() => setBell(b => b + 1)}>Neue Meldung</Btn>
                        <Btn onClick={() => setBell(0)}>Alle gelesen</Btn>
                    </>
                }
                code={`<IconBell count={${bell}} />`}
            />
            <Card
                name="IconMenuArrow"
                {...pick('IconMenuArrow')}
                text="Die drei Striche drehen sich zum Pfeil. Er zeigt, wohin das Menü einklappt."
                where="Seitenmenü ein- und ausklappen"
                stage={
                    <button
                        type="button"
                        className="aid-ibtn"
                        aria-label="Menü"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <IconMenuArrow
                            open={menuOpen}
                            direction={menuRight ? 'right' : 'left'}
                            fontSize={BIG}
                        />
                    </button>
                }
                controls={
                    <>
                        <Btn onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Schließen' : 'Öffnen'}</Btn>
                        <Btn
                            pressed={menuRight}
                            onClick={() => setMenuRight(!menuRight)}
                        >
                            Pfeil nach rechts
                        </Btn>
                    </>
                }
                code={`<IconMenuArrow open={${menuOpen}}${menuRight ? ' direction="right"' : ''} />`}
            />
            <Card
                name="IconTrash"
                {...pick('IconTrash')}
                text="Der Deckel hebt sich, sobald die Maus über dem Knopf ist oder er den Fokus hat. So ist klar, dass hier gelöscht wird."
                where="alle Löschen-Knöpfe"
                stage={
                    <button
                        type="button"
                        className="aid-ibtn"
                        aria-label="Löschen"
                    >
                        <IconTrash
                            open={trashOpen}
                            fontSize={BIG}
                        />
                    </button>
                }
                controls={
                    <Btn
                        pressed={trashOpen}
                        onClick={() => setTrashOpen(!trashOpen)}
                    >
                        Deckel offen halten
                    </Btn>
                }
                code={`<IconTrash${trashOpen ? ' open' : ''} />`}
            />
            <Card
                name="IconFolder"
                {...pick('IconFolder')}
                text="Beim Öffnen fällt die vordere Klappe nach vorn, beim Schließen klappt sie zurück. Im Objektbrowser gleiten dazu die Kinder unter der Zeile hervor, die Zeilen darunter rücken mit."
                where="Ordner im Objekt- und Dateibrowser"
                stage={
                    <button
                        type="button"
                        className="aid-ibtn"
                        aria-label="Ordner"
                        aria-pressed={folderOpen}
                        onClick={() => setFolderOpen(!folderOpen)}
                        style={{ color: '#5B8CC4' }}
                    >
                        <IconFolder
                            open={folderOpen}
                            fontSize={BIG}
                        />
                    </button>
                }
                controls={<Btn onClick={() => setFolderOpen(!folderOpen)}>{folderOpen ? 'Schließen' : 'Öffnen'}</Btn>}
                code={`<IconFolder open={${folderOpen}} />`}
            />
            <Card
                name="IconConnectionState"
                {...pick('IconConnectionState')}
                text="Verbunden, verbindet sich oder getrennt. Beim Verbinden laufen die Wellen nach außen, getrennt wird durchgestrichen."
                where="Verbindungsanzeige, Seite „Verbinde“"
                stage={
                    <IconConnectionState
                        state={conn}
                        fontSize={BIG}
                    />
                }
                controls={
                    <>
                        <Btn
                            pressed={conn === 'connected'}
                            onClick={() => setConn('connected')}
                        >
                            Verbunden
                        </Btn>
                        <Btn
                            pressed={conn === 'connecting'}
                            onClick={() => setConn('connecting')}
                        >
                            Verbindet
                        </Btn>
                        <Btn
                            pressed={conn === 'disconnected'}
                            onClick={() => setConn('disconnected')}
                        >
                            Getrennt
                        </Btn>
                    </>
                }
                code={`<IconConnectionState state="${conn}" />`}
            />
            <Card
                name="IconExpertMode"
                {...pick('IconExpertMode')}
                text="Ein Doktorhut: aus nur als Umriss, an gefüllt, also auch ohne Farbe zu unterscheiden. Beim Einschalten fliegt der Hut kurz hoch und die Quaste schwingt nach."
                where="Expertenmodus in Menü, Objekten und Dateien"
                stage={
                    <button
                        type="button"
                        className="aid-ibtn"
                        aria-label="Expertenmodus"
                        aria-pressed={expert}
                        onClick={() => setExpert(!expert)}
                        style={{ color: expert ? '#14bb00' : undefined }}
                    >
                        <IconExpertMode
                            active={expert}
                            fontSize={BIG}
                        />
                    </button>
                }
                controls={<Btn onClick={() => setExpert(!expert)}>{expert ? 'Ausschalten' : 'Einschalten'}</Btn>}
                code={`<IconExpertMode active={${expert}} />`}
            />
        </div>
    );
}

function readPicked(): string[] {
    try {
        const value = JSON.parse(window.localStorage.getItem(PICK_KEY) || '[]') as unknown;
        return Array.isArray(value) ? (value as string[]) : [];
    } catch {
        return [];
    }
}

/** Demo of the animated icons, used in test-gui and as a standalone page */
export function AnimatedIconsDemo(props: { themeType?: 'dark' | 'light' }): React.JSX.Element {
    const [slow, setSlow] = useState(false);
    const [picked, setPicked] = useState<string[]>(readPicked);
    const [copied, setCopied] = useState(0);
    const [copyFallback, setCopyFallback] = useState(false);

    useEffect(() => {
        if (!slow || !document.getAnimations) {
            return undefined;
        }
        let frame = 0;
        const tick = (): void => {
            document.getAnimations().forEach(a => {
                if (a.playbackRate !== 0.25) {
                    a.playbackRate = 0.25;
                }
            });
            frame = requestAnimationFrame(tick);
        };
        tick();
        return () => {
            cancelAnimationFrame(frame);
            document.getAnimations().forEach(a => {
                a.playbackRate = 1;
            });
        };
    }, [slow]);

    const onPick = (name: string, value: boolean): void => {
        const list = value ? [...picked.filter(n => n !== name), name] : picked.filter(n => n !== name);
        setPicked(list);
        try {
            window.localStorage.setItem(PICK_KEY, JSON.stringify(list));
        } catch {
            // ignore: the selection is only a convenience
        }
    };

    const copyText = `Bitte in admin einbauen: ${picked.join(', ')}`;
    const copy = (): void => {
        if (!navigator.clipboard?.writeText) {
            setCopyFallback(true);
            return;
        }
        navigator.clipboard.writeText(copyText).then(
            () => setCopied(c => c + 1),
            () => setCopyFallback(true),
        );
    };

    let theme = 'aid-auto';
    if (props.themeType === 'light') {
        theme = 'aid-light';
    } else if (props.themeType === 'dark') {
        theme = 'aid-dark';
    }

    return (
        <div className={`aid ${theme}`}>
            <style>{css}</style>
            <div className="aid-wrap">
                <header className="aid-head">
                    <div>
                        <div className="aid-label">@iobroker/gui-components</div>
                        <h1>Bewegte Icons</h1>
                        <p>
                            Zehn Icons aus CSS und SVG für admin und alle Adapter. Jede Bewegung sagt etwas: ein Klick
                            ist angekommen, es wird gewartet, etwas hat sich geändert. Wer im System weniger Bewegung
                            eingestellt hat, sieht die ruhige Variante.
                        </p>
                    </div>
                    <label className="aid-switch">
                        <input
                            type="checkbox"
                            id="aid-slow"
                            checked={slow}
                            onChange={e => setSlow(e.target.checked)}
                        />
                        Zeitlupe, viermal langsamer
                    </label>
                </header>

                <section>
                    <div className="aid-label">So sieht es in admin aus</div>
                    <p style={{ margin: '6px 0 14px', color: 'var(--aid-muted)', maxWidth: '70ch' }}>
                        Instanzen starten und stoppen, Papierkorb anfahren, Glocke, Verbindung und Neu laden oben in der
                        Leiste. Die LEDs pulsieren bei jedem Lebenszeichen.
                    </p>
                    <Scene />
                </section>

                <section>
                    <div className="aid-label">Die zehn Icons</div>
                    <p style={{ margin: '6px 0 14px', color: 'var(--aid-muted)', maxWidth: '70ch' }}>
                        Alle nutzen die Textfarbe und haben die Größen der MUI-Icons. Merke vor, was in admin kommen
                        soll, und kopiere die Auswahl unten.
                    </p>
                    <Cards
                        picked={picked}
                        onPick={onPick}
                    />
                </section>

                <div className="aid-pickbar">
                    <div className="aid-pickbar-text">
                        {picked.length ? (
                            <>
                                {picked.length} vorgemerkt: <code>{picked.join(', ')}</code>
                            </>
                        ) : (
                            'Noch nichts vorgemerkt. Hake bei den Icons „Für admin vormerken“ an.'
                        )}
                    </div>
                    {copied ? (
                        <IconResult
                            type="success"
                            replay={copied}
                            fontSize="small"
                            ariaLabel="Kopiert"
                        />
                    ) : null}
                    <button
                        type="button"
                        className="aid-btn"
                        disabled={!picked.length}
                        onClick={copy}
                    >
                        Auswahl kopieren
                    </button>
                    {copyFallback && picked.length ? (
                        <input
                            className="aid-copyfield"
                            id="aid-copyfield"
                            readOnly
                            value={copyText}
                            onFocus={e => e.target.select()}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}
