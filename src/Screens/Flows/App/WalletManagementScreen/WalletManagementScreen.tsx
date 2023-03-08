import { useNavigation, useTheme } from "@react-navigation/native"
import React, { useCallback } from "react"

import { SafeAreaView, StyleSheet } from "react-native"
import { useDevicesList } from "~Common/Hooks/Entities"
import { BaseIcon, BaseSpacer } from "~Components"
import { DeviceAccordion, WalletManagementHeader } from "./components"

export const WalletManagementScreen = () => {
    const nav = useNavigation()
    const theme = useTheme()

    const goBack = useCallback(() => nav.goBack(), [nav])

    const devices = useDevicesList()

    return (
        <>
            <SafeAreaView />
            <BaseIcon
                style={baseStyles.backIcon}
                size={36}
                name="chevron-left"
                color={theme.colors.text}
                action={goBack}
            />
            <BaseSpacer height={20} />
            <WalletManagementHeader />
            <BaseSpacer height={24} />
            {devices.map(device => (
                <DeviceAccordion key={device.rootAddress} device={device} />
            ))}
        </>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: { paddingHorizontal: 20, alignSelf: "flex-start" },
})
