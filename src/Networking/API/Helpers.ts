import axios from "axios"

export const DEFAULT_PAGE_SIZE: number = 25
const TIMEOUT = 15000

// Create an instance of axios with common configurations
const axiosInstance = axios.create({
    timeout: TIMEOUT,
})

/**
 * Fetches data from a specific URL endpoint using axios HTTP client.
 *
 * @template T The expected return type from the HTTP request.
 * @param {string} url - The URL of the HTTP endpoint.
 *
 * @returns {Promise<T>} A promise that resolves to the data from the response.
 *
 * @throws Will throw an error if the HTTP request fails or if the error is not an instance of Error.
 */
export const fetchFromEndpoint = async <T>(url: string) => {
    try {
        const response = await axiosInstance.get<T>(url)
        return response.data
    } catch (error) {
        // Verify if 'error' is an instance of an Error before accessing 'error.message'
        if (error instanceof Error) {
            throw new Error(
                `Failed to fetch from endpoint ${url}: ${error.message}`,
            )
        } else {
            throw new Error(
                `Failed to fetch from endpoint ${url}: ${JSON.stringify(
                    error,
                )}`,
            )
        }
    }
}
