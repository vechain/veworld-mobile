import { useEffect, useState } from "react"
import { InteractionManager } from "react-native"
import { mnemonic as thorMnemonic } from "thor-devkit"
import { ERROR_EVENTS } from "~Constants"
import { setIsAppLoading, useAppDispatch } from "~Storage/Redux"
import { error } from "~Utils"

export const useGenerateMnemonic = () => {
    const [mnemonic, setMnemonic] = useState<string[]>(Array.from({ length: 12 }))
    const dispatch = useAppDispatch()

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            function init() {
                dispatch(setIsAppLoading(true))
                const seed = thorMnemonic.generate()
                if (seed.length === 12 && seed.every(word => word.length > 0)) {
                    setMnemonic(seed)
                    dispatch(setIsAppLoading(false))
                } else {
                    error(ERROR_EVENTS.WALLET_CREATION, "Generated mnemonic has missing words")
                    init()
                }
            }

            init()
        })
    }, [dispatch])

    return { mnemonic }
}
