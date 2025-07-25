import { default as React, useMemo } from "react"
import { useI18nContext } from "~i18n"
import { BaseAdditionalDetail } from "../BaseAdditionalDetail"
import { BaseReceiptOutput, ReceiptOutputProps } from "../BaseReceiptOutput"

type Props = ReceiptOutputProps<
    "Approval(indexed address,indexed address,indexed uint256)" | "ApprovalForAll(indexed address,indexed address,bool)"
>

export const NftApprovalOutput = ({ output, ...props }: Props) => {
    const { LL } = useI18nContext()

    const spender = useMemo(() => {
        switch (output.name) {
            case "Approval(indexed address,indexed address,indexed uint256)":
                return output.params.approved
            case "ApprovalForAll(indexed address,indexed address,bool)":
                return output.params.operator
        }
    }, [output.name, output.params])

    const value = useMemo(() => {
        switch (output.name) {
            case "Approval(indexed address,indexed address,indexed uint256)":
                return `#${output.params.tokenId}`
            case "ApprovalForAll(indexed address,indexed address,bool)":
                return LL.ADDITIONAL_DETAIL_ALL()
        }
    }, [LL, output.name, output.params])

    return (
        <BaseReceiptOutput
            label={LL.RECEIPT_OUTPUT_NFT_APPROVE()}
            iconKey="icon-key"
            output={output}
            additionalDetails={
                <>
                    <BaseAdditionalDetail
                        label={LL.ADDITIONAL_DETAIL_SPENDER()}
                        value={<BaseAdditionalDetail.HexValue value={spender} />}
                    />
                    <BaseAdditionalDetail label={LL.ADDITIONAL_DETAIL_TOKEN_ID()} value={value} />
                </>
            }
            {...props}
        />
    )
}
