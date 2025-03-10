import React from "react"
import { StyleSheet } from "react-native"
import { BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { Activities } from "../Components"
import { filterValues } from "../constants"

export const ActivityTransferScreen = () => {
    const { styles } = useThemedStyles(baseStyles)

    return (
        <BaseView style={styles.rootContainer}>
            <Activities filter={filterValues.transfer} />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            flex: 1,
        },
    })
