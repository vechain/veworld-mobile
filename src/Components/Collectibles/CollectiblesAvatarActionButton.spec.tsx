import { act, fireEvent, screen, waitFor } from "@testing-library/react-native"
import React from "react"

import { TestHelpers, TestWrapper } from "~Test"

import { defaultMainNetwork } from "~Constants"
import { CollectiblesAvatarActionButton } from "./CollectiblesAvatarActionButton"

const clearAccountPfp = jest.fn().mockImplementation(payload => ({ type: "accounts/clearAccountPfp", payload }))
const setAccountPfp = jest.fn().mockImplementation(payload => ({ type: "accounts/setAccountPfp", payload }))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    clearAccountPfp: (...args: any[]) => clearAccountPfp(...args),
    setAccountPfp: (...args: any[]) => setAccountPfp(...args),
}))

const getInfoAsync = jest.fn()
const makeDirectoryAsync = jest.fn()
const deleteAsync = jest.fn()
const downloadAsync = jest.fn()

jest.mock("expo-file-system", () => ({
    documentDirectory: "/test/directory/",
    getInfoAsync: (...args: any[]) => getInfoAsync(...args),
    makeDirectoryAsync: (...args: any[]) => makeDirectoryAsync(...args),
    deleteAsync: (...args: any[]) => deleteAsync(...args),
    downloadAsync: (...args: any[]) => downloadAsync(...args),
}))

describe("CollectiblesAvatarActionButton", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should be able to set the correct avatar", async () => {
        getInfoAsync.mockResolvedValue({ exists: true })
        downloadAsync.mockResolvedValue({ uri: "file://test_uri" })
        TestHelpers.render.renderComponentWithProps(
            <CollectiblesAvatarActionButton
                address="0x0"
                tokenId="1"
                image="https://google.com"
                mimeType="image/png"
            />,
            {
                wrapper: TestWrapper,
            },
        )

        await act(() => {
            fireEvent.press(screen.getByTestId("COLLECTIBLES_ACTION_AVATAR"))
        })

        await waitFor(() => {
            expect(setAccountPfp).toHaveBeenCalledWith({
                accountAddress: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                pfp: {
                    address: "0x0",
                    tokenId: "1",
                    genesisId: defaultMainNetwork.genesis.id,
                    uri: "file://test_uri",
                },
            })
        })
    })
    it("should be able to clear the current avatar", async () => {
        getInfoAsync.mockResolvedValue({ exists: true })
        TestHelpers.render.renderComponentWithProps(
            <CollectiblesAvatarActionButton
                address="0x0"
                tokenId="1"
                image="https://google.com"
                mimeType="image/png"
            />,
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: {
                        accounts: {
                            accounts: [
                                {
                                    ...TestHelpers.data.account1D1,
                                    profileImage: {
                                        address: "0x0",
                                        genesisId: defaultMainNetwork.genesis.id,
                                        tokenId: "1",
                                        uri: "file://test_uri",
                                    },
                                },
                            ],
                            selectedAccount: TestHelpers.data.account1D1.address,
                        },
                        devices: [TestHelpers.data.device1],
                    },
                },
            },
        )

        await act(() => {
            fireEvent.press(screen.getByTestId("COLLECTIBLES_ACTION_AVATAR"))
        })

        await waitFor(() => {
            expect(deleteAsync).toHaveBeenCalledWith("file://test_uri", { idempotent: true })
            expect(clearAccountPfp).toHaveBeenCalledWith({
                accountAddress: TestHelpers.data.account1D1.address,
            })
        })
    })
    it("should create the directory if it does not exist", async () => {
        getInfoAsync.mockResolvedValue({ exists: false })
        downloadAsync.mockResolvedValue({ uri: "file://test_uri" })
        TestHelpers.render.renderComponentWithProps(
            <CollectiblesAvatarActionButton
                address="0x0"
                tokenId="1"
                image="https://google.com"
                mimeType="image/png"
            />,
            {
                wrapper: TestWrapper,
            },
        )

        await act(() => {
            fireEvent.press(screen.getByTestId("COLLECTIBLES_ACTION_AVATAR"))
        })

        await waitFor(() => {
            expect(makeDirectoryAsync).toHaveBeenCalledWith("/test/directory/pfp/", { intermediates: true })
            expect(setAccountPfp).toHaveBeenCalledWith({
                accountAddress: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                pfp: {
                    address: "0x0",
                    tokenId: "1",
                    genesisId: defaultMainNetwork.genesis.id,
                    uri: "file://test_uri",
                },
            })
        })
    })
})
