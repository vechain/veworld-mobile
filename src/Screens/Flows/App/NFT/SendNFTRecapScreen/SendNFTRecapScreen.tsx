import React, { useCallback, useMemo, useState } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { Routes } from "~Navigation"
import {
    AccountCard,
    BaseCard,
    BaseSpacer,
    BaseText,
    BaseView,
    DelegationOptions,
    FadeoutButton,
    Layout,
    NFTTransferCard,
    RequireUserPassword,
    TransferCard,
} from "~Components"
import { useI18nContext } from "~i18n"
import {
    selectNFTWithAddressAndTokenId,
    selectSelectedAccount,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { InfoSectionView } from "../NFTDetailScreen/Components"
import {
    useCheckIdentity,
    useRenderGas,
    useSignTransaction,
    useTransactionGas,
} from "~Hooks"
import { useDelegation } from "../../SendScreen/04-TransactionSummarySendScreen/Hooks"
import { DEVICE_TYPE, LedgerAccountWithDevice } from "~Model"
import { StackActions, useNavigation } from "@react-navigation/native"
import { prepareNonFungibleClause } from "~Utils/TransactionUtils/TransactionUtils"
import { DelegationType } from "~Model/Delegation"

type Props = NativeStackScreenProps<
    RootStackParamListNFT,
    Routes.SEND_NFT_RECAP
>

export const SendNFTRecapScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const dispatch = useAppDispatch()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const nft = useAppSelector(state =>
        selectNFTWithAddressAndTokenId(
            state,
            route.params.contractAddress,
            route.params.tokenId,
        ),
    )

    const [loading, setLoading] = useState(false)

    const onTXFinish = useCallback(() => {
        setLoading(false)

        dispatch(setIsAppLoading(false))

        nav.dispatch(StackActions.popToTop())
    }, [dispatch, nav])

    const clauses = useMemo(
        () =>
            prepareNonFungibleClause(
                selectedAccount.address,
                route.params.receiverAddress,
                nft,
            ),

        [selectedAccount, route.params.receiverAddress, nft],
    )

    const { gas, loadingGas, setGasPayer } = useTransactionGas({
        clauses,
    })

    const {
        setNoDelegation,
        setSelectedDelegationAccount,
        setSelectedDelegationUrl,
        selectedDelegationOption,
        selectedDelegationAccount,
        selectedDelegationUrl,
        isDelegated,
    } = useDelegation({ setGasPayer })

    const { signAndSendTransaction, navigateToLedger, buildTransaction } =
        useSignTransaction({
            gas,
            clauses,
            onTXFinish,
            isDelegated,
            selectedDelegationAccount,
            selectedDelegationOption,
            selectedDelegationUrl,
            initialRoute: Routes.NFTS,
            onError: () => setLoading(false),
            token: nft!,
        })

    const { RenderGas, isThereEnoughGas } = useRenderGas({
        loadingGas,
        selectedDelegationOption,
        gas,
        accountAddress:
            selectedDelegationAccount?.address ?? selectedAccount.address,
    })

    const {
        checkIdentityBeforeOpening,
        isBiometricsEmpty,
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
    } = useCheckIdentity({
        onIdentityConfirmed: signAndSendTransaction,
        onCancel: () => setLoading(false),
        allowAutoPassword: true,
    })

    const onSubmit = useCallback(async () => {
        if (
            selectedAccount.device.type === DEVICE_TYPE.LEDGER &&
            selectedDelegationOption !== DelegationType.ACCOUNT
        ) {
            const tx = buildTransaction()
            await navigateToLedger(
                tx,
                selectedAccount as LedgerAccountWithDevice,
            )
        } else {
            await checkIdentityBeforeOpening()
        }
    }, [
        buildTransaction,
        selectedAccount,
        selectedDelegationOption,
        navigateToLedger,
        checkIdentityBeforeOpening,
    ])

    return (
        <Layout
            safeAreaTestID="Send_NFT_Recap_Screen"
            body={
                <>
                    <BaseView>
                        <BaseSpacer height={16} />
                        <BaseText typographyFont="title">{LL.RECAP()}</BaseText>

                        <BaseSpacer height={24} />

                        <TransferCard
                            fromAddress={selectedAccount.address}
                            toAddresses={[route.params.receiverAddress]}
                        />

                        <BaseSpacer height={24} />

                        {nft && (
                            <NFTTransferCard
                                collectionAddress={nft.address}
                                tokenId={nft.tokenId}
                            />
                        )}

                        <DelegationOptions
                            selectedDelegationOption={selectedDelegationOption}
                            setNoDelegation={setNoDelegation}
                            setSelectedAccount={setSelectedDelegationAccount}
                            selectedAccount={selectedDelegationAccount}
                            selectedDelegationUrl={selectedDelegationUrl}
                            setSelectedDelegationUrl={setSelectedDelegationUrl}
                            disabled={loading}
                        />
                        {selectedDelegationAccount && (
                            <>
                                <BaseSpacer height={16} />
                                <AccountCard
                                    account={selectedDelegationAccount}
                                />
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

                        <InfoSectionView<React.JSX.Element>
                            isFontReverse
                            title={LL.ESTIMATED_GAS_FEE()}
                            data={RenderGas}
                        />

                        <InfoSectionView<string>
                            isFontReverse
                            title={LL.ESTIMATED_TIME()}
                            data={LL.SEND_LESS_THAN_1_MIN()}
                        />
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
                    title={LL.SEND_TOKEN_TITLE().toUpperCase()}
                    action={onSubmit}
                    disabled={!isThereEnoughGas || loading || isBiometricsEmpty}
                    bottom={0}
                    mx={0}
                    width={"auto"}
                    isLoading={loading || isBiometricsEmpty}
                />
            }
        />
    )
}
