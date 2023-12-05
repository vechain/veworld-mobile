module.exports = {
    default: {
        paths: ["e2e/features/**/*.feature"],
        require: ["e2e/**/*.ts"],
        requireModule: ["ts-node/register"],
        format: ["progress-bar", ["html", "cucumber-report.html"], ["junit", "cucumber.xml"]],
        formatOptions: {
            snippetInterface: "synchronous",
        },
    },
}
