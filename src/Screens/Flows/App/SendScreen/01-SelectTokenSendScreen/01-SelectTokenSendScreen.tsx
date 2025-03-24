import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React from "react"
import { BaseSpacer, BaseText, BaseView, Layout, OfficialTokenCard } from "~Components"
import { VET, VTHO } from "~Constants"
import { useTokenWithCompleteInfo } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { selectNetworkVBDTokens, selectSendableTokensWithBalance, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"

type Props = NativeStackNavigationProp<RootStackParamListHome, Routes.SELECT_TOKEN_SEND>

export const SelectTokenSendScreen = () => {
    const { LL } = useI18nContext()
    const tokens = useAppSelector(selectSendableTokensWithBalance)
    const { B3TR, VOT3 } = useAppSelector(state => selectNetworkVBDTokens(state))

    const nav = useNavigation<Props>()
    const handleClickToken = (token: FungibleTokenWithBalance) => async () => {
        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
            token,
        })
    }
    const tokenWithInfoVET = useTokenWithCompleteInfo(VET)
    const tokenWithInfoB3TR = useTokenWithCompleteInfo(B3TR)
    const tokenWithInfoVTHO = useTokenWithCompleteInfo(VTHO)
    const tokenWithInfoVOT3 = useTokenWithCompleteInfo(VOT3)

    return (
        <Layout
            safeAreaTestID="Select_Token_Send_Screen"
            title={LL.SEND_TOKEN_TITLE()}
            body={
                <BaseView>
                    <BaseView>
                        <BaseSpacer height={8} />
                        <BaseText typographyFont="subTitle">
                            {LL.SEND_TOKEN_SUBTITLE({ tokenCount: tokens.length })}
                        </BaseText>
                        <BaseSpacer height={8} />
                        <BaseText typographyFont="subSubTitleLight">{LL.SEND_TOKEN_SELECT_ASSET()}</BaseText>
                        <BaseSpacer height={24} />
                    </BaseView>
                    {tokens.length ? (
                        tokens.map(token => {
                            const isVET = token.symbol === VET.symbol
                            const isB3TR = token.symbol === B3TR.symbol
                            const isVTHO = token.symbol === VTHO.symbol
                            const isVOT3 = token.symbol === VOT3.symbol

                            const getTokenWithInfo = () => {
                                if (isVET) {
                                    return tokenWithInfoVET
                                } else if (isVTHO) {
                                    return tokenWithInfoVTHO
                                } else if (isB3TR) {
                                    return tokenWithInfoB3TR
                                } else if (isVOT3) {
                                    return {
                                        ...tokenWithInfoVOT3,
                                        exchangeRate: tokenWithInfoB3TR.exchangeRate,
                                        tokenInfo: tokenWithInfoB3TR.tokenInfo,
                                    }
                                }
                            }

                            return (
                                <OfficialTokenCard
                                    key={token.address}
                                    token={token}
                                    tokenWithInfo={getTokenWithInfo()}
                                    action={handleClickToken(token)}
                                />
                            )
                        })
                    ) : (
                        <BaseText m={20}>{LL.BD_NO_TOKEN_FOUND()}</BaseText>
                    )}
                </BaseView>
            }
        />
    )
}
