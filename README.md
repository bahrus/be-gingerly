# be-gingerly (🫚)

## J'accuse

Frameworks are great.  

Great at locking you in, that is.

How are they so effective at doing that?  I'll tell you how.

Okay, it's a theory anyway.

Sometimes when we are generating a loop of HTML on the server or on the client, we need a convenient place to pass the view model responsible for 
generating the data that gets interspersed into the HTML section of the loop.

One way this can be done is with an extremely light-weight rendering from the looping code (again, either on the server or the client) -- just rendering a single tag of a custom element for each iteration of the loop, and passing in the data for the view model, and let the custom element take care of the rest:

```JavaScript
${myList.map(item => html`
    <my-item .vm=${item}></my-item>
`)}
```

Now our custom element can go in one of two ways:  It can use Shadow DOM or not use Shadow DOM.  If using Shadow DOM, the division of labor between the looping code and the custom element is pretty clear -- the looping code is expected to generate any light children, if applicable.  The custom element generates all the content inside the ShadowRoot, and takes a hands-off approach towards the light children.

Things become much more ambiguous if no ShadowDOM is used.  In my view, if the custom element chooses to generate its own children, that should work fine so long as the "framework" takes a "mind your own business, and don't do unnecessary work" approach to rendering.  The code snippet above, which uses the "framework built into the browser" would certainly do that.  It's unclear to me how uniformly that fundamental tenet is adhered to with modern frameworks.  In the past, during the heyday of VDOM hype, I would see instances where the framework would appear to go through the thought process:  "hey, I didn't generate those child elements, how dare anything give birth to elements I didn't give permission to? I am going to blow that all away" on a re-render.  I can't vouch for what the latest state of the art frameworks do, just be forewarned.


In other words, having established this protocol by necessity, we can then go back to other scenarios where HTML decorum would allow for Shadowless containers, but with the ambiguity of responsibility issue listed above, and use a non visual view model custom element as our general solution, that can then circumvent some of the sticky questions regarding division of responsibility.

## So what does be-scoped do?

It commits a secondary sin, and attaches a property getter, "assignGingerly" to elements that commit the cardinal sin of  adding attribute "itemscope" that has a value pointing to the name of an inner custom element.

Frameworks can then pass objects (not primitives) directly to the element:

```JavaScript
html`
<table>
    <thead><th>Name</th><th>SSN Number</thead>
    <tbody>
${myList.map(item => html`
    <tr itemscope=my-item be-scoped .assignGingerly=${item}>
        <td>
            <my-item></my-item>
            ${item.name}
        </td>
        <td>${item.ssn}</td>
`)}
    </tbody>
</table>
`
```

which will end up doing an Object.assign (gingerly) of the item object to the my-item custom element.

It can also do the same for server generated JSON attributes:

```JavaScript

<table>
    <thead><th>Name</th><th>SSN Number</thead>
    <tbody>
    <tr itemscope=my-item be-scoped assign-gingerly='{"name": "Burt", "ssn": "123-45-6789"}'>
        <td>
            <my-item></my-item>
            Burt
        </td>
        <td>123-45-6789</td>
    </tbody>
</table>

```
