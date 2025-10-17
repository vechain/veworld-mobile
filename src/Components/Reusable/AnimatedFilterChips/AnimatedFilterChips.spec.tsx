import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { TestWrapper } from "~Test"
import { AnimatedFilterChips } from "./AnimatedFilterChips"

describe("AnimatedFilterChips", () => {
    it("should render correctly", () => {
        render(
            <AnimatedFilterChips
                items={["item1", "item2", "item3"]}
                selectedItem="item2"
                keyExtractor={item => item}
                getItemLabel={item => item}
                onItemPress={jest.fn()}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(screen.getByTestId("AnimatedFilterChips-item1")).toBeVisible()
        expect(screen.getByTestId("AnimatedFilterChips-item2")).toBeVisible()
        expect(screen.getByTestId("AnimatedFilterChips-item3")).toBeVisible()
    })

    it("should call onItemPress when a chip is pressed", () => {
        const onItemPressMock = jest.fn()
        render(
            <AnimatedFilterChips
                items={["item1", "item2", "item3"]}
                selectedItem="item2"
                keyExtractor={item => item}
                getItemLabel={item => item}
                onItemPress={onItemPressMock}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const item1 = screen.getByTestId("AnimatedFilterChips-item1")
        fireEvent.press(item1)
        expect(onItemPressMock).toHaveBeenCalledWith("item1", 0)
    })
})
