import React, { memo } from "react"
import { StyleSheet } from "react-native"
import { ColorThemeType, FormattingUtils, useThemedStyles } from "~Common"
import {
    AccountIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { AccountWithDevice } from "~Model"

type Props = {
    account: AccountWithDevice
    onPress?: (account: AccountWithDevice) => void
    selected?: boolean
}
export const AccountCard: React.FC<Props> = memo(
    ({ account, onPress, selected }) => {
        const { styles } = useThemedStyles(baseStyles)
        return (
            <BaseView w={100} flexDirection="row">
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
                        {/** TODO: change with a real budget */}
                        {/* eslint-disable-next-line i18next/no-literal-string  */}
                        <BaseText fontSize={10}>1.2235 VET</BaseText>
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
