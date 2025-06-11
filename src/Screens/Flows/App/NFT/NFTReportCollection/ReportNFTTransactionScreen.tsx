import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    DelegationView,
    FadeoutButton,
    GasFeeSpeed,
    Layout,
    RequireUserPassword,
} from "~Components"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useTheme, useTransactionScreen } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import {
    reportCollection,
    selectCollectionWithContractAddress,
    selectSelectedAccount,
    selectSelectedNetwork,
    setIsAppLoading,
    toggleBlackListCollection,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { NFTReportSuccessBottomsheet } from "./NFTReportSuccessBottomsheet"

type Props = NativeStackScreenProps<RootStackParamListNFT, Routes.REPORT_NFT_TRANSACTION_SCREEN>

export const ReportNFTTransactionScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const theme = useTheme()
    const { ref: successBottomSheetRef, onOpen: openBottomSheet, onClose: closeBottomSheet } = useBottomSheetModal()

    const { nftAddress, transactionClauses } = route.params

    const collection = useAppSelector(state => selectCollectionWithContractAddress(state, nftAddress))
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const handleBottomSheetClose = useCallback(() => {
        closeBottomSheet()
        nav.goBack()
    }, [closeBottomSheet, nav])

    const onTransactionSuccess = useCallback(() => {
        dispatch(setIsAppLoading(false))

        if (collection) {
            dispatch(
                toggleBlackListCollection({
                    network: selectedNetwork.type,
                    collection,
                    accountAddress: selectedAccount.address,
                }),
            )
            dispatch(
                reportCollection({
                    network: selectedNetwork.type,
                    collectionAddress: nftAddress,
                    accountAddress: selectedAccount.address,
                }),
            )
        }
        track(AnalyticsEvent.NFT_COLLECTION_REPORTED, {
            nftAddress: nftAddress,
        })

        openBottomSheet()
    }, [dispatch, openBottomSheet, collection, selectedNetwork, selectedAccount, nftAddress, track])

    const onTransactionFailure = useCallback(() => {
        dispatch(setIsAppLoading(false))
        nav.goBack()
    }, [dispatch, nav])

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
    } = useTransactionScreen({
        clauses: transactionClauses,
        onTransactionSuccess,
        onTransactionFailure,
        initialRoute: Routes.NFTS,
    })

    const formattedAddress = AddressUtils.humanAddress(nftAddress, 10, 10)

    const handleConfirm = useCallback(() => {
        track(AnalyticsEvent.NFT_COLLECTION_REPORT_CONFIRMED, {
            nftAddress: nftAddress,
        })
        onSubmit()
    }, [onSubmit, track, nftAddress])

    return (
        <Layout
            noStaticBottomPadding
            safeAreaTestID="Report_NFT_Screen"
            title={LL.NFT_REPORT_COLLECTION_CONFIRM()}
            body={
                <>
                    <BaseView mb={80}>
                        <BaseView style={styles.collectionCard} bg={theme.colors.card} p={16} borderRadius={16}>
                            <BaseText typographyFont="subTitleBold" mb={8}>
                                {LL.NFT_REPORT_COLLECTION()}
                            </BaseText>

                            <BaseText typographyFont="body" mb={4}>
                                {LL.COLLECTION_NAME()}
                            </BaseText>
                            <BaseText typographyFont="subSubTitle" mb={12}>
                                {collection?.name ?? LL.UNKNOWN_COLLECTION()}
                            </BaseText>

                            <BaseText typographyFont="body" mb={4}>
                                {LL.CONTRACT_ADDRESS()}
                            </BaseText>
                            <BaseText typographyFont="subSubTitle">{formattedAddress}</BaseText>
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
                            setDelegationToken={setSelectedDelegationToken}>
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
                    <NFTReportSuccessBottomsheet ref={successBottomSheetRef} onClose={handleBottomSheetClose} />
                </>
            }
            footer={
                <FadeoutButton
                    testID="confirm-report-button"
                    title={LL.COMMON_BTN_CONFIRM().toUpperCase()}
                    action={handleConfirm}
                    disabled={isDisabledButtonState}
                    bottom={0}
                    mx={0}
                    width={"auto"}
                />
            }
        />
    )
}

const styles = StyleSheet.create({
    collectionCard: {
        width: "100%",
    },
})
