import React from "react"
import { StyleSheet, Text } from "react-native"
import { BaseView, Layout } from "~Components"
import { useThemedStyles } from "~Hooks"
import { SearchHeader } from "./Components/SearchHeader"

export const SearchScreen = () => {
    const { styles } = useThemedStyles(baseStyles)

    return (
        <Layout
            hasSafeArea
            noBackButton
            fixedHeader={<SearchHeader />}
            fixedBody={
                <BaseView style={[styles.rootContainer]}>
                    <Text>CIAO</Text>
                </BaseView>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            flexGrow: 1,
        },
    })
