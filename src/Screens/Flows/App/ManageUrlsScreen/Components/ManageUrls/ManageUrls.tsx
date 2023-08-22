import React, { useCallback, useRef } from "react"
import { FlatList, ListRenderItem, StyleSheet, View } from "react-native"
import { useThemedStyles } from "~Hooks"
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
import { ColorThemeType } from "~Constants"

type Props = {
    openAddUrl: () => void
}

export const ManageUrls = ({ openAddUrl }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const delegationUrls = useAppSelector(selectDelegationUrls)
    const dispatch = useAppDispatch()
    const thor = useThor()

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
                    handleTrashIconPress={deleteUrl}>
                    <BaseView style={styles.touchableContainer}>
                        <BaseCard onPress={() => {}}>
                            <BaseText typographyFont="bodyBold" w={100} py={8}>
                                {item}
                            </BaseText>
                        </BaseCard>
                    </BaseView>
                </SwipeableRow>
            )
        },
        [deleteUrl, styles.touchableContainer],
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

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        touchableContainer: {
            backgroundColor: theme.colors.card,
            borderRadius: 16,
        },
        flatListContainer: {
            flex: 1,
            width: "100%",
            marginBottom: 60,
        },
    })
