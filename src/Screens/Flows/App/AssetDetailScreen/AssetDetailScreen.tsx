import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback } from "react"
import { StyleSheet, ScrollView } from "react-native"
import { useTheme } from "~Common"
import { BaseIcon, BaseSafeArea, BaseSpacer, BaseView } from "~Components"
import { RootStackParamListDiscover, Routes } from "~Navigation"
import { AssetHeader } from "./Components/AssetHeader"
import { AssetChart } from "./Components/AssetChart"

type Props = NativeStackScreenProps<
    RootStackParamListDiscover,
    Routes.TOKEN_DETAILS
>

export const AssetDetailScreen = ({ route }: Props) => {
    const token = route.params.token
    const theme = useTheme()
    const nav = useNavigation()
    const goBack = useCallback(() => nav.goBack(), [nav])

    return (
        <BaseSafeArea grow={1}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                style={{ backgroundColor: theme.colors.background }}>
                <BaseIcon
                    style={baseStyles.backIcon}
                    size={36}
                    name="chevron-left"
                    color={theme.colors.text}
                    action={goBack}
                />
                <BaseSpacer height={12} />

                <BaseView mx={20}>
                    <AssetHeader
                        name={token.name}
                        symbol={token.symbol}
                        icon={token.icon}
                    />

                    <BaseSpacer height={24} />

                    <AssetChart change={token.change} symbol={token.symbol} />
                </BaseView>
            </ScrollView>
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },
})
