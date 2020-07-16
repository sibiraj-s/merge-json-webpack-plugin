const compile = (compiler) => new Promise((resolve, reject) => {
  compiler.run((err, stats) => {
    if (err) {
      return reject(err);
    }

    return setTimeout(() => resolve(stats), 200);
  });
});

module.exports = compile;
