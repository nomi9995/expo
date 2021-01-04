export type AutolinkingSearchConfig = {
  paths: string[];
  exclude: string[];
};

export type ModuleRevision = {
  path: string;
  version: string;
};

export type AutolinkingSearchResult = ModuleRevision & {
  ios?: null | {
    podspecPath: string;
  };
  android?: null | {
    path: string;
  };
  duplicates: ModuleRevision[];
};

export type AutolinkingSearchResults = {
  [moduleName: string]: AutolinkingSearchResult;
};
