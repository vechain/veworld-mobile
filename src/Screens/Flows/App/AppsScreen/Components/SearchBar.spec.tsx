import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { TestWrapper } from "~Test"

import { SearchBar } from "~Screens/Flows/App/AppsScreen/Components/SearchBar"

describe("SearchBar", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render correctly", () => {
        render(<SearchBar onTextChange={jest.fn()} />, {
            wrapper: TestWrapper,
        })

        const input = screen.getByTestId("search-bar-input")
        expect(input).toBeTruthy()
    })

    it("should call onTextChange when text is changed", () => {
        const onTextChange = jest.fn()
        render(<SearchBar onTextChange={onTextChange} />, {
            wrapper: TestWrapper,
        })

        const input = screen.getByTestId("search-bar-input")
        fireEvent.changeText(input, "test")

        expect(onTextChange).toHaveBeenCalledWith("test")
    })

    it("should call onSubmit when enter is pressed", () => {
        const onSubmit = jest.fn()
        render(<SearchBar onTextChange={jest.fn()} onSubmit={onSubmit} />, {
            wrapper: TestWrapper,
        })

        const input = screen.getByTestId("search-bar-input")
        fireEvent.changeText(input, "test")
        // Simulate the enter key press
        fireEvent(input, "onSubmitEditing", { nativeEvent: { text: "test" } })

        expect(onSubmit).toHaveBeenCalledWith("test")
    })

    it("should clear the input when the clear button is pressed", async () => {
        const onTextChange = jest.fn()
        const testValue = "test"

        render(<SearchBar onTextChange={onTextChange} filteredSearch={testValue} />, {
            wrapper: TestWrapper,
        })

        const input = screen.getByTestId("search-bar-input")
        const clearButton = screen.getByTestId("search-bar-clear-button")

        expect(input.props.value).toBe(testValue)

        fireEvent.press(clearButton)

        expect(onTextChange).toHaveBeenCalledWith("")
    })
})
