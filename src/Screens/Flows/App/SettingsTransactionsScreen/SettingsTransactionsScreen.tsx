import { useNavigation } from "@react-navigation/native"
import React from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseCard, BaseText, BaseView, DelegationOptions, Layout, useThor } from "~Components"
import { SelectableAccountCard } from "~Components/Reusable/SelectableAccountCard"
import { useThemedStyles } from "~Hooks/useTheme"
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
import { SettingsSection } from "../GeneralScreen/Components"
import { DefaultSendInputMode } from "./Components"

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
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()

    const openManageUrls = () => {
        nav.navigate(Routes.MANAGE_DELEGATION_URLS)
    }
    return (
        <Layout
            safeAreaTestID="SettingsTransactionsScreen"
            title={LL.SETTINGS_TRANSACTIONS_TITLE()}
            body={
                <BaseView pt={8} gap={8}>
                    <SettingsSection icon="icon-send" title={LL.TRANSACTIONS_SETTINGS_SEND_PREFERENCES()}>
                        <SettingsSection.Option>
                            <BaseText typographyFont="bodyMedium" color={theme.colors.settingsSection.optionTitle}>
                                {LL.BD_DEFAULT_AMOUNT_VALUE()}
                            </BaseText>
                            <DefaultSendInputMode />
                        </SettingsSection.Option>
                    </SettingsSection>
                    <SettingsSection icon="icon-arrow-link" title={LL.TRANSACTIONS_SETTINGS_DELEGATION_PREFERENCES()}>
                        <SettingsSection.Option>
                            <BaseText typographyFont="bodyMedium" color={theme.colors.settingsSection.optionTitle}>
                                {LL.SETTINGS_TRANSACTIONS_DEFAULT_DELEGATION()}
                            </BaseText>
                            <DelegationOptions
                                selectedDelegationOption={selectedDelegationOption}
                                setSelectedDelegationAccount={setSelectedDelegationAccount}
                                setNoDelegation={setNoDelegationOption}
                                selectedDelegationAccount={selectedDelegationAccount}
                                selectedDelegationUrl={selectedDelegationUrl}
                                setSelectedDelegationUrl={setSelectedDelegationUrl}
                            />
                            {selectedDelegationAccount && (
                                <SelectableAccountCard
                                    testID="Selected_Delegation_Account"
                                    account={selectedDelegationAccount}
                                    balanceToken="FIAT"
                                    disabled
                                />
                            )}
                            {selectedDelegationUrl && (
                                <BaseCard>
                                    <BaseText py={8}>{selectedDelegationUrl}</BaseText>
                                </BaseCard>
                            )}
                        </SettingsSection.Option>
                        <SettingsSection.Option>
                            <BaseText typographyFont="bodyMedium" color={theme.colors.settingsSection.optionTitle}>
                                {LL.SETTINGS_TRANSACTIONS_SELECT_DELEGATION_URLS()}
                            </BaseText>
                            <BaseView flexDirection="column" gap={12} justifyContent="space-between">
                                <BaseView flex={0.8}>
                                    <BaseText
                                        typographyFont="captionRegular"
                                        color={theme.colors.settingsSection.optionTitle}>
                                        {LL.SETTINGS_TRANSACTIONS_SELECT_DELEGATION_URLS_BODY()}
                                    </BaseText>
                                </BaseView>
                                <BaseButton
                                    testID="Manage_Transactions_Urls"
                                    haptics="Light"
                                    action={openManageUrls}
                                    title={LL.SETTINGS_TRANSACTIONS_MANAGE_URLS()}
                                    size="sm"
                                    py={12}
                                    px={16}
                                    bgColor={theme.colors.cardButton.background}
                                    borderColor={theme.colors.cardButton.border}
                                    textColor={theme.colors.cardButton.text}
                                    style={styles.cardButton}
                                />
                            </BaseView>
                        </SettingsSection.Option>
                    </SettingsSection>
                </BaseView>
            }
        />
    )
}

const baseStyles = () => {
    return StyleSheet.create({
        cardButton: {
            borderWidth: 1,
        },
    })
}
