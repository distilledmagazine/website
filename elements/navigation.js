var html = require('choo/html')

module.exports = function () {
    return html`<nav>
        <ul>
            <li>
                <label>Magazine issues</label>
                <ul>
                    <li><a href="/distilled-magazine-issue-1">The Global Crisis in Confidence</a></li>
                    <li><a href="/distilled-magazine-issue-2">Individualism vs Collectivism</a></li>
                    <li><a href="/distilled-magazine-issue-3">The Origin of Principles</a></li>
                    <li><a href="/distilled-magazine-issue-4">The Art of the Possible</a></li>
                </ul>
            </li>
        </ul>
    </nav>`
}
