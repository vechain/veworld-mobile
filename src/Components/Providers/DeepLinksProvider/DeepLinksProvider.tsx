import React, { useEffect, useRef } from "react"
import { Linking } from "react-native"
import { useQueryClient } from "@tanstack/react-query"
import { useBrowserTab } from "~Hooks/useBrowserTab"
export const DeepLinksProvider = ({ children }: { children: React.ReactNode }) => {
    const { navigateWithTab } = useBrowserTab()
    const queryClient = useQueryClient()
    const mounted = useRef(false)
    useEffect(() => {
        const handleDeepLink = ({ url }: { url: string }) => {
            // Force fresh dApp data when coming from external browser
            queryClient.invalidateQueries({ queryKey: ["fetchFeaturedDApps"] })

            const parsed = new URL(url)
            const pathname = parsed.pathname
            //Filter out all the useless elements
            const splitPathname = pathname.split("/").filter(Boolean)
            switch (splitPathname[0]) {
                case "discover": {
                    const lastElement = splitPathname[splitPathname.length - 1]
                    const decodedURI = decodeURIComponent(lastElement)
                    navigateWithTab({ url: decodedURI, title: decodedURI, navigationFn: () => {} })
                    break
                }
                default:
                    return
            }
        }

        Linking.addEventListener("url", handleDeepLink)

        if (!mounted.current) {
            mounted.current = true
            Linking.getInitialURL().then(url => url && handleDeepLink({ url }))
        }

        return () => {
            Linking.removeAllListeners("url")
        }
    }, [navigateWithTab, queryClient])

    return <>{children}</>
}
