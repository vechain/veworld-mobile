import React, { useCallback, useRef } from "react"
import { FlatList, ListRenderItem, StyleSheet, View } from "react-native"
import { BaseCard, BaseText, BaseView, SwipeableRow, useThor } from "~Components"
import { deleteDelegationUrl, selectDelegationUrls, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"

export const ManageUrls = () => {
    const delegationUrls = useAppSelector(selectDelegationUrls)
    const dispatch = useAppDispatch()
    const thor = useThor()
    const [urlToDelete, setUrlToDelete] = React.useState<string>()

    const deleteUrl = useCallback(
        (url: string) => {
            dispatch(deleteDelegationUrl({ url, genesisId: thor.genesis.id }))
        },
        [dispatch, thor.genesis.id],
    )

    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())

    const renderItem: ListRenderItem<string> = useCallback(
        ({ item, index }) => {
            return (
                <SwipeableRow
                    testID={`Delegation_Url_${index}`}
                    item={item}
                    itemKey={String(index)}
                    swipeableItemRefs={swipeableItemRefs}
                    handleTrashIconPress={deleteUrl}
                    setSelectedItem={setUrlToDelete}
                    isOpen={urlToDelete === item}>
                    <BaseCard>
                        <BaseText typographyFont="bodyBold" w={100} py={8}>
                            {item}
                        </BaseText>
                    </BaseCard>
                </SwipeableRow>
            )
        },
        [deleteUrl, urlToDelete],
    )

    return (
        <BaseView h={100}>
            <View style={styles.flatListContainer}>
                <FlatList keyExtractor={url => url} data={delegationUrls} renderItem={renderItem} />
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
