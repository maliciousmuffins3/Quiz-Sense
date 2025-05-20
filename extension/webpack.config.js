const path = require("path");

module.exports = {
  entry: {
    content: "./src/content.js",
    background: "./src/background.js"
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(process.cwd(), 'dist'),
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            sourceType: "unambiguous",
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: { chrome: "90" },
                  modules: false,
                },
              ],
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".mjs"],
  },
};
