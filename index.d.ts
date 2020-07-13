import { Options as GlobOptions } from 'fast-glob';

interface Options {
  root: string;
  minify: boolean | 'auto';
  mergeFn: (prev: any, current: any) => any;
  group: [{ files: string[] | string; to: string }];
  globOptions: GlobOptions;
}

declare class MergeJsonPlugin {
  constructor(options: Options);
}

export = MergeJsonPlugin;
