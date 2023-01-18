import type { abi } from "thor-devkit"
import { NETWORK_TYPE } from "~Model"
import vip180 from "./abis/VIP180.abi"

const paramsGet: abi.Function.Definition = {
    constant: true,
    inputs: [{ name: "_key", type: "bytes32" }],
    name: "get",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
}

export const abis = {
    vip180,
    paramsGet,
}

export const genesises = {
    get main(): Connex.Thor.Block {
        return {
            number: 0,
            id: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
            size: 170,
            parentID:
                "0xffffffff53616c757465202620526573706563742c20457468657265756d2100",
            timestamp: 1530316800,
            gasLimit: 10000000,
            beneficiary: "0x0000000000000000000000000000000000000000",
            gasUsed: 0,
            totalScore: 0,
            txsRoot:
                "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
            txsFeatures: 0,
            stateRoot:
                "0x09bfdf9e24dd5cd5b63f3c1b5d58b97ff02ca0490214a021ed7d99b93867839c",
            receiptsRoot:
                "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
            signer: "0x0000000000000000000000000000000000000000",
            isTrunk: true,
            transactions: [],
        }
    },
    get test(): Connex.Thor.Block {
        return {
            number: 0,
            id: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
            size: 170,
            parentID:
                "0xffffffff00000000000000000000000000000000000000000000000000000000",
            timestamp: 1530014400,
            gasLimit: 10000000,
            beneficiary: "0x0000000000000000000000000000000000000000",
            gasUsed: 0,
            totalScore: 0,
            txsRoot:
                "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
            txsFeatures: 0,
            stateRoot:
                "0x4ec3af0acbad1ae467ad569337d2fe8576fe303928d35b8cdd91de47e9ac84bb",
            receiptsRoot:
                "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
            signer: "0x0000000000000000000000000000000000000000",
            isTrunk: true,
            transactions: [],
        }
    },
    get solo(): Connex.Thor.Block {
        return {
            number: 0,
            id: "0x00000000c05a20fbca2bf6ae3affba6af4a74b800b585bf7a4988aba7aea69f6",
            size: 170,
            parentID:
                "0xffffffff00000000000000000000000000000000000000000000000000000000",
            timestamp: 1526400000,
            gasLimit: 10000000,
            beneficiary: "0x0000000000000000000000000000000000000000",
            gasUsed: 0,
            totalScore: 0,
            txsRoot:
                "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
            txsFeatures: 0,
            stateRoot:
                "0x93de0ffb1f33bc0af053abc2a87c4af44594f5dcb1cb879dd823686a15d68550",
            receiptsRoot:
                "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
            signer: "0x0000000000000000000000000000000000000000",
            isTrunk: true,
            transactions: [],
        }
    },
    which(gid: string) {
        switch (gid) {
            case this.main.id:
                return NETWORK_TYPE.MAIN
            case this.test.id:
                return NETWORK_TYPE.TEST
            case this.solo.id:
                return NETWORK_TYPE.SOLO
            default:
                return NETWORK_TYPE.OTHER
        }
    },
}

export const DEFAULT_GAS_COEFFICIENT = 0

export const BASE_GAS_PRICE =
    "0x000000000000000000000000000000000000626173652d6761732d7072696365"
