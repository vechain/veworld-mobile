import React, { useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    BaseBottomSheet,
    NetworkBox,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { changeSelectedNetwork } from "~Storage/Redux/Actions"
import { Network, NETWORK_TYPE } from "~Model"
import {
    selectNetworksByType,
    selectSelectedNetwork,
} from "~Storage/Redux/Selectors"
import { BottomSheetSectionList } from "@gorhom/bottom-sheet"
import {
    SectionListData,
    SectionListRenderItemInfo,
    StyleSheet,
} from "react-native"
import { info } from "~Common"

type Props = {
    onClose: () => void
}

const snapPoints = ["50%", "90%"]

export const SelectNetworkBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose }, ref) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()

    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const mainNetworks = useAppSelector(selectNetworksByType(NETWORK_TYPE.MAIN))
    const testNetworks = useAppSelector(selectNetworksByType(NETWORK_TYPE.TEST))
    const otherNetworks = useAppSelector(
        selectNetworksByType(NETWORK_TYPE.OTHER),
    )

    type Section = {
        title: string
        data: Network[]
    }
    // variables
    const sections: Section[] = useMemo(() => {
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
    }, [mainNetworks, testNetworks, otherNetworks, LL])

    const onPress = useCallback(
        (network: Network) => {
            dispatch(changeSelectedNetwork(network))
            onClose()
        },
        [onClose, dispatch],
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
            const isSelected = selectedNetwork.id === item.id
            return (
                <NetworkBox
                    network={item}
                    isSelected={isSelected}
                    onPress={() => onPress(item)}
                />
            )
        },
        [selectedNetwork, onPress],
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
        info("walletManagementSheet position changed", index)
        setSnapIndex(index)
    }, [])

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            ref={ref}
            onChange={handleSheetChanges}>
            <BaseView flexDirection="column" w={100}>
                <BaseText typographyFont="subTitleBold">
                    {LL.BD_SELECT_NETWORK()}
                </BaseText>
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
