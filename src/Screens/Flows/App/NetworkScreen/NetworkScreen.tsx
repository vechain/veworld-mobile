import { StyleSheet } from "react-native"
import React, { useCallback } from "react"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTouchable,
    BaseTouchableBox,
    BaseView,
    EnableFeature,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import { StringUtils, useBottomSheetModal, useTheme } from "~Common"
import { useI18nContext } from "~i18n"
import { ChangeNetworkBottomSheet } from "./Components/ChangeNetworkBottomSheet"
import { Routes } from "~Navigation"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    selectNetworks,
    selectSelectedNetwork,
    selectShowConversionOnOtherNets,
    selectShowTestnetTag,
} from "~Storage/Redux/Selectors"
import {
    toggleShowConversionOtherNetworks,
    toggleShowTestnetTag,
} from "~Storage/Redux/Actions"

export const ChangeNetworkScreen = () => {
    const nav = useNavigation()
    const theme = useTheme()
    const { LL } = useI18nContext()

    const dispatch = useAppDispatch()

    const {
        ref: walletManagementBottomSheetRef,
        onOpen: openBottomSheet,
        onClose: closeBottonSheet,
    } = useBottomSheetModal()

    const showConversionOnOtherNets = useAppSelector(
        selectShowConversionOnOtherNets,
    )

    const showTestNetTag = useAppSelector(selectShowTestnetTag)

    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const networks = useAppSelector(selectNetworks)

    const goBack = useCallback(() => nav.goBack(), [nav])
    const onPressInput = useCallback(() => openBottomSheet(), [openBottomSheet])
    const onAddCustomPress = useCallback(
        () => nav.navigate(Routes.SETTINGS_CUSTOM_NET),
        [nav],
    )

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
                <BaseText typographyFont="title">{LL.TITLE_NETWORK()}</BaseText>
                <BaseSpacer height={24} />
                <BaseText typographyFont="bodyMedium">
                    {LL.BD_SELECT_NETWORK()}
                </BaseText>

                <BaseText typographyFont="caption">
                    {LL.TITLE_NETWORK()}
                </BaseText>

                <BaseSpacer height={20} />

                <BaseTouchableBox
                    action={onPressInput}
                    justifyContent="space-between">
                    <BaseText>
                        {StringUtils.capitalize(selectedNetwork.type)}
                    </BaseText>
                    <BaseIcon name="magnify" />
                </BaseTouchableBox>

                <BaseSpacer height={20} />

                <BaseTouchable
                    action={onAddCustomPress}
                    title={LL.BTN_ADD_CUSTOM_NODE()}
                    underlined
                />

                <BaseSpacer height={20} />

                <EnableFeature
                    title={LL.BD_OTHER_NETWORKS()}
                    subtitle={LL.BD_NETWORK_INDICATOR()}
                    onValueChange={toggleConversionSwitch}
                    value={showConversionOnOtherNets}
                />

                <BaseSpacer height={20} />

                <EnableFeature
                    title={LL.BD_OTHER_NETWORKS()}
                    subtitle={LL.BD_NETWORK_INDICATOR()}
                    onValueChange={toggleTagSwitch}
                    value={showTestNetTag}
                />
            </BaseView>

            <ChangeNetworkBottomSheet
                ref={walletManagementBottomSheetRef}
                onClose={closeBottonSheet}
                networks={networks}
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
