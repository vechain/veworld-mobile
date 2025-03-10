import React from "react"
import { StyleSheet } from "react-native"
import { BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { Activities } from "../Components"
import { filterValues } from "../constants"
export const ActivityNftScreen = () => {
    const { styles } = useThemedStyles(baseStyles)

    return (
        <BaseView style={styles.rootContainer}>
            <Activities filter={filterValues.nfts} />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            flex: 1,
        },
    })
