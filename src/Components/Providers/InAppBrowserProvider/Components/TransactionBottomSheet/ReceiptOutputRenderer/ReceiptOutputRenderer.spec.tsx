import { screen } from "@testing-library/react-native"
import { TransactionClause } from "@vechain/sdk-core"
import { ethers } from "ethers"
import React from "react"
import { B3TR, VOT3 } from "~Constants"
import { RootState } from "~Storage/Redux/Types"
import { TestHelpers, TestWrapper } from "~Test"
import { ReceiptOutputRenderer } from "./ReceiptOutputRenderer"

const { renderComponentWithProps } = TestHelpers.render

const clauses = [
    {
        data: "0x0",
        to: ethers.Wallet.createRandom().address,
        value: "0x0",
    },
] satisfies TransactionClause[]

describe("ReceiptOutputRenderer", () => {
    describe("B3TR", () => {
        const appId = "0xapp"
        const appName = "TEST"
        const preloadedState: Partial<RootState> = {
            discovery: {
                bannerInteractions: {},
                connectedApps: [],
                custom: [],
                favorites: [],
                featured: [
                    {
                        veBetterDaoId: appId,
                        amountOfNavigations: 0,
                        createAt: Date.now(),
                        href: "https://vebetterdao.org",
                        isCustom: false,
                        name: appName,
                    },
                ],
                hasOpenedDiscovery: false,
                tabsManager: {
                    currentTabId: null,
                    tabs: [],
                },
            },
        }
        it("B3TR Action", () => {
            renderComponentWithProps(
                <ReceiptOutputRenderer
                    expanded
                    clauses={clauses}
                    output={{
                        clauseIndex: 0,
                        name: "B3TR_ActionReward(address,address,uint256,bytes32,string)",
                        params: {
                            appId: appId,
                            from: "0x0",
                            proof: "",
                            to: "0x0",
                            value: ethers.utils.parseEther("1").toBigInt(),
                        },
                    }}
                />,
                {
                    wrapper: TestWrapper,
                    initialProps: {
                        preloadedState,
                    },
                },
            )

            expect(screen.getByTestId("B3TR_APP")).toHaveTextContent(appName)
            expect(screen.getByTestId("B3TR_ACTION_VALUE")).toHaveTextContent("+ 1.00 B3TR")
        })
        describe("B3TR Claim rewards", () => {
            it("Claim rewards v1", () => {
                renderComponentWithProps(
                    <ReceiptOutputRenderer
                        expanded
                        clauses={clauses}
                        output={{
                            clauseIndex: 0,
                            name: "B3TR_ClaimReward(address,address,uint256,uint256)",
                            params: {
                                from: "0x0",
                                to: "0x0",
                                roundId: 1n,
                                value: ethers.utils.parseEther("1").toBigInt(),
                            },
                        }}
                    />,
                    {
                        wrapper: TestWrapper,
                        initialProps: {
                            preloadedState,
                        },
                    },
                )
                expect(screen.getByTestId("B3TR_CLAIM_REWARDS_VALUE")).toHaveTextContent("+ 1.00 B3TR")
            })
            it("Claim rewards v2", () => {
                renderComponentWithProps(
                    <ReceiptOutputRenderer
                        expanded
                        clauses={clauses}
                        output={{
                            clauseIndex: 0,
                            name: "B3TR_ClaimReward_V2(address,address,uint256,uint256)",
                            params: {
                                from: "0x0",
                                to: "0x0",
                                roundId: 1n,
                                value: ethers.utils.parseEther("1").toBigInt(),
                            },
                        }}
                    />,
                    {
                        wrapper: TestWrapper,
                        initialProps: {
                            preloadedState,
                        },
                    },
                )
                expect(screen.getByTestId("B3TR_CLAIM_REWARDS_VALUE")).toHaveTextContent("+ 1.00 B3TR")
            })
        })
        it("B3TR Proposal support", () => {
            renderComponentWithProps(
                <ReceiptOutputRenderer
                    expanded
                    clauses={clauses}
                    output={{
                        clauseIndex: 0,
                        name: "B3TR_ProposalDeposit(address,address,uint256,uint256)",
                        params: {
                            from: "0x0",
                            to: "0x0",
                            proposalId: 1n,
                            value: 1n,
                        },
                    }}
                />,
                {
                    wrapper: TestWrapper,
                    initialProps: {
                        preloadedState,
                    },
                },
            )

            expect(screen.getByTestId("B3TR_PROPOSAL_SUPPORT")).toBeVisible()
        })
        it("B3TR Proposal vote", () => {
            renderComponentWithProps(
                <ReceiptOutputRenderer
                    expanded
                    clauses={clauses}
                    output={{
                        clauseIndex: 0,
                        name: "B3TR_ProposalVote(address,uint256,uint8,string,uint256,uint256)",
                        params: {
                            from: "0x0",
                            proposalId: 1n,
                            reason: "",
                            support: 1,
                            votePower: 1n,
                            voteWeight: 1n,
                        },
                    }}
                />,
                {
                    wrapper: TestWrapper,
                    initialProps: {
                        preloadedState,
                    },
                },
            )

            expect(screen.getByTestId("B3TR_PROPOSAL_VOTE")).toBeVisible()
        })
        it("B3TR Round vote", () => {
            renderComponentWithProps(
                <ReceiptOutputRenderer
                    expanded
                    clauses={clauses}
                    output={{
                        clauseIndex: 0,
                        name: "B3TR_XAllocationVote(address,uint256,bytes32[],uint256[])",
                        params: {
                            appsIds: [],
                            from: "0x0",
                            roundId: 1n,
                            voteWeights: [],
                        },
                    }}
                />,
                {
                    wrapper: TestWrapper,
                    initialProps: {
                        preloadedState,
                    },
                },
            )

            expect(screen.getByTestId("B3TR_ROUND_VOTE")).toBeVisible()
        })
        describe("B3TR Swap", () => {
            it("B3TR to VOT3", () => {
                renderComponentWithProps(
                    <ReceiptOutputRenderer
                        expanded
                        clauses={clauses}
                        output={{
                            clauseIndex: 0,
                            name: "B3TR_B3trToVot3Swap(address,address,address,address,uint256,uint256)",
                            params: {
                                from: "0x0",
                                inputToken: B3TR.address,
                                inputValue: ethers.utils.parseEther("1").toBigInt(),
                                outputToken: VOT3.address,
                                outputValue: ethers.utils.parseEther("1").toBigInt(),
                                to: "0x0",
                            },
                        }}
                    />,
                    {
                        wrapper: TestWrapper,
                        initialProps: {
                            preloadedState,
                        },
                    },
                )

                expect(screen.getByTestId("B3TR_SWAP_INPUT_VALUE")).toHaveTextContent("- 1.00 B3TR")
                expect(screen.getByTestId("B3TR_SWAP_OUTPUT_VALUE")).toHaveTextContent("+ 1.00 VOT3")
            })
            it("VOT3 to B3TR", () => {
                renderComponentWithProps(
                    <ReceiptOutputRenderer
                        expanded
                        clauses={clauses}
                        output={{
                            clauseIndex: 0,
                            name: "B3TR_Vot3ToB3trSwap(address,address,address,address,uint256,uint256)",
                            params: {
                                from: "0x0",
                                inputToken: VOT3.address,
                                inputValue: ethers.utils.parseEther("1").toBigInt(),
                                outputToken: B3TR.address,
                                outputValue: ethers.utils.parseEther("1").toBigInt(),
                                to: "0x0",
                            },
                        }}
                    />,
                    {
                        wrapper: TestWrapper,
                        initialProps: {
                            preloadedState,
                        },
                    },
                )

                expect(screen.getByTestId("B3TR_SWAP_INPUT_VALUE")).toHaveTextContent("- 1.00 VOT3")
                expect(screen.getByTestId("B3TR_SWAP_OUTPUT_VALUE")).toHaveTextContent("+ 1.00 B3TR")
            })
        })
    })
    describe("Stargate", () => {
        describe("Claim rewards", () => {
            it("v1", () => {
                renderComponentWithProps(
                    <ReceiptOutputRenderer
                        expanded
                        clauses={clauses}
                        output={{
                            clauseIndex: 0,
                            name: "STARGATE_CLAIM_REWARDS_BASE(uint256,uint256,address)",
                            params: {
                                owner: "0x0",
                                tokenId: 1n,
                                value: ethers.utils.parseEther("1").toBigInt(),
                            },
                        }}
                    />,
                    {
                        wrapper: TestWrapper,
                    },
                )

                expect(
                    screen.getByTestId("STARGATE_CLAIM_REWARDS_BASE(uint256,uint256,address)_VALUE"),
                ).toHaveTextContent("+ 1.00 VTHO")
            })
            it("v2", () => {
                renderComponentWithProps(
                    <ReceiptOutputRenderer
                        expanded
                        clauses={clauses}
                        output={{
                            clauseIndex: 0,
                            name: "STARGATE_CLAIM_REWARDS_DELEGATE(uint256,uint256,address)",
                            params: {
                                owner: "0x0",
                                tokenId: 1n,
                                value: ethers.utils.parseEther("1").toBigInt(),
                            },
                        }}
                    />,
                    {
                        wrapper: TestWrapper,
                    },
                )

                expect(
                    screen.getByTestId("STARGATE_CLAIM_REWARDS_DELEGATE(uint256,uint256,address)_VALUE"),
                ).toHaveTextContent("+ 1.00 VTHO")
            })
        })
        it("Stake", () => {
            renderComponentWithProps(
                <ReceiptOutputRenderer
                    expanded
                    clauses={clauses}
                    output={{
                        clauseIndex: 0,
                        name: "STARGATE_STAKE(uint256,uint256,uint8,address,bool)",
                        params: {
                            levelId: 1,
                            migrated: false,
                            owner: "0x0",
                            tokenId: 1n,
                            value: ethers.utils.parseEther("1").toBigInt(),
                        },
                    }}
                />,
                {
                    wrapper: TestWrapper,
                },
            )

            expect(screen.getByTestId("STARGATE_STAKE(uint256,uint256,uint8,address,bool)_VALUE")).toHaveTextContent(
                "- 1.00 VET",
            )
        })
        it("Stake delegate", () => {
            renderComponentWithProps(
                <ReceiptOutputRenderer
                    expanded
                    clauses={clauses}
                    output={{
                        clauseIndex: 0,
                        name: "STARGATE_STAKE_DELEGATE(uint256,uint256,uint8,address,bool,bool)",
                        params: {
                            levelId: 1,
                            migrated: false,
                            owner: "0x0",
                            tokenId: 1n,
                            value: ethers.utils.parseEther("1").toBigInt(),
                            autorenew: true,
                        },
                    }}
                />,
                {
                    wrapper: TestWrapper,
                },
            )

            expect(
                screen.getByTestId("STARGATE_STAKE_DELEGATE(uint256,uint256,uint8,address,bool,bool)_VALUE"),
            ).toHaveTextContent("- 1.00 VET")
        })
        it("Unstake", () => {
            renderComponentWithProps(
                <ReceiptOutputRenderer
                    expanded
                    clauses={clauses}
                    output={{
                        clauseIndex: 0,
                        name: "STARGATE_UNSTAKE(uint256,uint256,uint8,address)",
                        params: {
                            levelId: 1,
                            owner: "0x0",
                            tokenId: 1n,
                            value: ethers.utils.parseEther("1").toBigInt(),
                        },
                    }}
                />,
                {
                    wrapper: TestWrapper,
                },
            )

            expect(screen.getByTestId("STARGATE_UNSTAKE(uint256,uint256,uint8,address)_VALUE")).toHaveTextContent(
                "+ 1.00 VET",
            )
        })
        it("Delegate", () => {
            renderComponentWithProps(
                <ReceiptOutputRenderer
                    expanded
                    clauses={clauses}
                    output={{
                        clauseIndex: 0,
                        name: "STARGATE_DELEGATE(uint256,address,bool)",
                        params: {
                            owner: "0x0",
                            tokenId: 1n,
                            autorenew: true,
                        },
                    }}
                />,
                {
                    wrapper: TestWrapper,
                },
            )

            expect(screen.getByTestId("STARGATE_DELEGATE(uint256,address,bool)_TOKEN_ID")).toHaveTextContent("#1")
        })
        it("Undelegate", () => {
            renderComponentWithProps(
                <ReceiptOutputRenderer
                    expanded
                    clauses={clauses}
                    output={{
                        clauseIndex: 0,
                        name: "STARGATE_UNDELEGATE(uint256)",
                        params: {
                            tokenId: 1n,
                        },
                    }}
                />,
                {
                    wrapper: TestWrapper,
                },
            )

            expect(screen.getByTestId("STARGATE_UNDELEGATE(uint256)_TOKEN_ID")).toHaveTextContent("#1")
        })
    })
})
