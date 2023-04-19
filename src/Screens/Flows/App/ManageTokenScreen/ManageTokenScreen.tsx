import React, { useState } from "react"
import { StyleSheet } from "react-native"
import { useBottomSheetModal, useTheme } from "~Common"
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
    OfficialTokenCard,
} from "~Components"

import { useI18nContext } from "~i18n"
import { FungibleToken } from "~Model"
import {
    selectNonVechainFungibleTokens,
    selectSelectedAccount,
    selectNonVechainTokensWithBalances,
    selectSelectedNetwork,
    selectAccountCustomTokens,
} from "~Storage/Redux/Selectors"
import { addTokenBalance, removeTokenBalance } from "~Storage/Redux/Slices"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { AddCustomTokenBottomSheet } from "../ManageCustomTokenScreen/BottomSheets"

export const ManageTokenScreen = () => {
    const theme = useTheme()
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const account = useAppSelector(selectSelectedAccount)
    const [tokenQuery, setTokenQuery] = useState<string>("")
    const tokens = useAppSelector(selectNonVechainFungibleTokens)
    const tokenBalances = useAppSelector(selectNonVechainTokensWithBalances)
    const [selectedTokenSymbols, setSelectedTokenSymbols] = useState<string[]>(
        tokenBalances.map(tokenWithBalance => tokenWithBalance.symbol),
    )
    const currentNetwork = useAppSelector(selectSelectedNetwork)
    const customTokens = useAppSelector(selectAccountCustomTokens)
    const {
        ref: addCustomTokenSheetRef,
        onOpen: openAddCustomTokenSheet,
        onClose: closeAddCustomTokenSheet,
    } = useBottomSheetModal()

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
                    genesisId: currentNetwork.genesis.id,
                }),
            )
        } else {
            throw new Error(
                "Trying to select an official token without an account selected",
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
        } else {
            throw new Error(
                "Trying to unselect an official token without an account selected",
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

    const navigateManageCustomTokenScreen = () => {
        nav.navigate(Routes.MANAGE_CUSTOM_TOKEN)
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
                {customTokens.length ? (
                    <BaseTouchableBox
                        action={navigateManageCustomTokenScreen}
                        justifyContent="center">
                        <BaseIcon name="tune" color={theme.colors.primary} />
                        <BaseSpacer width={8} />
                        <BaseText typographyFont="bodyMedium">
                            {LL.MANAGE_TOKEN_MANAGE_CUSTOM()}
                        </BaseText>
                        <BaseSpacer width={8} />
                        <BaseView
                            bg={theme.colors.primary}
                            style={styles.counter}>
                            <BaseText
                                color={theme.colors.textReversed}
                                typographyFont="smallCaptionMedium">
                                {customTokens.length}
                            </BaseText>
                        </BaseView>
                    </BaseTouchableBox>
                ) : (
                    <BaseTouchableBox
                        action={openAddCustomTokenSheet}
                        justifyContent="center">
                        <BaseIcon name="plus" color={theme.colors.primary} />
                        <BaseSpacer width={8} />
                        <BaseText py={3} typographyFont="bodyMedium">
                            {LL.MANAGE_TOKEN_ADD_CUSTOM()}
                        </BaseText>
                    </BaseTouchableBox>
                )}
                <BaseSpacer height={16} />
                <BaseSearchInput
                    value={tokenQuery}
                    setValue={setTokenQuery}
                    placeholder={LL.MANAGE_TOKEN_SEARCH_TOKEN()}
                />
            </BaseView>
            <BaseSpacer height={24} />
            <BaseScrollView
                containerStyle={styles.scrollViewContainer}
                style={styles.scrollView}>
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
            </BaseScrollView>
            <AddCustomTokenBottomSheet
                ref={addCustomTokenSheetRef}
                onClose={closeAddCustomTokenSheet}
            />
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
    counter: {
        borderRadius: 6,
        paddingVertical: 2,
        paddingHorizontal: 4,
    },
})
