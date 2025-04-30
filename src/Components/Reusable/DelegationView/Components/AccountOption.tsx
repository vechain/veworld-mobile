import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { default as React, ReactNode, useCallback, useState } from "react"
import { BaseSpacer } from "~Components/Base"
import { AccountCard } from "~Components/Reusable/AccountCard"
import { FlatListScrollPropsType } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, LocalAccountWithDevice, WatchedAccount } from "~Model"
import { selectBalanceVisible, selectDelegationAccounts, useAppSelector } from "~Storage/Redux"
import { Option } from "./Option"

type Props = {
    selectedDelegationAccount?: LocalAccountWithDevice
    flatListProps: FlatListScrollPropsType
    children: (args: { onCancel: () => void; selectedAccount: LocalAccountWithDevice | undefined }) => ReactNode
}

const ItemSeparatorComponent = () => <BaseSpacer height={8} />

export const AccountOption = ({ selectedDelegationAccount, flatListProps, children }: Props) => {
    const { LL } = useI18nContext()
    const isBalanceVisible = useAppSelector(selectBalanceVisible)
    const accounts = useAppSelector(selectDelegationAccounts)

    const [selectedAccount, setSelectedAccount] = useState(selectedDelegationAccount)

    const handlePress = useCallback((account: AccountWithDevice | WatchedAccount) => {
        setSelectedAccount(account as LocalAccountWithDevice)
    }, [])

    const onCancel = useCallback(() => {
        setSelectedAccount(selectedDelegationAccount)
    }, [selectedDelegationAccount])

    return (
        <>
            <Option label={LL.DELEGATE_ACCOUNT()}>
                <BottomSheetFlatList
                    data={accounts}
                    keyExtractor={account => account.address}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    renderItem={({ item }) => (
                        <AccountCard
                            testID="selectAccount"
                            account={item}
                            onPress={handlePress}
                            selected={item.address === selectedAccount?.address}
                            isVthoBalance
                            isBalanceVisible={isBalanceVisible}
                        />
                    )}
                    {...flatListProps}
                />
            </Option>
            {children({ onCancel, selectedAccount })}
        </>
    )
}
