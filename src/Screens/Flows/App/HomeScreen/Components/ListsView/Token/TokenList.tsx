import React, { memo, useCallback, useRef, useState } from "react"
import { StyleSheet, ViewProps } from "react-native"
import {
    NestableDraggableFlatList,
    RenderItem,
} from "react-native-draggable-flatlist"
import Animated, { AnimateProps } from "react-native-reanimated"
import { SwipeableRow } from "~Components"
import { AnimatedTokenCard } from "./AnimatedTokenCard"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import {
    changeBalancePosition,
    removeTokenBalance,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import {
    selectNonVechainTokensWithBalances,
    selectSelectedAccount,
    selectSelectedNetwork,
    selectVetTokenWithInfo,
    selectVthoTokenWithInfo,
} from "~Storage/Redux/Selectors"
import { AnimatedChartCard } from "./AnimatedChartCard"
import { FungibleTokenWithBalance } from "~Model"
import { RemoveCustomTokenBottomSheet } from "../../RemoveCustomTokenBottomSheet"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { BalanceUtils } from "~Utils"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"

interface Props extends AnimateProps<ViewProps> {
    isEdit: boolean
    isBalanceVisible: boolean
}

export const TokenList = memo(
    ({ isEdit, isBalanceVisible, ...animatedViewProps }: Props) => {
        const dispatch = useAppDispatch()
        const network = useAppSelector(selectSelectedNetwork)
        const tokenBalances = useAppSelector(selectNonVechainTokensWithBalances)
        const tokenWithInfoVET = useAppSelector(selectVetTokenWithInfo)

        // Keep track of the swipeable items refs
        const swipeableItemRefs = useRef<
            Map<string, SwipeableItemImperativeRef>
        >(new Map())

        const selectedAccount = useAppSelector(selectSelectedAccount)

        const [selectedToken, setSelectedToken] =
            useState<FungibleTokenWithBalance>()

        const tokenToRemove = useRef<FungibleTokenWithBalance | null>(null)

        const {
            ref: removeCustomTokenBottomSheetRef,
            onOpen: openRemoveCustomTokenBottomSheet,
            onClose: closeRemoveCustomTokenBottomSheet,
        } = useBottomSheetModal()

        const tokenWithInfoVTHO = useAppSelector(selectVthoTokenWithInfo)

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
        }, [
            tokenToRemove,
            dispatch,
            network.type,
            selectedAccount.address,
            closeRemoveCustomTokenBottomSheet,
        ])

        const handleDragEnd = ({
            data,
        }: {
            data: FungibleTokenWithBalance[]
        }) => {
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

                if (!isEdit && isTokenBalance) {
                    closeOtherSwipeableItems()
                    nav.navigate(Routes.SELECT_AMOUNT_SEND, {
                        token,
                        initialRoute: Routes.HOME,
                    })
                }
            },
            [nav, closeOtherSwipeableItems, isEdit],
        )

        const handleTrashIconPress = useCallback(
            (item: FungibleTokenWithBalance) => () => {
                setSelectedToken(item)
                openRemoveCustomTokenBottomSheet()
            },
            [openRemoveCustomTokenBottomSheet],
        )

        const renderItem: RenderItem<FungibleTokenWithBalance> = useCallback(
            ({ item, getIndex, isActive, drag }) => {
                return (
                    <SwipeableRow
                        item={item}
                        itemKey={item.address}
                        swipeableItemRefs={swipeableItemRefs}
                        handleTrashIconPress={handleTrashIconPress(item)}
                        setSelectedItem={() => (tokenToRemove.current = item)}
                        swipeEnabled={!isEdit}
                        onPress={onTokenPress}
                        isDragMode={isEdit}
                        isOpen={
                            tokenToRemove.current?.address === item.address
                        }>
                        <AnimatedTokenCard
                            item={item}
                            isActive={isActive}
                            getIndex={getIndex}
                            drag={drag}
                            isEdit={isEdit}
                            isBalanceVisible={isBalanceVisible}
                        />
                    </SwipeableRow>
                )
            },
            [
                handleTrashIconPress,
                isBalanceVisible,
                isEdit,
                onTokenPress,
                tokenToRemove,
            ],
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
                        tokenWithInfo={tokenWithInfoVTHO}
                        isEdit={isEdit}
                        isBalanceVisible={isBalanceVisible}
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
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
        },
    })
