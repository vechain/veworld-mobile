import React from "react"
import { render, fireEvent } from "@testing-library/react-native"
import { CustomNodes } from "./CustomNodes"
import { TestWrapper } from "~Test"
import { RootState } from "~Storage/Redux/Types"
import { NETWORK_TYPE } from "~Model"

const onManageNodesClick = jest.fn()

const createWrapper = (preloadedState: Partial<RootState>) => {
    return ({ children }: { children: React.ReactNode }) =>
        TestWrapper({
            preloadedState,
            children,
        })
}

describe("CustomNodes", () => {
    it("should render", () => {
        render(<CustomNodes onManageNodesClick={onManageNodesClick} />, { wrapper: TestWrapper })
    })

    it("should render the add custom node button", () => {
        const { getByTestId } = render(<CustomNodes onManageNodesClick={onManageNodesClick} />, {
            wrapper: createWrapper({
                networks: {
                    customNetworks: [],
                    selectedNetwork: "testnet",
                    showTestNetTag: true,
                    showConversionOtherNets: true,
                    isNodeError: false,
                },
            }),
        })
        expect(getByTestId("add-custom-node-button")).toBeOnTheScreen()
    })

    it("should render the manage nodes button", () => {
        const { getByTestId } = render(<CustomNodes onManageNodesClick={onManageNodesClick} />, {
            wrapper: createWrapper({
                networks: {
                    customNetworks: [
                        {
                            id: "galactica",
                            name: "Galactica",
                            urls: ["https://galactica.live.dev.node.vechain.org/"],
                            type: NETWORK_TYPE.OTHER,
                            currentUrl: "https://galactica.live.dev.node.vechain.org/",
                            defaultNet: false,
                            genesis: {
                                number: 325324,
                                id: "0x0004f6cc88bb4626a92907718e82f255b8fa511453a78e8797eb8cea3393b215",
                                size: 373,
                                parentID: "0x0004f6cb730dbd90fed09d165bfdf33cc0eed47ec068938f6ee7b7c12a4ea98d",
                                timestamp: 1533267900,
                                gasLimit: 11253579,
                                beneficiary: "0xb4094c25f86d628fdd571afc4077f0d0196afb48",
                                gasUsed: 21000,
                                totalScore: 1029988,
                                txsRoot: "0x89dfd9fcd10c9e53d68592cf8b540b280b72d381b868523223992f3e09a806bb",
                                txsFeatures: 0,
                                stateRoot: "0x86bcc6d214bc9d8d0dedba1012a63c8317d19ce97f60c8a2ef5c59bbd40d4261",
                                receiptsRoot: "0x15787e2533c470e8a688e6cd17a1ee12d8457778d5f82d2c109e2d6226d8e54e",
                                com: true,
                                signer: "0xab7b27fc9e7d29f9f2e5bd361747a5515d0cc2d1",
                                isTrunk: true,
                                isFinalized: false,
                                transactions: ["0x284bba50ef777889ff1a367ed0b38d5e5626714477c40de38d71cedd6f9fa477"],
                            },
                        },
                    ],
                    selectedNetwork: "testnet",
                    showTestNetTag: true,
                    showConversionOtherNets: true,
                    isNodeError: false,
                },
            }),
        })
        expect(getByTestId("manage-nodes-button")).toBeOnTheScreen()
        expect(getByTestId("custom-nodes-count")).toHaveTextContent("1")
    })

    it("should call onManageNodesClick when the button is pressed", () => {
        const { getByTestId } = render(<CustomNodes onManageNodesClick={onManageNodesClick} />, {
            wrapper: createWrapper({
                networks: {
                    customNetworks: [
                        {
                            id: "galactica",
                            name: "Galactica",
                            urls: ["https://galactica.live.dev.node.vechain.org/"],
                            type: NETWORK_TYPE.OTHER,
                            currentUrl: "https://galactica.live.dev.node.vechain.org/",
                            defaultNet: false,
                            genesis: {
                                number: 325324,
                                id: "0x0004f6cc88bb4626a92907718e82f255b8fa511453a78e8797eb8cea3393b215",
                                size: 373,
                                parentID: "0x0004f6cb730dbd90fed09d165bfdf33cc0eed47ec068938f6ee7b7c12a4ea98d",
                                timestamp: 1533267900,
                                gasLimit: 11253579,
                                beneficiary: "0xb4094c25f86d628fdd571afc4077f0d0196afb48",
                                gasUsed: 21000,
                                totalScore: 1029988,
                                txsRoot: "0x89dfd9fcd10c9e53d68592cf8b540b280b72d381b868523223992f3e09a806bb",
                                txsFeatures: 0,
                                stateRoot: "0x86bcc6d214bc9d8d0dedba1012a63c8317d19ce97f60c8a2ef5c59bbd40d4261",
                                receiptsRoot: "0x15787e2533c470e8a688e6cd17a1ee12d8457778d5f82d2c109e2d6226d8e54e",
                                com: true,
                                signer: "0xab7b27fc9e7d29f9f2e5bd361747a5515d0cc2d1",
                                isTrunk: true,
                                isFinalized: false,
                                transactions: ["0x284bba50ef777889ff1a367ed0b38d5e5626714477c40de38d71cedd6f9fa477"],
                            },
                        },
                    ],
                    selectedNetwork: "testnet",
                    showTestNetTag: true,
                    showConversionOtherNets: true,
                    isNodeError: false,
                },
            }),
        })

        fireEvent.press(getByTestId("manage-nodes-button"))
        expect(onManageNodesClick).toHaveBeenCalled()
    })
})
