import { NftCollection, NFTMediaType } from "~Model"
import { mergeArrays, mergeNftCollections, mergeObjects } from "./MergeUtils"

interface Person {
    id: string
    name: string
    age: number
}

const person1: Person = {
    id: "1",
    name: "Anna",
    age: 23,
}

const person2: Person = {
    id: "2",
    name: "Bob",
    age: 22,
}

const person3: Person = {
    id: "3",
    name: "Carl",
    age: 21,
}

const person4: Person = {
    id: "4",
    name: "Denis",
    age: 20,
}

const collection1: NftCollection = {
    address: "0x1",
    name: "Collection 1",
    symbol: "COL1",
    creator: "0x1",
    balanceOf: 1,
    totalSupply: 1,
    updated: false,
    description: "collection 1 description",
    image: "collection 1 image",
    mediaType: NFTMediaType.IMAGE,
    id: "collection 1 id",
    fromRegistry: false,
}

const collection2: NftCollection = {
    address: "0x2",
    name: "Collection 2",
    symbol: "COL2",
    creator: "0x2",
    balanceOf: 20,
    totalSupply: 2,
    updated: false,
    description: "collection 2 description",
    image: "collection 2 image",
    mediaType: NFTMediaType.VIDEO,
    id: "collection 2 id",
    fromRegistry: false,
}

const collection3: NftCollection = {
    address: "0x3",
    name: "Collection 3",
    symbol: "COL3",
    creator: "0x3",
    balanceOf: 30,
    totalSupply: 3,
    updated: false,
    description: "collection 3 description",
    image: "collection 3 image",
    mediaType: NFTMediaType.UNKNOWN,
    id: "collection 3 id",
    fromRegistry: false,
}

const collection4: NftCollection = {
    address: "0x4",
    name: "Collection 4",
    symbol: "COL4",
    creator: "0x4",
    balanceOf: 40,
    totalSupply: 4,
    updated: false,
    description: "collection 4 description",
    image: "collection 4 image",
    mediaType: NFTMediaType.IMAGE,
    id: "collection 4 id",
    fromRegistry: false,
}

const collection5: NftCollection = {
    address: "5AAAA1",
    name: "Collection 5",
    symbol: "COL5",
    creator: "0x5",
    balanceOf: 5,
    totalSupply: 5,
    updated: false,
    description: "collection 5 description",
    image: "collection 5 image",
    mediaType: NFTMediaType.IMAGE,
    id: "collection 5 id",
    fromRegistry: true,
}

describe("MergeUtils", () => {
    it("Merge two different objects", () => {
        const result = mergeObjects(person1, person2)

        expect(result).toEqual(person2)
    })

    it("Merge two different objects - ignored fields", () => {
        const result = mergeObjects(person1, person2, ["age"])

        expect(result).toEqual({ ...person2, age: person1.age })
    })

    it("Merge two different arrays", () => {
        const result = mergeArrays([person1, person2], [person3, person4], "id")

        expect(result).toEqual([person1, person2, person3, person4])
    })

    it("Merge two different arrays - mixed ordering - default field", () => {
        const result = mergeArrays([person2, person4], [person1, person3], "id")

        expect(result).toEqual([person2, person4, person1, person3])
    })

    it("Merge two different arrays - mixed ordering - custom field asc", () => {
        const result = mergeArrays(
            [person2, person4],
            [person1, person3],
            "id",
            [],
            [["age", "asc"]],
        )

        expect(result).toEqual([person4, person3, person2, person1])
    })

    it("Merge two different arrays - mixed ordering - custom field desc", () => {
        const result = mergeArrays(
            [person2, person4],
            [person1, person3],
            "id",
            [],
            [["age", "desc"]],
        )

        expect(result).toEqual([person1, person2, person3, person4])
    })

    it("Merge two arrays with a common element", () => {
        const result = mergeArrays<Person>(
            [person1, person2],
            [person2, person3],
            "id",
        )

        expect(result).toEqual([person1, person2, person3])
    })

    it("Merge two arrays with a common element and updated value", () => {
        const result = mergeArrays(
            [person1, person2],
            [{ ...person2, age: 999 }, person3],
            "id",
        )

        expect(result).toEqual([person1, { ...person2, age: 999 }, person3])
    })

    it("Merge two arrays with a common element and ignored fields", () => {
        const result = mergeArrays(
            [person1, person2],
            [{ ...person2, age: 999 }, person3],
            "id",
            ["age"],
        )

        expect(result).toEqual([person1, person2, person3])
    })

    it("Merge two empty arrays", () => {
        const result = mergeArrays([], [], "id")

        expect(result).toEqual([])
    })

    it("Merge an empty array with a non-empty array", () => {
        const result = mergeArrays<Person>([], [person1, person2], "id")

        expect(result).toEqual([person1, person2])
    })

    it("Merge an empty array with a non-empty array 2", () => {
        const result = mergeArrays<Person>([person1, person2], [], "id")

        expect(result).toEqual([person1, person2])
    })

    it("Merge two collection arrays", () => {
        const result = mergeNftCollections(
            [collection1, collection2],
            [collection3, collection4],
        )

        expect(result).toEqual([
            collection1,
            collection2,
            collection3,
            collection4,
        ])
    })

    it("Merge two collection arrays - mixed order - should retain the order", () => {
        const result = mergeNftCollections(
            [collection3, collection4],
            [collection1, collection2],
        )

        expect(result).toEqual([
            collection3,
            collection4,
            collection1,
            collection2,
        ])
    })

    it("Merge two collection arrays - common element", () => {
        const result = mergeNftCollections(
            [collection1, collection2],
            [collection2, collection3],
        )

        expect(result).toEqual([collection1, collection2, collection3])
    })

    it("Merge two collection arrays - common element with updated value", () => {
        const result = mergeNftCollections(
            [collection1, collection2],
            [{ ...collection2, balanceOf: 999 }, collection3],
        )

        expect(result).toEqual([
            collection1,
            { ...collection2, balanceOf: 999 },
            collection3,
        ])
    })

    it("Merge two collection arrays - normalize address", () => {
        const result = mergeNftCollections(
            [collection1, collection2],
            [collection5],
        )

        expect(result).toEqual([
            collection1,
            collection2,
            { ...collection5, address: "0x5aaaa1" },
        ])
    })
})
