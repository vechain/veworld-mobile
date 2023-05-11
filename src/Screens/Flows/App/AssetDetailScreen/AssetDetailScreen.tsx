import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { StyleSheet, ScrollView } from "react-native"
import { useTheme } from "~Common"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    FastActionsBar,
} from "~Components"
import { RootStackParamListDiscover, Routes } from "~Navigation"
import { AssetHeader } from "./Components/AssetHeader"
import { AssetChart } from "./Components/AssetChart"
import { useI18nContext } from "~i18n"
import { FastAction } from "~Model"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { striptags } from "striptags"

type Props = NativeStackScreenProps<
    RootStackParamListDiscover,
    Routes.TOKEN_DETAILS
>

export const AssetDetailScreen = ({ route }: Props) => {
    const token = route.params.token
    const theme = useTheme()
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const paddingBottom = useBottomTabBarHeight()

    const goBack = useCallback(() => nav.goBack(), [nav])

    const Actions: FastAction[] = useMemo(
        () => [
            {
                name: LL.BTN_BUY(),
                action: () => nav.navigate(Routes.BUY),
                icon: (
                    <BaseIcon color={theme.colors.text} name="cart-outline" />
                ),
                testID: "buyButton",
            },

            {
                name: LL.BTN_SEND(),
                action: () =>
                    nav.navigate(Routes.SELECT_TOKEN_SEND, {
                        initialRoute: Routes.DISCOVER,
                    }),
                icon: (
                    <BaseIcon color={theme.colors.text} name="send-outline" />
                ),
                testID: "sendButton",
            },

            {
                name: LL.BTN_SWAP(),
                action: () => nav.navigate(Routes.SWAP),
                icon: (
                    <BaseIcon
                        color={theme.colors.text}
                        name="swap-horizontal"
                    />
                ),
                testID: "swapButton",
            },
        ],
        [LL, nav, theme.colors.text],
    )

    return (
        <BaseSafeArea grow={1}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingBottom }}
                style={{
                    backgroundColor: theme.colors.background,
                }}>
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
                    <AssetChart token={token} />
                </BaseView>

                <BaseView mx={20} alignItems="center">
                    <BaseSpacer height={24} />
                    <FastActionsBar actions={Actions} />

                    <BaseSpacer height={24} />

                    {token.desc && (
                        <>
                            <BaseText
                                typographyFont="bodyBold"
                                align="left"
                                alignContainer="flex-start"
                                w={100}
                                mb={12}>
                                {LL.TITLE_ABOUT()} {token.name}
                            </BaseText>

                            <BaseText>
                                {striptags(token.desc, {
                                    allowedTags: new Set(["strong"]),
                                })}
                            </BaseText>
                        </>
                    )}
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
