import { Transaction } from "thor-devkit"

export const connexTransactioReceiptStub: Connex.Thor.Transaction.Receipt = {
    gasUsed: 51462,
    gasPayer: "0x267Dc1dF3e82E6BdAD45156C7c31Aad36DF2B5Fa",
    paid: "0x2ca2dc057b7270000",
    reward: "0xd640ece71d588000",
    reverted: false,
    meta: {
        blockID:
            "0x0002456fe81e6df0548a327faa3c1764eff7c3b7ce5cf1d1d27264818e78ea8c",
        blockNumber: 148847,
        blockTimestamp: 1529917460,
        txID: "0x255576013fd61fa52f69d5d89af8751731d5e9e17215b0dd6c33af51bfe28710",
        txOrigin: "0x267Dc1dF3e82E6BdAD45156C7c31Aad36DF2B5Fa",
    },
    outputs: [
        {
            contractAddress: null,
            events: [],
            transfers: [
                {
                    sender: "0x267dc1df3e82e6bdad45156c7c31aad36df2b5fa",
                    recipient: "0xb2ef3293bb6c886d9e57ba205c46450b6d48a0a1",
                    amount: "0x112209c76de80000",
                },
            ],
        },
        {
            contractAddress: null,
            events: [
                {
                    address: "0x0000000000000000000000000000456E65726779",
                    topics: [
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                        "0x000000000000000000000000267dc1df3e82e6bdad45156c7c31aad36df2b5fa",
                        "0x000000000000000000000000b2ef3293bb6c886d9e57ba205c46450b6d48a0a1",
                    ],
                    data: "0x00000000000000000000000000000000000000000000000000000000000003ff",
                },
            ],
            transfers: [],
        },
    ],
}

export const connexTransactionStub: Connex.Thor.Transaction = {
    id: "0x255576013fd61fa52f69d5d89af8751731d5e9e17215b0dd6c33af51bfe28710",
    chainTag: 0,
    blockRef: "0x0002456e56ae5827",
    expiration: 720,
    clauses: [
        {
            to: "0xB2ef3293Bb6c886d9e57ba205c46450B6d48A0A1",
            value: "1234560000000000000",
            data: "0x",
        },
        {
            to: "0x0000000000000000000000000000456E65726779",
            value: "0",
            data: "0xa9059cbb000000000000000000000000b2ef3293bb6c886d9e57ba205c46450b6d48a0a100000000000000000000000000000000000000000000000000000000000003ff",
        },
    ],
    gasPriceCoef: 0,
    gas: 100000,
    origin: "0x267Dc1dF3e82E6BdAD45156C7c31Aad36DF2B5Fa",
    nonce: "0x164362fbdd0",
    dependsOn: null,
    size: 224,
    meta: {
        blockID:
            "0x0002456fe81e6df0548a327faa3c1764eff7c3b7ce5cf1d1d27264818e78ea8c",
        blockNumber: 148847,
        blockTimestamp: 1529917460,
    },
}

const vetTransactionBody1: Transaction.Body = {
    chainTag: 39,
    blockRef: "0x00cfde3b1f486b72",
    expiration: 18,
    clauses: [
        {
            to: "0x435933c8064b4Ae76bE665428e0307eF2cCFBD68",
            value: "300000000000000000000",
            data: "0x",
        },
    ],
    gasPriceCoef: 0,
    gas: 21000,
    dependsOn: null,
    nonce: "0xc64a13b1",
}

const nftTransactionBody1: Transaction.Body = {
    blockRef: "0x00f48ca6ad3dbcd2",
    chainTag: 74,
    clauses: [
        {
            data: "0x23b872dd0000000000000000000000008d66da6448c6144e894b7cd91fa1ae65310a48550000000000000000000000009e7e737b23dcbdf1cc48d8b7f40fc3b2e3808c960000000000000000000000000000000000000000000000000000000000000021",
            to: "0x21d458a0ac7dc22ee56048a34aa54dcccb541b72",
            value: 0,
        },
    ],
    dependsOn: null,
    expiration: 30,
    gas: 128346,
    gasPriceCoef: 0,
    nonce: "0xc7d8dc04",
}

export const vetTransaction1: Transaction = new Transaction(vetTransactionBody1)

export const dappTransaction1: Transaction = new Transaction({
    chainTag: 39,
    blockRef: "0x00cfde3b1f486b72",
    expiration: 18,
    clauses: connexTransactionStub.clauses,
    gasPriceCoef: 0,
    gas: 21000,
    dependsOn: null,
    nonce: "0xc64a13b1",
})

export const nftTransaction1: Transaction = new Transaction(nftTransactionBody1)
