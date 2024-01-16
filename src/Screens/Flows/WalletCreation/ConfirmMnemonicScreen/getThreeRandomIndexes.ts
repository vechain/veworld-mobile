import { CryptoUtils } from "~Common"

const TOTAL_WORDS = 12

export const getThreeRandomIndexes = (): number[] => {
    const maxIndex = TOTAL_WORDS - 1
    const result: number[] = []

    // generate first number
    const maxIndexForFirstNumber = 4 // it should be 'maxIndex - 2' but let's keep it under 6, so it generates more separated numbers
    const firstNumber = Math.floor(
        CryptoUtils.random() * maxIndexForFirstNumber + 1,
    )
    result.push(firstNumber)

    // generate second number
    const minIndexForSecondNumber = firstNumber + 1
    const maxIndexForSecondNumber = 8 // it should be 'maxIndex - 1' but let's keep it under 9, so it generates more separated numbers
    const getSecondNumber = () =>
        Math.floor(
            CryptoUtils.random() *
                (maxIndexForSecondNumber - minIndexForSecondNumber + 1),
        ) + minIndexForSecondNumber
    let secondNumber = getSecondNumber()
    // ensure that the second number is not equal to the first number
    while (secondNumber === firstNumber) {
        const newNumber = getSecondNumber()
        secondNumber = newNumber
    }
    result.push(secondNumber)

    // generate third number
    const minIndexForThirdNumber = secondNumber + 1
    const maxIndexForThirdNumber = maxIndex
    const getThirdNumber = () =>
        Math.floor(
            CryptoUtils.random() *
                (maxIndexForThirdNumber - minIndexForThirdNumber + 1),
        ) + minIndexForThirdNumber
    let thirdNumber = getThirdNumber()
    while (thirdNumber === firstNumber || thirdNumber === secondNumber) {
        // Ensure that the third number is not equal to the first or second number
        const newNumber = getThirdNumber()
        thirdNumber = newNumber
    }
    result.push(thirdNumber)

    return result
}
