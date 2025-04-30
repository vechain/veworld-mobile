import { default as React, useCallback } from "react"
import { BaseButton, BaseView } from "~Components/Base"
import { FlatListScrollPropsType } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, LocalAccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { AccountOption } from "./AccountOption"
import { NoneOption } from "./NoneOption"

type Props = {
    setNoDelegation: () => void
    selectedOption: DelegationType
    setSelectedDelegationAccount: (account: AccountWithDevice) => void
    selectedDelegationAccount?: LocalAccountWithDevice
    selectedDelegationUrl?: string
    setSelectedDelegationUrl: (url: string) => void

    onReset: () => void
    onClose: () => void
    flatListScrollProps: FlatListScrollPropsType
}

const ButtonBar = ({ onCancel, onApply }: { onCancel: () => void; onApply: () => void }) => {
    const { LL } = useI18nContext()
    return (
        <BaseView flexDirection="row" gap={16}>
            <BaseButton variant="outline" action={onCancel}>
                {LL.COMMON_BTN_CANCEL()}
            </BaseButton>
            <BaseButton variant="solid" action={onApply}>
                {LL.COMMON_BTN_APPLY()}
            </BaseButton>
        </BaseView>
    )
}

export const RenderedOption = ({
    selectedOption,
    flatListScrollProps,
    selectedDelegationAccount,
    onReset,
    onClose,
    setNoDelegation,
    setSelectedDelegationAccount,
}: Props) => {
    const handleCancel = useCallback(() => {
        onReset()
        onClose()
    }, [onClose, onReset])

    const handleNoDelegation = useCallback(() => {
        setNoDelegation()
        onClose()
    }, [onClose, setNoDelegation])

    if (selectedOption === DelegationType.NONE)
        return (
            <BaseView flexDirection="column" gap={24}>
                <NoneOption />
                <ButtonBar onCancel={handleCancel} onApply={handleNoDelegation} />
            </BaseView>
        )
    if (selectedOption === DelegationType.ACCOUNT)
        return (
            <AccountOption selectedDelegationAccount={selectedDelegationAccount} flatListProps={flatListScrollProps}>
                {({ onCancel, selectedAccount }) => (
                    <ButtonBar
                        onCancel={() => {
                            onCancel()
                            handleCancel()
                        }}
                        onApply={() => {
                            setSelectedDelegationAccount(selectedAccount!)
                            onClose()
                        }}
                    />
                )}
            </AccountOption>
        )
}
