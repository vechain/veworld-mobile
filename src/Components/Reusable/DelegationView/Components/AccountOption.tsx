import { default as React, ReactNode, useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { DelegateAccountCardRadio } from "~Components/Reusable/DelegateAccountCard"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, LocalAccountWithDevice, WatchedAccount } from "~Model"
import { Option } from "./Option"

type Props = {
    selectedDelegationAccount?: LocalAccountWithDevice
    children: (args: { onCancel: () => void; selectedAccount: LocalAccountWithDevice | undefined }) => ReactNode
    accounts: LocalAccountWithDevice[]
}

const ItemSeparatorComponent = () => <BaseSpacer height={8} />

const AccountEmptyOption = () => {
    const { LL } = useI18nContext()
    const { theme, styles } = useThemedStyles(baseStyles)
    return (
        <BaseView p={24} gap={24} flexDirection="column" alignItems="center">
            <BaseIcon
                size={32}
                name="icon-info"
                bg={theme.colors.emptyStateIcon.background}
                style={styles.emptyState}
                color={theme.colors.emptyStateIcon.foreground}
            />
            <BaseText typographyFont="body" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_600} align="center">
                {LL.NO_ACCOUNTS_VTHO()}
            </BaseText>
        </BaseView>
    )
}

export const AccountOption = ({ selectedDelegationAccount, children, accounts }: Props) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)

    const [selectedAccount, setSelectedAccount] = useState(selectedDelegationAccount)

    const handlePress = useCallback((account: AccountWithDevice | WatchedAccount) => {
        setSelectedAccount(account as LocalAccountWithDevice)
    }, [])

    const onCancel = useCallback(() => {
        setSelectedAccount(selectedDelegationAccount)
    }, [selectedDelegationAccount])

    const { label, style } = useMemo(() => {
        if (accounts.length === 0) return {}
        return { label: LL.DELEGATE_ACCOUNT(), style: styles.list }
    }, [LL, accounts.length, styles.list])

    return (
        <>
            <Option label={label} style={style}>
                {accounts.length === 0 ? (
                    <AccountEmptyOption />
                ) : (
                    <FlatList
                        data={accounts}
                        keyExtractor={account => account.address}
                        ItemSeparatorComponent={ItemSeparatorComponent}
                        renderItem={({ item }) => {
                            return (
                                <DelegateAccountCardRadio
                                    testID={"DELEGATE_ACCOUNT_CARD_RADIO"}
                                    account={item}
                                    onPress={handlePress}
                                    selected={item.address === selectedAccount?.address}
                                />
                            )
                        }}
                        // {...flatListProps}
                    />
                )}
            </Option>
            {children({ onCancel, selectedAccount })}
        </>
    )
}

export const baseStyles = () =>
    StyleSheet.create({
        list: {
            flex: 1,
            flexBasis: 160,
        },
        emptyState: {
            padding: 16,
        },
    })
