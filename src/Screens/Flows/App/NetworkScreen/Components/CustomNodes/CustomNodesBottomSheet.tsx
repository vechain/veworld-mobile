import React, { useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    BaseBottomSheet,
    BaseIcon,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { debug, useTheme } from "~Common"
import { Network, NETWORK_TYPE } from "~Model"
import {
    SectionListData,
    SectionListRenderItemInfo,
    StyleSheet,
} from "react-native"
import { NetworkBox } from "../SelectNetwork/NetworkBox"
import { selectCustomNetworks, useAppSelector } from "~Storage/Redux"
import { BottomSheetSectionList } from "@gorhom/bottom-sheet"
type Props = {
    onClose: () => void
    onEditNetwork: (network: Network) => void
    onDeleteNetwork: (network: Network) => void
}

const snapPoints = ["50%", "90%"]

export const CustomNodesBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, onEditNetwork, onDeleteNetwork }, ref) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const theme = useTheme()

    const customNetworks = useAppSelector(selectCustomNetworks)

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
        onClose()
    }, [nav, onClose])

    const onPress = useCallback(
        (network: Network) => {
            onClose()
            onEditNetwork(network)
        },
        [onEditNetwork, onClose],
    )

    const onDeleteNetworkPress = useCallback(
        (network: Network) => {
            onClose()
            onDeleteNetwork(network)
        },
        [onDeleteNetwork, onClose],
    )

    const renderSectionHeader = useCallback(
        ({ section }: { section: SectionListData<Network, Section> }) => {
            return (
                <BaseText typographyFont="bodyMedium">{section.title}</BaseText>
            )
        },
        [],
    )

    const renderItem = useCallback(
        ({ item }: SectionListRenderItemInfo<Network, Section>) => {
            return (
                <BaseView flexDirection="row">
                    <NetworkBox
                        flex={1}
                        network={item}
                        onPress={() => onPress(item)}
                        rightIcon="pencil-outline"
                    />
                    <BaseSpacer width={16} />
                    <BaseIcon
                        name={"trash-can-outline"}
                        size={24}
                        bg={theme.colors.secondary}
                        action={() => onDeleteNetworkPress(item)}
                    />
                </BaseView>
            )
        },
        [onPress, onDeleteNetworkPress, theme],
    )

    const renderItemSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

    const renderSectionSeparator = useCallback(
        () => <BaseSpacer height={24} />,
        [],
    )

    const [snapIndex, setSnapIndex] = useState<number>(0)

    // The list is scrollable when the bottom sheet is fully expanded
    const isListScrollable = useMemo(
        () => snapIndex === snapPoints.length - 1,
        [snapIndex],
    )

    const handleSheetChanges = useCallback((index: number) => {
        debug("walletManagementSheet position changed", index)
        setSnapIndex(index)
    }, [])

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            ref={ref}
            onChange={handleSheetChanges}>
            <BaseView flexDirection="row" w={100}>
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
            <BaseView flexDirection="row" style={baseStyles.list}>
                <BottomSheetSectionList
                    sections={sections}
                    keyExtractor={i => i.id}
                    ItemSeparatorComponent={renderItemSeparator}
                    SectionSeparatorComponent={renderSectionSeparator}
                    renderSectionHeader={renderSectionHeader}
                    renderItem={renderItem}
                    scrollEnabled={isListScrollable}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                />
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = StyleSheet.create({
    list: {
        width: "100%",
        height: "100%",
    },
})
