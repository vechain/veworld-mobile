import { queryOptions } from "@tanstack/react-query"
import { ABIContract, Address, Clause, VIP181_ABI } from "@vechain/sdk-core"
import { ContractClause, ThorClient } from "@vechain/sdk-network"

const getNftNameAndSymbol = async (address: string, thor: ThorClient) => {
    const clauses: ContractClause[] = [
        {
            clause: Clause.callFunction(Address.of(address), ABIContract.ofAbi(VIP181_ABI).getFunction("name"), []),
            functionAbi: ABIContract.ofAbi(VIP181_ABI).getFunction("name"),
        },
        {
            clause: Clause.callFunction(Address.of(address), ABIContract.ofAbi(VIP181_ABI).getFunction("symbol"), []),
            functionAbi: ABIContract.ofAbi(VIP181_ABI).getFunction("symbol"),
        },
    ]

    const results = await thor.contracts.executeMultipleClausesCall(clauses)

    if (results.some(result => !result.success)) {
        throw new Error("Failed to get NFT collection metadata")
    }

    return {
        name: results[0].result.plain as string,
        symbol: results[1].result.plain as string,
    }
}

export const getNftNameAndSymbolOptions = (address: string, genesisId: string, thorClient: ThorClient) =>
    queryOptions({
        queryKey: ["NFT", "NAME_SYMBOL", genesisId, address],
        queryFn: () => getNftNameAndSymbol(address, thorClient),
        staleTime: 24 * 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
    })
