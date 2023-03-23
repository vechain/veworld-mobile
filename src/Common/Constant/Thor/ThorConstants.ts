import type { abi } from "thor-devkit"
import vip180 from "./abis/VIP180.abi"
import { NETWORK_TYPE } from "~Model"
import uuid from "react-native-uuid"

const THOR_MAIN_URLS = [
    "https://mainnet.vechain.org",
    "https://vethor-node.vechain.com",
    "https://mainnet.veblocks.net",
    "https://mainnet.vecha.in",
]

const THOR_TESTNET_URLS = [
    "https://testnet.vechain.org",
    "https://vethor-node-test.vechaindev.com",
    "https://sync-testnet.veblocks.net",
    "https://testnet.vecha.in",
]

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

export const genesisesId = {
    get main(): string {
        return "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a"
    },
    get test(): string {
        return "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127"
    },
}

export const DEFAULT_GAS_COEFFICIENT = 0

export const BASE_GAS_PRICE =
    "0x000000000000000000000000000000000000626173652d6761732d7072696365"

export const makeNetwork = (type: NETWORK_TYPE) => {
    switch (type) {
        case NETWORK_TYPE.MAIN:
            return {
                defaultNet: true,
                id: uuid.v4().toString(),
                tag: NETWORK_TYPE.MAIN,
                type: NETWORK_TYPE.MAIN,
                urls: THOR_MAIN_URLS,
                currentUrl: THOR_MAIN_URLS[0],
                genesisId: genesisesId.main,
            }

        case NETWORK_TYPE.TEST:
            return {
                defaultNet: true,
                id: uuid.v4().toString(),
                tag: NETWORK_TYPE.TEST,
                type: NETWORK_TYPE.TEST,
                urls: THOR_TESTNET_URLS,
                currentUrl: THOR_TESTNET_URLS[0],
                genesisId: genesisesId.test,
            }

        default:
            return {
                defaultNet: true,
                id: uuid.v4().toString(),
                tag: NETWORK_TYPE.MAIN,
                type: NETWORK_TYPE.MAIN,
                urls: THOR_MAIN_URLS,
                currentUrl: THOR_MAIN_URLS[0],
                genesisId: genesisesId.main,
            }
    }
}
