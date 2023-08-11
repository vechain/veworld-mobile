import React, { useEffect, useState } from "react"
import { useAnalyticTracking, useBottomSheetModal, useTheme } from "~Hooks"
import {
    BaseCard,
    BaseIcon,
    BaseSearchInput,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    DismissKeyboardView,
    Layout,
    OfficialTokenCard,
    useThor,
} from "~Components"

import { useI18nContext } from "~i18n"
import { FungibleToken } from "~Model"
import {
    selectNonVechainFungibleTokens,
    selectSelectedAccount,
    selectNonVechainTokensWithBalances,
    selectSelectedNetwork,
    selectSuggestedTokens,
} from "~Storage/Redux/Selectors"
import {
    addTokenBalance,
    removeTokenBalance,
    setIsAppLoading,
} from "~Storage/Redux/Slices"
import {
    updateAccountBalances,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import {
    AddCustomTokenBottomSheet,
    AddSuggestedBottomSheet,
} from "../ManageCustomTokenScreen/BottomSheets"
import { useSuggestedTokens } from "./useSuggestedTokens"
import { AnalyticsEvent } from "~Constants"

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

    const {
        ref: addSuggestedBottomSheet,
        onOpen: openAddSuggestedBottomSheet,
        onClose: closeAddSuggestedBottomSheet,
    } = useBottomSheetModal()

    useSuggestedTokens(selectedTokenSymbols)

    const suggestedTokens = useAppSelector(selectSuggestedTokens)

    const missingSuggestedTokens =
        suggestedTokens?.filter(
            token => !selectedTokenSymbols.includes(token.symbol),
        ) || []

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
    const thorClient = useThor()

    const selectToken = async (token: FungibleToken) => {
        setSelectedTokenSymbols(tokenSymbols => [...tokenSymbols, token.symbol])

        dispatch(
            addTokenBalance({
                accountAddress: account.address,
                balance: {
                    balance: "0",
                    accountAddress: account.address,
                    tokenAddress: token.address,
                    timeUpdated: new Date().toISOString(),
                    position: selectedTokenSymbols.length,
                    genesisId: currentNetwork.genesis.id,
                    isCustomToken: false,
                },
            }),
        )

        dispatch(updateAccountBalances(thorClient, account.address))

        track(AnalyticsEvent.TOKENS_CUSTOM_TOKEN_ADDED)
    }
    const unselectToken = (token: FungibleToken) => {
        setSelectedTokenSymbols(tokenSymbols =>
            tokenSymbols.filter(tokenSymbol => tokenSymbol !== token.symbol),
        )
        dispatch(
            removeTokenBalance({
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

    // On mount set app loading to false
    useEffect(() => {
        setTimeout(() => {
            dispatch(setIsAppLoading(false))
        }, 200)
    }, [dispatch])

    return (
        <DismissKeyboardView>
            <Layout
                safeAreaTestID="Manage_Tokens_Screen"
                body={
                    <>
                        <BaseView>
                            <BaseView
                                flexDirection="row"
                                justifyContent="space-between"
                                alignItems="center"
                                w={100}
                                pt={16}>
                                <BaseText
                                    typographyFont="title"
                                    testID="contacts-screen-title">
                                    {LL.MANAGE_TOKEN_TITLE()}
                                </BaseText>
                                <BaseIcon
                                    haptics="Light"
                                    name={"plus"}
                                    size={24}
                                    bg={theme.colors.secondary}
                                    action={openAddCustomTokenSheet}
                                    testID="Add_Custom_Token_Button"
                                />
                            </BaseView>
                            <BaseSpacer height={8} />
                            <BaseText typographyFont="body">
                                {LL.MANAGE_TOKEN_SELECT_YOUR_TOKEN_BODY()}
                            </BaseText>
                            <BaseSpacer height={16} />

                            <BaseTouchableBox
                                haptics="Light"
                                action={navigateManageCustomTokenScreen}
                                justifyContent="center">
                                <BaseIcon
                                    name="tune"
                                    color={theme.colors.primary}
                                />
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
                            {!!missingSuggestedTokens.length && (
                                <>
                                    <BaseSpacer height={16} />
                                    <BaseCard
                                        onPress={openAddSuggestedBottomSheet}>
                                        <BaseView
                                            justifyContent="center"
                                            w={100}>
                                            <BaseText
                                                typographyFont="body"
                                                align="center">
                                                {LL.MANAGE_TOKEN_SUGGESTED_TOKENS()}
                                            </BaseText>

                                            <BaseText
                                                typographyFont="body"
                                                underline
                                                my={4}
                                                align="center">
                                                {LL.MANAGE_TOKEN_ADD_SUGGESTED_TOKENS()}
                                            </BaseText>
                                        </BaseView>
                                    </BaseCard>
                                </>
                            )}
                        </BaseView>
                        <BaseSpacer height={24} />

                        {filteredTokens.length ? (
                            <>
                                {!!selectedTokens.length && (
                                    <>
                                        <BaseText typographyFont="subSubTitle">
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
                                        <BaseSpacer height={17} />
                                    </>
                                )}
                                {!!unselectedTokens.length && (
                                    <>
                                        <BaseText typographyFont="subSubTitle">
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

                        <AddCustomTokenBottomSheet
                            ref={addCustomTokenSheetRef}
                            onClose={closeAddCustomTokenSheet}
                        />
                        <AddSuggestedBottomSheet
                            setSelectedTokenSymbols={setSelectedTokenSymbols}
                            missingSuggestedTokens={missingSuggestedTokens}
                            ref={addSuggestedBottomSheet}
                            onClose={closeAddSuggestedBottomSheet}
                        />
                    </>
                }
            />
        </DismissKeyboardView>
    )
}
