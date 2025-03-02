const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'src/Game.ts'),
    output: {
        filename: 'Game.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    mode: 'development',
};