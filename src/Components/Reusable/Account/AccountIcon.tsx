import React, { memo, useMemo } from "react"
import { Image, StyleSheet, ViewProps } from "react-native"
import { SvgXml } from "react-native-svg"
import { NewLedgerLogo } from "~Assets"
import { BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { Device, DEVICE_TYPE, WalletAccount } from "~Model"
import { PicassoUtils } from "~Utils"

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
}

export const AccountIcon: React.FC<AccountIconProps> = memo(({ account, size, borderRadius, hideLedger }) => {
    const { theme, styles } = useThemedStyles(accountIconStyles)

    const showLedger = useMemo(() => {
        if (hideLedger) return false
        if (account.type === DEVICE_TYPE.LEDGER) return true
        if (account.device?.type === DEVICE_TYPE.LEDGER) return true
        return false
    }, [account.device?.type, account.type, hideLedger])

    return (
        <BaseView style={styles.container}>
            {account.profileImage ? (
                <AccountPfp uri={account.profileImage.uri} size={size} borderRadius={borderRadius} />
            ) : (
                <PicassoAddressIcon address={account.address} size={size} borderRadius={borderRadius} />
            )}

            {showLedger && (
                <BaseView borderRadius={99} p={4} style={styles.ledger}>
                    <NewLedgerLogo width={8} height={8} color={theme.isDark ? COLORS.GREY_700 : COLORS.WHITE} />
                </BaseView>
            )}
        </BaseView>
    )
})

type PicassoAddressIconProps = {
    address: string
    size?: number
    borderRadius?: number
} & ViewProps

export const PicassoAddressIcon: React.FC<PicassoAddressIconProps> = memo(
    ({ address, size = 50, borderRadius = 99, style, ...otherProps }) => {
        const uri = PicassoUtils.getPicassoImgSrc(address).toString()

        return (
            <BaseView borderRadius={borderRadius} {...otherProps} style={[picassoIconStyles.view, style]}>
                <SvgXml xml={uri} width={size} height={size} />
            </BaseView>
        )
    },
)

const picassoIconStyles = StyleSheet.create({
    view: { overflow: "hidden" },
})

type AccountPfpProps = {
    uri: string
    size?: number
    borderRadius?: number
} & ViewProps

const AccountPfp: React.FC<AccountPfpProps> = memo(({ uri, size = 50, borderRadius = 99, style, ...otherProps }) => {
    return (
        <BaseView borderRadius={borderRadius} {...otherProps} style={[picassoIconStyles.view, style]}>
            <Image source={{ uri }} width={size} height={size} resizeMethod="scale" />
        </BaseView>
    )
})

const accountIconStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: { position: "relative" },
        ledger: {
            position: "absolute",
            bottom: -2,
            right: -2,
            zIndex: 1,
            backgroundColor: theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700,
        },
    })
