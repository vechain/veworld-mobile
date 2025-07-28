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
    | "STARGATE_CLAIM_REWARDS_BASE(uint256,uint256,address)"
    | "STARGATE_CLAIM_REWARDS_DELEGATE(uint256,uint256,address)"
    | "STARGATE_STAKE(uint256,uint256,uint8,address,bool)"
    | "STARGATE_STAKE_DELEGATE(uint256,uint256,uint8,address,bool,bool)"
    | "STARGATE_DELEGATE(uint256,address,bool)"
    | "STARGATE_UNDELEGATE(uint256)"
    | "STARGATE_UNSTAKE(uint256,uint256,uint8,address)"
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
            output.name === "STARGATE_CLAIM_REWARDS_BASE(uint256,uint256,address)" ||
            output.name === "STARGATE_CLAIM_REWARDS_DELEGATE(uint256,uint256,address)"
        )
            return VTHO.symbol
        return VET.symbol
    }, [output.name])

    const valueDirection = useMemo(() => {
        switch (output.name) {
            case "STARGATE_CLAIM_REWARDS_BASE(uint256,uint256,address)":
            case "STARGATE_CLAIM_REWARDS_DELEGATE(uint256,uint256,address)":
            case "STARGATE_UNSTAKE(uint256,uint256,uint8,address)":
                return DIRECTIONS.UP
            case "STARGATE_STAKE(uint256,uint256,uint8,address,bool)":
            case "STARGATE_STAKE_DELEGATE(uint256,uint256,uint8,address,bool,bool)":
                return DIRECTIONS.DOWN
        }
    }, [output.name])

    const children = useMemo(() => {
        switch (output.name) {
            case "STARGATE_CLAIM_REWARDS_BASE(uint256,uint256,address)":
            case "STARGATE_CLAIM_REWARDS_DELEGATE(uint256,uint256,address)":
            case "STARGATE_STAKE(uint256,uint256,uint8,address,bool)":
            case "STARGATE_STAKE_DELEGATE(uint256,uint256,uint8,address,bool,bool)":
            case "STARGATE_UNSTAKE(uint256,uint256,uint8,address)":
                return (
                    <BaseReceiptOutput.ValueContainer>
                        <BaseReceiptOutput.ValueMainText testID={`${output.name}_VALUE`}>
                            {`${valueDirection} ${valueHuman} ${valueSymbol}`}
                        </BaseReceiptOutput.ValueMainText>
                    </BaseReceiptOutput.ValueContainer>
                )
            case "STARGATE_DELEGATE(uint256,address,bool)":
            case "STARGATE_UNDELEGATE(uint256)":
                return null
        }
    }, [output.name, valueDirection, valueHuman, valueSymbol])

    const icon = useMemo((): IconKey => {
        switch (output.name) {
            case "STARGATE_CLAIM_REWARDS_BASE(uint256,uint256,address)":
            case "STARGATE_CLAIM_REWARDS_DELEGATE(uint256,uint256,address)":
                return "icon-gift"
            case "STARGATE_STAKE(uint256,uint256,uint8,address,bool)":
                return "icon-download"
            case "STARGATE_STAKE_DELEGATE(uint256,uint256,uint8,address,bool,bool)":
            case "STARGATE_DELEGATE(uint256,address,bool)":
                return "icon-lock"
            case "STARGATE_UNDELEGATE(uint256)":
                return "icon-unlock"
            case "STARGATE_UNSTAKE(uint256,uint256,uint8,address)":
                return "icon-upload"
        }
    }, [output.name])

    return (
        <BaseReceiptOutput
            label={LL.RECEIPT_OUTPUT_STARGATE_UNDELEGATE()}
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
