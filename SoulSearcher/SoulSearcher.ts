export class SoulSearcher extends HTMLElement{
    static config = {
        mainTemplate: String.raw `
            <tr>
                <td>
                    <slot name=self></slot>
                    <slot name=fa></slot>
                </td>
                <td>
                    <slot name=fo></slot>
                </td>
            </tr>
        `,
    }

}
customElements.define('soul-searcher', SoulSearcher);