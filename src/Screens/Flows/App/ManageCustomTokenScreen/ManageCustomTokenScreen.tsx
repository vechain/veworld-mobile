import React, { useCallback, useEffect, useRef, useState } from "react"
import { useBottomSheetModal, useTheme } from "~Hooks"
import {
    BackButtonHeader,
    BaseIcon,
    BaseSafeArea,
    BaseText,
    BaseView,
    CustomTokenCard,
    DeleteConfirmationBottomSheet,
    DeleteUnderlay,
} from "~Components"
import { useI18nContext } from "~i18n"
import { FungibleToken } from "~Model"
import { AddCustomTokenBottomSheet } from "./BottomSheets"
import { ListRenderItem, StyleSheet, View, FlatList } from "react-native"
import {
    removeTokenBalance,
    selectAccountCustomTokens,
    selectSelectedAccount,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import SwipeableItem, {
    OpenDirection,
    SwipeableItemImperativeRef,
} from "react-native-swipeable-item"
import { useNavigation } from "@react-navigation/native"

export const ManageCustomTokenScreen = () => {
    const theme = useTheme()
    const swipeableItemRefs = useRef<(SwipeableItemImperativeRef | null)[]>([])
    const { LL } = useI18nContext()
    const customTokens = useAppSelector(selectAccountCustomTokens)
    const dispatch = useAppDispatch()
    const account = useAppSelector(selectSelectedAccount)
    const {
        ref: addCustomTokenSheetRef,
        onOpen: openAddCustomTokenSheet,
        onClose: closeAddCustomTokenSheet,
    } = useBottomSheetModal()
    const [selectedToken, setSelectedToken] = useState<FungibleToken>()
    const [selectedIndex, setSelectedIndex] = useState<number>()
    const nav = useNavigation()
    const {
        ref: removeCustomTokenSheetRef,
        onOpen: openRemoveCustomTokenSheet,
        onClose: closeRemoveCustomTokenSheet,
    } = useBottomSheetModal()

    const closeOtherSwipeableItems = useCallback((index?: number) => {
        swipeableItemRefs?.current.forEach((ref, id) => {
            if (id !== index) {
                ref?.close()
            }
        })
    }, [])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleSwipe =
        (item: FungibleToken, index: number) =>
        ({ openDirection }: { openDirection: string }) => {
            if (openDirection === OpenDirection.LEFT) {
                closeOtherSwipeableItems(index)
                setSelectedToken(item)
                setSelectedIndex(index)
            }
        }

    const onTrashIconPress = useCallback(() => {
        closeOtherSwipeableItems()
        openRemoveCustomTokenSheet()
    }, [closeOtherSwipeableItems, openRemoveCustomTokenSheet])

    const renderItem: ListRenderItem<FungibleToken> = useCallback(
        ({ item, index }) => {
            const customStyle = index === 0 ? { marginTop: 20 } : {}
            return (
                <BaseView
                    flexDirection="row"
                    mx={20}
                    my={8}
                    style={customStyle}>
                    <SwipeableItem
                        ref={el => (swipeableItemRefs.current[index] = el)}
                        item={item}
                        renderUnderlayLeft={() => (
                            <DeleteUnderlay onPress={onTrashIconPress} />
                        )}
                        snapPointsLeft={[58]}
                        onChange={handleSwipe(item, index)}>
                        <CustomTokenCard token={item} />
                    </SwipeableItem>
                </BaseView>
            )
        },
        [handleSwipe, onTrashIconPress],
    )

    const handleDelete = () => {
        if (selectedToken?.address) {
            dispatch(
                removeTokenBalance({
                    accountAddress: account.address,
                    tokenAddress: selectedToken.address,
                }),
            )
            closeRemoveCustomTokenSheet()
        } else {
            throw new Error(
                "Trying to unselect an official token without an account selected",
            )
        }
    }

    const handleCloseDeleteModal = () => {
        swipeableItemRefs.current?.[selectedIndex!!]?.close?.()
        closeRemoveCustomTokenSheet()
    }

    useEffect(() => {
        if (customTokens.length === 0) {
            nav.goBack()
        }
    }, [customTokens.length, nav])

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                mx={20}>
                <BaseText typographyFont="subTitleBold">
                    {LL.MANAGE_TOKEN_MANAGE_CUSTOM()}
                </BaseText>
                <BaseIcon
                    name={"plus"}
                    bg={theme.colors.secondary}
                    action={openAddCustomTokenSheet}
                    testID="ManageCustomTokenScreen_plusIcon"
                />
            </BaseView>
            <View style={styles.flatListContainer}>
                <FlatList
                    keyExtractor={_token => _token.address}
                    data={customTokens}
                    renderItem={renderItem}
                />
            </View>
            <AddCustomTokenBottomSheet
                ref={addCustomTokenSheetRef}
                onClose={closeAddCustomTokenSheet}
            />
            <DeleteConfirmationBottomSheet
                ref={removeCustomTokenSheetRef}
                onClose={handleCloseDeleteModal}
                title={LL.MANAGE_CUSTOM_TOKENS_DELETE_TITLE()}
                description={LL.MANAGE_CUSTOM_TOKENS_DELETE_DESC()}
                onConfirm={handleDelete}
                deletingElement={
                    <BaseView flexDirection="row">
                        <CustomTokenCard token={selectedToken!!} />
                    </BaseView>
                }
            />
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    flatListContainer: {
        flex: 1,
        width: "100%",
        marginBottom: 60,
    },
})
