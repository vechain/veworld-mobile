import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { ReactElement, useEffect } from "react"
import { useFeatureFlags } from "~Components"
import { RootStackParamListHome, Routes } from "~Navigation"
import { SendScreenV2 } from "./SendScreen_V2/SendScreen_V2"

type NavigationProps = NativeStackNavigationProp<RootStackParamListHome, Routes.SEND_TOKEN>

/**
 * `SendScreen`
 *
 * Single entry point for the send flow.
 * - When the BetterWorld send feature flag is ENABLED, it renders the new multi-step `SendScreenV2`.
 * - When DISABLED, it immediately redirects into the legacy multi-screen send flow.
 */
export const SendScreen = (): ReactElement | null => {
    const navigation = useNavigation<NavigationProps>()
    const { betterWorldFeature } = useFeatureFlags()
    useEffect(() => {
        if (!betterWorldFeature.balanceScreen?.send?.enabled) {
            navigation.replace(Routes.SELECT_TOKEN_SEND)
        }
    }, [betterWorldFeature.balanceScreen?.send?.enabled, navigation])

    if (!betterWorldFeature.balanceScreen?.send?.enabled) {
        return null
    }

    return <SendScreenV2 />
}
