import { ABIContract, Address, Clause, VIP181_ABI } from "@vechain/sdk-core"
import { ContractClause, ThorClient } from "@vechain/sdk-network"

export const getNftCollectionMetadata = async (address: string, thor: ThorClient) => {
    const clauses: ContractClause[] = [
        {
            clause: Clause.callFunction(Address.of(address), ABIContract.ofAbi(VIP181_ABI).getFunction("name"), []),
            functionAbi: ABIContract.ofAbi(VIP181_ABI).getFunction("name"),
        },
        {
            clause: Clause.callFunction(Address.of(address), ABIContract.ofAbi(VIP181_ABI).getFunction("symbol"), []),
            functionAbi: ABIContract.ofAbi(VIP181_ABI).getFunction("symbol"),
        },
        {
            clause: Clause.callFunction(
                Address.of(address),
                ABIContract.ofAbi([
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
                ]).getFunction("totalSupply"),
                [],
            ),
            functionAbi: ABIContract.ofAbi([
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
            ]).getFunction("totalSupply"),
        },
    ]

    const results = await thor.contracts.executeMultipleClausesCall(clauses)

    if (results.slice(0, 2).some(result => !result.success)) {
        throw new Error("Failed to get NFT collection metadata")
    }

    return {
        name: results[0].result.plain as string,
        symbol: results[1].result.plain as string,
        totalSupply: results[2].success ? Number(results[2].result.plain) : undefined,
    }
}
