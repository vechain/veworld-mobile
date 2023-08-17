import React, { useCallback } from "react"
import { BaseSpacer, BaseView, Layout } from "~Components"
import { useNavigation } from "@react-navigation/native"
import { useBottomSheetModal } from "~Hooks"
import { useAppSelector } from "~Storage/Redux"
import { selectSelectedNetwork } from "~Storage/Redux/Selectors"
import {
    CustomNodes,
    SelectNetwork,
    SelectNetworkBottomSheet,
} from "./Components"
import { Routes } from "~Navigation"
import { isSmallScreen } from "~Constants"

export const ChangeNetworkScreen = () => {
    const nav = useNavigation()

    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const {
        ref: selectNetworkBottomSheetRef,
        onOpen: openSelectNetworkBottomSheet,
        onClose: closeSelectNetworkBottonSheet,
    } = useBottomSheetModal()

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
