import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { Activities, EmptyB3trActivities } from "../Components"
import { filterValues } from "../constants"

export const ActivityB3trScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamListSwitch>>()
    const { styles } = useThemedStyles(baseStyles)

    const goToDiscover = useCallback(() => {
        navigation.navigate("TabStack", {
            screen: Routes.DISCOVER_STACK,
            params: {
                screen: Routes.DISCOVER,
            },
        })
    }, [navigation])

    const emptyList = useMemo(() => {
        return (
            <BaseView justifyContent="center" alignItems="center" w={100} style={styles.noActivitiesButton}>
                <EmptyB3trActivities onPress={goToDiscover} />
            </BaseView>
        )
    }, [goToDiscover, styles.noActivitiesButton])

    return (
        <BaseView style={styles.rootContainer}>
            <Activities filter={filterValues.b3tr} emptyComponent={emptyList} />
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
            paddingHorizontal: 16,
        },
    })
