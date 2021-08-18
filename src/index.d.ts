import { Options as GlobOptions } from 'fast-glob';
import { Compiler, WebpackPluginInstance } from 'webpack';

type json = {} | { [key: string]: any };

interface GroupBase {
  transform?: (outputJson: json) => json;
  to: string;
}

interface GroupFiles extends GroupBase {
  files: string[];
}

interface GroupPattern extends GroupBase {
  pattern: string[] | string;
  globOptions?: GlobOptions;
}

interface Options {
  cwd?: string;
  force?: boolean;
  minify?: boolean | 'auto';
  mergeFn?: (prev: json, current: json) => json;
  groups: GroupPattern[] | GroupFiles[];
  globOptions?: GlobOptions;
}

declare class MergeJsonPlugin implements WebpackPluginInstance {
  constructor(options: Options);
  apply(compiler: Compiler): void;
}

export = MergeJsonPlugin;
