module.exports = {
    default: {
        paths: ["e2e/features/**/*.feature"],
        require: ["e2e/**/*.ts"],
        requireModule: ["ts-node/register"],
        formatOptions: {
            snippetInterface: "synchronous",
        },
    },
}
