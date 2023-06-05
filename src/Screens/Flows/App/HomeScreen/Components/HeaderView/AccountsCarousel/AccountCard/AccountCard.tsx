import React, { memo, useCallback } from "react"
import { StyleProp, ViewStyle, ViewProps, StyleSheet } from "react-native"
import Animated, { AnimateProps } from "react-native-reanimated"
import {
    ColorThemeType,
    useTheme,
    useThemedStyles,
    CURRENCY,
    valueToHP,
} from "~Common"
import { PlatformUtils } from "~Utils"
import {
    AccountIcon,
    AddressButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { WalletAccount } from "~Model"
import { useAppDispatch } from "~Storage/Redux"
import { setBalanceVisible } from "~Storage/Redux/Actions"
import { Balance } from "./Balance"

interface Props extends AnimateProps<ViewProps> {
    style?: StyleProp<ViewStyle>
    account: WalletAccount
    openAccountManagement: () => void
    balanceVisible: boolean
    selectedCurrency: CURRENCY
}

export const AccountCard: React.FC<Props> = memo(props => {
    const {
        style,
        account,
        openAccountManagement,
        balanceVisible,
        ...animatedViewProps
    } = props
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)

    const dispatch = useAppDispatch()

    const toggleBalanceVisibility = useCallback(() => {
        dispatch(setBalanceVisible(!balanceVisible))
    }, [balanceVisible, dispatch])

    return (
        <Animated.View style={styles.container} {...animatedViewProps}>
            <BaseView
                bg={theme.colors.primary}
                flex={1}
                justifyContent="space-between"
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
                    <BaseView flexDirection="row">
                        <AccountIcon address={account.address} />
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
                        testID="AccountCard_accountManagementButton"
                    />
                </BaseView>
                <BaseSpacer height={PlatformUtils.isIOS() ? 18 : 10} />
                <Balance
                    account={account}
                    isVisible={balanceVisible}
                    toggleVisible={toggleBalanceVisibility}
                />
            </BaseView>
        </Animated.View>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            height: valueToHP[190] < 170 ? 170 : valueToHP[190],
        },
        itemContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.primary,
            borderRadius: 24,
        },
    })
