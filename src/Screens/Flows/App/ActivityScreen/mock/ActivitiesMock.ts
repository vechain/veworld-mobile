/* eslint-disable max-len */
import { VET, VTHO, DIRECTIONS } from "~Constants"
import {
    Activity,
    ActivityEvent,
    ActivityStatus,
    ActivityType,
    DappTxActivity,
    FungibleTokenActivity,
    SignCertActivity,
    StargateActivity,
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
        id: "0x6a05ecf6a1305ec61fb8ea65bf077589998149fa10d44c80464df6d93cffaf01",
        blockNumber: 123456,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.TRANSFER_VET,
        timestamp: 1382337919000,
        gasUsed: 21000,
        gasPayer: "0xC8049b4003b29AA478758911cE1FEB6A05CeC5F8",
        delegated: true,
        status: ActivityStatus.SUCCESS,
        clauses: [
            {
                to: "0x19f2fe4254a3f8b2feb8c9db1e8309f5ab3dcd78",
                value: "0x2386f26fc10000",
                data: "0x",
            },
        ],

        tokenAddress: VET.address,
        direction: DIRECTIONS.UP,
        amount: 1345434553453455434525.3452452,
        outputs: [],
    },
    {
        //Receive
        from: "0xf6EDf674a43F725EBa52915f0a3A49A2AF4580E6",
        to: ["0x435933c8064b4Ae76bE665428e0307eF2cCFBD68"],
        id: "0x6a05ecf6a1305ec61fb8ea65bf077589998149fa10d44c80464df6d93cffaz01",
        blockNumber: 123456,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.TRANSFER_FT,
        timestamp: 1482337919000,
        gasUsed: 36518,
        gasPayer: "0xf6EDf674a43F725EBa52915f0a3A49A2AF4580E6",
        delegated: false,
        status: ActivityStatus.SUCCESS,
        clauses: [
            {
                to: "0x0000000000000000000000000000456e65726779",
                value: "0x0",
                data: "0xa9059cbb000000000000000000000000435933c8064b4ae76be665428e0307ef2ccfbd68000000000000000000000000000000000000000000000000016345785d8a0000",
            },
        ],

        tokenAddress: VTHO.address,
        direction: DIRECTIONS.DOWN,
        amount: 111463463463454534534511.3452452,
        outputs: [],
    },
    {
        //Receive
        from: "0xf6EDf674a43F725EBa52915f0a3A49A2AF4580E6",
        to: ["0x435933c8064b4Ae76bE665428e0307eF2cCFBD65"],
        id: "0x04f14b921d634d491769dc4310f2e61cf5027fdc0216d97b256b9656b32cba82",
        blockNumber: 15181772,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.TRANSFER_FT,
        timestamp: 1482337912000,
        gasUsed: 36518,
        gasPayer: "0x435933c8064b4Ae76bE665428e0307eF2cCFBD65",
        delegated: true,
        status: ActivityStatus.SUCCESS,
        clauses: [
            {
                to: "0x0000000000000000000000000000456e65726779",
                value: "0x0",
                data: "0xa9059cbb000000000000000000000000435933c8064b4ae76be665428e0307ef2ccfbd68000000000000000000000000000000000000000000000000016345785d8a0000",
            },
        ],

        tokenAddress: VTHO.address,
        direction: DIRECTIONS.DOWN,
        amount: 111463463463454534534511.3452452,
        outputs: [],
    },
    {
        //Send
        from: "0xaa1c3EF9BD8B18d5B59120649Ccf3648432C4aFD",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        id: "0x3468fe89d76559a1e05302629dbf7df7acdb0aa075376ead8b52b2836ffc0179",
        blockNumber: 15181772,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.TRANSFER_VET,
        timestamp: 1382337919000,
        gasUsed: 21000,
        gasPayer: "0xaa1c3EF9BD8B18d5B59120649Ccf3648432C4aFD",
        delegated: false,
        status: ActivityStatus.SUCCESS,
        clauses: [
            {
                to: "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
                value: "0x0",
                data: "0xa9059cbb000000000000000000000000fb7feea374e45bd10997636e5638070af3986fd9000000000000000000000000000000000000000000000000000000000bebc200",
            },
        ],

        tokenAddress: "0x107a0b0faeb58c1fdef97f37f50e319833ad1b94",
        direction: DIRECTIONS.UP,
        amount: 1345434553453455434525.3452452,
        outputs: [],
    },
    {
        //Receive
        from: "0xaa1c3EF9BD8B18d5B59120649Ccf3648432C4aFD",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        id: "0x19be7cdcc6b3c70235923334ecb018093499c5d50787d1eaff41374a6a6ebf15",
        blockNumber: 15181772,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.TRANSFER_VET,
        timestamp: 1482337912000,
        gasUsed: 36518,
        gasPayer: "0x435933c8064b4Ae76bE665428e0307eF2cCFBD65",
        delegated: true,
        status: ActivityStatus.SUCCESS,
        clauses: [
            {
                to: "0x19f2fe4254a3f8b2feb8c9db1e8309f5ab3dcd78",
                value: "0x2386f26fc10000",
                data: "0x",
            },
        ],

        tokenAddress: VET.address,
        direction: DIRECTIONS.DOWN,
        amount: 34534554354346743636.3452452,
        outputs: [],
    },
    {
        //Send
        from: "0xaa1c3EF9BD8B18d5B59120649Ccf3648432C4aFD",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        id: "0x3468fe89d76559a1e05302629dbf7df7acdb0aa075376ead8b52b2866ffc0179",
        blockNumber: 15181775,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.TRANSFER_VET,
        timestamp: 1382337919000,
        gasUsed: 67435,
        gasPayer: "0xaa1c3EF9BD8B18d5B59120649Ccf3648432C4aFD",
        delegated: false,
        status: ActivityStatus.SUCCESS,
        clauses: [
            {
                to: "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
                value: "0x0",
                data: "0xa9059cbb000000000000000000000000fb7feea374e45bd10997636e5638070af3986fd9000000000000000000000000000000000000000000000000000000000bebc200",
            },
        ],

        tokenAddress: "0x89827f7bb951fd8a56f8ef13c5bfee38522f2e1f",
        direction: DIRECTIONS.UP,
        amount: 1345434553453455434525.3452452,
        outputs: [],
    },
    {
        //Send
        from: "0xaa1c3EF9BD8B18d5B59120649Ccf3648432C4aFD",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        id: "0x3468fe89d76559a1e05302629dbf7df7acdb0aa075376egd8b52b2866ffc0179",
        blockNumber: 15181775,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.TRANSFER_VET,
        timestamp: 1382337919000,
        gasUsed: 67435,
        gasPayer: "0xaa1c3EF9BD8B18d5B59120649Ccf3648432C4aFD",
        delegated: false,
        status: ActivityStatus.SUCCESS,
        clauses: [
            {
                to: "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
                value: "0x0",
                data: "0xa9059cbb000000000000000000000000fb7feea374e45bd10997636e5638070af3986fd9000000000000000000000000000000000000000000000000000000000bebc200",
            },
        ],

        tokenAddress: "0x1b8ec6c2a45cca481da6f243df0d7a5744afc1f8",
        direction: DIRECTIONS.UP,
        amount: 1345434553453455434525.3452452,
        outputs: [],
    },
]

const CONNECTED_APP_ACTIVITIES: DappTxActivity[] = [
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
        id: "0x56189da678b222a32e26510617b37ef4de83370aa1149b08a98b51e9ef15f0bh",
        blockNumber: 15181775,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.DAPP_TRANSACTION,
        timestamp: 1382337919000,
        gasUsed: 154645,
        gasPayer: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        delegated: false,
        status: ActivityStatus.SUCCESS,
        clauses: [
            {
                // Transfer VEUSD
                to: "0x4E17357053dA4b473e2daa2c65C2c949545724b8",
                value: "0x0",
                data: "0xa9059cbb000000000000000000000000fb7feea374e45bd10997636e5638070af3986fd9000000000000000000000000000000000000000000000000000000000bebc200",
            },
            {
                // Contract Call
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x0",
                data: "0x23421234525252525235454354324324235",
            },
            {
                // Transfer SHA
                to: "0x5db3c8a942333f6468176a870db36eef120a34dc",
                value: "0x0",
                data: "0xa9059cbb000000000000000000000000879d546e641a5e39a6f253f1f4854189c018b701000000000000000000000000000000000000000000000021e19e0c9bab240000",
            },
            {
                // Contract Call
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x0",
                data: "0x23421234525252525235454354324324235",
            },
            {
                // Transfer YEET
                to: "0xae4c53b120cba91a44832f875107cbc8fbee185c",
                value: "0x0",
                data: "0xa9059cbb0000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db004800000000000000000000000000000000000000000000000340aad21b3b700000",
            },
            {
                // Contract Call
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x0",
                data: "0x23421234525252525235454354324324235",
            },
        ],
        outputs: [],
    },
    {
        // Connected App
        from: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        id: "0x56189da678b222a32e26510617b37ef4de83370aa1149b08a98b51e9ef15f0bb",
        blockNumber: 15181775,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.DAPP_TRANSACTION,
        timestamp: 1382337919000,
        gasUsed: 154645,
        gasPayer: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        delegated: false,
        status: ActivityStatus.SUCCESS,
        clauses: [
            {
                // Deploy contract when no destination
                to: "",
                value: "0x0",
                data: "0xgayu8fgasufasuhfas",
            },
            {
                // VET transfer
                to: "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
                value: "0x2386f26fc10000",
                data: "0x",
            },
            {
                // Contract Call
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x0",
                data: "0x23421234525252525235454354324324235",
            },
            {
                // Transfer SHA
                to: "0x5db3c8a942333f6468176a870db36eef120a34dc",
                value: "0x0",
                data: "0xa9059cbb000000000000000000000000879d546e641a5e39a6f253f1f4854189c018b701000000000000000000000000000000000000000000000021e19e0c9bab240000",
            },
            {
                // Contract Call
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x0",
                data: "0x23421234525252525235454354324324235",
            },
            {
                // Transfer YEET
                to: "0xae4c53b120cba91a44832f875107cbc8fbee185c",
                value: "0x0",
                data: "0xa9059cbb0000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db004800000000000000000000000000000000000000000000000340aad21b3b700000",
            },
            {
                // Contract Call
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x0",
                data: "0x23421234525252525235454354324324235",
            },
        ],
        outputs: [],
    },
]

const SIGN_CERT_ACTIVITIES: SignCertActivity[] = [
    {
        // Sign certificate
        from: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        id: "0x56189da678b222a32e26510kfn537ef4de83370aa1149b08a98b51e9ef15f0bb",
        blockNumber: 15181775,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.SIGN_CERT,
        timestamp: 1382337919000,
        gasUsed: 154645,
        gasPayer: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        delegated: false,
        status: ActivityStatus.SUCCESS,
        clauses: [],

        linkUrl: "https://app.verocket.com",
        outputs: [],
    },
    {
        // Sign certificate
        from: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        to: ["0x67C0F9A8eD050253694bbE5E156D92Acd1023889"],
        id: "0x56189da678b222a32e26516h47b37ef4de83370aa1149b08a98b51e9ef15f0bb",
        blockNumber: 15181775,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.SIGN_CERT,
        timestamp: 1382337919000,
        gasUsed: 154645,
        gasPayer: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        delegated: false,
        status: ActivityStatus.SUCCESS,
        clauses: [],

        linkUrl: "https://app.verocket.com",
        outputs: [],
    },
]

const STARGATE_ACTIVITIES: StargateActivity[] = [
    {
        // Delegate VET
        from: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        to: ["0x576da7124c7bb65a692d95848276367e5a844d95"],
        id: "0x7a15dcf5a1205ec61fb8ea65bf077589998149fa10d44c80464df6d93cffaf11",
        blockNumber: 15181780,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.STARGATE_DELEGATE,
        timestamp: 1682337919000,
        gasUsed: 65432,
        gasPayer: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        delegated: false,
        status: ActivityStatus.SUCCESS,
        clauses: [
            {
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x0",
                data: "0x1234567890abcdef1234567890abcdef12345678",
            },
        ],
        outputs: [],
        eventName: ActivityEvent.STARGATE_DELEGATE,
        value: "10000000000000000000000",
        levelId: "0",
        tokenId: "VET",
    },
    {
        // Undelegate VET
        from: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        to: ["0x576da7124c7bb65a692d95848276367e5a844d95"],
        id: "0x8b26edf6b2306fc72gd9fb76cg188690009250gb21e55d91575eg7e04egfbg22",
        blockNumber: 15181785,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.STARGATE_UNDELEGATE,
        timestamp: 1682437919000,
        gasUsed: 58124,
        gasPayer: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        delegated: false,
        status: ActivityStatus.SUCCESS,
        clauses: [
            {
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x0",
                data: "0xabcdef1234567890abcdef1234567890abcdef12",
            },
        ],
        outputs: [],
        eventName: ActivityEvent.STARGATE_UNDELEGATE,
        value: "5000000000000000000000",
        levelId: "1",
        tokenId: "VET",
    },
    {
        // Stake VOT3
        from: "0xa123456789012345678901234567890123456789",
        to: ["0x576da7124c7bb65a692d95848276367e5a844d95"],
        id: "0x9c37feg7c3417gd83he0gc87dh299701110361hc32f66e02686fh8f15fhgch33",
        blockNumber: 15181790,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.STARGATE_STAKE,
        timestamp: 1682537919000,
        gasUsed: 72156,
        gasPayer: "0xa123456789012345678901234567890123456789",
        delegated: true,
        status: ActivityStatus.SUCCESS,
        clauses: [
            {
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x0",
                data: "0xdef1234567890abcdef1234567890abcdef123456",
            },
        ],
        outputs: [],
        eventName: ActivityEvent.STARGATE_STAKE,
        value: "25000000000000000000000",
        levelId: "2",
        tokenId: "VOT3",
    },
    {
        // Unstake B3TR
        from: "0xb234567890123456789012345678901234567890",
        to: ["0x576da7124c7bb65a692d95848276367e5a844d95"],
        id: "0xad48ghb8d4528he94if1hd98ei410812221472id43g77f13797gi9g26gihdj44",
        blockNumber: 15181795,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.STARGATE_UNSTAKE,
        timestamp: 1682637919000,
        gasUsed: 54321,
        gasPayer: "0xb234567890123456789012345678901234567890",
        delegated: false,
        status: ActivityStatus.SUCCESS,
        clauses: [
            {
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x0",
                data: "0x567890abcdef1234567890abcdef1234567890ab",
            },
        ],
        outputs: [],
        eventName: ActivityEvent.STARGATE_UNSTAKE,
        value: "15000000000000000000000",
        levelId: "3",
        tokenId: "B3TR",
    },
    {
        // Claim Rewards
        from: "0xc345678901234567890123456789012345678901",
        to: ["0x576da7124c7bb65a692d95848276367e5a844d95"],
        id: "0xbe59hic9e5639jf05jg2ie09fj521923332583je54h88g24808hj0h37hjiek55",
        blockNumber: 15181800,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.STARGATE_CLAIM_REWARDS,
        timestamp: 1682737919000,
        gasUsed: 43287,
        gasPayer: "0xc345678901234567890123456789012345678901",
        delegated: true,
        status: ActivityStatus.SUCCESS,
        clauses: [
            {
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x0",
                data: "0x90abcdef1234567890abcdef1234567890abcdef",
            },
        ],
        outputs: [],
        eventName: ActivityEvent.STARGATE_CLAIM_REWARDS,
        value: "3450000000000000000000",
        tokenId: "VET",
    },
    {
        // Additional Delegate with different levelId
        from: "0xd456789012345678901234567890123456789012",
        to: ["0x576da7124c7bb65a692d95848276367e5a844d95"],
        id: "0xcf60hjd0f6740kg16kh3jf10gk632034443694kf65i99h35919ik1i48ik",
        blockNumber: 15181805,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.STARGATE_DELEGATE,
        timestamp: 1682837919000,
        gasUsed: 67890,
        gasPayer: "0xd456789012345678901234567890123456789012",
        delegated: false,
        status: ActivityStatus.SUCCESS,
        clauses: [
            {
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x0",
                data: "0xcdef1234567890abcdef1234567890abcdef1234",
            },
        ],
        outputs: [],
        eventName: ActivityEvent.STARGATE_DELEGATE,
        value: "50000000000000000000000",
        levelId: "4",
        tokenId: "VET",
    },
    {
        // Failed Stake Transaction
        from: "0xe567890123456789012345678901234567890123",
        to: ["0x576da7124c7bb65a692d95848276367e5a844d95"],
        id: "0xdg71ike1g7851lh27li4kg21hl743145554705lg76j00i46020jl2j59jlmfl66",
        blockNumber: 15181810,
        isTransaction: true,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        type: ActivityType.STARGATE_STAKE,
        timestamp: 1682937919000,
        gasUsed: 21000,
        gasPayer: "0xe567890123456789012345678901234567890123",
        delegated: false,
        status: ActivityStatus.REVERTED,
        clauses: [
            {
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x0",
                data: "0xef1234567890abcdef1234567890abcdef123456",
            },
        ],
        outputs: [],
        eventName: ActivityEvent.STARGATE_STAKE,
        value: "8000000000000000000000",
        levelId: "5",
        tokenId: "VOT3",
    },
]

export const ACTIVITIES_MOCK: Activity[] = [
    FUNGIBLE_TOKEN_ACTIVITIES,
    CONNECTED_APP_ACTIVITIES,
    SIGN_CERT_ACTIVITIES,
    STARGATE_ACTIVITIES,
].flat()
