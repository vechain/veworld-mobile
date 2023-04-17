import { StyleSheet } from "react-native"
import React, { useCallback, useState } from "react"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseView,
    DeleteConfirmationBottomSheet,
    EnableFeature,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import { error, useBottomSheetModal, useTheme } from "~Common"
import { useI18nContext } from "~i18n"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    selectNetworkById,
    selectSelectedNetwork,
    selectShowConversionOnOtherNets,
    selectShowTestnetTag,
} from "~Storage/Redux/Selectors"
import {
    handleRemoveCustomNode,
    toggleShowConversionOtherNetworks,
    toggleShowTestnetTag,
} from "~Storage/Redux/Actions"
import {
    CustomNodes,
    CustomNodesBottomSheet,
    EditCustomNodeBottomSheet,
    SelectNetwork,
    SelectNetworkBottomSheet,
} from "./Components"
import { Network } from "~Model"
import * as Haptics from "expo-haptics"

export const ChangeNetworkScreen = () => {
    const nav = useNavigation()
    const theme = useTheme()
    const { LL } = useI18nContext()

    const dispatch = useAppDispatch()

    const [networkToEditDeleteId, setNetworkToEditDeleteId] = useState<string>()

    const networkToEdit = useAppSelector(
        selectNetworkById(networkToEditDeleteId),
    )

    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const showTestNetTag = useAppSelector(selectShowTestnetTag)

    const showConversionOnOtherNets = useAppSelector(
        selectShowConversionOnOtherNets,
    )

    const {
        ref: selectNetworkBottomSheetRef,
        onOpen: openSelectNetworkBottomSheet,
        onClose: closeSelectNetworkBottonSheet,
    } = useBottomSheetModal()

    const {
        ref: customNodesBottomSheetRef,
        onOpen: openCustomNodesBottomSheet,
        onClose: closeCustomNodesBottomSheet,
    } = useBottomSheetModal()

    const {
        ref: deleteConfirmationSheetRef,
        onOpen: openDeleteConfirmationSheet,
        onClose: closeDeleteConfirmationSheet,
    } = useBottomSheetModal()

    const {
        ref: editNetworkSheetRef,
        onOpen: openEditNetworkSheet,
        onClose: closeEditNetworkSheet,
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

    const onEditNetworkClick = useCallback(
        (network: Network) => {
            setNetworkToEditDeleteId(network.id)
            closeCustomNodesBottomSheet()
            openEditNetworkSheet()
        },
        [closeCustomNodesBottomSheet, openEditNetworkSheet],
    )

    const onDeleteNetworkClick = useCallback(
        (network: Network) => {
            setNetworkToEditDeleteId(network.id)
            closeCustomNodesBottomSheet()
            openDeleteConfirmationSheet()
        },
        [closeCustomNodesBottomSheet, openDeleteConfirmationSheet],
    )

    const onDeleteNetworkConfirm = useCallback(() => {
        try {
            if (networkToEditDeleteId) {
                dispatch(handleRemoveCustomNode(networkToEditDeleteId))
            }
            closeDeleteConfirmationSheet()
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        } catch (e) {
            error(e)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        }
    }, [closeDeleteConfirmationSheet, networkToEditDeleteId, dispatch])

    return (
        <BaseSafeArea grow={1}>
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

                <CustomNodes openBottomSheet={openCustomNodesBottomSheet} />

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
            </BaseView>

            <SelectNetworkBottomSheet
                ref={selectNetworkBottomSheetRef}
                onClose={closeSelectNetworkBottonSheet}
            />
            <CustomNodesBottomSheet
                ref={customNodesBottomSheetRef}
                onClose={closeCustomNodesBottomSheet}
                onEditNetwork={onEditNetworkClick}
                onDeleteNetwork={onDeleteNetworkClick}
            />
            <DeleteConfirmationBottomSheet
                ref={deleteConfirmationSheetRef}
                onClose={closeDeleteConfirmationSheet}
                onConfirm={onDeleteNetworkConfirm}
                title={LL.SB_CONFIRM_OPERATION()}
                description={LL.NETWORK_CONFIRM_REMOVE_NODE()}
            />
            <EditCustomNodeBottomSheet
                ref={editNetworkSheetRef}
                onClose={closeEditNetworkSheet}
                network={networkToEdit}
            />
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },
})
