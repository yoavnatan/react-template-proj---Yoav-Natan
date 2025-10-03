import { bookService } from "../services/book.service.js"

const { useState, useEffect } = React

export function BookAdd() {

    const [searchVal, setSearchVal] = useState('')
    const [searchRes, setSearcRes] = useState([])

    function handleChange({ target }) {
        setSearchVal(target.value)
    }

    function onSubmitForm(ev) {
        ev.preventDefault()
        bookService.searchByGoogle(searchVal)
            .then(res => setSearcRes(res))
        // const books = bookService.demoSerach()
        // console.log(books)
        // setSearcRes(books)
        // console.log(bookService.googleQuery())
    }

    function onAddBook(book) {
        bookService.addGoogleBook(book)
            .then(book => console.log(book))
            .catch(err => console.log('err', err))

    }

    return (
        <section className="add-form-container">
            <h1>Add by Google</h1>
            <form onSubmit={onSubmitForm}>
                <label htmlFor="search"></label>
                <input value={searchVal} onChange={handleChange} type="text" name="search" id="search"></input>
                <button>Serach</button>
            </form>
            {searchRes && <ul>
                {searchRes.map(res =>
                    <li key={res.id}>{res.title}
                        <button className="btn" onClick={() => onAddBook(res)}>+</button></li>
                )}
            </ul>}
        </section>
    )
}

