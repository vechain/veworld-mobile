import { useNavigation } from "@react-navigation/native"
import { useCallback } from "react"
import { Routes } from "~Navigation"

// Custom React hook to handle stack resets for navigation in a React Native application
export const useResetStacks = () => {
    // Access the navigation object using the useNavigation hook from React Navigation
    const nav = useNavigation()

    // Function to reset the navigation stack based on specified conditions
    const resetStacks = useCallback(() => {
        // Get the current state of the navigation stack
        const state = nav.getState()

        // If the navigation state is not available, return early
        if (!state) return

        // Filter the routes in the navigation state to find "Routes.NFTS" and "Routes.HOME" routes
        const nftRoutes = state.routes.filter(r => r.name === Routes.NFTS)
        const homeRoutes = state.routes.filter(r => r.name === Routes.HOME)

        // If the "Routes.HOME" route is not found at the top of the stack, reset the stack to have only "Routes.HOME" route
        if (homeRoutes[0]?.name !== Routes.HOME) {
            nav.reset({
                index: 0,
                routes: [{ name: Routes.HOME }],
            })
        }

        // If the "Routes.NFTS" route is not found at the top of the stack, reset the stack to have only "Routes.NFTS" route
        if (nftRoutes[0]?.name !== Routes.NFTS) {
            nav.reset({
                index: 0,
                routes: [{ name: Routes.NFTS }],
            })
        }
    }, [nav])

    // Return the resetStacks function as part of the custom hook's interface
    return { resetStacks }
}
