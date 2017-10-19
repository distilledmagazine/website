mod assets;
mod pages;

fn main() {
    for route in pages::ROUTES.iter() {
        println!("{:?}", route.url);
    }
    for route in assets::ROUTES.iter() {
        println!("{:?}", route.url);
    }
}
