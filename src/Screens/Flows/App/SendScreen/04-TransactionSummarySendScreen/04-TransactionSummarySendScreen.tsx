import React, { useCallback, useMemo, useState } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StyleSheet } from "react-native"
import {
    useCheckIdentity,
    useTheme,
    useTransaction,
    useSignTransaction,
} from "~Hooks"
import { AddressUtils, FormattingUtils } from "~Utils"
import { VTHO, COLORS } from "~Constants"
import {
    AccountCard,
    AccountIcon,
    BaseCard,
    BaseCardGroup,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    DelegationOptions,
    LedgerBadge,
    Layout,
    FadeoutButton,
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
    selectKnownContacts,
    selectAccounts,
    selectVthoTokenWithBalanceByAccount,
    selectPendingTx,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { useDelegation } from "./Hooks"
import { DEVICE_TYPE, LedgerAccountWithDevice } from "~Model"
import { BigNumber } from "bignumber.js"
import { DelegationType } from "~Model/Delegation"
import SkeletonContent from "react-native-skeleton-content-nonexpo"

type Props = NativeStackScreenProps<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.TRANSACTION_SUMMARY_SEND
>

export const TransactionSummarySendScreen = ({ route }: Props) => {
    const [loadingTransaction, setLoadingTransaction] = useState(false)
    const nav = useNavigation()
    const { token, amount, address, initialRoute } = route.params
    const { LL } = useI18nContext()
    const theme = useTheme()
    const account = useAppSelector(selectSelectedAccount)
    const currency = useAppSelector(selectCurrency)
    const exchangeRate = useAppSelector(state =>
        selectCurrencyExchangeRate(state, token.symbol),
    )

    // TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/763) refactor to a new hook
    const accounts = useAppSelector(selectAccounts)
    const contacts = useAppSelector(selectKnownContacts)
    const accountsAndContacts = useMemo(
        () => [...accounts, ...contacts],
        [accounts, contacts],
    )

    const formattedFiatAmount = FormattingUtils.humanNumber(
        FormattingUtils.convertToFiatBalance(
            amount || "0",
            exchangeRate?.rate || 1,
            0,
        ),
        amount,
    )

    const pendingTransaction = useAppSelector(state =>
        selectPendingTx(state, token.address),
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
        setLoadingTransaction(false)
    }, [initialRoute, nav])

    //build transaction
    const { gas, transaction, loadingGas } = useTransaction({
        token,
        amount,
        addressTo: address,
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

    const vtho = useAppSelector(state =>
        selectVthoTokenWithBalanceByAccount(
            state,
            selectedDelegationAccount?.address || account.address,
        ),
    )

    const vthoBalance = FormattingUtils.scaleNumberDown(
        vtho.balance.balance,
        vtho.decimals,
        2,
    )

    const { signAndSendTransaction } = useSignTransaction({
        transaction,
        onTXFinish,
        isDelegated,
        urlDelegationSignature,
        selectedDelegationAccount,
        selectedDelegationOption,
        selectedDelegationUrl,
        token,
        onError: () => setLoadingTransaction(false),
    })

    const { ConfirmIdentityBottomSheet, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed: signAndSendTransaction,
            onCancel: () => setLoadingTransaction(false),
        })

    const vthoGas = FormattingUtils.convertToFiatBalance(
        gas?.gas?.toString() || "0",
        1,
        5,
    )

    const isThereEnoughGas = useMemo(() => {
        let leftVtho = new BigNumber(vthoBalance)
        if (token.symbol === VTHO.symbol) {
            leftVtho = leftVtho.minus(amount)
        }
        return vthoGas && leftVtho.gte(vthoGas)
    }, [amount, vthoGas, token.symbol, vthoBalance])

    const receiverDetails = () => {
        const receiverExists = accountsAndContacts.find(_account =>
            AddressUtils.compareAddresses(_account.address, address),
        )

        const receiverIsAccount = accounts.find(_account =>
            AddressUtils.compareAddresses(_account.address, address),
        )

        if (receiverExists)
            return (
                <BaseView>
                    <BaseText typographyFont="subSubTitle">
                        {receiverExists.alias}
                    </BaseText>
                    <BaseView flexDirection="row" mt={3}>
                        {receiverIsAccount?.device.type ===
                            DEVICE_TYPE.LEDGER && (
                            <LedgerBadge //eslint-disable-next-line react-native/no-inline-styles
                                containerStyle={{
                                    mr: 8,
                                }}
                            />
                        )}
                        <BaseText typographyFont="captionRegular">
                            {FormattingUtils.humanAddress(
                                receiverExists.address || "",
                            )}
                        </BaseText>
                    </BaseView>
                </BaseView>
            )

        return (
            <BaseView>
                <BaseText typographyFont="subSubTitle">
                    {FormattingUtils.humanAddress(address)}
                </BaseText>
            </BaseView>
        )
    }

    const continueButtonDisabled =
        !isThereEnoughGas && selectedDelegationOption !== DelegationType.URL

    const handleOnConfirm = () => {
        setLoadingTransaction(true)
        if (account.device.type === DEVICE_TYPE.LEDGER) {
            nav.navigate(Routes.LEDGER_SIGN_TRANSACTION, {
                accountWithDevice: account as LedgerAccountWithDevice,
                transaction,
                initialRoute,
            })
        } else checkIdentityBeforeOpening()
    }

    const renderGas = () => {
        if (loadingGas)
            return (
                <SkeletonContent
                    animationDirection="horizontalLeft"
                    boneColor={theme.colors.skeletonBoneColor}
                    highlightColor={theme.colors.skeletonHighlightColor}
                    layout={[
                        {
                            flexDirection: "column",
                            alignItems: "flex-start",
                            width: "100%",
                            children: [
                                // Line
                                {
                                    width: "40%",
                                    height: 18,
                                },
                            ],
                        },
                    ]}
                    isLoading={true}
                />
            )
        return selectedDelegationOption === DelegationType.URL ? (
            <BaseText typographyFont="subSubTitle">
                {LL.SEND_DELEGATED_FEES()}
            </BaseText>
        ) : (
            <>
                <BaseText typographyFont="subSubTitle">
                    {vthoGas || LL.COMMON_NOT_AVAILABLE()} {VTHO.symbol}
                </BaseText>
                {!isThereEnoughGas && (
                    <>
                        <BaseSpacer height={8} />
                        <BaseView flexDirection="row">
                            <BaseIcon
                                name="alert-circle-outline"
                                color={theme.colors.danger}
                                size={16}
                            />
                            <BaseSpacer width={4} />
                            <BaseText
                                typographyFont="buttonSecondary"
                                color={theme.colors.danger}>
                                {LL.SEND_INSUFFICIENT_VTHO()} {vthoBalance}{" "}
                                {VTHO.symbol}
                            </BaseText>
                        </BaseView>
                    </>
                )}
            </>
        )
    }

    return (
        <Layout
            safeAreaTestID="Transaction_Summary_Send_Screen"
            title={LL.SEND_TOKEN_TITLE()}
            body={
                <BaseView mb={80} mt={8}>
                    {/* TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/767) CHange BaseCardGroup with TransferCard */}
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
                                                address={account.address}
                                            />
                                            <BaseSpacer width={8} />
                                            <BaseView>
                                                <BaseText typographyFont="subSubTitle">
                                                    {account.alias}
                                                </BaseText>
                                                <BaseView
                                                    flexDirection="row"
                                                    mt={3}>
                                                    {account.device?.type ===
                                                        DEVICE_TYPE.LEDGER && (
                                                        <LedgerBadge
                                                            //eslint-disable-next-line react-native/no-inline-styles
                                                            containerStyle={{
                                                                mr: 8,
                                                            }}
                                                        />
                                                    )}
                                                    <BaseText typographyFont="captionRegular">
                                                        {FormattingUtils.humanAddress(
                                                            account.address,
                                                        )}
                                                    </BaseText>
                                                </BaseView>
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

                    {!!pendingTransaction && (
                        <>
                            <BaseSpacer height={24} />

                            <BaseText color={COLORS.DARK_RED_ALERT}>
                                {LL.SEND_PENDING_TX_REVERT_ALERT()}
                            </BaseText>
                        </>
                    )}

                    <ConfirmIdentityBottomSheet />

                    <DelegationOptions
                        selectedDelegationOption={selectedDelegationOption}
                        setSelectedDelegationOption={
                            setSelectedDelegationOption
                        }
                        setSelectedAccount={setSelectedDelegationAccount}
                        selectedAccount={selectedDelegationAccount}
                        selectedDelegationUrl={selectedDelegationUrl}
                        setSelectedDelegationUrl={setSelectedDelegationUrl}
                        disabled={loadingTransaction}
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
                    {renderGas()}
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
                        {LL.SEND_LESS_THAN_1_MIN()}
                    </BaseText>
                </BaseView>
            }
            footer={
                <FadeoutButton
                    title={LL.COMMON_BTN_CONFIRM().toUpperCase()}
                    action={handleOnConfirm}
                    disabled={
                        continueButtonDisabled ||
                        loadingTransaction ||
                        loadingGas
                    }
                    isLoading={loadingTransaction}
                    bottom={0}
                    mx={0}
                    width={"auto"}
                />
            }
        />
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
