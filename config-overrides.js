module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    constants: require.resolve("constants-browserify"),
  };
  return config;
};
