import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useMemo } from "react"
import { SectionListData, SectionListRenderItemInfo } from "react-native"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { BaseBottomSheet, BaseSpacer, BaseText, BaseView, NetworkBox } from "~Components"
import { BottomSheetSectionList } from "~Components/Reusable/BottomSheetLists"
import { COLORS } from "~Constants"
import { useSetSelectedAccount, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Network, NETWORK_TYPE } from "~Model"
import { clearNFTCache, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { changeSelectedNetwork } from "~Storage/Redux/Actions"
import { selectNetworksByType, selectSelectedNetwork } from "~Storage/Redux/Selectors"

type Props = {
    onClose: () => void
}

export const SelectNetworkBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onClose }, ref) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const { onSetSelectedAccount } = useSetSelectedAccount()
    const theme = useTheme()
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

    return (
        <BaseBottomSheet floating dynamicHeight enableContentPanningGesture={false} scrollable={false} ref={ref}>
            <NestableScrollContainer showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]} bounces={false}>
                <BaseView flexDirection="column" w={100} bg={theme.isDark ? COLORS.DARK_PURPLE : COLORS.GREY_50}>
                    <BaseText typographyFont="subTitleBold">{LL.BD_SELECT_NETWORK()}</BaseText>
                    <BaseSpacer height={16} />
                </BaseView>

                <BottomSheetSectionList
                    sections={sections}
                    keyExtractor={i => i.id}
                    ItemSeparatorComponent={renderItemSeparator}
                    SectionSeparatorComponent={renderSectionSeparator}
                    renderSectionHeader={renderSectionHeader}
                    renderItem={renderItem}
                    stickySectionHeadersEnabled={false}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                />
            </NestableScrollContainer>
        </BaseBottomSheet>
    )
})
