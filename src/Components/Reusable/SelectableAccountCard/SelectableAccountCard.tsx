import { memo, default as React, useMemo } from "react"
import { StyleProp, StyleSheet, ViewProps, ViewStyle } from "react-native"
import { AccountIcon, BaseText, BaseTouchableBox, BaseView, LedgerBadge } from "~Components"
import { COLORS, ColorThemeType, VET } from "~Constants"
import { useThemedStyles, useVns } from "~Hooks"
import { AccountWithDevice, DEVICE_TYPE } from "~Model"
import {
    selectBalanceVisible,
    selectVetBalanceByAccount,
    selectVthoBalanceByAccount,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"

type Props = {
    account: AccountWithDevice
    onPress?: (account: AccountWithDevice) => void
    selected?: boolean
    containerStyle?: StyleProp<ViewStyle>
    balanceToken?: "VTHO" | "VET"
} & Pick<ViewProps, "testID" | "children">

export const SelectableAccountCard = memo(
    ({ account, onPress, selected, containerStyle, testID, children, balanceToken = "VET" }: Props) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const vetBalance = useAppSelector(state => selectVetBalanceByAccount(state, account.address))
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

            return BigNutils(balanceToken === "VET" ? vetBalance : vthoBalance)
                .toHuman(VET.decimals)
                .toTokenFormat_string(2)
        }, [balanceToken, isBalanceVisible, vetBalance, vthoBalance])

        return (
            <BaseView w={100} flexDirection="row" style={containerStyle}>
                <BaseTouchableBox
                    testID={testID}
                    haptics="Light"
                    action={() => onPress?.(account)}
                    justifyContent="space-between"
                    containerStyle={[styles.container, selected ? styles.selectedContainer : {}, containerStyle]}
                    innerContainerStyle={styles.innerTouchable}
                    accessibilityValue={{ text: selected ? "selected" : "not selected" }}
                    px={16}
                    py={16}>
                    <BaseView flexDirection="row" gap={12} alignItems="center" flex={1}>
                        <AccountIcon address={account.address} size={40} />
                        <BaseView flexDirection="column" gap={4}>
                            <BaseText numberOfLines={1} color={theme.colors.title} typographyFont="bodySemiBold">
                                {account.alias}
                            </BaseText>
                            <BaseView flexDirection="row" gap={8}>
                                {account?.device?.type === DEVICE_TYPE.LEDGER && <LedgerBadge mr={8} />}
                                <BaseText
                                    typographyFont="captionRegular"
                                    color={theme.isDark ? COLORS.GREY_100 : theme.colors.textLight}>
                                    {vnsName || AddressUtils.humanAddress(vnsAddress || account.address)}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    </BaseView>
                    <BaseView flexDirection="column">
                        <BaseText
                            color={theme.isDark ? COLORS.GREY_100 : theme.colors.subtitle}
                            typographyFont="bodySemiBold"
                            align="right">
                            {balance}
                        </BaseText>
                        <BaseText color={theme.colors.textLight} typographyFont="captionRegular" align="right">
                            {balanceToken}
                        </BaseText>
                    </BaseView>
                    {children}
                </BaseTouchableBox>
            </BaseView>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flex: 1,
            alignItems: "center",
            flexDirection: "row",
            borderRadius: 8,
            borderWidth: 2,
            borderColor: theme.colors.transparent,
        },
        selectedContainer: {
            borderColor: theme.colors.text,
        },
        innerTouchable: {
            borderRadius: 8,
        },
    })
