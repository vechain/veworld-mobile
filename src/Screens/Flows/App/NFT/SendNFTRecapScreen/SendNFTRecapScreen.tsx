import React, { useCallback, useMemo } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { Routes } from "~Navigation"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    Layout,
    NFTTransferCard,
    RequireUserPassword,
    TransferCard,
} from "~Components"
import { useI18nContext } from "~i18n"
import {
    addPendingNFTtransferTransactionActivity,
    selectNFTWithAddressAndTokenId,
    selectSelectedAccount,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { InfoSectionView } from "../NFTDetailScreen/Components"
import { useAnalyticTracking, useTransactionScreen } from "~Hooks"
import { StackActions, useNavigation } from "@react-navigation/native"
import { prepareNonFungibleClause } from "~Utils/TransactionUtils/TransactionUtils"
import { Transaction } from "thor-devkit"
import { AnalyticsEvent } from "~Constants"

type Props = NativeStackScreenProps<
    RootStackParamListNFT,
    Routes.SEND_NFT_RECAP
>

export const SendNFTRecapScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const nft = useAppSelector(state =>
        selectNFTWithAddressAndTokenId(
            state,
            route.params.contractAddress,
            route.params.tokenId,
        ),
    )

    const clauses = useMemo(
        () =>
            prepareNonFungibleClause(
                selectedAccount.address,
                route.params.receiverAddress,
                nft,
            ),

        [selectedAccount, route.params.receiverAddress, nft],
    )

    const onFinish = useCallback(
        (success: boolean) => {
            if (success) track(AnalyticsEvent.SEND_NFT_SENT)
            else track(AnalyticsEvent.SEND_NFT_FAILED_TO_SEND)

            dispatch(setIsAppLoading(false))
            nav.dispatch(StackActions.popToTop())
        },
        [track, dispatch, nav],
    )

    const onTransactionSuccess = useCallback(
        (transaction: Transaction) => {
            dispatch(addPendingNFTtransferTransactionActivity(transaction))
            onFinish(true)
        },
        [onFinish, dispatch],
    )

    const onTransactionFailure = useCallback(() => onFinish(false), [onFinish])

    const {
        Delegation,
        RenderGas,
        SubmitButton,
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
    } = useTransactionScreen({
        clauses,
        onTransactionSuccess,
        onTransactionFailure,
        initialRoute: Routes.HOME,
    })

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

                        {Delegation()}

                        <BaseSpacer height={24} />

                        <InfoSectionView<React.JSX.Element>
                            isFontReverse
                            title={LL.ESTIMATED_GAS_FEE()}
                            data={RenderGas()}
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
            footer={SubmitButton()}
        />
    )
}
