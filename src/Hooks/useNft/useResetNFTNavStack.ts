import { useNavigation } from "@react-navigation/native"
import { useCallback } from "react"
import { Routes } from "~Navigation"

export const useResetNFTNavStack = () => {
    const nav = useNavigation()

    const resetNFTStack = useCallback(() => {
        const state = nav.getState()
        const routes = state.routes.filter(r => r.name === Routes.NFTS)

        if (!!routes.length && routes[0].name === Routes.NFTS) return

        nav.reset({
            index: 0,
            routes: [{ name: Routes.NFTS }],
        })
    }, [nav])

    return { resetNFTStack }
}
