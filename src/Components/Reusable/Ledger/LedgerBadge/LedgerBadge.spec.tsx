import React from "react"
import { TestWrapper } from "~Test"
import { LedgerBadge } from "./LedgerBadge"
import { render } from "@testing-library/react-native"

describe("LedgerBadge", () => {
    it("should render the component correctly", () => {
        render(<LedgerBadge />, {
            wrapper: TestWrapper,
        })
    })
})
