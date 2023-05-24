/**
 * @name sanifySeed
 * @description toLowerCase -> removes whitespace and substitutes with space -> split -> remove emprty strings
 * @param seed
 * @returns
 */
export const sanifySeed = (seed: string) => {
    return seed
        .toLowerCase()
        .replace(/\n/g, " ")
        .split(" ")
        .filter(s => s)
}
