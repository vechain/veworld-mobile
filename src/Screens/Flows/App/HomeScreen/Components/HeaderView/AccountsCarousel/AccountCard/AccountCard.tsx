import React, { memo, useCallback, useMemo } from "react"
import { ViewProps, StyleSheet } from "react-native"
import type { AnimateProps } from "react-native-reanimated"
import Animated from "react-native-reanimated"
import { CryptoUtils, useTheme, PlatformUtils } from "~Common"
import {
    AccountIcon,
    AddressButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { Account, UserPreferences, useRealm } from "~Storage"
import { Balance } from "./Balance"

interface Props extends AnimateProps<ViewProps> {
    account: Account
    userPreferencesEntity: UserPreferences
    openAccountManagement: () => void
}

export const AccountCard: React.FC<Props> = memo(
    ({
        account,
        openAccountManagement,
        userPreferencesEntity,
        ...animatedViewProps
    }) => {
        const theme = useTheme()
        const { store } = useRealm()

        const randomBalance = useMemo(() => CryptoUtils.random().toString(), [])

        const toggleBalanceVisibility = useCallback(() => {
            if (userPreferencesEntity)
                store.write(() => {
                    userPreferencesEntity.balanceVisible =
                        !userPreferencesEntity.balanceVisible
                })
        }, [store, userPreferencesEntity])

        return (
            <Animated.View style={baseStyles.container} {...animatedViewProps}>
                <BaseView
                    background={theme.colors.primary}
                    isFlex
                    justify="flex-start"
                    align="flex-start"
                    radius={24}
                    px={16}
                    py={16}>
                    <BaseView
                        orientation="row"
                        justify="space-between"
                        align="flex-start"
                        w={100}>
                        <BaseView orientation="row" align="center">
                            <AccountIcon account={account} />
                            <BaseView px={8}>
                                <BaseText
                                    typographyFont="buttonPrimary"
                                    color={theme.colors.textReversed}>
                                    {account.alias}
                                </BaseText>
                                <BaseSpacer height={8} />
                                <AddressButton address={account.address} />
                            </BaseView>
                        </BaseView>
                        <BaseIcon
                            name="account-cog-outline"
                            color={theme.colors.textReversed}
                            size={28}
                            action={openAccountManagement}
                        />
                    </BaseView>
                    <BaseSpacer height={PlatformUtils.isIOS() ? 18 : 10} />
                    <Balance
                        isVisible={userPreferencesEntity.balanceVisible}
                        toggleVisible={toggleBalanceVisibility}
                        balance={randomBalance}
                    />
                </BaseView>
            </Animated.View>
        )
    },
)

const baseStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
