import React from "react"
import { useI18nContext } from "~i18n"
import { BaseAdditionalDetail } from "../BaseAdditionalDetail"
import { BaseReceiptOutput, ReceiptOutputProps } from "../BaseReceiptOutput"

type Props = ReceiptOutputProps<"Transfer(indexed address,indexed address,indexed uint256)">

export const NftSendOutput = ({ output, ...props }: Props) => {
    const { LL } = useI18nContext()

    return (
        <BaseReceiptOutput
            label={LL.RECEIPT_OUTPUT_NFT_SEND()}
            iconKey="icon-arrow-up"
            output={output}
            additionalDetails={
                <>
                    <BaseAdditionalDetail
                        label={LL.ADDITIONAL_DETAIL_RECEIVER()}
                        value={<BaseAdditionalDetail.HexValue value={output.params.to} testID="NFT_SEND_RECEIVER" />}
                    />
                    <BaseAdditionalDetail
                        label={LL.ADDITIONAL_DETAIL_TOKEN_ID()}
                        value={`#${output.params.tokenId}`}
                        testID="NFT_SEND_TOKEN_ID"
                    />
                </>
            }
            {...props}
        />
    )
}
