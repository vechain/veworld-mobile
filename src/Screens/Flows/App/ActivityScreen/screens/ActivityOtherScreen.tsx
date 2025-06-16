import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { Activities, EmptyActivityList } from "../Components"
import { filterValues } from "../constants"
import { useI18nContext } from "~i18n"

export const ActivityOtherScreen = () => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)

    const emptyList = useMemo(() => {
        return (
            <BaseView justifyContent="center" alignItems="center" w={100} style={styles.noDappsButton}>
                <EmptyActivityList icon="icon-block" label={LL.ACTIVITY_OTHER_EMPTY_LABEL()} />
            </BaseView>
        )
    }, [LL, styles.noDappsButton])

    return (
        <BaseView style={styles.rootContainer}>
            <Activities filter={filterValues.other} emptyComponent={emptyList} />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            flex: 1,
        },
        noDappsButton: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
    })
