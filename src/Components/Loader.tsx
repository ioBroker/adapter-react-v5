/**
 * Copyright 2018-2025 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 *
 */
import React from 'react';
import type { ThemeName, ThemeType } from '../types';
import { LoaderMV } from './Loaders/MV';
import { LoaderNW } from './Loaders/NW';
import { LoaderVendor } from './Loaders/Vendor';
import { LoaderCommunity } from './Loaders/Community';
import { LoaderPT } from './Loaders/PT';

declare global {
    interface Window {
        loadingBackgroundImage: undefined | string;
        loadingBackgroundColor: undefined | string;
        loadingHideLogo: undefined | 'true';
    }
}

export interface LoaderProps {
    /** The size in pixels of this loader. */
    size?: number;
    /** The chosen theme type. */
    themeType?: ThemeType;
    /** Theme name */
    themeName?: ThemeName;
    /** @deprecated Theme name. use themeName instead */
    theme?: ThemeName;
    /** Background color */
    backgroundColor?: string;
    /** Background image URL */
    backgroundImage?: string;
}

export function Loader(props: LoaderProps): React.JSX.Element {
    const vendorPrefix = window.vendorPrefix;
    if (vendorPrefix === 'PT') {
        return <LoaderPT themeType={props.themeType} />;
    }
    if (vendorPrefix === 'MV') {
        return <LoaderMV themeType={props.themeType} />;
    }
    if (vendorPrefix === 'NW') {
        return <LoaderNW themeType="dark" />;
    }
    if (vendorPrefix && vendorPrefix !== '@@vendorPrefix@@') {
        return <LoaderVendor themeType={props.themeType} />;
    }
    return <LoaderCommunity themeType={props.themeType} />;
}
