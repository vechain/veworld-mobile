import React, { useCallback, useEffect, useState } from "react"
import { BackButtonHeader, BaseSpacer, BaseText, BaseView, Layout, NumPad, PasswordPins } from "~Components"
import { useI18nContext } from "~i18n"
import { PinVerificationError, PinVerificationErrorType } from "~Model"
import { useOnDigitPressWithConfirmation } from "./useOnDigitPressWithConfirmation"
import { useAnalyticTracking, useTheme } from "~Hooks"
import { AnalyticsEvent, isSmallScreen } from "~Constants"
import HapticsService from "~Services/HapticsService"

const digitNumber = 6

interface UserCreatePasswordScreenProps {
    onSuccess: (insertedPin: string) => void
    onBack?: () => void
}

export const UserCreatePasswordScreen: React.FC<UserCreatePasswordScreenProps> = ({ onSuccess, onBack }) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const track = useAnalyticTracking()

    /**
     * Called by `useOnDigitPressWithConfirmation` when the user has finished typing the pin
     * Store the encrypted pin validation string in the redux store
     * and navigate to the success screen
     */
    const onFinishCallback = useCallback(
        async (insertedPin: string) => {
            await HapticsService.triggerNotification({ level: "Success" })
            track(AnalyticsEvent.PASSWORD_SETUP_SUBMITTED)
            onSuccess(insertedPin)
        },
        [onSuccess, track],
    )

    const [isConfirmationError, setIsConfirmationError] = useState<PinVerificationErrorType>({
        type: undefined,
        value: false,
    })

    const { pin, isPinRetype, onDigitPress, onDigitDelete } = useOnDigitPressWithConfirmation({
        digitNumber,
        onFinishCallback,
        onConfirmationError: async () => {
            await HapticsService.triggerNotification({ level: "Error" })
            setIsConfirmationError({
                type: PinVerificationError.VALIDATE_PIN,
                value: true,
            })
        },
    })

    const handleOnDigitPress = useCallback(
        async (digit: string) => {
            await HapticsService.triggerImpact({ level: "Light" })
            setIsConfirmationError({ type: undefined, value: false })
            onDigitPress(digit)
        },
        [onDigitPress],
    )

    const handleOnDigitDelete = useCallback(async () => {
        await HapticsService.triggerNotification({ level: "Warning" })
        onDigitDelete()
    }, [onDigitDelete])

    useEffect(() => {
        track(AnalyticsEvent.PAGE_LOADED_SETUP_PASSWORD)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Layout
            hasSafeArea={false}
            noBackButton
            fixedHeader={<BackButtonHeader action={onBack} title={LL.TITLE_USER_PASSWORD()} />}
            body={
                <BaseView alignItems="center" justifyContent="flex-start">
                    <BaseText w={100} align="left" typographyFont="body" color={theme.colors.subtitle}>
                        {LL.SB_USER_PASSWORD()}
                    </BaseText>
                    <BaseSpacer height={isSmallScreen ? 45 : 80} />
                    <PasswordPins
                        pin={pin}
                        digitNumber={digitNumber}
                        isPINRetype={isPinRetype}
                        isPinError={isConfirmationError}
                    />
                    <BaseSpacer height={isSmallScreen ? 32 : 80} />
                    <NumPad onDigitPress={handleOnDigitPress} onDigitDelete={handleOnDigitDelete} />
                </BaseView>
            }
        />
    )
}
