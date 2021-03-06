const path = require('path');
const fs = require('fs');
const glob = require('fast-glob');
const { validate } = require('schema-utils');

const schema = require('./options.json');

const PLUGIN_NAME = 'MergeJsonPlugin';
const TEMPLATE_REGEX = /\[\\*(?:[\w:]+)\\*\]/i;

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
    const { sources: { RawSource } } = compiler.webpack;

    const context = this.options.cwd || compiler.options.context;
    const isProdMode = compiler.options.mode === 'production';
    const minify = this.options.minify === true || (this.options.minify === 'auto' && isProdMode);
    const { group, globOptions, force } = this.options;

    const logger = compilation.getLogger(PLUGIN_NAME);

    logger.debug('Merging JSONs.');

    const assetsPromises = group.map(async (item) => {
      let { files } = item;
      const { to: outputPath, transform } = item;

      if (this.options.mergeFn) {
        logger.debug('Using custom merge function.');
      }

      const mergeFn = this.options.mergeFn || Object.assign;

      const mayBeGlob = typeof files === 'string';
      if (mayBeGlob) {
        files = await glob(files, {
          cwd: context,
          ignore: '**/*.!(json)',
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
      const mergedJson = f.reduce((acc, val) => mergeFn(acc, val));

      const modifiedJson = typeof transform === 'function'
        ? await transform(mergedJson)
        : mergedJson;

      const space = minify ? 0 : 2;
      const formattedJson = JSON.stringify(modifiedJson, null, space);

      const output = new RawSource(formattedJson);

      let assetName = outputPath;
      let assetInfo = {};

      if (TEMPLATE_REGEX.test(outputPath)) {
        const { outputOptions } = compilation;

        const {
          hashDigest,
          hashDigestLength,
          hashFunction,
          hashSalt,
        } = outputOptions;

        const hash = compiler.webpack.util.createHash(hashFunction);

        if (hashSalt) {
          hash.update(hashSalt);
        }

        hash.update(output.source());

        const fullContentHash = hash.digest(hashDigest);
        const contentHash = fullContentHash.slice(0, hashDigestLength);

        const pathData = {
          contentHash,
          chunk: {
            hash: contentHash,
            contentHash,
          },
        };

        const { path: interpolatedName, info } = compilation.getPathWithInfo(
          outputPath,
          pathData,
        );

        assetName = interpolatedName;
        assetInfo = { ...info };
      }

      const existingAsset = compilation.getAsset(assetName);
      assetInfo.minimized = minify;

      if (existingAsset) {
        if (force) {
          compilation.updateAsset(assetName, output, assetInfo);
          return;
        }

        logger.warn(`Skipping file ${assetName} already exist`);
        return;
      }

      compilation.emitAsset(assetName, output, assetInfo);
      logger.info(`File written to: ${assetName}`);
    });

    await Promise.all(assetsPromises);
  }

  apply(compiler) {
    const { Compilation } = compiler.webpack;

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        async () => {
          try {
            await this.processJson(compiler, compilation);
          } catch (err) {
            compilation.errors.push(err);
          }
        },
      );
    });
  }
}

module.exports = MergeJsonPlugin;
