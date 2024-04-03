const fs = require("fs")
const path = require("path")
const envPath = path.resolve(__dirname, ".env")
require("dotenv").config({ path: envPath })

const datadogConfigPath = path.resolve(__dirname, "datadog-ci.json")
const datadogConfig = require(datadogConfigPath)

datadogConfig.apiKey = process.env.DATADOG_API_KEY

fs.writeFileSync(datadogConfigPath, JSON.stringify(datadogConfig, null, 2))
