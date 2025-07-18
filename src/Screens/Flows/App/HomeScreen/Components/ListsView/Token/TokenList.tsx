import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback, useRef, useState } from "react"
import { StyleSheet, ViewProps } from "react-native"
import { NestableDraggableFlatList, RenderItem } from "react-native-draggable-flatlist"
import Animated, { AnimateProps } from "react-native-reanimated"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { BaseView, SwipeableRow } from "~Components"
import { ColorThemeType, VeDelegate, VET, VTHO } from "~Constants"
import { useBottomSheetModal, useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
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
import {
    selectNonVechainTokensWithBalances,
    selectSelectedAccount,
    selectSelectedNetwork,
} from "~Storage/Redux/Selectors"
import { AccountUtils, BalanceUtils } from "~Utils"
import { AnimatedChartCard } from "./AnimatedChartCard"
import { AnimatedTokenCard } from "./AnimatedTokenCard"

interface Props extends AnimateProps<ViewProps> {
    isEdit: boolean
    isBalanceVisible: boolean
}

export const TokenList = memo(({ isEdit, isBalanceVisible, ...animatedViewProps }: Props) => {
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const tokenBalances = useAppSelector(selectNonVechainTokensWithBalances)
    const { B3TR } = useAppSelector(state => selectNetworkVBDTokens(state))

    // Keep track of the swipeable items refs
    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())

    const selectedAccount = useAppSelector(selectSelectedAccount)

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
