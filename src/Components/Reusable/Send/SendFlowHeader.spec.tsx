import React from "react"
import { render, screen } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { SendFlowHeader } from "./SendFlowHeader"

describe("SendFlowHeader", () => {
    const renderWithStep = (step: "selectAmount" | "insertAddress" | "summary") =>
        render(<SendFlowHeader step={step} />, {
            wrapper: TestWrapper,
        })

    it("renders select amount step with correct title and step count", async () => {
        renderWithStep("selectAmount")

        const title = await screen.findByText("Token amount", {}, { timeout: 5000 })
        expect(title).toBeTruthy()

        const counter = await screen.findByText("1 of 3", {}, { timeout: 5000 })
        expect(counter).toBeTruthy()
    })

    it("renders insert address step with correct title and step count", async () => {
        renderWithStep("insertAddress")

        const title = await screen.findByText("Receiver", {}, { timeout: 5000 })
        expect(title).toBeTruthy()

        const counter = await screen.findByText("2 of 3", {}, { timeout: 5000 })
        expect(counter).toBeTruthy()
    })

    it("renders summary step with correct title and step count", async () => {
        renderWithStep("summary")

        const title = await screen.findByText("Review details", {}, { timeout: 5000 })
        expect(title).toBeTruthy()

        const counter = await screen.findByText("3 of 3", {}, { timeout: 5000 })
        expect(counter).toBeTruthy()
    })
})
