const path = require('path')
const EslintWebpackPLugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssminimizerWebpackPlugin = require('css-minimizer-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'
console.log(process.env.NODE_ENV)

const getStyleLoaders = (pre) => {
  return [
    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
    'css-loader',
    { // 配合package.json中的browserslist处理css的兼容性
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: ['postcss-preset-env']
        }
      }
    },
    pre && {
    loader: pre,
      options: pre === 'less-loader' ? {
        // antd自定义主题配置
        lessOptions: {
          modifyVars: {'@primary-color': '#d33009'},
          javascriptEnabled: true
        }
      } : {}
    }
  ].filter(Boolean)
}

module.exports = {
  entry: {
    path: './src/main.js',
  },
  output: {
    path: isProduction ? path.resolve(__dirname, '../dist') : undefined,
    filename: isProduction ? 'static/js/[name].[contenthash:10].js' : 'static/js/[name].js',
    chunkFilename: isProduction ? 'static/js/[name].[contenthash:10].chunk.js' : 'static/js/[name].chunk.js',
    assetModuleFilename: 'static/media/[hash:10][ext][query]',
    clean: true
  },
  module: {
    rules: [
      // css
      {
        test: /\.css$/,
        use: getStyleLoaders()
      },
      {
        test: /\.less$/,
        use: getStyleLoaders('less-loader')
      },
      {
        test: /\.s[ac]ss$/,
        use: getStyleLoaders('sass-loader')
      },
      {
        test: /\.styl$/,
        use: getStyleLoaders('stylus-loader')
      },
      // 图片
      {
        test: /\.(jpe?g|png|svg|gif|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10*1024
          }
        }
      },
      // 处理其他资源 字体 图标等
      {
        test: /\.woff2|ttf/,
        type: 'asset/resource' // 原封不动输出
      },
      // js
      {
        test: /\.jsx?$/,
        include: path.resolve(__dirname, '../src'),
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          cacheCompression: false, // 缓存的内容不压缩
          plugins: [
            !isProduction && 'react-refresh/babel'
          ].filter(Boolean) // HTML，js热更新
        }
      }
    ]
  },
  plugins: [
    new EslintWebpackPLugin({
      context: path.resolve(__dirname, '../src'),
      exclude: 'node_modules',
      cache: true,
      cacheLocation: path.resolve(__dirname, '../node_modules/.cache/.eslintCache')
      // 多进程暂不考虑，项目文件太小，多进程开销过大，得不偿失
    }),
    // 处理HTML
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html')
    }),
    isProduction && new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:10].css',
      chunkFilename: 'static/css/[name].[contenthash:10].chunk.css'
    }),
    isProduction && new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../public'),
          to: path.resolve(__dirname, '../dist'),
          globOptions: {
            ignore: ['**/index.html']
          }
        }
      ]
    }),
    !isProduction && new ReactRefreshWebpackPlugin() // HTML，js热更新
  ].filter(Boolean),
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // react react-dom react-router-dom 一起打包成一个js文件 (开发中有许多比较大的库单独打包，实现按需加载，并行加载)
        react: {
          test: /[\\/]node_modules[\\/]react(.*)?[\\/]/,
          name: 'chunk-react',
          priority: 40
        },
        // antd 单独打包
        antd: {
          test: /[\\/]node_modules[\\/]antd[\\/]/,
          name: 'chunk-antd',
          priority: 30
        },
        // 剩下的node_modules单独打包
        libs: {
          test: /[\\/]node_modules[\\/]libs[\\/]/,
          name: 'chunk-libs',
          priority: 20
        }
      }
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`
    },
    // minimize: isProduction, // 是否进行压缩，true
    minimize: false, // 是否进行压缩，true
    minimizer: [ // 压缩
      new CssminimizerWebpackPlugin(),
      new TerserWebpackPlugin(),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              ["gifsicle", {interlaced: true}],
              ["jpegtran", {progressive: true}],
              ["optipng", {optimizationLevel: 5}],
              [
                "svgo",
                {
                  plugins: [
                    'preset-default',
                    'prefixIds',
                    {
                      name: 'sortAttrs',
                      params: {
                        xmlnsOrder: 'alphabetical'
                      }
                    }
                  ]
                },
              ],
            ],
          }
        }
      })
    ]
  },
  // webpack解析模板加载选项
  resolve: {
    extensions: ['.jsx','.js', '.json'] // 自动补全扩展名
  },
  devServer: {
    host: 'localhost',
    port: 8080,
    open: true,
    hot: true,
    // ↓路由刷新页面404，访问地址的时候到devServer里找资源（source下找资源）但是dist里只有一个index.html，没有一个叫当前path的（如about） 解决：刷新还是返回到index.html
    historyApiFallback: true
  },
  performance: false // 关闭打包性能分析，提高打包速度
}
