import React, { useCallback, useRef, useState } from "react"
import {
    ColorThemeType,
    useBottomSheetModal,
    useTheme,
    useThemedStyles,
} from "~Common"
import {
    BackButtonHeader,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    CustomTokenCard,
} from "~Components"
import { useI18nContext } from "~i18n"
import { FungibleToken } from "~Model"
import {
    AddCustomTokenBottomSheet,
    DeleteCustomTokenBottomSheet,
} from "./BottomSheets"
import { ListRenderItem, StyleSheet, View, FlatList } from "react-native"
import {
    deleteCustomToken,
    removeTokenBalance,
    selectCustomTokens,
    selectSelectedAccount,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import SwipeableItem, {
    SwipeableItemImperativeRef,
} from "react-native-swipeable-item"

export const ManageCustomTokenScreen = () => {
    const theme = useTheme()
    const swipeableItemRef = useRef<(SwipeableItemImperativeRef | null)[]>([])
    const { LL } = useI18nContext()
    const customTokens = useAppSelector(selectCustomTokens)
    const dispatch = useAppDispatch()
    const account = useAppSelector(selectSelectedAccount)
    const {
        ref: addCustomTokenSheetRef,
        onOpen: openAddCustomTokenSheet,
        onClose: closeAddCustomTokenSheet,
    } = useBottomSheetModal()
    const [selectedToken, setSelectedToken] = useState<FungibleToken>()
    const [selectedIndex, setSelectedIndex] = useState<number>()

    const {
        ref: removeCustomTokenSheetRef,
        onOpen: openRemoveCustomTokenSheet,
        onClose: closeRemoveCustomTokenSheet,
    } = useBottomSheetModal()

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleSwipe =
        (item: FungibleToken, index: number) =>
        ({ openDirection }: { openDirection: string }) => {
            setSelectedToken(item)
            setSelectedIndex(index)
            if (openDirection !== "none") {
                openRemoveCustomTokenSheet()
            }
        }

    const renderItem: ListRenderItem<FungibleToken> = useCallback(
        ({ item, index }) => {
            const customStyle = index === 0 ? { marginTop: 20 } : {}
            return (
                <SwipeableItem
                    ref={el => (swipeableItemRef.current[index] = el)}
                    key={item.address}
                    item={item}
                    renderUnderlayLeft={() => <UnderlayLeft index={index} />}
                    snapPointsLeft={[50]}
                    onChange={handleSwipe(item, index)}>
                    <CustomTokenCard
                        token={item}
                        key={item.address}
                        containerStyle={[styles.card, customStyle]}
                    />
                </SwipeableItem>
            )
        },
        [handleSwipe],
    )

    const handleDelete = () => {
        if (account?.address && selectedToken?.address) {
            dispatch(
                removeTokenBalance({
                    accountAddress: account.address,
                    tokenAddress: selectedToken.address,
                }),
            )
            dispatch(deleteCustomToken(selectedToken.address))
            closeRemoveCustomTokenSheet()
        } else {
            throw new Error(
                "Trying to unselect an official token without an account selected",
            )
        }
    }

    const handleCloseDeleteModal = () => {
        swipeableItemRef.current?.[selectedIndex!!]?.close?.()
        closeRemoveCustomTokenSheet()
    }

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
            <BaseView flexDirection="row" mx={20}>
                <BaseText typographyFont="subTitleBold">
                    {LL.MANAGE_TOKEN_MANAGE_CUSTOM()}
                </BaseText>
                <BaseIcon
                    name={"plus"}
                    bg={theme.colors.secondary}
                    action={openAddCustomTokenSheet}
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
            <DeleteCustomTokenBottomSheet
                ref={removeCustomTokenSheetRef}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDelete}
                token={selectedToken}
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
    card: {
        paddingHorizontal: 20,
        marginVertical: 8,
    },
    underlayContainer: {
        flexDirection: "row",
    },
})

const UnderlayLeft = ({ index }: { index: number }) => {
    const theme = useTheme()
    const { styles: underlayStyles } = useThemedStyles(
        baseUnderlayStyles(index),
    )
    return (
        <View style={styles.underlayContainer}>
            <BaseSpacer width={20} />
            <View style={underlayStyles.underlayLeft}>
                <BaseIcon
                    name={"delete"}
                    size={20}
                    bg={theme.colors.danger}
                    color={theme.colors.card}
                />
            </View>
            <BaseSpacer width={20} />
        </View>
    )
}

const baseUnderlayStyles = (index: number) => (theme: ColorThemeType) =>
    StyleSheet.create({
        underlayLeft: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            justifyContent: "flex-end",
            borderRadius: 16,
            height: 64,
            marginVertical: 8,
            paddingRight: 10,
            backgroundColor: theme.colors.danger,
            marginTop: index === 0 ? 20 : 8,
        },
    })
