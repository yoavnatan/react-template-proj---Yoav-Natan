const { useState, useEffect } = React

export function BookFilter({ defaultFilter, onSetFilterBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState(defaultFilter)

    useEffect(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value
                break;

            case 'checkbox':
                value = target.checked
                break
        }

        setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
    }

    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilterBy(filterByToEdit)
    }

    const { title, minPrice } = filterByToEdit

    const isValid = title && minPrice

    return (
        <section className="book-filter container">
            <form onSubmit={onSubmitFilter}>
                <label htmlFor="title">Title</label>
                <input onChange={handleChange} value={title} name="title" id="title" type="text" />

                <label htmlFor="minPrice">Min Price</label>
                <input onChange={handleChange} value={minPrice || ''} name="minPrice" id="minPrice" type="number" />
                <button disabled={!isValid}>Submit</button>
            </form>
        </section>
    )

}