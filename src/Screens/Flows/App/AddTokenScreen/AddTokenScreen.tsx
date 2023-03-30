import React, { useState } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Common"
import {
    BackButtonHeader,
    BaseIcon,
    BaseSafeArea,
    BaseScrollView,
    BaseSearchInput,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    useThor,
} from "~Components"

import { useI18nContext } from "~i18n"
import { OfficialTokenCard } from "./Components/OfficialTokenCard"
import { FungibleToken } from "~Model"
import {
    selectNonVechainFungibleTokens,
    getSelectedAccount,
} from "~Storage/Redux/Selectors"
import { updateAccountBalances } from "~Services/BalanceService/BalanceService"
import { useNavigation } from "@react-navigation/native"
import { addTokenBalance } from "~Storage/Redux/Slices"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"

export const AddTokenScreen = () => {
    const theme = useTheme()
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const account = useAppSelector(getSelectedAccount)
    const [tokenQuery, setTokenQuery] = useState<string>("")
    const tokens = useAppSelector(selectNonVechainFungibleTokens)
    const nav = useNavigation()
    const thorClient = useThor()
    const filteredTokens = tokens.filter(
        token =>
            token.name
                .toLocaleLowerCase()
                .includes(tokenQuery.toLocaleLowerCase()) ||
            token.symbol
                .toLocaleLowerCase()
                .includes(tokenQuery.toLocaleLowerCase()),
    )

    const addToken = (token: FungibleToken) => () => {
        if (account?.address) {
            dispatch(
                addTokenBalance({
                    balance: "0",
                    accountAddress: account.address,
                    tokenAddress: token.address,
                    timeUpdated: new Date().toISOString(),
                }),
            )
            dispatch(updateAccountBalances(thorClient))
            nav.goBack()
        }
    }

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
            <BaseView mx={20}>
                <BaseText typographyFont="title">
                    {LL.TITLE_ADD_TOKEN()}
                </BaseText>
                <BaseSpacer height={24} />
                <BaseText typographyFont="button">
                    {LL.ADD_TOKEN_SELECT_YOUR_TOKEN_subtitle()}
                </BaseText>
                <BaseSpacer height={8} />
                <BaseText typographyFont="body">
                    {LL.ADD_TOKEN_SELECT_YOUR_TOKEN_body()}
                </BaseText>
                <BaseSpacer height={24} />
                <BaseView flexDirection="row">
                    <BaseTouchableBox
                        action={() => {}} // TODO: add action
                        w="auto"
                        flex={1}
                        justifyContent="space-between">
                        <BaseIcon
                            name="clipboard-outline"
                            size={20}
                            color={theme.colors.text}
                        />
                        <BaseText>{LL.BTN_PASTE_ADDRESS()}</BaseText>
                    </BaseTouchableBox>
                    <BaseSpacer width={16} />
                    <BaseTouchableBox
                        action={() => {}} // TODO: add action
                        w="auto"
                        flex={1}
                        justifyContent="space-between">
                        <BaseIcon
                            name="flip-horizontal"
                            size={20}
                            color={theme.colors.text}
                        />
                        <BaseText>{LL.BTN_SCAN_QR_CODE()}</BaseText>
                    </BaseTouchableBox>
                </BaseView>
                <BaseSpacer height={24} />
                <BaseSearchInput
                    value={tokenQuery}
                    setValue={setTokenQuery}
                    placeholder={LL.INPUT_PLACEHOLDER_SEARCH_TOKEN()}
                />
                <BaseSpacer height={16} />
            </BaseView>
            <BaseScrollView
                containerStyle={styles.scrollViewContainer}
                style={styles.scrollView}>
                {filteredTokens.length ? (
                    filteredTokens.map(token => (
                        <OfficialTokenCard
                            key={token.address}
                            token={token}
                            action={addToken(token)}
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
        height: 400,
        width: "100%",
    },
    scrollView: {
        paddingHorizontal: 20,
        width: "100%",
    },
})
