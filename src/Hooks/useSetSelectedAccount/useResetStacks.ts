import { useNavigation } from "@react-navigation/native"
import { useCallback } from "react"
import { Routes } from "~Navigation"

export const useResetStacks = () => {
    const nav = useNavigation()

    const resetStacks = useCallback(() => {
        const state = nav.getState()

        if (!state) return

        const nftRoutes = state.routes.filter(r => r.name === Routes.NFTS)
        const homeRoutes = state.routes.filter(r => r.name === Routes.HOME)

        if (homeRoutes[0]?.name !== Routes.HOME) {
            nav.reset({
                index: 0,
                routes: [{ name: Routes.HOME }],
            })
        }

        if (nftRoutes[0]?.name !== Routes.NFTS) {
            nav.reset({
                index: 0,
                routes: [{ name: Routes.NFTS }],
            })
        }
    }, [nav])

    return { resetStacks }
}
