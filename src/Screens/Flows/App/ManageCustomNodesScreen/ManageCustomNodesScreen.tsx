import React, { useCallback, useMemo, useState } from "react"
import {
    ColorThemeType,
    error,
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
    DeleteConfirmationBottomSheet,
} from "~Components"
import { useI18nContext } from "~i18n"
import { NETWORK_TYPE, Network } from "~Model"
import {
    StyleSheet,
    View,
    SectionListData,
    SectionListRenderItemInfo,
    SectionList,
} from "react-native"
import {
    handleRemoveCustomNode,
    selectCustomNetworks,
    selectNetworkById,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { NetworkBox } from "../NetworkScreen/Components/SelectNetwork/NetworkBox"
import { EditCustomNodeBottomSheet } from "./components"
import * as Haptics from "expo-haptics"
import { ViewToken } from "react-native"

export const ManageCustomNodesScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const theme = useTheme()

    const [networkToEditDeleteId, setNetworkToEditDeleteId] = useState<string>()
    const [isScrollable, setIsScrollable] = useState<boolean>(false)

    const dispatch = useAppDispatch()

    const networkToEdit = useAppSelector(
        selectNetworkById(networkToEditDeleteId),
    )

    const customNetworks = useAppSelector(selectCustomNetworks)

    const {
        ref: editNetworkSheetRef,
        onOpen: openEditNetworkSheet,
        onClose: closeEditNetworkSheet,
    } = useBottomSheetModal()

    const {
        ref: deleteConfirmationSheetRef,
        // onOpen: openDeleteConfirmationSheet,
        onClose: closeDeleteConfirmationSheet,
    } = useBottomSheetModal()

    type Section = {
        title: string
        data: Network[]
    }
    // variables
    const sections: Section[] = useMemo(() => {
        const mainNetworks = customNetworks.filter(
            network => network.type === NETWORK_TYPE.MAIN,
        )
        const testNetworks = customNetworks.filter(
            network => network.type === NETWORK_TYPE.TEST,
        )
        const otherNetworks = customNetworks.filter(
            network => network.type === NETWORK_TYPE.OTHER,
        )

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

    // const onDeleteNetworkClick = useCallback(
    //     (network: Network) => {
    //         setNetworkToEditDeleteId(network.id)
    //         openDeleteConfirmationSheet()
    //     },
    //     [openDeleteConfirmationSheet],
    // )

    const onDeleteNetworkConfirm = useCallback(() => {
        try {
            if (networkToEditDeleteId) {
                dispatch(handleRemoveCustomNode(networkToEditDeleteId))
            }
            closeDeleteConfirmationSheet()
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        } catch (e) {
            error(e)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        }
    }, [closeDeleteConfirmationSheet, networkToEditDeleteId, dispatch])

    const renderSectionHeader = useCallback(
        ({ section }: { section: SectionListData<Network, Section> }) => {
            return (
                <BaseText mx={20} typographyFont="bodyMedium">
                    {section.title}
                </BaseText>
            )
        },
        [],
    )

    const renderItem = useCallback(
        ({ item }: SectionListRenderItemInfo<Network, Section>) => {
            const onPress = () => onEditNetworkClick(item)
            return (
                <BaseView flexDirection="row" mx={20}>
                    <NetworkBox
                        flex={1}
                        network={item}
                        onPress={onPress}
                        rightIcon="pencil-outline"
                    />
                </BaseView>
            )
        },
        [onEditNetworkClick],
    )

    const renderItemSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

    const renderSectionSeparator = useCallback(
        () => <BaseSpacer height={24} />,
        [],
    )

    const checkViewableItems = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            setIsScrollable(viewableItems.length < sections.length)
        },
        [sections],
    )

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
            <BaseView flexDirection="row" mx={20}>
                <BaseText typographyFont="subTitleBold">
                    {LL.BD_CUSTOM_NODES()}
                </BaseText>
                <BaseIcon
                    name={"plus"}
                    size={24}
                    bg={theme.colors.secondary}
                    action={onAddNetworkPress}
                />
            </BaseView>
            <BaseSpacer height={16} />
            <BaseView flexDirection="row" style={styles.listContainer}>
                <SectionList
                    sections={sections}
                    keyExtractor={i => i.id}
                    ItemSeparatorComponent={renderItemSeparator}
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
                description={LL.NETWORK_CONFIRM_REMOVE_NODE()}
            />
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    listContainer: {
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

export const UnderlayLeft = ({ index }: { index: number }) => {
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
