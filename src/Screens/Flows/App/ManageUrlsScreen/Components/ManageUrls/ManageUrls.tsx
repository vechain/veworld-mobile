import React, { useCallback, useRef } from "react"
import { FlatList, ListRenderItem, StyleSheet, View } from "react-native"
import { useTheme } from "~Hooks"
import {
    BaseCard,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    SwipeableRow,
    useThor,
} from "~Components"
import {
    deleteDelegationUrl,
    selectDelegationUrls,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"

type Props = {
    openAddUrl: () => void
}

export const ManageUrls = ({ openAddUrl }: Props) => {
    const theme = useTheme()
    const { LL } = useI18nContext()
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

    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(
        new Map(),
    )

    const renderItem: ListRenderItem<string> = useCallback(
        ({ item, index }) => {
            return (
                <SwipeableRow
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
