export declare type AutolinkingSearchConfig = {
    paths: string[];
    exclude: string[];
};
export declare type ModuleRevision = {
    path: string;
    version: string;
};
export declare type AutolinkingSearchResult = ModuleRevision & {
    ios?: null | {
        podspecPath: string;
    };
    android?: null | {
        path: string;
    };
    duplicates: ModuleRevision[];
};
export declare type AutolinkingSearchResults = {
    [moduleName: string]: AutolinkingSearchResult;
};
