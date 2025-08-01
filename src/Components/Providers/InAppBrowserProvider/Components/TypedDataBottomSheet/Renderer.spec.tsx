import { render, screen } from "@testing-library/react-native"
import React from "react"
import { TestWrapper } from "~Test"
import { Renderer } from "./Renderer"

describe("Renderer", () => {
    it("should be able to show a simple string", () => {
        render(<Renderer label="LABEL" value="TEST" />, { wrapper: TestWrapper })

        expect(screen.getByTestId("LABEL_TEST")).toHaveTextContent("TEST")
    })
    it("should be able to show a simple object", () => {
        render(<Renderer value={{ key1: "TEST1", key2: "TEST2" }} />, { wrapper: TestWrapper })

        expect(screen.getByTestId("key1")).toHaveTextContent("TEST1")
        expect(screen.getByTestId("key2")).toHaveTextContent("TEST2")
    })
    it("should be able to show an object with an array", () => {
        render(<Renderer value={{ key1: ["TEST1"], key2: "TEST2" }} />, { wrapper: TestWrapper })

        expect(screen.getByTestId("key1->0")).toHaveTextContent("TEST1")
        expect(screen.getByTestId("key2")).toHaveTextContent("TEST2")
    })
    it("should be able to show an object with a nested key", () => {
        render(<Renderer value={{ key1: { nested1: "TEST1" }, key2: "TEST2" }} />, { wrapper: TestWrapper })

        expect(screen.getByTestId("key1->nested1")).toHaveTextContent("TEST1")
        expect(screen.getByTestId("key2")).toHaveTextContent("TEST2")
    })
    it("should be able to show a bigint", () => {
        render(<Renderer label="LABEL" value={1n} />, { wrapper: TestWrapper })

        expect(screen.getByTestId("LABEL_1")).toHaveTextContent("1")
    })
    it("should be able to show a number", () => {
        render(<Renderer label="LABEL" value={1} />, { wrapper: TestWrapper })

        expect(screen.getByTestId("LABEL_1")).toHaveTextContent("1")
    })
    it("should be able to show a boolean", () => {
        render(<Renderer label="LABEL" value={false} />, { wrapper: TestWrapper })

        expect(screen.getByTestId("LABEL_false")).toHaveTextContent("false")
    })
})
