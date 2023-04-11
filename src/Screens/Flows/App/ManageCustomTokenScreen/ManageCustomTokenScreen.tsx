import React, { useCallback, useState } from "react"
import { useBottomSheetModal, useTheme } from "~Common"
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
import { AddCustomTokenBottomSheet } from "./BottomSheets"
import {
    ListRenderItem,
    StyleSheet,
    TouchableOpacity,
    View,
    FlatList,
} from "react-native"
import {
    deleteCustomToken,
    removeTokenBalance,
    selectCustomTokens,
    selectSelectedAccount,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import SwipeableItem, {
    useSwipeableItemParams,
} from "react-native-swipeable-item"

export const ManageCustomTokenScreen = () => {
    const theme = useTheme()
    const { LL } = useI18nContext()
    const [newCustomToken, setNewCustomToken] = useState<FungibleToken>()
    const customTokens = useAppSelector(selectCustomTokens)

    const {
        ref: addCustomTokenSheetRef,
        onOpen: openAddCustomTokenSheet,
        onClose: closeAddCustomTokenSheet,
    } = useBottomSheetModal()

    const renderItem: ListRenderItem<FungibleToken> = useCallback(
        ({ item: token, index }) => {
            const customStyle = index === 0 ? { marginTop: 20 } : {}
            return (
                <SwipeableItem
                    key={token.address}
                    item={token}
                    renderUnderlayLeft={() => <UnderlayLeft index={index} />}
                    snapPointsLeft={[50]}>
                    <CustomTokenCard
                        token={token}
                        key={token.address}
                        containerStyle={[styles.card, customStyle]}
                    />
                </SwipeableItem>
            )
        },
        [],
    )

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
            <BaseView flexDirection="row" mx={20}>
                <BaseText typographyFont="subTitleBold">
                    {LL.MANAGE_TOKEN_MANAGE_CUSTOM()}
                </BaseText>
                <BaseIcon
                    name={"plus"}
                    size={32}
                    bg={theme.colors.secondary}
                    action={openAddCustomTokenSheet}
                />
            </BaseView>
            <View style={styles.flatListContainer}>
                <FlatList
                    keyExtractor={token => token.address}
                    data={customTokens}
                    renderItem={renderItem}
                />
            </View>
            <AddCustomTokenBottomSheet
                ref={addCustomTokenSheetRef}
                onClose={closeAddCustomTokenSheet}
                setNewCustomToken={setNewCustomToken}
                newCustomToken={newCustomToken}
            />
        </BaseSafeArea>
    )
}

const UnderlayLeft = ({ index }: { index: number }) => {
    const { close, item: token } = useSwipeableItemParams<FungibleToken>()
    const theme = useTheme()
    const dispatch = useAppDispatch()
    const account = useAppSelector(selectSelectedAccount)

    const handleDelete = () => {
        if (account?.address) {
            dispatch(
                removeTokenBalance({
                    accountAddress: account.address,
                    tokenAddress: token.address,
                }),
            )
            dispatch(deleteCustomToken(token.address))
            close()
        } else {
            throw new Error(
                "Trying to unselect an official token without an account selected",
            )
        }
    }

    return (
        <View style={styles.underlayContainer}>
            <BaseSpacer width={20} />
            <View
                style={[
                    styles.underlayLeft,
                    // eslint-disable-next-line react-native/no-inline-styles
                    {
                        backgroundColor: theme.colors.danger,
                        marginTop: index === 0 ? 20 : 8,
                    },
                ]}>
                <TouchableOpacity onPress={handleDelete}>
                    <BaseIcon
                        name={"delete"}
                        size={20}
                        bg={theme.colors.danger}
                        color={theme.colors.card}
                    />
                </TouchableOpacity>
            </View>
            <BaseSpacer width={20} />
        </View>
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
    underlayLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-end",
        borderRadius: 16,
        height: 64,
        marginVertical: 8,
        paddingRight: 10,
    },
})
