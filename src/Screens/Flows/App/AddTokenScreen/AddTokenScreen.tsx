import React, { useState } from "react"
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
} from "~Components"

import { useI18nContext } from "~i18n"
import { OfficialTokenCard } from "./Components/OfficialTokenCard"
import { useDispatch, useSelector } from "react-redux"
import { getNetworkFungibleTokens } from "~Storage/Redux/Slices/TokenCache"
import { addAccountToken } from "~Storage/Redux/Slices"
import { FungibleToken } from "~Model"
import { getSelectedAccount } from "~Storage/Redux/Selectors"
import { updateAccountBalances } from "~Services/BalanceService/BalanceService"
import { useNavigation } from "@react-navigation/native"

export const AddTokenScreen = () => {
    const theme = useTheme()
    const { LL } = useI18nContext()
    const dispatch = useDispatch()
    const account = useSelector(getSelectedAccount)
    const [tokenQuery, setTokenQuery] = useState<string>("")
    const tokens = useSelector(getNetworkFungibleTokens)
    const nav = useNavigation()
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
        console.log("account", account)
        if (account?.address) {
            dispatch(
                addAccountToken({
                    ...token,
                    id: `${token.address}-${account.address}`,
                    accountAddress: account.address,
                }),
            )
            dispatch(updateAccountBalances())
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
                containerStyle={{
                    height: 400,
                    width: "100%",
                }}
                style={{
                    paddingHorizontal: 20,
                    width: "100%",
                }}>
                {filteredTokens.length ? (
                    filteredTokens.map((token, index) => (
                        <OfficialTokenCard
                            key={index}
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
