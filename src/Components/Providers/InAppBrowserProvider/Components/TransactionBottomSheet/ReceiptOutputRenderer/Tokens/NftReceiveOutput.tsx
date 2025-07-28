import { default as React } from "react"
import { useI18nContext } from "~i18n"
import { BaseAdditionalDetail } from "../BaseAdditionalDetail"
import { BaseReceiptOutput, ReceiptOutputProps } from "../BaseReceiptOutput"

type Props = ReceiptOutputProps<"Transfer(indexed address,indexed address,indexed uint256)">

export const NftReceiveOutput = ({ output, ...props }: Props) => {
    const { LL } = useI18nContext()

    return (
        <BaseReceiptOutput
            label={LL.RECEIPT_OUTPUT_NFT_RECEIVE()}
            iconKey="icon-arrow-down"
            output={output}
            additionalDetails={
                <>
                    <BaseAdditionalDetail
                        label={LL.ADDITIONAL_DETAIL_SENDER()}
                        value={<BaseAdditionalDetail.HexValue value={output.params.from} testID="NFT_SEND_SENDER" />}
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
