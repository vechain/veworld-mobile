import { default as React } from "react"
import { DelegateAccountCard } from "~Components/Reusable/DelegateAccountCard"
import { useI18nContext } from "~i18n"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { Option } from "./Option"

export const NoneOption = () => {
    const { LL } = useI18nContext()
    const currentAccount = useAppSelector(selectSelectedAccount)
    return (
        <Option label={LL.DELEGATE_SELF()}>
            <DelegateAccountCard testID="selectedAccount" account={currentAccount} selected />
        </Option>
    )
}
