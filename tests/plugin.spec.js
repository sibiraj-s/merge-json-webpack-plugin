const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');
const _ = require('lodash');

const MergeJsonPlugin = require('../src');
const getCompiler = require('./helpers/getCompiler');
const compile = require('./helpers/compile');

const fixturesDir = path.resolve(__dirname, 'fixtures');
const distDir = path.resolve(fixturesDir, 'dist');
const outFileName = 'merged.json';
const outFilePath = path.resolve(distDir, outFileName);

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

  const compiler = getCompiler();

  const options = {
    cwd: fixturesDir,
    group: [{
      files,
      to: outFileName,
    }],
  };

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);

  await match(dirName);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
});

test('should add errors to webpack stats if file does not exist', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const compiler = getCompiler();

  const options = {
    group: [{
      files: files.concat(['invalid.json']),
      to: outFileName,
    }],
  };

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);

  expect(stats.hasErrors()).toBeTruthy();
  expect(stats.compilation.errors.some((e) => e.message.includes('File does not exist'))).toBeTruthy();
});

test('should thorw errors for invalid json file', async () => {
  const dirName = 'error';
  const files = await getFiles(dirName);

  const compiler = getCompiler();

  const options = {
    group: [{
      files,
      to: outFileName,
    }],
  };

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);

  expect(stats.hasErrors()).toBeTruthy();
});

test('should merge correctly with custom merge function', async () => {
  const dirName = 'deep-merge';
  const files = await getFiles(dirName);

  const compiler = getCompiler();

  const options = {
    mergeFn: _.merge,
    group: [{
      files,
      to: outFileName,
    }],
  };

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);

  await match(dirName);
});

test('should deep merge arrays with custom merge function', async () => {
  const dirName = 'deep-merge-arrays';
  const files = await getFiles(dirName);

  const compiler = getCompiler();

  const customizer = (objValue, srcValue) => {
    if (_.isArray(objValue)) {
      return objValue.concat(srcValue);
    }

    return undefined;
  };

  const merge = (object, other) => _.mergeWith(object, other, customizer);

  const options = {
    mergeFn: merge,
    group: [{
      files,
      to: outFileName,
    }],
  };

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);

  await match(dirName);
});

test('should be able minify files by default', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const compiler = getCompiler();

  const options = {
    minify: true,
    group: [{
      files,
      to: outFileName,
    }],
  };

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);

  const mergedJson = await fs.promises.readFile(outFilePath, 'utf8');
  expect(mergedJson.split('\n').length).toBe(1);
});

test('should not minify files when specified', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const compiler = getCompiler();

  const options = {
    minify: false,
    group: [{
      files,
      to: outFileName,
    }],
  };

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);

  const mergedJson = await fs.promises.readFile(outFilePath, 'utf8');
  expect(mergedJson.split('\n').length).not.toBe(1);
});

test('should able to read files via glob', async () => {
  const dirName = 'glob';

  const compiler = getCompiler();

  const options = {
    group: [{
      files: `${dirName}/*.json`,
      to: outFileName,
    }],
  };

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
  await match(dirName);
});

test('should ignore files other than json by default when files selected via glob', async () => {
  const dirName = 'glob';

  const compiler = getCompiler();

  const options = {
    group: [{
      files: `${dirName}/*`,
      to: outFileName,
    }],
  };

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
  await match(dirName);
});

test('should invoke beforeEmit function', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const compiler = getCompiler();
  const beforeEmit = jest.fn().mockResolvedValue({});

  const options = {
    group: [{
      files,
      beforeEmit,
      to: outFileName,
    }],
  };

  const mock = jest.fn();

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);
  mock();

  expect(beforeEmit).toHaveBeenCalled();
  expect(beforeEmit).toHaveBeenCalledBefore(mock);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
});

test('should be able to modify output via beforeEmit function', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const compiler = getCompiler();

  const mockJson = { x: 1 };
  const beforeEmit = jest.fn().mockResolvedValue(mockJson);

  const options = {
    group: [{
      files,
      beforeEmit,
      to: outFileName,
    }],
  };

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);

  expect(beforeEmit).toHaveBeenCalled();

  const mergedJson = JSON.parse(await fs.promises.readFile(outFilePath, 'utf8'));
  expect(mergedJson).toMatchObject(mockJson);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
});

test('should interpolate name correctly', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const compiler = getCompiler();

  const options = {
    cwd: fixturesDir,
    group: [{
      files,
      to: 'merged-[contenthash].json',
    }],
  };

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);

  const distFiles = await glob('merged-[a-z0-9]*.json', { cwd: distDir });
  expect(distFiles.length).toBe(1);
});
