const MergeJsonPlugin = require('../src');
const getCompiler = require('./helpers/getCompiler');

const tests = [
  [
    'group is empty',
    {
      options: {
        group: [],
      },
      expectedErrMessage: 'group should be an non-empty array',
    },
  ],
  [
    'group is not an array',
    {
      options: {
        group: null,
      },
      expectedErrMessage: 'group should be an array',
    },
  ],
  [
    'files is empty',
    {
      options: {
        group: [{
          files: [],
          to: 'outpath',
        }],
      },
      expectedErrMessage: 'files should be an non-empty array',
    },
  ],
  [
    'files has an empty string',
    {
      options: {
        group: [{
          files: ['file', ''],
          to: 'outpath',
        }],
      },
      expectedErrMessage: 'files[1] should be an non-empty string',
    },
  ],
  [
    'destination is not provided',
    {
      options: {
        group: [{
          files: ['file'],
          to: '',
        }],
      },
      expectedErrMessage: 'to should be an non-empty string',
    },
  ],
  [
    'option has unknown properties',
    {
      options: {
        unknownProp: '',
        group: [{
          files: ['file'],
          to: 'outPath',
        }],
      },
      expectedErrMessage: 'options has an unknown property \'unknownProp\'',
    },
  ],
  [
    'group has unknown properties',
    {
      options: {
        group: [{
          unknownProp: '',
          files: ['file'],
          to: 'outPath',
        }],
      },
      expectedErrMessage: 'options.group[0] has an unknown property \'unknownProp\'',
    },
  ],
  [
    'mergeFn is not a function',
    {
      options: {
        mergeFn: '',
        group: [{
          unknownProp: '',
          files: ['file'],
          to: 'outPath',
        }],
      },
      expectedErrMessage: 'mergeFn should be an instance of function',
    },
  ],
  [
    'group is not defined',
    {
      options: {
        mergeFn: () => {},
      },
      expectedErrMessage: 'options misses the property \'group\'',
    },
  ],
];

test.each(tests)('should throw schema validation error if %s', (_, { options, expectedErrMessage }) => {
  try {
    const compiler = getCompiler();
    new MergeJsonPlugin(options).apply(compiler);
  } catch (err) {
    expect(err).toBeTruthy();
    expect(err.name).toBe('ValidationError');
    expect(err.message).toContain(expectedErrMessage);
  }
});
