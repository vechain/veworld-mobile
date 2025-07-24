import { TransactionClause } from "@vechain/sdk-core"
import React from "react"
import { ReceiptOutput } from "~Services/AbiService"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { ContractCallOutput } from "./ContractCallOutput"
import { NativeB3TRSwap } from "./NativeB3TRSwap"
import { TokenReceiveOutput } from "./TokenReceiveOutput"
import { TokenSendOutput } from "./TokenSendOutput"

type Props = {
    expanded: boolean
    output: ReceiptOutput
    clauses: TransactionClause[]
}

export const ReceiptOutputRenderer = ({ expanded, output, clauses }: Props) => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    switch (output.name) {
        case "Transfer(indexed address,indexed address,uint256)":
            if (AddressUtils.compareAddresses(output.params.from, selectedAccount.address))
                return <TokenSendOutput expanded={expanded} output={output} />
            return <TokenReceiveOutput expanded={expanded} output={output} />
        case "B3TR_B3trToVot3Swap(address,address,address,address,uint256,uint256)":
        case "B3TR_Vot3ToB3trSwap(address,address,address,address,uint256,uint256)":
            return <NativeB3TRSwap expanded={expanded} output={output} />
        default:
            return <ContractCallOutput expanded={expanded} output={output} clauses={clauses} />
    }
}
