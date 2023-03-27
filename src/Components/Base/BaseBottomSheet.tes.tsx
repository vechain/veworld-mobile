import { TestWrapper } from "~Test"
import React from "react"
import {
    render,
    fireEvent,
    screen,
    act,
    waitFor,
} from "@testing-library/react-native"
import BaseBottomSheet from "./BaseBottomSheet"
import { View } from "react-native"

describe("BaseBottomSheet", () => {
    const mockAction = jest.fn()

    afterEach(() => {
        mockAction.mockClear()
    })

    it("renders correctly with default props", async () => {
        render(
            <BaseBottomSheet snapPoints={["50%", "75%", "90%"]}>
                <View testID="Child">Child</View>
            </BaseBottomSheet>,
            {
                wrapper: TestWrapper,
            },
        )
        // wait for useEffects
        await waitFor(() => expect(screen.getByText("Child")).toBeTruthy())
        expect(screen.getByText("Child")).toBeVisible()
    })
})
