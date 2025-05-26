import { render } from "@testing-library/react-native"
import React from "react"
import { TabsManagerScreen } from "./TabsManagerScreen"
import { TestWrapper } from "~Test"

describe("TabsManagerScreen", () => {
    it("should render", () => {
        render(<TabsManagerScreen />, { wrapper: TestWrapper })
    })
})
