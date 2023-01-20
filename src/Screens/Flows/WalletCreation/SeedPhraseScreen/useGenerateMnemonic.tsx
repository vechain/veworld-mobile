import { useEffect, useState } from "react"
import { InteractionManager } from "react-native"
import { LocalWalletService } from "~Services"

export const useGenerateMnemonic = () => {
    const [mnemonic, _setMnemonic] = useState<string>("")
    const [mnemonicArray, setMnemonicArray] = useState<string[]>(
        Array.from({ length: 12 }),
    )

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            let seed = LocalWalletService.generateMnemonicPhrase()
            _setMnemonic(seed.join(" "))
            setMnemonicArray(seed)
        })
    }, [])

    return { mnemonic, mnemonicArray }
}
