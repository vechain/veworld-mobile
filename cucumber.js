module.exports = {
    default: {
        paths: ["e2e/features/**/*.feature"],
        require: ["e2e/**/*.ts", "e2e/config/config.ts"],
        requireModule: ["ts-node/register"],
        format: ["@serenity-js/console-reporter", "@serenity-js/cucumber"],
        formatOptions: {
            snippetInterface: "synchronous",
        },
    },
}
