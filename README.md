# be-gingerly (🫚)

## J'accuse

Frameworks are great.  

Great at locking you in, that is.

How are they so effective at doing that?  I'll tell you how.

Okay, it's a theory anyway.

Sometimes when we are generating a loop of HTML on the server or on the client, we need a convenient place to pass the view model responsible for 
generating the data that gets interspersed into the HTML section of the loop.




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
