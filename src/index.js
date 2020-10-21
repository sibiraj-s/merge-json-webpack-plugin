const path = require('path');
const fs = require('fs');
const glob = require('fast-glob');

const { validate } = require('schema-utils');
const { sources } = require('webpack');
const { interpolateName } = require('loader-utils');

const schema = require('./options.json');

const PLUGIN_NAME = 'MergeJsonPlugin';

const isImmutable = (name) => {
  return (/\[(?:(?:[^:\]]+):)?(?:hash|contenthash)(?::(?:[a-z]+\d*))?(?::(?:\d+))?\]/gi).test(name);
};

const defaultOptions = {
  cwd: null,
  force: false,
  group: [],
  globOptions: {},
  mergeFn: null,
  minify: 'auto',
};

class MergeJsonPlugin {
  constructor(options) {
    validate(schema, options, {
      name: PLUGIN_NAME,
      baseDataPath: 'options',
    });

    this.options = { ...defaultOptions, ...options };
  }

  async processJson(compiler, compilation) {
    const context = this.options.cwd || compiler.options.context;
    const isProdMode = compiler.options.mode === 'production';
    const minify = this.options.minify === true || (this.options.minify === 'auto' && isProdMode);
    const { group, globOptions, force } = this.options;

    const logger = compilation.getLogger(PLUGIN_NAME);

    logger.debug('Merging JSONs.');

    const assetsPromises = group.map(async (g) => {
      let { files } = g;
      const { to: outputPath, beforeEmit } = g;

      if (this.options.mergeFn) {
        logger.debug('Using custom merge function.');
      }

      const mergeFn = this.options.mergeFn || Object.assign;

      const mayBeGlob = typeof files === 'string';
      if (mayBeGlob) {
        files = await glob(files, {
          cwd: context,
          ignore: '!(**/*.json)',
          ...globOptions,
        });
      }

      const filesPromises = files.map(async (file) => {
        const fileAbsPath = path.isAbsolute(file) ? file : path.resolve(context, file);

        const fileExists = fs.existsSync(fileAbsPath);

        if (!fileExists) {
          const err = `File does not exist: ${fileAbsPath}`;
          throw new Error(err);
        }

        // add file to webpack dependencies to watch
        compilation.fileDependencies.add(fileAbsPath);

        // read json
        logger.debug('Reading file:', fileAbsPath);
        const jsonStr = await fs.promises.readFile(fileAbsPath, 'utf-8');

        logger.debug('File read successfully:', fileAbsPath);
        return JSON.parse(jsonStr);
      });

      const f = await Promise.all(filesPromises);
      const mergedJson = f.reduce((acc, val) => mergeFn(acc, val), {});

      const modifiedJson = typeof beforeEmit === 'function'
        ? await beforeEmit(mergedJson)
        : mergedJson;

      const space = minify ? 0 : 2;
      const formattedJson = JSON.stringify(modifiedJson, null, space);

      const data = new sources.RawSource(formattedJson);

      const assetName = interpolateName({}, outputPath, {
        content: formattedJson,
      });

      const existingAsset = compilation.getAsset(assetName);

      const assetInfo = {
        immutable: isImmutable(outputPath),
        minimized: minify,
      };

      if (existingAsset) {
        if (force) {
          compilation.updateAsset(assetName, data, assetInfo);
          return;
        }

        logger.warn(`Skipping file ${assetName} already exist`);
        return;
      }

      compilation.emitAsset(assetName, data, assetInfo);
      logger.info(`File written to: ${assetName}`);
    });

    await Promise.all(assetsPromises);
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.additionalAssets.tapPromise(PLUGIN_NAME, async () => {
        try {
          await this.processJson(compiler, compilation);
        } catch (err) {
          compilation.errors.push(err);
        }
      });
    });
  }
}

module.exports = MergeJsonPlugin;
