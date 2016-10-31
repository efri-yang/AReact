var webpack = require('webpack');
var path=require('path');
module.exports = {
	devServer: { 
		inline: true,
		hot: true,
		port:4000, 
		open:true,
		contentBase:'./build/'
	},
	entry:[
		'webpack/hot/dev-server',
      	'webpack-dev-server/client?http://localhost:4000',
		"./src/entry.js"
	],
	output:{
		path:path.resolve(__dirname,'src'),
		filename: "js/[name].js",
        chunkFilename: "js/[id].chunk.js"
	},
	module: {
        loaders: [
            {test: /\.css$/, loader:ExtractTextPlugin.extract("style", "css") },
            {test: /\.scss$/, loader: "style!css!sass"},
            {test: /\.html$/, loader: "html"},
            {test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192&name=./img/[hash].[ext]'}
        ]
    },
    plugins: [
     	new webpack.BannerPlugin('xxxxxx'),
    	new webpack.HotModuleReplacementPlugin()
    	
  	]

}