import { DataPoint } from "../types"
import { makeGraph } from "./makeGraph"

describe("makeGraph", () => {
    it("should return a path", () => {
        const data = [
            { timestamp: 1, value: 1 },
            { timestamp: 2, value: 2 },
        ]
        const width = 100
        const height = 100
        const strokeWidth = 4
        const path = makeGraph(data, width, height, strokeWidth)

        expect(path.path).not.toBeNull()
        expect(path.points).toHaveLength(2)
    })

    it("should return a path with no data", () => {
        const data: DataPoint[] = []
        const width = 100
        const height = 100
        const strokeWidth = 4
        const path = makeGraph(data, width, height, strokeWidth)

        expect(path.path).not.toBeNull()
        expect(path.points).toHaveLength(0)
    })
})
