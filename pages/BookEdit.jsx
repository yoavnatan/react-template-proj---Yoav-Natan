
import { bookService } from "../services/book.service.js"
import { showErrorMsg } from "../services/event-bus.service.js"
const { useNavigate, useParams } = ReactRouterDOM
const { useState, useEffect } = React

export function BookEdit() {

    const [bookToEdit, setBookToEdit] = useState(bookService.getEmptyBook())
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()
    const { bookId } = useParams()

    useEffect(() => {
        if (bookId) loadBook()
    }, [])


    function loadBook() {
        setIsLoading(true)
        bookService.get(bookId)
            .then(book => setBookToEdit(book))
            .catch(err => {
                console.log('err:', err)
                navigate('/book')
            })
            .finally(() => setIsLoading(false))
    }

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
        setBookToEdit(prevBook => ({ ...prevBook, [field]: value }))
    }

    function onSaveBook(ev) {
        ev.preventDefault()
        bookService.save(bookToEdit)
            .then(() => navigate('/book'))
            .catch(err => {
                console.log('err:', err)
                navigate('/book')
                showErrorMsg('Cannot save book')
            })
    }


    const loadingClass = isLoading ? 'loading' : ''
    const { title, listPrice } = bookToEdit
    return (
        <section className="book-edit">
            <h1>{bookId ? 'Edit' : 'Add'} Book</h1>
            <form className={loadingClass} onSubmit={onSaveBook}>
                <label htmlFor="title">Title</label>
                <input value={title} onChange={handleChange} type="text" name="title" id="title" />

                <label htmlFor="price">Price</label>
                <input value={listPrice.amount} onChange={handleChange} type="number" name="price" id="price" />
                <button disabled={!title}>Save</button>
            </form>
        </section>
    )

}