import { DIRECTIONS } from "~Common/Enums/Transactions"
import { VET, VTHO } from "~Common/Constant"
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
        from: "0xaa1c3EF9BD8B18d5B59120649Ccf3648432C4aFD",
        to: [
            "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
            "0xc8049b4003B29Aa478758911CE1FEb6A05CEC5F4",
            "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        ],
        type: ActivityType.FUNGIBLE_TOKEN,
        tokenAddress: VET.address,
        timestamp: 1382337919000,
        direction: DIRECTIONS.UP,
        amount: 1345434553453455434525.3452452,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "0x6a05ecf6a1305ec61fb8ea65bf077589998149fa10d44c80464df6d93cffaf01",
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        txReceipt: {
            gasUsed: 21000,
            gasPayer: "0xC8049b4003b29AA478758911cE1FEB6A05CeC5F8",
            paid: "",
            reward: "",
            reverted: false,
            outputs: [
                {
                    contractAddress: "0x",
                    events: [
                        {
                            address: "",
                            topics: [""],
                            data: "",
                        },
                    ],
                    transfers: [
                        {
                            sender: "",
                            recipient: "",
                            amount: "",
                        },
                    ],
                },
            ],
            meta: {
                blockID: "",
                blockNumber: 15181772,
                blockTimestamp: 0,
                txID: "",
                txOrigin: "",
            },
        },
    },
    {
        //Receive
        from: "0xf6EDf674a43F725EBa52915f0a3A49A2AF4580E6",
        to: ["0x435933c8064b4Ae76bE665428e0307eF2cCFBD68"],
        type: ActivityType.FUNGIBLE_TOKEN,
        tokenAddress: VTHO.address,
        timestamp: 1482337919000,
        direction: DIRECTIONS.DOWN,
        amount: 111463463463454534534511.3432,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "0x04f14b921d634d491769dc4310f2e61cf5027fdc0216d97b256b9659b32cba82",
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        txReceipt: {
            gasUsed: 21000,
            gasPayer: "0xC8049b4003b29AA478758911cE1FEB6A05CeC5F8",
            paid: "",
            reward: "",
            reverted: false,
            outputs: [
                {
                    contractAddress: "0x",
                    events: [
                        {
                            address: "",
                            topics: [""],
                            data: "",
                        },
                    ],
                    transfers: [
                        {
                            sender: "",
                            recipient: "",
                            amount: "",
                        },
                    ],
                },
            ],
            meta: {
                blockID: "",
                blockNumber: 15181772,
                blockTimestamp: 0,
                txID: "",
                txOrigin: "",
            },
        },
    },
    {
        //Receive
        from: "0xf6EDf674a43F725EBa52915f0a3A49A2AF4580E6",
        to: ["0x435933c8064b4Ae76bE665428e0307eF2cCFBD65"],
        type: ActivityType.FUNGIBLE_TOKEN,
        tokenAddress: VTHO.address,
        timestamp: 1482337919000,
        direction: DIRECTIONS.DOWN,
        amount: 4534545345345435345.3432,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "0x04f14b921d634d491769dc4310f2e61cf5027fdc0216d97b256b9656b32cba82",
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        txReceipt: {
            gasUsed: 21000,
            gasPayer: "0xC8049b4003b29AA478758911cE1FEB6A05CeC5F8",
            paid: "",
            reward: "",
            reverted: false,
            outputs: [
                {
                    contractAddress: "0x",
                    events: [
                        {
                            address: "",
                            topics: [""],
                            data: "",
                        },
                    ],
                    transfers: [
                        {
                            sender: "",
                            recipient: "",
                            amount: "",
                        },
                    ],
                },
            ],
            meta: {
                blockID: "",
                blockNumber: 15181772,
                blockTimestamp: 0,
                txID: "",
                txOrigin: "",
            },
        },
    },
    {
        //Send
        from: "0xaa1c3EF9BD8B18d5B59120649Ccf3648432C4aFD",
        to: [
            "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
            "0x435933c8064b4Ae76bE665428e0307eF2cCFBD68",
            "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
            "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B4",
            "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B8",
        ],
        type: ActivityType.FUNGIBLE_TOKEN,
        tokenAddress: "0x107a0b0faeb58c1fdef97f37f50e319833ad1b94",
        timestamp: 1682337919000,
        direction: DIRECTIONS.UP,
        amount: 1236536456545.44,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "0x3468fe89d76559a1e05302629dbf7df7acdb0aa075376ead8b52b2836ffc0179",
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        txReceipt: {
            gasUsed: 21000,
            gasPayer: "0xC8049b4003b29AA478758911cE1FEB6A05CeC5F8",
            paid: "",
            reward: "",
            reverted: false,
            outputs: [
                {
                    contractAddress: "0x",
                    events: [
                        {
                            address: "",
                            topics: [""],
                            data: "",
                        },
                    ],
                    transfers: [
                        {
                            sender: "",
                            recipient: "",
                            amount: "",
                        },
                    ],
                },
            ],
            meta: {
                blockID: "",
                blockNumber: 15181772,
                blockTimestamp: 0,
                txID: "",
                txOrigin: "",
            },
        },
    },
    {
        //Receive
        from: "0xaa1c3EF9BD8B18d5B59120649Ccf3648432C4aFD",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        type: ActivityType.VET_TRANSFER,
        tokenAddress: VET.address,
        timestamp: 1682337919000,
        direction: DIRECTIONS.DOWN,
        amount: 34534554354346743636.44,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "0x19be7cdcc6b3c70235923334ecb018093499c5d50787d1eaff41374a6a6ebf15",
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        txReceipt: {
            gasUsed: 21000,
            gasPayer: "0xC8049b4003b29AA478758911cE1FEB6A05CeC5F8",
            paid: "",
            reward: "",
            reverted: false,
            outputs: [
                {
                    contractAddress: "0x",
                    events: [
                        {
                            address: "",
                            topics: [""],
                            data: "",
                        },
                    ],
                    transfers: [
                        {
                            sender: "",
                            recipient: "",
                            amount: "",
                        },
                    ],
                },
            ],
            meta: {
                blockID: "",
                blockNumber: 15181772,
                blockTimestamp: 0,
                txID: "",
                txOrigin: "",
            },
        },
    },
    {
        //Send
        from: "0xaa1c3EF9BD8B18d5B59120649Ccf3648432C4aFD",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        type: ActivityType.FUNGIBLE_TOKEN,
        tokenAddress: "0x1b8ec6c2a45cca481da6f243df0d7a5744afc1f8",
        timestamp: 1982337919000,
        direction: DIRECTIONS.UP,
        amount: 523523876877853532.44,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "0x665b1cddb01a33de794244267cf1da9579b8a48c40cf6be0335154f81c24b152",
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        txReceipt: {
            gasUsed: 21000,
            gasPayer: "0xC8049b4003b29AA478758911cE1FEB6A05CeC5F8",
            paid: "",
            reward: "",
            reverted: false,
            outputs: [
                {
                    contractAddress: "0x",
                    events: [
                        {
                            address: "",
                            topics: [""],
                            data: "",
                        },
                    ],
                    transfers: [
                        {
                            sender: "",
                            recipient: "",
                            amount: "",
                        },
                    ],
                },
            ],
            meta: {
                blockID: "",
                blockNumber: 15181772,
                blockTimestamp: 0,
                txID: "",
                txOrigin: "",
            },
        },
    },
    {
        //Send
        from: "0xaa1c3EF9BD8B18d5B59120649Ccf3648432C4aFD",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        type: ActivityType.VET_TRANSFER,
        tokenAddress: VET.address,
        timestamp: 1682337919000,
        direction: DIRECTIONS.UP,
        amount: 145124211269878768876341242.44,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "0x56189da678b222a32e26510617b37ef4de83370aa1149b08a98b51e9ef15f0ba",
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        txReceipt: {
            gasUsed: 21000,
            gasPayer: "0xC8049b4003b29AA478758911cE1FEB6A05CeC5F8",
            paid: "",
            reward: "",
            reverted: false,
            outputs: [
                {
                    contractAddress: "0x",
                    events: [
                        {
                            address: "",
                            topics: [""],
                            data: "",
                        },
                    ],
                    transfers: [
                        {
                            sender: "",
                            recipient: "",
                            amount: "",
                        },
                    ],
                },
            ],
            meta: {
                blockID: "",
                blockNumber: 15181772,
                blockTimestamp: 0,
                txID: "",
                txOrigin: "",
            },
        },
    },
]

const CONNECTED_APP_ACTIVITIES: ConnectedAppTxActivity[] = [
    {
        // Connected App
        from: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        to: [
            "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
            "0x435933c8064b4Ae76bE665428e0307eF2cCFBD68",
            "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
            "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B4",
            "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B8",
        ],
        type: ActivityType.CONNECTED_APP_TRANSACTION,
        timestamp: 1582337919000,
        linkUrl: "https://app.verocket.com",
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "0x56189da678b222a32e26510617b37ef4de83370aa1149b08a98b51e9ef15f0bh",
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        clauseMetadata: [
            {
                data: "0x123734534545",
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "10000",
                type: ClauseType.TRANSFER,
                tokenSymbol: "VTHO",
            },
            {
                data: "0x23421234525252525235454354324324235",
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "10000",
                type: ClauseType.CONTRACT_CALL,
            },
            {
                data: "0x74712345",
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "10000",
                type: ClauseType.TRANSFER,
                tokenSymbol: "VTHO",
            },
            {
                data: "0x754712345252526575675525234324324235",
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "10000",
                type: ClauseType.CONTRACT_CALL,
            },
            {
                data: "0x547512345",
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "10000",
                type: ClauseType.TRANSFER,
                tokenSymbol: "VTHO",
            },
            {
                data: "0x12423465624324235",
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "10000",
                type: ClauseType.CONTRACT_CALL,
            },
        ],
        sender: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        txMessage: [],
        txReceipt: {
            gasUsed: 21000,
            gasPayer: "0xC8049b4003b29AA478758911cE1FEB6A05CeC5F8",
            paid: "",
            reward: "",
            reverted: false,
            outputs: [
                {
                    contractAddress: "0x",
                    events: [
                        {
                            address: "",
                            topics: [""],
                            data: "",
                        },
                    ],
                    transfers: [
                        {
                            sender: "",
                            recipient: "",
                            amount: "",
                        },
                    ],
                },
            ],
            meta: {
                blockID: "",
                blockNumber: 15181772,
                blockTimestamp: 0,
                txID: "",
                txOrigin: "",
            },
        },
    },
    {
        // Connected App
        from: "0xaa1c3EF9BD8B18d5B59120649Ccf3648432C4aFD",
        to: [
            "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
            "0xc8049b4003B29Aa478758911CE1FEb6A05CEC5F4",
            "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        ],
        type: ActivityType.CONNECTED_APP_TRANSACTION,
        timestamp: 1882337919000,
        linkUrl: "https://app.safeswap.io/",
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "0x56189da678b222a32e26510617b37ef4de83370aa1149b08a98b51e9ef15f0bz",
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        clauseMetadata: [
            {
                data: "0345435x",
                to: "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
                value: "10000",
                type: ClauseType.CONTRACT_CALL,
            },
            {
                data: "035345x",
                to: "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
                value: "10000",
                type: ClauseType.DEPLOY_CONTRACT,
                abi: {
                    name: "transfer",
                    type: "function",
                    inputs: [
                        {
                            name: "recipient",
                            type: "address",
                        },
                        {
                            name: "amount",

                            type: "uint256",
                        },
                    ],
                },
            },
        ],
        sender: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        txMessage: [],
        txReceipt: {
            gasUsed: 21000,
            gasPayer: "0xC8049b4003b29AA478758911cE1FEB6A05CeC5F8",
            paid: "",
            reward: "",
            reverted: false,
            outputs: [
                {
                    contractAddress: "0x",
                    events: [
                        {
                            address: "",
                            topics: [""],
                            data: "",
                        },
                    ],
                    transfers: [
                        {
                            sender: "",
                            recipient: "",
                            amount: "",
                        },
                    ],
                },
            ],
            meta: {
                blockID: "",
                blockNumber: 15181772,
                blockTimestamp: 0,
                txID: "",
                txOrigin: "",
            },
        },
    },
]

const SIGN_CERT_ACTIVITIES: SignCertActivity[] = [
    {
        // Sign certificate
        from: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        type: ActivityType.SIGN_CERT,
        timestamp: 1682337919000,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "0x04f14b921d634d491769dc4310f2e61cf5027fdc0216d97b256b9659b32cba87",
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        sender: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        linkUrl: "https://app.verocket.com",
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
                content: "Sign in to use VeRocket",
            },
        },
    },
    {
        // Sign certificate
        from: "0x435933c8064b4Ae76bE665428e0307eF2cCFBD68",
        type: ActivityType.SIGN_CERT,
        timestamp: 1682337919000,
        genesisId:
            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        id: "0x04f14b921d634d491769dc4310f2e61cf5027fdc0216d97b256b9659b32cba89",
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        sender: "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
        linkUrl: "https://app.safeswap.io/",
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
                content: "Sign in to use SafeSwap",
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
        id: "11",
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
        id: "12",
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
