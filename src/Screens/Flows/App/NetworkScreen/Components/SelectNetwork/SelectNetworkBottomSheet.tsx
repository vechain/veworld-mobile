import { TouchableOpacity } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { SectionListData, SectionListRenderItemInfo, StyleSheet } from "react-native"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import {
    BaseBottomSheet,
    BaseIcon,
    BaseSectionListSeparatorProps,
    BaseSpacer,
    BaseText,
    BaseView,
    NetworkBox,
    SectionListSeparator,
} from "~Components"
import { BottomSheetSectionList } from "~Components/Reusable/BottomSheetLists"
import { COLORS, ColorThemeType } from "~Constants"
import { useSetSelectedAccount, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Network, NETWORK_TYPE } from "~Model"
import { Routes } from "~Navigation"
import { clearNFTCache, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { switchActiveNetwork } from "~Storage/Redux/Actions"
import { selectNetworksByType, selectSelectedNetwork } from "~Storage/Redux/Selectors"

type Props = {
    onClose: () => void
}

type Section = {
    title: string
    data: Network[]
}

const ItemSeparator = () => <BaseSpacer height={8} />

const SectionSeparator = (props: BaseSectionListSeparatorProps<Network, Section>) => (
    <SectionListSeparator {...props} headerToItemsHeight={8} headerToHeaderHeight={24} />
)

export const SelectNetworkBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onClose }, ref) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const { onSetSelectedAccount } = useSetSelectedAccount()
    const { styles, theme } = useThemedStyles(baseStyles)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const mainNetworks = useAppSelector(selectNetworksByType(NETWORK_TYPE.MAIN))
    const testNetworks = useAppSelector(selectNetworksByType(NETWORK_TYPE.TEST))
    const otherNetworks = useAppSelector(selectNetworksByType(NETWORK_TYPE.OTHER))

    const nav = useNavigation()

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
            dispatch(switchActiveNetwork(network))
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
            return <NetworkBox network={item} isSelected={isSelected} onPress={onPress} />
        },
        [selectedNetwork, onPress],
    )

    const onSettingsClick = useCallback(() => {
        nav.navigate(Routes.SETTINGS_NETWORK)
    }, [nav])

    return (
        <BaseBottomSheet floating dynamicHeight enableContentPanningGesture={false} scrollable={false} ref={ref}>
            <NestableScrollContainer showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]} bounces={false}>
                <BaseView flexDirection="row" alignItems="center" justifyContent="space-between">
                    <BaseView flexDirection="column" gap={8}>
                        <BaseView flexDirection="row" alignItems="center" gap={12}>
                            <BaseIcon
                                name="icon-globe"
                                size={20}
                                color={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_900}
                            />
                            <BaseText typographyFont="subTitleSemiBold">{LL.NETWORS_BS_TITLE()}</BaseText>
                        </BaseView>
                        <BaseText typographyFont="body" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600}>
                            {LL.NETWORS_BS_SUBTITLE()}
                        </BaseText>
                    </BaseView>
                    <TouchableOpacity onPress={onSettingsClick} style={styles.settingsBtn}>
                        <BaseIcon name="icon-settings" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_600} />
                    </TouchableOpacity>
                </BaseView>

                <BottomSheetSectionList
                    sections={sections}
                    keyExtractor={i => i.id}
                    ItemSeparatorComponent={ItemSeparator}
                    SectionSeparatorComponent={SectionSeparator}
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

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        settingsBtn: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            padding: 8,
            borderWidth: 1,
            borderColor: theme.isDark ? "transparent" : COLORS.GREY_200,
            borderRadius: 6,
        },
    })
