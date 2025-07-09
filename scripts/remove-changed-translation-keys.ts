import fs from "fs"

function removeChangedTranslationKeys() {
    const args = process.argv.slice(2)
    const changedKeys: string[] = JSON.parse(args[0])

    const translationFiles = fs.readdirSync("src/i18n/translations")
    translationFiles.forEach(file => {
        if (file === "en.json") {
            return
        }

        const translation = JSON.parse(fs.readFileSync(`src/i18n/translations/${file}`, "utf8"))
        changedKeys.forEach(key => {
            delete translation[key]
        })
        fs.writeFileSync(`src/i18n/translations/${file}`, JSON.stringify(translation, null, 2))
    })
}

removeChangedTranslationKeys()
