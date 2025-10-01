
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
        if (bookId) loadCar()
    }, [])


    function loadCar() {
        setIsLoading(true)
        carService.get(carId)
            .then(car => setCarToEdit(car))
            .catch(err => {
                console.log('err:', err)
                navigate('/car')
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
        setCarToEdit(prevCar => ({ ...prevCar, [field]: value }))
    }

    function onSaveCar(ev) {
        ev.preventDefault()
        carService.save(carToEdit)
            .then(() => navigate('/car'))
            .catch(err => {
                console.log('err:', err)
                navigate('/car')
                showErrorMsg('Cannot save car')
            })
    }


    const loadingClass = isLoading ? 'loading' : ''
    const { vendor, speed } = carToEdit
    return (
        <section className="car-edit">
            <h1>{carId ? 'Edit' : 'Add'} Car</h1>
            <form className={loadingClass} onSubmit={onSaveCar}>
                <label htmlFor="vendor">Vendor</label>
                <input value={vendor} onChange={handleChange} type="text" name="vendor" id="vendor" />

                <label htmlFor="speed">Speed</label>
                <input value={speed} onChange={handleChange} type="number" name="speed" id="speed" />
                <button disabled={!vendor}>Save</button>
            </form>
        </section>
    )

}