const wrap = <T>(fn: (...args: any)=> T, callback?: (value: T) => void|Promise<void>) => {
    const wrapper = async (...args: any) => {
        const value = await fn(...args)
        await callback?.(value)
    }
    wrapper.toString = () => fn.toString()
    return wrapper
}

export default wrap