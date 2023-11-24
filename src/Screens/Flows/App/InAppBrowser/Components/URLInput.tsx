import React, { useCallback, useEffect, useState } from "react"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { BaseTextInput, BaseView } from "~Components"
import { URIUtils } from "~Utils"
import { StyleSheet, TextInputProps } from "react-native"

export const URLInput = () => {
    const { navigationState, navigateToUrl } = useInAppBrowser()

    const [input, setInput] = React.useState(navigationState?.url ?? "")

    const [shouldSelect, setShouldSelect] = useState<TextInputProps["selection"]>(undefined)
    const onFocus = () => {
        setShouldSelect({ start: 0, end: input.length })
    }

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
            //navigate to google search - input should be encoded
            navigateToUrl(
                `https://www.google.com/search?q=${encodeURIComponent(input)}&oq=${encodeURIComponent(input)}`,
            )
        }
    }, [input, navigateToUrl])

    return (
        <BaseView style={styles.inputContainer}>
            <BaseTextInput
                onBlur={onBlur}
                value={input}
                onChangeText={setInput}
                onFocus={onFocus}
                selection={shouldSelect}
            />

            {/* TODO <BaseIcon name={"refresh"} />*/}
        </BaseView>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        width: "100%",
        height: 60,
        paddingHorizontal: 20,
        paddingVertical: 3,
        alignItems: "center",
    },
})
