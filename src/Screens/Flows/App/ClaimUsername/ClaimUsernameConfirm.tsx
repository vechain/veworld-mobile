import { CommonActions } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Transaction } from "@vechain/sdk-core"
import React, { useCallback, useMemo, useState } from "react"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    DelegationView,
    FadeoutButton,
    GasFeeSpeed,
    Layout,
    RequireUserPassword,
    showErrorToast,
    showInfoToast,
} from "~Components"
import { AnalyticsEvent, DOMAIN_BASE } from "~Constants"
import { getSubdomainClaimClauses, useAnalyticTracking, useTheme, useTransactionScreen } from "~Hooks"
import { waitTransaction } from "~Hooks/useWaitTransaction/transactionWaiter"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, RootStackParamListSettings, Routes } from "~Navigation"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

type Props = NativeStackScreenProps<RootStackParamListHome | RootStackParamListSettings, Routes.CLAIM_USERNAME_CONFIRM>

/**
 * Confirms a username claim paid by the account itself (smart wallets cannot use the free vet.domains sponsor)
 */
export const ClaimUsernameConfirm: React.FC<Props> = ({ route, navigation }) => {
    const { subdomain } = route.params
    const { LL } = useI18nContext()
    const theme = useTheme()
    const trackEvent = useAnalyticTracking()
    const network = useAppSelector(selectSelectedNetwork)

    const username = `${subdomain}${DOMAIN_BASE}`
    const clauses = useMemo(() => getSubdomainClaimClauses(subdomain, network.type), [network.type, subdomain])

    const onTransactionFailure = useCallback(() => {
        trackEvent(AnalyticsEvent.CLAIM_USERNAME_FAILED, {
            reason: "generic",
            domainName: subdomain,
        })
    }, [subdomain, trackEvent])

    // useTransactionScreen does not await onTransactionSuccess, so the screen stays locked here until the receipt arrives
    const [isConfirming, setIsConfirming] = useState(false)

    // Remove both claim screens (optionally landing on the success screen), so that going back returns to where the
    // claim started and the user cannot submit the same paid claim twice
    const leaveClaimFlow = useCallback(
        (claimedUsername?: string) => {
            navigation.dispatch(state => {
                const routes = [
                    ...state.routes.filter(
                        r => r.name !== Routes.CLAIM_USERNAME && r.name !== Routes.CLAIM_USERNAME_CONFIRM,
                    ),
                    ...(claimedUsername
                        ? [{ name: Routes.USERNAME_CLAIMED, params: { username: claimedUsername } }]
                        : []),
                ]

                return CommonActions.reset({
                    ...state,
                    routes,
                    index: routes.length - 1,
                })
            })
        },
        [navigation],
    )

    const onTransactionSuccess = useCallback(
        async (_transaction: Transaction, txId: string) => {
            setIsConfirming(true)

            // waitTransaction resolves null on timeout and logs other errors before rethrowing
            const receipt = await waitTransaction(txId, { network }).catch(() => null)

            // The claim was sent but its outcome is unknown, so do not report a failure that invites a paid retry
            if (!receipt) {
                showInfoToast({
                    text1: LL.NOTIFICATION_subdomain_pending(),
                })
                leaveClaimFlow()
                return
            }

            if (receipt.reverted) {
                setIsConfirming(false)
                onTransactionFailure()
                showErrorToast({
                    text1: LL.NOTIFICATION_failed_subdomain(),
                })
                return
            }

            trackEvent(AnalyticsEvent.CLAIM_USERNAME_CREATED, {
                subdomain: username,
            })
            leaveClaimFlow(username)
        },
        [LL, leaveClaimFlow, network, onTransactionFailure, trackEvent, username],
    )

    const {
        selectedDelegationOption,
        onSubmit,
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
        setSelectedFeeOption,
        selectedFeeOption,
        resetDelegation,
        setSelectedDelegationAccount,
        setSelectedDelegationUrl,
        selectedDelegationAccount,
        selectedDelegationUrl,
        isDisabledButtonState,
        gasOptions,
        gasUpdatedAt,
        isGalactica,
        isBaseFeeRampingUp,
        speedChangeEnabled,
        isEnoughGas,
        availableTokens,
        selectedDelegationToken,
        setSelectedDelegationToken,
        hasEnoughBalanceOnAny,
        isFirstTimeLoadingFees,
        hasEnoughBalanceOnToken,
        exceedsTxGasLimit,
        estimatedGas,
    } = useTransactionScreen({
        clauses,
        onTransactionSuccess,
        onTransactionFailure,
    })

    return (
        <Layout
            noStaticBottomPadding
            preventGoBack={isConfirming}
            safeAreaTestID="Claim_Username_Confirm_Screen"
            title={LL.TITLE_CLAIM_USERNAME()}
            body={
                <>
                    <BaseView mb={80}>
                        <BaseView bg={theme.colors.card} p={16} borderRadius={16}>
                            <BaseText typographyFont="body" mb={4}>
                                {LL.COMMON_USERNAME()}
                            </BaseText>
                            <BaseText typographyFont="subSubTitle">{username}</BaseText>
                        </BaseView>

                        <BaseSpacer height={24} />

                        <GasFeeSpeed
                            gasUpdatedAt={gasUpdatedAt}
                            options={gasOptions}
                            selectedFeeOption={selectedFeeOption}
                            setSelectedFeeOption={setSelectedFeeOption}
                            isGalactica={isGalactica}
                            isBaseFeeRampingUp={isBaseFeeRampingUp}
                            speedChangeEnabled={speedChangeEnabled}
                            isEnoughBalance={isEnoughGas}
                            availableDelegationTokens={availableTokens}
                            delegationToken={selectedDelegationToken}
                            setDelegationToken={setSelectedDelegationToken}
                            hasEnoughBalanceOnAny={hasEnoughBalanceOnAny}
                            isFirstTimeLoadingFees={isFirstTimeLoadingFees}
                            hasEnoughBalanceOnToken={hasEnoughBalanceOnToken}
                            exceedsTxGasLimit={exceedsTxGasLimit}
                            estimatedGas={estimatedGas}>
                            <DelegationView
                                setNoDelegation={resetDelegation}
                                selectedDelegationOption={selectedDelegationOption}
                                setSelectedDelegationAccount={setSelectedDelegationAccount}
                                selectedDelegationAccount={selectedDelegationAccount}
                                selectedDelegationUrl={selectedDelegationUrl}
                                setSelectedDelegationUrl={setSelectedDelegationUrl}
                                delegationToken={selectedDelegationToken}
                            />
                        </GasFeeSpeed>
                    </BaseView>
                    <RequireUserPassword
                        isOpen={isPasswordPromptOpen}
                        onClose={handleClosePasswordModal}
                        onSuccess={onPasswordSuccess}
                    />
                </>
            }
            footer={
                <FadeoutButton
                    testID="ClaimUsernameConfirm_Btn"
                    title={LL.COMMON_BTN_CONFIRM().toUpperCase()}
                    action={onSubmit}
                    disabled={isDisabledButtonState || isConfirming}
                    isLoading={isConfirming}
                    bottom={0}
                    mx={0}
                    width={"auto"}
                />
            }
        />
    )
}
