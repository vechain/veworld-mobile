/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
    rootDir: '..',
    testMatch: ['<rootDir>/e2e/**/*.test.js'],
    testTimeout: 120000,
    maxWorkers: 1,
    globalSetup: 'detox/runners/jest/globalSetup',
    globalTeardown: 'detox/runners/jest/globalTeardown',
    reporters: ['detox/runners/jest/reporter'],
    testEnvironment: 'detox/runners/jest/testEnvironment',
    verbose: true,
    moduleNameMapper: {
        'typesafe-i18n/react': 'typesafe-i18n/react/index.cjs',
        'typesafe-i18n/formatters': 'typesafe-i18n/formatters/index.cjs',
        'typesafe-i18n/detectors': 'typesafe-i18n/detectors/index.cjs',
    },
}
