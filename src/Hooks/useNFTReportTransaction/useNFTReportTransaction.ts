import { useCallback } from "react"
import { abi, Transaction } from "thor-devkit"
import { abis } from "~Constants"
import { NFT_BLACKLIST_CONTRACT, NFT_BLACKLIST_CONTRACT_TESTNET } from "~Constants/Constants/NFT"
import { useBlockchainNetwork } from "~Hooks/useBlockchainNetwork"

export const useNFTReportTransaction = () => {
    const { isMainnet } = useBlockchainNetwork()
    const blacklistContract = isMainnet ? NFT_BLACKLIST_CONTRACT : NFT_BLACKLIST_CONTRACT_TESTNET

    const buildReportClause = useCallback(
        (nftAddress: string): Transaction.Clause[] => {
            const reportAbi = abis.NFTBlacklist.NFTBlacklistAbis.report
            if (!reportAbi) {
                throw new Error("Function abi not found for reporting NFT collection")
            }
            const reportData = new abi.Function(reportAbi).encode(nftAddress)
            return [
                {
                    to: blacklistContract,
                    data: reportData,
                    value: "0x0",
                },
            ]
        },
        [blacklistContract],
    )

    return { buildReportClause }
}
