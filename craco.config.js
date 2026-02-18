const webpack = require("webpack");
// const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  webpack: {
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          process: "process/browser.js",
          Buffer: ["buffer", "Buffer"],
        }),
        new webpack.DefinePlugin({
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        }),
      ],
    },
    configure: (webpackConfig) => {
      // Example: Add a custom loader
      // webpackConfig.plugins.push(new NodePolyfillPlugin());
      // webpackConfig.plugins.push(
      //   new webpackConfig.ProvidePlugin({
      //     process: "process/browser",
      //   })
      // );
      // webpackConfig.plugins.push(
      //   new webpack.DefinePlugin({
      //     "process.env": JSON.stringify(process.env),
      //   })
      // );
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        assert: require.resolve("assert"),
        buffer: require.resolve("buffer"),
        process: require.resolve("process/browser.js"),
      };
      return webpackConfig;
    },
  },
};
