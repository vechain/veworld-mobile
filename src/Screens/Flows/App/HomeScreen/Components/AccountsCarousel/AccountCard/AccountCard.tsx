import React, { memo } from "react"
import { StyleProp, ViewStyle, ViewProps, StyleSheet } from "react-native"
import type { AnimateProps } from "react-native-reanimated"
import Animated from "react-native-reanimated"
import { ColorThemeType, CryptoUtils, useTheme, useThemedStyles } from "~Common"
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
}

export const AccountCard: React.FC<Props> = memo(props => {
    const { style, account, ...animatedViewProps } = props
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    return (
        <Animated.View style={styles.container} {...animatedViewProps}>
            <BaseView
                background={theme.colors.primary}
                isFlex
                justify="flex-start"
                align="flex-start"
                radius={24}
                px={16}
                py={16}
                style={style}>
                <BaseView
                    orientation="row"
                    justify="space-between"
                    align="center"
                    w={100}>
                    <BaseView orientation="row" align="center">
                        <AccountIcon account={account} />
                        <BaseView px={8}>
                            <BaseText
                                typographyFont="buttonPrimary"
                                color={theme.colors.tertiary}>
                                {account.alias}
                            </BaseText>
                            <AddressButton address={account.address} />
                        </BaseView>
                    </BaseView>
                    <BaseIcon
                        name="settings-outline"
                        color={theme.colors.tertiary}
                        size={24}
                    />
                </BaseView>
                <BaseSpacer height={18} />
                <Balance balance={CryptoUtils.random(10000).toString()} />
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
