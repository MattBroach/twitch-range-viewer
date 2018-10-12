var HtmlWebpackPlugin = require('html-webpack-plugin'),
  CleanWebpackPlugin = require('clean-webpack-plugin'),
  MiniCssExtractPlugin = require("mini-css-extract-plugin"),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  path = require('path');

function getDevTool() {
    if (process.env.NODE_ENV !== 'production') {
        return 'source-map'; //enables source map
    }
    
    return false; 
}

module.exports = {
  entry: {
    ranges: './src/js/ranges.js',
    config: './src/js/config.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  devtool: getDevTool(),
  mode: process.env.NODE_ENV || 'development',
  module: {
    rules: [
      { 
        test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ 
      },
      {
        test: /\.scss$/,
        use: [
          process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.js$/,
        loader: 'string-replace-loader',
        options: {
          search: '!VALUES_SRC!',
          replace: process.env.VALUES_SRC || 'https://s3.amazonaws.com/plays-itself-filters/filters.json',
        }
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
        filename: "[name].css",
    }),
    new HtmlWebpackPlugin({
      title: 'Filter Viewer',
      template: 'src/html/panel.html',
      filename: 'panel.html',
      chunks: ['ranges'],
    }),
    new HtmlWebpackPlugin({
      title: 'Filter Viewer Config',
      template: 'src/html/config.html',
      filename: 'config.html',
      chunks: ['config'],
    }),
    new HtmlWebpackPlugin({
      title: 'Filter Viewer Live Config',
      template: 'src/html/config.html',
      filename: 'live_config.html',
      chunks: ['config'],
    }),
    new CleanWebpackPlugin(['dist']),
    new CopyWebpackPlugin([{
      from: 'src/images/*',
      to: 'images/[name].[ext]',
    }]),
  ]
};
