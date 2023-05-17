import React from "react"
import { render, fireEvent, screen, act } from "@testing-library/react-native"

import { AddUrl } from "./AddUrl"
import { useAppDispatch } from "~Storage/Redux"
import { TestWrapper } from "~Test"
import { URLUtils } from "~Common"

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    useAppDispatch: jest.fn(() => jest.fn()),
}))
jest.spyOn(URLUtils, "isValid")
describe("AddUrl component", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it("calls setSelectedDelegationUrl if URL is allowed and not already in delegationUrls", async () => {
        const setSelectedDelegationUrl = jest.fn()
        const newUrl = "http://newurl.com"
        const setNewUrl = jest.fn()
        render(
            <AddUrl
                setSelectedDelegationUrl={setSelectedDelegationUrl}
                newUrl={newUrl}
                setNewUrl={setNewUrl}
            />,
            { wrapper: TestWrapper },
        )
        const addUrlBtn = await screen.findByText("Add", {}, { timeout: 5000 })
        act(() => fireEvent.press(addUrlBtn))
        expect(URLUtils.isValid).toHaveBeenCalledWith(newUrl)
        expect(useAppDispatch).toHaveBeenCalled()
        expect(setSelectedDelegationUrl).toHaveBeenCalledWith(newUrl)
    })

    it("does not call setSelectedDelegationUrl if URL is not allowed", async () => {
        const setSelectedDelegationUrl = jest.fn()
        const newUrl = "wrong url"
        const setNewUrl = jest.fn()
        render(
            <AddUrl
                setSelectedDelegationUrl={setSelectedDelegationUrl}
                newUrl={newUrl}
                setNewUrl={setNewUrl}
            />,
            { wrapper: TestWrapper },
        )
        const addUrlBtn = await screen.findByText("Add", {}, { timeout: 5000 })
        act(() => fireEvent.press(addUrlBtn))
        expect(setSelectedDelegationUrl).not.toHaveBeenCalled()
    })

    it("does not call setSelectedDelegationUrl if URL is already in delegationUrls", async () => {
        const setSelectedDelegationUrl = jest.fn()
        const newUrl = "http://newurl.com"
        const setNewUrl = jest.fn()
        const delegationUrls = ["http://oldurl.com", "http://newurl.com"]
        jest.spyOn(
            require("~Storage/Redux"),
            "selectDelegationUrls",
        ).mockReturnValue(delegationUrls)
        render(
            <AddUrl
                setSelectedDelegationUrl={setSelectedDelegationUrl}
                newUrl={newUrl}
                setNewUrl={setNewUrl}
            />,
            { wrapper: TestWrapper },
        )
        const addUrlBtn = await screen.findByText("Add", {}, { timeout: 5000 })
        act(() => fireEvent.press(addUrlBtn))

        expect(URLUtils.isValid).toHaveBeenCalledWith(newUrl)
        expect(setSelectedDelegationUrl).toHaveBeenCalled()
    })
})
