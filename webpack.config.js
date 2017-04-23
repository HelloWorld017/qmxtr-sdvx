const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const cssLoaders = [
	{
		loader: 'css-loader',
		options: {
			importLoaders: 1
		}
	},
	'postcss-loader'
];

const cssExtract = ExtractTextPlugin.extract({
	use: cssLoaders,
	fallback: 'vue-style-loader'
});

const lessExtract = ExtractTextPlugin.extract({
	use: cssLoaders.concat('less-loader'),
	fallback: 'vue-style-loader'
});

module.exports = {
	entry: path.resolve(__dirname, 'lib', 'index.js'),

	output: {
		path: path.resolve(__dirname, 'dist'),
		publicPath: '',
		filename: 'qmxtr-sdvx.bundle.js',
		library: 'SDVXPlugin',
		libraryTarget: 'umd'
	},

	module: {
		rules: [
			{
				test:/\.vue$/,
				loader: 'vue-loader',
				options: {
					loaders: {
						'less': lessExtract,
						'css': cssExtract,
						'js': {
							loader: 'babel-loader',
							options: {
								presets: ['env']
							}
						}
					}
				}
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				query: {
					presets: ['env']
				},
				exclude: /node_modules/
			},
			{
				test: /\.less$/,
				loader: lessExtract
			},
			{
				test: /\.css$/,
				loader: cssExtract
			},
			{
				test: /\.(png|jpe?g|gif|svg|ttf|woff2?|eot|wav)$/,
				loader: 'file-loader',
				options: {
					name: 'files/[name].[ext]?[hash]'
				}
			}
		]
	},

	plugins: [
		new ExtractTextPlugin('qmxtr-sdvx.bundle.css')
	],

	devtool: '#eval-source-map'
};

if(process.env.NODE_ENV === 'production'){
	module.exports.devtool = '#source-map';
	module.exports.plugins = (module.exports.plugins || []).concat([
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"'
			}
		})
	]);
}
