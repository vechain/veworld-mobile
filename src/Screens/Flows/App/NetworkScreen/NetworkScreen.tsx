import { ScrollView, StyleSheet } from "react-native"
import React, { useCallback } from "react"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseView,
    EnableFeature,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import { useBottomSheetModal, useTheme } from "~Common"
import { useI18nContext } from "~i18n"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    selectSelectedNetwork,
    selectShowConversionOnOtherNets,
    selectShowTestnetTag,
} from "~Storage/Redux/Selectors"
import {
    toggleShowConversionOtherNetworks,
    toggleShowTestnetTag,
} from "~Storage/Redux/Actions"
import {
    CustomNodes,
    SelectNetwork,
    SelectNetworkBottomSheet,
} from "./Components"
import { Routes } from "~Navigation"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"

export const ChangeNetworkScreen = () => {
    const nav = useNavigation()
    const theme = useTheme()
    const { LL } = useI18nContext()

    const dispatch = useAppDispatch()

    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const showTestNetTag = useAppSelector(selectShowTestnetTag)

    const tabBarHeight = useBottomTabBarHeight()

    const showConversionOnOtherNets = useAppSelector(
        selectShowConversionOnOtherNets,
    )

    const {
        ref: selectNetworkBottomSheetRef,
        onOpen: openSelectNetworkBottomSheet,
        onClose: closeSelectNetworkBottonSheet,
    } = useBottomSheetModal()

    const goBack = useCallback(() => nav.goBack(), [nav])

    const toggleConversionSwitch = useCallback(
        (_newValue: boolean) => {
            dispatch(toggleShowConversionOtherNetworks())
        },
        [dispatch],
    )

    const toggleTagSwitch = useCallback(
        (_newValue: boolean) => {
            dispatch(toggleShowTestnetTag())
        },
        [dispatch],
    )

    const onManageNodesClick = useCallback(() => {
        nav.navigate(Routes.SETTINGS_MANAGE_CUSTOM_NODES)
    }, [nav])

    return (
        <BaseSafeArea grow={1}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[
                    baseStyles.scrollViewContainer,
                    { paddingBottom: tabBarHeight },
                ]}
                style={baseStyles.scrollView}>
                <BaseIcon
                    style={baseStyles.backIcon}
                    size={36}
                    name="chevron-left"
                    color={theme.colors.text}
                    action={goBack}
                />
                <BaseSpacer height={12} />

                <BaseView mx={20}>
                    <SelectNetwork
                        openBottomSheet={openSelectNetworkBottomSheet}
                        selectedNetwork={selectedNetwork}
                    />

                    <BaseSpacer height={20} />

                    <CustomNodes onManageNodesClick={onManageNodesClick} />

                    <BaseSpacer height={20} />

                    <EnableFeature
                        title={LL.BD_OTHER_NETWORKS_INDICATOR()}
                        subtitle={LL.BD_OTHER_NETWORKS_INDICATOR_DESC()}
                        onValueChange={toggleTagSwitch}
                        value={showTestNetTag}
                    />

                    <BaseSpacer height={20} />

                    <EnableFeature
                        title={LL.BD_OTHER_NETWORKS_CONVERSION()}
                        subtitle={LL.BD_OTHER_NETWORKS_CONVERSION_DESC()}
                        onValueChange={toggleConversionSwitch}
                        value={showConversionOnOtherNets}
                    />

                    <BaseSpacer height={20} />
                </BaseView>

                <SelectNetworkBottomSheet
                    ref={selectNetworkBottomSheetRef}
                    onClose={closeSelectNetworkBottonSheet}
                />
            </ScrollView>
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },
    scrollViewContainer: {
        width: "100%",
    },
    scrollView: {
        width: "100%",
    },
})
