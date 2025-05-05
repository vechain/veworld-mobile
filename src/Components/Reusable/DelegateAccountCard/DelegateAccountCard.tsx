import React, { memo, useMemo } from "react"
import { StyleProp, StyleSheet, ViewProps, ViewStyle } from "react-native"
import { AccountIcon, BaseText, BaseTouchableBox, BaseView, LedgerBadge } from "~Components"
import { ColorThemeType, VET, VTHO } from "~Constants"
import { useThemedStyles, useVns } from "~Hooks"
import { AccountWithDevice, DEVICE_TYPE } from "~Model"
import { selectBalanceVisible, selectVthoBalanceByAccount, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"

type Props = {
    account: AccountWithDevice
    onPress?: (account: AccountWithDevice) => void
    selected?: boolean
    containerStyle?: StyleProp<ViewStyle>
} & Pick<ViewProps, "testID" | "children">

export const DelegateAccountCard = memo(({ account, onPress, selected, containerStyle, testID, children }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const vthoBalance = useAppSelector(state => selectVthoBalanceByAccount(state, account.address))
    const isBalanceVisible = useAppSelector(selectBalanceVisible)
    const { name: vnsName, address: vnsAddress } = useVns({
        name: "",
        address: account.address,
    })

    const balance = useMemo(() => {
        if (!isBalanceVisible) {
            return "••••"
        }

        return BigNutils(vthoBalance).toHuman(VET.decimals).toTokenFormat_string(2)
    }, [isBalanceVisible, vthoBalance])

    return (
        <BaseView w={100} flexDirection="row" style={containerStyle}>
            <BaseTouchableBox
                testID={testID}
                haptics="Light"
                action={() => onPress?.(account)}
                justifyContent="space-between"
                containerStyle={[styles.container, selected ? styles.selectedContainer : {}]}
                accessibilityValue={{ text: selected ? "selected" : "not selected" }}>
                <BaseView flexDirection="row" gap={12} alignItems="center" flex={1}>
                    <AccountIcon address={account.address} size={32} />
                    <BaseView flexDirection="column" gap={4}>
                        <BaseText numberOfLines={1} color={theme.colors.title} typographyFont="captionBold">
                            {vnsName || account.alias}
                        </BaseText>
                        <BaseView flexDirection="row" gap={8}>
                            {account?.device?.type === DEVICE_TYPE.LEDGER && <LedgerBadge mr={8} />}
                            <BaseText typographyFont="captionMedium" color={theme.colors.textLight}>
                                {AddressUtils.humanAddress(vnsAddress || account.address)}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                </BaseView>
                <BaseView flexDirection="column">
                    <BaseText color={theme.colors.subtitle} typographyFont="captionMedium" align="right">
                        {balance}
                    </BaseText>
                    <BaseText color={theme.colors.textLight} typographyFont="captionMedium" align="right">
                        {VTHO.symbol}
                    </BaseText>
                </BaseView>
                {children}
            </BaseTouchableBox>
        </BaseView>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flex: 1,
            alignItems: "center",
            flexDirection: "row",
        },
        selectedContainer: {
            borderWidth: 1,
            borderRadius: 16,
            borderColor: theme.colors.text,
        },
    })
