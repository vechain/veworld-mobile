import { Activity, ActivityStatus, ActivityType, Token } from "~Model"
import ActivityUtils from "."
import { genesises } from "~Constants"

const SHA_TOKEN: Token = {
    name: "Safe Haven",
    symbol: "SHA",
    address: "0x5db3c8a942333f6468176a870db36eef120a34dc",
    desc: "Asset Management & Inheritance Solutions",
    icon: "735a5e4a70116463649aa9c508b5d18361f10ab7.png",
    custom: true,
}

const YEET_TOKEN: Token = {
    name: "Yeet Coin",
    symbol: "YEET",
    address: "0xae4c53b120cba91a44832f875107cbc8fbee185c",
    desc: "Alpaca memes",
    icon: "2e434b45fdbf3ea1d2676d3270ad8877221aefd1.png",
    custom: true,
}

const SAMPLE_ACCOUNT = "0x63792f9baef181e44fc5f81918809fb98e4f71c5"

const SAMPLE_CONTRACT_ADDRESS = "0x63792f9baef181e44fc5f81918809fb98e4f71c5"

// Mock data
const tokenTransferClause1: Connex.VM.Clause = {
    to: SHA_TOKEN.address,
    value: "0x",
    data: "0xa9059cbb0000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db004800000000000000000000000000000000000000000000000340aad21b3b700000",
}

const tokenTransferClause2: Connex.VM.Clause = {
    to: YEET_TOKEN.address,
    value: "0x",
    data: "0xa9059cbb0000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db004800000000000000000000000000000000000000000000000340aad21b3b700000",
}

const vetTransferClause: Connex.VM.Clause = {
    to: SAMPLE_ACCOUNT,
    value: "0x215a1794693c777000000",
    data: "0x",
}
const contractCallClause: Connex.VM.Clause = {
    to: SAMPLE_CONTRACT_ADDRESS,
    value: "0x",
    data: "0x1234567",
}

const nftTransferClause: Connex.VM.Clause = {
    to: "0xC8ebceCb1438b9A00eA1003c956C3e0b83aa0EC3",
    value: "0x",
    data: "0x23b872dd000000000000000000000000cf130b42ae31c4931298b4b1c0f1d974b8732957000000000000000000000000f077b491b355e64048ce21e3a6fc4751eeea77fa0000000000000000000000000000000000000000000000000000000000000e15",
}

const BASE_SAMPLE_ACTIVITY = {
    //Send
    from: SAMPLE_ACCOUNT,
    to: [
        "0x67C0F9A8eD050253694bbE5E156D92Acd1023889",
        "0xc8049b4003B29Aa478758911CE1FEb6A05CEC5F4",
        "0x4F4e906d3De39A7F2952d3D9Cf84C0cA4Cb476B1",
    ],
    id: "0x6a05ecf6a1305ec61fb8ea65bf077589998149fa10d44c80464df6d93cffaf01",
    blockNumber: 123456,
    isTransaction: true,
    genesisId: genesises.main.id,
    timestamp: 1382337919000,
    gasUsed: 21000,
    gasPayer: SAMPLE_ACCOUNT,
    delegated: true,
    status: ActivityStatus.SUCCESS,
    clauses: [vetTransferClause, contractCallClause],
    outputs: [],
}

describe("getActivityTypeFromClause", () => {
    test("should return CONNECTED_APP_TRANSACTION when there are multiple clauses", () => {
        const clauses = [contractCallClause, tokenTransferClause1]
        const type = ActivityUtils.getActivityTypeFromClause(clauses)
        expect(type).toBe(ActivityType.CONNECTED_APP_TRANSACTION)
    })

    test("should return FUNGIBLE_TOKEN when the clause is token transfer", () => {
        const clauses = [tokenTransferClause1]
        const type = ActivityUtils.getActivityTypeFromClause(clauses)
        expect(type).toBe(ActivityType.FUNGIBLE_TOKEN)
    })

    test("should return VET_TRANSFER when the clause is vet transfer", () => {
        const clauses = [vetTransferClause]
        const type = ActivityUtils.getActivityTypeFromClause(clauses)
        expect(type).toBe(ActivityType.VET_TRANSFER)
    })

    test("should return CONNECTED_APP_TRANSACTION when the clause is not vet transfer or token transfer", () => {
        const clauses = [contractCallClause]
        const type = ActivityUtils.getActivityTypeFromClause(clauses)
        expect(type).toBe(ActivityType.CONNECTED_APP_TRANSACTION)
    })
})

describe("getDestinationAddressFromClause", () => {
    test("should return the destination address of the token transfer", () => {
        const tokenData = {
            to: "0x3ca506f873e5819388aa3ce0b1c4fc77b6db0048",
            amount: 60000000000000000000,
        }

        const address =
            ActivityUtils.getDestinationAddressFromClause(tokenTransferClause2)
        expect(address).toBe(tokenData?.to)
    })

    test("should return the destination address of the clause", () => {
        const address =
            ActivityUtils.getDestinationAddressFromClause(contractCallClause)

        expect(address).toBe(contractCallClause.to)
    })

    test("should return the destination address of nft transfer", () => {
        const address =
            ActivityUtils.getDestinationAddressFromClause(nftTransferClause)

        const expectedAddress = "0xf077b491b355e64048ce21e3a6fc4751eeea77fa"

        expect(address).toBe(expectedAddress)
    })
})

describe("isTransactionActivity", () => {
    test("should return true for a transaction activity", () => {
        const activity: Activity = {
            ...BASE_SAMPLE_ACTIVITY,
            type: ActivityType.CONNECTED_APP_TRANSACTION,
        }
        const isTransaction = ActivityUtils.isTransactionActivity(activity)
        expect(isTransaction).toBe(true)
    })

    test("should return true for a fungible token activity", () => {
        const activity: Activity = {
            ...BASE_SAMPLE_ACTIVITY,
            type: ActivityType.FUNGIBLE_TOKEN,
        }
        const isTransaction = ActivityUtils.isTransactionActivity(activity)
        expect(isTransaction).toBe(true)
    })

    test("should return true for a vet transfer activity", () => {
        const activity: Activity = {
            ...BASE_SAMPLE_ACTIVITY,
            type: ActivityType.VET_TRANSFER,
        }
        const isTransaction = ActivityUtils.isTransactionActivity(activity)
        expect(isTransaction).toBe(true)
    })

    test("should return true for a delegated transaction activity", () => {
        const activity: Activity = {
            ...BASE_SAMPLE_ACTIVITY,
            type: ActivityType.DELEGATED_TRANSACTION,
        }
        const isTransaction = ActivityUtils.isTransactionActivity(activity)
        expect(isTransaction).toBe(true)
    })

    test("should return false for a non-transaction activity", () => {
        const activity: Activity = {
            ...BASE_SAMPLE_ACTIVITY,
            isTransaction: false,
            type: ActivityType.SIGN_CERT,
        }
        const isTransaction = ActivityUtils.isTransactionActivity(activity)
        expect(isTransaction).toBe(false)
    })
})
