import { ActivityStatus, ActivityType, DappTxActivity, FungibleTokenActivity } from "~Model"

export const mockDappTxActivity: DappTxActivity = {
    id: "test-dapp-activity",
    blockNumber: 123456,
    timestamp: Date.now(),
    type: ActivityType.DAPP_TRANSACTION,
    from: "0x123456789abcdef",
    to: ["0x987654321fedcba"],
    status: ActivityStatus.SUCCESS,
    isTransaction: true,
    delegated: false,
    name: "Test DApp Transaction",
    linkUrl: "https://testdapp.com",
    txId: "0xabcdef123456789",
    genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
}

export const mockDappTxActivityNoBlock: DappTxActivity = {
    ...mockDappTxActivity,
    id: "test-dapp-activity-no-block",
    blockNumber: undefined,
    status: ActivityStatus.REVERTED,
}

export const mockFungibleTokenActivity: FungibleTokenActivity = {
    id: "test-ft-activity",
    blockNumber: 123456,
    timestamp: Date.now(),
    type: ActivityType.TRANSFER_FT,
    amount: "1000000000000000000",
    tokenAddress: "0x0000000000000000000000000000456e65726779",
    direction: "UP" as any,
    from: "0x123456789abcdef",
    to: ["0x987654321fedcba"],
    status: ActivityStatus.SUCCESS,
    isTransaction: true,
    delegated: false,
    txId: "0xabcdef123456789",
    genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
}

export const mockFungibleTokenActivityNoBlock: FungibleTokenActivity = {
    ...mockFungibleTokenActivity,
    id: "test-ft-activity-no-block",
    blockNumber: undefined,
}

export const validatorExitEventMock = {
    id: "d99f7ed3c97f33fb22b66ec9fa04a7a1e901267c",
    blockId: "0x0165257444eb8474763e85863f8592566504eaeeeb8cdbf63e6dfd6dd407d0d9",
    blockNumber: 23405940,
    blockTimestamp: 1764097820,
    txId: "0xcb78555b3a93f9356070582672994de96607e186104c8342217b1d568f5374de",
    origin: "0x1234",
    tokenId: "15676",
    eventName: "STARGATE_DELEGATION_EXITED_VALIDATOR",
    owner: "0x1234",
    validator: "0x79bvalidator",
    delegationId: "58",
}

export const validatorExitEventsMock = [
    {
        id: "d99f7ed3c97f33fb22b66ec9fa04a7a1e901267c",
        blockId: "0x0165257444eb8474763e85863f8592566504eaeeeb8cdbf63e6dfd6dd407d0d9",
        blockNumber: 23405940,
        blockTimestamp: 1764097820,
        txId: "0xcb78555b3a93f9356070582672994de96607e186104c8342217b1d568f5374de",
        origin: "0x1234",
        tokenId: "15676",
        eventName: "STARGATE_DELEGATION_EXITED_VALIDATOR",
        owner: "0x1234",
        validator: "0x79bvalidator",
        delegationId: "58",
    },
    {
        id: "d99f7ed3c97f33fb22b66ec9fa04a7a1e901249a",
        blockId: "0x0165257444eb8474763e85863f8592566504eaeeeb8cdbf63e6dfd6dd407d1c9",
        blockNumber: 23405941,
        blockTimestamp: 1764097820,
        txId: "0xcb78555b3a93f9356070582672994de96607e186104c8342217b1d568f5374de",
        origin: "0x16834",
        tokenId: "15674",
        eventName: "STARGATE_DELEGATION_EXITED_VALIDATOR",
        owner: "0x16834",
        validator: "0x79b68validator",
        delegationId: "572",
    },
]
