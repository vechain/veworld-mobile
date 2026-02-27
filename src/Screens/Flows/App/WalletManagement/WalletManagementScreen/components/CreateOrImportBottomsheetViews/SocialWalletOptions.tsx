import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition, StretchInY, StretchOutY } from "react-native-reanimated"
import { BaseSpacer } from "~Components/Base"
import { CardListItem, RequireUserPassword } from "~Components/Reusable"
import { useSmartWallet, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { useHandleWalletCreation } from "~Screens/Flows/Onboarding/WelcomeScreen/useHandleWalletCreation"
import { useSocialWalletLogin } from "~Screens/Flows/Onboarding/WelcomeScreen/useSocialWalletLogin"
import { PlatformUtils } from "~Utils"

type Props = {
    onClose: () => void
}

export const SocialWalletOptions = ({ onClose }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    const { linkedAccounts } = useSmartWallet()

    const { isOpen, importOnboardedSmartWallet } = useHandleWalletCreation()

    const {
        isLoginPending: isSocialLoginPending,
        handleLogin: handleSocialLogin,
        handlePinSuccess: handleSocialPinSuccess,
        clearPendingState: clearSocialPendingState,
    } = useSocialWalletLogin({
        onCreateSmartWallet: async ({ address, name }) => {
            onClose()
            // Convert linkedAccounts to provider array
            const linkedProviders = linkedAccounts.map(acc => acc.type)
            await importOnboardedSmartWallet({ address, name, linkedProviders })
        },
        onSmartWalletPinSuccess: async ({ address, name }) => {
            onClose()
            // Convert linkedAccounts to provider array
            const linkedProviders = linkedAccounts.map(acc => acc.type)
            await importOnboardedSmartWallet({ address, name, linkedProviders })
        },
    })

    const options = useMemo(() => {
        return [
            {
                id: "google",
                title: LL.BTN_CONTINUE_WITH_GOOGLE(),
                description: LL.SB_DESCRIPTION_GOOGLE_LOGIN(),
                icon: "icon-google",
                action: () => {
                    handleSocialLogin("google")
                },
                disabled: isSocialLoginPending,
            },
            {
                id: "apple",
                title: LL.BTN_CONTINUE_WITH_APPLE(),
                description: LL.SB_DESCRIPTION_APPLE_LOGIN(),
                icon: "icon-apple",
                action: () => {
                    handleSocialLogin("apple")
                },
                disabled: isSocialLoginPending,
            },
        ]
    }, [LL, handleSocialLogin, isSocialLoginPending])

    const ItemsSeparator = useCallback(() => {
        return <BaseSpacer height={16} />
    }, [])

    const filteredOptions = useMemo(() => {
        return options.filter(option => {
            if (option.id === "apple") {
                return PlatformUtils.isIOS()
            }
            return true
        })
    }, [options])

    return (
        <Animated.View
            style={styles.rootSheetContent}
            entering={StretchInY.duration(200)}
            exiting={StretchOutY.duration(200)}
            layout={LinearTransition}>
            <Animated.FlatList
                data={filteredOptions}
                keyExtractor={item => item.id}
                bounces={false}
                ItemSeparatorComponent={ItemsSeparator}
                renderItem={({ item }) => (
                    <CardListItem
                        testID={`SOCIAL_WALLET_OPTIONS_${item.id.toUpperCase()}`}
                        icon={item.icon as IconKey}
                        title={item.title}
                        subtitle={item.description}
                        action={item.action}
                        disabled={item.disabled}
                    />
                )}
            />
            <RequireUserPassword isOpen={isOpen} onClose={clearSocialPendingState} onSuccess={handleSocialPinSuccess} />
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootSheetContent: {
            transformOrigin: "top center",
        },
    })
