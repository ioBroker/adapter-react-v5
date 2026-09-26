import { Component } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export class Router<P = {}, S = {}> extends Component<P, S> {
    protected onHashChangedBound: () => void;

    constructor(props: P) {
        super(props);
        this.onHashChangedBound = this.onHashChanged.bind(this);
    }

    componentDidMount(): void {
        window.addEventListener('hashchange', this.onHashChangedBound);
    }

    componentWillUnmount(): void {
        window.removeEventListener('hashchange', this.onHashChangedBound);
    }

    // eslint-disable-next-line class-methods-use-this
    onHashChanged(): void {
        // override this function
    }

    /**
     * Put a free-form part of the route into the hash.
     *
     * {@link Router.getLocation} splits the hash at "/" and decodes every part, so everything written
     * here has to be encoded: an object ID may contain a "/" (e.g.
     * `ocpp.0./TACW1142021G1543.1.meterValues.Power_Active_Import`) and a file ID always does.
     * Without this, such an ID is cut off at its first slash when the route is read back, and the
     * rest of it lands in `arg`.
     *
     * Callers pass the raw ID; they must not encode it themselves, or it is encoded twice.
     *
     * @param part the value to write into one segment of the hash
     */
    private static encodeSegment(part: string): string {
        return encodeURIComponent(part);
    }

    /**
     * Gets the location object.
     */
    static getLocation(): { tab: string; dialog: string; id: string; arg: string } {
        let hash = window.location.hash;
        hash = hash.replace(/^#/, '');
        const parts = hash.split('/').map(item => {
            try {
                return item ? decodeURIComponent(item) : '';
            } catch {
                console.error(`Router: Cannot decode ${item}`);
                return item;
            }
        });
        // #tabName/dialogName/deviceId
        return {
            tab: parts[0] || '',
            dialog: parts[1] || '',
            id: parts[2] || '',
            arg: parts[3] || '',
        };
    }

    /**
     * Navigate to a new location. Any parameters that are not set will be taken from the current location.
     */
    static doNavigate(
        tab: string | undefined | null,
        dialog?: string | null,
        id?: string | null,
        arg?: string | null,
    ): void {
        let hash = '';
        const location = Router.getLocation();
        if (arg !== undefined && !id) {
            id = location.id;
        }
        if (id && !dialog) {
            dialog = location.dialog;
        }
        if (dialog && !tab) {
            tab = location.tab;
        } else if (tab === null) {
            tab = location.tab;
        }

        if (tab) {
            hash = `#${tab}`;
            if (dialog) {
                hash += `/${dialog}`;

                if (id) {
                    // `id` and `arg` carry free-form values - an ID with a "/" in it would otherwise
                    // be read back as two segments. `tab` and `dialog` are fixed names of the
                    // application and are left as they are.
                    hash += `/${Router.encodeSegment(id)}`;
                    if (arg !== undefined) {
                        hash += `/${arg === null ? arg : Router.encodeSegment(arg)}`;
                    }
                }
            }
        }
        if (window.location.hash !== hash) {
            window.location.hash = hash;
        }
    }
}
