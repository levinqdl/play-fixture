import { getFixtures } from "./getFixtures"
import skippedTeardowns from "./skipped-teardowns"

const wrap = <T>(fn: (...args: any)=> T, callback?: (value: T) => void|Promise<void>) => {
    const wrapper = async (...args: any) => {
        const fixtures = getFixtures(args.at(-1).fn) ?? []
        for (const fixture of fixtures) {
            skippedTeardowns.add(fixture)
        }
        const value = await fn(...args)
        await callback?.(value)
    }
    wrapper.toString = () => fn.toString()
    return wrapper
}

export default wrap