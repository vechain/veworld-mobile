import { render, screen } from "@testing-library/react-native"
import React from "react"
import { ActivitySectionList } from "./ActivitySectionList"

import { TestWrapper } from "~Test"

import {
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
    LoginActivity,
    SwapActivity,
    UnknownTxActivity,
    VeVoteCastActivity,
} from "~Model"

const activities = [
    {
        from: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        to: ["0x0e73ea971849e16ca9098a7a987130e1a53eeab1"],
        id: "74288e9519f1e81a5decf266c2f226a0e9436b47",
        txId: "0xea3122a317bb0c4349462558cbb2dcc038978075672749484f047f4b396763fc",
        blockNumber: 21791678,
        genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        isTransaction: true,
        type: "TRANSFER_FT",
        timestamp: 1748446000000,
        gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        delegated: false,
        status: "SUCCESS",
        amount: "15000000000000000000",
        tokenAddress: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
        direction: "+",
    } as FungibleTokenActivity,
    {
        from: "0x9199828f14cf883c8d311245bec34ec0b51fedcb",
        to: ["0x0e73ea971849e16ca9098a7a987130e1a53eeab1"],
        id: "bf5e9abc3fd431c1f2f54bf1b39e1410ee750a4d",
        txId: "0xd36d9726d61fa53aede69d9d250f00e5cd9762003eee7ddcf99022fd21f837d5",
        blockNumber: 21589914,
        genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        isTransaction: true,
        type: "TRANSFER_VET",
        timestamp: 1746428300000,
        gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        delegated: true,
        status: "SUCCESS",
        amount: "1005029210000000000",
        tokenAddress: "0x0",
        direction: "-",
    } as FungibleTokenActivity,
    {
        from: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        to: ["0x51d6ebe9131880d9bb7a4259f692507d03583a0c"],
        id: "44414b36485c0613e2cd80e6bf8bb0044b848697",
        txId: "0xdd8d949fb9f2edf6371894ca68cd021bb349771d1b787427278105740cd23ff6",
        blockNumber: 21237390,
        genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        isTransaction: true,
        type: "SWAP_FT_TO_VET",
        timestamp: 1742902970000,
        gasPayer: "0x2ed8565915532780365a8037c1f5911806b648e8",
        delegated: true,
        status: "SUCCESS",
        outputToken: "0x0",
        inputToken: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
        inputValue: "115297531471270580463",
        outputValue: "1003579393559298037633",
    } as SwapActivity,
    {
        from: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        to: ["0xf21dd7108d93af56fab07423efb90f4a3604da89"],
        id: "0774e73d4ac030460e5a7efab7e6db0ba2443ff2",
        txId: "0xd1f10f79379275383ae5c2449e4254d213f5a24b96ef11f46fdfba8692364a59",
        blockNumber: 21480299,
        genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        isTransaction: true,
        type: "SWAP_FT_TO_FT",
        timestamp: 1745332100000,
        gasPayer: "0x79028e3d948bd5873ccf58a69089cac105832129",
        delegated: false,
        status: "SUCCESS",
        inputToken: "0x5db3c8a942333f6468176a870db36eef120a34dc",
        outputToken: "0x0000000000000000000000000000456e65726779",
        inputValue: "1000000000000000000",
        outputValue: "9744635447392863276",
    } as SwapActivity,
    {
        from: "0x6bee7ddab6c99d5b2af0554eaea484ce18f52631",
        to: ["0x0e73ea971849e16ca9098a7a987130e1a53eeab1"],
        id: "ae169d6218af8ce904f6d806a9739728571aa660",
        txId: "0xf0b2c0fc13d70194044a5acc55a32bbcbd97ef7ee90ae6d402b5562148c249e6",
        blockNumber: 21047234,
        genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        isTransaction: false,
        type: "B3TR_ACTION",
        timestamp: 1741001260000,
        gasPayer: "0xf901020a285e4980b1e8cdcfa7645970bf37c56c",
        delegated: false,
        status: "SUCCESS",
        value: "1200000000000000000",
        appId: "0x9643ed1637948cc571b23f836ade2bdb104de88e627fa6e8e3ffef1ee5a1739a",
        // eslint-disable-next-line max-len
        proof: '{"version": 2,"description": "The user made a purchase favoring sustainable choices","proof": {"image":"https://storage.googleapis.com/gcreceipts-public/2025-03-03/1741001248_0x79028e3d948bd5873ccf58a69089cac105832129.jpg"},"impact": {"carbon":8580}}',
    } as B3trActionActivity,

    {
        from: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        to: [],
        id: "a2d7f354f1d9f36ccd58dbddfe500adb5e4cda83",
        txId: "0xf297a93a232417554bc98178fdfc0a24907106af3741d79b442ea5babedd1e36",
        blockNumber: 20933665,
        genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        isTransaction: false,
        type: "B3TR_PROPOSAL_VOTE",
        timestamp: 1739865520000,
        gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        delegated: false,
        status: "SUCCESS",
        prposalId: "31655806200562940514488494169949721604479895426694718449695682679960026660588",
        support: "FOR",
        votePower: "100876726338000000000",
        voteWeight: "10176113916797018538005",
    } as B3trProposalVoteActivity,

    {
        from: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        to: [],
        id: "3eebecaf7b8a860fa8629e0ac4b4f271ffbc12e9",
        txId: "0x27015250561203ee8992d1e8f29c162ff27169d45875c93e1e9784317aa2fd86",
        blockNumber: 20895307,
        genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        isTransaction: false,
        type: "B3TR_XALLOCATION_VOTE",
        timestamp: 1739481940000,
        gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        delegated: false,
        status: "SUCCESS",
        eventName: "B3TR_XALLOCATION_VOTE",
        roundId: "33",
        appVotes: [
            {
                appId: "0x1cdf0d2cc9bb81296647c3b6baae1006471a719e67c6431155db920d71242afb",
                voteWeight: "10176113916000000000000",
            },
        ],
    } as B3trXAllocationVoteActivity,

    {
        from: "0x838a33af756a6366f93e201423e1425f67ec0fa7",
        to: ["0x0e73ea971849e16ca9098a7a987130e1a53eeab1"],
        id: "1e5d428569781e5af77815cf5bbf62cf18606236",
        txId: "0xd0b95c29670fc6dd78d6f7220f6c8b6a6738a527a5f07b67cb96c514939ada1d",
        blockNumber: 20924698,
        genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        isTransaction: false,
        type: "B3TR_CLAIM_REWARD",
        timestamp: 1739775850000,
        gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        delegated: false,
        status: "SUCCESS",
        eventName: "B3TR_CLAIM_REWARD",
        value: "190870555160408187028",
        roundId: "33",
    } as B3trClaimRewardActivity,

    {
        from: "0x838a33af756a6366f93e201423e1425f67ec0fa7",
        to: ["0x0e73ea971849e16ca9098a7a987130e1a53eeab1"],
        id: "1e5d428569781e5af77815cf5bbf62cf18606236",
        txId: "0xd0b93c29670fc6dd78d6f7220f6c8b6a6738a527a5f07b67cb96c514939ada1d",
        blockNumber: 20928698,
        genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        isTransaction: false,
        type: "B3TR_UPGRADE_GM",
        timestamp: 17397758301000,
        gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        delegated: false,
        status: "SUCCESS",
        oldLevel: "1",
        newLevel: "2",
    } as B3trUpgradeGmActivity,

    {
        from: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        to: ["0x76ca782b59c74d088c7d2cce2f211bc00836c602"],
        id: "e9621063b8ec2bdb663b6e4bf56afd923cb6742f",
        txId: "0x71b3198b89017fc7f91749199eada2eec55641e66fd4540289d31d856866a335",
        blockNumber: 21755857,
        genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        isTransaction: false,
        type: "B3TR_SWAP_B3TR_TO_VOT3",
        timestamp: 1748087780000,
        gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        delegated: false,
        status: "SUCCESS",
        value: "1920000000000000000",
    } as B3trSwapB3trToVot3Activity,

    {
        from: "0x76ca782b59c74d088c7d2cce2f211bc00836c602",
        to: ["0x4dda7b8709ce14d052f37977f297cd5674371909"],
        id: "18eeb08d34e1d89949a64d1ae957d5fe80df1366",
        txId: "0x16f071ad722c8f90bcb94c7b49d0a80c81c28330d61575cf18b3f334e2f4bbe8",
        blockNumber: 21567243,
        genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        isTransaction: false,
        type: "B3TR_SWAP_VOT3_TO_B3TR",
        timestamp: 1746201590000,
        gasPayer: "0x4bd82d9bb98666b39a0ec0ac4dcf3915f7f27fa9",
        delegated: true,
        status: "SUCCESS",
        value: "522130000000000000",
    } as B3trSwapVot3ToB3trActivity,

    {
        from: "0x838a33af756a6366f93e201423e1425f67ec0fa7",
        to: ["0x0e73ea971849e16ca9098a7a987130e1a53eeab1"],
        id: "dad49e3851107857350a1322e2c3c1dcb05318aa",
        txId: "0x711ff1e144910204cbcf4195cbe737b01421d835055e08aa7b800bf29fdb4e99",
        blockNumber: 21412813,
        genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        isTransaction: false,
        type: "B3TR_PROPOSAL_SUPPORT",
        timestamp: 1744657240000,
        gasPayer: "0xfc5a8bbff0cfc616472772167024e7cd977f27f6",
        delegated: true,
        status: "SUCCESS",
        value: "1",
        proposalId: "31655806200562940514488494169949721604479895426694718449695682679960026660588",
    } as B3trProposalSupportActivity,

    {
        from: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        to: [],
        id: "ded49e3851107857350a1323e2c3c1dcb05311aa",
        txId: "0x219ff1e144910204cbcf4195cbe737b01421d835055e08aa7b800bf29fdb4e99",
        blockNumber: 21412814,
        genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        isTransaction: false,
        type: "UNKNOWN_TX",
        timestamp: 1744657240010,
        gasPayer: "0xfc5a8bbff0cfc616472772167024e7cd977f27f6",
        delegated: true,
        status: "REVERTED",
        eventName: "UNKNOWN_TX",
    } as UnknownTxActivity,
    {
        eventName: "VEVOTE_VOTE_CAST",
        from: "0xf6EDf674a43F725EBa52915f0a3A49A2AF4580E6",
        to: ["0x435933c8064b4Ae76bE665428e0307eF2cCFBD68"],
        id: "0x6a05ecf6a1305ec61fb8ea65bf077589998149fa10d44c80464df6d93cffaz03",
        isTransaction: true,
        proposalId: "",
        timestamp: 1482337919000,
        type: "VEVOTE_VOTE_CAST",
        blockNumber: 21412814,
        genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        gasPayer: "0xfc5a8bbff0cfc616472772167024e7cd977f27f6",
        delegated: true,
    } as VeVoteCastActivity,
    {
        from: "0xf6EDf674a43F725EBa52915f0a3A49A2AF4580E6",
        to: ["0x435933c8064b4Ae76bE665428e0307eF2cCFBD68"],
        id: "0x6a05ecf6a1305ec61fb8ea65bf077589998149fa10d44c80464df6d93cffaz04",
        isTransaction: true,
        timestamp: 1482337929999,
        type: ActivityType.DAPP_LOGIN,
        blockNumber: 21412814,
        genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        gasPayer: "0xfc5a8bbff0cfc616472772167024e7cd977f27f6",
        delegated: true,
        linkUrl: "https://vechain.org",
        kind: "simple",
        value: null,
    } satisfies LoginActivity,
]

describe("ActivitySectionList", () => {
    it("should render the activity section list", () => {
        render(
            <ActivitySectionList
                activities={activities}
                fetchActivities={jest.fn()}
                refreshActivities={jest.fn()}
                isFetching={false}
                isRefreshing={false}
                veBetterDaoDapps={[]}
                initialNumToRender={100}
            />,
            { wrapper: TestWrapper },
        )

        const activityBoxes = screen.getAllByTestId(/^FT-TRANSFER-/i)
        expect(activityBoxes).toHaveLength(2)
        expect(activityBoxes[0]).toBeOnTheScreen()
        expect(activityBoxes[1]).toBeOnTheScreen()

        const swapActivityBoxes = screen.getAllByTestId(/^SWAP-/i)
        expect(swapActivityBoxes).toHaveLength(2)
        expect(swapActivityBoxes[0]).toBeOnTheScreen()
        expect(swapActivityBoxes[1]).toBeOnTheScreen()

        const b3trActivityBoxes = screen.getAllByTestId(/^B3TR-/i)
        expect(b3trActivityBoxes).toHaveLength(8)
        expect(b3trActivityBoxes[0]).toBeOnTheScreen()
        expect(b3trActivityBoxes[1]).toBeOnTheScreen()
        expect(b3trActivityBoxes[2]).toBeOnTheScreen()
        expect(b3trActivityBoxes[3]).toBeOnTheScreen()
        expect(b3trActivityBoxes[4]).toBeOnTheScreen()
        expect(b3trActivityBoxes[5]).toBeOnTheScreen()
        expect(b3trActivityBoxes[6]).toBeOnTheScreen()
        expect(b3trActivityBoxes[7]).toBeOnTheScreen()

        const unknownTxActivityBoxes = screen.getAllByTestId(/^UNKNOWN-TX-/i)
        expect(unknownTxActivityBoxes).toHaveLength(1)
        expect(unknownTxActivityBoxes[0]).toBeOnTheScreen()

        const veVoteActivityBoxes = screen.getAllByTestId(/^VEVOTE-CAST-/i)
        expect(veVoteActivityBoxes).toHaveLength(1)
        expect(veVoteActivityBoxes[0]).toBeOnTheScreen()

        const dappLoginActivityBoxes = screen.getAllByTestId(/^DAPP-LOGIN-/i)
        expect(dappLoginActivityBoxes).toHaveLength(1)
        expect(dappLoginActivityBoxes[0]).toBeOnTheScreen()
    })
})
