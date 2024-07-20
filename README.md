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



While the example above so far poses no issues, we start to immediately get a sense of unease the moment we need to start performing intimate actions on individual rows / items of the view model.  How do we get access to the view model item associated with the row?  We start inventing ways to handle this, with id's, lots of ugly look ups, etc.  So we could have the fleeting thought "Hey, why don't I create a web component to contain each row, that can encapsulate the view model for each item of the list"? But of course the HTML decorum for tables doesn't allow us to do that.

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
`)}
    </tbody>
</table>
`
```

So then if the libraries we work with have an easy-to-reproduce-in-any-framework "virtual host" getter that includes logic something like this:

```JavaScript
async function getHostish(el: Element){
    const closestItemScope = el.closest('itemscope');
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

It commits a secondary sin, and attempts to shield frameworks from even having to bother supporting a function like we showed above.  Instead, and attaches a property getter/setter, "host" to elements that commit the cardinal sin of  adding attribute "itemscope," that has a value pointing to the name of an inner custom element.  The host points to the custom element instance that the itemscope instances points to

Frameworks can then pass objects directly to the element that passes in the latest property values:

```JavaScript
html`
<table>
    <thead><th>Name</th><th>SSN Number</thead>
    <tbody>
${myList.map(item => html`
    <tr itemscope=my-item 🫚 .host=${item}>
        <td>
            <my-item></my-item>
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
    <tbody>
        <tr itemscope="my-item"  🫚 data-host-init-props='{"name": "Burt", "ssn": "123-45-6789"}'>
            <td>
                <my-item></my-item>
                Burt
            </td>
            <td>123-45-6789</td>
        </tr>
    </tbody>
</table>
```

## Passing in the ownerElement

If *be-gingerly* finds that the custom element has property "ownerElement", it will first pass a weak reference to the adorned element into that property.

## Canonical name

To use the canonical name, reference behivior.js instead of 🫚.js and be more gingerly:


```html
<table>
    <thead><th>Name</th><th>SSN Number</thead>
    <tbody>
        <tr itemscope="my-item"  be-gingerly data-host-init-props='{"name": "Burt", "ssn": "123-45-6789"}'>
            <td>
                <my-item></my-item>
                Burt
            </td>
            <td>123-45-6789</td>
        </tr>
    </tbody>
</table>
```

