import React from "react"
import { StyleSheet } from "react-native"
import { BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { Activities } from "../Components"
import { filterValues } from "../constants"

export const ActivityB3trScreen = () => {
    const { styles } = useThemedStyles(baseStyles)

    return (
        <BaseView style={styles.rootContainer}>
            <Activities filter={filterValues.b3tr} />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            flex: 1,
        },
    })
