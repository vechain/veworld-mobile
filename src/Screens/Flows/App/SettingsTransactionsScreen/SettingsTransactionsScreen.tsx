import { useNavigation } from "@react-navigation/native"
import React from "react"
import {
    AccountCard,
    BaseButton,
    BaseCard,
    BaseSpacer,
    BaseText,
    BaseView,
    DelegationOptions,
    Layout,
    useThor,
} from "~Components"
import { AccountWithDevice, DEVICE_TYPE, LocalAccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { Routes } from "~Navigation"
import {
    getDefaultDelegationAccount,
    getDefaultDelegationOption,
    getDefaultDelegationUrl,
    setDefaultDelegationAccount,
    setDefaultDelegationOption,
    setDefaultDelegationUrl,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"

export const SettingsTransactionsScreen = () => {
    const {
        genesis: { id: genesisId },
    } = useThor()
    const selectedDelegationOption = useAppSelector(getDefaultDelegationOption)
    const selectedDelegationAccount = useAppSelector(getDefaultDelegationAccount)
    const selectedDelegationUrl = useAppSelector(getDefaultDelegationUrl)
    const dispatch = useAppDispatch()
    const setNoDelegationOption = () => {
        dispatch(
            setDefaultDelegationOption({
                type: DelegationType.NONE,
                genesisId,
            }),
        )
        dispatch(
            setDefaultDelegationAccount({
                delegationAccount: undefined,
                genesisId,
            }),
        )
        dispatch(
            setDefaultDelegationUrl({
                url: undefined,
                genesisId,
            }),
        )
    }
    const setSelectedDelegationAccount = (defaultDelegationAccount?: AccountWithDevice) => {
        if (defaultDelegationAccount && defaultDelegationAccount.device.type === DEVICE_TYPE.LOCAL_MNEMONIC) {
            dispatch(
                setDefaultDelegationAccount({
                    delegationAccount: defaultDelegationAccount as LocalAccountWithDevice,
                    genesisId,
                }),
            )
            dispatch(
                setDefaultDelegationOption({
                    type: DelegationType.ACCOUNT,
                    genesisId,
                }),
            )
            dispatch(
                setDefaultDelegationUrl({
                    url: undefined,
                    genesisId,
                }),
            )
        }
    }
    const setSelectedDelegationUrl = (defaultDelegationUrl: string) => {
        dispatch(setDefaultDelegationOption({ type: DelegationType.URL, genesisId }))
        dispatch(setDefaultDelegationUrl({ url: defaultDelegationUrl, genesisId }))
        dispatch(
            setDefaultDelegationAccount({
                delegationAccount: undefined,
                genesisId,
            }),
        )
    }

    const { LL } = useI18nContext()

    const nav = useNavigation()

    const openManageUrls = () => {
        nav.navigate(Routes.MANAGE_DELEGATION_URLS)
    }
    return (
        <Layout
            safeAreaTestID="SettingsTransactionsScreen"
            body={
                <BaseView pt={16}>
                    <BaseText typographyFont="title">{LL.SETTINGS_TRANSACTIONS_TITLE()}</BaseText>
                    <BaseSpacer height={24} />
                    <BaseText typographyFont="button">{LL.SETTINGS_TRANSACTIONS_DEFAULT_DELEGATION()}</BaseText>
                    <BaseSpacer height={8} />
                    <BaseText typographyFont="captionRegular">
                        {LL.SETTINGS_TRANSACTIONS_SELECT_DEFAULT_DELEGATION()}
                    </BaseText>

                    <BaseSpacer height={16} />

                    <DelegationOptions
                        selectedDelegationOption={selectedDelegationOption}
                        setSelectedAccount={setSelectedDelegationAccount}
                        setNoDelegation={setNoDelegationOption}
                        selectedAccount={selectedDelegationAccount}
                        selectedDelegationUrl={selectedDelegationUrl}
                        setSelectedDelegationUrl={setSelectedDelegationUrl}
                    />
                    {selectedDelegationAccount && (
                        <>
                            <BaseSpacer height={16} />
                            <AccountCard account={selectedDelegationAccount} />
                        </>
                    )}
                    {selectedDelegationUrl && (
                        <>
                            <BaseSpacer height={16} />
                            <BaseCard>
                                <BaseText py={8}>{selectedDelegationUrl}</BaseText>
                            </BaseCard>
                        </>
                    )}
                    <BaseSpacer height={24} />
                    <BaseText typographyFont="button">{LL.SETTINGS_TRANSACTIONS_SELECT_DELEGATION_URLS()}</BaseText>
                    <BaseSpacer height={8} />
                    <BaseText typographyFont="captionRegular">
                        {LL.SETTINGS_TRANSACTIONS_SELECT_DELEGATION_URLS_BODY()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseButton
                        haptics="Light"
                        action={openManageUrls}
                        variant="link"
                        title={LL.SETTINGS_TRANSACTIONS_MANAGE_URLS()}
                        px={0}
                        mx={0}
                        selfAlign="flex-start"
                    />
                </BaseView>
            }
        />
    )
}
