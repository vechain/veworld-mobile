import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { VeChainVetLogoSVG } from "~Assets"
import { useBottomSheetModal, useTheme } from "~Common"
import { ImportWalletBottomSheet } from "./components"

export const WalletTypeSelectionScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const theme = useTheme()

    const { ref, onOpen, onClose } = useBottomSheetModal()

    const onCreateWallet = useCallback(() => {
        nav.navigate(Routes.NEW_MNEMONIC)
    }, [nav])

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
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
                    <BaseSpacer height={40} />
                    <BaseView alignSelf="center" w={100}>
                        <VeChainVetLogoSVG />
                    </BaseView>
                </BaseView>

                <BaseView alignItems="center" w={100}>
                    <BaseTouchableBox action={onCreateWallet} py={16}>
                        <BaseView flex={1}>
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
                        <BaseView flex={1}>
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
                    <BaseText typographyFont="body" align="center">
                        {
                            "Creating the wallet the user accepts Terms and Conditions and Privacy Policy"
                        }
                    </BaseText>
                </BaseView>
                <ImportWalletBottomSheet ref={ref} onClose={onClose} />
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
