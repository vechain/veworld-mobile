import { act, fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { TestWrapper } from "~Test"
import { ActivityTabFooter } from "./ActivityTabFooter"

describe("ActivityTabFooter", () => {
    it("should render the skeleton if is loading", () => {
        render(<ActivityTabFooter onClick={jest.fn()} show isLoading={true} />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId("SKELETON_ACTIVITY_BOX")).toBeVisible()
    })
    it("should not render if show is false", () => {
        render(<ActivityTabFooter onClick={jest.fn()} show={false} isLoading={false} />, {
            wrapper: TestWrapper,
        })

        expect(screen.queryByTestId("SKELETON_ACTIVITY_BOX")).toBeNull()
        expect(screen.queryByTestId("TOKEN_ACTIVITY_SHOW_MORE_BTN")).toBeNull()
    })
    it("should render render if show is true & not loading", () => {
        const onClick = jest.fn()
        render(<ActivityTabFooter onClick={onClick} show isLoading={false} />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId("TOKEN_ACTIVITY_SHOW_MORE_BTN")).toBeVisible()

        act(() => {
            fireEvent.press(screen.getByTestId("TOKEN_ACTIVITY_SHOW_MORE_BTN"))
        })

        expect(onClick).toHaveBeenCalled()
    })
})
