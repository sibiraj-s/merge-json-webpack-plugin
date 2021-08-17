import { Options as GlobOptions } from 'fast-glob';
import { Compiler } from 'webpack';

type json = {} | { [key: string]: any };

interface GroupBaseOptions {
  transform?: (outputJson: json) => json;
  to: string;
}

interface GroupFilesOptions extends GroupBaseOptions {
  files: string[];
}

interface GroupPatternOptions extends GroupBaseOptions {
  pattern: string[] | string;
  globOptions?: GlobOptions;
}

interface Options {
  cwd?: string;
  force?: boolean;
  minify?: boolean | 'auto';
  mergeFn?: (prev: json, current: json) => json;
  group: GroupPatternOptions[] | GroupFilesOptions[];
  globOptions?: GlobOptions;
}

declare class MergeJsonPlugin {
  constructor(options: Options);
  apply(compiler: Compiler): void;
}

export = MergeJsonPlugin;
