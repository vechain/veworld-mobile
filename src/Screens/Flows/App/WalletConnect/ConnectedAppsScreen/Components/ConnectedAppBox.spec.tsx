import { render, screen } from "@testing-library/react-native"
import React from "react"
import { TestWrapper } from "~Test"
import { ConnectedAppBox } from "./ConnectedAppBox"

describe("ConnectedAppBox", () => {
    it("should render an in-app connection correctly", () => {
        render(
            <ConnectedAppBox
                connectedApp={{
                    type: "in-app",
                    app: {
                        amountOfNavigations: 1,
                        createAt: Date.now(),
                        href: "https://vechain.org",
                        isCustom: false,
                        name: "TEST",
                        desc: "DESCRIPTION",
                    },
                }}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(screen.getByTestId("CONNECTED_APP_NAME")).toHaveTextContent("TEST")
        expect(screen.getByTestId("CONNECTED_APP_DESCRIPTION")).toHaveTextContent("vechain.org")
    })
    it("should render a WC connection correctly", () => {
        render(
            <ConnectedAppBox
                connectedApp={{
                    type: "wallet-connect",
                    session: {
                        peer: {
                            metadata: {
                                description: "DESCRIPTION",
                                name: "TEST",
                                icons: ["https://google.com"],
                                url: "https://vechain.org",
                            },
                        },
                    } as any,
                }}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(screen.getByTestId("CONNECTED_APP_NAME")).toHaveTextContent("TEST")
        expect(screen.getByTestId("CONNECTED_APP_DESCRIPTION")).toHaveTextContent("vechain.org")
    })
})
