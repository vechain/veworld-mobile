import { useEffect, useState } from "react"
import { InteractionManager } from "react-native"
import { mnemonic as thorMnemonic } from "thor-devkit"
import { setIsAppLoading, useAppDispatch } from "~Storage/Redux"

export const useGenerateMnemonic = () => {
    const [mnemonic, setMnemonic] = useState<string[]>(Array.from({ length: 12 }))
    const dispatch = useAppDispatch()

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            function init() {
                dispatch(setIsAppLoading(true))
                const seed = thorMnemonic.generate()

                if (seed.length === 12) {
                    setMnemonic(seed)
                    dispatch(setIsAppLoading(false))
                } else {
                    init()
                }
            }

            init()
        })
    }, [dispatch])

    return { mnemonic }
}
