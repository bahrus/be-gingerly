# be-gingerly (🫚)

[![Playwright Tests](https://github.com/bahrus/be-gingerly/actions/workflows/CI.yml/badge.svg)](https://github.com/bahrus/be-gingerly/actions/workflows/CI.yml)
[![NPM version](https://badge.fury.io/js/be-gingerly.png)](http://badge.fury.io/js/be-gingerly)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-gingerly?style=for-the-badge)](https://bundlephobia.com/result?p=be-gingerly)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-gingerly?compression=gzip">

## J'accuse

Frameworks are great.  

Great at locking you in, that is.

How are they so effective at doing that?  I'll tell you how.

Okay, it's a theory anyway.

Sometimes when we are generating a loop of repeated HTML on the server or on the client, we need a convenient place to pass the view model responsible for 
generating the data that gets interspersed into the HTML section of the loop.

One way this can be done is with an extremely light-weight rendering from the looping code (again, either on the server or the client) -- just rendering a single tag of a custom element for each iteration of the loop, and passing in the data for the view model, and let the custom element take care of the rest:

```JavaScript
${myList.map(item => html`
    <my-item .vm=${item}></my-item>
`)}
```

Now our custom element can go in one of two ways:  It can use Shadow DOM or not use Shadow DOM.  If using Shadow DOM, the division of labor between the looping code and the custom element is pretty clear -- the looping code is expected to generate any light children, if applicable.  The custom element generates all the content inside the ShadowRoot, and takes a hands-off approach towards the light children. (On the server side, I suppose the server side logic would often do both).

Things become much more ambiguous if no ShadowDOM is used.  In my view, if the custom element chooses to generate its own children, that should work fine so long as the "framework" takes a "mind your own business, and don't do unnecessary work" approach to rendering.  The code snippet above, which uses the "framework built into the browser" would certainly do that.  It's unclear to me how uniformly that fundamental tenet is adhered to with modern frameworks.  In the past, during the heyday of VDOM hype, I would see instances where the framework would appear to go through the thought process:  "hey, I didn't generate those child elements, how dare anything give birth to elements I didn't give permission to? I am going to blow that all away" on a re-render.  I can't vouch for what the latest state of the art frameworks do, just be forewarned.

Anyway, for the scenarios listed above, this custom enhancement isn't an invaluable ally.  We can get by perfectly without it (but I think it's possible we may want to use it anyway in these scenarios).

Where this enhancement may be critical is with another looping scenario.  Consider what happens when generating rows (tr elements) of the HTMLTable element:

```JavaScript
html`
<table>
    <thead><th>Name</th><th>SSN Number</thead>
    <tbody>
${myList.map(item => html`
    <tr>
        <td>${item.name}</td>
        <td>${item.ssn}</td>
    </tr>
`)}
    </tbody>
</table>
`
```



While the example above so far poses no issues, we start to immediately get a sense of unease the moment we need to start performing intimate actions on individual rows / items of the view model.  How do we get access to the view model item associated with the row?  We start inventing ways to handle this, with id's, lots of ugly look ups, etc.  

Which brings us to the fleeting thought "Hey, why don't I create a web component to contain each row, that can encapsulate the view model for each item of the list"? But of course the HTML decorum for tables doesn't allow us to do that.

I would venture that this problem space accounts for part of the appeal that frameworks bring to the table, beyond what can be handled by custom elements alone.  Lack of an interoperable solution to this fundamental problem may be partly to blame for causing this  framework "lock-in." We need an interoperable solution to this problem.

If we can solve this solution in a powerful way, we could then go back to other scenarios where HTML decorum would allow for Shadowless containers, but with the ambiguity of responsibility issue listed above, and see if using a non visual view model custom element as our general solution, that can then circumvent some of the sticky questions regarding division of responsibility, is a viable option.

The new approach this enhancement takes is to work in conjunction with recent enhancements to the [DSS](https://github.com/bahrus/trans-render/wiki/VIII.--Directed-Scoped-Specifiers-(DSS)#what-do-we-mean-by-hostish), which does the following:

We push the standard HTML vocabulary a tad in order to be as transparent as possible as far as what is happening, stretching the boolean [itemscope attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/itemscope) a little beyond its recognized platform role:

```JavaScript
html`
<table>
    <thead><th>Name</th><th>SSN Number</thead>
    <tbody>
${myList.map(item => html`
    <tr itemscope=my-item>
        <td>
            <my-item .item=${item}></my-item>
            ${item.name}
        </td>
        <td>${item.ssn}</td>
    </tr>
`)}
    </tbody>
</table>
`
```

So then if the libraries we work with have an easy-to-reproduce-in-any-framework "virtual host" getter that includes logic something like this:

```JavaScript
async function getHostish(el: Element){
    const closestItemScope = el.closest('[itemscope]');
    if(closestItemScope !== null){
        if(closestItemScope.localName.indexOf('-')){
            //it's a custom element so this is probably our host
            return closestItemScope;
        }
        const attr = closestItemScope.getAttribute('itemscope');
        return closestItemScope.querySelector(attr);
    }
    //get shadow root host
    return el.getRootNode().host;
}
```

then anywhere we would want to do:  el.getRootNode().host we instead call the function above, then we can work with any combination of solution -- with ShadowDOM, without ShadowDOM, as well as scenarios where neither works, because we can't contain each HTML item, as discussed above.

In other words, having established this protocol by necessity, we can then go back to other scenarios where HTML decorum would allow for Shadowless containers, but with the ambiguity of responsibility issue listed above, and use a non visual view model custom element as our general solution, that can then circumvent some of the sticky questions regarding division of responsibility.

## So what does be-gingerly do?

It commits a secondary sin, and attempts to shield frameworks from even having to bother supporting a function like we showed above.  Instead, *be-gingerly* attaches a property getter/setter, "host" to elements that commit the cardinal sin of  adding attribute "itemscope," that has a value pointing to the name of an inner custom element.  The host points to the custom element instance that the itemscope instances points to

Frameworks can then pass objects directly to the element that passes in the latest property values:

```JavaScript
html`
<table>
    <thead><th>Name</th><th>SSN Number</thead>
    <tbody 🫚>
${myList.map(item => html`
    <tr itemscope=my-item .ish=${item}>
        <td>
            ${item.name}
        </td>
        <td>${item.ssn}</td>
    </tr>
`)}
    </tbody>
</table>
`
```

In the case where an entire object is passed in, it will merge the object in using the ought-to-be-built-into-the-platform-if-only-they-would-serve-my-needs-for-once [Object].[assignGingerly](https://github.com/bahrus/trans-render/wiki/II.--Signals-vs-Roundabouts#merging-traffic-via-assigngingerly-wip) of the item object to the my-item custom element.  That's where the name and emoji of this enhancement comes from.

It can also do the same for server generated JSON attributes:

```html
<table>
    <thead><th>Name</th><th>SSN Number</thead>
    <tbody 🫚>
        <tr itemscope="my-item"  data-gingerish='{"address": "123 Penny Lane", "zip": "12345"}'>
            <td itemprop=name>
                Burt
            </td>
            <td itemprop=ssn>123-45-6789</td>
        </tr>
    </tbody>
</table>
```

## Canonical name

To use the canonical name, reference behivior.js instead of 🫚.js and be more gingerly:

```html
<table>
    <thead><th>Name</th><th>SSN Number</thead>
    <tbody>
        <tr itemscope="my-item"  be-gingerly data-gingerish='{"name": "Burt", "ssn": "123-45-6789"}'>
            <td>
                <my-item></my-item>
                Burt
            </td>
            <td>123-45-6789</td>
        </tr>
    </tbody>
</table>
```



## Expanding the template [TODO]

When *be-gingerly/🫚* adorns a template:

```html
<template id=row-src>
    <template be-switched="on when applicable">
        <tr itemprop=conditionalHeader>
            <th scope=row><slot name=person></slot></th>
            <td><slot name=interest></slot></td>
            <td><slot name=age></slot></td>
        </tr>
    <template>
    <template be-switched="on when some other condition is applicable">
        <tr itemprop=conditionalHeader>
            <th scope=row><slot name=self></slot><slot name=organization></slot></th>
            <td><slot name=interest></slot></td>
            <td><slot name=size></slot></td>
        </tr>
    </template>
</template>
<table>
    <thead><th>Entity</th><th></thead>
    <tbody>
        <template href=#row-src 🫚 itemscope=my-item>
            <span slot=first-cell itemprop=name>Burt</span></slot>
        </template>
    </tbody>
</table>
```

... then what this does is:

1.  Awaits customElements.whenDefined('my-item');
2.  Looks for static member of the class:  MyItem.config.mainTemplate
3.  If it is a string, turns it into a template.
4.  Clones the template.
5.  Assigns id's for all top level elements.
6.  Assigns the itemref attribute.
7.  Does an oTemplate.after to append the content of the template adjacently.

Here's a fully working example to hopefully make it clearer how we are "virtualizing" custom elements so that they can act as table rows:

```html
<script>
    customElements.define('table-row', class extends HTMLElement {
        static config = {
            mainTemplate: String.raw `
            <tr>
                <th scope=row><slot name=self></slot><slot name=person></slot></th>
                <td><slot name=interest></slot></td>
                <td><slot name=age></slot></td>
            </tr>
            `
        };
    });
</script>
<table>
    <caption>
        Front-end web developer course 2021
    </caption>
    <thead>
        <tr>
        <th scope="col">Person</th>
        <th scope="col">Most interest in</th>
        <th scope="col">Age</th>
        </tr>
    </thead>
    <tbody>
        <template itemscope=table-row 🫚>
            <span slot=person>Chris</span>
            <span slot=interest>HTML tables</span>
            <span slot=age>22</span>
        </template>
        <template itemscope=table-row 🫚>
            <span slot=person>Dennis</span>
            <span slot=interest>Web accessibility</span>
            <span slot=age>45</span>
        </template>
        <template itemscope=table-row  🫚>
            <span slot=person>Sarah</span>
            <span slot=interest>JavaScript frameworks</span>
            <span slot=age>29</span>
        </template>
        <template itemscope=table-row 🫚>
            <span slot=person>Karen</span>
            <span slot=interest>Web performance</span>
            <span slot=age>36</span>
        </template>
    </tbody>
    <tfoot>
        <tr>
        <th scope="row" colspan="2">Average age</th>
        <td>33</td>
        </tr>
    </tfoot>
    </table>
<script type=module>
    import '/🫚.js';
</script>
```

This ends up generating the following HTML:

```html
<table>
    <caption>
        Front-end web developer course 2021
    </caption>
    <thead>
        <tr>
        <th scope="col">Person</th>
        <th scope="col">Most interest in</th>
        <th scope="col">Age</th>
        </tr>
    </thead>
    <tbody>
        <template itemscope="table-row" 🫚="" itemref="be-gingerly-3"></template>
            <tr id="be-gingerly-3">
                <th scope="row"><table-row></table-row><span slot="person">Chris</span></th>
                <td><span slot="interest">HTML tables</span></td>
                <td><span slot="age">22</span></td>
            </tr>
            
        <template itemscope="table-row" 🫚="" itemref="be-gingerly-1"></template>
            <tr id="be-gingerly-1">
                <th scope="row"><table-row></table-row><span slot="person">Dennis</span></th>
                <td><span slot="interest">Web accessibility</span></td>
                <td><span slot="age">45</span></td>
            </tr>
            
        <template itemscope="table-row" 🫚="" itemref="be-gingerly-2"></template>
            <tr id="be-gingerly-2">
                <th scope="row"><table-row></table-row><span slot="person">Sarah</span></th>
                <td><span slot="interest">JavaScript frameworks</span></td>
                <td><span slot="age">29</span></td>
            </tr>
            
        <template itemscope="table-row" 🫚="" itemref="be-gingerly-0"></template>
            <tr id="be-gingerly-0">
                <th scope="row"><table-row></table-row><span slot="person">Karen</span></th>
                <td><span slot="interest">Web performance</span></td>
                <td><span slot="age">36</span></td>
            </tr>
            
    </tbody>
    <tfoot>
        <tr>
        <th scope="row" colspan="2">Average age</th>
        <td>33</td>
        </tr>
    </tfoot>
</table>
```

## Viewing Your Element Locally

Any web server that can serve static files will do, but...

1.  Install git.
2.  Fork/clone this repo.
3.  Install node.js
4.  Open command window to folder where you cloned this repo.
5.  > npm install
6.  > npm run serve
7.  Open http://localhost:3030/demo/ in a modern browser.

## Running Tests

```
> npm run test
```

## Using from ESM Module:

```JavaScript
import 'be-gingerly/be-gingerly.js';
```

## Using from CDN:

```html
<script type=module crossorigin=anonymous>
    import 'https://esm.run/be-gingerly';
</script>
```

