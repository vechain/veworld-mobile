import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { default as React, ReactNode, useCallback, useState } from "react"
import { StyleSheet } from "react-native"
import { BaseSpacer } from "~Components/Base"
import { DelegateAccountCardRadio } from "~Components/Reusable/DelegateAccountCard"
import { FlatListScrollPropsType, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, LocalAccountWithDevice, WatchedAccount } from "~Model"
import { Option } from "./Option"

type Props = {
    selectedDelegationAccount?: LocalAccountWithDevice
    flatListProps: FlatListScrollPropsType
    children: (args: { onCancel: () => void; selectedAccount: LocalAccountWithDevice | undefined }) => ReactNode
    accounts: LocalAccountWithDevice[]
}

const ItemSeparatorComponent = () => <BaseSpacer height={8} />

export const AccountOption = ({ selectedDelegationAccount, flatListProps, children, accounts }: Props) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)

    const [selectedAccount, setSelectedAccount] = useState(selectedDelegationAccount)

    const handlePress = useCallback((account: AccountWithDevice | WatchedAccount) => {
        setSelectedAccount(account as LocalAccountWithDevice)
    }, [])

    const onCancel = useCallback(() => {
        setSelectedAccount(selectedDelegationAccount)
    }, [selectedDelegationAccount])

    return (
        <>
            <Option label={LL.DELEGATE_ACCOUNT()} style={styles.list}>
                <BottomSheetFlatList
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
                    {...flatListProps}
                />
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
    })
