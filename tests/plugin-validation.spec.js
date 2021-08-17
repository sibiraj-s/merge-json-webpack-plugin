const { ValidationError } = require('schema-utils');
const { noop } = require('lodash');

const MergeJsonPlugin = require('../src');
const getCompiler = require('./helpers/getCompiler');

const tests = [
  [
    'group is empty',
    {
      options: {
        group: [],
      },
      expectedErrMessage: 'group should be a non-empty array',
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
      expectedErrMessage: 'files should be a non-empty array',
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
      expectedErrMessage: 'files\\[1\\] should be a non-empty string',
    },
  ],
  [
    'pattern is empty',
    {
      options: {
        group: [{
          pattern: [],
          to: 'outpath',
        }],
      },
      expectedErrMessage: 'pattern should be a non-empty array',
    },
  ],
  [
    'pattern has an empty string',
    {
      options: {
        group: [{
          pattern: ['fastglob', ''],
          to: 'outpath',
        }],
      },
      expectedErrMessage: 'pattern\\[1\\] should be a non-empty string',
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
      expectedErrMessage: 'to should be a non-empty string',
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
      expectedErrMessage: 'options.group\\[0\\] has an unknown property \'unknownProp\'',
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
        mergeFn: noop,
      },
      expectedErrMessage: 'options misses the property \'group\'',
    },
  ],
  [
    'force is not boolean',
    {
      options: {
        force: '',
        group: [{
          unknownProp: '',
          files: ['file'],
          to: 'outPath',
        }],
      },
      expectedErrMessage: 'force should be a boolean',
    },
  ],
];

test.each(tests)('should throw schema validation error if %s', (_, { options, expectedErrMessage }) => {
  const t = () => {
    const compiler = getCompiler();
    new MergeJsonPlugin(options).apply(compiler);
  };

  expect(t).toThrowError(ValidationError);
  expect(t).toThrowWithMessage(Error, new RegExp(expectedErrMessage));
});
