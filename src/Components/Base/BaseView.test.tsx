import { TestWrapper } from "~Test"
import React from "react"
import { render, screen, waitFor } from "@testing-library/react-native"
import { BaseView } from "./BaseView"

describe("BaseView component", () => {
    it("should render correctly with default props", async () => {
        const { getByTestId } = render(<BaseView testID="BaseView" />, {
            wrapper: TestWrapper,
        })
        await waitFor(() => expect(screen.getByTestId("BaseView")).toBeTruthy())
        const view = getByTestId("BaseView")
        expect(view).toBeTruthy()
    })

    it("should render with custom style props", async () => {
        const { getByTestId } = render(
            <BaseView
                testID="BaseView"
                bg="red"
                w={100}
                h={50}
                borderRadius={8}
            />,
            {
                wrapper: TestWrapper,
            },
        )
        await waitFor(() => expect(screen.getByTestId("BaseView")).toBeTruthy())

        const view = getByTestId("BaseView")
        expect(view).toHaveStyle({
            backgroundColor: "red",
            width: "100%",
            height: "50%",
            borderRadius: 8,
        })
    })

    it("should override justifyContent and alignItems when flexDirection is row", async () => {
        const { getByTestId } = render(
            <BaseView testID="BaseView" flexDirection="row" />,
            {
                wrapper: TestWrapper,
            },
        )
        await waitFor(() => expect(screen.getByTestId("BaseView")).toBeTruthy())

        const view = getByTestId("BaseView")
        expect(view).toHaveStyle({
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        })
    })

    it("should set default alignItems when none is provided", async () => {
        const { getByTestId } = render(<BaseView testID="BaseView" />, {
            wrapper: TestWrapper,
        })
        await waitFor(() => expect(screen.getByTestId("BaseView")).toBeTruthy())

        const view = getByTestId("BaseView")
        expect(view).toHaveStyle({ alignItems: "flex-start" })
    })

    it("should set default justifyContent when none is provided", async () => {
        const { getByTestId } = render(<BaseView testID="BaseView" />, {
            wrapper: TestWrapper,
        })
        await waitFor(() => expect(screen.getByTestId("BaseView")).toBeTruthy())

        const view = getByTestId("BaseView")
        expect(view).toHaveStyle({ justifyContent: "flex-start" })
    })
})
