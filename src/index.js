const path = require('path');
const fs = require('fs');
const glob = require('fast-glob');

const validate = require('schema-utils');
const { RawSource } = require('webpack-sources');

const schema = require('./options.json');

const PLUGIN_NAME = 'MergeJsonPlugin';
const PLUGIN = {
  name: PLUGIN_NAME,
};

const defaultOptions = {
  root: null,
  mergeFn: null,
  minify: 'auto',
  group: [],
  globOptions: {},
};

class MergeJsonPlugin {
  constructor (options) {
    validate(schema, options, {
      name: PLUGIN_NAME,
      baseDataPath: 'options',
    });

    this.options = { ...defaultOptions, ...options };
  }

  apply (compiler) {
    const context = this.options.root || compiler.options.context;
    const isProdMode = compiler.options.mode === 'production';
    const minify = (this.options.minify === true) || (this.options.minify === 'auto' && isProdMode);

    compiler.hooks.thisCompilation.tap(PLUGIN, (compilation) => {
      const logger = compilation.getLogger(PLUGIN_NAME);

      compilation.hooks.additionalAssets.tapPromise(PLUGIN_NAME, async () => {
        const { group } = this.options;

        logger.debug('Merging JSONs.');

        try {
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
                ...this.options.globOptions,
              });
            }

            const filesPromises = files.map(async (file) => {
              const fileAbsPath = path.isAbsolute(file) ? file : path.resolve(context, file);

              const fileExists = fs.existsSync(fileAbsPath);

              if (!fileExists) {
                const err = `File does not exist:${fileAbsPath}`;
                compilation.errors.push(err);
                return {};
              }

              // add file to webpack dependencies to watch
              compilation.fileDependencies.add(fileAbsPath);

              // read json
              logger.debug('Reading file:', fileAbsPath);
              const jsonStr = await fs.promises.readFile(fileAbsPath, 'utf-8');

              logger.debug('File read successfully:', fileAbsPath);
              const json = JSON.parse(jsonStr);
              return json;
            });

            const f = await Promise.all(filesPromises);
            const mergedJson = f.reduce((acc, val) => mergeFn(acc, val), {});

            const modifiedJson = typeof beforeEmit === 'function'
              ? await beforeEmit(mergedJson)
              : mergedJson;

            const space = minify ? 0 : 2;
            const formattedJson = JSON.stringify(modifiedJson, null, space);

            const targerSrc = new RawSource(formattedJson);
            compilation.emitAsset(outputPath, targerSrc);
          });

          await Promise.all(assetsPromises);
        } catch (err) {
          compilation.errors.push(err);
        }
      });
    });
  }
}

module.exports = MergeJsonPlugin;
