import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useEffect, useMemo } from "react"
import { ScrollView } from "react-native"
import { useTheme } from "~Hooks"
import {
    BackButtonHeader,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    FastActionsBar,
    showWarningToast,
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

    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(fetchVechainMarketInfo())
    }, [dispatch])

    const Actions: FastAction[] = useMemo(
        () => [
            {
                name: LL.BTN_SEND(),
                action: () => {
                    if (foundToken.length) {
                        nav.navigate(Routes.SELECT_AMOUNT_SEND, {
                            token: foundToken[0],
                            initialRoute: Routes.HOME,
                        })
                    } else {
                        showWarningToast(
                            LL.HEADS_UP(),
                            LL.SEND_ERROR_TOKEN_NOT_FOUND({
                                tokenName: token.symbol,
                            }),
                        )
                    }
                },
                icon: (
                    <BaseIcon color={theme.colors.text} name="send-outline" />
                ),
                testID: "sendButton",
            },
        ],
        [LL, foundToken, nav, theme.colors.text, token.symbol],
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
                <BackButtonHeader />

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
