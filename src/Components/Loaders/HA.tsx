import React from 'react';
import type { ThemeType } from '../../types';

interface LogoProps {
    themeType?: ThemeType;
    size?: number;
    /** Background color */
    backgroundColor?: string;
    /** Background image URL */
    backgroundImage?: string;
}

const FLICKER_STYLE_ID = 'loader-ha-flicker-keyframes';
const FLICKER_KEYFRAMES = `
@keyframes loaderHA-flicker {
    0%   { filter: drop-shadow(0 0 4px  #db0a33);                   opacity: 1;    }
    15%  { filter: drop-shadow(0 0 10px #db0a33) hue-rotate(-2deg); opacity: 0.97; }
    30%  { filter: drop-shadow(0 0 6px  #db0a33);                   opacity: 1;    }
    45%  { filter: drop-shadow(0 0 14px #e61a38) hue-rotate(-3deg); opacity: 0.94; }
    60%  { filter: drop-shadow(0 0 7px  #db0a33) hue-rotate(-1deg); opacity: 1;    }
    75%  { filter: drop-shadow(0 0 11px #e61a38) hue-rotate(-2deg); opacity: 0.98; }
    90%  { filter: drop-shadow(0 0 5px  #db0a33);                   opacity: 1;    }
    100% { filter: drop-shadow(0 0 4px  #db0a33);                   opacity: 1;    }
}`;

/**
 * Vendor specific loader
 *
 * @param props Properties
 */
export function LoaderHA(props: LogoProps): React.JSX.Element {
    const themeType = props.themeType || 'dark';
    const size = props.size || 300;

    React.useEffect(() => {
        if (!window.document.getElementById(FLICKER_STYLE_ID)) {
            const style = window.document.createElement('style');
            style.setAttribute('id', FLICKER_STYLE_ID);
            style.innerHTML = FLICKER_KEYFRAMES;
            window.document.head.appendChild(style);
        }
    }, []);

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage:
                    props.backgroundImage && props.backgroundImage !== '@@loginBackgroundImage@@'
                        ? props.backgroundImage
                        : window.loadingBackgroundImage && window.loadingBackgroundImage !== '@@loginBackgroundImage@@'
                          ? `url(${window.loadingBackgroundImage})`
                          : undefined,
                backgroundColor:
                    props.backgroundColor && props.backgroundColor !== '@@loginBackgroundColor@@'
                        ? props.backgroundColor
                        : window.loadingBackgroundColor && window.loadingBackgroundColor !== '@@loginBackgroundColor@@'
                          ? window.loadingBackgroundColor
                          : themeType === 'dark'
                            ? '#000'
                            : '#FFF',
                backgroundSize: 'cover',
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 69.6 148.1"
                style={{
                    fill: '#db0a33',
                    animation: 'loaderHA-flicker 5s ease-in-out infinite',
                    willChange: 'filter, opacity',
                }}
            >
                <path d="M69.5,100.6c0-.4,0-.8-.2-1.1v-.7c-.2-.4-.3-.8-.5-1.2,0-.2-.2-.5-.3-.7,0,0,0-.2,0-.2,0-.2,0-.3-.2-.5l-.4-.7-.4-.6c-1-1.6-2.4-3-4.2-4.3-.3-.2-.6-.4-.9-.6,0,0-.2,0-.3-.2-.3-.2-.6-.3-.9-.5-.2,0-.3-.2-.5-.3-.3-.2-.6-.3-.9-.5,0,0-.2,0-.3-.2-1-2.7-2.4-4.9-3.8-6.7h0c2.5,0,6.6-.3,7.5-3,3.5-3,2.5-9.7,2.5-10,0-.6-.2-1.1-.4-1.7h0v-.3c.5-3-.4-7.1-.5-7.7h0l-.3-1.1c0-.3-.2-.7-.4-1,0-.4-.3-.7-.4-1,0-.3-.3-.7-.5-1s-.4-.7-.6-1c-.2-.3-.4-.6-.6-.9l-.4-.4-.4-.4-.4-.4c0,0-.3-.3-.5-.4-.3-.2-.6-.4-1-.6-.2,0-.4-.2-.5-.2-.2,0-.4,0-.6-.2-.2,0-.4,0-.6,0h-1.8c-.4,0-.8,0-1.1.2-.4,0-.7.2-1.1.4h0c-1.6-.2-2.6-1-3.1-1.7h0c2-.9,3.5-1.9,4.6-3,2.6-2.2,4-5.1,4.7-7.2,3.4-1.1,5.4-4,5.4-4h0c4.6-5.3,1.2-15.1,1.2-15.1,0,0-.8,4.2-4,5.5,0-.3-.2-.6-.3-1.1s-.3-1.1-.6-1.7c-.2-.7-.5-1.4-.9-2.2-.4-.8-.8-1.6-1.4-2.4-.5-.8-1.2-1.7-1.9-2.5h0C59.2,6.6,49.2.3,49.2.3c0,0,3.3,5.8,1.3,9.9,0,0-3.5-.8-5.7-.8s-2.4.1-3.5.3c-.5.1-1.1.2-1.6.3-.3,0-.5.1-.8.2-.2,0-.5.1-.7.2-.5.1-.9.2-1.3.4-.4.1-.8.3-1.2.4-.4.1-.7.2-1,.3s-.6.2-.9.3h-.2c-2-2.8-3.7-7.5,1.8-11.9,0,0-13,5.3-8.2,17,0,0,0,.2-.1.4h0c-.3.3-.6.7-1,1.3-.3.6-.7,1.3-.9,2.1-.1.4-.2.8-.2,1.3v1.5c-.2-.1-.5-.2-.9-.4-1.7-.8-1.7-2.8-1.7-2.8-1.1,8.3,4.2,13.3,5.2,14.1,0,.4,0,.7-.2,1v.4c-.2,0-.3.3-.4.5-.1.4-.2.7-.3,1.1-.1.7-.1,1.5,0,2.2s.3,1.4.5,2c.3.6.6,1.2.9,1.7,0,0,0,0,.1.2.4.6,1,1.4,2,2h.1c.2,0,.8.5,1.7.7.2.2,1.5,1.7,3.1,2.1-.2,1.1-1,2.8-3.4,3.7,0,0-14.2-.4-13.2,13.5-6.6,8.7-3.8,13.4-3.8,13.4-.9.6-.9,1.9-.5,3,0,0,0,.3.2.5,0,0,0,0,.3.4.3.4.6.7,1,.8,1.1.7,3.1,1.5,6.4,1.1.2.3,1.3,1.8,1.3,2.2.5,2.3,1.2,4.5,1.3,6.8l.2,1.3c-2.2-.2-11-.2-16.6,9.1,0,0-.2.2-.2.4l-.5.9-.6,1.2h0c-.3.7-.7,1.7-1.1,2.8-.5.4-1.2,0-1.7-.3-.4-.4-.7-.7-.9-1.1,0,0,0-.2,0-.3v-.2s0-.2-.2-.2h0c0,0,0,0-.2-.2h-.4s-.2,0-.2,0c-.2,0-.2.2-.3.3,0,0-.1.2-.2.2,0,.2-.2.3-.2.5-.2.6-.4,1.2-.6,1.8-.6,2.4-.6,4.9-.1,7.3.2,1.2.6,2.4,1.1,3.5.5,1.1,1.2,2.1,2,3.1.8.9,1.7,1.8,2.7,2.5s2,1.3,3.1,1.8h0l.6.4-.3-.7c-.2-.4-.3-.9-.5-1.3-.1-.4-.2-.9-.3-1.3-.1-.9-.2-1.8,0-2.7,0-.4.2-.8.4-1.2.2-.4.4-.7.7-1.1.6-.8,1-1.6,1.5-2.5.4-.9.8-1.8,1.1-2.7.1-.5.3-1,.3-1.5v-.9h0c.1-2.3-1.9-3-3-2.9-.9,0-1.7.2-2,.2.7-1.3,1.3-2.4,2-3.4h0c.2-.4.4-.6.6-.9.4-.5.8-1,1.2-1.5.1,0,.2-.3.3-.4h0c.1,0,.2-.2.3-.4.1,0,.2-.3.4-.4,6.5-6.5,12.5-2.9,12.5-2.9,0,0,1.1,3.7,1.6,4.6h0c1,2.3,2.7,4.6,4.1,6.9h0c0,0,0,4.8,2.2,7.2.5.6,1.1,1.3,1.7,2.2.3.5.5,1,.7,1.4.2.3.3.6.4.9.3.4.5.8.8,1.3s.6,1,.8,1.6c.2.5.4,1,.6,1.5,0,0,1,5.1.7,7.4-3.3.9-5.5,2.4-7.4,3.2-1,.3-3.4,2-5.5,1.9h-.5c0,.1-3.6.3-2.7,3.1,0,0,.2,3.6,5.8,2.9,1.8-.1,7.5-.5,9.1-.3,1.6.2,2.8.2,3.7.1,1.3,0,3.8,0,5.3-.4.4,1.8,3.2,2.4,6,1.5,3.6,1.6,13.5,2,15.6-1.6,2.4-4.1-2.4-8.6-4.1-12.6-3.8-9.3-.8-14-1.6-16.8,0-.7-.2-1.8-.4-3.2.8-.4,1.5-.8,2.2-1.3,1-.7,1.7-1.4,2.3-2.1l.2-.2c0,0,.2-.3.3-.4l.6-.9.6-1.2.4-1.1.3-1.2v-.8c0-.3,0-.5,0-.7h0v-2.4h.2ZM52.6,131.9c-.3.4-.7.9-1.2,1.6-1-.6-2.7-2.2-3.3-4.3,0-.2,0-.3-.2-.5-1.1-6.9-2.6-9.7-3.2-10.6-1-3.7-1.7-7.4-1.3-9.6,0,0,3.6,8.2,6.4,10,0,0,3.7,8.5,4.5,9.9.6,1-.9,2.3-1.7,3.5ZM63.6,102.7h0v.2h0v.9c0,0-.3.4-.3.4,0,0,0,.2,0,.3v.2h0v.2h0l-.2.2c-.3.6-.8,1.1-1.3,1.5h0c-.3-2.4-.6-5.1-.8-8.2.2-.5.3-1.1.4-1.7l.2.2c.2.2.4.4.5.6.2.2.3.4.5.7,0,.2.3.4.4.7h0c0,.3.2.5.3.7,0,.2.2.5.2.7h0v.3c0,.2,0,.4,0,.6v.7h0v.7h0Z" />
            </svg>
        </div>
    );
}
