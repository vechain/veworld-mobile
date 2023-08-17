import React from "react"
import { render, screen, waitFor } from "@testing-library/react-native"
import { SelectedNetworkViewer } from "./SelectedNetworkViewer"
import { useBlockchainNetwork } from "~Hooks"
import { NETWORK_TYPE } from "~Model"
import { genesises } from "~Constants"
import { TestWrapper } from "~Test"

jest.mock("~Hooks/useBlockchainNetwork")

const findLabel = async (label: string) =>
    await screen.findByText(label, {}, { timeout: 5000 })

describe("SelectedNetworkViewer", () => {
    const mockUseBlockchainNetwork =
        useBlockchainNetwork as jest.MockedFunction<typeof useBlockchainNetwork>

    afterEach(() => {
        jest.resetAllMocks()
    })

    it("should render the network name when the network is not mainnet", async () => {
        mockUseBlockchainNetwork.mockReturnValue({
            network: {
                id: "",
                defaultNet: true,
                name: "testnet",
                type: NETWORK_TYPE.TEST,
                currentUrl: "",
                urls: [],
                genesis: genesises.test,
            },
            isMainnet: false,
        })
        render(<SelectedNetworkViewer />, {
            wrapper: TestWrapper,
        })
        const textInput = await findLabel("Testnet")
        expect(textInput).toBeVisible()
    })

    it("should not render the network name when the network is mainnet", async () => {
        mockUseBlockchainNetwork.mockReturnValue({
            network: {
                id: "",
                defaultNet: true,
                name: "mainnet",
                type: NETWORK_TYPE.MAIN,
                currentUrl: "",
                urls: [],
                genesis: genesises.main,
            },
            isMainnet: true,
        })

        render(<SelectedNetworkViewer />, {
            wrapper: TestWrapper,
        })

        let componentNotVisibleError = null

        try {
            await waitFor(
                () => {
                    expect(screen.queryByText("Mainnet")).not.toBeNull()
                },
                { timeout: 5000 },
            )
        } catch (error) {
            componentNotVisibleError = error
        }
        expect(componentNotVisibleError).not.toBeNull()
    })

    it("should render the network name when the network is mainnet and the 'showEvenIfMainnet' prop is true", async () => {
        mockUseBlockchainNetwork.mockReturnValue({
            network: {
                id: "",
                defaultNet: true,
                name: "mainnet",
                type: NETWORK_TYPE.MAIN,
                currentUrl: "",
                urls: [],
                genesis: genesises.main,
            },
            isMainnet: true,
        })

        render(<SelectedNetworkViewer showEvenIfMainnet={true} />, {
            wrapper: TestWrapper,
        })

        const textInput = await findLabel("Mainnet")
        expect(textInput).toBeVisible()
    })
})
