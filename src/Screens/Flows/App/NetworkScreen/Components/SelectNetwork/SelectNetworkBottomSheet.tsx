import React, { useCallback, useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import BaseBottomSheet from "~Components/Base/BaseBottomSheet"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { changeSelectedNetwork } from "~Storage/Redux/Actions"
import { Network, NETWORK_TYPE } from "~Model"
import {
    selectNetworksByType,
    selectSelectedNetwork,
} from "~Storage/Redux/Selectors"
import { NetworkBox } from "./NetworkBox"
import { BottomSheetSectionList } from "@gorhom/bottom-sheet"
import {
    SectionListData,
    SectionListRenderItemInfo,
    StyleSheet,
} from "react-native"

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
                title: LL.NETWORK_LABEL_CUSTOM_NETWORKS(),
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
            const isSelected = selectedNetwork.currentUrl === item.currentUrl
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

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
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
                    scrollEnabled={true}
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
