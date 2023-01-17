import { OnboardStage } from "./enum"

/**
 * Current state on the onboard process
 *
 * @field 'password' - The password that will be used to encrypt the app
 * @field 'stage' - The current stage on the onboard process
 */
export interface OnboardState {
    password?: string
    stage: OnboardStage
}
