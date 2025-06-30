import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native"
import { ethers } from "ethers"
import { default as React } from "react"
import { B3TR, defaultTestNetwork, VET, VTHO } from "~Constants"
import { DEVICE_TYPE } from "~Model"
import { RootState } from "~Storage/Redux/Types"
import { TestWrapper } from "~Test"
import { GasFeeTokenBottomSheet } from "./GasFeeTokenBottomSheet"

const setDefaultDelegationToken = jest
    .fn()
    .mockImplementation(payload => ({ type: "delegation/setDefaultDelegationToken", payload }))

jest.mock("~Storage/Redux/Slices/Delegation", () => ({
    ...jest.requireActual("~Storage/Redux/Slices/Delegation"),
    setDefaultDelegationToken: (...args: any[]) => setDefaultDelegationToken(...args),
}))

const createPreloadedState = (): Partial<RootState> => {
    const userAddress = ethers.Wallet.createRandom().address

    return {
        balances: {
            testnet: {
                [userAddress]: [
                    {
                        balance: "0x0",
                        isHidden: false,
                        timeUpdated: new Date().toISOString(),
                        tokenAddress: VTHO.address,
                    },
                    {
                        balance: "0x0",
                        isHidden: false,
                        timeUpdated: new Date().toISOString(),
                        tokenAddress: B3TR.address,
                    },
                    {
                        balance: "0x0",
                        isHidden: false,
                        timeUpdated: new Date().toISOString(),
                        tokenAddress: VET.address,
                    },
                ],
            },
        } as any,
        networks: {
            customNetworks: [],
            hardfork: {},
            isNodeError: false,
            selectedNetwork: defaultTestNetwork.id,
            showConversionOtherNets: false,
            showTestNetTag: false,
        },
        accounts: {
            accounts: [
                {
                    address: userAddress,
                    alias: "TEST",
                    index: 0,
                    rootAddress: userAddress,
                    visible: true,
                    hasAttemptedClaim: false,
                },
            ],
            selectedAccount: userAddress,
        },
        devices: [
            {
                alias: "TEST",
                index: 0,
                rootAddress: userAddress,
                wallet: userAddress,
                type: DEVICE_TYPE.LOCAL_MNEMONIC,
                position: 0,
            },
        ],
    }
}

const createWrapper = ({ children }: { children: React.ReactNode; preloadedState: Partial<RootState> }) => {
    return <TestWrapper preloadedState={createPreloadedState()}>{children}</TestWrapper>
}

describe("GasFeeTokenBottomSheet", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should set default token correctly", async () => {
        const setSelectedToken = jest.fn()

        render(
            <GasFeeTokenBottomSheet
                selectedToken="VTHO"
                setSelectedToken={setSelectedToken}
                availableTokens={["VTHO", "VET"]}
                onClose={jest.fn()}
            />,
            { wrapper: createWrapper },
        )

        expect(screen.getAllByTestId("GAS_FEE_TOKEN_BOTTOM_SHEET_TOKEN")).toHaveLength(2)
        expect(screen.queryByTestId("GAS_FEE_TOKEN_BOTTOM_SHEET_DEFAULT_CHECKBOX")).toBeNull()
        act(() => {
            fireEvent.press(screen.getAllByTestId("GAS_FEE_TOKEN_BOTTOM_SHEET_TOKEN")[1])
        })

        await waitFor(() => {
            expect(screen.queryByTestId("GAS_FEE_TOKEN_BOTTOM_SHEET_DEFAULT_CHECKBOX")).toBeVisible()
        })

        await act(() => {
            fireEvent.press(screen.getByTestId("GAS_FEE_TOKEN_BOTTOM_SHEET_DEFAULT_CHECKBOX"))
        })

        await act(() => {
            fireEvent.press(screen.getByTestId("GAS_FEE_TOKEN_BOTTOM_SHEET_APPLY"))
        })

        expect(setDefaultDelegationToken).toHaveBeenCalledWith({ genesisId: expect.any(String), token: "VET" })
        expect(setSelectedToken).toHaveBeenCalledWith("VET")
    })
    it("should not set default token correctly if the checkbox is not clicked", async () => {
        const setSelectedToken = jest.fn()

        render(
            <GasFeeTokenBottomSheet
                selectedToken="VTHO"
                setSelectedToken={setSelectedToken}
                availableTokens={["VTHO", "VET"]}
                onClose={jest.fn()}
            />,
            { wrapper: createWrapper },
        )

        expect(screen.getAllByTestId("GAS_FEE_TOKEN_BOTTOM_SHEET_TOKEN")).toHaveLength(2)
        expect(screen.queryByTestId("GAS_FEE_TOKEN_BOTTOM_SHEET_DEFAULT_CHECKBOX")).toBeNull()
        act(() => {
            fireEvent.press(screen.getAllByTestId("GAS_FEE_TOKEN_BOTTOM_SHEET_TOKEN")[1])
        })

        await waitFor(() => {
            expect(screen.queryByTestId("GAS_FEE_TOKEN_BOTTOM_SHEET_DEFAULT_CHECKBOX")).toBeVisible()
        })

        await act(() => {
            fireEvent.press(screen.getByTestId("GAS_FEE_TOKEN_BOTTOM_SHEET_APPLY"))
        })

        expect(setDefaultDelegationToken).not.toHaveBeenCalled()
        expect(setSelectedToken).toHaveBeenCalledWith("VET")
    })
})
