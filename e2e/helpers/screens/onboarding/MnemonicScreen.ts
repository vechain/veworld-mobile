import { element } from "detox"

export const copyMnemonic = async (): Promise<string[]> => {
    const mnemonic: string[] = []

    for (let i = 0; i < 12; i++) {
        const wordAttributes: any = await element(
            by.id(`word-${i}`),
        ).getAttributes()

        mnemonic.push(wordAttributes.text.toString().split(" ")[1])
    }
    return mnemonic
}

export const backupMnemonicAndContinue = async (): Promise<string[]> => {
    await element(by.id("toggle-mnemonic-visibility")).tap()

    const mnemonic: string[] = await copyMnemonic()

    await element(by.id("mnemonic-checkbox")).tap()

    await element(by.text("Backup")).tap()

    return mnemonic
}
