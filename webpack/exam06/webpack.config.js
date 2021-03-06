var webpack = require('webpack');
var path=require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
	devServer: { 
		inline: true,
		hot: true,
		port:2000,
		open:true,
		contentBase:'./build/'
	},
	entry:[
		'webpack/hot/dev-server',
      	'webpack-dev-server/client?http://localhost:3000',
		 path.resolve(__dirname,"src/entry.js")
	],
	output:{
		path:path.resolve(__dirname,"build"),
		filename:'bundle.js'
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
    	new webpack.HotModuleReplacementPlugin(),
    	new webpack.ProvidePlugin({	//加载jq
            $: 'jquery'
        }),
    	new ExtractTextPlugin("css/[name].css"),	//单独使用style标签加载css并设置其路径
    	new webpack.optimize.UglifyJsPlugin({	//压缩代码
		    compress: {
		        warnings: false
		    },
		    except: ['$super', '$', 'exports', 'require']	//排除关键字
		}),
    	new HtmlWebpackPlugin({						//根据模板插入css/js等生成最终HTML
    		
			filename:'index.html',	//生成的html存放路径，相对于 path
			template:'./src/index.html',	//html模板路径
			inject:true,	//允许插件修改哪些内容，包括head与body
			hash:true,	//为静态资源生成hash值
			minify:{	//压缩HTML文件
				removeComments:true,	//移除HTML中的注释
				collapseWhitespace:true	//删除空白符与换行符
			}
		})
  	]

}