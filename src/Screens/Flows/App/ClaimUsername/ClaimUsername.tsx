import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import {
    AlertInline,
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseView,
    Layout,
    RequireUserPassword,
} from "~Components"
import { AnalyticsEvent, COLORS, ColorThemeType, DOMAIN_BASE } from "~Constants"
import { useAnalyticTracking, useDisclosure, useThemedStyles, useVns, useWalletSecurity } from "~Hooks"
import { Routes, RootStackParamListHome, RootStackParamListSettings } from "~Navigation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useI18nContext } from "~i18n"

type Props = NativeStackScreenProps<RootStackParamListHome | RootStackParamListSettings, Routes.CLAIM_USERNAME>

const MIN_CHARS = 3

export const ClaimUsername: React.FC<Props> = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [subdomain, setSubdomain] = useState("")
    const [isAvailable, setIsAvailable] = useState(false)
    const [isChecking, setIsChecking] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [claimError, setClaimError] = useState(false)

    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { isOpen: isPasswordPromptOpen, onClose: closePasswordPrompt, onOpen: openPasswordPrompt } = useDisclosure()
    const { isSubdomainAvailable, registerSubdomain } = useVns()
    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const trackEvent = useAnalyticTracking()

    const isFieldValid = useMemo(() => {
        if (subdomain && subdomain.length < MIN_CHARS) {
            setErrorMessage(`Minimum ${MIN_CHARS} characters required`)
            return false
        }

        setErrorMessage("")
        return true
    }, [subdomain])

    const onSetSubdomain = useCallback((value: string) => {
        setSubdomain(value.replace(/[^a-z0-92]/g, ""))
    }, [])

    //Debounce searching for domain availability
    useEffect(() => {
        const checkIsAvailable = setTimeout(async () => {
            if (isFieldValid) {
                setIsChecking(true)
                const availability = await isSubdomainAvailable(`${subdomain}${DOMAIN_BASE}`)
                setIsAvailable(availability)
                setIsChecking(false)
            }
        }, 400)

        return () => clearTimeout(checkIsAvailable)
    }, [isFieldValid, isSubdomainAvailable, subdomain])

    const onClaimUsername = useCallback(
        async (pin?: string) => {
            setIsLoading(true)
            const fullDomain = `${subdomain}${DOMAIN_BASE}`
            const success = await registerSubdomain(subdomain, pin)

            trackEvent(AnalyticsEvent.CLAIM_USERNAME_CREATED, {
                subdomain: fullDomain,
            })

            setIsLoading(false)

            setClaimError(!success)
            if (success) {
                navigation.replace(Routes.USERNAME_CLAIMED, { username: fullDomain })
            }
        },
        [navigation, registerSubdomain, subdomain, trackEvent],
    )

    const onSuccess = useCallback(
        (pin?: string) => {
            closePasswordPrompt()
            onClaimUsername(pin)
        },
        [closePasswordPrompt, onClaimUsername],
    )

    const onSubmit = useCallback(() => {
        if (!isWalletSecurityBiometrics) {
            openPasswordPrompt()
        } else {
            onClaimUsername()
        }
    }, [isWalletSecurityBiometrics, onClaimUsername, openPasswordPrompt])

    const isNotAvailable = useMemo(() => isAvailable === false, [isAvailable])

    const hasErrors = useMemo(() => Boolean(isNotAvailable || errorMessage), [isNotAvailable, errorMessage])

    const isDomainAvailable = useMemo(
        () =>
            Boolean(!!subdomain && subdomain?.length >= MIN_CHARS && isAvailable === true && !hasErrors && !isChecking),
        [subdomain, isAvailable, hasErrors, isChecking],
    )

    const renderButtonLabel = useMemo(() => {
        if (isLoading) return LL.BTN_CONFRIMING()
        if (claimError) return LL.BTN_TRY_AGAIN()
        return LL.BTN_CONFIRM()
    }, [LL, claimError, isLoading])

    const renderSubdomainStatus = useMemo(() => {
        if (isChecking) {
            return (
                <BaseView flexDirection="row" style={styles.inputMessage}>
                    <BaseText color={theme.colors.infoVariant.titleInline}>
                        {LL.CHECKING_USERNAME_AVAILABILITY()}
                    </BaseText>
                </BaseView>
            )
        } else {
            return (
                <BaseView flexDirection="row" style={styles.inputMessage}>
                    {isDomainAvailable && (
                        <>
                            <BaseIcon name="icon-check-circle" color={theme.colors.successVariant.icon} size={16} />
                            <BaseText color={theme.colors.successVariant.titleInline}>
                                {LL.SUCCESS_DOMAIN_AVAILABLE()}
                            </BaseText>
                        </>
                    )}
                    {hasErrors && (
                        <>
                            <BaseIcon name="icon-alert-triangle" color={theme.colors.errorVariant.icon} size={16} />
                            <BaseText color={theme.colors.errorVariant.titleInline}>
                                {isNotAvailable ? LL.ERROR_DOMAIN_ALREADY_TAKEN() : errorMessage}
                            </BaseText>
                        </>
                    )}
                </BaseView>
            )
        }
    }, [LL, errorMessage, hasErrors, isChecking, isDomainAvailable, isNotAvailable, styles, theme])

    useEffect(() => {
        trackEvent(AnalyticsEvent.CLAIM_USERNAME_PAGE_LOADED)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Layout
            title={LL.TITLE_CLAIM_USERNAME()}
            fixedBody={
                <BaseView style={[styles.contentContainer]}>
                    {/* Body */}
                    <BaseView flexGrow={1}>
                        <BaseText typographyFont="subSubTitleLight">{LL.SB_CLAIM_USERNAME()}</BaseText>
                        <BaseSpacer height={40} />
                        {/* Input container */}
                        <BaseView>
                            <BaseView mb={8} flexDirection="row" justifyContent="space-between">
                                <BaseText typographyFont="subSubTitle" style={[styles.inputLabel]}>
                                    {LL.TITLE_CLAIM_USERNAME()}
                                </BaseText>
                                <BaseView flexDirection="row">
                                    <BaseText typographyFont="caption" style={[styles.inputLabel]}>
                                        {"Powered by"}{" "}
                                    </BaseText>
                                    <BaseText typographyFont="captionSemiBold" style={[styles.inputLabel]}>
                                        {"vet.domains"}
                                    </BaseText>
                                </BaseView>
                            </BaseView>
                            <BaseTextInput
                                placeholder={LL.INPUT_PLACEHOLDER_USERNAME()}
                                value={subdomain}
                                maxLength={20}
                                setValue={onSetSubdomain}
                                rightIcon={
                                    <BaseText typographyFont="body" style={[styles.inputLabel]}>
                                        {DOMAIN_BASE}
                                    </BaseText>
                                }
                            />
                            {renderSubdomainStatus}
                        </BaseView>
                    </BaseView>
                    {/* Footer */}
                    <BaseView>
                        {claimError && (
                            <AlertInline
                                status="error"
                                variant="banner"
                                message={LL.ERROR_GENERIC_WITH_RETRY_SUBTITLE()}
                            />
                        )}
                        <BaseSpacer height={24} />
                        <BaseView flexDirection="row" w={100}>
                            <BaseButton
                                flex={1}
                                disabled={isLoading || !subdomain}
                                action={onSubmit}
                                testID="ClaimUsername_Confirm_Btn">
                                {renderButtonLabel}
                            </BaseButton>
                        </BaseView>
                    </BaseView>

                    <RequireUserPassword
                        isOpen={isPasswordPromptOpen}
                        onClose={closePasswordPrompt}
                        onSuccess={onSuccess}
                    />
                </BaseView>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: { marginBottom: 12 },
        contentContainer: {
            flexGrow: 1,
            padding: 24,
        },
        inputLabel: {
            color: theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600,
        },
        inputMessage: {
            gap: 8,
            marginVertical: 8,
        },
    })
