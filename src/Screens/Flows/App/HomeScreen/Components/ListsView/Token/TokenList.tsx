import React, { memo, useCallback, useRef, useState } from "react"
import { StyleSheet, ViewProps } from "react-native"
import {
    NestableDraggableFlatList,
    RenderItemParams,
} from "react-native-draggable-flatlist"
import Animated, { AnimateProps } from "react-native-reanimated"
import { BaseSpacer, BaseView } from "~Components"
import { AnimatedTokenCard } from "./AnimatedTokenCard"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { ColorThemeType, VET, VTHO } from "~Constants"
import {
    changeBalancePosition,
    removeTokenBalance,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import {
    selectNonVechainTokensWithBalances,
    selectSelectedAccount,
    selectTokenWithInfoWithID,
} from "~Storage/Redux/Selectors"
import { AnimatedChartCard } from "./AnimatedChartCard"
import { FungibleTokenWithBalance } from "~Model"
import { RemoveCustomTokenBottomSheet } from "../../RemoveCustomTokenBottomSheet"
import SwipeableItem, {
    OpenDirection,
    SwipeableItemImperativeRef,
} from "react-native-swipeable-item"
import { UnderlayLeft } from "./UnderlayLeft"

interface Props extends AnimateProps<ViewProps> {
    isEdit: boolean
    visibleHeightRef: number
    isBalanceVisible: boolean
}

const underlaySnapPoints = [58]

export const TokenList = memo(
    ({
        isEdit,
        visibleHeightRef,
        isBalanceVisible,
        ...animatedViewProps
    }: Props) => {
        const dispatch = useAppDispatch()
        const tokenBalances = useAppSelector(selectNonVechainTokensWithBalances)
        const tokenWithInfoVET = useAppSelector(state =>
            selectTokenWithInfoWithID(state, VET.symbol),
        )

        // Keep track of the swipeable items refs
        const swipeableItemRefs = useRef<
            Map<string, SwipeableItemImperativeRef>
        >(new Map())

        const selectedAccount = useAppSelector(selectSelectedAccount)

        const [tokenToRemove, setTokenToRemove] =
            useState<FungibleTokenWithBalance>()

        const {
            ref: removeCustomTokenBottomSheetRef,
            onOpen: openRemoveCustomTokenBottomSheet,
            onClose: closeRemoveCustomTokenBottomSheet,
        } = useBottomSheetModal()

        const tokenWithInfoVTHO = useAppSelector(state =>
            selectTokenWithInfoWithID(state, VTHO.symbol),
        )

        const { styles } = useThemedStyles(baseStyles)

        const renderSeparator = useCallback(
            () => <BaseSpacer height={16} />,
            [],
        )

        const onRemoveToken = useCallback(
            (token: FungibleTokenWithBalance) => {
                setTokenToRemove(token)

                openRemoveCustomTokenBottomSheet()
            },
            [openRemoveCustomTokenBottomSheet],
        )

        const onConfirmRemoveToken = useCallback(() => {
            if (tokenToRemove) {
                dispatch(
                    removeTokenBalance({
                        accountAddress: selectedAccount.address,
                        tokenAddress: tokenToRemove.address,
                    }),
                )
                swipeableItemRefs?.current.delete(tokenToRemove.address)
                closeRemoveCustomTokenBottomSheet()
            }
        }, [
            tokenToRemove,
            dispatch,
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
                    accountAddress: selectedAccount.address,
                    updatedAccountBalances: data.map(({ balance }, index) => ({
                        ...balance,
                        position: index,
                    })),
                }),
            )
        }

        const closeOtherSwipeableItems = useCallback((tokenAddress: string) => {
            swipeableItemRefs?.current.forEach((ref, address) => {
                if (address !== tokenAddress) {
                    ref?.close()
                }
            })
        }, [])

        const onSwipeableItemChange = useCallback(
            (token: FungibleTokenWithBalance) => {
                closeOtherSwipeableItems(token.address)
            },
            [closeOtherSwipeableItems],
        )

        const registerSwipeableItemRef = useCallback(
            (address: string, ref: SwipeableItemImperativeRef | null) => {
                if (ref) swipeableItemRefs.current.set(address, ref)
            },
            [],
        )

        const renderToken = useCallback(
            (itemParams: RenderItemParams<FungibleTokenWithBalance>) => {
                return (
                    <SwipeableItem
                        ref={ref =>
                            registerSwipeableItemRef(
                                itemParams.item.address,
                                ref,
                            )
                        }
                        key={itemParams.item.address}
                        item={itemParams.item}
                        onChange={({ openDirection }) => {
                            if (openDirection !== OpenDirection.NONE)
                                onSwipeableItemChange(itemParams.item)
                        }}
                        renderUnderlayLeft={() => (
                            <BaseView mx={20}>
                                <UnderlayLeft onDelete={onRemoveToken} />
                            </BaseView>
                        )}
                        snapPointsLeft={underlaySnapPoints}
                        swipeEnabled={!isEdit}>
                        <AnimatedTokenCard
                            {...itemParams}
                            isEdit={isEdit}
                            isBalanceVisible={isBalanceVisible}
                        />
                    </SwipeableItem>
                )
            },
            [
                isBalanceVisible,
                isEdit,
                onRemoveToken,
                onSwipeableItemChange,
                registerSwipeableItemRef,
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
                        onTouchStart={() => closeOtherSwipeableItems("")}
                        extraData={isEdit}
                        onDragEnd={handleDragEnd}
                        keyExtractor={item => item.address}
                        renderItem={itemParams => (
                            <BaseView>{renderToken(itemParams)}</BaseView>
                        )}
                        activationDistance={60}
                        showsVerticalScrollIndicator={false}
                        autoscrollThreshold={visibleHeightRef}
                        ItemSeparatorComponent={renderSeparator}
                        contentContainerStyle={styles.paddingTop}
                    />
                </Animated.View>

                <RemoveCustomTokenBottomSheet
                    ref={removeCustomTokenBottomSheetRef}
                    tokenToRemove={tokenToRemove}
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
        paddingTop: {
            paddingTop: 16,
        },
    })
