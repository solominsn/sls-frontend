declare namespace MainCssNamespace {
    export interface IMainCss {
        card: string;
        editor: string;
    }
}

declare const MainCssModule: MainCssNamespace.IMainCss & {
    /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
    locals: MainCssNamespace.IMainCss;
};

export = MainCssModule;
