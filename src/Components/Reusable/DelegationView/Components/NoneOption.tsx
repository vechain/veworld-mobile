import { default as React } from "react"
import { AccountCard } from "~Components/Reusable/AccountCard"
import { useI18nContext } from "~i18n"
import { selectBalanceVisible, selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { Option } from "./Option"

export const NoneOption = () => {
    const { LL } = useI18nContext()
    const currentAccount = useAppSelector(selectSelectedAccount)
    const isBalanceVisible = useAppSelector(selectBalanceVisible)
    return (
        <Option label={LL.DELEGATE_SELF()}>
            <AccountCard
                testID="selectedAccount"
                account={currentAccount}
                selected
                isVthoBalance
                isBalanceVisible={isBalanceVisible}
            />
        </Option>
    )
}
