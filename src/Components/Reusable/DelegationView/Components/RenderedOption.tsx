import { default as React, useCallback } from "react"
import { BaseButton, BaseView } from "~Components/Base"
import { useThor } from "~Components/Providers"
import { FlatListScrollPropsType } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, LocalAccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { addDelegationUrl, useAppDispatch } from "~Storage/Redux"
import { URIUtils } from "~Utils"
import { AccountOption } from "./AccountOption"
import { NoneOption } from "./NoneOption"
import { UrlOption } from "./UrlOption"

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
    accounts: LocalAccountWithDevice[]
    delegationUrls: string[]
}

type ButtonBarProps = { onCancel: () => void; onApply: () => void; disabled?: boolean }

const ButtonBar = ({ onCancel, onApply, disabled }: ButtonBarProps) => {
    const { LL } = useI18nContext()
    return (
        <BaseView
            flexDirection="row"
            gap={16}
            w={100}
            justifyContent="space-between"
            alignItems="center"
            mt={24}
            mb={24}>
            <BaseButton variant="outline" action={onCancel} flex={1} testID="RENDERED_OPTION_BUTTON_BAR_CANCEL">
                {LL.COMMON_BTN_CANCEL()}
            </BaseButton>
            <BaseButton
                variant="solid"
                action={onApply}
                flex={1}
                disabled={disabled}
                testID="RENDERED_OPTION_BUTTON_BAR_APPLY">
                {LL.COMMON_BTN_APPLY()}
            </BaseButton>
        </BaseView>
    )
}

export const RenderedOption = ({
    selectedOption,
    flatListScrollProps,
    selectedDelegationAccount,
    selectedDelegationUrl,
    onReset,
    onClose,
    setNoDelegation,
    setSelectedDelegationAccount,
    setSelectedDelegationUrl,
    accounts,
    delegationUrls,
}: Props) => {
    const thor = useThor()
    const dispatch = useAppDispatch()
    const handleCancel = useCallback(() => {
        onClose()
        onReset()
    }, [onClose, onReset])

    const handleNoDelegation = useCallback(() => {
        onClose()
        setNoDelegation()
    }, [onClose, setNoDelegation])

    if (selectedOption === DelegationType.NONE)
        return (
            <>
                <NoneOption />
                <ButtonBar onCancel={handleCancel} onApply={handleNoDelegation} />
            </>
        )
    if (selectedOption === DelegationType.ACCOUNT)
        return (
            <AccountOption
                selectedDelegationAccount={selectedDelegationAccount}
                flatListProps={flatListScrollProps}
                accounts={accounts}>
                {({ onCancel, selectedAccount }) => (
                    <ButtonBar
                        onCancel={() => {
                            onCancel()
                            handleCancel()
                        }}
                        onApply={() => {
                            if (!selectedAccount) return
                            setSelectedDelegationAccount(selectedAccount)
                            onClose()
                        }}
                        disabled={!selectedAccount}
                    />
                )}
            </AccountOption>
        )
    if (selectedOption === DelegationType.URL)
        return (
            <UrlOption selectedDelegationUrl={selectedDelegationUrl} delegationUrls={delegationUrls}>
                {({ onCancel, selectedUrl }) => (
                    <ButtonBar
                        onCancel={() => {
                            onCancel()
                            handleCancel()
                        }}
                        onApply={() => {
                            if (!selectedUrl) return
                            const parsed = URIUtils.parseUrlSafe(selectedUrl)
                            if (!parsed) return
                            setSelectedDelegationUrl(parsed)
                            dispatch(
                                addDelegationUrl({
                                    url: parsed,
                                    genesisId: thor.genesis.id,
                                    callbackIfAlreadyPresent: () => {},
                                }),
                            )
                            onClose()
                        }}
                        disabled={!selectedUrl || !URIUtils.parseUrlSafe(selectedUrl)}
                    />
                )}
            </UrlOption>
        )
}
