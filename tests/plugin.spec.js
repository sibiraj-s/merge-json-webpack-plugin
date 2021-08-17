const fs = require('fs/promises');
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
  const exptectedJson = JSON.parse(await fs.readFile(expectedFilePath, 'utf8'));
  const mergedJson = JSON.parse(await fs.readFile(outFilePath, 'utf8'));
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

  const mergedJson = await fs.readFile(outFilePath, 'utf8');
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

  const mergedJson = await fs.readFile(outFilePath, 'utf8');
  expect(mergedJson.split('\n').length).not.toBe(1);
});

test('should able to read pattern via glob', async () => {
  const dirName = 'glob';

  const compiler = getCompiler();

  const options = {
    group: [{
      pattern: `${dirName}/*.json`,
      to: outFileName,
    }],
  };

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
  await match(dirName);
});

test('should ignore files other than json by default when pattern used (glob)', async () => {
  const dirName = 'glob';

  const compiler = getCompiler();

  const options = {
    group: [{
      pattern: `${dirName}/*`,
      to: outFileName,
    }],
  };

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
  await match(dirName);
});

test('should invoke transform function', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const compiler = getCompiler();
  const transform = jest.fn().mockResolvedValue({});

  const options = {
    group: [{
      files,
      transform,
      to: outFileName,
    }],
  };

  const mock = jest.fn();

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);
  mock();

  expect(transform).toHaveBeenCalled();
  expect(transform).toHaveBeenCalledBefore(mock);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
});

test('should be able to modify output via transform function', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const compiler = getCompiler();

  const mockJson = { x: 1 };
  const transform = jest.fn().mockResolvedValue(mockJson);

  const options = {
    group: [{
      files,
      transform,
      to: outFileName,
    }],
  };

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);

  expect(transform).toHaveBeenCalled();

  const mergedJson = JSON.parse(await fs.readFile(outFilePath, 'utf8'));
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

  expect(stats.compilation.assets).toMatchSnapshot();

  const distFiles = await glob('merged-[a-z0-9]*.json', { cwd: distDir });
  expect(distFiles.length).toBe(1);
});

test('should interpolate name correctly with hashSalt', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const compiler = getCompiler({
    hashSalt: 'salt',
  });

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

  expect(stats.compilation.assets).toMatchSnapshot();

  const distFiles = await glob('merged-[a-z0-9]*.json', { cwd: distDir });
  expect(distFiles.length).toBe(1);
});

test('should not update the an asset if it already exists', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const compiler = getCompiler();

  const options = {
    group: [{
      files,
      to: outFileName,
    }, {
      files,
      to: outFileName,
    }],
  };

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);
  const statString = stats.toString({ colors: true });

  await match(dirName);

  expect(statString).toContain(`Skipping file ${outFileName} already exist`);
  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
});

test('should forcefully update the an asset if it already exists', async () => {
  const dirName = 'default';
  const files = await getFiles(dirName);

  const compiler = getCompiler();

  const options = {
    force: true,
    group: [{
      files,
      to: outFileName,
    }, {
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

test('should be able to concat arrays', async () => {
  const dirName = 'concat-arrays';
  const files = await getFiles(dirName);

  const compiler = getCompiler();

  const options = {
    force: true,
    group: [{
      files,
      to: outFileName,
    }],
    mergeFn: (prev, current) => prev.concat(current),
  };

  new MergeJsonPlugin(options).apply(compiler);
  const stats = await compile(compiler);

  await match(dirName);

  expect(stats.compilation.errors).toEqual([]);
  expect(stats.compilation.warnings).toEqual([]);
});
