import { CommonActions } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Transaction } from "@vechain/sdk-core"
import React, { useCallback, useMemo } from "react"
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

    const onTransactionSuccess = useCallback(
        async (_transaction: Transaction, txId: string) => {
            const receipt = await waitTransaction(txId, { network })

            if (!receipt || receipt.reverted) {
                onTransactionFailure()
                showErrorToast({
                    text1: LL.NOTIFICATION_failed_subdomain(),
                })
                return
            }

            trackEvent(AnalyticsEvent.CLAIM_USERNAME_CREATED, {
                subdomain: username,
            })

            // Swap both claim screens for the success screen, so that "Continue" returns to where the claim started
            navigation.dispatch(state => {
                const routes = [
                    ...state.routes.filter(
                        r => r.name !== Routes.CLAIM_USERNAME && r.name !== Routes.CLAIM_USERNAME_CONFIRM,
                    ),
                    { name: Routes.USERNAME_CLAIMED, params: { username } },
                ]

                return CommonActions.reset({
                    ...state,
                    routes,
                    index: routes.length - 1,
                })
            })
        },
        [LL, navigation, network, onTransactionFailure, trackEvent, username],
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
    } = useTransactionScreen({
        clauses,
        onTransactionSuccess,
        onTransactionFailure,
    })

    return (
        <Layout
            noStaticBottomPadding
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
                            hasEnoughBalanceOnToken={hasEnoughBalanceOnToken}>
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
                    disabled={isDisabledButtonState}
                    bottom={0}
                    mx={0}
                    width={"auto"}
                />
            }
        />
    )
}
