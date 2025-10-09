import { bookService } from "../services/book.service.js"
import { showErrorMsg } from "../services/event-bus.service.js"
import { utilService } from "../services/util.service.js"

const { useNavigate, useParams } = ReactRouterDOM
const { useState, useEffect, Fragment } = React

export function AddReview() {

    const [bookToReview, setBookToReview] = useState(bookService.getEmptyBook())
    const [review, setReview] = useState(bookService.getEmptyReview())
    const [cmpType, setCmpType] = useState('text')


    const navigate = useNavigate()
    const { bookId } = useParams()

    useEffect(() => {
        if (bookId) loadBook()
    }, [])

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
            case 'select-one':
                value = +value
                break;

            case 'checkbox':
            case 'radio':
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

                <h2>Rate by:</h2>
                <label htmlFor="select">select</label>
                <input type="radio" name="rate-by" id="select" value={'select'} onChange={ev => setCmpType(ev.target.value)} />
                <label htmlFor="text">text</label>
                <input type="radio" name="rate-by" id="text" value={'text'} onChange={ev => setCmpType(ev.target.value)} checked={cmpType === 'text'} />
                <label htmlFor="stars">stars</label>
                <input type="radio" name="rate-by" id="stars" value={'stars'} onChange={ev => setCmpType(ev.target.value)} />
                {/* <select value={cmpType} onChange={ev => setCmpType(ev.target.value)}>
                    <option>select</option>
                    <option>text</option>
                    <option>stars</option>
                </select> */}
                <section className="dynamic-cmps">
                    <label htmlFor="rating">Rating</label>
                    <DynamicCmp cmpType={cmpType} review={review} handleChange={handleChange} />
                </section>
                <label htmlFor="readAt">Read at</label>
                <input value={review.readAt} onChange={handleChange} type="date" name="readAt" id="readAt"></input>
                <button >Save</button>
            </form>
        </section>
    )
}


function DynamicCmp(props) {

    const dynamicCmpMap = {
        select: <RateBySelect {...props} />,
        text: <RateByTextbox {...props} />,
        stars: <RateByStars {...props} />,
    }

    return dynamicCmpMap[props.cmpType]
}

function RateBySelect({ review, handleChange }) {
    return (
        <select name="rating" value={review.rating} onChange={ev => handleChange(ev)}>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
        </select>
    )
}

function RateByTextbox({ review, handleChange }) {
    return <input value={review.rating} onChange={handleChange} type="number" name="rating" id="rating" />
}

function RateByStars({ review, handleChange }) {

    function onRateByStar(rate) {
        console.log(rate)
        const target = { name: 'rating', value: rate };
        handleChange({ target })

    }
    return (
        <ul className="flex">
            {[...Array(5)].map((_, idx) => (
                <li key={idx} className={`rate-star ${(idx + 1 <= review.rating) ? 'active' : ''}`} onClick={() => onRateByStar(idx + 1)}>
                    &#9733;
                </li>
            ))}
        </ul>
    )
}

