import React, { useCallback } from "react"
import { BaseSpacer, BaseView, Layout } from "~Components"
import { useNavigation } from "@react-navigation/native"
import { useBottomSheetModal } from "~Hooks"
import { useAppSelector } from "~Storage/Redux"
import { selectSelectedNetwork } from "~Storage/Redux/Selectors"
import { CustomNodes, SelectNetwork, SelectNetworkBottomSheet } from "./Components"
import { Routes } from "~Navigation"
import { useI18nContext } from "~i18n"

export const ChangeNetworkScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()

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
            title={LL.TITLE_NETWORKS()}
            body={
                <>
                    <BaseView pt={8}>
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
