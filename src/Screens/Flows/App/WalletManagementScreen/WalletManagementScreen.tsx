import { useNavigation, useTheme } from "@react-navigation/native"
import React, { useCallback } from "react"

import { SafeAreaView } from "react-native"
import { BaseIcon, BaseSpacer } from "~Components"
import { WalletManagementHeader } from "./components"

export const WalletManagementScreen = () => {
    const nav = useNavigation()
    const theme = useTheme()

    const goBack = useCallback(() => nav.goBack(), [nav])
    return (
        <>
            <SafeAreaView />
            <BaseIcon
                style={{ paddingHorizontal: 20 }}
                name="arrow-back-outline"
                color={theme.colors.text}
                action={goBack}
            />
            <BaseSpacer height={20} />
            <WalletManagementHeader />
        </>
    )
}
