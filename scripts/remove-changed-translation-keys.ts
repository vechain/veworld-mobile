const { execSync } = require("child_process")
const fs = require("fs")

function removeChangedTranslationKeys(changedKeys: string[]) {
    const translationFiles = fs.readdirSync("src/i18n/translations")
    translationFiles.forEach((file: string) => {
        if (file === "en.json") {
            return
        }

        const translation = JSON.parse(fs.readFileSync(`src/i18n/translations/${file}`, "utf8"))
        changedKeys.forEach((key: string) => {
            delete translation[key]
        })
        fs.writeFileSync(`src/i18n/translations/${file}`, JSON.stringify(translation, null, 2))
    })
}

function getChangedKeys() {
    const oldI18n = execSync(`git show ${process.env.TRANSLATION_BASE_BRANCH}:src/i18n/translations/en.json`, {
        encoding: "utf8",
    })
    const newI18n = fs.readFileSync("src/i18n/translations/en.json", "utf8")

    const oldJson = JSON.parse(oldI18n)
    const newJson = JSON.parse(newI18n)

    const changedKeys: string[] = Object.keys(newJson).filter(key => oldJson[key] !== newJson[key])
    const deletedKeys: string[] = Object.keys(oldJson).filter(key => newJson[key] === undefined)

    console.log("Changed keys: ", changedKeys)
    console.log("Deleted keys: ", deletedKeys)

    return changedKeys.concat(deletedKeys)
}

function main() {
    const changedKeys = getChangedKeys()
    removeChangedTranslationKeys(changedKeys)
}

main()
