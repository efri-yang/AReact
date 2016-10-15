module.exports={
	entry:"./main.js",

	output:{
		filename:'app.js'
	},
	loaders: [{
	    test: /\.css$/,
	    loader: 'style!css'
	}]
}