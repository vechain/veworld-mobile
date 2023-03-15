import { StyleSheet } from "react-native"
import React, { useCallback, useMemo, useState } from "react"
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
import { useRealm, getNetworks, getUserPreferences } from "~Storage"
import { useUserPreferencesEntity } from "~Common/Hooks/Entities"
import { Routes } from "~Navigation"

export const ChangeNetworkScreen = () => {
    const nav = useNavigation()
    const theme = useTheme()
    const { LL } = useI18nContext()
    const { store } = useRealm()

    const {
        ref: walletManagementBottomSheetRef,
        onOpen: openBottomSheet,
        onClose: closeBottonSheet,
    } = useBottomSheetModal()

    const networks = getNetworks(store)
    const { currentNetwork } = useUserPreferencesEntity()
    const goBack = useCallback(() => nav.goBack(), [nav])
    const onPressInput = useCallback(() => openBottomSheet(), [openBottomSheet])
    const onAddCustomPress = useCallback(
        () => nav.navigate(Routes.SETTINGS_CUSTOM_NET),
        [nav],
    )

    const userPreferences = getUserPreferences(store)

    const isShowConversion = useMemo(
        () => userPreferences.showConversionOtherNets,
        [userPreferences],
    )
    const [isConversionEnabled, setIsConversionEnabled] =
        useState(isShowConversion)

    const toggleConversionSwitch = useCallback(
        (newValue: boolean) => {
            setIsConversionEnabled(newValue)

            store.write(() => {
                userPreferences.showConversionOtherNets = newValue
            })
        },
        [userPreferences, store],
    )

    const isShowTestTag = useMemo(
        () => userPreferences.showTestNetTag,
        [userPreferences],
    )
    const [isTag, setIsTag] = useState(isShowTestTag)
    const toggleTagSwitch = useCallback(
        (newValue: boolean) => {
            setIsTag(newValue)

            store.write(() => {
                userPreferences.showTestNetTag = newValue
            })
        },
        [userPreferences, store],
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
                        {StringUtils.capitalize(currentNetwork.type)}
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
                    value={isConversionEnabled}
                />

                <BaseSpacer height={20} />

                <EnableFeature
                    title={LL.BD_OTHER_NETWORKS()}
                    subtitle={LL.BD_NETWORK_INDICATOR()}
                    onValueChange={toggleTagSwitch}
                    value={isTag}
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
