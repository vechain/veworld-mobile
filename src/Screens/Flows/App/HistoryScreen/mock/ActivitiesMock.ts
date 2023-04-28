import { DIRECTIONS, VET, VTHO } from "~Common"
import {
    Activity,
    ActivityStatus,
    ActivityType,
    ClauseType,
    ConnectedAppTxActivity,
    DelegatedTransactionActivity,
    FungibleTokenActivity,
    SignCertActivity,
} from "~Model"

const FUNGIBLE_TOKEN_ACTIVITIES: FungibleTokenActivity[] = [
    {
        //Send
        from: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        type: ActivityType.FUNGIBLE_TOKEN,
        tokenAddress: VET.address,
        timestamp: 1382337919000,
        direction: DIRECTIONS.UP,
        amount: 1345434553453455434525.3452452,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "1", //Would be the txID
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
    },
    {
        //Receive
        from: "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
        to: ["0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1"],
        type: ActivityType.FUNGIBLE_TOKEN,
        tokenAddress: VTHO.address,
        timestamp: 1482337919000,
        direction: DIRECTIONS.DOWN,
        amount: 111463463463454534534511.3432,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "2", //Would be the txID
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
    },
    {
        //Send
        from: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        type: ActivityType.FUNGIBLE_TOKEN,
        tokenAddress: "0x107a0b0faeb58c1fdef97f37f50e319833ad1b94",
        timestamp: 1682337919000,
        direction: DIRECTIONS.UP,
        amount: 1236536456545.44,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "3", //Would be the txID
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
    },
    {
        //Receive
        from: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        type: ActivityType.VET_TRANSFER,
        tokenAddress: VET.address,
        timestamp: 1682337919000,
        direction: DIRECTIONS.DOWN,
        amount: 34534554354346743636.44,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "4", //Would be the txID
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
    },
    {
        //Send
        from: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        type: ActivityType.FUNGIBLE_TOKEN,
        tokenAddress: "0x1b8ec6c2a45cca481da6f243df0d7a5744afc1f8",
        timestamp: 1982337919000,
        direction: DIRECTIONS.UP,
        amount: 523523876877853532.44,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "5", //Would be the txID
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
    },
    {
        //Send
        from: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        type: ActivityType.VET_TRANSFER,
        tokenAddress: VET.address,
        timestamp: 1682337919000,
        direction: DIRECTIONS.UP,
        amount: 145124211269878768876341242.44,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "6", //Would be the txID
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
    },
]

const CONNECTED_APP_ACTIVITIES: ConnectedAppTxActivity[] = [
    {
        // Connected App
        from: "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        type: ActivityType.CONNECTED_APP_TRANSACTION,
        timestamp: 1582337919000,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "7", //Would be the txID
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        clauseMetadata: [
            {
                data: "0x",
                to: "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
                value: "10000",
                type: ClauseType.CONTRACT_CALL,
            },
        ],
        sender: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        txMessage: [],
    },
    {
        // Connected App
        from: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        type: ActivityType.CONNECTED_APP_TRANSACTION,
        timestamp: 1882337919000,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "8", //Would be the txID
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        clauseMetadata: [
            {
                data: "0x",
                to: "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
                value: "10000",
                type: ClauseType.CONTRACT_CALL,
            },
            {
                data: "0x",
                to: "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
                value: "10000",
                type: ClauseType.DEPLOY_CONTRACT,
            },
        ],
        sender: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        txMessage: [],
    },
]

const SIGN_CERT_ACTIVITIES: SignCertActivity[] = [
    {
        // Sign certificate
        from: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        type: ActivityType.SIGN_CERT,
        timestamp: 1682337919000,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "9", //Would be the txID
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        sender: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        certificate: {
            purpose: "",
            payload: {
                type: "",
                content: "",
            },
            domain: "",
            timestamp: 1682337919000,
            signer: "",
        },
        certMessage: {
            purpose: "agreement",
            payload: {
                type: "text",
                content: "",
            },
        },
    },
    {
        // Sign certificate
        from: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        type: ActivityType.SIGN_CERT,
        timestamp: 1682337919000,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "10", //Would be the txID
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        sender: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        certificate: {
            purpose: "",
            payload: {
                type: "",
                content: "",
            },
            domain: "",
            timestamp: 1682337919000,
            signer: "",
        },
        certMessage: {
            purpose: "identification",
            payload: {
                type: "text",
                content: "",
            },
        },
    },
]

const DELEGATED_TRANSACTION_ACTIVITIES: DelegatedTransactionActivity[] = [
    {
        // Delegated transaction
        from: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        type: ActivityType.DELEGATED_TRANSACTION,
        timestamp: 1682337919000,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "11", //Would be the txID
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
    },
    {
        // Delegated transaction
        from: "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
        to: ["0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1"],
        type: ActivityType.DELEGATED_TRANSACTION,
        timestamp: 1682337919000,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "12", //Would be the txID
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
    },
]

export const ACTIVITIES_MOCK: Activity[] = [
    FUNGIBLE_TOKEN_ACTIVITIES,
    CONNECTED_APP_ACTIVITIES,
    SIGN_CERT_ACTIVITIES,
    DELEGATED_TRANSACTION_ACTIVITIES,
].flat()
