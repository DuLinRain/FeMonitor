var path = require('path');

  module.exports = {
    entry: './src/index.js',
    module: {
        rules: [
          { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'femonitor.min.js',
      library: 'FeMonitor',
      libraryTarget: 'umd'
    }
  };