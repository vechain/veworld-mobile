import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseText } from "./BaseText"

const baseTextTestId = "BaseText"
const findBaseText = async () =>
    await screen.findByTestId(baseTextTestId, { timeout: 5000 })

describe("BaseText", () => {
    it("should render correctly with default props", async () => {
        render(<BaseText testID={baseTextTestId} />, {
            wrapper: TestWrapper,
        })
        const text = await findBaseText()
        expect(text).toBeVisible()
    })

    it("should render correctly then italic", async () => {
        render(
            <BaseText testID={baseTextTestId} italic typographyFont="body" />,
            {
                wrapper: TestWrapper,
            },
        )
        const text = await findBaseText()
        expect(text).toBeVisible()
        expect(text).toHaveStyle({ fontStyle: "italic" })
    })
})
