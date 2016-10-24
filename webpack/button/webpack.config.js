var webpack = require('Webpack');
module.exports = {
    entry: './src',
    output: {
        path:     'builds',
        filename: 'bundle.js',
        chunkFilename: '[name].bundle.js',
        publicPath: 'builds/',
    },
    module: {
        loaders: [{
            test: /\.js/,
            loader: 'babel',
            include: /src/,
        },
        {
            test: /\.scss/,
            //loader: 'style!css!sass',
            // Or
            loaders: ['style', 'css', 'sass'],
        },
        {
            test: /\.html/,
            loader: 'html',
        }]
    },
    plugins: [new webpack.optimize.CommonsChunkPlugin({
        name: 'main',
        // Move dependencies to our main file
        children: true,
        // Look for common dependencies in all children,
        minChunks: 2,
        // How many times a dependency must come up before being extracted
    }), ],
};
