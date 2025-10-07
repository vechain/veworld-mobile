import React, { useCallback, useEffect, useMemo, useState } from "react"
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

import { AnalyticsEvent } from "~Constants"
import { useNonVechainTokensBalance } from "~Hooks/useNonVechainTokensBalance"
import { useI18nContext } from "~i18n"
import { FungibleToken } from "~Model"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectNonVechainFungibleTokens, selectSelectedAccount, selectSelectedNetwork } from "~Storage/Redux/Selectors"
import { setIsAppLoading, toggleTokenVisibility } from "~Storage/Redux/Slices"
import { AddCustomTokenBottomSheet } from "../ManageCustomTokenScreen/BottomSheets"
import { BigNutils } from "~Utils"

export const ManageTokenScreen = () => {
    const { LL } = useI18nContext()

    const dispatch = useAppDispatch()

    const account = useAppSelector(selectSelectedAccount)

    const { data: tokenBalances } = useNonVechainTokensBalance()

    const tokens = useAppSelector(selectNonVechainFungibleTokens)

    const currentNetwork = useAppSelector(selectSelectedNetwork)

    const track = useAnalyticTracking()

    const [tokenQuery, setTokenQuery] = useState<string>("")

    const {
        ref: addCustomTokenSheetRef,
        onOpen: openAddCustomTokenSheet,
        onClose: closeAddCustomTokenSheet,
    } = useBottomSheetModal()

    const selectedTokenSymbols = useMemo(() => {
        return tokenBalances.filter(tk => !tk.balance.isHidden).map(tokenWithBalance => tokenWithBalance.symbol)
    }, [tokenBalances])

    const selectableTokens = useCallback(
        (token: FungibleToken) => {
            return tokenBalances.some(tk => !BigNutils(tk.balance.balance).isZero && tk.symbol === token.symbol)
        },
        [tokenBalances],
    )

    const filteredTokens = useMemo(
        () =>
            tokens.filter(
                token =>
                    token.name.toLocaleLowerCase().includes(tokenQuery.toLocaleLowerCase()) ||
                    token.symbol.toLocaleLowerCase().includes(tokenQuery.toLocaleLowerCase()),
            ),
        [tokenQuery, tokens],
    )
    const selectedTokens = useMemo(
        () => filteredTokens.filter(token => selectedTokenSymbols.includes(token.symbol)),
        [filteredTokens, selectedTokenSymbols],
    )
    const unselectedTokens = useMemo(() => {
        const unselected = filteredTokens.filter(token => !selectedTokenSymbols.includes(token.symbol))

        return unselected.sort((a, b) => {
            const aIsSelectable = selectableTokens(a)
            const bIsSelectable = selectableTokens(b)

            // First, prioritize selectable tokens (those with non-zero balance)
            if (aIsSelectable && !bIsSelectable) return -1
            if (!aIsSelectable && bIsSelectable) return 1

            // If both have zero balance or same balance, sort alphabetically by symbol
            return a.symbol.localeCompare(b.symbol)
        })
    }, [filteredTokens, selectedTokenSymbols, selectableTokens])

    const selectToken = async (token: FungibleToken) => {
        dispatch(
            toggleTokenVisibility({
                network: currentNetwork.type,
                accountAddress: account.address,
                tokenAddress: token.address,
            }),
        )
        track(AnalyticsEvent.TOKENS_CUSTOM_TOKEN_ADDED)
    }
    const unselectToken = (token: FungibleToken) => {
        dispatch(
            toggleTokenVisibility({
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
                                                disabled={!selectableTokens(token)}
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
