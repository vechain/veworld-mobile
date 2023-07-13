import React, { memo } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType, VET } from "~Constants"
import { FormattingUtils } from "~Utils"
import {
    AccountIcon,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    LedgerBadge,
} from "~Components"
import { AccountWithDevice, DEVICE_TYPE } from "~Model"
import { selectVetBalanceByAccount, useAppSelector } from "~Storage/Redux"

type Props = {
    account: AccountWithDevice
    onPress?: (account: AccountWithDevice) => void
    selected?: boolean
    containerStyle?: StyleProp<ViewStyle>
    showOpacityWhenDisabled?: boolean
    showSelectAccountIcon?: boolean
}
export const AccountCard: React.FC<Props> = memo(
    ({
        account,
        onPress,
        selected,
        containerStyle,
        showOpacityWhenDisabled = true,
        showSelectAccountIcon = false,
    }: Props) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const vetBalance = useAppSelector(state =>
            selectVetBalanceByAccount(state, account.address),
        )

        return (
            <BaseView w={100} flexDirection="row" style={containerStyle}>
                <BaseTouchableBox
                    disabled={!onPress}
                    action={() => onPress?.(account)}
                    justifyContent="space-between"
                    showOpacityWhenDisabled={showOpacityWhenDisabled}
                    containerStyle={[
                        styles.container,
                        selected ? styles.selectedContainer : {},
                    ]}>
                    <BaseView flexDirection="row">
                        <AccountIcon address={account.address} />
                        <BaseSpacer width={12} />
                        <BaseView>
                            <BaseText>{account.alias}</BaseText>
                            <BaseView flexDirection="row" mt={3}>
                                {account.device?.type ===
                                    DEVICE_TYPE.LEDGER && (
                                    <LedgerBadge
                                        //eslint-disable-next-line react-native/no-inline-styles
                                        containerStyle={{ mr: 8 }}
                                    />
                                )}
                                <BaseText style={styles.wallet}>
                                    {account.device.alias}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    </BaseView>
                    {showSelectAccountIcon ? (
                        <BaseView style={styles.rightSubContainer}>
                            <BaseIcon
                                color={theme.colors.text}
                                size={24}
                                name={"chevron-right"}
                            />
                        </BaseView>
                    ) : (
                        <BaseView style={styles.rightSubContainer}>
                            <BaseText style={styles.address} fontSize={10}>
                                {FormattingUtils.humanAddress(
                                    account.address,
                                    4,
                                    6,
                                )}
                            </BaseText>
                            <BaseSpacer height={4} />
                            <BaseText fontSize={10}>
                                {vetBalance} {VET.symbol}
                            </BaseText>
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
