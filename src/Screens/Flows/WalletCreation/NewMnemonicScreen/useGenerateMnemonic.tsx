import { useEffect, useState } from "react"
import { InteractionManager } from "react-native"
import { mnemonic as thorMnemonic } from "thor-devkit"

export const useGenerateMnemonic = () => {
    const [mnemonic, _setMnemonic] = useState<string>("")
    const [mnemonicArray, setMnemonicArray] = useState<string[]>(
        Array.from({ length: 12 }),
    )

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            let seed = thorMnemonic.generate()
            _setMnemonic(seed.join(" "))
            setMnemonicArray(seed)
        })
    }, [])

    return { mnemonic, mnemonicArray }
}
