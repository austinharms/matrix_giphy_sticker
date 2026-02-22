import { html } from "../lib/htm/preact.js";

export const Settings = ({stickersPerRow, updateStickersPerRow, theme, setTheme }) => (html`
    <section class="stickerpack settings" id="pack-settings" data-pack-id="settings">
        <h1>Settings</h1>
        <div class="settings-list">
            <div>
                <label for="stickers-per-row">Stickers per row:</label>
                <input type="range" min=2 max=10 id="stickers-per-row" id="stickers-per-row"
                    value=${stickersPerRow}
                    onInput=${evt => updateStickersPerRow(evt.target.value)}/>
            </div>
            <div>
                <label for="theme">Theme: </label>
                <select name="theme" id="theme" onChange=${evt => setTheme(evt.target.value)}>
                    <option value="default">Default</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="black">Black</option>
                </select>
            </div>
        </div>
    </section>`);