import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseView,
    RequireUserPassword,
} from "~Components"
import { COLORS, ColorThemeType, DOMAIN_BASE } from "~Constants"
import { useDisclosure, useThemedStyles, useVns, useWalletSecurity } from "~Hooks"
import { Routes, RootStackParamListHome, RootStackParamListSettings } from "~Navigation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useI18nContext } from "~i18n"

type Props = NativeStackScreenProps<RootStackParamListHome | RootStackParamListSettings, Routes.CLAIM_USERNAME>

export const ClaimUsername: React.FC<Props> = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [subdomain, setSubdomain] = useState("")
    const [isAvailable, setIsAvailable] = useState(false)
    const [isChecking, setIsChecking] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { isOpen: isPasswordPromptOpen, onClose: closePasswordPrompt, onOpen: openPasswordPrompt } = useDisclosure()
    const { isSubdomainAvailable, registerSubdomain } = useVns()
    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const nav = useNavigation()

    const isFieldValid = useMemo(() => {
        if (subdomain && subdomain.length <= 3) {
            setErrorMessage("Min 3 chars")
            return false
        }

        setErrorMessage("")
        return true
    }, [subdomain])

    const onSetSubdomain = useCallback((value: string) => {
        setSubdomain(value.replace(/[^a-z]/g, ""))
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
        }, 250)

        return () => clearTimeout(checkIsAvailable)
    }, [isFieldValid, isSubdomainAvailable, subdomain])

    const onClaimUsername = useCallback(
        async (pin?: string) => {
            setIsLoading(true)
            const success = await registerSubdomain(subdomain, pin)
            setIsLoading(false)
            if (success) {
                nav.navigate(Routes.USERNAME_CLAIMED)
            }
        },
        [nav, registerSubdomain, subdomain],
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

    const onSkipUsernameCreation = useCallback(async () => {
        // nav.goBack()
        nav.navigate(Routes.USERNAME_CLAIMED)
    }, [nav])

    const isNotAvailable = useMemo(() => isAvailable === false, [isAvailable])

    const hasErrors = useMemo(() => Boolean(isNotAvailable || errorMessage), [isNotAvailable, errorMessage])

    const isDomainAvailable = useMemo(
        () => Boolean(!!subdomain && subdomain?.length >= 3 && isAvailable === true && !hasErrors && !isChecking),
        [subdomain, isAvailable, hasErrors, isChecking],
    )

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

    return (
        <BaseSafeArea grow={1} style={[styles.container]}>
            <BaseView style={[styles.contentContainer]}>
                {/* Title */}
                <BaseView flexDirection="row" justifyContent="center" alignItems="center">
                    <BaseText typographyFont="subTitleBold">{LL.TITLE_CLAIM_USERNAME()}</BaseText>
                </BaseView>
                <BaseSpacer height={24} />
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
                <BaseView flexDirection="row" w={100} style={[styles.footerContainer]}>
                    {!isLoading && (
                        <BaseButton
                            variant="outline"
                            flex={1}
                            action={() => onSkipUsernameCreation()}
                            testID="ClaimUsername_Skip_Btn">
                            {LL.BTN_SKIP()}
                        </BaseButton>
                    )}
                    <BaseButton
                        flex={1}
                        disabled={isLoading || !subdomain}
                        action={onSubmit}
                        testID="ClaimUsername_Confirm_Btn">
                        {isLoading ? LL.BTN_CONFRIMING() : LL.BTN_CONFIRM()}
                    </BaseButton>
                </BaseView>
            </BaseView>
            <RequireUserPassword isOpen={isPasswordPromptOpen} onClose={closePasswordPrompt} onSuccess={onSuccess} />
        </BaseSafeArea>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: { marginBottom: 24 },
        contentContainer: {
            flexGrow: 1,
            padding: 24,
        },
        footerContainer: {
            gap: 16,
        },
        inputLabel: {
            color: theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600,
        },
        inputMessage: {
            gap: 8,
            marginVertical: 8,
        },
    })
