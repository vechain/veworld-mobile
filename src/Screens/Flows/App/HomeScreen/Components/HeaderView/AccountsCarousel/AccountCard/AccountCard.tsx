import React, { memo } from "react"
import { StyleProp, ViewStyle, ViewProps, StyleSheet } from "react-native"
import type { AnimateProps } from "react-native-reanimated"
import Animated from "react-native-reanimated"
import {
    ColorThemeType,
    CryptoUtils,
    useTheme,
    useThemedStyles,
    PlatformUtils,
} from "~Common"
import {
    AccountIcon,
    AddressButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { Account } from "~Storage"
import { Balance } from "./Balance"

interface Props extends AnimateProps<ViewProps> {
    style?: StyleProp<ViewStyle>
    account: Account
    openAccountManagement: () => void
}

export const AccountCard: React.FC<Props> = memo(props => {
    const { style, account, openAccountManagement, ...animatedViewProps } =
        props
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    return (
        <Animated.View style={styles.container} {...animatedViewProps}>
            <BaseView
                bg={theme.colors.primary}
                flex={1}
                justifyContent="flex-start"
                alignItems="flex-start"
                borderRadius={24}
                px={16}
                py={16}
                style={style}>
                <BaseView
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    w={100}>
                    <BaseView flexDirection="row" alignItems="center">
                        <AccountIcon account={account} />
                        <BaseView px={8} alignItems="flex-start">
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
                <Balance balance={CryptoUtils.random().toString()} />
            </BaseView>
        </Animated.View>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        itemContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.primary,
            borderRadius: 24,
        },
    })
