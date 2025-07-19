const path = require('path');

module.exports = {
  entry: './src/dom-render.js', 
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],  
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,      
        type: 'asset/resource',               
      },
    ],
  },
  devServer: {
    static: [
      { directory: path.join(__dirname, 'public') }, 
      { directory: path.join(__dirname, 'dist') },   
    ],
    compress: true,
    port: 9000,
  },
  mode: 'development'
};
