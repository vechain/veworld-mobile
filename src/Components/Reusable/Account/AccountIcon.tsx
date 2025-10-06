import React, { memo } from "react"
import { StyleSheet, ViewProps } from "react-native"
import { SvgXml } from "react-native-svg"
import { NewLedgerLogo } from "~Assets"
import { BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { Device, DEVICE_TYPE } from "~Model"
import { PicassoUtils } from "~Utils"

type AccountIconProps = {
    account: {
        type?: DEVICE_TYPE
        device?: Device
        address: string
    }
    size?: number
    borderRadius?: number
}

export const AccountIcon: React.FC<AccountIconProps> = memo(({ account, size, borderRadius }) => {
    const { theme, styles } = useThemedStyles(accountIconStyles)
    return (
        <BaseView style={styles.container}>
            <PicassoAddressIcon address={account.address} size={size} borderRadius={borderRadius} />
            {(account.type === DEVICE_TYPE.LEDGER || account.device?.type === DEVICE_TYPE.LEDGER) && (
                <BaseView borderRadius={99} p={4} bg="black" style={styles.ledger}>
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
