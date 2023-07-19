import { StyleSheet } from "react-native"
import React, { useCallback, useMemo, useState } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { Routes } from "~Navigation"
import {
    AccountCard,
    BackButtonHeader,
    BaseCard,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    DelegationOptions,
    FadeoutButton,
    TransferCard,
} from "~Components"
import { useI18nContext } from "~i18n"
import {
    selectNFTWithAddressAndTokenId,
    selectSelectedAccount,
    selectVthoTokenWithBalanceByAccount,
    useAppSelector,
} from "~Storage/Redux"
import { NFTRecapView } from "./Components/NFTRecapView"
import { InfoSectionView } from "../NFTDetailScreen/Components"
import { ScrollView } from "react-native-gesture-handler"
import {
    useCheckIdentity,
    usePlatformBottomInsets,
    useSignTransaction,
    useTransaction,
} from "~Hooks"
import { FormattingUtils } from "~Utils"
import { BigNumber } from "bignumber.js"
import { useDelegation } from "../../SendScreen/04-TransactionSummarySendScreen/Hooks"
import { VTHO } from "~Constants"
import { DEVICE_TYPE, LedgerAccountWithDevice } from "~Model"
import { StackActions, useNavigation } from "@react-navigation/native"
import { prepareNonFungibleClause } from "~Utils/TransactionUtils/TransactionUtils"

type Props = NativeStackScreenProps<
    RootStackParamListNFT,
    Routes.SEND_NFT_RECAP
>

export const SendNFTRecapScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const { calculateBottomInsets } = usePlatformBottomInsets()

    const selectedAccoount = useAppSelector(selectSelectedAccount)

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
        nav.dispatch(StackActions.popToTop())
    }, [nav])

    const clauses = useMemo(
        () =>
            prepareNonFungibleClause(
                selectedAccoount,
                route.params.receiverAddress,
                nft,
            ),

        [selectedAccoount, route.params.receiverAddress, nft],
    )

    const { gas, transaction, setGasPayer } = useTransaction({
        clauses,
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
    } = useDelegation({ transaction, setGasPayer })

    const { signAndSendTransaction } = useSignTransaction({
        transaction,
        onTXFinish,
        isDelegated,
        urlDelegationSignature,
        selectedDelegationAccount,
        selectedDelegationOption,
        selectedDelegationUrl,
        onError: () => setLoading(false),
        token: nft!,
    })

    const { ConfirmIdentityBottomSheet, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed: signAndSendTransaction,
            onCancel: () => setLoading(false),
        })

    const onSendPress = useCallback(() => {
        setLoading(true)
        if (selectedAccoount.device.type === DEVICE_TYPE.LEDGER) {
            nav.navigate(Routes.LEDGER_SIGN_TRANSACTION, {
                accountWithDevice: selectedAccoount as LedgerAccountWithDevice,
                transaction,
                initialRoute: Routes.HOME,
            })
        } else checkIdentityBeforeOpening()
    }, [checkIdentityBeforeOpening, nav, selectedAccoount, transaction])

    const vtho = useAppSelector(state =>
        selectVthoTokenWithBalanceByAccount(
            state,
            selectedDelegationAccount?.address || selectedAccoount.address,
        ),
    )

    const vthoBalance = FormattingUtils.scaleNumberDown(
        vtho.balance.balance,
        vtho.decimals,
        2,
    )

    const vthoGas = FormattingUtils.convertToFiatBalance(
        gas?.gas?.toString() ?? "0",
        1,
        5,
    )

    // TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/760) create a centralized hook for this where we distinguish between errors (not enough gas, error calculating gas, etc)
    const isThereEnoughGas = useMemo(() => {
        if (!vthoGas || vthoGas === "0.00") return false
        let leftVtho = new BigNumber(vthoBalance)
        return vthoGas && leftVtho.gte(vthoGas)
    }, [vthoBalance, vthoGas])

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: calculateBottomInsets,
                }}>
                <BaseView mx={20}>
                    <BaseText typographyFont="title">{LL.RECAP()}</BaseText>

                    <BaseSpacer height={24} />

                    <BaseView
                        flexDirection="row"
                        style={baseStyles.previewContainer}>
                        <NFTRecapView nft={nft!} />

                        <BaseView justifyContent="flex-end" h={100} mx={16}>
                            <BaseText
                                typographyFont="subTitleBold"
                                alignContainer="baseline">
                                {nft?.name ?? LL.COMMON_NOT_AVAILABLE()}
                            </BaseText>
                            <BaseText
                                typographyFont="body"
                                alignContainer="baseline">
                                #{nft!.tokenId}
                            </BaseText>
                        </BaseView>
                    </BaseView>

                    <BaseSpacer height={24} />

                    {/* TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/761) convert style to design specs*/}
                    <TransferCard
                        fromAddress={selectedAccoount!.address}
                        toAddresses={[route.params.receiverAddress]}
                    />

                    <DelegationOptions
                        selectedDelegationOption={selectedDelegationOption}
                        setSelectedDelegationOption={
                            setSelectedDelegationOption
                        }
                        setSelectedAccount={setSelectedDelegationAccount}
                        selectedAccount={selectedDelegationAccount}
                        selectedDelegationUrl={selectedDelegationUrl}
                        setSelectedDelegationUrl={setSelectedDelegationUrl}
                        disabled={loading}
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

                    <InfoSectionView<string>
                        isDanger={!isThereEnoughGas}
                        isFontReverse
                        title={"Estimated gas fee"}
                        data={vthoGas + " " + VTHO.symbol}
                    />

                    <InfoSectionView<string>
                        isFontReverse
                        title={"Estimated time"}
                        data={LL.SEND_LESS_THAN_1_MIN()}
                    />

                    <InfoSectionView<string>
                        isFontReverse
                        isLastInList
                        title={"Total amount"}
                        data={vthoGas + " " + VTHO.symbol}
                        subTtitle={"8,03 USD"} // TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/762) add real price
                    />
                </BaseView>
            </ScrollView>

            <ConfirmIdentityBottomSheet />

            <FadeoutButton
                title={LL.SEND_TOKEN_TITLE().toUpperCase()}
                action={onSendPress}
                disabled={!isThereEnoughGas || loading}
            />
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    previewContainer: {
        height: 130,
    },
    addressContainer: {
        overflow: "visible",
    },
    icon: {
        position: "absolute",
        right: 16,
        bottom: -32,
        padding: 8,
    },
    addressView: {
        zIndex: 2,
    },
})
