const { useState } = React
import { bookService } from "../services/book.service.js"

export function BookReviews({ book }) {

    const { reviews, id } = book

    const [reviewsToUpadate, setReviewsToUpdate] = useState([...reviews])

    function onRemoveReview(reviewId) {
        bookService.removeReview(id, reviewId)
            .then(setReviewsToUpdate)
    }

    return (
        <ul>
            {reviewsToUpadate.map(review =>
                <li key={review.id}>{review.name} | {review.rating} | {review.readAt}
                    <button onClick={() => onRemoveReview(review.id)}>X</button></li>
            )}
        </ul>
    )
} 