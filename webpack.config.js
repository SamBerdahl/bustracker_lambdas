const fs = require('fs');
const path = require('path');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = function (env) {
    const functionsToBuild = env && env.fxn ? env.fxn.split(",") : fs.readdirSync(path.join(__dirname, 'src')).filter((item) =>  !(/(^|\/)\.[^\/\.]/g).test(item))
    console.log(`Building ${functionsToBuild.join(", ")}`);

    return functionsToBuild
        .map(fxn => ({
            context: path.resolve(__dirname),
            entry: path.join(__dirname, 'src', fxn, 'index.js'),
            output: {
                path: path.join(__dirname, 'dist', fxn),
                filename: 'index.js',
                libraryTarget: 'commonjs2'
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        use: [
                            {
                                loader: 'babel-loader',
                                options: {
                                    presets: ['es2015'],
                                    plugins: ["transform-async-to-generator"],
                                    compact: false
                                }
                            }
                        ]
                    },
                    {
                        test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
                        use: [
                            'file-loader'
                        ]
                    }
                ]
            },
            resolve: {
                extensions: ['.js']
            },
            plugins: [
                new ZipPlugin({
                    path: path.join(__dirname, 'dist', fxn),
                    pathPrefix: '',
                    filename: `${fxn}.zip`
                })
            ],
            target: 'node',
            externals: {
                // These modules are already installed on the Lambda instance.
                'aws-sdk': 'aws-sdk',
                'awslambda': 'awslambda',
                'dynamodb-doc': 'dynamodb-doc',
                'imagemagick': 'imagemagick'
            },
            node: {
                // Allow these globals.
                __filename: false,
                __dirname: false
            },
            stats: 'errors-only',
            bail: true
        }));
};
