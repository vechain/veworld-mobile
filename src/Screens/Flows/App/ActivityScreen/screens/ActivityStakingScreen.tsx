import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { Activities, EmptyActivityList } from "../Components"
import { useI18nContext } from "~i18n"
import { filterValues } from "../constants"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { STARGATE_DAPP_URL_ACTIVITIES_BANNER } from "~Constants"

export const ActivityStakingScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { navigateWithTab } = useBrowserTab()
    const { styles } = useThemedStyles(baseStyles)

    const onPress = useCallback(
        (url: string, title: string) => {
            navigateWithTab({
                url,
                title,
                navigationFn(u) {
                    nav.navigate(Routes.BROWSER, { url: u, returnScreen: Routes.ACTIVITY_STAKING })
                },
            })

            return
        },
        [nav, navigateWithTab],
    )

    const emptyList = useMemo(() => {
        return (
            <BaseView justifyContent="center" alignItems="center" w={100} style={styles.noActivitiesButton}>
                <EmptyActivityList
                    hasCardStyle
                    label={LL.ACTIVITY_ALL_EMPTY_LABEL()}
                    description={LL.ACTIVITY_STAKING_EMPTY_LABEL()}
                    onPress={() => onPress(STARGATE_DAPP_URL_ACTIVITIES_BANNER, "Stargate")}
                />
            </BaseView>
        )
    }, [LL, styles.noActivitiesButton, onPress])

    return (
        <BaseView style={styles.rootContainer}>
            <Activities filter={filterValues.staking} emptyComponent={emptyList} />
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
