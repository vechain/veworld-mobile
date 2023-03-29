/* eslint-disable i18next/no-literal-string */
import { TestWrapper } from "~Test"
import React from "react"
import { render, waitFor, screen } from "@testing-library/react-native"
import { BaseStatusBar } from "./BaseStatusBar"
import { BaseView } from "./BaseView"

/**
 * BaseStatusBar does not accept testID so we can just check that the rendering doesn't brake anything
 */
describe("BaseStatusBar", () => {
    it("rendering the BaseStatusBar should not brake anything", async () => {
        render(
            <>
                <BaseStatusBar />
                <BaseView testID="BaseView" />
            </>,
            {
                wrapper: TestWrapper,
            },
        )
        await waitFor(() => expect(screen.getByTestId("BaseView")).toBeTruthy())
        render(
            <>
                <BaseStatusBar hero transparent />
                <BaseView testID="BaseView" />
            </>,
            {
                wrapper: TestWrapper,
            },
        )
        await waitFor(() => expect(screen.getByTestId("BaseView")).toBeTruthy())
    })
})
