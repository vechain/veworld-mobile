import React, { useEffect, useState } from "react"
import {
    BaseIcon,
    BaseSearchInput,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    DismissKeyboardView,
    Layout,
    OfficialTokenCard,
    PlusIconHeaderButton,
    useThor,
} from "~Components"
import { useAnalyticTracking, useBottomSheetModal, useTheme } from "~Hooks"

import { useNavigation } from "@react-navigation/native"
import { AnalyticsEvent } from "~Constants"
import { useI18nContext } from "~i18n"
import { FungibleToken } from "~Model"
import { Routes } from "~Navigation"
import { updateAccountBalances, useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    selectNonVechainFungibleTokens,
    selectNonVechainTokensWithBalances,
    selectSelectedAccount,
    selectSelectedNetwork,
} from "~Storage/Redux/Selectors"
import { addTokenBalance, removeTokenBalance, setIsAppLoading } from "~Storage/Redux/Slices"
import { AddCustomTokenBottomSheet } from "../ManageCustomTokenScreen/BottomSheets"

export const ManageTokenScreen = () => {
    const theme = useTheme()

    const nav = useNavigation()

    const { LL } = useI18nContext()

    const dispatch = useAppDispatch()

    const account = useAppSelector(selectSelectedAccount)

    const tokenBalances = useAppSelector(selectNonVechainTokensWithBalances)

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
    const thorClient = useThor()

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

        dispatch(updateAccountBalances(thorClient, account.address))

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

    const navigateManageCustomTokenScreen = () => {
        nav.navigate(Routes.MANAGE_CUSTOM_TOKEN)
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

                            <BaseTouchableBox
                                haptics="Light"
                                action={navigateManageCustomTokenScreen}
                                justifyContent="center">
                                <BaseIcon name="icon-settings-2" color={theme.colors.primary} />
                                <BaseSpacer width={8} />
                                <BaseText typographyFont="bodyMedium">
                                    {LL.MANAGE_TOKEN_VIEW_CUSTOM_TOKENS_OWNED()}
                                </BaseText>
                                <BaseSpacer width={8} />
                            </BaseTouchableBox>
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
