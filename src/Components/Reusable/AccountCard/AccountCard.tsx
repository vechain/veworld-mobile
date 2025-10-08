import React, { memo, useMemo } from "react"
import { StyleProp, StyleSheet, ViewProps, ViewStyle } from "react-native"
import {
    AccountIcon,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    LedgerBadge,
    WatchedAccountBadge,
} from "~Components"
import { ColorThemeType, VET, VTHO } from "~Constants"
import { useThemedStyles, useVns } from "~Hooks"
import { useSimplifiedTokenBalance } from "~Hooks/useTokenBalance"
import { AccountWithDevice, DEVICE_TYPE, WatchedAccount } from "~Model"
import { AccountUtils, AddressUtils, BigNutils } from "~Utils"

type Props = {
    account: AccountWithDevice | WatchedAccount
    onPress?: (account: AccountWithDevice | WatchedAccount) => void
    selected?: boolean
    containerStyle?: StyleProp<ViewStyle>
    showOpacityWhenDisabled?: boolean
    showSelectAccountIcon?: boolean
    isVthoBalance?: boolean
    isBalanceVisible?: boolean
    formattedBalance?: string
} & ViewProps

export const AccountCard: React.FC<Props> = memo(
    ({
        account,
        onPress,
        selected,
        containerStyle,
        showOpacityWhenDisabled = true,
        showSelectAccountIcon = false,
        isVthoBalance = false,
        isBalanceVisible = true,
        formattedBalance,
        testID,
    }: Props) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const { data: vetBalance } = useSimplifiedTokenBalance({
            tokenAddress: VET.address,
            address: account.address,
        })
        const { data: vthoBalance } = useSimplifiedTokenBalance({
            tokenAddress: VTHO.address,
            address: account.address,
        })
        const { name: vnsName, address: vnsAddress } = useVns({
            name: "",
            address: account.address,
        })

        const balance = useMemo(() => {
            if (!isBalanceVisible && isVthoBalance) {
                return "•••• " + VTHO.symbol
            }

            if (!isBalanceVisible && !isVthoBalance) {
                return "•••• " + VET.symbol
            }

            const computedVetBalance = formattedBalance ? formattedBalance : vetBalance

            return `${
                isVthoBalance
                    ? BigNutils(vthoBalance).toHuman(VET.decimals).toTokenFormat_string(2)
                    : BigNutils(computedVetBalance).toHuman(VET.decimals).toTokenFormat_string(2)
            } ${isVthoBalance ? VTHO.symbol : VET.symbol}`
        }, [isBalanceVisible, isVthoBalance, vetBalance, vthoBalance, formattedBalance])

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
            <BaseView w={100} flexDirection="row" style={containerStyle}>
                <BaseTouchableBox
                    testID={testID}
                    haptics="Light"
                    disabled={!onPress}
                    action={() => onPress?.(account)}
                    justifyContent="space-between"
                    showOpacityWhenDisabled={showOpacityWhenDisabled}
                    containerStyle={[styles.container, selected ? styles.selectedContainer : {}]}>
                    <BaseView flexDirection="row" flex={1} pr={10}>
                        <AccountIcon account={account} />
                        <BaseSpacer width={12} />
                        <BaseView flex={1}>
                            <BaseText ellipsizeMode="tail" numberOfLines={1}>
                                {account.alias}
                            </BaseText>
                            <BaseView flexDirection="row" mt={3}>
                                {accountWithDevice?.device?.type === DEVICE_TYPE.LEDGER && <LedgerBadge mr={8} />}
                                {watchedAccount?.type === DEVICE_TYPE.LOCAL_WATCHED && <WatchedAccountBadge />}
                                <BaseView flex={1}>
                                    <BaseText style={styles.wallet} ellipsizeMode="tail" numberOfLines={1}>
                                        {accountWithDevice?.device.alias}
                                    </BaseText>
                                </BaseView>
                            </BaseView>
                        </BaseView>
                    </BaseView>
                    {showSelectAccountIcon ? (
                        <BaseView style={styles.rightSubContainer}>
                            <BaseIcon color={theme.colors.text} size={24} name="icon-chevron-right" />
                        </BaseView>
                    ) : (
                        <BaseView style={styles.rightSubContainer}>
                            <BaseText style={styles.address} fontSize={10}>
                                {vnsName || AddressUtils.humanAddress(vnsAddress || account.address)}
                            </BaseText>

                            <BaseSpacer height={4} />
                            <BaseText fontSize={10}>{balance}</BaseText>
                        </BaseView>
                    )}
                </BaseTouchableBox>
            </BaseView>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        wallet: {
            opacity: 0.7,
        },
        address: {
            opacity: 0.7,
        },
        container: {
            flex: 1,
        },
        selectedContainer: {
            borderWidth: 1,
            borderRadius: 16,
            borderColor: theme.colors.text,
        },
        rightSubContainer: {
            flexDirection: "column",
            alignItems: "flex-end",
        },
        eyeIcon: { marginLeft: 16, flex: 0.1 },
    })
