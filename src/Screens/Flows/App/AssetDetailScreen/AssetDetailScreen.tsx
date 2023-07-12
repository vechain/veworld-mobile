import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useEffect, useMemo } from "react"
import { StyleSheet, ScrollView } from "react-native"
import { useTheme } from "~Hooks"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    FastActionsBar,
} from "~Components"
import { RootStackParamListDiscover, Routes } from "~Navigation"
import {
    AssetHeader,
    AssetChart,
    BalanceView,
    MarketInfoView,
} from "./Components"
import { useI18nContext } from "~i18n"
import { FastAction } from "~Model"
import { striptags } from "striptags"
import {
    fetchVechainMarketInfo,
    selectMarketInfoFor,
    selectSendableTokensWithBalance,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

type Props = NativeStackScreenProps<
    RootStackParamListDiscover,
    Routes.TOKEN_DETAILS
>

export const AssetDetailScreen = ({ route }: Props) => {
    const token = route.params.token
    const theme = useTheme()
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const marketInfo = useAppSelector(state =>
        selectMarketInfoFor(token.symbol, state),
    )

    const tokens = useAppSelector(selectSendableTokensWithBalance)
    const foundToken = tokens.filter(
        t =>
            t.name?.toLowerCase().includes(token.name.toLowerCase()) ||
            t.symbol?.toLowerCase().includes(token.symbol.toLowerCase()),
    )

    const goBack = useCallback(() => nav.goBack(), [nav])

    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(fetchVechainMarketInfo())
    }, [dispatch])

    const Actions: FastAction[] = useMemo(
        () => [
            {
                name: LL.BTN_SEND(),
                action: () =>
                    nav.navigate(Routes.SELECT_AMOUNT_SEND, {
                        token: foundToken[0],
                        initialRoute: Routes.HOME,
                    }),
                icon: (
                    <BaseIcon color={theme.colors.text} name="send-outline" />
                ),
                testID: "sendButton",
            },
        ],
        [LL, foundToken, nav, theme.colors.text],
    )

    return (
        <BaseSafeArea grow={1}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
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
                    <FastActionsBar actions={Actions} paddingHorizontal={44} />

                    <BaseSpacer height={24} />

                    <BalanceView token={token} />

                    <BaseSpacer height={24} />

                    <MarketInfoView marketInfo={marketInfo} />

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
