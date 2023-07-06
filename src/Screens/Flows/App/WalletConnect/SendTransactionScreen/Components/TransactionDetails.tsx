import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    CompressAndExpandBaseText,
} from "~Components"
import { useI18nContext } from "~i18n"
import React, { useMemo } from "react"
import { DelegationType } from "~Model/Delegation"
import { COLORS, VTHO, VET } from "~Constants"
import { useTheme } from "~Hooks"
import { capitalize } from "lodash"
import { FormattingUtils, WalletConnectUtils } from "~Utils"
import { SessionTypes, SignClientTypes } from "@walletconnect/types"
import { Network } from "~Model"
import {
    selectCurrency,
    selectCurrencyExchangeRate,
    useAppSelector,
} from "~Storage/Redux"
import { BigNumber } from "bignumber.js"

type Props = {
    selectedDelegationOption: DelegationType
    vthoGas: string
    isThereEnoughGas: boolean
    vthoBalance: string
    sessionRequest: SessionTypes.Struct
    requestEvent: SignClientTypes.EventArguments["session_request"]
    network: Network
}

export const TransactionDetails = ({
    selectedDelegationOption,
    vthoGas,
    isThereEnoughGas,
    vthoBalance,
    sessionRequest,
    network,
    requestEvent,
}: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const exchangeRate = useAppSelector(state =>
        selectCurrencyExchangeRate(state, ""),
    )
    const currency = useAppSelector(selectCurrency)

    // Session request values
    const { params } =
        WalletConnectUtils.getRequestEventAttributes(requestEvent)
    const message = params.comment || params.txMessage[0].comment

    const spendingAmount = useMemo(() => {
        return params.txMessage.reduce(
            (acc: BigNumber, clause: Connex.VM.Clause) => {
                return acc.plus(clause.value)
            },
            new BigNumber(0),
        )
    }, [params.txMessage])

    const formattedFiatAmount = FormattingUtils.humanNumber(
        FormattingUtils.convertToFiatBalance(
            spendingAmount || "0",
            exchangeRate?.rate || 1,
            0,
        ),
        spendingAmount,
    )

    return (
        <>
            <BaseText typographyFont="subTitleBold">
                {LL.SEND_DETAILS()}
            </BaseText>

            <BaseSpacer height={24} />
            <BaseText typographyFont="buttonSecondary">
                {LL.CONNECTED_APP_SELECTED_ORIGIN_LABEL()}
            </BaseText>
            <BaseSpacer height={6} />
            <BaseText typographyFont="subSubTitle">
                {sessionRequest.peer.metadata.name}
            </BaseText>

            <BaseSpacer height={12} />
            <BaseSpacer
                height={0.5}
                width={"100%"}
                background={theme.colors.textDisabled}
            />

            <BaseSpacer height={12} />
            <BaseText typographyFont="buttonSecondary">
                {LL.CONNECTED_APP_SELECTED_NETWORK_LABEL()}
            </BaseText>
            <BaseSpacer height={6} />
            <BaseText typographyFont="subSubTitle">
                {capitalize(network.name)}
            </BaseText>

            <BaseSpacer height={12} />
            <BaseSpacer
                height={0.5}
                width={"100%"}
                background={theme.colors.textDisabled}
            />

            <BaseSpacer height={12} />
            <BaseText typographyFont="buttonSecondary">
                {LL.SEND_AMOUNT()}
            </BaseText>
            <BaseSpacer height={6} />
            <BaseView flexDirection="row">
                <BaseText typographyFont="subSubTitle">
                    {spendingAmount.toString()} {VET.symbol}
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
            {selectedDelegationOption === DelegationType.URL ? (
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
                                    color={COLORS.DARK_RED}
                                    size={16}
                                />
                                <BaseSpacer width={4} />
                                <BaseText
                                    typographyFont="buttonSecondary"
                                    color={COLORS.DARK_RED}>
                                    {LL.SEND_INSUFFICIENT_VTHO()} {vthoBalance}{" "}
                                    {VTHO.symbol}
                                </BaseText>
                            </BaseView>
                        </>
                    )}
                </>
            )}
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

            <BaseSpacer height={12} />
            <BaseSpacer
                height={0.5}
                width={"100%"}
                background={theme.colors.textDisabled}
            />

            <BaseSpacer height={12} />
            <BaseText typographyFont="buttonSecondary">
                {LL.CONNECTED_APP_SELECTED_MESSAGE_LABEL()}
            </BaseText>
            <BaseSpacer height={6} />
            <CompressAndExpandBaseText
                text={message}
                typographyFont="subSubTitle"
            />
        </>
    )
}
