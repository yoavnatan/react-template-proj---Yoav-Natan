const { Link, NavLink } = ReactRouterDOM

export function AppHeader() {
    return (
        <header className="app-header container">
            <section>
                <h1>Book Shop</h1>
                <nav className="app-nav">
                    <NavLink to="/home" >Home</NavLink>
                    <NavLink to="/aboutus" >About</NavLink>
                    <NavLink to="/book" >Books</NavLink>
                </nav>
            </section>
        </header>
    )

}