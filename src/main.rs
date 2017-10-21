mod routes;

fn main() {
    for route in routes::ROUTES.iter() {
        println!("{:?}", route.url);
    }
}
