import { distinctValues } from "./ArrayUtils"

describe("distinctValues function", () => {
    // Test case 1: Simple array with duplicate numbers
    it("should return an array with distinct numbers", () => {
        const array = [1, 2, 2, 3, 4, 4, 5]
        const result = distinctValues(array)
        expect(result).toEqual([1, 2, 3, 4, 5])
    })

    // Test case 2: Array with all unique values
    it("should return the same array when all values are unique", () => {
        const array = ["a", "b", "c", "d"]
        const result = distinctValues(array)
        expect(result).toEqual(["a", "b", "c", "d"])
    })

    // Test case 3: Array with mixed data types
    it("should handle an array with mixed data types", () => {
        const array = [1, "1", 2, "2", 2, 3]
        const result = distinctValues(array)
        expect(result).toEqual([1, "1", 2, "2", 3])
    })

    // Test case 4: Empty array
    it("should return an empty array when input is empty", () => {
        const array: number[] = []
        const result = distinctValues(array)
        expect(result).toEqual([])
    })

    // Test case 5: Array with complex objects
    it("should return an array with distinct objects by reference", () => {
        const obj1 = { id: 1 }
        const obj2 = { id: 2 }
        const obj3 = { id: 1 }
        const array = [obj1, obj2, obj1, obj3]
        const result = distinctValues(array)
        expect(result).toEqual([obj1, obj2, obj3])
    })

    // Test case 6: Array with NaN values
    it("should handle arrays with NaN values correctly", () => {
        const array = [NaN, NaN, 1, 2, 3]
        const result = distinctValues(array)
        expect(result).toEqual([NaN, 1, 2, 3])
    })

    // Test case 7: Array with all elements the same
    it("should return an array with a single value when all elements are the same", () => {
        const array = ["a", "a", "a", "a"]
        const result = distinctValues(array)
        expect(result).toEqual(["a"])
    })

    // Test case 8: Array with undefined and null values
    it("should handle undefined and null values correctly", () => {
        const array = [undefined, null, null, undefined, 1]
        const result = distinctValues(array)
        expect(result).toEqual([undefined, null, 1])
    })
})
