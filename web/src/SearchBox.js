import { Component, html } from "../lib/htm/preact.js";

export class SearchBox extends Component {
    constructor({ onSearch, liveSearchInterval, value, placeholder = 'Search' }) {
        super();
        this.searchTimeout = null;
        this.liveSearchInterval = liveSearchInterval;
        this.updateSearchInput = this.updateSearchInput.bind(this);
        this.trySearch = this.trySearch.bind(this);
        this.searchSubmit = this.searchSubmit.bind(this);
        this.searchHandler = onSearch;
        this.searchedValue = null;
        this.state = { value: value || "" };
        this.placeholder = placeholder;
    }

    componentWillUnmount() {
        this.clearSearchTimeout();
    }

    clearSearchTimeout() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = null;
    }

    updateSearchInput(e) {
        this.setState({
            value: e.target.value
        });
        this.clearSearchTimeout();
        if (Number.isFinite(this.liveSearchInterval) && this.liveSearchInterval >= 1) {
            this.searchTimeout = setTimeout(this.trySearch, this.liveSearchInterval)
        }
    }

    trySearch() {
        this.clearSearchTimeout();
        if (this.state.value != this.searchedValue) {
            this.searchedValue = this.state.value;
            this.searchHandler(this.state.value);
        }
    }

    searchSubmit(e) {
        e.preventDefault();
        this.trySearch();
    }

    render() {
        return (html`
            <form class="search-box" onSubmit=${this.searchSubmit}>
                <input type="text" placeholder=${this.placeholder} value=${this.state.value} onInput=${this.updateSearchInput} />
                <span class="icon icon-search"/>
            </form>`);
    }
}
