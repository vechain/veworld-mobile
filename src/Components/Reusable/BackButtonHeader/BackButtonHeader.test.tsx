const goBackMock = jest.fn()
jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(() => ({ goBack: goBackMock })),
}))
import React from "react"
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { BackButtonHeader } from "./BackButtonHeader"

describe("BackButtonHeader", () => {
    it("should render correctly and go back", async () => {
        render(
            <BackButtonHeader
                testID="BackButtonHeader"
                iconTestID="BackButtonHeader-BaseIcon"
            />,
            {
                wrapper: TestWrapper,
            },
        )
        // wait for useEffects
        await waitFor(() =>
            expect(screen.getByTestId("BackButtonHeader")).toBeTruthy(),
        )

        const icon = screen.getByTestId("BackButtonHeader-BaseIcon")

        act(() => {
            fireEvent.press(icon)
        })

        expect(goBackMock).toHaveBeenCalled()
    })
})
