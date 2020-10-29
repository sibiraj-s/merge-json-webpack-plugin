import { Options as GlobOptions } from 'fast-glob';
import { Compiler } from 'webpack';

type json = {} | { [key: string]: any };

interface GroupOptions {
  files: string[] | string;
  beforeEmit?: (outputJson: json) => json;
  to: string;
}

interface Options {
  cwd?: string;
  force?: boolean;
  minify?: boolean | 'auto';
  mergeFn?: (prev: json, current: json) => json;
  group: GroupOptions[];
  globOptions?: GlobOptions;
}

declare class MergeJsonPlugin {
  constructor(options: Options);
  apply(compiler: Compiler): void;
}

export = MergeJsonPlugin;
