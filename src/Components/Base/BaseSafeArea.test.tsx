/* eslint-disable i18next/no-literal-string */
import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseSafeArea } from "./BaseSafeArea"
import { Text } from "react-native"

const baseSafeAreaTestId = "BaseSafeArea"
const findBaseSafeArea = async () =>
    screen.findByTestId(baseSafeAreaTestId, {}, { timeout: 5000 })

describe("BaseSafeArea", () => {
    beforeEach(() => {
        jest.mock("@react-navigation/native", () => {
            return {
                useNavigation: () => ({
                    goBack: jest.fn(),
                    getState: jest.fn(),
                }),
                useRoute: jest.fn(),
            }
        })
    })
    it("renders correctly along with its content", async () => {
        render(
            <BaseSafeArea bg="red" testID={baseSafeAreaTestId}>
                <Text>Hello World!</Text>
            </BaseSafeArea>,
            { wrapper: TestWrapper },
        )

        const baseSafeArea = await findBaseSafeArea()
        expect(baseSafeArea).toBeVisible()
        expect(baseSafeArea).toHaveStyle({ backgroundColor: "red" })

        const content = await screen.findByText("Hello World!")
        expect(content).toBeVisible()
    })

    it("transparent override bg", async () => {
        render(
            <BaseSafeArea transparent bg="red" testID={baseSafeAreaTestId}>
                <Text>Hello World!</Text>
            </BaseSafeArea>,
            { wrapper: TestWrapper },
        )

        const baseSafeArea = await findBaseSafeArea()
        expect(baseSafeArea).toBeVisible()
        expect(baseSafeArea).toHaveStyle({ backgroundColor: "transparent" })

        const content = await screen.findByText("Hello World!")
        expect(content).toBeVisible()
    })

    it("android", async () => {
        jest.mock("~Common", () => ({
            PlatformUtils: {
                isAndroid: () => true,
            },
        }))
        render(
            <BaseSafeArea transparent bg="red" testID={baseSafeAreaTestId}>
                <Text>Hello World!</Text>
            </BaseSafeArea>,
            { wrapper: TestWrapper },
        )

        const baseSafeArea = await findBaseSafeArea()
        expect(baseSafeArea).toBeVisible()
        expect(baseSafeArea).toHaveStyle({ backgroundColor: "transparent" })

        const content = await screen.findByText("Hello World!")
        expect(content).toBeVisible()
    })
})
