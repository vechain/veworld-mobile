import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { BaseBottomSheet } from "~Components"
import { BaseButton, BaseIcon, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useSmartWallet } from "~Hooks"
import { useBottomSheetModal } from "~Hooks/useBottomSheet"
import { useThemedStyles } from "~Hooks/useTheme"
import { useI18nContext } from "~i18n"
import { SocialProvider } from "~VechainWalletKit"

type Props = {
    bsRef: React.RefObject<BottomSheetModalMethods>
}

type ConfirmUnlinkAccountBottomSheetData = {
    provider: SocialProvider
    subject: string
}

export const ConfirmUnlinkAccountBottomSheet = ({ bsRef }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { unlinkOAuth } = useSmartWallet()

    const { ref, onClose } = useBottomSheetModal({ externalRef: bsRef })

    const onConfirm = useCallback(
        async (data: ConfirmUnlinkAccountBottomSheetData) => {
            await unlinkOAuth(data.provider, data.subject)
            onClose()
        },
        [unlinkOAuth, onClose],
    )

    return (
        <BaseBottomSheet
            ref={ref}
            scrollable={false}
            dynamicHeight
            bottomSafeArea
            backgroundStyle={{ backgroundColor: theme.colors.newBottomSheet.background }}>
            {(data: ConfirmUnlinkAccountBottomSheetData) => {
                return (
                    <BaseView gap={24}>
                        <BaseIcon
                            name="icon-unlink"
                            size={64}
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                        />
                        <BaseView gap={8}>
                            <BaseText typographyFont="subSubTitleSemiBold" align="center">
                                {LL.SB_CONFIRM_UNLINK_ACCOUNT_TITLE()}
                            </BaseText>
                            <BaseText typographyFont="body" align="center">
                                {LL.SB_CONFIRM_UNLINK_ACCOUNT_DESCRIPTION({
                                    provider: data.provider,
                                })}
                            </BaseText>
                        </BaseView>
                        <BaseView gap={16}>
                            <BaseButton
                                title={LL.BTN_CONFIRM()}
                                action={() => onConfirm(data)}
                                style={styles.dangerButton}
                                textColor={COLORS.WHITE}
                            />
                            <BaseButton
                                title={LL.COMMON_BTN_CANCEL()}
                                variant="outline"
                                action={onClose}
                                style={styles.secondaryButton}
                                textColor={theme.colors.text}
                            />
                        </BaseView>
                    </BaseView>
                )
            }}
        </BaseBottomSheet>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        dangerButton: {
            backgroundColor: COLORS.RED_600,
            borderColor: COLORS.RED_600,
        },
        secondaryButton: {
            borderRadius: 8,
            paddingVertical: 14,
            borderColor: theme.colors.text,
        },
    })
