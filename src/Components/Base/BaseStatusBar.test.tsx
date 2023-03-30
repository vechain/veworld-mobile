import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseStatusBar } from "./BaseStatusBar"
import { BaseView } from "./BaseView"

/**
 * BaseStatusBar does not accept testID so we can just check that the rendering doesn't brake anything
 */

const baseStatusBarTestId = "BaseStatusBar"
const findBaseStatusBar = async () =>
    await screen.findByTestId(baseStatusBarTestId, { timeout: 5000 })

describe("BaseStatusBar", () => {
    it("renders correctly", async () => {
        render(
            <>
                <BaseStatusBar />
                <BaseView testID={baseStatusBarTestId} />
            </>,
            {
                wrapper: TestWrapper,
            },
        )
        const baseStatusBar = await findBaseStatusBar()
        expect(baseStatusBar).toBeVisible()
    })
})
