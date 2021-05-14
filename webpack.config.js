const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require("path");

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      title: "A WebGL Experiment",
      template: './src/index.html'
    }),
    new CleanWebpackPlugin()
  ],
  entry: {
    main: path.resolve(__dirname, "./src/index.js")
  },
  output: {
    path: path.resolve(__dirname, 'deploy'),
    publicPath: './',
    filename: '[name].bundle.js'
  },
  devServer: {
    contentBase: './deploy',
    open: true
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      },
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            fix: true
          }
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(?:ico|gif|png|jpe?g)$/i,
        type: "asset/resource",
        generator: {
          filename: '[path][name][ext]'
        }
      },
      {
        test: /\.obj$/,
        loader: 'webpack-obj-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      assets: path.resolve(__dirname, 'assets'),
      src: path.resolve(__dirname, 'src')
    }
  }
}
