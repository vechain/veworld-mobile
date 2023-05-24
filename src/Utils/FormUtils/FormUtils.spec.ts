import { FormUtils } from "~Utils"

describe("alreadyExists", () => {
    const arr = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
    ]

    it("should return true when the value exists in the key", () => {
        expect(FormUtils.alreadyExists("Bob", arr, "name")).toBe(true)
    })

    it("should return false when the value does not exist in the key", () => {
        expect(FormUtils.alreadyExists("David", arr, "name")).toBe(false)
    })

    it("should return false when excluding the only matching element", () => {
        expect(FormUtils.alreadyExists("Alice", arr, "name", arr[0])).toBe(
            false,
        )
    })

    it("should return true when using a custom compare function", () => {
        const compareFunction = (value1: unknown, value2: unknown) => {
            return String(value1).toLowerCase() === String(value2).toLowerCase()
        }
        expect(
            FormUtils.alreadyExists(
                "bob",
                arr,
                "name",
                undefined,
                compareFunction,
            ),
        ).toBe(true)
    })

    it("should return false when using a custom compare function with no match", () => {
        const compareFunction = (value1: unknown, value2: unknown) => {
            return String(value1).toLowerCase() === String(value2).toLowerCase()
        }
        expect(
            FormUtils.alreadyExists(
                "david",
                arr,
                "name",
                undefined,
                compareFunction,
            ),
        ).toBe(false)
    })

    it("should return true when the value exists in the key for a different data type", () => {
        const arr2 = [
            { id: "a", name: "Alice" },
            { id: "b", name: "Bob" },
            { id: "c", name: "Charlie" },
        ]
        expect(FormUtils.alreadyExists("a", arr2, "id")).toBe(true)
    })

    it("should return false when key is not present in array elements", () => {
        expect(
            FormUtils.alreadyExists(
                "Bob",
                arr,
                "nonExistentKey" as keyof (typeof arr)[number],
            ),
        ).toBe(false)
    })
})
