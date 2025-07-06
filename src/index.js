const path = require('path');
const fs = require('fs');
const fg = require('fast-glob');
const { validate } = require('schema-utils');

const schema = require('./options.json');

const PLUGIN_NAME = 'MergeJsonPlugin';
const TEMPLATE_REGEX = /\[\\*(?:[\w:]+)\\*\]/i;

const defaultOptions = {
  cwd: null,
  force: false,
  groups: [],
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
    const { groups, globOptions, force } = this.options;

    const logger = compilation.getLogger(PLUGIN_NAME);

    logger.debug('Merging JSONs.');

    const assetsPromises = groups.map(async (group) => {
      const { files, pattern } = group;
      const { to: outputPath, transform, transformFile } = group;

      if (this.options.mergeFn) {
        logger.debug('Using custom merge function.');
      }

      const mergeFn = this.options.mergeFn || Object.assign;

      let filesToMerge = [];

      if (pattern) {
        filesToMerge = await fg(pattern, {
          cwd: context,
          ignore: ['**/!(*.json)'],
          absolute: true,
          ...group.globOptions || globOptions,
        });
      } else {
        filesToMerge = files.map((file) => (path.isAbsolute(file) ? file : path.resolve(context, file)));
      }

      const filesPromises = filesToMerge.map(async (filePath) => {
        const fileExists = fs.existsSync(filePath);

        if (!fileExists) {
          const err = `File does not exist: ${filePath}`;
          throw new Error(err);
        }

        // add file to webpack dependencies to watch
        compilation.fileDependencies.add(filePath);

        // read json
        logger.debug('Reading file:', filePath);
        const jsonStr = await fs.promises.readFile(filePath, 'utf-8');

        logger.debug('File read successfully:', filePath);

        const json = JSON.parse(jsonStr);
        const transformedJson = typeof transformFile === 'function' ? transformFile(filePath, json) : json;
        return transformedJson;
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
