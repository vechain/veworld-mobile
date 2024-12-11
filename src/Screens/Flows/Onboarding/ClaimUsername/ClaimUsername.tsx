import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseView,
    RequireUserPassword,
} from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { domainBase, useDisclosure, useThemedStyles, useVns, useWalletSecurity } from "~Hooks"
import { Routes, RootStackParamListOnboarding } from "~Navigation"
import { selectDevice, selectSelectedAccountOrNull, useAppSelector } from "~Storage/Redux"
import { useHandleWalletCreation } from "../WelcomeScreen/useHandleWalletCreation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useI18nContext } from "~i18n"

type Props = NativeStackScreenProps<RootStackParamListOnboarding, Routes.CLAIM_USERNAME>

export const ClaimUsername: React.FC<Props> = ({ route }) => {
    const { pin } = route.params || {}
    const [isLoading, setIsLoading] = useState(false)
    const [subdomain, setSubdomain] = useState("")
    const [isAvailable, setIsAvailable] = useState(false)
    const [isChecking, setIsChecking] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const { isOpen: isPasswordPromptOpen, onClose: closePasswordPrompt } = useDisclosure()
    const { isSubdomainAvailable, registerSubdomain } = useVns()
    const { migrateFromOnboarding } = useHandleWalletCreation()
    const nav = useNavigation()
    const account = useAppSelector(selectSelectedAccountOrNull)
    const device = useAppSelector(state => selectDevice(state, account?.rootAddress))

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
                const availability = await isSubdomainAvailable(`${subdomain}${domainBase}`)
                setIsAvailable(availability)
                setIsChecking(false)
            }
        }, 250)

        return () => clearTimeout(checkIsAvailable)
    }, [isFieldValid, isSubdomainAvailable, subdomain])

    const onSubmit = useCallback(async () => {
        setIsLoading(true)
        if (!device || !account) return
        const success = await registerSubdomain(device, account.address, subdomain, pin)
        setIsLoading(false)
        if (success) {
            nav.navigate(Routes.USERNAME_CLAIMED, pin && !isWalletSecurityBiometrics ? { pin } : undefined)
        }
    }, [account, device, isWalletSecurityBiometrics, nav, pin, registerSubdomain, subdomain])

    const onSkipUsernameCreation = useCallback(async () => {
        await migrateFromOnboarding(pin)
    }, [migrateFromOnboarding, pin])

    const isNotAvailable = useMemo(() => isAvailable === false, [isAvailable])

    const hasErrors = useMemo(() => Boolean(isNotAvailable || errorMessage), [isNotAvailable, errorMessage])

    const isDomainAvailable = useMemo(
        () => Boolean(!!subdomain && subdomain?.length >= 3 && isAvailable === true && !hasErrors && !isChecking),
        [subdomain, isAvailable, hasErrors, isChecking],
    )

    const renderSubdomainStatus = useMemo(() => {
        if (isChecking) {
            return <BaseText>{LL.CHECKING_USERNAME_AVAILABILITY()}</BaseText>
        } else {
            return (
                <>
                    {isDomainAvailable && (
                        <BaseText color={theme.colors.success}>{LL.SUCCESS_DOMAIN_AVAILABLE()}</BaseText>
                    )}
                    {hasErrors && (
                        <BaseText color={theme.colors.danger}>
                            {isNotAvailable ? LL.ERROR_DOMAIN_ALREADY_TAKEN() : errorMessage}
                        </BaseText>
                    )}
                </>
            )
        }
    }, [
        LL,
        errorMessage,
        hasErrors,
        isChecking,
        isDomainAvailable,
        isNotAvailable,
        theme.colors.danger,
        theme.colors.success,
    ])

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
                            <BaseText typographyFont="subSubTitleBold" style={[styles.inputLabel]}>
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
                            errorMessage={errorMessage}
                            rightIcon={<BaseText typographyFont="body">{domainBase}</BaseText>}
                        />
                        {renderSubdomainStatus}
                    </BaseView>
                </BaseView>
                {/* Footer */}
                <BaseView flexDirection="row" w={100} style={[styles.footerContainer]}>
                    {!isLoading && (
                        <BaseButton variant="outline" flex={1} action={() => onSkipUsernameCreation()}>
                            {LL.BTN_SKIP()}
                        </BaseButton>
                    )}
                    <BaseButton flex={1} disabled={isLoading || !subdomain} action={onSubmit}>
                        {isLoading ? LL.BTN_CONFRIMING() : LL.BTN_CONFIRM()}
                    </BaseButton>
                </BaseView>
            </BaseView>
            <RequireUserPassword isOpen={isPasswordPromptOpen} onClose={closePasswordPrompt} onSuccess={() => {}} />
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
            color: theme.isDark ? COLORS.GREY_50 : COLORS.GREY_600,
        },
    })
