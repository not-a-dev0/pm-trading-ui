const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const path = require('path')
const webpack = require('webpack')

const pkg = require('./package.json')

const configLoader = require('./scripts/configuration')

module.exports = (env = {}) => {
  const configEnvVars = env.GNOSIS_CONFIG || {}

  const gnosisEnv = process.env.GNOSIS_ENV

  console.info(`[WEBPACK-DEV]: using env configuration: '${gnosisEnv || 'default configuration (local)'}'`)
  const config = configLoader(gnosisEnv, configEnvVars)

  const version = env.BUILD_VERSION || pkg.version
  const commitId = `${env.TRAVIS_BRANCH || 'local'}@${env.TRAVIS_COMMIT || 'SNAPSHOT'}`

  return {
    context: `${__dirname}/src`,
    devtool: 'eval-source-map',
    mode: 'development',
    resolve: {
      symlinks: false,
      alias: {
        '~style': `${__dirname}/src/scss`,
        '~assets': `${__dirname}/src/assets`,
      },
      modules: [
        `${__dirname}/src`,
        `${__dirname}/package.json`,
        'node_modules',
        `${__dirname}/../gnosis.js`,
        `${__dirname}/../gnosis.js/node_modules`,
      ],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules)/,
          use: 'babel-loader',
        },
        {
          test: /\.(jpe?g|png|svg)$/i,
          loader: 'file-loader?hash=sha512&digest=hex&name=img/[hash].[ext]',
        },

        {
          test: /\.(scss|css)$/,
          oneOf: [
            {
              resourceQuery: /^\?raw$/,
              use: [
                'style-loader',
                {
                  loader: 'css-loader',
                  options: {
                    sourceMap: true,
                    importLoaders: 2,
                  },
                },
                {
                  loader: 'postcss-loader',
                  options: {
                    sourceMap: true,
                  },
                },
                {
                  loader: 'sass-loader',
                  options: { sourceMap: true, includePaths: [path.resolve(`${__dirname}/src`)] },
                },
              ],
            },
            {
              use: [
                'style-loader',
                {
                  loader: 'css-loader',
                  options: {
                    sourceMap: true,
                    modules: true,
                    localIdentName: '[name]__[local]___[hash:base64:5]',
                    importLoaders: 2,
                  },
                },
                {
                  loader: 'postcss-loader',
                  options: {
                    sourceMap: true,
                  },
                },
                { loader: 'sass-loader', options: { sourceMap: true, includePaths: [path.resolve(`${__dirname}/src`)] } },
              ],
            },
          ],
        },
        {
          test: /\.(ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
          loader: 'file-loader?name=fonts/[name].[ext]',
        },
        {
          test: /\.(md|txt)$/,
          use: 'raw-loader',
        },
      ],
    },
    devServer: {
      disableHostCheck: true,
      historyApiFallback: {
        rewrites: [
          { from: /^\/embedded.*/, to: '/embedded/index.html' },
          { from: /./, to: '/index.html' },
        ],
      },
      hot: true,
      port: 5000,
      proxy: {
        '/api': {
          target: config.gnosisdb.host,
          secure: false,
        },
      },
      watchOptions: {
        ignored: /node_modules/,
      },
      contentBase: [`${__dirname}/src`],
    },
    plugins: [
      new CaseSensitivePathsPlugin(),
      new FaviconsWebpackPlugin({
        logo: config.logo.favicon,
        // Generate a cache file with control hashes and
        // don't rebuild the favicons until those hashes change
        persistentCache: true,
        icons: {
          android: false,
          appleIcon: false,
          appleStartup: false,
          coast: false,
          favicons: true,
          firefox: false,
          opengraph: false,
          twitter: false,
          yandex: false,
          windows: false,
        },
        inject: true,
      }),
      new webpack.EnvironmentPlugin({
        VERSION: `${version}#${commitId}`,
        NODE_ENV: 'development',
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env.FALLBACK_CONFIG': `"${Buffer.from(JSON.stringify(config)).toString('base64')}"`,
      }),
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
      new CopyWebpackPlugin([{ from: `${__dirname}/src/assets`, to: `${__dirname}/dist/assets` }]),
    ],
  }
}
