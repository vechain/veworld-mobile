import React, { useCallback, useRef } from "react"
import { FlatList, StyleSheet, View, ListRenderItem } from "react-native"
import { useTheme } from "~Hooks"
import {
    BaseCard,
    BaseIcon,
    BaseSpacer,
    BaseText,
    SwipeableUnderlay,
    BaseView,
} from "~Components"
import {
    deleteDelegationUrl,
    selectDelegationUrls,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import SwipeableItem, {
    SwipeableItemImperativeRef,
} from "react-native-swipeable-item"

type Props = {
    openAddUrl: () => void
}

export const ManageUrls = ({ openAddUrl }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const delegationUrls = useAppSelector(selectDelegationUrls)
    const dispatch = useAppDispatch()
    const swipeableItemRef = useRef<(SwipeableItemImperativeRef | null)[]>([])

    const deleteUrl = useCallback(
        (url: string) => () => {
            dispatch(deleteDelegationUrl(url))
        },
        [dispatch],
    )

    const renderItem: ListRenderItem<string> = useCallback(
        ({ item, index }) => {
            return (
                <SwipeableItem
                    ref={el => (swipeableItemRef.current[index] = el)}
                    item={item}
                    renderUnderlayLeft={() => (
                        <SwipeableUnderlay
                            action={deleteUrl(item)}
                            index={index}
                        />
                    )}
                    snapPointsLeft={[50]}>
                    <BaseCard containerStyle={styles.card}>
                        <BaseText typographyFont="bodyBold" w={100} py={8}>
                            {item}
                        </BaseText>
                    </BaseCard>
                </SwipeableItem>
            )
        },
        [deleteUrl],
    )

    return (
        <BaseView h={100}>
            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                w={100}>
                <BaseText typographyFont="subTitleBold">
                    {LL.SEND_DELEGATION_MANAGE_URL()}
                </BaseText>
                <BaseIcon
                    haptics="Light"
                    name={"plus"}
                    bg={theme.colors.secondary}
                    action={openAddUrl}
                    testID="ManageUrls_addUrlButton"
                />
            </BaseView>
            <BaseSpacer height={16} />
            <View style={styles.flatListContainer}>
                <FlatList
                    keyExtractor={url => url}
                    data={delegationUrls}
                    renderItem={renderItem}
                />
            </View>
        </BaseView>
    )
}

const styles = StyleSheet.create({
    flatListContainer: {
        flex: 1,
        width: "100%",
        marginBottom: 60,
    },
    card: {
        marginVertical: 8,
    },
})
