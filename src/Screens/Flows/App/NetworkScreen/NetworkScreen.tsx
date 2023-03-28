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
    useUserPreferencesEntity,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import { StringUtils, useBottomSheetModal, useTheme } from "~Common"
import { useI18nContext } from "~i18n"
import { ChangeNetworkBottomSheet } from "./Components/ChangeNetworkBottomSheet"
import { useRealm, getNetworks } from "~Storage"
import { Routes } from "~Navigation"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    getShowConversionOnOtherNets,
    getShowTestnetTag,
} from "~Storage/Redux/Selectors"
import {
    setShowConversionOtherNets,
    setShowTestNetTag,
} from "~Storage/Redux/Actions"

export const ChangeNetworkScreen = () => {
    const nav = useNavigation()
    const theme = useTheme()
    const { LL } = useI18nContext()
    const { store } = useRealm()

    const dispatch = useAppDispatch()

    const {
        ref: walletManagementBottomSheetRef,
        onOpen: openBottomSheet,
        onClose: closeBottonSheet,
    } = useBottomSheetModal()

    const showConversionOnOtherNets = useAppSelector(
        getShowConversionOnOtherNets,
    )

    const showTestNetTag = useAppSelector(getShowTestnetTag)

    const networks = getNetworks(store)
    const { currentNetwork } = useUserPreferencesEntity()
    const goBack = useCallback(() => nav.goBack(), [nav])
    const onPressInput = useCallback(() => openBottomSheet(), [openBottomSheet])
    const onAddCustomPress = useCallback(
        () => nav.navigate(Routes.SETTINGS_CUSTOM_NET),
        [nav],
    )

    const toggleConversionSwitch = useCallback(
        (newValue: boolean) => {
            dispatch(setShowConversionOtherNets(newValue))
        },
        [dispatch],
    )

    const toggleTagSwitch = useCallback(
        (newValue: boolean) => {
            dispatch(setShowTestNetTag(newValue))
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
                        {StringUtils.capitalize(currentNetwork?.type!)}
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
