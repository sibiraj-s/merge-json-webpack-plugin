import { Options as GlobOptions } from 'fast-glob';

type json = {} | { [key: string]: any }

interface GroupOptions {
  files: string[] | string;
  beforeEmit?: (outputJson: json) => json
  to: string;
}

interface Options {
  root: string;
  minify: boolean | 'auto';
  mergeFn: (prev: json, current: json) => json;
  group: GroupOptions[];
  globOptions: GlobOptions;
}

declare class MergeJsonPlugin {
  constructor(options: Options);
}

export = MergeJsonPlugin;
