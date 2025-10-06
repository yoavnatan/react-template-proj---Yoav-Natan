const { Link, Outlet } = ReactRouterDOM

export function AboutUs() {

    return (
        <section className="about container">
            <h1>About cars and us...</h1>
            <p>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                Optio dolore sapiente, iste animi corporis nisi atque tempora assumenda dolores.
                Nobis nam dolorem rerum illo facilis nemo sit voluptatibus laboriosam necessitatibus!
            </p>

            <nav>
                <Link to="/aboutus/team">Team</Link>
                <Link to="/aboutus/Goal">Goal</Link>
            </nav>
            <Outlet />
        </section>
    )
}