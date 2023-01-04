module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        [
            'module-resolver',
            {
                alias: {
                    '~Storage': './src/Storage',
                    '~Screens': './src/Screens',
                    '~Navigation': './src/Navigation',
                    '~Common': './src/Common',
                    '~Components': './src/Components',
                    '~i18n': './src/i18n',
                    http: "stream-http",
                    https: "https-browserify",
                    crypto: 'react-native-quick-crypto',
                    stream: 'stream-browserify',
                    buffer: '@craftzdog/react-native-buffer',
                    '@ethersproject/pbkdf2': './patches/patch-pbkdf2.js',
                    url: "url"
                }
            },
        ],
    ],
}
