import React from "react"
import { render, fireEvent, screen } from "@testing-library/react-native"
import { UrlList } from "./UrlList"
import { TestWrapper } from "~Test"

// Mock delegation URLs
jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    selectDelegationUrls: () => [
        "https://url1.com",
        "https://url2.com",
        "https://url3.com",
    ],
}))

jest.mock("@gorhom/bottom-sheet", () => ({
    ...jest.requireActual("@gorhom/bottom-sheet"),
    BottomSheetFlatList: ({ data, renderItem }: any) => {
        return data.map((row: any) => renderItem({ item: row }))
    },
}))
// Mock onCloseBottomSheet
const onCloseBottomSheet = jest.fn()

describe("UrlList", () => {
    it("renders correctly with delegation URLs", async () => {
        render(
            <UrlList
                setAddUrlMode={() => null}
                setSelectedDelegationUrl={() => null}
                onCloseBottomSheet={onCloseBottomSheet}
            />,
            { wrapper: TestWrapper },
        )
        expect(await screen.findByText("https://url1.com")).toBeTruthy()
        expect(await screen.findByText("https://url2.com")).toBeTruthy()
        expect(await screen.findByText("https://url3.com")).toBeTruthy()
    })

    it("calls setSelectedDelegationUrl and onCloseBottomSheet when clicking a URL", async () => {
        const setSelectedDelegationUrl = jest.fn()
        render(
            <UrlList
                setAddUrlMode={() => null}
                setSelectedDelegationUrl={setSelectedDelegationUrl}
                selectedDelegationUrl="https://url2.com"
                onCloseBottomSheet={onCloseBottomSheet}
            />,
            { wrapper: TestWrapper },
        )
        fireEvent.press(await screen.findByText("https://url1.com"))
        expect(setSelectedDelegationUrl).toHaveBeenCalledWith(
            "https://url1.com",
        )
        expect(onCloseBottomSheet).toHaveBeenCalled()
    })
})
