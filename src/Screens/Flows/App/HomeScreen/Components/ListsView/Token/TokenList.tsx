import { useNavigation } from "@react-navigation/native"
import { useQuery } from "@tanstack/react-query"
import React, { memo, useCallback, useMemo, useRef, useState } from "react"
import { StyleSheet, ViewProps } from "react-native"
import { NestableDraggableFlatList, RenderItem } from "react-native-draggable-flatlist"
import Animated, { AnimateProps } from "react-native-reanimated"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { BaseView, SwipeableRow } from "~Components"
import { ColorThemeType, VeDelegate, VET, VOT3, VTHO } from "~Constants"
import { useBottomSheetModal, useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { useOfficialTokens } from "~Hooks/useOfficialTokens"
import { useMultipleTokensBalance } from "~Hooks/useTokenBalance/useMultipleTokensBalance"
import { getUseUserTokensConfig } from "~Hooks/useUserTokens"
import { FungibleTokenWithBalance } from "~Model"
import { Routes } from "~Navigation"
import { RemoveCustomTokenBottomSheet } from "~Screens"
import {
    changeBalancePosition,
    removeTokenBalance,
    selectNetworkVBDTokens,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { selectCustomTokens, selectSelectedAccount, selectSelectedNetwork } from "~Storage/Redux/Selectors"
import { AccountUtils, AddressUtils, BalanceUtils } from "~Utils"
import { AnimatedChartCard } from "./AnimatedChartCard"
import { AnimatedTokenCard } from "./AnimatedTokenCard"

interface Props extends AnimateProps<ViewProps> {
    isEdit: boolean
    isBalanceVisible: boolean
}

export const TokenList = memo(({ isEdit, isBalanceVisible, ...animatedViewProps }: Props) => {
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { B3TR } = useAppSelector(state => selectNetworkVBDTokens(state))
    const { data: userTokens } = useQuery({
        ...getUseUserTokensConfig({ address: selectedAccount.address, network }),
        select(data) {
            return data.filter(d => ![B3TR, VET, VTHO, VOT3].find(u => AddressUtils.compareAddresses(u.address, d)))
        },
    })
    // const tokenBalances = useAppSelector(selectNonVechainTokensWithBalances)
    const { data: officialTokens } = useOfficialTokens()
    const customTokens = useAppSelector(selectCustomTokens)

    const userValidTokens = useMemo(() => {
        if (!userTokens) return []
        if (!officialTokens) return []
        return userTokens
            .map(ut => {
                const foundOfficial = officialTokens.find(ot => AddressUtils.compareAddresses(ot.address, ut))
                if (foundOfficial) return foundOfficial
                const foundCustom = customTokens.find(ct => AddressUtils.compareAddresses(ct.address, ut))
                if (foundCustom) return foundCustom
                return null
            })
            .filter((u): u is NonNullable<typeof u> => Boolean(u))
    }, [customTokens, officialTokens, userTokens])
    const userValidTokenAddresses = useMemo(() => userValidTokens.map(u => u.address), [userValidTokens])
    const _tokenBalances = useMultipleTokensBalance(userValidTokenAddresses, selectedAccount.address)

    const tokenBalances = useMemo(
        () =>
            userValidTokens.map(
                tk =>
                    ({
                        ...tk,
                        balance: _tokenBalances?.find(b =>
                            AddressUtils.compareAddresses(b.tokenAddress, tk.address),
                        ) ?? {
                            balance: "0",
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                            tokenAddress: tk.address,
                        },
                    } satisfies FungibleTokenWithBalance),
            ),
        [_tokenBalances, userValidTokens],
    )

    // Keep track of the swipeable items refs
    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())

    const [selectedToken, setSelectedToken] = useState<FungibleTokenWithBalance>()

    const tokenToRemove = useRef<FungibleTokenWithBalance | null>(null)

    const {
        ref: removeCustomTokenBottomSheetRef,
        onOpen: openRemoveCustomTokenBottomSheet,
        onClose: closeRemoveCustomTokenBottomSheet,
    } = useBottomSheetModal()

    const tokenWithInfoVET = useTokenWithCompleteInfo(VET)
    const tokenWithInfoVTHO = useTokenWithCompleteInfo(VTHO)
    const tokenWithInfoB3TR = useTokenWithCompleteInfo(B3TR)

    const { styles } = useThemedStyles(baseStyles)

    const onConfirmRemoveToken = useCallback(() => {
        if (tokenToRemove.current) {
            dispatch(
                removeTokenBalance({
                    network: network.type,
                    accountAddress: selectedAccount.address,
                    tokenAddress: tokenToRemove.current.address,
                }),
            )
            swipeableItemRefs?.current.delete(tokenToRemove.current.address)
            closeRemoveCustomTokenBottomSheet()
        }
    }, [tokenToRemove, dispatch, network.type, selectedAccount.address, closeRemoveCustomTokenBottomSheet])

    const handleDragEnd = ({ data }: { data: FungibleTokenWithBalance[] }) => {
        dispatch(
            changeBalancePosition({
                network: network.type,
                accountAddress: selectedAccount.address,
                updatedAccountBalances: data.map(({ balance }, index) => ({
                    ...balance,
                    position: index,
                })),
            }),
        )
    }

    const nav = useNavigation()

    const closeOtherSwipeableItems = useCallback(() => {
        swipeableItemRefs?.current.forEach(ref => {
            ref?.close()
        })
    }, [swipeableItemRefs])

    const onTokenPress = useCallback(
        (token: FungibleTokenWithBalance) => {
            const isTokenBalance = BalanceUtils.getIsTokenWithBalance(token)

            if (token.crossChainProvider) {
                nav.navigate(Routes.BRIDGE_TOKEN_DETAILS, {
                    token,
                })
                return
            }

            if (!isEdit && isTokenBalance) {
                closeOtherSwipeableItems()

                if (AccountUtils.isObservedAccount(selectedAccount)) return

                nav.navigate(Routes.INSERT_ADDRESS_SEND, {
                    token,
                })
            }
        },
        [isEdit, closeOtherSwipeableItems, selectedAccount, nav],
    )

    const handleTrashIconPress = useCallback(
        (item: FungibleTokenWithBalance) => () => {
            setSelectedToken(item)
            openRemoveCustomTokenBottomSheet()
        },
        [openRemoveCustomTokenBottomSheet],
    )

    const renderItem: RenderItem<FungibleTokenWithBalance> = useCallback(
        ({ item, isActive, drag }) => {
            const isDisabled = item.symbol === VeDelegate.symbol

            return (
                <BaseView mb={8}>
                    <SwipeableRow
                        testID={item.symbol}
                        xMargins={0}
                        yMargins={0}
                        item={item}
                        itemKey={item.address}
                        swipeableItemRefs={swipeableItemRefs}
                        handleTrashIconPress={handleTrashIconPress(item)}
                        setSelectedItem={() => (tokenToRemove.current = item)}
                        swipeEnabled={!isEdit}
                        onPress={onTokenPress}
                        isDragMode={isEdit}
                        isDisabled={isDisabled}
                        isOpen={tokenToRemove.current?.address === item.address}>
                        <AnimatedTokenCard
                            item={item}
                            isActive={isActive}
                            drag={drag}
                            isEdit={isEdit}
                            isBalanceVisible={isBalanceVisible}
                        />
                    </SwipeableRow>
                </BaseView>
            )
        },
        [handleTrashIconPress, isBalanceVisible, isEdit, onTokenPress],
    )

    return (
        <>
            <Animated.View style={styles.container} {...animatedViewProps}>
                <AnimatedChartCard
                    tokenWithInfo={tokenWithInfoVET}
                    isEdit={isEdit}
                    isBalanceVisible={isBalanceVisible}
                />
                <AnimatedChartCard
                    tokenWithInfo={tokenWithInfoB3TR}
                    isEdit={isEdit}
                    isBalanceVisible={isBalanceVisible}
                />
                <AnimatedChartCard
                    tokenWithInfo={tokenWithInfoVTHO}
                    isEdit={isEdit}
                    isBalanceVisible={isBalanceVisible}
                    hideChart
                />

                <NestableDraggableFlatList
                    data={tokenBalances}
                    extraData={isEdit}
                    onDragEnd={handleDragEnd}
                    keyExtractor={item => item.address}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    activationDistance={30}
                />
            </Animated.View>

            <RemoveCustomTokenBottomSheet
                ref={removeCustomTokenBottomSheetRef}
                tokenToRemove={selectedToken}
                onConfirmRemoveToken={onConfirmRemoveToken}
                onClose={closeRemoveCustomTokenBottomSheet}
            />
        </>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
        },
    })
