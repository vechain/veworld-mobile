import { StyleSheet } from "react-native"
import React, { useCallback } from "react"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import { useBottomSheetModal, useTheme } from "~Common"
import { useI18nContext } from "~i18n"
import { ChangeNetworkBottomSheet } from "./Components/ChangeNetworkBottomSheet"
import { Network, useRealm } from "~Storage"
import { useUserPreferencesEntity } from "~Common/Hooks/Entities"

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

    const networks = store.objects<Network>(Network.getName())
    const { currentNetwork } = useUserPreferencesEntity()
    const goBack = useCallback(() => nav.goBack(), [nav])
    const onPressInput = useCallback(() => openBottomSheet(), [openBottomSheet])

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
                <BaseSpacer height={12} />
                <BaseText typographyFont="caption">
                    {LL.TITLE_NETWORK()}
                </BaseText>

                <BaseSpacer height={20} />

                <BaseTouchableBox
                    action={onPressInput}
                    justifyContent="space-between">
                    <BaseText>{capitalize(currentNetwork.type)}</BaseText>
                    <BaseIcon name="magnify" />
                </BaseTouchableBox>

                <BaseSpacer height={20} />

                <BaseText typographyFont="bodyMedium">
                    {LL.BD_OTHER_NETWORKS()}
                </BaseText>
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

const capitalize = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1)
}
