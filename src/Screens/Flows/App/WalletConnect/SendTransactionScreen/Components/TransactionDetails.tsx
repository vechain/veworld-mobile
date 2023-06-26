import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    CompressAndExpandBaseText,
} from "~Components"
import { useI18nContext } from "~i18n"
import React from "react"
import { DelegationType } from "~Model/Delegation"
import { COLORS, VTHO } from "~Constants"
import { useTheme } from "~Hooks"
import { capitalize } from "lodash"
import { WalletConnectUtils } from "~Utils"
import { SessionTypes, SignClientTypes } from "@walletconnect/types"
import { Network } from "~Model"

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

    // Session request values
    const { params } =
        WalletConnectUtils.getRequestEventAttributes(requestEvent)
    const message = params.comment || params.txMessage[0].comment

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
                {/** TODO: copied from extension, understand if it is fixed as "less than 1 min" */}
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
