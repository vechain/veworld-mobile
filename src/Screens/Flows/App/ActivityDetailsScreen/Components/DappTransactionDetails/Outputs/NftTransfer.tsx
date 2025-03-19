import { memo, default as React, useMemo } from "react"
import { BaseView } from "~Components"
import { SCREEN_WIDTH } from "~Constants"
import { NFTTransferOutput, TransferType, useCopyClipboard } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectAllTokens, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { ClauseDetail } from "../ClauseDetail"

type Props = {
    output: NFTTransferOutput
}

export const NftTransfer = memo(({ output }: Props) => {
    const { LL } = useI18nContext()

    const { onCopyToClipboard } = useCopyClipboard()

    const tokens = useAppSelector(selectAllTokens)

    const token = useMemo(
        () => tokens.find(tk => AddressUtils.compareAddresses(tk.address, output.tokenAddress)),
        [output.tokenAddress, tokens],
    )

    return (
        <BaseView style={{ width: SCREEN_WIDTH - 80 }}>
            <ClauseDetail title={LL.TYPE()} value={LL.CONNECTED_APP_nft_transfer()} />
            <ClauseDetail
                title={LL.COMMON_NFT()}
                value={token?.name ?? token?.symbol ?? AddressUtils.humanAddress(output.tokenAddress, 7, 9)}
                onValuePress={() => onCopyToClipboard(output.tokenAddress, LL.COMMON_LBL_ADDRESS())}
                valueIcon="icon-copy"
            />
            <ClauseDetail title={LL.TOKEN_ID()} value={output.tokenId.toString()} />
            {output.transferType === TransferType.RECEIVE ? (
                <ClauseDetail
                    title={LL.FROM()}
                    value={AddressUtils.humanAddress(output.sender, 7, 9)}
                    onValuePress={() => onCopyToClipboard(output.sender, LL.COMMON_LBL_ADDRESS())}
                    valueIcon="icon-copy"
                    border={false}
                />
            ) : (
                <ClauseDetail
                    title={LL.TO()}
                    value={AddressUtils.humanAddress(output.recipient, 7, 9)}
                    onValuePress={() => onCopyToClipboard(output.recipient ?? "", LL.COMMON_LBL_ADDRESS())}
                    valueIcon="icon-copy"
                    border={false}
                />
            )}
        </BaseView>
    )
})
