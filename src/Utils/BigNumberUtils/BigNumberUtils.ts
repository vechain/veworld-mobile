import { BigNumber as BN } from "bignumber.js"
import { isEmpty } from "lodash"
import { getNumberFormatter } from "~Constants/Constants/NumberFormatter"

export type BigNumberable = string | number | BN | bigint | BigNumberUtils

const locales_separator = {
    tw: ".",
    "zh-tw": ".",
    zh: ".",
    "zh-cn": ".",
    de: ",",
    "de-DE": ",",
    en: ".",
    "en-US": ".",
    es: ",",
    "es-ES": ",",
    fr: ",",
    "fr-FR": ",",
    hi: ".",
    "hi-IN": ".",
    it: ",",
    "it-IT": ",",
    ja: ".",
    "ja-JP": ".",
    ko: ".",
    "ko-KR": ".",
    nl: ",",
    "nl-NL": ",",
    pl: ",",
    "pl-PL": ",",
    pt: ",",
    "pt-PT": ",",
    ru: ",",
    "ru-RU": ",",
    sv: ",",
    "sv-SE": ",",
    tr: ",",
    "tr-TR": ",",
    vi: ",",
    "vi-VN": ",",
    "nl-BE": ",",
}

const parseBigNumberable = (value: BigNumberable): BN.Value => {
    if (typeof value === "bigint") return value.toString()
    if (value instanceof BigNumberUtils) return value.toBN
    return value
}

type Value = BN.Value | bigint

interface IBigNumberUtils {
    // utility Methods
    toHuman(decimals: number, callback?: (result: BN) => void): BigNumberUtils
    decimals(decimals: number, callback?: (result: BN) => void): BigNumberUtils
    toCurrencyFormat_string(decimals: number, locale?: Intl.LocalesArgument): string
    toTokenFormat_string(decimals: number, locale?: Intl.LocalesArgument): string
    toCurrencyConversion(
        balance: string,
        rate?: number,
        callback?: (result: BN) => void,
        decimals?: number,
    ): { value: string; preciseValue: string; isLeesThan_0_01: boolean }
    toTokenConversion(balance: string, rate?: number, callback?: (result: BN) => void): BigNumberUtils
    addTrailingZeros(decimals: number, callback?: (result: BN) => void): BigNumberUtils
    toCompactString(locale: Intl.LocalesArgument, decimals?: number): string
    clone(): BigNumberUtils

    // Math Methods
    minus(value: Value, callback?: (result: BN) => void): BigNumberUtils
    plus(value: Value, callback?: (result: BN) => void): BigNumberUtils
    times(value: Value, callback?: (result: BN) => void): BigNumberUtils
    idiv(value: Value, callback?: (result: BN) => void): BigNumberUtils
    multiply(value: Value, callback?: (result: BN) => void): BigNumberUtils

    // Comparison Methods
    isLessThan(value: Value): boolean
    isBiggerThan(value: Value): boolean

    // Properties
    toString: string
    toNumber: number
    toHex: string
    isZero: boolean
    toBigInt: bigint
    toBN: BN
}

const getDecimalSeparator = (locale: Intl.LocalesArgument) => {
    return locales_separator[locale as keyof typeof locales_separator]
}

const stripTrailingZeros = (value: string) => {
    return [...value].reduceRight((acc, curr) => (acc === "" && curr === "0" ? acc : `${curr}${acc}`), "")
}

const toBNValue = (value: Value): BN.Value => {
    if (typeof value === "bigint") return value.toString()
    return value
}

class BigNumberUtils implements IBigNumberUtils {
    private data: BN

    constructor(input: Value) {
        BN.config({ EXPONENTIAL_AT: 1e9 })
        this.data = new BN(toBNValue(input))
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
        return this.data.decimalPlaces(0).toString(16)
    }

    get toBigInt(): bigint {
        return BigInt(this.data.decimalPlaces(0).toString())
    }

    get isZero(): boolean {
        return this.data.isZero()
    }

    get toBN(): BN {
        return new BN(this.data)
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

    minus(value: Value, callback?: (result: BN) => void): this {
        this.data = this.data.minus(toBNValue(value))

        if (callback) {
            callback(this.data)
        }

        return this
    }

    multiply(value: Value, callback?: (result: BN) => void): this {
        this.data = this.data.multipliedBy(toBNValue(value))

        if (callback) {
            callback(this.data)
        }

        return this
    }

    plus(value: Value, callback?: (result: BN) => void): this {
        this.data = this.data.plus(toBNValue(value))

        if (callback) {
            callback(this.data)
        }

        return this
    }

    times(value: Value, callback?: (result: BN) => void): this {
        this.data = this.data.times(toBNValue(value))

        if (callback) {
            callback(this.data)
        }

        return this
    }

    idiv(value: Value, callback?: (result: BN) => void): this {
        this.data = this.data.idiv(toBNValue(value))

        if (callback) {
            callback(this.data)
        }

        return this
    }

    div(value: Value, callback?: (result: BN) => void): this {
        this.data = this.data.div(toBNValue(value))

        if (callback) {
            callback(this.data)
        }

        return this
    }

    isLessThan(value: Value): boolean {
        return this.data.isLessThan(toBNValue(value))
    }

    isLessThanOrEqual(value: Value): boolean {
        return this.data.isLessThanOrEqualTo(toBNValue(value))
    }

    isBiggerThan(value: Value): boolean {
        return this.data.isGreaterThan(toBNValue(value))
    }

    isBiggerThanOrEqual(value: Value): boolean {
        return this.data.isGreaterThanOrEqualTo(toBNValue(value))
    }

    toCurrencyFormat_string(decimals: number, locale?: Intl.LocalesArgument): string {
        const _locale = locale ?? "en-US"
        const formatter = getNumberFormatter({
            locale: _locale,
            precision: decimals,
            style: "decimal",
            useGrouping: true,
        })
        let _data = ""

        if (this.data.isLessThan("0.01") && !this.data.isZero()) {
            _data = `< ${formatter.format(0.01)}`
        } else {
            _data = formatter.format(this.data as unknown as bigint)
        }

        return _data
    }

    toTokenFormat_string(decimals: number, locale?: Intl.LocalesArgument): string {
        const _locale = locale || "en-US"

        const formatter = getNumberFormatter({
            locale: _locale,
            precision: decimals,
            style: "decimal",
            useGrouping: true,
        })

        let _data = ""

        if (this.data.isLessThan("0.01") && !this.data.isZero()) {
            _data = `< ${formatter.format(0.01)}`
        } else {
            const tokenBalance = new BN(this.data.toFixed(decimals, BN.ROUND_DOWN))
            _data = formatter.format(tokenBalance as unknown as bigint)
        }

        return _data
    }

    /**
     * Builds a formatted string, by using these rules:
     * - Cap the value to {@link decimals} decimals
     * - Strip trailing zeros
     * - Always show at least two decimal places
     * - If the value is less than the amount of decimals specified, show < 0.{{@link decimals} - 1}1
     * @param decimals Number of decimals to show
     * @param locale Locale of the user (defaults to 'en-US')
     * @returns A formatted string
     */
    toTokenFormatFull_string(decimals: number, locale?: Intl.LocalesArgument): string {
        const _locale = locale ?? "en-US"
        const separator = getDecimalSeparator(_locale.toString()) ?? "."
        if (this.data.isZero()) return ["0", "00"].join(separator)
        const formatter = getNumberFormatter({
            locale: _locale,
            precision: decimals,
            style: "decimal",
            useGrouping: true,
        })

        const tokenBalance = new BN(this.data.toFixed(decimals, BN.ROUND_DOWN))

        const formatted = formatter.format(tokenBalance as unknown as bigint)

        const [unit, decimal] = formatted.split(separator)
        if (typeof decimal === "undefined") return [unit, "00"].join(separator)
        const strippedDecimals = stripTrailingZeros(decimal)
        if (strippedDecimals === "")
            return parseInt(unit, 10) === 0
                ? `< ${[unit, "0".repeat(decimals - 1) + "1"].join(separator)}`
                : [unit, "00"].join(separator)
        return [unit, strippedDecimals].join(separator)
    }

    toCurrencyConversion(balance: string, rate?: number, callback?: (result: BN) => void, decimals?: number) {
        let _balance = !isEmpty(balance) ? balance : "0"
        let _rate = rate ?? 1
        this.data = new BN(_balance).multipliedBy(_rate)

        if (callback) {
            callback(this.data)
        }

        return {
            value: this.data.isLessThan("0.01") && !this.data.isZero() ? "< 0.01" : this.data.toString(),
            preciseValue: this.data.toFixed(decimals ?? 8, BN.ROUND_DOWN),
            isLeesThan_0_01: this.data.isLessThan("0.01") && !this.data.isZero(),
        }
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

    /**
     * Converts large numbers to a compact UI string format with suffixes.
     * Examples: 10000000 -> "10 M", 200000 -> "200 K", 1500 -> "1.5 K"
     * @param decimals Number of decimal places to show (defaults to 1)
     * @returns A compact formatted string
     */
    toCompactString(locale: Intl.LocalesArgument, decimals: number = 1): string {
        const powers: Record<number, number> = {
            4: Math.pow(10, 12),
            3: Math.pow(10, 9),
            2: Math.pow(10, 6),
            1: Math.pow(10, 3),
            0: 1,
        }

        const log10 = Math.log10(this.data.toNumber())

        if (log10 < 3) return this.data.toFixed(0)

        const power = Math.floor(log10 / 3)
        const value = this.toNumber / powers[power]
        const suffix = ["", "K", "M", "B", "T"][power]

        const formatter = getNumberFormatter({
            locale,
            precision: decimals,
            style: "decimal",
            useGrouping: true,
        })

        const formatted = formatter.format(value)
        return formatted + suffix
    }

    clone() {
        return new BigNumberUtils(this.data)
    }

    static min(...values: BigNumberable[]) {
        return new BigNumberUtils(BN.min(...values.map(v => parseBigNumberable(v))))
    }

    static max(...values: BigNumberable[]) {
        return new BigNumberUtils(BN.max(...values.map(v => parseBigNumberable(v))))
    }

    static average(values: BigNumberable[]) {
        return values
            .reduce<BigNumberUtils>((acc, v) => {
                const u = acc.plus(parseBigNumberable(v))
                return u
            }, BigNutils("0"))
            .div(values.length)
    }
}

function BigNutils(input?: string | number | BN | bigint): BigNumberUtils {
    if (input) {
        return new BigNumberUtils(input)
    } else {
        return BigNumberUtils.init()
    }
}

export { BigNumberUtils }
export default BigNutils
