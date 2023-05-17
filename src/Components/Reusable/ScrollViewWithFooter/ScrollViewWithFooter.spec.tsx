/* eslint-disable i18next/no-literal-string */
import { TestWrapper } from "~Test"
import React from "react"
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
        const childrenEle = await screen.findByText("children")
        expect(childrenEle).toBeTruthy()
        const footerEle = await screen.findByText("footer")
        expect(footerEle).toBeTruthy()
    })
})
