import { mockTokenRegistry } from "./stubs/TokenRegistryStubs"
import ThorHelpers from "./stubs/Thor"
import * as data from "./data"
import * as assets from "./assets"
import * as render from "./render"
export default {
    data,
    assets,
    render,
    mockTokenRegistry,
    thor: ThorHelpers,
}
