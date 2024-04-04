const fs = require("fs")
const path = require("path")

const envPaths = []

// Define the hierarchy of environment files
const envFileNames = [
    ".env.test.local",
    ".env.test",
    ".env.production.local",
    ".env.production",
    ".env.development.local",
    ".env.development",
    ".env.local",
    ".env",
]

// Check if each file exists and add it to the envPaths array
for (const fileName of envFileNames) {
    const filePath = path.resolve(__dirname, fileName)
    if (fs.existsSync(filePath)) {
        envPaths.push(filePath)
    }
}

// Load environment variables from the first existing file in the hierarchy
const envFilePath = envPaths[0]
if (envFilePath) {
    require("dotenv").config({ path: envFilePath })
}

const datadogConfigPath = path.resolve(__dirname, "datadog-ci.json")
const datadogConfig = require(datadogConfigPath)
datadogConfig.apiKey = process.env.DATADOG_API_KEY
fs.writeFileSync(datadogConfigPath, JSON.stringify(datadogConfig, null, 2))
