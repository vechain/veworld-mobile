import React, { memo } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import { ColorThemeType, VET, useThemedStyles } from "~Common"
import { FormattingUtils } from "~Utils"
import {
    AccountIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { AccountWithDevice } from "~Model"
import {
    selectVetTokenWithBalanceByAccount,
    useAppSelector,
} from "~Storage/Redux"
import { BigNumber } from "bignumber.js"

type Props = {
    account: AccountWithDevice
    onPress?: (account: AccountWithDevice) => void
    selected?: boolean
    containerStyle?: StyleProp<ViewStyle>
}
export const AccountCard: React.FC<Props> = memo(
    ({ account, onPress, selected, containerStyle }: Props) => {
        const { styles } = useThemedStyles(baseStyles)
        const vetTokenWithBalance = useAppSelector(
            selectVetTokenWithBalanceByAccount(account.address),
        )
        const vetBalance = new BigNumber(
            FormattingUtils.convertToFiatBalance(
                vetTokenWithBalance?.balance.balance || "0",
                1,
                VET.decimals,
            ),
        ).toString()
        return (
            <BaseView w={100} flexDirection="row" style={containerStyle}>
                <BaseTouchableBox
                    action={() => onPress?.(account)}
                    justifyContent="space-between"
                    containerStyle={[
                        styles.container,
                        selected ? styles.selectedContainer : {},
                    ]}>
                    <BaseView flexDirection="row">
                        <AccountIcon address={account.address} />
                        <BaseSpacer width={12} />
                        <BaseView>
                            <BaseText>{account.alias}</BaseText>
                            <BaseText style={styles.wallet}>
                                {account.device.alias}
                            </BaseText>
                        </BaseView>
                    </BaseView>
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
                            {vetBalance} {vetTokenWithBalance.symbol}
                        </BaseText>
                    </BaseView>
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
