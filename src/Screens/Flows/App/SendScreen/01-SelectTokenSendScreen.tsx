import { useNavigation } from "@react-navigation/native"
import React, { useState } from "react"
import { StyleSheet } from "react-native"
import {
    BaseText,
    BaseSafeArea,
    BackButtonHeader,
    BaseView,
    BaseSpacer,
    BaseSearchInput,
    BaseScrollView,
    OfficialTokenCard,
} from "~Components"
import { FungibleTokenWithBalance } from "~Model"
import { Routes } from "~Navigation"
import { selectSendableTokenWithBalance, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"

export const SelectTokenSendScreen = () => {
    const { LL } = useI18nContext()
    const [tokenQuery, setTokenQuery] = useState<string>("")
    const tokens = useAppSelector(selectSendableTokenWithBalance)
    const nav = useNavigation()
    const handleClickToken = (token: FungibleTokenWithBalance) => () => {
        nav.navigate(Routes.SELECT_AMOUNT_SEND, {
            token,
        })
    }
    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
            <BaseView mx={24}>
                <BaseText typographyFont="subTitleBold">
                    {LL.SEND_TOKEN_TITLE()}
                </BaseText>
                <BaseSpacer height={24} />
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
            </BaseView>
            <BaseSpacer height={16} />
            <BaseScrollView
                containerStyle={styles.scrollViewContainer}
                style={styles.scrollView}>
                {tokens.length ? (
                    tokens.map(token => (
                        <OfficialTokenCard
                            key={token.address}
                            token={token}
                            action={handleClickToken(token)}
                        />
                    ))
                ) : (
                    <BaseText m={20}>{LL.BD_NO_TOKEN_FOUND()}</BaseText>
                )}
            </BaseScrollView>
        </BaseSafeArea>
    )
}
const styles = StyleSheet.create({
    scrollViewContainer: {
        marginBottom: 60,
        flex: 1,
        width: "100%",
    },
    scrollView: {
        paddingHorizontal: 20,
        width: "100%",
    },
})
