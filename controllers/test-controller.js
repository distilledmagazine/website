var { Controller } = require('stimulus')

class TestController extends Controller {
    test() {
        console.log('yep.')
    }
}

module.exports = TestController
