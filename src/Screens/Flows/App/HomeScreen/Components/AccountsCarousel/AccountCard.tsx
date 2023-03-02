import React, { memo } from "react"
import { StyleProp, ViewStyle, ViewProps, StyleSheet } from "react-native"
import type { AnimateProps } from "react-native-reanimated"
import Animated from "react-native-reanimated"
import {
    ColorThemeType,
    FormattingUtils,
    useTheme,
    useThemedStyles,
} from "~Common"
import {
    AccountIcon,
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { Account } from "~Storage"

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
                            <BaseButton
                                my={8}
                                textColor={
                                    theme.isDark
                                        ? theme.colors.text
                                        : theme.colors.card
                                }
                                size="sm"
                                bgColor={theme.colors.primaryReversed}
                                title={FormattingUtils.humanAddress(
                                    account.address,
                                    5,
                                    4,
                                )}
                                action={() => {}}
                                rightIcon={
                                    <BaseIcon
                                        name="copy-outline"
                                        color={
                                            theme.isDark
                                                ? theme.colors.text
                                                : theme.colors.card
                                        }
                                        size={12}
                                    />
                                }
                            />
                        </BaseView>
                    </BaseView>
                    <BaseIcon
                        name="settings-outline"
                        color={theme.colors.tertiary}
                        size={24}
                    />
                </BaseView>
                <BaseSpacer height={18} />
                <BaseView orientation="row" align="center">
                    <BaseText
                        color={theme.colors.tertiary}
                        typographyFont="body">
                        Your balance
                    </BaseText>
                    <BaseIcon
                        name="eye-off-outline"
                        color={theme.colors.tertiary}
                        size={18}
                    />
                </BaseView>
                <BaseView orientation="row" align="flex-end">
                    <BaseText
                        color={theme.colors.tertiary}
                        typographyFont="hugeTitle">
                        1.532,
                    </BaseText>
                    <BaseText
                        color={theme.colors.tertiary}
                        typographyFont="biggerTitle">
                        32
                    </BaseText>
                    <BaseText
                        mx={4}
                        color={theme.colors.tertiary}
                        typographyFont="body">
                        USD
                    </BaseText>
                </BaseView>
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
