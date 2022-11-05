declare namespace StyleCssNamespace {
    export interface IStyleCss {
        "custom-control-input": string;
        "custom-control-label": string;
        "custom-switch": string;
    }
}

declare const StyleCssModule: StyleCssNamespace.IStyleCss & {
    /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
    locals: StyleCssNamespace.IStyleCss;
};

export = StyleCssModule;
