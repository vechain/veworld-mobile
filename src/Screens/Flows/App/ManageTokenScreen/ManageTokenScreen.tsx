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
} from "~Components"

import { useI18nContext } from "~i18n"
import { OfficialTokenCard } from "./Components/OfficialTokenCard"
import { FungibleToken } from "~Model"
import {
    selectNonVechainFungibleTokens,
    selectSelectedAccount,
    selectNonVechainDenormalizedAccountTokenBalances,
    selectSelectedNetwork,
} from "~Storage/Redux/Selectors"
import { addTokenBalance, removeTokenBalance } from "~Storage/Redux/Slices"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"

export const ManageTokenScreen = () => {
    const theme = useTheme()
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const account = useAppSelector(selectSelectedAccount)
    const [tokenQuery, setTokenQuery] = useState<string>("")
    const tokens = useAppSelector(selectNonVechainFungibleTokens)
    const tokenBalances = useAppSelector(
        selectNonVechainDenormalizedAccountTokenBalances,
    )
    const [selectedTokenSymbols, setSelectedTokenSymbols] = useState<string[]>(
        tokenBalances.map(({ token }) => token.symbol),
    )
    const currentNetwork = useAppSelector(selectSelectedNetwork)

    const filteredTokens = tokens.filter(
        token =>
            token.name
                .toLocaleLowerCase()
                .includes(tokenQuery.toLocaleLowerCase()) ||
            token.symbol
                .toLocaleLowerCase()
                .includes(tokenQuery.toLocaleLowerCase()),
    )
    const selectedTokens = filteredTokens.filter(token =>
        selectedTokenSymbols.includes(token.symbol),
    )
    const unselectedTokens = filteredTokens.filter(
        token => !selectedTokenSymbols.includes(token.symbol),
    )

    const selectToken = (token: FungibleToken) => {
        if (account?.address) {
            setSelectedTokenSymbols(tokenSymbols => [
                ...tokenSymbols,
                token.symbol,
            ])
            dispatch(
                addTokenBalance({
                    balance: "0",
                    accountAddress: account.address,
                    tokenAddress: token.address,
                    timeUpdated: new Date().toISOString(),
                    position: selectedTokenSymbols.length,
                    networkGenesisId: currentNetwork.genesisId,
                }),
            )
        }
    }
    const unselectToken = (token: FungibleToken) => {
        if (account?.address) {
            setSelectedTokenSymbols(tokenSymbols =>
                tokenSymbols.filter(
                    tokenSymbol => tokenSymbol !== token.symbol,
                ),
            )
            dispatch(
                removeTokenBalance({
                    accountAddress: account.address,
                    tokenAddress: token.address,
                }),
            )
        }
    }

    const handleClickToken = (token: FungibleToken) => () => {
        if (selectedTokenSymbols.includes(token.symbol)) {
            unselectToken(token)
        } else {
            selectToken(token)
        }
    }

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
            <BaseView mx={20}>
                <BaseText typographyFont="title">
                    {LL.MANAGE_TOKEN_TITLE()}
                </BaseText>
                <BaseSpacer height={24} />
                <BaseText typographyFont="button">
                    {LL.MANAGE_TOKEN_SELECT_YOUR_TOKEN_SUBTITLE()}
                </BaseText>
                <BaseSpacer height={8} />
                <BaseText typographyFont="body">
                    {LL.MANAGE_TOKEN_SELECT_YOUR_TOKEN_BODY()}
                </BaseText>
                <BaseSpacer height={16} />
                <BaseTouchableBox
                    action={() => {}} // TODO: add action
                    justifyContent="center">
                    <BaseIcon name="tune" size={16} color={theme.colors.text} />
                    <BaseSpacer width={10} />
                    <BaseText py={3}>
                        {LL.MANAGE_TOKEN_MANAGE_CUSTOM()}
                    </BaseText>
                </BaseTouchableBox>
                <BaseSpacer height={16} />
                <BaseSearchInput
                    value={tokenQuery}
                    setValue={setTokenQuery}
                    placeholder={LL.MANAGE_TOKEN_SEARCH_TOKEN()}
                />
                <BaseSpacer height={16} />
            </BaseView>
            <BaseScrollView
                containerStyle={styles.scrollViewContainer}
                style={styles.scrollView}>
                {filteredTokens.length ? (
                    <>
                        {!!selectedTokens.length && (
                            <>
                                <BaseText typographyFont="body">
                                    {LL.MANAGE_TOKEN_SELECTED()}
                                </BaseText>
                                <BaseSpacer height={16} />
                                {selectedTokens.map(token => (
                                    <OfficialTokenCard
                                        selected
                                        key={token.address}
                                        token={token}
                                        action={handleClickToken(token)}
                                    />
                                ))}
                                <BaseSpacer height={24} />
                            </>
                        )}
                        {!!unselectedTokens.length && (
                            <>
                                <BaseText typographyFont="body">
                                    {LL.MANAGE_TOKEN_UNSELECTED()}
                                </BaseText>
                                <BaseSpacer height={16} />
                                {unselectedTokens.map(token => (
                                    <OfficialTokenCard
                                        key={token.address}
                                        token={token}
                                        action={handleClickToken(token)}
                                    />
                                ))}
                            </>
                        )}
                    </>
                ) : (
                    <BaseText m={20}>{LL.BD_NO_TOKEN_FOUND()}</BaseText>
                )}
            </BaseScrollView>
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        flex: 1,
        width: "100%",
        marginBottom: 60,
    },
    scrollView: {
        paddingHorizontal: 20,
        width: "100%",
    },
})

/*
// TODO: Davide Carpini: this will be used in custom token bottom sheet, please do not remove
<BaseView flexDirection="row">
                    <BaseTouchableBox
                        action={() => {}} 
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
*/
