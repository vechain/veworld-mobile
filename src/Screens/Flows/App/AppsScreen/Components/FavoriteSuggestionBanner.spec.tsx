import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { FavoritesSuggestionBanner } from "./FavoritesSuggestionBanner"
import { TestWrapper } from "~Test"

describe("FavoriteSuggestionBanner", () => {
    it("should render correctly", () => {
        render(<FavoritesSuggestionBanner onPress={() => {}} />, { wrapper: TestWrapper })

        expect(screen.getByTestId("FavoritesSuggestionBanner_Title")).toBeTruthy()
        expect(screen.getAllByTestId("FavoritesSuggestionBanner_EmptySlot")).toHaveLength(3)
    })

    it("should call onPress when pressed", () => {
        const onPress = jest.fn()
        render(<FavoritesSuggestionBanner onPress={onPress} />, { wrapper: TestWrapper })

        fireEvent.press(screen.getByTestId("FavoritesSuggestionBanner"))
        expect(onPress).toHaveBeenCalled()
    })
})
