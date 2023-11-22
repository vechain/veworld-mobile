import React, { useCallback, useEffect } from "react"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { BaseTextInput } from "~Components"
import { URIUtils, warn } from "~Utils"

export const URLInput = () => {
    const { navigationState, navigateToUrl } = useInAppBrowser()

    const [input, setInput] = React.useState(navigationState?.url ?? "")

    useEffect(() => {
        setInput(prev => {
            if (prev !== navigationState?.url) {
                return navigationState?.url ?? ""
            }

            return prev
        })
    }, [navigationState?.url])

    const onBlur = useCallback(() => {
        const isValid = URIUtils.isValidBrowserUrl(input)

        if (isValid) {
            navigateToUrl(input)
        } else {
            warn("URLInput", "onBlur", "invalid url", input)
            //navigate to google search - input should be encoded
            navigateToUrl(
                `https://www.google.com/search?q=${encodeURIComponent(
                    input,
                )}&oq=${encodeURIComponent(input)}`,
            )
        }
    }, [input, navigateToUrl])

    return (
        <BaseTextInput onBlur={onBlur} value={input} onChangeText={setInput} />
    )
}
