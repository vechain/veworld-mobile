/* eslint-disable i18next/no-literal-string */
import React from "react"
import { TestWrapper } from "~Test"
import { render, screen } from "@testing-library/react-native"
import { ScrollViewWithFooter } from "./ScrollViewWithFooter"
import { BaseText } from "~Components/Base/BaseText"

describe("ScrollViewWithFooter component", () => {
    const children = <BaseText>children</BaseText>
    const footer = <BaseText>footer</BaseText>

    it("renders children and footer components", async () => {
        render(<ScrollViewWithFooter children={children} footer={footer} />, {
            wrapper: TestWrapper,
        })
        const childrenEle = await screen.findByText(
            "children",
            {},
            { timeout: 10000 },
        )
        expect(childrenEle).toBeTruthy()
        const footerEle = await screen.findByText(
            "footer",
            {},
            { timeout: 10000 },
        )
        expect(footerEle).toBeTruthy()
    })
})
