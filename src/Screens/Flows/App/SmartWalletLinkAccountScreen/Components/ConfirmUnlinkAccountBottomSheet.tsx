import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useState } from "react"
import { StyleSheet } from "react-native"
import { BaseBottomSheet } from "~Components"
import { BaseButton, BaseIcon, BaseText, BaseView } from "~Components/Base"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
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
    const [isLoading, setIsLoading] = useState(false)
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { unlinkOAuth } = useSmartWallet()

    const { ref, onClose } = useBottomSheetModal({ externalRef: bsRef })

    const onConfirm = useCallback(
        async (data: ConfirmUnlinkAccountBottomSheetData) => {
            setIsLoading(true)
            try {
                await unlinkOAuth(data.provider, data.subject)
                Feedback.show({
                    severity: FeedbackSeverity.SUCCESS,
                    type: FeedbackType.ALERT,
                    message: LL.FEEDBACK_ACCOUNT_UNLINKED(),
                })
                onClose()
                setIsLoading(false)
            } catch {
                Feedback.show({
                    severity: FeedbackSeverity.ERROR,
                    type: FeedbackType.ALERT,
                    message: LL.FEEDBACK_ACCOUNT_UNLINKED_FAIL(),
                })
                onClose()
                setIsLoading(false)
            }
        },
        [unlinkOAuth, onClose, LL],
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
                                isLoading={isLoading}
                            />
                            <BaseButton
                                title={LL.COMMON_BTN_CANCEL()}
                                variant="outline"
                                action={onClose}
                                style={styles.secondaryButton}
                                textColor={theme.colors.text}
                                disabled={isLoading}
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
