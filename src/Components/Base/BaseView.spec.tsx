import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseView } from "./BaseView"

const baseViewTestId = "BaseView"
const findBaseView = async () =>
    screen.findByTestId(baseViewTestId, {}, { timeout: 5000 })

describe("BaseView component", () => {
    it("should render correctly with default props", async () => {
        render(<BaseView testID={baseViewTestId} />, {
            wrapper: TestWrapper,
        })
        const baseView = await findBaseView()
        expect(baseView).toBeVisible()
    })

    it("should render with custom style props", async () => {
        render(
            <BaseView
                testID={baseViewTestId}
                bg="red"
                w={100}
                h={50}
                borderRadius={8}
            />,
            {
                wrapper: TestWrapper,
            },
        )
        const baseView = await findBaseView()
        expect(baseView).toBeVisible()

        expect(baseView).toHaveStyle({
            backgroundColor: "red",
            width: "100%",
            height: "50%",
            borderRadius: 8,
        })
    })

    it("should override justifyContent and alignItems when flexDirection is row", async () => {
        render(<BaseView testID={baseViewTestId} flexDirection="row" />, {
            wrapper: TestWrapper,
        })
        const baseView = await findBaseView()
        expect(baseView).toBeVisible()

        expect(baseView).toHaveStyle({
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        })
    })

    it("should set default alignItems when none is provided", async () => {
        render(<BaseView testID={baseViewTestId} />, {
            wrapper: TestWrapper,
        })

        const baseView = await findBaseView()
        expect(baseView).toBeVisible()

        expect(baseView).toHaveStyle({ alignItems: "flex-start" })
    })

    it("should set default justifyContent when none is provided", async () => {
        render(<BaseView testID={baseViewTestId} />, {
            wrapper: TestWrapper,
        })
        const baseView = await findBaseView()
        expect(baseView).toBeVisible()
        expect(baseView).toHaveStyle({ justifyContent: "flex-start" })
    })
})
