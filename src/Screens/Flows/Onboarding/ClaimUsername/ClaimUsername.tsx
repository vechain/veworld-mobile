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
import { Routes } from "~Navigation"
import { selectSelectedAccountOrNull, useAppSelector } from "~Storage/Redux"

export const ClaimUsername = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [subdomain, setSubdomain] = useState("")
    const [isAvailable, setIsAvailable] = useState(false)
    const [isChecking, setIsChecking] = useState(false)

    const { styles, theme } = useThemedStyles(baseStyles)
    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const { isOpen: isPasswordPromptOpen, onOpen: openPasswordPrompt, onClose: closePasswordPrompt } = useDisclosure()
    const { isSubdomainAvailable, registerSubdomain } = useVns()
    const nav = useNavigation()

    const account = useAppSelector(selectSelectedAccountOrNull)

    const onSetSubdomain = useCallback((value: string) => {
        setSubdomain(value)
    }, [])

    //Debounce searching for domain availability
    useEffect(() => {
        const checkIsAvailable = setTimeout(async () => {
            if (subdomain.length > 3) {
                setIsChecking(true)
                const availability = await isSubdomainAvailable(`${subdomain}${domainBase}`)
                setIsAvailable(availability)
                setIsChecking(false)
            }
        }, 500)

        return () => clearTimeout(checkIsAvailable)
    }, [isSubdomainAvailable, subdomain])

    const onSubmit = useCallback(async () => {
        if (isWalletSecurityBiometrics) {
            setIsLoading(true)
            if (!account) return
            const success = await registerSubdomain(account, subdomain)
            // console.log("CLAIM RESULT", success)
            setIsLoading(false)
            if (success) {
                nav.navigate(Routes.USERNAME_CLAIMED)
            }
        } else {
            setIsLoading(true)
            openPasswordPrompt()
        }
    }, [account, isWalletSecurityBiometrics, nav, openPasswordPrompt, registerSubdomain, subdomain])

    const onPasswordSuccess = useCallback(
        async (pin: string) => {
            if (!account) return
            const success = await registerSubdomain(account, subdomain, pin)
            // console.log("CLAIM RESULT PIN", success)
            setIsLoading(false)
            if (success) {
                nav.navigate(Routes.USERNAME_CLAIMED)
            }
        },
        [account, nav, registerSubdomain, subdomain],
    )

    const renderSubdomainStatus = useMemo(() => {
        if (subdomain.length > 3) {
            if (isChecking) return <BaseText>{"checking availability..."}</BaseText>
            if (!isChecking && isAvailable)
                return <BaseText color={theme.colors.success}>{"Domain available"}</BaseText>
            if (!isChecking && !isAvailable)
                return <BaseText color={theme.colors.danger}>{"Domain already taken"}</BaseText>
        }
        return <></>
    }, [isAvailable, isChecking, subdomain.length, theme])

    return (
        <BaseSafeArea grow={1} style={[styles.container]}>
            <BaseView style={[styles.contentContainer]}>
                {/* Title */}
                <BaseView flexDirection="row" justifyContent="center" alignItems="center">
                    <BaseText typographyFont="subTitleBold">{"Username"}</BaseText>
                </BaseView>
                <BaseSpacer height={24} />
                {/* Body */}
                <BaseView flexGrow={1}>
                    <BaseText typographyFont="subSubTitleLight">
                        {"You can claim for free your unique username for this wallet:"}
                    </BaseText>
                    <BaseSpacer height={40} />
                    {/* Input container */}
                    <BaseView>
                        <BaseView mb={8} flexDirection="row" justifyContent="space-between">
                            <BaseText typographyFont="subSubTitleBold" style={[styles.inputLabel]}>
                                {"Username"}
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
                            placeholder="Write your username"
                            value={subdomain}
                            setValue={onSetSubdomain}
                            rightIcon={<BaseText typographyFont="body">{domainBase}</BaseText>}
                        />
                        {renderSubdomainStatus}
                    </BaseView>
                </BaseView>
                {/* Footer */}
                <BaseView flexDirection="row" w={100} style={[styles.footerContainer]}>
                    {!isLoading && (
                        <BaseButton variant="outline" flex={1} action={() => {}}>
                            {"Skip"}
                        </BaseButton>
                    )}
                    <BaseButton flex={1} disabled={isLoading || !subdomain} action={onSubmit}>
                        {isLoading ? "Confirming..." : "Confirm"}
                    </BaseButton>
                </BaseView>
            </BaseView>
            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={closePasswordPrompt}
                onSuccess={onPasswordSuccess}
            />
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
