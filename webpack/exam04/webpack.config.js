var webpack = require('webpack');
var path=require('path');
module.exports = {
	devServer: { 
		inline: true,
		hot: true,
		port:3008, 
		open:true
	},
	entry:[
		'webpack/hot/dev-server',
      	'webpack-dev-server/client?http://localhost:3008',
		"./entry.js"
	],
	output:{
		path:__dirname,
		filename:'bundle.js'
	},
	module: {
        loaders: [
            {test: /\.css$/, loader: 'style!css'},
            {test: /\.scss$/, loader: "style!css!sass"},
            {test: /\.html$/, loader: "html"}
        ]
    },
    plugins: [
     	new webpack.BannerPlugin('xxxxxx'),
    	new webpack.HotModuleReplacementPlugin()
  	]

}