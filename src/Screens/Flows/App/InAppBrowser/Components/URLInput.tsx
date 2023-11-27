import React, { useCallback, useEffect, useState } from "react"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { BaseIcon, BaseTextInput, BaseView } from "~Components"
import { URIUtils } from "~Utils"
import { StyleSheet, TextInputProps } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "~Hooks"

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

    const nav = useNavigation()
    const theme = useTheme()

    const onClosePress = useCallback(async () => {
        nav.goBack()
    }, [nav])

    return (
        <BaseView style={styles.inputContainer}>
            <BaseView flex={1}>
                <BaseTextInput
                    onBlur={onBlur}
                    value={input}
                    onChangeText={setInput}
                    onFocus={onFocus}
                    selection={shouldSelect}
                />
            </BaseView>
            <BaseIcon
                haptics="Light"
                style={[styles.closeButton]}
                size={25}
                name="close"
                color={theme.colors.text}
                action={onClosePress}
            />
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
        flexDirection: "row",
    },
    closeButton: {
        marginLeft: 10,
    },
})
