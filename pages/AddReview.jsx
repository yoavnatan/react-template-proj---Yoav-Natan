import { bookService } from "../services/book.service.js"
import { showErrorMsg } from "../services/event-bus.service.js"
import { utilService } from "../services/util.service.js"

const { useNavigate, useParams } = ReactRouterDOM
const { useState, useEffect } = React

export function AddReview() {

    const [bookToReview, setBookToReview] = useState(bookService.getEmptyBook())
    const [review, setReview] = useState(getEmptyReview())

    const navigate = useNavigate()
    const { bookId } = useParams()

    useEffect(() => {
        if (bookId) loadBook()
    }, [])

    function getEmptyReview() {
        return {
            id: utilService.makeId(),
            name: '',
            rating: '',
            readAt: '',
        }
    }
    function loadBook() {

        bookService.get(bookId)
            .then(book => setBookToReview(book))
            .catch(err => {
                console.log('err:', err)
            })
    }

    function onSaveReview(ev) {

        ev.preventDefault()
        bookService.addReview(bookId, review)
            .then(() => {
                showSuccessMsg('Review saved successfully!')
                navigate(`/book/${bookId}`)
            })
            .catch(err => {
                console.log('err:', err)
                navigate(`/book/${bookId}`)
                showErrorMsg('Cannot save review')
            })
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

        setReview(prevReview => ({ ...prevReview, [field]: value }))
    }

    const { title } = bookToReview

    return (
        <section className="book-review-editor">
            {/* <h1>{bookId ? 'Edit' : 'Add'} Book</h1> */}
            <h1>Add your review to: {title}</h1>
            <form onSubmit={onSaveReview}>
                <label htmlFor="name">Full Name:</label>
                <input value={review.name} onChange={handleChange} type="text" name="name" id="name" />

                <label htmlFor="rating">Rating</label>
                <input value={review.rateing} onChange={handleChange} type="number" name="rating" id="rating" />

                <label htmlFor="readAt">Read at</label>
                <input value={review.readAt} onChange={handleChange} type="date" name="readAt" id="readAt"></input>
                <button >Save</button>
            </form>
        </section>
    )
}