import React, { useCallback } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StyleSheet } from "react-native"
import { FormattingUtils, VTHO, useCheckIdentity, useTheme } from "~Common"
import { COLORS } from "~Common/Theme"
import {
    AccountCard,
    AccountIcon,
    BackButtonHeader,
    BaseButton,
    BaseCard,
    BaseCardGroup,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    ScrollViewWithFooter,
} from "~Components"
import {
    RootStackParamListDiscover,
    RootStackParamListHome,
    Routes,
} from "~Navigation"
import {
    selectCurrencyExchangeRate,
    selectCurrency,
    selectSelectedAccount,
    useAppSelector,
    selectAccountsButSelected,
    selectKnownContacts,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { DelegationOptions } from "./Components"
import { useDelegation, useSendTransaction, useSignTransaction } from "./Hooks"

type Props = NativeStackScreenProps<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.TRANSACTION_SUMMARY_SEND
>

export const TransactionSummarySendScreen = ({ route }: Props) => {
    const nav = useNavigation()
    const { token, amount, address, initialRoute } = route.params
    const { LL } = useI18nContext()
    const theme = useTheme()
    const account = useAppSelector(selectSelectedAccount)
    const currency = useAppSelector(selectCurrency)
    const exchangeRate = useAppSelector(state =>
        selectCurrencyExchangeRate(state, token.symbol),
    )
    const accounts = useAppSelector(selectAccountsButSelected)
    const contacts = useAppSelector(selectKnownContacts)

    const formattedFiatAmount = FormattingUtils.humanNumber(
        FormattingUtils.convertToFiatBalance(
            amount || "0",
            exchangeRate?.rate || 1,
            0,
        ),
        amount,
    )

    const onTXFinish = useCallback(() => {
        switch (initialRoute) {
            case Routes.DISCOVER:
                nav.navigate(Routes.DISCOVER)
                break
            case Routes.HOME:
            default:
                nav.navigate(Routes.HOME)
                break
        }
    }, [initialRoute, nav])

    const { gas, transaction } = useSendTransaction({
        token,
        amount,
        address,
    })

    const {
        selectedDelegationOption,
        setSelectedDelegationOption,
        selectedDelegationAccount,
        setSelectedDelegationAccount,
        selectedDelegationUrl,
        setSelectedDelegationUrl,
        isDelegated,
        urlDelegationSignature,
    } = useDelegation({ transaction })

    const { signTransaction } = useSignTransaction({
        transaction,
        onTXFinish,
        isDelegated,
        urlDelegationSignature,
        selectedDelegationAccount,
        selectedDelegationOption,
    })

    const { ConfirmIdentityBottomSheet, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed: signTransaction,
        })
    const gasFees = gas?.gas
        ? FormattingUtils.convertToFiatBalance(gas.gas.toString(), 1, 5) // TODO: understand if there is a better way to do that
        : "N.A."

    const receiverDetails = () => {
        const contact = contacts.find(
            _contact =>
                _contact.address.toLowerCase() === address.toLowerCase(),
        )

        if (contact) {
            return (
                <BaseView>
                    <BaseText typographyFont="subSubTitle">
                        {contact.alias}
                    </BaseText>
                    <BaseText typographyFont="captionRegular">
                        {FormattingUtils.humanAddress(contact.address || "")}
                    </BaseText>
                </BaseView>
            )
        }

        const receiverAccount = accounts.find(
            _account =>
                _account.address.toLowerCase() === address.toLowerCase(),
        )
        if (receiverAccount) {
            return (
                <BaseView>
                    <BaseText typographyFont="subSubTitle">
                        {receiverAccount.alias}
                    </BaseText>
                    <BaseText typographyFont="captionRegular">
                        {FormattingUtils.humanAddress(
                            receiverAccount.address || "",
                        )}
                    </BaseText>
                </BaseView>
            )
        }

        return (
            <BaseView>
                <BaseText typographyFont="subSubTitle">
                    {FormattingUtils.humanAddress(address)}
                </BaseText>
            </BaseView>
        )
    }
    return (
        <BaseSafeArea grow={1}>
            <ScrollViewWithFooter
                footer={
                    <BaseButton
                        style={styles.nextButton}
                        mx={24}
                        title={LL.COMMON_BTN_CONFIRM().toUpperCase()}
                        action={checkIdentityBeforeOpening}
                    />
                }>
                <BackButtonHeader />
                <BaseView mx={24}>
                    <BaseText typographyFont="title">
                        {LL.SEND_TOKEN_TITLE()}
                    </BaseText>
                    <BaseSpacer height={24} />
                </BaseView>
                <BaseCardGroup
                    views={[
                        {
                            children: (
                                <BaseView
                                    flex={1}
                                    style={styles.addressContainer}
                                    alignItems="flex-start">
                                    <BaseText typographyFont="captionBold">
                                        {LL.SEND_FROM()}
                                    </BaseText>
                                    <BaseSpacer height={8} />
                                    <BaseView flexDirection="row">
                                        <AccountIcon
                                            address={account?.address || ""}
                                        />
                                        <BaseSpacer width={8} />
                                        <BaseView>
                                            <BaseText typographyFont="subSubTitle">
                                                {account?.alias}
                                            </BaseText>
                                            <BaseText typographyFont="captionRegular">
                                                {FormattingUtils.humanAddress(
                                                    account?.address || "",
                                                )}
                                            </BaseText>
                                        </BaseView>
                                    </BaseView>
                                    <BaseIcon
                                        name={"arrow-down"}
                                        size={20}
                                        color={COLORS.WHITE}
                                        bg={COLORS.DARK_PURPLE_DISABLED}
                                        style={styles.icon}
                                    />
                                </BaseView>
                            ),
                            style: styles.addressView,
                        },
                        {
                            children: (
                                <BaseView flex={1} alignItems="flex-start">
                                    <BaseText typographyFont="captionBold">
                                        {LL.SEND_TO()}
                                    </BaseText>
                                    <BaseSpacer height={8} />
                                    <BaseView flexDirection="row">
                                        <AccountIcon address={address} />
                                        <BaseSpacer width={8} />
                                        {receiverDetails()}
                                    </BaseView>
                                </BaseView>
                            ),
                        },
                    ]}
                />
                <BaseView mx={24}>
                    <DelegationOptions
                        selectedDelegationOption={selectedDelegationOption}
                        setSelectedDelegationOption={
                            setSelectedDelegationOption
                        }
                        setSelectedAccount={setSelectedDelegationAccount}
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
                                <BaseText py={8}>
                                    {selectedDelegationUrl}
                                </BaseText>
                            </BaseCard>
                        </>
                    )}
                    <BaseSpacer height={24} />
                    <BaseText typographyFont="subTitleBold">
                        {LL.SEND_DETAILS()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="buttonSecondary">
                        {LL.SEND_AMOUNT()}
                    </BaseText>
                    <BaseSpacer height={6} />
                    <BaseView flexDirection="row">
                        <BaseText typographyFont="subSubTitle">
                            {amount} {token.symbol}
                        </BaseText>
                        {exchangeRate && (
                            <BaseText typographyFont="buttonSecondary">
                                {" ≈ "}
                                {formattedFiatAmount} {currency}
                            </BaseText>
                        )}
                    </BaseView>
                    <BaseSpacer height={12} />
                    <BaseSpacer
                        height={0.5}
                        width={"100%"}
                        background={theme.colors.textDisabled}
                    />
                    <BaseSpacer height={12} />
                    <BaseText typographyFont="buttonSecondary">
                        {LL.SEND_GAS_FEE()}
                    </BaseText>
                    <BaseSpacer height={6} />
                    <BaseText typographyFont="subSubTitle">
                        {gasFees} {VTHO.symbol}
                    </BaseText>
                    <BaseSpacer height={12} />
                    <BaseSpacer
                        height={0.5}
                        width={"100%"}
                        background={theme.colors.textDisabled}
                    />
                    <BaseSpacer height={12} />
                    <BaseText typographyFont="buttonSecondary">
                        {LL.SEND_ESTIMATED_TIME()}
                    </BaseText>
                    <BaseSpacer height={6} />
                    <BaseText typographyFont="subSubTitle">
                        {/** TODO: copied from extension, understand if it is fixed as "less than 1 min" */}
                        {LL.SEND_LESS_THAN_1_MIN()}
                    </BaseText>
                    <BaseSpacer height={24} />
                </BaseView>
                <ConfirmIdentityBottomSheet />
            </ScrollViewWithFooter>
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    icon: {
        position: "absolute",
        right: 16,
        bottom: -32,
        padding: 8,
    },
    nextButton: {
        marginBottom: 70,
    },
    addressContainer: {
        overflow: "visible",
    },
    addressView: {
        zIndex: 2,
    },
})
