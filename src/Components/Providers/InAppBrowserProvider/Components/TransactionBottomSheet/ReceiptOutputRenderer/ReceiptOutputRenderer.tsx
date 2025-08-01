import { TransactionClause } from "@vechain/sdk-core"
import React, { useMemo } from "react"
import { ReceiptOutput } from "~Services/AbiService"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { B3TRActionOutput } from "./B3TR/B3TRActionOutput"
import { B3TRClaimRewardsOutput } from "./B3TR/B3TRClaimRewardsOutput"
import { B3TRProposalSupportOutput } from "./B3TR/B3TRProposalSupportOutput"
import { B3TRProposalVoteOutput } from "./B3TR/B3TRProposalVoteOutput"
import { B3TRRoundVoteOutput } from "./B3TR/B3TRRoundVoteOutput"
import { NativeB3TRSwapOutput } from "./B3TR/NativeB3TRSwapOutput"
import { ContractCallOutput } from "./ContractCallOutput"
import { StargateBaseOutput } from "./Stargate/StargateBaseOutput"
import { NftApprovalOutput } from "./Tokens/NftApprovalOutput"
import { NftReceiveOutput } from "./Tokens/NftReceiveOutput"
import { NftSendOutput } from "./Tokens/NftSendOutput"
import { SwapOutput } from "./Tokens/SwapOutput"
import { TokenApprovalOutput } from "./Tokens/TokenApprovalOutput"
import { TokenReceiveOutput } from "./Tokens/TokenReceiveOutput"
import { TokenSendOutput } from "./Tokens/TokenSendOutput"

type Props = {
    expanded: boolean
    output: ReceiptOutput
    clauses: TransactionClause[]
}

export const ReceiptOutputRenderer = ({ expanded, output, clauses }: Props) => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const clause = useMemo(() => clauses[output.clauseIndex], [clauses, output.clauseIndex])
    switch (output.name) {
        case "Transfer(indexed address,indexed address,uint256)":
        case "VET_TRANSFER(address,address,uint256)":
            if (AddressUtils.compareAddresses(output.params.from, selectedAccount.address))
                return <TokenSendOutput expanded={expanded} output={output} clause={clause} />
            return <TokenReceiveOutput expanded={expanded} output={output} clause={clause} />
        case "Transfer(indexed address,indexed address,indexed uint256)":
            if (AddressUtils.compareAddresses(output.params.from, selectedAccount.address))
                return <NftSendOutput expanded={expanded} output={output} clause={clause} />
            return <NftReceiveOutput expanded={expanded} output={output} clause={clause} />
        case "B3TR_B3trToVot3Swap(address,address,address,address,uint256,uint256)":
        case "B3TR_Vot3ToB3trSwap(address,address,address,address,uint256,uint256)":
            return <NativeB3TRSwapOutput expanded={expanded} output={output} clause={clause} />
        case "B3TR_ActionReward(address,address,uint256,bytes32,string)":
            return <B3TRActionOutput expanded={expanded} output={output} clause={clause} />
        case "B3TR_XAllocationVote(address,uint256,bytes32[],uint256[])":
            return <B3TRRoundVoteOutput expanded={expanded} output={output} clause={clause} />
        case "B3TR_ProposalVote(address,uint256,uint8,string,uint256,uint256)":
            return <B3TRProposalVoteOutput expanded={expanded} output={output} clause={clause} />
        case "B3TR_ProposalDeposit(address,address,uint256,uint256)":
            return <B3TRProposalSupportOutput expanded={expanded} output={output} clause={clause} />
        case "B3TR_ClaimReward(address,address,uint256,uint256)":
        case "B3TR_ClaimReward_V2(address,address,uint256,uint256)":
            return <B3TRClaimRewardsOutput expanded={expanded} output={output} clause={clause} />
        case "FT_VET_Swap(address,address,address,uint256,uint256)":
        case "FT_VET_Swap2(address,address,address,uint256,uint256)":
        case "VET_FT_Swap(address,address,address,uint256,uint256)":
        case "Token_FTSwap(address,address,address,address,uint256,uint256)":
            return <SwapOutput expanded={expanded} output={output} clause={clause} />
        case "STARGATE_CLAIM_REWARDS_BASE(uint256,uint256,address)":
        case "STARGATE_CLAIM_REWARDS_DELEGATE(uint256,uint256,address)":
        case "STARGATE_STAKE(uint256,uint256,uint8,address,bool)":
        case "STARGATE_STAKE_DELEGATE(uint256,uint256,uint8,address,bool,bool)":
        case "STARGATE_DELEGATE(uint256,address,bool)":
        case "STARGATE_UNDELEGATE(uint256)":
        case "STARGATE_UNSTAKE(uint256,uint256,uint8,address)":
            return <StargateBaseOutput expanded={expanded} output={output} clause={clause} />
        case "Approval(indexed address,indexed address,uint256)":
            return <TokenApprovalOutput expanded={expanded} output={output} clause={clause} />
        case "Approval(indexed address,indexed address,indexed uint256)":
            return <NftApprovalOutput expanded={expanded} output={output} clause={clause} />
        case "ApprovalForAll(indexed address,indexed address,bool)":
            //Show the event only if approved == true
            if (output.params.approved) return <NftApprovalOutput expanded={expanded} output={output} clause={clause} />
            return <ContractCallOutput expanded={expanded} output={output} clause={clause} />
        default:
            return <ContractCallOutput expanded={expanded} output={output} clause={clause} />
    }
}
