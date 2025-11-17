import { default as React, useMemo } from "react"
import { DIRECTIONS, VET, VTHO } from "~Constants"
import { useFormatFiat } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { BigNutils } from "~Utils"
import { BaseAdditionalDetail } from "../BaseAdditionalDetail"
import { BaseReceiptOutput, ReceiptOutputProps } from "../BaseReceiptOutput"
import { StargateIcon } from "./StargateIcon"

type Props = ReceiptOutputProps<
    | "STARGATE_STAKE(uint256,uint256,uint8,address,bool)"
    | "STARGATE_DELEGATE_LEGACY(uint256,address,bool)"
    | "STARGATE_UNDELEGATE(uint256)"
    | "STARGATE_UNSTAKE(uint256,uint256,uint8,address)"
    | "STARGATE_BOOST(uint256,uint256,address,uint256)"
    | "STARGATE_CLAIM_REWARDS_BASE_LEGACY(uint256,uint256,address)"
    | "STARGATE_CLAIM_REWARDS_DELEGATE_LEGACY(uint256,uint256,address)"
    | "STARGATE_CLAIM_REWARDS(uint256,uint256,address,uint256,uint32)"
    | "STARGATE_DELEGATE_REQUEST(uint256,address,uint256,address,uint256,uint256,uint8)"
    | "STARGATE_DELEGATE_REQUEST_CANCELLED(uint256,address,uint256,address,uint256,uint8)"
    | "STARGATE_DELEGATION_EXIT_REQUEST(uint256,uint256,address)"
    | "STARGATE_MANAGER_ADDED(uint256,address,address)"
    | "STARGATE_MANAGER_REMOVED(uint256,address,address)"
    | "STARGATE_UNDELEGATE_LEGACY(uint256)"
>

export const StargateBaseOutput = ({ output, ...props }: Props) => {
    const { LL } = useI18nContext()
    const { formatLocale } = useFormatFiat()

    const value = useMemo(() => {
        if ("value" in output.params) return output.params.value
        return 0
    }, [output.params])

    const valueHuman = useMemo(() => {
        return BigNutils(value.toString())
            .toHuman(VTHO.decimals ?? 0)
            .toTokenFormat_string(2, formatLocale)
    }, [formatLocale, value])

    const valueSymbol = useMemo(() => {
        if (
            [
                "STARGATE_CLAIM_REWARDS(uint256,uint256,address,uint256,uint32)",
                "STARGATE_CLAIM_REWARDS_BASE_LEGACY(uint256,uint256,address)",
                "STARGATE_CLAIM_REWARDS_DELEGATE_LEGACY(uint256,uint256,address)",
                "STARGATE_BOOST(uint256,uint256,address,uint256)",
            ].includes(output.name)
        )
            return VTHO.symbol
        return VET.symbol
    }, [output.name])

    const valueDirection = useMemo(() => {
        switch (output.name) {
            case "STARGATE_CLAIM_REWARDS(uint256,uint256,address,uint256,uint32)":
            case "STARGATE_CLAIM_REWARDS_BASE_LEGACY(uint256,uint256,address)":
            case "STARGATE_CLAIM_REWARDS_DELEGATE_LEGACY(uint256,uint256,address)":
            case "STARGATE_UNSTAKE(uint256,uint256,uint8,address)":
            case "STARGATE_DELEGATION_EXIT_REQUEST(uint256,uint256,address)":
                return DIRECTIONS.UP
            case "STARGATE_STAKE(uint256,uint256,uint8,address,bool)":
            case "STARGATE_BOOST(uint256,uint256,address,uint256)":
                return DIRECTIONS.DOWN
        }
    }, [output.name])

    const children = useMemo(() => {
        switch (output.name) {
            case "STARGATE_CLAIM_REWARDS(uint256,uint256,address,uint256,uint32)":
            case "STARGATE_CLAIM_REWARDS_BASE_LEGACY(uint256,uint256,address)":
            case "STARGATE_CLAIM_REWARDS_DELEGATE_LEGACY(uint256,uint256,address)":
            case "STARGATE_DELEGATION_EXIT_REQUEST(uint256,uint256,address)":
            case "STARGATE_STAKE(uint256,uint256,uint8,address,bool)":
            case "STARGATE_BOOST(uint256,uint256,address,uint256)":
            case "STARGATE_UNSTAKE(uint256,uint256,uint8,address)":
                return (
                    <BaseReceiptOutput.ValueContainer>
                        <BaseReceiptOutput.ValueMainText testID={`${output.name}_VALUE`}>
                            {`${valueDirection} ${valueHuman} ${valueSymbol}`}
                        </BaseReceiptOutput.ValueMainText>
                    </BaseReceiptOutput.ValueContainer>
                )
            default:
                return null
        }
    }, [output.name, valueDirection, valueHuman, valueSymbol])

    const icon = useMemo((): IconKey => {
        switch (output.name) {
            case "STARGATE_CLAIM_REWARDS(uint256,uint256,address,uint256,uint32)":
            case "STARGATE_CLAIM_REWARDS_BASE_LEGACY(uint256,uint256,address)":
            case "STARGATE_CLAIM_REWARDS_DELEGATE_LEGACY(uint256,uint256,address)":
                return "icon-gift"
            case "STARGATE_STAKE(uint256,uint256,uint8,address,bool)":
                return "icon-download"
            case "STARGATE_DELEGATE_LEGACY(uint256,address,bool)":
                return "icon-lock"
            case "STARGATE_DELEGATE_REQUEST(uint256,address,uint256,address,uint256,uint256,uint8)":
                return "icon-log-in"
            case "STARGATE_DELEGATE_REQUEST_CANCELLED(uint256,address,uint256,address,uint256,uint8)":
            case "STARGATE_DELEGATION_EXIT_REQUEST(uint256,uint256,address)":
                return "icon-log-out"
            case "STARGATE_UNDELEGATE_LEGACY(uint256)":
            case "STARGATE_UNDELEGATE(uint256)":
                return "icon-unlock"
            case "STARGATE_UNSTAKE(uint256,uint256,uint8,address)":
                return "icon-upload"
            case "STARGATE_MANAGER_ADDED(uint256,address,address)":
                return "icon-user-plus"
            case "STARGATE_MANAGER_REMOVED(uint256,address,address)":
                return "icon-user-minus"
            case "STARGATE_BOOST(uint256,uint256,address,uint256)":
                return "icon-thunder"
        }
    }, [output.name])

    const label = useMemo(() => {
        switch (output.name) {
            case "STARGATE_CLAIM_REWARDS(uint256,uint256,address,uint256,uint32)":
                return LL.RECEIPT_OUTPUT_STARGATE_CLAIM_REWARDS_DELEGATION()
            case "STARGATE_CLAIM_REWARDS_BASE_LEGACY(uint256,uint256,address)":
                return LL.RECEIPT_OUTPUT_STARGATE_CLAIM_REWARDS_BASE()
            case "STARGATE_CLAIM_REWARDS_DELEGATE_LEGACY(uint256,uint256,address)":
                return LL.RECEIPT_OUTPUT_STARGATE_CLAIM_REWARDS_DELEGATION()
            case "STARGATE_STAKE(uint256,uint256,uint8,address,bool)":
                return LL.RECEIPT_OUTPUT_STARGATE_STAKE()
            case "STARGATE_DELEGATE_LEGACY(uint256,address,bool)":
                return LL.RECEIPT_OUTPUT_STARGATE_DELEGATE()
            case "STARGATE_DELEGATE_REQUEST(uint256,address,uint256,address,uint256,uint256,uint8)":
                return LL.RECEIPT_OUTPUT_STARGATE_DELEGATION_REQUESTED()
            case "STARGATE_DELEGATE_REQUEST_CANCELLED(uint256,address,uint256,address,uint256,uint8)":
                return LL.RECEIPT_OUTPUT_STARGATE_DELEGATION_REQUEST_CANCELLED()
            case "STARGATE_DELEGATION_EXIT_REQUEST(uint256,uint256,address)":
                return LL.RECEIPT_OUTPUT_STARGATE_DELEGATION_EXIT_REQUESTED()
            case "STARGATE_UNDELEGATE_LEGACY(uint256)":
            case "STARGATE_UNDELEGATE(uint256)":
                return LL.RECEIPT_OUTPUT_STARGATE_UNDELEGATE()
            case "STARGATE_UNSTAKE(uint256,uint256,uint8,address)":
                return LL.RECEIPT_OUTPUT_STARGATE_UNSTAKE()
            case "STARGATE_MANAGER_ADDED(uint256,address,address)":
                return LL.RECEIPT_OUTPUT_STARGATE_MANAGER_ADDED()
            case "STARGATE_MANAGER_REMOVED(uint256,address,address)":
                return LL.RECEIPT_OUTPUT_STARGATE_MANAGER_REMOVED()
            case "STARGATE_BOOST(uint256,uint256,address,uint256)":
                return LL.RECEIPT_OUTPUT_STARGATE_MATURITY_BOOSTED()
        }
    }, [LL, output.name])

    return (
        <BaseReceiptOutput
            label={label}
            iconNode={<StargateIcon icon={icon} />}
            output={output}
            additionalDetails={
                <BaseAdditionalDetail
                    label={LL.ADDITIONAL_DETAIL_TOKEN_ID()}
                    value={`#${output.params.tokenId}`}
                    testID={`${output.name}_TOKEN_ID`}
                />
            }
            {...props}>
            {children}
        </BaseReceiptOutput>
    )
}
