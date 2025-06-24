import { default as React } from "react"
import { SelectableAccountCard } from "~Components/Reusable/SelectableAccountCard"
import { useI18nContext } from "~i18n"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { Option } from "./Option"

export const NoneOption = () => {
    const { LL } = useI18nContext()
    const currentAccount = useAppSelector(selectSelectedAccount)
    return (
        <Option label={LL.DELEGATE_SELF()}>
            <SelectableAccountCard testID="selectedAccount" account={currentAccount} selected />
        </Option>
    )
}
