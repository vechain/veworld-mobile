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
