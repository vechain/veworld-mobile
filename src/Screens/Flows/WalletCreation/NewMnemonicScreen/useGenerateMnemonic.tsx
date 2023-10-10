import { useEffect, useState } from "react"
import { InteractionManager } from "react-native"
import { mnemonic as thorMnemonic } from "thor-devkit"

export const useGenerateMnemonic = () => {
    const [mnemonic, setMnemonic] = useState<string[]>(
        Array.from({ length: 12 }),
    )

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            const seed = thorMnemonic.generate()
            setMnemonic(seed)
        })
    }, [])

    return { mnemonic }
}
