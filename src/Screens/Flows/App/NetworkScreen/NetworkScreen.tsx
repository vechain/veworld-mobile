import React, { useCallback, useMemo, useRef } from "react"
import { SectionList, SectionListData, SectionListRenderItemInfo } from "react-native"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import {
    BaseIcon,
    BaseSectionListSeparatorProps,
    BaseSpacer,
    BaseText,
    BaseView,
    Layout,
    SectionListSeparator,
} from "~Components"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { NetworkBox } from "~Components/Reusable/Network"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useResetStacks } from "~Hooks/useSetSelectedAccount/useResetStacks"
import { Network, NETWORK_TYPE } from "~Model"
import { handleRemoveCustomNode, switchActiveNetwork, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectNetworksByType, selectSelectedNetwork } from "~Storage/Redux/Selectors"
import { useI18nContext } from "~i18n"
import { CustomNetworkFooter } from "./Components"

type Section = {
    title: string
    data: Network[]
}

const ItemSeparator = () => <BaseSpacer height={8} />

const SectionSeparator = (props: BaseSectionListSeparatorProps<Network, Section>) => (
    <SectionListSeparator {...props} headerToItemsHeight={8} headerToHeaderHeight={40} />
)

export const ChangeNetworkScreen = () => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const theme = useTheme()
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const { resetStacks } = useResetStacks()

    const mainNetworks = useAppSelector(selectNetworksByType(NETWORK_TYPE.MAIN))
    const testNetworks = useAppSelector(selectNetworksByType(NETWORK_TYPE.TEST))
    const otherNetworks = useAppSelector(selectNetworksByType(NETWORK_TYPE.OTHER))
    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())

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
            resetStacks()
            dispatch(switchActiveNetwork(network))
        },
        [dispatch, resetStacks],
    )

    const renderSectionHeader = useCallback(
        ({ section }: { section: SectionListData<Network, Section> }) => {
            return (
                <BaseText typographyFont="bodyMedium" color={theme.isDark ? COLORS.GREY_300 : COLORS.PURPLE}>
                    {section.title}
                </BaseText>
            )
        },
        [theme.isDark],
    )

    const onDelete = useCallback(
        (network: Network) => {
            dispatch(handleRemoveCustomNode(network.id))
            Feedback.show({
                message: LL.NETWORK_REMOVED(),
                severity: FeedbackSeverity.SUCCESS,
                type: FeedbackType.ALERT,
                icon: "icon-check",
            })
        },
        [LL, dispatch],
    )

    const renderItem = useCallback(
        ({ item }: SectionListRenderItemInfo<Network, Section>) => {
            const isSelected = selectedNetwork.id === item.id
            return (
                <NetworkBox
                    network={item}
                    isSelected={isSelected}
                    onPress={onPress}
                    deletable={!item.defaultNet}
                    onDelete={onDelete}
                    swipeableItemRefs={swipeableItemRefs}
                />
            )
        },
        [selectedNetwork.id, onPress, onDelete],
    )

    return (
        <Layout
            safeAreaTestID="NetworkScreen"
            title={LL.TITLE_NETWORKS()}
            body={
                <BaseView pt={8}>
                    <BaseView flexDirection="row" gap={12} alignItems="center">
                        <BaseIcon
                            name="icon-globe"
                            size={16}
                            color={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_900}
                        />
                        <BaseText typographyFont="bodyMedium" color={theme.isDark ? COLORS.WHITE : COLORS.PURPLE}>
                            {LL.BD_SELECT_NETWORK()}
                        </BaseText>
                    </BaseView>
                    <BaseSpacer height={8} />

                    <BaseText typographyFont="captionRegular">{LL.BD_SELECT_NETWORK_DESC()}</BaseText>
                    <BaseSpacer height={24} />
                    <SectionList
                        sections={sections}
                        keyExtractor={i => i.id}
                        ItemSeparatorComponent={ItemSeparator}
                        SectionSeparatorComponent={SectionSeparator}
                        renderSectionHeader={renderSectionHeader}
                        renderItem={renderItem}
                        stickySectionHeadersEnabled={false}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        ListFooterComponent={CustomNetworkFooter}
                    />
                </BaseView>
            }
        />
    )
}
