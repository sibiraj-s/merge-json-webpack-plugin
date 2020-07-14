const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const glob = require('fast-glob');
const _ = require('lodash');

const MergeJsonPlugin = require('..');
const webpackConfig = require('./fixtures/webpack.config');

const fixturesDir = path.resolve(__dirname, 'fixtures');
const outFileName = 'merged.json';
const outFilePath = path.resolve(__dirname, 'dist', outFileName);

const wp = (config) => new Promise((resolve, reject) => {
  webpack(config).run((err, stats) => {
    if (err) {
      return reject(err);
    }

    setTimeout(() => resolve(stats), 100);
  });
});

const testDir = (d) => path.resolve(fixturesDir, d);

const getFiles = async (dirName) => {
  const dir = testDir(dirName);

  const files = await glob('*.json', {
    cwd: dir,
    ignore: 'expected.json',
  });

  return files.map((filename) => `${dir}/${filename}`);
};

const match = async (dirName) => {
  const dir = testDir(dirName);

  const expectedFilePath = path.resolve(dir, 'expected.json');
  const exptectedJson = JSON.parse(await fs.promises.readFile(expectedFilePath, 'utf8'));
  const mergedJson = JSON.parse(await fs.promises.readFile(outFilePath, 'utf8'));
  expect(exptectedJson).toMatchObject(mergedJson);
};

test('should merge json with basic options', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const plugins = [
    new MergeJsonPlugin({
      group: [{
        files,
        to: outFileName,
      }],
    }),
  ];

  const config = webpackConfig({ plugins });
  const stats = await wp(config);

  await match(dirName);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
});

test('should add to webpack stats if file does not exist', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const plugins = [
    new MergeJsonPlugin({
      group: [{
        files: files.concat(['invalid.json']),
        to: outFileName,
      }],
    }),
  ];

  const config = webpackConfig({ plugins });
  const stats = await wp(config);

  await match(dirName);
  expect(stats.hasErrors()).toBeTruthy();
  expect(stats.compilation.errors.some((e) => e.includes('File does not exist'))).toBeTruthy();
});

test('should thorw errors for invalid json file', async () => {
  const dirName = 'error';
  const files = await getFiles(dirName);

  const plugins = [
    new MergeJsonPlugin({
      group: [{
        files,
        to: outFileName,
      }],
    }),
  ];

  const config = webpackConfig({ plugins });
  const stats = await wp(config);

  expect(stats.hasErrors()).toBeTruthy();
});

test('should merge correctly with custom merge function', async () => {
  const dirName = 'deep-merge';
  const files = await getFiles(dirName);

  const plugins = [
    new MergeJsonPlugin({
      mergeFn: _.merge,
      group: [{
        files,
        to: outFileName,
      }],
    }),
  ];

  const config = webpackConfig({ plugins });
  const stats = await wp(config);
  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);

  await match(dirName);
});

test('should do nothing if group is empty', async () => {
  const plugins = [
    new MergeJsonPlugin({
      group: [],
    }),
  ];

  const config = webpackConfig({ plugins });
  const stats = await wp(config);
  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
});

test('should do nothing if group is not an array', async () => {
  const plugins = [
    new MergeJsonPlugin({
      group: null,
    }),
  ];

  const config = webpackConfig({ plugins });
  const stats = await wp(config);
  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
});

test('should do nothing if files is empty', async () => {
  const plugins = [
    new MergeJsonPlugin({
      group: [{
        files: [],
        to: outFileName,
      }],
    }),
  ];

  const config = webpackConfig({ plugins });
  const stats = await wp(config);
  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
});

test('should add errors to webpack compilation if destination is not provided', async () => {
  const plugins = [
    new MergeJsonPlugin({
      group: [{
        to: null,
      }],
    }),
  ];

  const config = webpackConfig({ plugins });
  const stats = await wp(config);
  expect(stats.compilation.warnings).toEqual([]);
  expect(stats.compilation.errors).not.toEqual([]);
  expect(stats.compilation.errors.some((e) => e.includes('Destination path is required'))).toBeTruthy();
});

test('should be able minify files by default', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const plugins = [
    new MergeJsonPlugin({
      minify: true,
      group: [{
        files,
        to: outFileName,
      }],
    }),
  ];

  const config = webpackConfig({ plugins });
  const stats = await wp(config);
  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);

  const mergedJson = await fs.promises.readFile(outFilePath, 'utf8');
  expect(mergedJson.split('\n').length).toBe(1);
});

test('should not minify files when specified', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const plugins = [
    new MergeJsonPlugin({
      minify: false,
      group: [{
        files,
        to: outFileName,
      }],
    }),
  ];

  const config = webpackConfig({ plugins });
  const stats = await wp(config);
  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);

  const mergedJson = await fs.promises.readFile(outFilePath, 'utf8');
  expect(mergedJson.split('\n').length).not.toBe(1);
});

test('should able to read files via glob', async () => {
  const dirName = 'glob';

  const plugins = [
    new MergeJsonPlugin({
      group: [{
        files: `${dirName}/*.json`,
        to: outFileName,
      }],
    }),
  ];

  const config = webpackConfig({ plugins });
  const stats = await wp(config);
  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
  await match(dirName);
});

test('should ignore files other than json by default when files selected via glob', async () => {
  const dirName = 'glob';

  const plugins = [
    new MergeJsonPlugin({
      group: [{
        files: `${dirName}/*`,
        to: outFileName,
      }],
    }),
  ];

  const config = webpackConfig({ plugins });
  const stats = await wp(config);
  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
  await match(dirName);
});

test('should invoke beforeEmit function', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const beforeEmit = jest.fn().mockResolvedValue({});

  const plugins = [
    new MergeJsonPlugin({
      group: [{
        files,
        beforeEmit,
        to: outFileName,
      }],
    }),
  ];

  const mock = jest.fn();

  const config = webpackConfig({ plugins });
  const stats = await wp(config);
  mock();

  expect(beforeEmit).toHaveBeenCalled();
  expect(beforeEmit).toHaveBeenCalledBefore(mock);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
});

test('should be able to modify output via beforeEmit function', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const mockJson = { x: 1 };
  const beforeEmit = jest.fn().mockResolvedValue(mockJson);

  const plugins = [
    new MergeJsonPlugin({
      group: [{
        files,
        beforeEmit,
        to: outFileName,
      }],
    }),
  ];

  const config = webpackConfig({ plugins });
  const stats = await wp(config);

  expect(beforeEmit).toHaveBeenCalled();

  const mergedJson = JSON.parse(await fs.promises.readFile(outFilePath, 'utf8'));
  expect(mergedJson).toMatchObject(mockJson);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
});
