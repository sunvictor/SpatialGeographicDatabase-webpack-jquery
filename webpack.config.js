const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin')
// Cesium源码所在目录
const cesiumSource = './node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    mode: "development",
    entry: path.join(__dirname, "src", "index.js"),
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        //需要编译Cesium中的多行字符串
        sourcePrefix: '',
        // publicPath: './'
        // assetModuleFilename: 'images/[hash][ext][query]' // 指定打包图片的文件夹名称
    },
    amd: {
        //允许Cesium兼容 webpack的require方式
        toUrlUndefined: true
    },
    // node: {
    //     // 解决fs模块的问题（Resolve node module use of fs）
    //     fs: 'empty'
    // },
    resolve: {
        alias: {
            // Cesium模块名称
            cesium: path.resolve(__dirname, cesiumSource),
            '@': path.resolve('src')
        },
        // mainFiles: ['index', 'Cesium']
    },
    // externals: {
    //     jquery: "jQuery" //如果要全局引用jQuery，不管你的jQuery有没有支持模块化，用externals就对了。
    // },
    module: {
        rules: [
            //     {
            //     test: /\.js$/,
            //     loader: 'babel-loader',
            //     include: path.join(__dirname, "src"),
            //     exclude: /node_modules/
            // },
            // {
            //     test: require.resolve('jquery'), //require.resolve 用来获取模块的绝对路径
            //     use: [{
            //         loader: 'expose-loader',
            //         options: 'jQuery'
            //     }, {
            //         loader: 'expose-loader',
            //         options: '$'
            //     }
            //     ]
            // },
            {
                test: require.resolve("jquery"),
                loader: "expose-loader",
                options: {
                    exposes: ["$", "jQuery"],
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            },
            // {
            //     test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
            //     use: [{
            //         loader: 'url-loader',
            //         options: {
            //             limit: 50
            //         }
            //     }]
            // },
            {
                test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/i,
                type: 'asset/resource', // webpack5中使用Asset Modules！！！不使用url-loader和file-loader了！！！
                // type: 'asset', // webpack5中使用Asset Modules！！！不使用url-loader和file-loader了！！！
                generator: {
                    filename: 'images/[hash][ext][query]'
                }
            },{
                test: /\.(scss)$/,
                use: [{
                    loader: 'style-loader', // inject CSS to page
                }, {
                    loader: 'css-loader', // translates CSS into CommonJS modules
                }, {
                    loader: 'postcss-loader', // Run postcss actions
                    options: {
                        plugins: function () { // postcss plugins, can be exported to postcss.config.js
                            return [
                                require('autoprefixer')
                            ];
                        }
                    }
                }, {
                    loader: 'sass-loader' // compiles Sass to CSS
                }]
            },
        ]
    },
    plugins: [
        // new BundleAnalyzerPlugin(), // 查看打包文件大小
        // new webpack.ProvidePlugin({
        //     $: "jquery",
        //     jQuery: "jquery",
        //     // "window.jQuery": "jquery"
        // }),
        // new HtmlWebpackPlugin({
        //     template: path.join(__dirname, "src", "index.html"),
        //     filename: "index.html"
        // }),
        new HtmlWebpackPlugin({
            title: "空间地理数据库",
            template: path.join(__dirname, "src", "index.html")
        }),
        // new CopyWebpackPlugin({
        //     patterns: [
        //         {
        //             from: './node_modules/cesium/Build/Cesium', // 调试时，将Cesium换成CesiumUnminified
        //             to: 'js/Cesium',
        //             toType: 'dir'
        //         }
        //     ]
        // }),
        // // 拷贝Cesium 资源、控价、web worker到静态目录
        // new CopyWebpackPlugin({patterns: [{from: path.join(cesiumSource, cesiumWorkers), to: 'Workers'}]}),
        // new CopyWebpackPlugin({patterns: [{from: path.join(cesiumSource, 'Assets'), to: 'Assets'}]}),
        // new CopyWebpackPlugin({patterns: [{from: path.join(cesiumSource, 'Widgets'), to: 'Widgets'}]})
        new CopyWebpackPlugin({
            patterns: [
                // { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
                // { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
                // { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
                {
                    from: './node_modules/cesium/Build/CesiumUnminified', // 调试时，将Cesium换成CesiumUnminified
                    to: 'js/Cesium',
                    toType: 'dir'
                },
                {from: './node_modules/earthsdk/dist/XbsjCesium', to: 'js/earthsdk/XbsjCesium', toType: 'dir'},
                {from: './node_modules/earthsdk/dist/XbsjEarth', to: 'js/earthsdk/XbsjEarth', toType: 'dir'},
                {from: './node_modules/bootstrap/dist/css', to: 'css/boostrap/dist/css', toType: 'dir'},
                // {from: './src/css', to: 'css/css', toType: 'dir'},
                {from: './src/img', to: 'img', toType: 'dir'},
                // {from: './src/js/scripts/jquery', to: 'js/jquery', toType: 'dir'},
                // {from: './node_modules/jquery', to: 'js/jquery', toType: 'dir'},
            ]
        }),
        new webpack.DefinePlugin({
            // Define relative base path in cesium for loading assets
            CESIUM_BASE_URL: JSON.stringify('')
        })

    ],
    devServer: {
        // port: 8000,
        static: path.join(__dirname, "src")
    },

}