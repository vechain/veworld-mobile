import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { NewLedgerLogo } from "~Assets"
import { BaseIcon, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useSmartWallet, useThemedStyles } from "~Hooks"
import { Device, DEVICE_TYPE, IconKey, WalletAccount } from "~Model"
import { AccountPfp } from "./AccountPfp"

type AccountIconProps = {
    account: {
        type?: DEVICE_TYPE
        device?: Device
        address: string
        profileImage?: WalletAccount["profileImage"]
    }
    size?: number
    borderRadius?: number
    /**
     * Hide the new Ledger Badge
     * @default false
     */
    hideLedger?: boolean
    /**
     * Hide the new Social Badge
     * @default false
     */
    hideSocialBadge?: boolean
}

export const AccountIcon: React.FC<AccountIconProps> = memo(
    ({ account, size, borderRadius, hideLedger, hideSocialBadge }) => {
        const { theme, styles } = useThemedStyles(accountIconStyles)

        const { linkedAccounts } = useSmartWallet()

        const showLedger = useMemo(() => {
            if (hideLedger) return false
            if (account.type === DEVICE_TYPE.LEDGER) return true
            if (account.device?.type === DEVICE_TYPE.LEDGER) return true
            return false
        }, [account.device?.type, account.type, hideLedger])

        const showSocialBadge = useMemo(() => {
            if (hideSocialBadge) return false
            if (account.device?.type === DEVICE_TYPE.SMART_WALLET) return true
            return false
        }, [account.device?.type, hideSocialBadge])

        const socialBadgeIcon = useMemo(() => {
            if (linkedAccounts.length === 0) return null
            if (linkedAccounts[0].type === "google") return "icon-google" as IconKey
            if (linkedAccounts[0].type === "apple") return "icon-apple" as IconKey
            return null
        }, [linkedAccounts])

        return (
            <BaseView style={styles.container}>
                <AccountPfp account={account} size={size} borderRadius={borderRadius} />

                {showLedger && (
                    <BaseView borderRadius={99} p={4} style={styles.badgeContainer}>
                        <NewLedgerLogo width={8} height={8} color={theme.isDark ? COLORS.GREY_700 : COLORS.WHITE} />
                    </BaseView>
                )}

                {showSocialBadge && socialBadgeIcon && (
                    <BaseView borderRadius={99} p={4} style={styles.badgeContainer}>
                        <BaseIcon
                            name={socialBadgeIcon}
                            size={10}
                            color={theme.isDark ? COLORS.GREY_700 : COLORS.WHITE}
                        />
                    </BaseView>
                )}
            </BaseView>
        )
    },
)

const accountIconStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: { position: "relative" },
        badgeContainer: {
            position: "absolute",
            bottom: -2,
            right: -2,
            zIndex: 1,
            backgroundColor: theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700,
        },
    })
