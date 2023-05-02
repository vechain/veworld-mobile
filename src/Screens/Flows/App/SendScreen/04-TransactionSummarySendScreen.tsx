import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { StyleSheet } from "react-native"
import { FormattingUtils, VTHO, useCheckIdentity, useTheme } from "~Common"
import { COLORS } from "~Common/Theme"
import {
    AccountIcon,
    BackButtonHeader,
    BaseButton,
    BaseCardGroup,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { VeChainToken } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import {
    selectCurrencyExchangeRate,
    selectCurrency,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { useSendTransaction } from "./Hooks/useSendTransaction"
import { useSignTransaction } from "./Hooks/useSignTransaction"

type Props = NativeStackScreenProps<
    RootStackParamListHome,
    Routes.TRANSACTION_SUMMARY_SEND
>

export const TransactionSummarySendScreen = ({ route }: Props) => {
    const { token, amount, address } = route.params
    const { LL } = useI18nContext()
    const theme = useTheme()

    const account = useAppSelector(selectSelectedAccount)
    const currency = useAppSelector(selectCurrency)
    const exchangeRate = useAppSelector(state =>
        selectCurrencyExchangeRate(state, token.symbol as VeChainToken),
    )
    const formattedFiatAmount = FormattingUtils.humanNumber(
        FormattingUtils.convertToFiatBalance(
            amount || "0",
            exchangeRate?.rate || 1,
            0,
        ),
        amount,
    )

    const { gas, transaction } = useSendTransaction({
        token,
        amount,
        address,
    })

    const { signTransaction } = useSignTransaction({
        transaction,
    })

    const { ConfirmIdentityBottomSheet, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed: signTransaction,
        })
    const gasFees = gas?.gas
        ? FormattingUtils.convertToFiatBalance(gas.gas.toString(), 1, 5) // TODO: understand if there is a better way to do that
        : "N.A."
    return (
        <BaseSafeArea grow={1} style={styles.safeArea}>
            <BaseView style={styles.container}>
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
                                    style={styles.addressContainer}>
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
                                <BaseView flex={1}>
                                    <BaseText typographyFont="captionBold">
                                        {LL.SEND_TO()}
                                    </BaseText>
                                    <BaseSpacer height={8} />
                                    <BaseView flexDirection="row">
                                        <AccountIcon address={address} />
                                        <BaseSpacer width={8} />
                                        <BaseView>
                                            <BaseText typographyFont="subSubTitle">
                                                {FormattingUtils.humanAddress(
                                                    address,
                                                )}
                                            </BaseText>
                                        </BaseView>
                                    </BaseView>
                                </BaseView>
                            ),
                        },
                    ]}
                />
                <BaseView mx={24}>
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
                </BaseView>
            </BaseView>
            <BaseButton
                style={styles.nextButton}
                mx={24}
                title={LL.COMMON_BTN_CONFIRM().toUpperCase()}
                action={checkIdentityBeforeOpening}
            />
            <ConfirmIdentityBottomSheet />
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
    safeArea: {
        justifyContent: "space-between",
    },
    container: {
        alignItems: "stretch",
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
