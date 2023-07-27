import React, { useCallback } from "react"
import { BaseSpacer, BaseView, EnableFeature, Layout } from "~Components"
import { useNavigation } from "@react-navigation/native"
import { useBottomSheetModal } from "~Hooks"
import { useI18nContext } from "~i18n"
import {
    selectAreDevFeaturesEnabled,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
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
import { isSmallScreen } from "~Constants"

export const ChangeNetworkScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const dispatch = useAppDispatch()

    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)

    const showTestNetTag = useAppSelector(selectShowTestnetTag)

    const showConversionOnOtherNets = useAppSelector(
        selectShowConversionOnOtherNets,
    )

    const {
        ref: selectNetworkBottomSheetRef,
        onOpen: openSelectNetworkBottomSheet,
        onClose: closeSelectNetworkBottonSheet,
    } = useBottomSheetModal()

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
        <Layout
            safeAreaTestID="NetworkScreen"
            isScrollEnabled={isSmallScreen}
            body={
                <>
                    <BaseView pt={16}>
                        <SelectNetwork
                            openBottomSheet={openSelectNetworkBottomSheet}
                            selectedNetwork={selectedNetwork}
                        />

                        <BaseSpacer height={20} />

                        <CustomNodes onManageNodesClick={onManageNodesClick} />

                        <BaseSpacer height={20} />

                        {devFeaturesEnabled && (
                            <>
                                <EnableFeature
                                    title={LL.BD_OTHER_NETWORKS_INDICATOR()}
                                    subtitle={LL.BD_OTHER_NETWORKS_INDICATOR_DESC()}
                                    onValueChange={toggleTagSwitch}
                                    value={showTestNetTag}
                                />

                                <BaseSpacer height={20} />
                            </>
                        )}

                        {devFeaturesEnabled && (
                            <>
                                <EnableFeature
                                    title={LL.BD_OTHER_NETWORKS_CONVERSION()}
                                    subtitle={LL.BD_OTHER_NETWORKS_CONVERSION_DESC()}
                                    onValueChange={toggleConversionSwitch}
                                    value={showConversionOnOtherNets}
                                />

                                <BaseSpacer height={20} />
                            </>
                        )}
                    </BaseView>

                    <SelectNetworkBottomSheet
                        ref={selectNetworkBottomSheetRef}
                        onClose={closeSelectNetworkBottonSheet}
                    />
                </>
            }
        />
    )
}
