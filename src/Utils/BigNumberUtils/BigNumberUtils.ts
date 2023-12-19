import { BigNumber as BN } from "bignumber.js"
// import { BigNumber as EtherBN } from "ethers"
import { isEmpty } from "lodash"

interface IBigNumberUtils {
    // utility Methods
    toHuman(decimals: number, callback?: (result: BN) => void): BigNumberUtils
    decimals(decimals: number, callback?: (result: BN) => void): BigNumberUtils
    toCurrencyFormat_string(decimals: number): string
    toTokenFormat_string(decimals: number): string
    toCurrencyConversion(balance: string, rate?: number, callback?: (result: BN) => void): BigNumberUtils
    toTokenConversion(balance: string, rate?: number, callback?: (result: BN) => void): BigNumberUtils
    addTrailingZeros(decimals: number, callback?: (result: BN) => void): BigNumberUtils

    // Math Methods
    minus(value: string | number | BN, callback?: (result: BN) => void): BigNumberUtils
    plus(value: string | number | BN, callback?: (result: BN) => void): BigNumberUtils
    times(value: string | number | BN, callback?: (result: BN) => void): BigNumberUtils
    idiv(value: string | number | BN, callback?: (result: BN) => void): BigNumberUtils
    multiply(value: string | number | BN, callback?: (result: BN) => void): BigNumberUtils

    // Comparison Methods
    isLessThan(value: string | number | BN): boolean
    isBiggerThan(value: string | number | BN): boolean

    // Properties
    toString: string
    toNumber: number
    toHex: string
    isZero: boolean
}

class BigNumberUtils implements IBigNumberUtils {
    private data: BN

    constructor(input: string | number | BN) {
        BN.config({ EXPONENTIAL_AT: 1e9 })
        this.data = new BN(input)
    }

    // custom initializer
    static init() {
        return new BigNumberUtils("0")
    }

    // Properties
    get toString(): string {
        return this.data.toString()
    }

    get toNumber(): number {
        return this.data.toNumber()
    }

    get toHex(): string {
        return this.data.toString(16)
    }

    get isZero(): boolean {
        return this.data.isZero()
    }

    // Methods
    toHuman(decimals: number, callback?: (result: BN) => void): this {
        this.data = this.data.dividedBy(new BN(10).pow(decimals))

        if (callback) {
            callback(this.data)
        }

        return this
    }

    decimals(value: number, callback?: (result: BN) => void): this {
        this.data = new BN(this.data.toFixed(value, BN.ROUND_DOWN))

        if (callback) {
            callback(this.data)
        }
        return this
    }

    minus(value: string | number | BN, callback?: (result: BN) => void): this {
        this.data = this.data.minus(value)

        if (callback) {
            callback(this.data)
        }

        return this
    }

    multiply(value: string | number | BN, callback?: (result: BN) => void): this {
        this.data = this.data.multipliedBy(value)

        if (callback) {
            callback(this.data)
        }

        return this
    }

    plus(value: string | number | BN, callback?: (result: BN) => void): this {
        this.data = this.data.plus(value)

        if (callback) {
            callback(this.data)
        }

        return this
    }

    times(value: string | number | BN, callback?: (result: BN) => void): this {
        this.data = this.data.times(value)

        if (callback) {
            callback(this.data)
        }

        return this
    }

    idiv(value: string | number | BN, callback?: (result: BN) => void): this {
        this.data = this.data.idiv(value)

        if (callback) {
            callback(this.data)
        }

        return this
    }

    isLessThan(value: string | number | BN): boolean {
        return this.data.isLessThan(value)
    }

    isBiggerThan(value: string | number | BN): boolean {
        return this.data.isGreaterThan(value)
    }

    toCurrencyFormat_string(decimals: number): string {
        let format = { decimalSeparator: ".", groupSeparator: ",", suffix: "" }
        BN.config({ FORMAT: format })

        let _data = ""

        if (this.data.isLessThan("0.01") && !this.data.isZero()) {
            _data = "< 0.01"
        } else {
            _data = this.data.toFormat(decimals, BN.ROUND_DOWN)
        }

        return _data
    }

    toTokenFormat_string(decimals: number): string {
        let format = { decimalSeparator: ".", groupSeparator: ",", suffix: "" }
        BN.config({ FORMAT: format })

        let _data = ""

        if (this.data.isLessThan("0.0001") && !this.data.isZero()) {
            _data = "< 0.0001"
        } else {
            _data = this.data.toFormat(decimals, BN.ROUND_DOWN)
        }

        return _data
    }

    toCurrencyConversion(balance: string, rate?: number, callback?: (result: BN) => void) {
        let _balance = !isEmpty(balance) ? balance : "0"
        let _rate = rate ?? 1
        this.data = new BN(_balance).multipliedBy(_rate)

        if (callback) {
            callback(this.data)
        }

        return this
    }

    toTokenConversion(balance: string, rate?: number, callback?: (result: BN) => void) {
        let _balance = !isEmpty(balance) ? balance : "0"
        let _rate = 1 / (rate ?? 1)
        this.data = new BN(_balance).multipliedBy(_rate)

        if (callback) {
            callback(this.data)
        }

        return this
    }

    addTrailingZeros(decimals: number, callback?: (result: BN) => void): this {
        this.data = this.data.multipliedBy(new BN(10).pow(decimals))

        if (callback) {
            callback(this.data)
        }

        return this
    }
}

function BigNutils(input?: string | number | BN): BigNumberUtils {
    if (input) {
        return new BigNumberUtils(input)
    } else {
        return BigNumberUtils.init()
    }
}

export { BigNumberUtils }
export default BigNutils
