import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useState } from "react"
import {
    BaseText,
    BaseView,
    BaseSpacer,
    BaseSearchInput,
    OfficialTokenCard,
    Layout,
} from "~Components"
import { FungibleTokenWithBalance } from "~Model"
import {
    RootStackParamListDiscover,
    RootStackParamListHome,
    Routes,
} from "~Navigation"
import { selectSendableTokensWithBalance, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import * as Haptics from "expo-haptics"

type Props = NativeStackScreenProps<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.SELECT_TOKEN_SEND
>

export const SelectTokenSendScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const [tokenQuery, setTokenQuery] = useState<string>("")
    const tokens = useAppSelector(selectSendableTokensWithBalance)
    const filteredTokens = tokens.filter(
        token =>
            token.name?.toLowerCase().includes(tokenQuery.toLowerCase()) ||
            token.symbol?.toLowerCase().includes(tokenQuery.toLowerCase()),
    )
    const nav = useNavigation()
    const handleClickToken = (token: FungibleTokenWithBalance) => async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        nav.navigate(Routes.SELECT_AMOUNT_SEND, {
            token,
            initialRoute: route.params.initialRoute ?? "",
        })
    }

    return (
        <Layout
            safeAreaTestID="Select_Token_Send_Screen"
            title={LL.SEND_TOKEN_TITLE()}
            header={
                <BaseView>
                    <BaseText typographyFont="button">
                        {LL.SEND_TOKEN_SUBTITLE()}
                    </BaseText>
                    <BaseSpacer height={8} />
                    <BaseText typographyFont="body">
                        {LL.SEND_TOKEN_SELECT_ASSET()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseSearchInput
                        value={tokenQuery}
                        setValue={setTokenQuery}
                        placeholder={LL.MANAGE_TOKEN_SEARCH_TOKEN()}
                    />
                    <BaseSpacer height={16} />
                </BaseView>
            }
            body={
                <BaseView>
                    <BaseSpacer height={8} />
                    {filteredTokens.length ? (
                        filteredTokens.map(token => (
                            <OfficialTokenCard
                                key={token.address}
                                token={token}
                                action={handleClickToken(token)}
                            />
                        ))
                    ) : (
                        <BaseText m={20}>{LL.BD_NO_TOKEN_FOUND()}</BaseText>
                    )}
                </BaseView>
            }
        />
    )
}
