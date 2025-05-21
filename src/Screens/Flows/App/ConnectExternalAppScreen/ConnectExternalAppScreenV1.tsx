import React, { useMemo } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Text } from "react-native"
import { Routes } from "~Navigation"
import { RootStackParamListSwitch } from "~Navigation/Stacks/SwitchStack"
import { CryptoUtils } from "~Utils"
import { BaseSafeArea } from "~Components"

type Props = NativeStackScreenProps<RootStackParamListSwitch, Routes.CONNECT_EXTERNAL_APP_SCREEN_V1>

export const ConnectExternalAppScreenV1 = (_: Props) => {
    const { publicKey } = useMemo(() => CryptoUtils.generateDiffieHellmanKeys(), [])

    return (
        <BaseSafeArea>
            <Text>{"Connect External App"}</Text>
            <Text>{publicKey}</Text>
        </BaseSafeArea>
    )
}
