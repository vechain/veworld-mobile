export const copyMnemonic = async (): Promise<string[]> => {
    const mnemonic: string[] = []

    for (let i = 0; i < 12; i++) {
        const wordAttributes: any = await element(
            by.id(`word-${i}`),
        ).getAttributes()

        mnemonic.push(wordAttributes.text.toString().split(" ")[1])
    }

    console.log(mnemonic)

    return mnemonic
}
