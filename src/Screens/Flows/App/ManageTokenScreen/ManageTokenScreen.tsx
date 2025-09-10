import React, { useEffect, useState } from "react"
import {
    BaseSearchInput,
    BaseSpacer,
    BaseText,
    BaseView,
    DismissKeyboardView,
    Layout,
    OfficialTokenCard,
    PlusIconHeaderButton,
} from "~Components"
import { useAnalyticTracking, useBottomSheetModal } from "~Hooks"

import { useQueryClient } from "@tanstack/react-query"
import { AnalyticsEvent } from "~Constants"
import { useNonVechainTokensBalance } from "~Hooks/useNonVechainTokensBalance"
import { useI18nContext } from "~i18n"
import { FungibleToken } from "~Model"
import { updateAccountBalances, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectNonVechainFungibleTokens, selectSelectedAccount, selectSelectedNetwork } from "~Storage/Redux/Selectors"
import { addTokenBalance, removeTokenBalance, setIsAppLoading } from "~Storage/Redux/Slices"
import { AddCustomTokenBottomSheet } from "../ManageCustomTokenScreen/BottomSheets"

export const ManageTokenScreen = () => {
    const { LL } = useI18nContext()

    const dispatch = useAppDispatch()

    const account = useAppSelector(selectSelectedAccount)

    const { data: tokenBalances } = useNonVechainTokensBalance()

    const tokens = useAppSelector(selectNonVechainFungibleTokens)

    const currentNetwork = useAppSelector(selectSelectedNetwork)

    const track = useAnalyticTracking()

    const [tokenQuery, setTokenQuery] = useState<string>("")
    const [selectedTokenSymbols, setSelectedTokenSymbols] = useState<string[]>(
        tokenBalances.map(tokenWithBalance => tokenWithBalance.symbol),
    )

    const {
        ref: addCustomTokenSheetRef,
        onOpen: openAddCustomTokenSheet,
        onClose: closeAddCustomTokenSheet,
    } = useBottomSheetModal()

    const filteredTokens = tokens.filter(
        token =>
            token.name.toLocaleLowerCase().includes(tokenQuery.toLocaleLowerCase()) ||
            token.symbol.toLocaleLowerCase().includes(tokenQuery.toLocaleLowerCase()),
    )
    const selectedTokens = filteredTokens.filter(token => selectedTokenSymbols.includes(token.symbol))
    const unselectedTokens = filteredTokens.filter(token => !selectedTokenSymbols.includes(token.symbol))
    const queryClient = useQueryClient()

    const selectToken = async (token: FungibleToken) => {
        setSelectedTokenSymbols(tokenSymbols => [...tokenSymbols, token.symbol])

        dispatch(
            addTokenBalance({
                network: currentNetwork.type,
                accountAddress: account.address,
                balance: {
                    balance: "0",
                    tokenAddress: token.address,
                    timeUpdated: new Date(0).toISOString(),
                    isCustomToken: false,
                    isHidden: false,
                },
            }),
        )

        dispatch(updateAccountBalances(account.address, queryClient))

        track(AnalyticsEvent.TOKENS_CUSTOM_TOKEN_ADDED)
    }
    const unselectToken = (token: FungibleToken) => {
        setSelectedTokenSymbols(tokenSymbols => tokenSymbols.filter(tokenSymbol => tokenSymbol !== token.symbol))
        dispatch(
            removeTokenBalance({
                network: currentNetwork.type,
                accountAddress: account.address,
                tokenAddress: token.address,
            }),
        )
    }

    const handleClickToken = (token: FungibleToken) => () => {
        if (selectedTokenSymbols.includes(token.symbol)) {
            unselectToken(token)
        } else {
            selectToken(token)
        }
    }

    useEffect(() => {
        setTimeout(() => {
            dispatch(setIsAppLoading(false))
        }, 300)
    }, [dispatch])

    return (
        <DismissKeyboardView>
            <Layout
                safeAreaTestID="Manage_Tokens_Screen"
                title={LL.MANAGE_TOKEN_TITLE()}
                headerRightElement={
                    <PlusIconHeaderButton
                        action={openAddCustomTokenSheet}
                        testID="ManageTokenScreen_AddCustomToken_Button"
                    />
                }
                body={
                    <>
                        <BaseView>
                            <BaseSpacer height={8} />
                            <BaseText typographyFont="body">{LL.MANAGE_TOKEN_SELECT_YOUR_TOKEN_BODY()}</BaseText>
                            <BaseSpacer height={16} />
                            <BaseSearchInput
                                value={tokenQuery}
                                setValue={setTokenQuery}
                                placeholder={LL.MANAGE_TOKEN_SEARCH_TOKEN()}
                                testID="ManageTokenScreen_SearchInput_searchTokenInput"
                            />
                        </BaseView>
                        <BaseSpacer height={24} />

                        {filteredTokens.length ? (
                            <>
                                {!!selectedTokens.length && (
                                    <>
                                        <BaseText typographyFont="subSubTitle">{LL.MANAGE_TOKEN_SELECTED()}</BaseText>
                                        <BaseSpacer height={16} />
                                        {selectedTokens.map(token => (
                                            <OfficialTokenCard
                                                iconSize={26}
                                                selected
                                                key={token.address}
                                                token={token}
                                                action={handleClickToken(token)}
                                            />
                                        ))}
                                        <BaseSpacer height={17} />
                                    </>
                                )}
                                {!!unselectedTokens.length && (
                                    <>
                                        <BaseText typographyFont="subSubTitle">{LL.MANAGE_TOKEN_UNSELECTED()}</BaseText>
                                        <BaseSpacer height={16} />
                                        {unselectedTokens.map(token => (
                                            <OfficialTokenCard
                                                iconSize={26}
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

                        <AddCustomTokenBottomSheet ref={addCustomTokenSheetRef} onClose={closeAddCustomTokenSheet} />
                    </>
                }
            />
        </DismissKeyboardView>
    )
}
