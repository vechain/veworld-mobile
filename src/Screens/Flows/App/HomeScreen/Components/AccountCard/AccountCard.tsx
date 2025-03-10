import React, { memo, useCallback, useMemo } from "react"
import { ViewProps, StyleSheet } from "react-native"
import { CURRENCY, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { AccountUtils } from "~Utils"
import { AccountIcon, BaseSpacer, BaseText, BaseView, LedgerBadge, WatchedAccountBadge } from "~Components"
import { AccountWithDevice, DEVICE_TYPE, WatchedAccount } from "~Model"
import { useAppDispatch } from "~Storage/Redux"
import { setBalanceVisible } from "~Storage/Redux/Actions"
import { Balance } from "./Balance"
import { AccountAddressButtonPill } from "./AccountAddressButtonPill"

interface Props extends ViewProps {
    account: AccountWithDevice
    openSelectAccountBottomSheet: () => void
    balanceVisible: boolean
    selectedCurrency: CURRENCY
    openQRCodeSheet: () => void
}

export const AccountCard: React.FC<Props> = memo(props => {
    const { account, openSelectAccountBottomSheet, balanceVisible, openQRCodeSheet } = props

    const dispatch = useAppDispatch()

    const { styles, theme } = useThemedStyles(baseStyles)

    const toggleBalanceVisibility = useCallback(() => {
        dispatch(setBalanceVisible(!balanceVisible))
    }, [balanceVisible, dispatch])

    const accountWithDevice = useMemo(() => {
        if (!AccountUtils.isObservedAccount(account)) {
            return account as AccountWithDevice
        }
    }, [account])

    const watchedAccount = useMemo(() => {
        if (AccountUtils.isObservedAccount(account)) {
            return account as WatchedAccount
        }
    }, [account])

    return (
        <BaseView w={100} flexDirection="row">
            <BaseView
                bg={theme.colors.accountCard}
                borderRadius={12}
                flexDirection="column"
                justifyContent="space-between"
                w={100}
                flex={1}
                py={20}
                px={20}
                style={styles.container}>
                <BaseView flexDirection="row" justifyContent="space-between" alignItems="center">
                    <BaseView flexDirection="row" alignItems="center" flex={1}>
                        <AccountIcon address={account.address} size={45} />
                        <BaseView px={8} alignItems="flex-start" flex={1}>
                            <BaseText
                                ellipsizeMode="tail"
                                numberOfLines={1}
                                typographyFont="buttonPrimary"
                                color={theme.colors.textReversed}>
                                {account.alias}
                            </BaseText>
                            <BaseSpacer height={6} />
                            <BaseView flexDirection="row">
                                {accountWithDevice?.device?.type === DEVICE_TYPE.LEDGER && (
                                    <LedgerBadge
                                        bg={theme.colors.textReversed}
                                        mr={8}
                                        logoStyle={{
                                            color: theme.colors.text,
                                        }}
                                    />
                                )}

                                {watchedAccount?.type === DEVICE_TYPE.LOCAL_WATCHED && (
                                    <WatchedAccountBadge bg={theme.colors.background} textColor={theme.colors.text} />
                                )}

                                <BaseView flex={1}>
                                    <BaseText
                                        ellipsizeMode="tail"
                                        numberOfLines={1}
                                        typographyFont="captionMedium"
                                        color={theme.colors.textReversed}>
                                        {account.device?.alias}
                                    </BaseText>
                                </BaseView>
                            </BaseView>
                        </BaseView>
                    </BaseView>
                    <AccountAddressButtonPill
                        text={account.address}
                        openQRCodeSheet={openQRCodeSheet}
                        switchAccount={openSelectAccountBottomSheet}
                    />
                </BaseView>
                <Balance account={account} isVisible={balanceVisible} toggleVisible={toggleBalanceVisibility} />
            </BaseView>
        </BaseView>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            height: 162,
        },
        borderBottom: {
            borderBottomColor: theme.colors.info,
            borderBottomWidth: 1,
        },
    })
