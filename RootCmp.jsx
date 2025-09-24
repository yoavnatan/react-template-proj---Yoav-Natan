import { HomePage } from './pages/HomePage.jsx'
import { BookIndex } from './pages/BookIndex.jsx'
import { AboutUs } from './pages/AboutUs.jsx'

const { useState } = React

export function App() {

    const [page, setPage] = useState('home')
    return (
        <section className="app">
            <header className="app-header">
                <h1>Book Shop</h1>
                <nav className="app-nav">
                    <a onClick={() => setPage('home')}>Home</a>
                    <a onClick={() => setPage('books')}>Books</a>
                    <a onClick={() => setPage('about')}>About</a>
                </nav>
            </header>
            <main className="container">
                {page === 'home' && <HomePage />}
                {page === 'books' && <BookIndex />}
                {page === 'about' && <AboutUs />}
            </main>
        </section>
    )
}