extern crate argparse;
extern crate futures;
extern crate hyper;

mod routes;

use std::net::SocketAddr;
use argparse::{ArgumentParser, Store};
use futures::future::Future;
use hyper::StatusCode;
use hyper::header::ContentType;
use hyper::mime::Mime;
use hyper::server::{Http, Request, Response, Service};
use routes::{Route, ROUTES};

fn main() {
    let mut port = 8080;
    {
        let mut ap = ArgumentParser::new();
        ap.refer(&mut port).add_option(&["-p", "--port"], Store, "Port to start pamphlet server on");
        ap.parse_args_or_exit();
    }

    let host = "0.0.0.0".parse().unwrap();
    let addr = SocketAddr::new(host, port);
    let server = Http::new().bind(&addr, || Ok(Pamphlet)).unwrap();

    println!("Pamphlet server running on http://localhost:{}", port);
    server.run().unwrap();
}

struct Pamphlet;

impl Pamphlet {
    fn match_route(requested: &str) -> Option<&Route> {
        for route in ROUTES.iter() {
            let mut url = format!("/{}", route.url);
            if requested == url {
                return Some(route);
            }

            url.push_str("/");
            if requested == url {
                return Some(route);
            }
        }
        None
    }
}

impl Service for Pamphlet {
    type Request = Request;
    type Response = Response;
    type Error = hyper::Error;
    type Future = Box<Future<Item=Self::Response, Error=Self::Error>>;

    fn call(&self, req: Request) -> Self::Future {
        let mut response = Response::new();

        match Pamphlet::match_route(req.path()) {
            Some(route) => {
                let mime: Mime = route.mime.parse().unwrap();
                response.headers_mut().set(ContentType(mime));
                response.set_body(route.bytes);
            },
            None => {
                response.set_status(StatusCode::NotFound);
                response.set_body("404\n");
            }
        }
        Box::new(futures::future::ok(response))
    }
}
