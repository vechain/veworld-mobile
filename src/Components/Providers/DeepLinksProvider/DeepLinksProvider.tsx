import React, { useEffect } from "react"
import { Linking } from "react-native"
import { useBrowserTab } from "~Hooks/useBrowserTab"
export const DeepLinksProvider = ({ children }: { children: React.ReactNode }) => {
    const { navigateWithTab } = useBrowserTab()
    useEffect(() => {
        const handleDeepLink = ({ url }: { url: string }) => {
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

        Linking.getInitialURL().then(url => url && handleDeepLink({ url }))

        return () => {
            Linking.removeAllListeners("url")
        }
    }, [navigateWithTab])

    return <>{children}</>
}
