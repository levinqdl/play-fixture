const wrap = (fn: Function) => {
    const wrapper = async (...args: any) => {
        await fn(...args)
    }
    wrapper.toString = () => fn.toString()
    return wrapper
}

export default wrap