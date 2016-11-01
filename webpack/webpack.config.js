var webpack = require('webpack');
var path=require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
	devServer: { 
		inline: true,
		hot: true,
		port:3000,
		open:true,
		contentBase:'./build/'
	},
	entry:{
			test1:path.resolve(__dirname,"src/test1.js"),
			test2:path.resolve(__dirname,"src/test2.js"),
			test3:path.resolve(__dirname,"src/test3.js")
	},
	output:{
		path:path.resolve(__dirname,"build"),
		filename:'[name].js'
	},
	module: {
        loaders: [
            {test: /\.css$/, loader:ExtractTextPlugin.extract("style", "css") },
            {test: /\.scss$/, loader: ExtractTextPlugin.extract('style', "css!sass")},
            {test: /\.html$/, loader: "html"},
            {test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192&name=./img/[hash].[ext]'}
        ]
    },
    plugins: [
     	new webpack.BannerPlugin('xxxxxx'),
    	new webpack.HotModuleReplacementPlugin(),
    	new webpack.optimize.CommonsChunkPlugin('common.js'),
    	new webpack.ProvidePlugin({	//加载jq
            $: 'jquery'
        }),
    	new ExtractTextPlugin("[name].css"),	//单独使用style标签加载css并设置其路径
  //   	new webpack.optimize.UglifyJsPlugin({	//压缩代码
		//     compress: {
		//         warnings: false
		//     },
		//     except: ['$super', '$', 'exports', 'require']	//排除关键字
		// }),
    	new HtmlWebpackPlugin({						//根据模板插入css/js等生成最终HTML
    		
			filename:'index.html',	//生成的html存放路径，相对于 path
			template:'./src/index.html',	//html模板路径
			inject:true,	//允许插件修改哪些内容，包括head与body
			hash:true,	//为静态资源生成hash值
			// minify:{	//压缩HTML文件
			// 	removeComments:false,	//移除HTML中的注释
			// 	collapseWhitespace:false	//删除空白符与换行符
			// }
		})
  	]

}