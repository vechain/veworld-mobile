import React from "react"
import { StyleSheet } from "react-native"
import { BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { Activities } from "../Components"

export const ActivityAllScreen = () => {
    const { styles } = useThemedStyles(baseStyles)

    return (
        <BaseView style={styles.rootContainer}>
            <Activities filter={undefined} />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            flex: 1,
        },
    })
