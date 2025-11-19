import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useMemo, useState } from "react"
import { SectionList, SectionListData, SectionListRenderItemInfo } from "react-native"
import { BaseBottomSheet, BaseSpacer, BaseText, BaseView, NetworkBox } from "~Components"
import { useSetSelectedAccount } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Network, NETWORK_TYPE } from "~Model"
import { clearNFTCache, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { changeSelectedNetwork } from "~Storage/Redux/Actions"
import { selectNetworksByType, selectSelectedNetwork } from "~Storage/Redux/Selectors"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"

type Props = {
    onClose: () => void
}

export const SelectNetworkBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onClose }, ref) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const { onSetSelectedAccount } = useSetSelectedAccount()

    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const mainNetworks = useAppSelector(selectNetworksByType(NETWORK_TYPE.MAIN))
    const testNetworks = useAppSelector(selectNetworksByType(NETWORK_TYPE.TEST))
    const otherNetworks = useAppSelector(selectNetworksByType(NETWORK_TYPE.OTHER))

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
            onSetSelectedAccount({})
            dispatch(clearNFTCache())
            dispatch(changeSelectedNetwork(network))
            onClose()
        },
        [onSetSelectedAccount, dispatch, onClose],
    )

    const renderSectionHeader = useCallback(({ section }: { section: SectionListData<Network, Section> }) => {
        return <BaseText typographyFont="bodyMedium">{section.title}</BaseText>
    }, [])

    const renderItem = useCallback(
        ({ item }: SectionListRenderItemInfo<Network, Section>) => {
            const isSelected = selectedNetwork.id === item.id
            return <NetworkBox network={item} isSelected={isSelected} onPress={() => onPress(item)} flex={1} />
        },
        [selectedNetwork, onPress],
    )

    const renderItemSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    const renderSectionSeparator = useCallback(() => <BaseSpacer height={24} />, [])

    const snapPoints = useMemo(() => {
        const allNetworks = [...mainNetworks, ...testNetworks, ...otherNetworks]
        if (allNetworks.length <= 2) return [isAndroid() ? "50%" : "45%"]
        if (allNetworks.length <= 3) return ["60%"]
        if (allNetworks.length <= 4) return ["75%"]
        return ["90%"]
    }, [mainNetworks, otherNetworks, testNetworks])

    const [snapIndex, setSnapIndex] = useState<number>(0)

    // The list is scrollable when the bottom sheet is fully expanded
    const isListScrollable = useMemo(() => snapIndex === snapPoints.length - 1, [snapIndex, snapPoints.length])

    const handleSheetChanges = useCallback((index: number) => {
        setSnapIndex(index)
    }, [])

    return (
        <BaseBottomSheet floating dynamicHeight ref={ref} onChange={handleSheetChanges}>
            <BaseView flexDirection="column" w={100}>
                <BaseText typographyFont="subTitleBold">{LL.BD_SELECT_NETWORK()}</BaseText>
            </BaseView>

            <BaseSpacer height={16} />
            <SectionList
                sections={sections}
                keyExtractor={i => i.id}
                ItemSeparatorComponent={renderItemSeparator}
                SectionSeparatorComponent={renderSectionSeparator}
                renderSectionHeader={renderSectionHeader}
                renderItem={renderItem}
                stickySectionHeadersEnabled={false}
                scrollEnabled={isListScrollable}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            />
        </BaseBottomSheet>
    )
})
