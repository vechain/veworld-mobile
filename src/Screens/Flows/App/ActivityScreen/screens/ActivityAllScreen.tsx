import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { Activities, EmptyActivityList } from "../Components"
import { useI18nContext } from "~i18n"
import { filterValues } from "../constants"

export const ActivityAllScreen = () => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)

    const emptyList = useMemo(() => {
        return (
            <BaseView justifyContent="center" alignItems="center" w={100} style={styles.noActivitiesButton}>
                <EmptyActivityList icon="icon-arrow-up-down" label={LL.ACTIVITY_ALL_EMPTY_LABEL()} />
            </BaseView>
        )
    }, [LL, styles.noActivitiesButton])

    return (
        <BaseView style={styles.rootContainer}>
            <Activities filter={filterValues.all} emptyComponent={emptyList} />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            flex: 1,
        },
        noActivitiesButton: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
    })
