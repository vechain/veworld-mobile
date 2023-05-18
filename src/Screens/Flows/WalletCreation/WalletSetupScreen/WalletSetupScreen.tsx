import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import {
    BackButtonHeader,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { useBottomSheetModal, useTheme } from "~Common"
import { ImportWalletBottomSheet } from "./components"

export const WalletSetupScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const theme = useTheme()

    const { ref, onOpen, onClose } = useBottomSheetModal()

    const onCreateWallet = useCallback(() => {
        nav.navigate(Routes.NEW_MNEMONIC)
    }, [nav])

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
            <BaseView
                alignItems="center"
                justifyContent="space-between"
                flexGrow={1}
                mx={20}>
                <BaseView alignSelf="flex-start">
                    <BaseText typographyFont="title">
                        {LL.TITLE_CREATE_WALLET_TYPE()}
                    </BaseText>
                    <BaseText typographyFont="body" my={10}>
                        {LL.BD_CREATE_WALLET_TYPE()}
                    </BaseText>
                </BaseView>

                <BaseView alignItems="center" w={100}>
                    <BaseTouchableBox action={onCreateWallet} py={16}>
                        <BaseIcon
                            name="plus-circle"
                            size={24}
                            color={theme.colors.text}
                        />
                        <BaseView flex={1} px={12}>
                            <BaseText align="left" typographyFont="subSubTitle">
                                {LL.BTN_CREATE_WALLET_TYPE_CREATE_NEW()}
                            </BaseText>
                            <BaseText
                                pt={4}
                                align="left"
                                typographyFont="captionRegular">
                                {
                                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nibh euismod."
                                }
                            </BaseText>
                        </BaseView>
                        <BaseIcon
                            name="chevron-right"
                            size={24}
                            color={theme.colors.text}
                        />
                    </BaseTouchableBox>
                    <BaseSpacer height={16} />
                    <BaseTouchableBox
                        action={onOpen}
                        py={16}
                        justifyContent="space-between">
                        <BaseIcon
                            name="tray-arrow-up"
                            size={24}
                            color={theme.colors.text}
                        />
                        <BaseView flex={1} px={12}>
                            <BaseText align="left" typographyFont="subSubTitle">
                                {LL.BTN_CREATE_WALLET_TYPE_IMPORT()}
                            </BaseText>
                            <BaseText
                                align="left"
                                pt={4}
                                typographyFont="captionRegular">
                                {
                                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nibh euismod."
                                }
                            </BaseText>
                        </BaseView>
                        <BaseIcon
                            name="chevron-right"
                            size={24}
                            color={theme.colors.text}
                        />
                    </BaseTouchableBox>
                    <BaseSpacer height={24} />
                    <BaseView
                        alignSelf="center"
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                        flexWrap="wrap">
                        <BaseText typographyFont="body" align="center">
                            {LL.BD_CREATE_WALLET_TYPE_USER_ACCEPTS()}
                        </BaseText>
                        <BaseText
                            typographyFont="bodyMedium"
                            underline
                            align="center">
                            {LL.COMMON_LBL_TERMS_AND_CONDITIONS()}
                        </BaseText>
                        <BaseText typographyFont="body" align="center">
                            {LL.COMMON_LBL_AND()}{" "}
                        </BaseText>
                        <BaseText
                            typographyFont="bodyMedium"
                            underline
                            align="center">
                            {LL.COMMON_LBL_PRIVACY_POLICY()}
                        </BaseText>
                    </BaseView>
                </BaseView>
                <ImportWalletBottomSheet ref={ref} onClose={onClose} />
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
