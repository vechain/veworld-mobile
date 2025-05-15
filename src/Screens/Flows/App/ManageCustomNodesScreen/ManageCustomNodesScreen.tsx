import React, { useCallback, useMemo, useRef, useState } from "react"
import { useBottomSheetModal } from "~Hooks"
import { error } from "~Utils"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    DeleteConfirmationBottomSheet,
    Layout,
    NetworkBox,
    PlusIconHeaderButton,
    SwipeableRow,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Network, NETWORK_TYPE } from "~Model"
import { SectionList, SectionListData, SectionListRenderItemInfo, StyleSheet, ViewToken } from "react-native"
import {
    handleRemoveCustomNode,
    selectCustomNetworks,
    selectNetworkById,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { EditCustomNodeBottomSheet } from "./components"
import * as Haptics from "expo-haptics"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { ERROR_EVENTS } from "~Constants"

export const ManageCustomNodesScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const [networkToEditDeleteId, setNetworkToEditDeleteId] = useState<string>()
    const [networkToDelete, setNetworkToDelete] = useState<string>()
    const [isScrollable, setIsScrollable] = useState<boolean>(false)

    const dispatch = useAppDispatch()

    const networkToEdit = useAppSelector(state => selectNetworkById(state, networkToEditDeleteId))

    const customNetworks = useAppSelector(selectCustomNetworks)

    const {
        ref: editNetworkSheetRef,
        onOpen: openEditNetworkSheet,
        onClose: closeEditNetworkSheet,
    } = useBottomSheetModal()

    const {
        ref: deleteConfirmationSheetRef,
        onOpen: openDeleteConfirmationSheet,
        onClose: closeDeleteConfirmationSheet,
    } = useBottomSheetModal()

    type Section = {
        title: string
        data: Network[]
    }
    // variables
    const sections: Section[] = useMemo(() => {
        const mainNetworks = customNetworks.filter(network => network.type === NETWORK_TYPE.MAIN)
        const testNetworks = customNetworks.filter(network => network.type === NETWORK_TYPE.TEST)
        const otherNetworks = customNetworks.filter(network => network.type === NETWORK_TYPE.OTHER)

        const data: Section[] = []

        if (mainNetworks.length > 0) {
            data.push({
                title: LL.NETWORK_LABEL_MAIN_NETWORKS(),
                data: mainNetworks,
            })
        }
        if (testNetworks.length > 0) {
            data.push({
                title: LL.NETWORK_LABEL_TEST_NETWORKS(),
                data: testNetworks,
            })
        }
        if (otherNetworks.length > 0) {
            data.push({
                title: LL.NETWORK_LABEL_OTHER_NETWORKS(),
                data: otherNetworks,
            })
        }
        return data
    }, [customNetworks, LL])

    const onAddNetworkPress = useCallback(() => {
        nav.navigate(Routes.SETTINGS_ADD_CUSTOM_NODE)
    }, [nav])

    const onEditNetworkClick = useCallback(
        (network: Network) => {
            setNetworkToEditDeleteId(network.id)
            openEditNetworkSheet()
        },
        [openEditNetworkSheet],
    )

    const onDeleteNetworkConfirm = useCallback(() => {
        try {
            if (networkToEditDeleteId) {
                dispatch(handleRemoveCustomNode(networkToEditDeleteId))
            }
            closeDeleteConfirmationSheet()
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        } catch (e) {
            error(ERROR_EVENTS.SETTINGS, e)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        }
    }, [closeDeleteConfirmationSheet, networkToEditDeleteId, dispatch])

    const renderSectionHeader = useCallback(({ section }: { section: SectionListData<Network, Section> }) => {
        return (
            <BaseText mx={16} typographyFont="bodyMedium">
                {section.title}
            </BaseText>
        )
    }, [])

    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())

    const handleTrashIconPress = useCallback(
        (id: string) => () => {
            setNetworkToEditDeleteId(id)
            openDeleteConfirmationSheet()
        },
        [openDeleteConfirmationSheet],
    )

    const renderItem = useCallback(
        ({ item }: SectionListRenderItemInfo<Network, Section>) => {
            const onPress = () => onEditNetworkClick(item)
            return (
                <SwipeableRow
                    item={item}
                    itemKey={item.id}
                    swipeableItemRefs={swipeableItemRefs}
                    handleTrashIconPress={handleTrashIconPress(item?.id)}
                    setSelectedItem={(network?: Network) => setNetworkToDelete(network?.id)}
                    onPress={onPress}
                    isOpen={networkToDelete === item.id}>
                    <NetworkBox network={item} rightIcon="icon-editBox" flex={1} />
                </SwipeableRow>
            )
        },
        [handleTrashIconPress, networkToDelete, onEditNetworkClick],
    )

    const renderSectionSeparator = useCallback(() => <BaseSpacer height={24} />, [])

    const checkViewableItems = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            setIsScrollable(viewableItems.length < sections.length)
        },
        [sections],
    )

    return (
        <Layout
            title={LL.BD_CUSTOM_NODES()}
            headerRightElement={<PlusIconHeaderButton action={onAddNetworkPress} />}
            fixedBody={
                <BaseView flex={1}>
                    <BaseView flexDirection="row" style={styles.listContainer}>
                        <SectionList
                            extraData={networkToDelete}
                            sections={sections}
                            keyExtractor={i => i.id}
                            SectionSeparatorComponent={renderSectionSeparator}
                            renderSectionHeader={renderSectionHeader}
                            renderItem={renderItem}
                            onViewableItemsChanged={checkViewableItems}
                            scrollEnabled={isScrollable}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                        />
                    </BaseView>
                    <EditCustomNodeBottomSheet
                        ref={editNetworkSheetRef}
                        onClose={closeEditNetworkSheet}
                        network={networkToEdit}
                    />

                    <DeleteConfirmationBottomSheet
                        ref={deleteConfirmationSheetRef}
                        onClose={closeDeleteConfirmationSheet}
                        onConfirm={onDeleteNetworkConfirm}
                        title={LL.NETWORK_CONFIRM_REMOVE_NODE()}
                        description={LL.NETWORK_CONFIRM_REMOVE_NODE_DESC()}
                        deletingElement={
                            networkToEdit && (
                                <BaseView w={100} flexDirection="row">
                                    <NetworkBox network={networkToEdit} activeOpacity={1} />
                                </BaseView>
                            )
                        }
                    />
                </BaseView>
            }
        />
    )
}

const styles = StyleSheet.create({
    listContainer: {
        marginTop: 16,
        marginBottom: 60,
    },
    card: {
        marginVertical: 8,
    },
})
