/* eslint-disable i18next/no-literal-string */
import { TestWrapper } from "~Test"
import React from "react"
import { render, waitFor, screen } from "@testing-library/react-native"
import { BaseSafeArea } from "./BaseSafeArea"
import { Text } from "react-native"

describe("<BaseSafeArea />", () => {
    it("renders without crashing", async () => {
        render(
            <BaseSafeArea bg="red">
                <Text>Hello World!</Text>
            </BaseSafeArea>,
            { wrapper: TestWrapper },
        )
        await waitFor(() =>
            expect(screen.getByText("Hello World!")).toBeTruthy(),
        )
        expect(screen.getByText("Hello World!")).toBeVisible()

        render(
            <BaseSafeArea transparent>
                <Text>Hello World!</Text>
            </BaseSafeArea>,
            { wrapper: TestWrapper },
        )
        await waitFor(() =>
            expect(screen.getByText("Hello World!")).toBeTruthy(),
        )
        expect(screen.getByText("Hello World!")).toBeDefined()
    })
})
