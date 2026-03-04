import { useNavigation } from "@react-navigation/native"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { Routes } from "~Navigation"

import { TestWrapper } from "~Test"

import { CollectiblesSendActionButton } from "./CollectiblesSendActionButton"

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(),
}))

describe("CollectiblesSendActionButton", () => {
    it("should navigate to the send", async () => {
        const navigate = jest.fn()
        ;(useNavigation as jest.Mock).mockReturnValue({
            navigate,
        })
        const onClose = jest.fn()
        render(<CollectiblesSendActionButton address="0x0" tokenId="1" onClose={onClose} />, {
            wrapper: TestWrapper,
        })

        await act(() => {
            fireEvent.press(screen.getByTestId("COLLECTIBLES_ACTION_SEND"))
        })

        expect(onClose).toHaveBeenCalled()

        expect(navigate).toHaveBeenCalledWith(Routes.SEND_NFT, {
            contractAddress: "0x0",
            tokenId: "1",
        })
    })
})
