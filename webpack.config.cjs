const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require("webpack");
const resolve = dir => path.resolve(__dirname, dir);

const config = {
	entry: {
		// where webpack starts to build the bundle. All other deps are imported from here.
		app: resolve("./src/main.js"),
		vendor: ['phaser']
	},
	output: {
		filename: '[name].[hash].js',
		path: resolve("dist")
	},
	plugins: [
		new HtmlWebpackPlugin({
			hash: true,
			template: "./src/index.html",
			filename: "index.html", //relative to root of the application
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ from: "assets", to: "assets" },
			]
		}),
	],
	module: {
		rules: [
			{
				test: /\.(gif|png|jpe?g|svg|xml|ogg)$/i,
				use: "file-loader"
			},
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	optimization: {
		splitChunks: {
			chunks: 'all'
		}
	},

	devServer: {
		/** following two lines allow (less-secure) access from the Local network. */
		allowedHosts: "all",
		host: "0.0.0.0",
	}
};

module.exports = (env, argv) => {
	if (argv.mode === 'development') {
		// note that by default, development mode uses evil eval.
		// we must set the devtool explicitly to change this.
		config.devtool = 'inline-source-map';
	}
	if (argv.mode === 'production') {
		// do not enable source-map
	}
	return config;
};
