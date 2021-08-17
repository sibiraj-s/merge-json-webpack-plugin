const { ValidationError } = require('schema-utils');
const { noop } = require('lodash');

const MergeJsonPlugin = require('../src');
const getCompiler = require('./helpers/getCompiler');

const tests = [
  [
    'groups is empty',
    {
      options: {
        groups: [],
      },
      expectedErrMessage: 'groups should be a non-empty array',
    },
  ],
  [
    'groups is not an array',
    {
      options: {
        groups: null,
      },
      expectedErrMessage: 'groups should be an array',
    },
  ],
  [
    'files is empty',
    {
      options: {
        groups: [{
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
        groups: [{
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
        groups: [{
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
        groups: [{
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
        groups: [{
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
        groups: [{
          files: ['file'],
          to: 'outPath',
        }],
      },
      expectedErrMessage: 'options has an unknown property \'unknownProp\'',
    },
  ],
  [
    'groups has unknown properties',
    {
      options: {
        groups: [{
          unknownProp: '',
          files: ['file'],
          to: 'outPath',
        }],
      },
      expectedErrMessage: 'options.groups\\[0\\] has an unknown property \'unknownProp\'',
    },
  ],
  [
    'mergeFn is not a function',
    {
      options: {
        mergeFn: '',
        groups: [{
          unknownProp: '',
          files: ['file'],
          to: 'outPath',
        }],
      },
      expectedErrMessage: 'mergeFn should be an instance of function',
    },
  ],
  [
    'groups is not defined',
    {
      options: {
        mergeFn: noop,
      },
      expectedErrMessage: 'options misses the property \'groups\'',
    },
  ],
  [
    'force is not boolean',
    {
      options: {
        force: '',
        groups: [{
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
