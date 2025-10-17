import { queryOptions } from "@tanstack/react-query"
import { ABIContract, Address, Clause, VIP181_ABI } from "@vechain/sdk-core"
import { ContractCallError } from "@vechain/sdk-errors"
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
        throw new Error("Failed to get NFT collection name and symbol")
    }

    return {
        name: results[0].result.plain as string,
        symbol: results[1].result.plain as string,
    }
}

const getNftTotalSupply = async (address: string, thor: ThorClient) => {
    try {
        const [supply] = await thor.contracts
            .load(address, [
                {
                    inputs: [],
                    name: "totalSupply",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
            ])
            .read.totalSupply()

        return {
            totalSupply: supply,
        }
    } catch (e) {
        //errorMessage = '' means that the method probably reverted because it wasn't found
        if (e instanceof ContractCallError && e.errorMessage === "") {
            return {
                totalSupply: undefined,
            }
        }
        throw e
    }
}

export const getNftNameAndSymbolOptions = (address: string, genesisId: string, thorClient: ThorClient) =>
    queryOptions({
        queryKey: ["NFT", "DETAILS", "NAME_SYMBOL", genesisId, address],
        queryFn: () => getNftNameAndSymbol(address, thorClient),
        staleTime: 24 * 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
        retry: 3,
    })

export const getNftTotalSupplyOptions = (address: string, genesisId: string, thorClient: ThorClient) =>
    queryOptions({
        queryKey: ["NFT", "DETAILS", "SUPPLY", genesisId, address],
        queryFn: () => getNftTotalSupply(address, thorClient),
        staleTime: 60 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
    })
