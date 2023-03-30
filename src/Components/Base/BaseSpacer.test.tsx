import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseSpacer } from "./BaseSpacer"

const baseSpacerTestId = "BaseSpacer"
const findBaseSpacer = async () =>
    screen.findByTestId(baseSpacerTestId, { timeout: 5000 })

describe("BaseSpacer", () => {
    it("should render correctly with width prop", async () => {
        render(<BaseSpacer testID={baseSpacerTestId} width={20} />, {
            wrapper: TestWrapper,
        })

        const spacer = await findBaseSpacer()
        expect(spacer).toBeVisible()
        expect(spacer).toHaveStyle({ width: 20 })
    })
    it("should render correctly with height prop", async () => {
        render(<BaseSpacer testID={baseSpacerTestId} height={20} />, {
            wrapper: TestWrapper,
        })
        const spacer = await findBaseSpacer()
        expect(spacer).toBeVisible()
        expect(spacer).toHaveStyle({ height: 20 })
    })
})
