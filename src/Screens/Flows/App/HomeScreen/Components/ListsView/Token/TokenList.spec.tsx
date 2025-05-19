import React from "react"
import { render } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { TokenList } from "./TokenList"

describe("TokenList", () => {
    it("renders correctly", () => {
        render(<TokenList isEdit={false} isBalanceVisible={true} />, { wrapper: TestWrapper })
    })
})
