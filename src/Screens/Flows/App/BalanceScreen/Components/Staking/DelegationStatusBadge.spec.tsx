import React from "react"
import { render, screen } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { DelegationStatusBadge } from "./DelegationStatusBadge"

describe("DelegationStatusBadge", () => {
    describe("label rendering", () => {
        it("should render 'Delegated' for ACTIVE status", () => {
            render(<DelegationStatusBadge status="ACTIVE" />, {
                wrapper: TestWrapper,
            })

            expect(screen.getByText("Delegated")).toBeOnTheScreen()
        })

        it("should render 'Delegated' for QUEUED status", () => {
            render(<DelegationStatusBadge status="QUEUED" />, {
                wrapper: TestWrapper,
            })

            expect(screen.getByText("Delegated")).toBeOnTheScreen()
        })

        it("should render 'Not delegated' for NONE status", () => {
            render(<DelegationStatusBadge status="NONE" />, {
                wrapper: TestWrapper,
            })

            expect(screen.getByText("Not delegated")).toBeOnTheScreen()
        })

        it("should render 'Not delegated' for EXITED status", () => {
            render(<DelegationStatusBadge status="EXITED" />, {
                wrapper: TestWrapper,
            })

            expect(screen.getByText("Not delegated")).toBeOnTheScreen()
        })

        it("should render 'Exiting' for EXITING status without exitDays", () => {
            render(<DelegationStatusBadge status="EXITING" />, {
                wrapper: TestWrapper,
            })

            expect(screen.getByText("Exiting")).toBeOnTheScreen()
        })

        it("should render 'Exiting in X days' for EXITING status with exitDays", () => {
            render(<DelegationStatusBadge status="EXITING" exitDays={5} />, {
                wrapper: TestWrapper,
            })

            expect(screen.getByText("Exiting in 5 days")).toBeOnTheScreen()
        })

        it("should render 'Exiting in 0 days' when exitDays is 0", () => {
            render(<DelegationStatusBadge status="EXITING" exitDays={0} />, {
                wrapper: TestWrapper,
            })

            expect(screen.getByText("Exiting in 0 days")).toBeOnTheScreen()
        })
    })
})
