import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { NativeModules, StyleSheet } from "react-native"
import {
    AccountCard,
    BaseButton,
    BaseCard,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    CloseModalButton,
    DelegationOptions,
    showErrorToast,
    useThor,
    useWalletConnect,
} from "~Components"
import { Transaction } from "thor-devkit"
import {
    selectSelectedAccount,
    selectSelectedNetwork,
    selectTokensWithInfo,
    selectVthoTokenWithBalanceByAccount,
    useAppSelector,
} from "~Storage/Redux"
import {
    error,
    FormattingUtils,
    GasUtils,
    HexUtils,
    TransactionUtils,
    WalletConnectResponseUtils,
    WalletConnectUtils,
} from "~Utils"
import { useCheckIdentity, useSignTransaction } from "~Hooks"
import { AccountWithDevice, EstimateGasResult } from "~Model"
import { getSdkError } from "@walletconnect/utils"
import { isEmpty, isUndefined } from "lodash"
import { useI18nContext } from "~i18n"
import { sendTransaction } from "~Networking"
import { ScrollView } from "react-native-gesture-handler"
import { useDelegation } from "~Screens/Flows/App/SendScreen/04-TransactionSummarySendScreen/Hooks"
import { DelegationType } from "~Model/Delegation"
import { BigNumber } from "bignumber.js"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native"
import { TransactionDetails } from "./Components"
import { ClausesCarousel } from "../../ActivityDetailsScreen/Components"

// Minimizer module allows the app to be pushed to the background
const { Minimizer } = NativeModules

type Props = NativeStackScreenProps<
    RootStackParamListSwitch,
    Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN
>

export const SendTransactionScreen: FC<Props> = ({ route }: Props) => {
    const {
        requestEvent,
        session: sessionRequest,
        message,
        options,
    } = route.params

    //TODO: leverage all of the 'options' passed from DApp

    const { topic } = WalletConnectUtils.getRequestEventAttributes(requestEvent)

    const { web3Wallet } = useWalletConnect()
    const thorClient = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount: AccountWithDevice = useAppSelector(
        selectSelectedAccount,
    )
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const [gas, setGas] = useState<EstimateGasResult>()

    const onClose = useCallback(() => {
        nav.goBack()
    }, [nav])

    // Decoding clauses
    const tokens = useAppSelector(selectTokensWithInfo)
    const clausesMetadata = TransactionUtils.interpretClauses(message, tokens)

    // Prepare Transaction
    const transactionBody: Transaction.Body = {
        chainTag: parseInt(thorClient.genesis.id.slice(-2), 16),
        blockRef: thorClient.status.head.id.slice(0, 18),
        expiration: 18,
        clauses: message.map(clause => ({
            to: clause.to,
            value: clause.value,
            data: clause.data || "0x",
        })),
        gasPriceCoef: 0,
        gas: gas?.gas?.toString() || "0",
        dependsOn: options.dependsOn || null,
        nonce: HexUtils.generateRandom(8),
    }

    // Delegation
    const {
        selectedDelegationOption,
        setSelectedDelegationOption,
        selectedDelegationAccount,
        setSelectedDelegationAccount,
        selectedDelegationUrl,
        setSelectedDelegationUrl,
        isDelegated,
    } = useDelegation({
        transaction: transactionBody,
    })

    // TODO - add token to handle pending txs?
    // Sign transaction
    const { signTransaction } = useSignTransaction({
        transaction: transactionBody,
        onTXFinish: onClose,
        isDelegated,
        selectedDelegationAccount,
        selectedDelegationOption,
        selectedDelegationUrl,
    })

    // Check if there is enough gas
    const vtho = useAppSelector(state =>
        selectVthoTokenWithBalanceByAccount(
            state,
            selectedDelegationAccount?.address || selectedAccount.address,
        ),
    )
    const vthoBalance = FormattingUtils.scaleNumberDown(
        vtho.balance.balance,
        vtho.decimals,
        2,
    )
    const vthoGas = FormattingUtils.convertToFiatBalance(
        gas?.gas?.toString() || "0",
        1,
        5,
    )
    const isThereEnoughGas = useMemo(() => {
        let leftVtho = new BigNumber(vthoBalance)
        return vthoGas && leftVtho.gte(vthoGas)
    }, [vthoGas, vthoBalance])

    /**
     * Rejects the request and closes the modal
     */
    const onReject = useCallback(async () => {
        if (requestEvent) {
            const { id } = requestEvent
            try {
                const response = WalletConnectUtils.formatJsonRpcError(
                    id,
                    getSdkError("USER_REJECTED_METHODS"),
                )

                await web3Wallet?.respondSessionRequest({
                    topic,
                    response,
                })

                try {
                    Minimizer.goBack()
                } catch (e) {}
            } catch (e) {
                showErrorToast(LL.NOTIFICATION_wallet_connect_matching_error())
            }
        }

        onClose()
    }, [requestEvent, web3Wallet, topic, LL, onClose])

    /**
     * Signs the transaction and sends it to the blockchain
     */
    const handleAccept = useCallback(
        async (password?: string) => {
            try {
                let tx = await signTransaction(password)
                const txId = await sendTransaction(tx, network.currentUrl)

                // TODO (Dan) (https://github.com/vechainfoundation/veworld-mobile/issues/769) add to history?

                await WalletConnectResponseUtils.transactionRequestSuccessResponse(
                    { request: requestEvent, web3Wallet, LL },
                    txId,
                    selectedAccount.address,
                    network,
                )
            } catch (e) {
                error(e)
                await WalletConnectResponseUtils.transactionRequestFailedResponse(
                    { request: requestEvent, web3Wallet, LL },
                )
            } finally {
                onClose()
            }
        },
        [
            selectedAccount,
            network,
            web3Wallet,
            LL,
            requestEvent,
            signTransaction,
            onClose,
        ],
    )

    const { ConfirmIdentityBottomSheet, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed: handleAccept,
        })

    const onPressBack = useCallback(async () => {
        await onReject()
    }, [onReject])

    // Setup delegation option
    useEffect(() => {
        if (
            isUndefined(options.delegator?.url) ||
            isEmpty(options.delegator?.url)
        ) {
            setSelectedDelegationOption(DelegationType.NONE)
            setSelectedDelegationUrl(undefined)
        } else {
            setSelectedDelegationOption(DelegationType.URL)
            setSelectedDelegationUrl(options.delegator?.url)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Estimate gas
    useEffect(() => {
        if (selectedAccount) {
            ;(async () => {
                const estimatedGas = await GasUtils.estimateGas(
                    thorClient,
                    message,
                    0, // NOTE: suggestedGas: 0;  in extension it was fixed 0
                    selectedAccount.address,
                    // NOTE: gasPayer: undefined; in extension it was not used
                )
                setGas(estimatedGas)
            })()
        }
    }, [selectedAccount, message, thorClient])

    return (
        <BaseSafeArea>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[styles.scrollViewContainer]}
                style={styles.scrollView}>
                <CloseModalButton onPress={onPressBack} />

                <BaseView mx={20} style={styles.alignLeft}>
                    <BaseText typographyFont="title">
                        {LL.CONNECTED_APP_REQUEST()}
                    </BaseText>

                    <BaseSpacer height={32} />
                    <BaseText typographyFont="subTitle">
                        {LL.CONNECTED_APP_SIGN_TRANSACTION_REQUEST_TITLE()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseText>
                        {LL.CONNECTED_APP_SIGN_TRANSACTION_REQUEST_DESCRIPTION()}
                    </BaseText>
                </BaseView>

                <BaseSpacer height={24} />
                <BaseView mx={20}>
                    <BaseText typographyFont="subTitleBold">
                        {LL.CONNECTED_APP_SELECTED_ACCOUNT_LABEL()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <AccountCard
                        account={selectedAccount}
                        showOpacityWhenDisabled={false}
                    />
                </BaseView>

                <BaseSpacer height={24} />
                <BaseView mx={20}>
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

                    <BaseSpacer height={44} />
                    <TransactionDetails
                        selectedDelegationOption={selectedDelegationOption}
                        vthoGas={vthoGas}
                        isThereEnoughGas={isThereEnoughGas || false}
                        vthoBalance={vthoBalance}
                        sessionRequest={sessionRequest}
                        network={network}
                        message={message}
                        options={options}
                    />

                    <BaseSpacer height={44} />
                    {!!clausesMetadata.length && (
                        <ClausesCarousel clausesMetadata={clausesMetadata} />
                    )}
                </BaseView>

                <BaseSpacer height={40} />
                <BaseView style={styles.footer}>
                    <BaseButton
                        w={100}
                        haptics="light"
                        title={LL.COMMON_BTN_SIGN_AND_SEND()}
                        action={checkIdentityBeforeOpening}
                        disabled={!isThereEnoughGas && !isDelegated}
                    />
                    <BaseSpacer height={16} />
                    <BaseButton
                        w={100}
                        haptics="light"
                        variant="outline"
                        title={LL.COMMON_BTN_REJECT()}
                        action={onReject}
                    />
                </BaseView>
            </ScrollView>

            <ConfirmIdentityBottomSheet />
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    alignLeft: {
        alignSelf: "flex-start",
    },
    scrollViewContainer: {
        width: "100%",
    },
    scrollView: {
        width: "100%",
    },
    footer: {
        width: "100%",
        alignItems: "center",
        paddingLeft: 20,
        paddingRight: 20,
    },
})
