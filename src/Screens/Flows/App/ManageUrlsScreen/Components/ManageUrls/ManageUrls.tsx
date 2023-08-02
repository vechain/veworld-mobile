import React, { useCallback, useRef } from "react"
import { FlatList, ListRenderItem, StyleSheet, View } from "react-native"
import { useTheme } from "~Hooks"
import {
    BaseCard,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    DeleteUnderlay,
    useThor,
} from "~Components"
import {
    deleteDelegationUrl,
    selectDelegationUrls,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import SwipeableItem, {
    OpenDirection,
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
    const thor = useThor()
    const swipeableItemRefs = useRef<(SwipeableItemImperativeRef | null)[]>([])

    const deleteUrl = useCallback(
        (url: string) => () => {
            dispatch(deleteDelegationUrl({ url, genesisId: thor.genesis.id }))
        },
        [dispatch, thor.genesis.id],
    )

    const closeOtherSwipeableItems = useCallback((index: number) => {
        swipeableItemRefs?.current.forEach((ref, id) => {
            if (id !== index) {
                ref?.close()
            }
        })
    }, [])

    const handleSwipe = useCallback(
        (index: number) =>
            ({ openDirection }: { openDirection: string }) => {
                if (openDirection === OpenDirection.LEFT) {
                    closeOtherSwipeableItems(index)
                }
            },
        [closeOtherSwipeableItems],
    )

    const renderItem: ListRenderItem<string> = useCallback(
        ({ item, index }) => {
            const customStyle = index === 0 ? { marginTop: 20 } : {}

            return (
                <BaseView mx={20} my={8} style={customStyle}>
                    <SwipeableItem
                        ref={el => (swipeableItemRefs.current[index] = el)}
                        item={item}
                        renderUnderlayLeft={() => (
                            <DeleteUnderlay onPress={deleteUrl(item)} />
                        )}
                        onChange={handleSwipe(index)}
                        snapPointsLeft={[50]}>
                        <BaseCard>
                            <BaseText typographyFont="bodyBold" w={100} py={8}>
                                {item}
                            </BaseText>
                        </BaseCard>
                    </SwipeableItem>
                </BaseView>
            )
        },
        [deleteUrl, handleSwipe],
    )

    return (
        <BaseView h={100}>
            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                mx={20}>
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
})
