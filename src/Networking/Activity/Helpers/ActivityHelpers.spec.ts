import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { ethers } from "ethers"
import { chainTagToGenesisId, defaultTestNetwork, DIRECTIONS, VET } from "~Constants"
import {
    ActivityEvent,
    ActivityStatus,
    ActivitySupport,
    ActivityType,
    B3trActionActivity,
    B3trClaimRewardActivity,
    B3trProposalSupportActivity,
    B3trProposalVoteActivity,
    B3trSwapB3trToVot3Activity,
    B3trSwapVot3ToB3trActivity,
    B3trUpgradeGmActivity,
    B3trXAllocationVoteActivity,
    FungibleTokenActivity,
    IndexedHistoryEvent,
    Network,
    NonFungibleTokenActivity,
    SwapActivity,
    UnknownTxActivity,
} from "~Model"
import { getDestinationAddressFromClause } from "~Utils/ActivityUtils/ActivityUtils"
import {
    createActivityFromIndexedHistoryEvent,
    createConnectedAppActivity,
    createPendingNFTTransferActivityFromTx,
    createPendingTransferActivityFromTx,
    createSignCertificateActivity,
    eventTypeToActivityType,
} from "./ActivityHelpers"
import { getAmountFromClause } from "~Utils/TransactionUtils/TransactionUtils"
import { TestHelpers } from "~Test"
import { EventTypeResponse } from "~Networking"

const { vetTransaction1, nftTransaction1, token2 } = TestHelpers.data

const toSignedTx = (tx: Transaction) => {
    const randomWallet = ethers.Wallet.createRandom()
    return tx.sign(Buffer.from(randomWallet.privateKey.slice(2), "hex"))
}

describe("createPendingTransferActivityFromTx", () => {
    it("Should return a pending transfer activity", async () => {
        const signed = toSignedTx(vetTransaction1)
        const activity = createPendingTransferActivityFromTx(signed)
        const amount = getAmountFromClause(signed.body.clauses[0])
        expect(activity).toStrictEqual({
            from: signed.origin?.toString() ?? "",
            to: signed.body.clauses.map((clause: TransactionClause) => getDestinationAddressFromClause(clause) ?? ""),
            id: signed.id.toString() ?? "",
            txId: signed.id.toString() ?? "",
            genesisId: chainTagToGenesisId[signed.body.chainTag],
            gasUsed: Number(signed.body.gas),
            clauses: signed.body.clauses,
            delegated: signed.isDelegated,
            status: ActivityStatus.PENDING,
            isTransaction: true,
            timestamp: expect.any(Number),
            gasPayer: (signed.isDelegated ? signed.gasPayer?.toString() : signed.origin?.toString()) ?? "",
            blockNumber: 0,
            type: ActivityType.TRANSFER_VET,
            direction: DIRECTIONS.UP,
            outputs: [],
            amount,
            tokenAddress: "0x0",
        })
    })
})

describe("createPendingNFTTransferActivityFromTx", () => {
    it("Should return a pending NFT transfer activity", () => {
        const signed = toSignedTx(nftTransaction1)
        const activity = createPendingNFTTransferActivityFromTx(signed)
        expect(activity).toStrictEqual({
            from: activity.from,
            to: signed.body.clauses.map((clause: TransactionClause) => getDestinationAddressFromClause(clause) ?? ""),
            id: activity.id,
            txId: activity.id,
            genesisId: chainTagToGenesisId[signed.body.chainTag],
            gasUsed: Number(signed.body.gas),
            clauses: signed.body.clauses,
            delegated: signed.isDelegated,
            status: ActivityStatus.PENDING,
            isTransaction: true,
            timestamp: expect.any(Number),
            gasPayer: (signed.isDelegated ? signed.gasPayer?.toString() : signed.origin?.toString()) ?? "",
            blockNumber: 0,
            direction: DIRECTIONS.UP,
            outputs: [],
            type: ActivityType.TRANSFER_NFT,
            tokenId: activity.tokenId,
            contractAddress: activity.contractAddress,
        })
    })
})

describe("createConnectedAppActivity", () => {
    it("Should create a connected app activity with all fields", () => {
        const network: Network = {
            genesis: { id: "test-genesis" },
        } as Network
        const from = "0x123"
        const name = "Test App"
        const linkUrl = "https://test.app"
        const description = "Test Description"
        const methods = ["method1", "method2"]

        const activity = createConnectedAppActivity(network, from, name, linkUrl, description, methods)

        expect(activity).toEqual({
            from,
            id: expect.any(String),
            type: ActivityType.CONNECTED_APP_TRANSACTION,
            timestamp: expect.any(Number),
            isTransaction: false,
            name,
            linkUrl,
            description,
            methods,
            genesisId: network.genesis.id,
        })
    })

    it("Should create a connected app activity with minimal fields", () => {
        const network: Network = {
            genesis: { id: "test-genesis" },
        } as Network
        const from = "0x123"

        const activity = createConnectedAppActivity(network, from)

        expect(activity).toEqual({
            from,
            id: expect.any(String),
            type: ActivityType.CONNECTED_APP_TRANSACTION,
            timestamp: expect.any(Number),
            isTransaction: false,
            name: undefined,
            linkUrl: undefined,
            description: undefined,
            methods: undefined,
            genesisId: network.genesis.id,
        })
    })
})

describe("createSignCertificateActivity", () => {
    it("Should create a sign certificate activity with all fields", () => {
        const network: Network = {
            genesis: { id: "test-genesis" },
        } as Network
        const from = "0x123"
        const name = "Test Cert"
        const linkUrl = "https://test.cert"
        const content = "Test Content"
        const purpose = "Test Purpose"

        const activity = createSignCertificateActivity(network, from, name, linkUrl, content, purpose)

        expect(activity).toEqual({
            from,
            id: expect.any(String),
            type: ActivityType.SIGN_CERT,
            timestamp: expect.any(Number),
            isTransaction: false,
            name,
            linkUrl,
            content,
            purpose,
            genesisId: network.genesis.id,
        })
    })
})

describe("eventTypeToActivityType", () => {
    it("Should map VET event type to TRANSFER_VET activity type", () => {
        expect(eventTypeToActivityType(EventTypeResponse.VET)).toBe(ActivityType.TRANSFER_VET)
    })

    it("Should map FUNGIBLE_TOKEN event type to TRANSFER_FT activity type", () => {
        expect(eventTypeToActivityType(EventTypeResponse.FUNGIBLE_TOKEN)).toBe(ActivityType.TRANSFER_FT)
    })

    it("Should map NFT event type to TRANSFER_NFT activity type", () => {
        expect(eventTypeToActivityType(EventTypeResponse.NFT)).toBe(ActivityType.TRANSFER_NFT)
    })

    it("Should return undefined for unknown event type", () => {
        expect(eventTypeToActivityType("UNKNOWN" as EventTypeResponse)).toBeUndefined()
    })
})

describe("createActivityFromIndexedHistoryEvent", () => {
    it("Should create a activity from TRANSFER_FT or TRANSFER_SF history event", () => {
        const event: IndexedHistoryEvent = {
            id: "74288e9519f1e81a5decf266c2f226a0e9436b47",
            blockId: "0x014c83beb7dfa0094d177629d44083d30aa977499a8490ec8ec51aaa9088b4ab",
            blockNumber: 21791678,
            blockTimestamp: 1748446000,
            txId: "0xea3122a317bb0c4349462558cbb2dcc038978075672749484f047f4b396763fc",
            origin: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            contractAddress: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
            eventName: ActivityEvent.TRANSFER_FT,
            to: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            from: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            value: "15000000000000000000",
        }
        const activity = createActivityFromIndexedHistoryEvent(
            event,
            "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            defaultTestNetwork,
        ) as FungibleTokenActivity

        expect(activity).toStrictEqual({
            from: activity?.from ?? "",
            to: [...(activity?.to ?? [])],
            id: activity?.id,
            txId: activity?.txId,
            blockNumber: activity?.blockNumber,
            genesisId: defaultTestNetwork.genesis.id,
            isTransaction: activity?.isTransaction ?? false,
            type: ActivityType.TRANSFER_FT,
            timestamp: expect.any(Number),
            gasPayer: activity?.gasPayer,
            delegated: activity?.delegated ?? false,
            status: activity?.status ?? ActivityStatus.SUCCESS,
            amount: activity?.amount ?? "0x0",
            tokenAddress: activity?.tokenAddress ?? "",
            direction: DIRECTIONS.UP,
        })
    })

    it("Should create a activity from TRANSFER_VET history event", () => {
        const event: IndexedHistoryEvent = {
            id: "bf5e9abc3fd431c1f2f54bf1b39e1410ee750a4d",
            blockId: "0x01496f9a1b4c004807bf3269dd3947073dc0fcb3060c04c137fffd60ff11bd6b",
            blockNumber: 21589914,
            blockTimestamp: 1746428300,
            txId: "0xd36d9726d61fa53aede69d9d250f00e5cd9762003eee7ddcf99022fd21f837d5",
            origin: "0x9199828f14cf883c8d311245bec34ec0b51fedcb",
            gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            eventName: ActivityEvent.TRANSFER_VET,
            to: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            from: "0x9199828f14cf883c8d311245bec34ec0b51fedcb",
            value: "1005029210000000000",
        }
        const activity = createActivityFromIndexedHistoryEvent(
            event,
            "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            defaultTestNetwork,
        ) as FungibleTokenActivity

        expect(activity).toStrictEqual({
            from: activity?.from ?? "",
            to: [...(activity?.to ?? [])],
            id: activity?.id,
            txId: activity?.txId,
            blockNumber: activity?.blockNumber,
            genesisId: defaultTestNetwork.genesis.id,
            isTransaction: activity?.isTransaction ?? false,
            type: ActivityType.TRANSFER_VET,
            timestamp: expect.any(Number),
            gasPayer: activity?.gasPayer,
            delegated: activity?.delegated ?? false,
            status: activity?.status ?? ActivityStatus.SUCCESS,
            amount: activity?.amount ?? "0x0",
            tokenAddress: VET.address,
            direction: DIRECTIONS.DOWN,
        })
    })

    it("Should create a activity from TRANSFER_NFT history event", () => {
        const event: IndexedHistoryEvent = {
            id: "e3b2d1d96b169fe9fe974abb506bfd539a366512",
            blockId: "0x014b5afa66b340276f99db09da4219ad6128d82b988a3e7578cdc2745f9406c3",
            blockNumber: 21715706,
            blockTimestamp: 1747686260,
            txId: "0x1058da831987d480a726023be762e0b46ad4fe8ec6fbef0bf657d71bdeeae8c7",
            origin: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            contractAddress: "0x93b8cd34a7fc4f53271b9011161f7a2b5fea9d1f",
            tokenId: "32885",
            eventName: ActivityEvent.TRANSFER_NFT,
            to: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            from: "0x0000000000000000000000000000000000000000",
        }
        const activity = createActivityFromIndexedHistoryEvent(
            event,
            "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            defaultTestNetwork,
        ) as NonFungibleTokenActivity

        expect(activity).toStrictEqual({
            from: activity?.from ?? "",
            to: [...(activity?.to ?? [])],
            id: activity?.id,
            txId: activity?.txId,
            blockNumber: activity?.blockNumber,
            genesisId: defaultTestNetwork.genesis.id,
            isTransaction: activity?.isTransaction ?? false,
            type: ActivityType.TRANSFER_NFT,
            timestamp: expect.any(Number),
            gasPayer: activity?.gasPayer,
            delegated: activity?.delegated ?? false,
            status: activity?.status ?? ActivityStatus.SUCCESS,
            tokenId: activity?.tokenId,
            contractAddress: activity?.contractAddress,
            direction: DIRECTIONS.DOWN,
        })
    })

    it("Should create a activity from SWAP_FT_TO_VET history event", () => {
        const event: IndexedHistoryEvent = {
            id: "44414b36485c0613e2cd80e6bf8bb0044b848697",
            blockId: "0x01440e8e8cc8b60d66e87637b691e3e3501973a5473ff38645ba16f71b098fe6",
            blockNumber: 21237390,
            blockTimestamp: 1742902970,
            txId: "0xdd8d949fb9f2edf6371894ca68cd021bb349771d1b787427278105740cd23ff6",
            origin: "0x79028e3d948bd5873ccf58a69089cac105832129",
            gasPayer: "0x2ed8565915532780365a8037c1f5911806b648e8",
            eventName: ActivityEvent.SWAP_FT_TO_VET,
            to: "0x51d6ebe9131880d9bb7a4259f692507d03583a0c",
            from: "0x79028e3d948bd5873ccf58a69089cac105832129",
            inputToken: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
            inputValue: "115297531471270580463",
            outputValue: "1003579393559298037633",
        }
        const activity = createActivityFromIndexedHistoryEvent(
            event,
            "0x79028e3d948bd5873ccf58a69089cac105832129",
            defaultTestNetwork,
        ) as SwapActivity

        expect(activity).toStrictEqual({
            from: activity?.from ?? "",
            to: [...(activity?.to ?? [])],
            id: activity?.id,
            txId: activity?.txId,
            blockNumber: activity?.blockNumber,
            genesisId: defaultTestNetwork.genesis.id,
            isTransaction: activity?.isTransaction ?? false,
            type: ActivityType.SWAP_FT_TO_VET,
            timestamp: expect.any(Number),
            gasPayer: activity?.gasPayer,
            delegated: activity?.delegated ?? false,
            status: activity?.status ?? ActivityStatus.SUCCESS,
            outputToken: VET.address,
            inputToken: activity?.inputToken,
            inputValue: activity?.inputValue,
            outputValue: activity?.outputValue,
        })
    })

    it("Should create a activity from SWAP_FT_TO_FT history event", () => {
        const event: IndexedHistoryEvent = {
            id: "0774e73d4ac030460e5a7efab7e6db0ba2443ff2",
            blockId: "0x0147c36b5e4bf4d42187e33a6b6795b33870b40e77e6e0f59e58ea8129075a4c",
            blockNumber: 21480299,
            blockTimestamp: 1745332100,
            txId: "0xd1f10f79379275383ae5c2449e4254d213f5a24b96ef11f46fdfba8692364a59",
            origin: "0x79028e3d948bd5873ccf58a69089cac105832129",
            gasPayer: "0x79028e3d948bd5873ccf58a69089cac105832129",
            eventName: ActivityEvent.SWAP_FT_TO_FT,
            to: "0xf21dd7108d93af56fab07423efb90f4a3604da89",
            from: "0x79028e3d948bd5873ccf58a69089cac105832129",
            inputToken: token2.address,
            outputToken: "0x0000000000000000000000000000456e65726779",
            inputValue: "1000000000000000000",
            outputValue: "9744635447392863276",
        }
        const activity = createActivityFromIndexedHistoryEvent(
            event,
            "0x79028e3d948bd5873ccf58a69089cac105832129",
            defaultTestNetwork,
        ) as SwapActivity

        expect(activity).toStrictEqual({
            from: activity?.from ?? "",
            to: [...(activity?.to ?? [])],
            id: activity?.id,
            txId: activity?.txId,
            blockNumber: activity?.blockNumber,
            genesisId: defaultTestNetwork.genesis.id,
            isTransaction: activity?.isTransaction ?? false,
            type: ActivityType.SWAP_FT_TO_FT,
            timestamp: expect.any(Number),
            gasPayer: activity?.gasPayer,
            delegated: activity?.delegated ?? false,
            status: activity?.status ?? ActivityStatus.SUCCESS,
            outputToken: activity?.outputToken,
            inputToken: token2.address,
            inputValue: activity?.inputValue,
            outputValue: activity?.outputValue,
        })
    })

    it("Should create a activity from B3TR_ACTION history event", () => {
        const event: IndexedHistoryEvent = {
            id: "ae169d6218af8ce904f6d806a9739728571aa660",
            blockId: "0x014127c2c3e31d53cb14ce7feaa235cb265b25c1f6ea10793889c16dce7b7db2",
            blockNumber: 21047234,
            blockTimestamp: 1741001260,
            txId: "0xf0b2c0fc13d70194044a5acc55a32bbcbd97ef7ee90ae6d402b5562148c249e6",
            origin: "0xf901020a285e4980b1e8cdcfa7645970bf37c56c",
            gasPayer: "0xf901020a285e4980b1e8cdcfa7645970bf37c56c",
            eventName: ActivityEvent.B3TR_ACTION,
            to: "0x79028e3d948bd5873ccf58a69089cac105832129",
            from: "0x6bee7ddab6c99d5b2af0554eaea484ce18f52631",
            value: "1200000000000000000",
            appId: "0x9643ed1637948cc571b23f836ade2bdb104de88e627fa6e8e3ffef1ee5a1739a",
            // eslint-disable-next-line max-len
            proof: '{"version": 2,"description": "The user made a purchase favoring sustainable choices","proof": {"image":"https://storage.googleapis.com/gcreceipts-public/2025-03-03/1741001248_0x79028e3d948bd5873ccf58a69089cac105832129.jpg"},"impact": {"carbon":8580}}',
        }
        const activity = createActivityFromIndexedHistoryEvent(
            event,
            "0x79028e3d948bd5873ccf58a69089cac105832129",
            defaultTestNetwork,
        ) as B3trActionActivity

        expect(activity).toStrictEqual({
            from: activity?.from ?? "",
            to: [...(activity?.to ?? [])],
            id: activity?.id,
            txId: activity?.txId,
            blockNumber: activity?.blockNumber,
            genesisId: defaultTestNetwork.genesis.id,
            isTransaction: activity?.isTransaction ?? false,
            type: ActivityType.B3TR_ACTION,
            timestamp: expect.any(Number),
            gasPayer: activity?.gasPayer,
            delegated: activity?.delegated ?? false,
            status: activity?.status ?? ActivityStatus.SUCCESS,
            value: activity?.value ?? "0x0",
            appId: activity?.appId,
            proof: activity?.proof,
        })
    })

    it("Should create a activity from B3TR_PROPOSAL_VOTE history event", () => {
        const event: IndexedHistoryEvent = {
            id: "a2d7f354f1d9f36ccd58dbddfe500adb5e4cda83",
            blockId: "0x013f6c2150d06ddfb0059d373f9aa8c4b417493a7225c7efa3d6df54cd5e4578",
            blockNumber: 20933665,
            blockTimestamp: 1739865520,
            txId: "0xf297a93a232417554bc98178fdfc0a24907106af3741d79b442ea5babedd1e36",
            origin: "0x79028e3d948bd5873ccf58a69089cac105832129",
            gasPayer: "0x79028e3d948bd5873ccf58a69089cac105832129",
            eventName: ActivityEvent.B3TR_PROPOSAL_VOTE,
            from: "0x79028e3d948bd5873ccf58a69089cac105832129",
            support: ActivitySupport.FOR,
            votePower: "100876726338000000000",
            voteWeight: "10176113916797018538005",
            proposalId: "31655806200562940514488494169949721604479895426694718449695682679960026660588",
        }
        const activity = createActivityFromIndexedHistoryEvent(
            event,
            "0x79028e3d948bd5873ccf58a69089cac105832129",
            defaultTestNetwork,
        ) as B3trProposalVoteActivity

        expect(activity).toStrictEqual({
            from: activity?.from ?? "",
            to: [...(activity?.to ?? [])],
            id: activity?.id,
            txId: activity?.txId,
            blockNumber: activity?.blockNumber,
            genesisId: defaultTestNetwork.genesis.id,
            isTransaction: activity?.isTransaction ?? false,
            type: ActivityType.B3TR_PROPOSAL_VOTE,
            timestamp: expect.any(Number),
            gasPayer: activity?.gasPayer,
            delegated: activity?.delegated ?? false,
            status: activity?.status ?? ActivityStatus.SUCCESS,
            prposalId: activity?.prposalId,
            support: activity?.support,
            votePower: activity?.votePower,
            voteWeight: activity?.voteWeight,
        })
    })

    it("Should create a activity from B3TR_XALLOCATION_VOTE history event", () => {
        const event: IndexedHistoryEvent = {
            id: "3eebecaf7b8a860fa8629e0ac4b4f271ffbc12e9",
            blockId: "0x013ed64be4bdc590bf7c13add3764dce26c176d386ca41f64e21ed3ae9c96314",
            blockNumber: 20895307,
            blockTimestamp: 1739481940,
            txId: "0x27015250561203ee8992d1e8f29c162ff27169d45875c93e1e9784317aa2fd86",
            origin: "0x79028e3d948bd5873ccf58a69089cac105832129",
            gasPayer: "0x79028e3d948bd5873ccf58a69089cac105832129",
            eventName: ActivityEvent.B3TR_XALLOCATION_VOTE,
            from: "0x79028e3d948bd5873ccf58a69089cac105832129",
            roundId: "33",
            appVotes: [
                {
                    appId: "0x1cdf0d2cc9bb81296647c3b6baae1006471a719e67c6431155db920d71242afb",
                    voteWeight: "10176113916000000000000",
                },
            ],
        }
        const activity = createActivityFromIndexedHistoryEvent(
            event,
            "0x79028e3d948bd5873ccf58a69089cac105832129",
            defaultTestNetwork,
        ) as B3trXAllocationVoteActivity

        expect(activity).toStrictEqual({
            from: activity?.from ?? "",
            to: [...(activity?.to ?? [])],
            id: activity?.id,
            txId: activity?.txId,
            blockNumber: activity?.blockNumber,
            genesisId: defaultTestNetwork.genesis.id,
            isTransaction: activity?.isTransaction ?? false,
            type: ActivityType.B3TR_XALLOCATION_VOTE,
            timestamp: expect.any(Number),
            gasPayer: activity?.gasPayer,
            delegated: activity?.delegated ?? false,
            status: activity?.status ?? ActivityStatus.SUCCESS,
            eventName: ActivityEvent.B3TR_XALLOCATION_VOTE,
            roundId: activity?.roundId,
            appVotes: activity?.appVotes,
        })
    })

    it("Should create a activity from B3TR_CLAIM_REWARD history event", () => {
        const event: IndexedHistoryEvent = {
            id: "1e5d428569781e5af77815cf5bbf62cf18606236",
            blockId: "0x013f491a0289fd835b2814f6e677ba795087a235a30d1100f3da56ab6c71052c",
            blockNumber: 20924698,
            blockTimestamp: 1739775850,
            txId: "0xd0b93c29670fc6dd78d6f7220f6c8b6a6738a527a5f07b67cb96c514939ada1d",
            origin: "0x79028e3d948bd5873ccf58a69089cac105832129",
            gasPayer: "0x79028e3d948bd5873ccf58a69089cac105832129",
            eventName: ActivityEvent.B3TR_CLAIM_REWARD,
            to: "0x79028e3d948bd5873ccf58a69089cac105832129",
            from: "0x838a33af756a6366f93e201423e1425f67ec0fa7",
            value: "190870555160408187028",
            roundId: "33",
        }
        const activity = createActivityFromIndexedHistoryEvent(
            event,
            "0x79028e3d948bd5873ccf58a69089cac105832129",
            defaultTestNetwork,
        ) as B3trClaimRewardActivity

        expect(activity).toStrictEqual({
            from: activity?.from ?? "",
            to: [...(activity?.to ?? [])],
            id: activity?.id,
            txId: activity?.txId,
            blockNumber: activity?.blockNumber,
            genesisId: defaultTestNetwork.genesis.id,
            isTransaction: activity?.isTransaction ?? false,
            type: ActivityType.B3TR_CLAIM_REWARD,
            timestamp: expect.any(Number),
            gasPayer: activity?.gasPayer,
            delegated: activity?.delegated ?? false,
            status: activity?.status ?? ActivityStatus.SUCCESS,
            eventName: "B3TR_CLAIM_REWARD",
            roundId: activity?.roundId,
            value: activity?.value ?? "0x0",
        })
    })

    it("Should create a activity from B3TR_UPGRADE_GM history event", () => {
        const event: IndexedHistoryEvent = {
            id: "1e5d428569781e5af77815cf5bbf62cf18606236",
            blockId: "0x013f491a0289fd835b2814f6e677ba795087a235a30d1100f3da56ab6c71052c",
            blockNumber: 20928698,
            blockTimestamp: 17397758301,
            txId: "0xd0b93c29670fc6dd78d6f7220f6c8b6a6738a527a5f07b67cb96c514939ada1d",
            origin: "0x79028e3d948bd5873ccf58a69089cac105832129",
            gasPayer: "0x79028e3d948bd5873ccf58a69089cac105832129",
            eventName: ActivityEvent.B3TR_UPGRADE_GM,
            to: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            from: "0x838a33af756a6366f93e201423e1425f67ec0fa7",
            value: "190870555160408187028",
            oldLevel: "1",
            newLevel: "2",
        }
        const activity = createActivityFromIndexedHistoryEvent(
            event,
            "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            defaultTestNetwork,
        ) as B3trUpgradeGmActivity

        expect(activity).toStrictEqual({
            from: activity?.from ?? "",
            to: [...(activity?.to ?? [])],
            id: activity?.id,
            txId: activity?.txId,
            blockNumber: activity?.blockNumber,
            genesisId: defaultTestNetwork.genesis.id,
            isTransaction: activity?.isTransaction ?? false,
            type: ActivityType.B3TR_UPGRADE_GM,
            timestamp: expect.any(Number),
            gasPayer: activity?.gasPayer,
            delegated: activity?.delegated ?? false,
            status: activity?.status ?? ActivityStatus.SUCCESS,
            oldLevel: activity?.oldLevel,
            newLevel: activity?.newLevel,
        })
    })

    it("Should create a activity from B3TR_SWAP_B3TR_TO_VOT3 history event", () => {
        const event: IndexedHistoryEvent = {
            id: "e9621063b8ec2bdb663b6e4bf56afd923cb6742f",
            blockId: "0x014bf7d1779a1126384a686f219495cecd893c657820f5bd75489fb505da01d9",
            blockNumber: 21755857,
            blockTimestamp: 1748087780,
            txId: "0x71b3198b89017fc7f91749199eada2eec55641e66fd4540289d31d856866a335",
            origin: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            eventName: ActivityEvent.B3TR_SWAP_B3TR_TO_VOT3,
            to: "0x76ca782b59c74d088c7d2cce2f211bc00836c602",
            from: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            inputToken: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
            outputToken: "0x76ca782b59c74d088c7d2cce2f211bc00836c602",
            inputValue: "1920000000000000000",
            outputValue: "1920000000000000000",
        }
        const activity = createActivityFromIndexedHistoryEvent(
            event,
            "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            defaultTestNetwork,
        ) as B3trSwapB3trToVot3Activity

        expect(activity).toStrictEqual({
            from: activity?.from ?? "",
            to: [...(activity?.to ?? [])],
            id: activity?.id,
            txId: activity?.txId,
            blockNumber: activity?.blockNumber,
            genesisId: defaultTestNetwork.genesis.id,
            isTransaction: activity?.isTransaction ?? false,
            type: ActivityType.B3TR_SWAP_B3TR_TO_VOT3,
            timestamp: expect.any(Number),
            gasPayer: activity?.gasPayer,
            delegated: activity?.delegated ?? false,
            status: activity?.status ?? ActivityStatus.SUCCESS,
            value: activity?.value,
        })
    })

    it("Should create a activity from B3TR_SWAP_VOT3_TO_B3TR history event", () => {
        const event: IndexedHistoryEvent = {
            id: "18eeb08d34e1d89949a64d1ae957d5fe80df1366",
            blockId: "0x0149170b445f4cbcdd03662fa14911fae9867099e67659af15d3e99de9006448",
            blockNumber: 21567243,
            blockTimestamp: 1746201590,
            txId: "0x16f071ad722c8f90bcb94c7b49d0a80c81c28330d61575cf18b3f334e2f4bbe8",
            origin: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            gasPayer: "0x4bd82d9bb98666b39a0ec0ac4dcf3915f7f27fa9",
            eventName: ActivityEvent.B3TR_SWAP_VOT3_TO_B3TR,
            to: "0x4dda7b8709ce14d052f37977f297cd5674371909",
            from: "0x76ca782b59c74d088c7d2cce2f211bc00836c602",
            inputToken: "0x76ca782b59c74d088c7d2cce2f211bc00836c602",
            outputToken: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
            inputValue: "522130000000000000",
            outputValue: "522130000000000000",
        }
        const activity = createActivityFromIndexedHistoryEvent(
            event,
            "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            defaultTestNetwork,
        ) as B3trSwapVot3ToB3trActivity

        expect(activity).toStrictEqual({
            from: activity?.from ?? "",
            to: [...(activity?.to ?? [])],
            id: activity?.id,
            txId: activity?.txId,
            blockNumber: activity?.blockNumber,
            genesisId: defaultTestNetwork.genesis.id,
            isTransaction: activity?.isTransaction ?? false,
            type: ActivityType.B3TR_SWAP_VOT3_TO_B3TR,
            timestamp: expect.any(Number),
            gasPayer: activity?.gasPayer,
            delegated: activity?.delegated ?? false,
            status: activity?.status ?? ActivityStatus.SUCCESS,
            value: activity?.value,
        })
    })

    it("Should create a activity from B3TR_PROPOSAL_SUPPORT history event", () => {
        const event: IndexedHistoryEvent = {
            id: "dad49e3851107857350a1322e2c3c1dcb05318aa",
            blockId: "0x0146bbcd64538fc18ab4e35266cddba720df4c8a1bad3923910693379af80e1e",
            blockNumber: 21412813,
            blockTimestamp: 1744657240,
            txId: "0x711ff1e144910204cbcf4195cbe737b01421d835055e08aa7b800bf29fdb4e99",
            origin: "0x79028e3d948bd5873ccf58a69089cac105832129",
            gasPayer: "0xfc5a8bbff0cfc616472772167024e7cd977f27f6",
            eventName: ActivityEvent.B3TR_PROPOSAL_SUPPORT,
            to: "0x79028e3d948bd5873ccf58a69089cac105832129",
            from: "0x838a33af756a6366f93e201423e1425f67ec0fa7",
            value: "1",
            proposalId: "31655806200562940514488494169949721604479895426694718449695682679960026660588",
        }
        const activity = createActivityFromIndexedHistoryEvent(
            event,
            "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            defaultTestNetwork,
        ) as B3trProposalSupportActivity

        expect(activity).toStrictEqual({
            from: activity?.from ?? "",
            to: [...(activity?.to ?? [])],
            id: activity?.id,
            txId: activity?.txId,
            blockNumber: activity?.blockNumber,
            genesisId: defaultTestNetwork.genesis.id,
            isTransaction: activity?.isTransaction ?? false,
            type: ActivityType.B3TR_PROPOSAL_SUPPORT,
            timestamp: expect.any(Number),
            gasPayer: activity?.gasPayer,
            delegated: activity?.delegated ?? false,
            status: activity?.status ?? ActivityStatus.SUCCESS,
            proposalId: activity?.proposalId,
            value: activity?.value,
        })
    })

    it("Should create a activity from UNKNOWN_TX history event", () => {
        const event: IndexedHistoryEvent = {
            id: "dad49e3851107857350a1322e2c3c1dcb05318aa",
            blockId: "0x0146bbcd64538fc18ab4e35266cddba720df4c8a1bad3923910693379af80e1e",
            blockNumber: 21412813,
            blockTimestamp: 1744657240,
            txId: "0x711ff1e144910204cbcf4195cbe737b01421d835055e08aa7b800bf29fdb4e99",
            origin: "0x79028e3d948bd5873ccf58a69089cac105832129",
            gasPayer: "0xfc5a8bbff0cfc616472772167024e7cd977f27f6",
            reverted: true,
            eventName: ActivityEvent.UNKNOWN_TX,
        }
        const activity = createActivityFromIndexedHistoryEvent(
            event,
            "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            defaultTestNetwork,
        ) as UnknownTxActivity

        expect(activity).toStrictEqual({
            from: activity?.from ?? "",
            to: [...(activity?.to ?? [])],
            id: activity?.id,
            txId: activity?.txId,
            blockNumber: activity?.blockNumber,
            genesisId: defaultTestNetwork.genesis.id,
            isTransaction: activity?.isTransaction ?? false,
            type: ActivityType.UNKNOWN_TX,
            timestamp: expect.any(Number),
            gasPayer: activity?.gasPayer,
            delegated: activity?.delegated ?? false,
            status: ActivityStatus.REVERTED,
        })
    })

    it("Should return null if the event is not valid", () => {
        const event = {
            id: "dad49e3851107857350a1322e2c3c1dcb05318aa",
            blockId: "0x0146bbcd64538fc18ab4e35266cddba720df4c8a1bad3923910693379af80e1e",
            blockNumber: 21412813,
            blockTimestamp: 1744657240,
            txId: "0x711ff1e144910204cbcf4195cbe737b01421d835055e08aa7b800bf29fdb4e99",
            origin: "0x79028e3d948bd5873ccf58a69089cac105832129",
            gasPayer: "0xfc5a8bbff0cfc616472772167024e7cd977f27f6",
            reverted: true,
            eventName: "TEST_EVENT",
        }
        const activity = createActivityFromIndexedHistoryEvent(
            event as IndexedHistoryEvent,
            "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            defaultTestNetwork,
        )

        expect(activity).toBeNull()
    })
})
