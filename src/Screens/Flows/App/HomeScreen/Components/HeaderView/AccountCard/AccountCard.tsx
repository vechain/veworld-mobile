import React, { memo, useCallback } from "react"
import { ViewProps, StyleSheet } from "react-native"
import { CURRENCY, ColorThemeType, useThemedStyles } from "~Common"
import { PlatformUtils } from "~Utils"
import {
    AccountIcon,
    AddressButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    LedgerBadge,
} from "~Components"
import { AccountWithDevice, DEVICE_TYPE } from "~Model"
import { useAppDispatch } from "~Storage/Redux"
import { setBalanceVisible } from "~Storage/Redux/Actions"
import { Balance } from "./Balance"
import { COLORS } from "~Common/Theme"

interface Props extends ViewProps {
    account: AccountWithDevice
    openAccountManagement: () => void
    openSelectAccountBottomSheet: () => void
    balanceVisible: boolean
    selectedCurrency: CURRENCY
}

export const AccountCard: React.FC<Props> = memo(props => {
    const {
        account,
        openAccountManagement,
        openSelectAccountBottomSheet,
        balanceVisible,
    } = props

    const dispatch = useAppDispatch()

    const { styles, theme } = useThemedStyles(baseStyles)

    const toggleBalanceVisibility = useCallback(() => {
        dispatch(setBalanceVisible(!balanceVisible))
    }, [balanceVisible, dispatch])

    return (
        <BaseView px={20} w={100} flexDirection="row">
            <BaseView
                bg={theme.colors.primary}
                borderRadius={24}
                flexDirection="row"
                w={100}>
                <BaseView
                    flex={1}
                    py={16}
                    px={16}
                    justifyContent="space-between"
                    alignItems="flex-start"
                    style={styles.borderRight}>
                    <BaseView flexDirection="row">
                        <BaseView flexDirection="row">
                            <AccountIcon address={account.address} size={60} />
                            <BaseView px={8} alignItems="flex-start">
                                <BaseText
                                    typographyFont="buttonPrimary"
                                    color={theme.colors.textReversed}>
                                    {account.alias}
                                </BaseText>
                                <BaseSpacer height={4} />
                                <BaseView flexDirection="row">
                                    {account.device?.type ===
                                        DEVICE_TYPE.LEDGER && (
                                        <LedgerBadge
                                            containerStyle={
                                                styles.ledgerBadgeContainer
                                            }
                                            logoStyle={{
                                                color: theme.colors.text,
                                            }}
                                        />
                                    )}
                                    <BaseText
                                        typographyFont="captionMedium"
                                        color={theme.colors.textReversed}>
                                        {account.device?.alias}
                                    </BaseText>
                                </BaseView>

                                <BaseSpacer height={8} />
                                <AddressButton address={account.address} />
                            </BaseView>
                        </BaseView>
                    </BaseView>
                    <BaseSpacer height={PlatformUtils.isIOS() ? 18 : 10} />
                    <Balance
                        account={account}
                        isVisible={balanceVisible}
                        toggleVisible={toggleBalanceVisibility}
                    />
                </BaseView>
                <BaseView>
                    <BaseView
                        style={styles.borderBottom}
                        px={14}
                        justifyContent="center"
                        alignItems="center"
                        flex={1}>
                        <BaseIcon
                            name="account-cog-outline"
                            color={theme.colors.textReversed}
                            size={28}
                            action={openAccountManagement}
                            testID="AccountCard_accountManagementButton"
                        />
                    </BaseView>
                    <BaseView
                        justifyContent="center"
                        alignItems="center"
                        flex={1}>
                        <BaseIcon
                            name="account-sync-outline"
                            color={theme.colors.textReversed}
                            size={28}
                            action={openSelectAccountBottomSheet}
                        />
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseView>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {},
        borderRight: {
            borderRightColor: COLORS.WHITE,
            borderRightWidth: 1,
        },
        ledgerBadgeContainer: {
            marginRight: 8,
            bg: theme.colors.textReversed,
        },
        borderBottom: {
            borderBottomColor: COLORS.WHITE,
            borderBottomWidth: 1,
        },
    })
