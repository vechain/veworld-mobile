import React from "react"
import { render, screen, fireEvent } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { CardListItem } from "./CardListItem"

jest.mock("react-native-gesture-handler", () => {
    const actual = jest.requireActual("react-native-gesture-handler")
    const RN = jest.requireActual("react-native")
    return {
        ...actual,
        TouchableOpacity: RN.TouchableOpacity,
    }
})

describe("CardListItem", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render", () => {
        render(<CardListItem icon="icon-wallet" title="Test" action={jest.fn()} testID="test-element" />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId("test-element")).toBeOnTheScreen()
        expect(screen.getByText("Test")).toBeOnTheScreen()
    })

    it("should call action when pressed", () => {
        const actionMock = jest.fn()
        render(<CardListItem icon="icon-wallet" title="Test" action={actionMock} testID="test-element" />, {
            wrapper: TestWrapper,
        })

        fireEvent.press(screen.getByTestId("test-element"))
        expect(actionMock).toHaveBeenCalled()
    })
})
