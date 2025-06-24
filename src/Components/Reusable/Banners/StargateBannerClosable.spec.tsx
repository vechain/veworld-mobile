import React from "react"
import { render, screen } from "@testing-library/react-native"
import { StargateBannerClosable } from "./StargateBannerClosable"
import { TestWrapper } from "~Test"

describe("StargateBannerClosable", () => {
    it("should render correctly", () => {
        render(<StargateBannerClosable location="home_screen" />, {
            wrapper: TestWrapper,
        })
        expect(screen.getByTestId("Stargate_banner_close_button")).toBeOnTheScreen()
    })
})
