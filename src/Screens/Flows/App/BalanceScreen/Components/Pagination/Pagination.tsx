import React, { useCallback, useMemo } from "react"
import { Pressable, StyleSheet } from "react-native"
import { BaseSpacer, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useSetSelectedAccount, useThemedStyles } from "~Hooks"
import { AccountWithDevice } from "~Model"
import { selectSelectedAccount, selectVisibleAccounts, useAppSelector } from "~Storage/Redux"
import { AccountUtils, AddressUtils } from "~Utils"

export const Pagination = () => {
    const { styles } = useThemedStyles(baseStyles)
    const accounts = useAppSelector(selectVisibleAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const scrollableAccounts = useMemo(() => {
        if (AccountUtils.isObservedAccount(selectedAccount)) return accounts.filter(AccountUtils.isObservedAccount)
        return accounts.filter(account =>
            AddressUtils.compareAddresses(account.rootAddress, selectedAccount.rootAddress),
        )
    }, [accounts, selectedAccount])

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const onPress = useCallback(
        (account: AccountWithDevice) => {
            onSetSelectedAccount({ address: account.address })
        },
        [onSetSelectedAccount],
    )

    if (scrollableAccounts.length === 0) return <BaseSpacer height={24} />

    return (
        <BaseView alignSelf="center" flexDirection="row" gap={4} style={styles.root}>
            {scrollableAccounts.map(account => (
                <Pressable onPress={() => onPress(account)}>
                    <BaseView
                        style={[
                            styles.dot,
                            AddressUtils.compareAddresses(selectedAccount.address, account.address) && styles.activeDot,
                        ]}
                    />
                </Pressable>
            ))}
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        dot: {
            width: 4,
            height: 4,
            backgroundColor: COLORS.DARK_PURPLE_DISABLED,
            borderRadius: 99,
        },
        activeDot: {
            backgroundColor: COLORS.PURPLE_LABEL,
        },
        root: {
            height: 24,
            justifyContent: "flex-start",
        },
    })
