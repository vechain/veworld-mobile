import { screen } from "@testing-library/react-native"
import { TransactionClause } from "@vechain/sdk-core"
import { ethers } from "ethers"
import React from "react"
import { B3TR, VOT3, VTHO } from "~Constants"
import { RootState } from "~Storage/Redux/Types"
import { TestHelpers, TestWrapper } from "~Test"
import { ReceiptOutputRenderer } from "./ReceiptOutputRenderer"

const { renderComponentWithProps } = TestHelpers.render

const clauseAddress = "0x73Cba0BE529A65989F2307FbC2Ce72f76E421050"
const clauses = [
    {
        data: "0x0",
        to: clauseAddress,
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
                favoriteRefs: [],
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
            it("Base", () => {
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
            it("Delegate", () => {
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
    describe("Tokens", () => {
        const randomWallet = "0xb961894E25A72741E22DCEe9815Ef9f775a99Ea7"
        describe("ERC-20", () => {
            it("Token send", () => {
                renderComponentWithProps(
                    <ReceiptOutputRenderer
                        expanded
                        clauses={clauses}
                        output={{
                            clauseIndex: 0,
                            name: "Transfer(indexed address,indexed address,uint256)",
                            params: {
                                value: ethers.utils.parseEther("1").toBigInt(),
                                from: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                                to: randomWallet,
                            },
                            address: B3TR.address,
                        }}
                    />,
                    {
                        wrapper: TestWrapper,
                    },
                )

                expect(screen.getByTestId("TOKEN_SEND_RECEIVER")).toHaveTextContent("0xb96…Ea7")
                expect(screen.getByTestId("TOKEN_SEND_VALUE")).toHaveTextContent("- 1.00 B3TR")
            })
            it("Token receive", () => {
                renderComponentWithProps(
                    <ReceiptOutputRenderer
                        expanded
                        clauses={clauses}
                        output={{
                            clauseIndex: 0,
                            name: "Transfer(indexed address,indexed address,uint256)",
                            params: {
                                value: ethers.utils.parseEther("1").toBigInt(),
                                from: randomWallet,
                                to: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                            },
                            address: B3TR.address,
                        }}
                    />,
                    {
                        wrapper: TestWrapper,
                    },
                )

                expect(screen.getByTestId("TOKEN_RECEIVE_SENDER")).toHaveTextContent("0xb96…Ea7")
                expect(screen.getByTestId("TOKEN_RECEIVE_VALUE")).toHaveTextContent("+ 1.00 B3TR")
            })
            it("Token approval", () => {
                renderComponentWithProps(
                    <ReceiptOutputRenderer
                        expanded
                        clauses={clauses}
                        output={{
                            clauseIndex: 0,
                            name: "Approval(indexed address,indexed address,uint256)",
                            params: {
                                value: ethers.utils.parseEther("1").toBigInt(),
                                spender: randomWallet,
                                owner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                            },
                            address: B3TR.address,
                        }}
                    />,
                    {
                        wrapper: TestWrapper,
                    },
                )

                expect(screen.getByTestId("TOKEN_APPROVAL_SPENDER")).toHaveTextContent("0xb96…Ea7")
                expect(screen.getByTestId("TOKEN_APPROVAL_VALUE")).toHaveTextContent("1.00 B3TR")
            })
            describe("Swap", () => {
                it("Fungible -> VET 1", () => {
                    renderComponentWithProps(
                        <ReceiptOutputRenderer
                            expanded
                            clauses={clauses}
                            output={{
                                clauseIndex: 0,
                                name: "FT_VET_Swap(address,address,address,uint256,uint256)",
                                params: {
                                    from: "0x0",
                                    inputToken: B3TR.address,
                                    inputValue: ethers.utils.parseEther("1").toBigInt(),
                                    outputValue: ethers.utils.parseEther("2").toBigInt(),
                                    to: "0x0",
                                },
                            }}
                        />,
                        {
                            wrapper: TestWrapper,
                        },
                    )

                    expect(screen.getByTestId("SWAP_INPUT_VALUE")).toHaveTextContent("- 1.00 B3TR")
                    expect(screen.getByTestId("SWAP_OUTPUT_VALUE")).toHaveTextContent("+ 2.00 VET")
                })
                it("Fungible -> VET 2", () => {
                    renderComponentWithProps(
                        <ReceiptOutputRenderer
                            expanded
                            clauses={clauses}
                            output={{
                                clauseIndex: 0,
                                name: "FT_VET_Swap2(address,address,address,uint256,uint256)",
                                params: {
                                    from: "0x0",
                                    inputToken: B3TR.address,
                                    inputValue: ethers.utils.parseEther("1").toBigInt(),
                                    outputValue: ethers.utils.parseEther("2").toBigInt(),
                                    to: "0x0",
                                },
                            }}
                        />,
                        {
                            wrapper: TestWrapper,
                        },
                    )

                    expect(screen.getByTestId("SWAP_INPUT_VALUE")).toHaveTextContent("- 1.00 B3TR")
                    expect(screen.getByTestId("SWAP_OUTPUT_VALUE")).toHaveTextContent("+ 2.00 VET")
                })
                it("VET -> Fungible", () => {
                    renderComponentWithProps(
                        <ReceiptOutputRenderer
                            expanded
                            clauses={clauses}
                            output={{
                                clauseIndex: 0,
                                name: "VET_FT_Swap(address,address,address,uint256,uint256)",
                                params: {
                                    from: "0x0",
                                    outputToken: B3TR.address,
                                    inputValue: ethers.utils.parseEther("1").toBigInt(),
                                    outputValue: ethers.utils.parseEther("2").toBigInt(),
                                    to: "0x0",
                                },
                            }}
                        />,
                        {
                            wrapper: TestWrapper,
                        },
                    )

                    expect(screen.getByTestId("SWAP_INPUT_VALUE")).toHaveTextContent("- 1.00 VET")
                    expect(screen.getByTestId("SWAP_OUTPUT_VALUE")).toHaveTextContent("+ 2.00 B3TR")
                })
                it("Fungible -> Fungible", () => {
                    renderComponentWithProps(
                        <ReceiptOutputRenderer
                            expanded
                            clauses={clauses}
                            output={{
                                clauseIndex: 0,
                                name: "Token_FTSwap(address,address,address,address,uint256,uint256)",
                                params: {
                                    from: "0x0",
                                    outputToken: B3TR.address,
                                    inputValue: ethers.utils.parseEther("1").toBigInt(),
                                    outputValue: ethers.utils.parseEther("2").toBigInt(),
                                    inputToken: VTHO.address,
                                    to: "0x0",
                                },
                            }}
                        />,
                        {
                            wrapper: TestWrapper,
                        },
                    )

                    expect(screen.getByTestId("SWAP_INPUT_VALUE")).toHaveTextContent("- 1.00 VTHO")
                    expect(screen.getByTestId("SWAP_OUTPUT_VALUE")).toHaveTextContent("+ 2.00 B3TR")
                })
            })
        })
        describe("VET", () => {
            it("Token send", () => {
                renderComponentWithProps(
                    <ReceiptOutputRenderer
                        expanded
                        clauses={clauses}
                        output={{
                            clauseIndex: 0,
                            name: "VET_TRANSFER(address,address,uint256)",
                            params: {
                                amount: ethers.utils.parseEther("1").toBigInt(),
                                from: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                                to: randomWallet,
                            },
                            address: B3TR.address,
                        }}
                    />,
                    {
                        wrapper: TestWrapper,
                    },
                )

                expect(screen.getByTestId("TOKEN_SEND_RECEIVER")).toHaveTextContent("0xb96…Ea7")
                expect(screen.getByTestId("TOKEN_SEND_VALUE")).toHaveTextContent("- 1.00 VET")
            })
            it("Token receive", () => {
                renderComponentWithProps(
                    <ReceiptOutputRenderer
                        expanded
                        clauses={clauses}
                        output={{
                            clauseIndex: 0,
                            name: "VET_TRANSFER(address,address,uint256)",
                            params: {
                                amount: ethers.utils.parseEther("1").toBigInt(),
                                from: randomWallet,
                                to: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                            },
                            address: B3TR.address,
                        }}
                    />,
                    {
                        wrapper: TestWrapper,
                    },
                )

                expect(screen.getByTestId("TOKEN_RECEIVE_SENDER")).toHaveTextContent("0xb96…Ea7")
                expect(screen.getByTestId("TOKEN_RECEIVE_VALUE")).toHaveTextContent("+ 1.00 VET")
            })
        })
        describe("ERC-721", () => {
            it("Token send", () => {
                renderComponentWithProps(
                    <ReceiptOutputRenderer
                        expanded
                        clauses={clauses}
                        output={{
                            clauseIndex: 0,
                            name: "Transfer(indexed address,indexed address,indexed uint256)",
                            params: {
                                tokenId: 1n,
                                from: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                                to: randomWallet,
                            },
                        }}
                    />,
                    {
                        wrapper: TestWrapper,
                    },
                )

                expect(screen.getByTestId("NFT_SEND_RECEIVER")).toHaveTextContent("0xb96…Ea7")
                expect(screen.getByTestId("NFT_SEND_TOKEN_ID")).toHaveTextContent("#1")
            })
            it("Token receive", () => {
                renderComponentWithProps(
                    <ReceiptOutputRenderer
                        expanded
                        clauses={clauses}
                        output={{
                            clauseIndex: 0,
                            name: "Transfer(indexed address,indexed address,indexed uint256)",
                            params: {
                                tokenId: 1n,
                                from: randomWallet,
                                to: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                            },
                        }}
                    />,
                    {
                        wrapper: TestWrapper,
                    },
                )

                expect(screen.getByTestId("NFT_SEND_SENDER")).toHaveTextContent("0xb96…Ea7")
                expect(screen.getByTestId("NFT_SEND_TOKEN_ID")).toHaveTextContent("#1")
            })
            it("Token approval", () => {
                renderComponentWithProps(
                    <ReceiptOutputRenderer
                        expanded
                        clauses={clauses}
                        output={{
                            clauseIndex: 0,
                            name: "Approval(indexed address,indexed address,indexed uint256)",
                            params: {
                                tokenId: 1n,
                                approved: randomWallet,
                                owner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                            },
                            address: B3TR.address,
                        }}
                    />,
                    {
                        wrapper: TestWrapper,
                    },
                )

                expect(screen.getByTestId("NFT_APPROVAL_SPENDER")).toHaveTextContent("0xb96…Ea7")
                expect(screen.getByTestId("NFT_APPROVAL_VALUE")).toHaveTextContent("#1")
            })
            it("Token approval for all", () => {
                renderComponentWithProps(
                    <ReceiptOutputRenderer
                        expanded
                        clauses={clauses}
                        output={{
                            clauseIndex: 0,
                            name: "ApprovalForAll(indexed address,indexed address,bool)",
                            params: {
                                approved: true,
                                owner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                                operator: randomWallet,
                            },
                        }}
                    />,
                    {
                        wrapper: TestWrapper,
                    },
                )

                expect(screen.getByTestId("NFT_APPROVAL_SPENDER")).toHaveTextContent("0xb96…Ea7")
                expect(screen.getByTestId("NFT_APPROVAL_VALUE")).toHaveTextContent("ALL")
            })
        })
    })
    describe("VeVote", () => {
        it("Vote cast", () => {
            renderComponentWithProps(
                <ReceiptOutputRenderer
                    expanded
                    clauses={clauses}
                    output={{
                        clauseIndex: 0,
                        name: "VeVote_VoteCast(address,uint256,uint8,string,uint256,uint256[],address)",
                        params: {
                            from: ethers.Wallet.createRandom().address,
                            proposalId: 1n,
                            reason: "",
                            support: 1,
                            tokenIds: [1n],
                            validator: ethers.Wallet.createRandom().address,
                            voteWeight: 1n,
                        },
                    }}
                />,
                {
                    wrapper: TestWrapper,
                },
            )

            expect(screen.getByTestId("VEVOTE_VOTE_CAST")).toBeVisible()
        })
    })
    it("Generic contract call", () => {
        renderComponentWithProps(
            <ReceiptOutputRenderer
                expanded
                clauses={clauses}
                output={{
                    clauseIndex: 0,
                    name: "AppEndorsed(indexed bytes32,uint256,bool)",
                    params: {
                        endorsed: true,
                        id: "0x0",
                        nodeId: 1n,
                    },
                }}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(screen.getByTestId("BASE_RECEIPT_CLAUSE_INDEX")).toHaveTextContent("#1")
        expect(screen.getByTestId("BASE_RECEIPT_TO")).toHaveTextContent("0x73C…050")
        expect(screen.getByTestId("BASE_RECEIPT_CONTRACT_DATA")).toHaveTextContent("0x0")
    })
})
