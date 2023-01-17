module.exports = {
    default: {
        paths: ["e2e/features/**/*.feature"],
        require: ["e2e/**/*.ts", "tests.setup.js"],
        requireModule: ["ts-node/register"],
        formatOptions: {
            snippetInterface: "synchronous",
        },
        publishQuiet: true,
    },
}
