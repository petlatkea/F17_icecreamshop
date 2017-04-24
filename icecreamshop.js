window.addEventListener("load", doneLoading);

var icecreams;

// the object used for the final resulting product
var result = {
    toppings: [],
    scoops: [],
    cone: null,
    totalPrice: 0
}



function doneLoading() {
    // load JSON-data
    loadJSON("icecream.json", getJSONData);
}



function getJSONData(data) {
    console.log("Loaded JSON:");
    console.table(data);

    icecreams = data;

    // build icecream-grid
    icecreams.forEach( createIceCream );

    // start animations
    window.requestAnimationFrame( runAnimations );
}



function createIceCream( data ) {
    // clone template
    var clone = document.querySelector("#icecream_template").content.cloneNode(true);

    // fill with data
    clone.querySelector(".data_name").textContent = data.name;
    clone.querySelector(".data_price").textContent = data.price;
    clone.querySelector(".data_image").src = "images/icecream/" + data.image;
    clone.querySelector(".data_image").alt = data.name;


    clone.querySelector("div.icecream").dataset.id = data.id;
    clone.querySelector("div.icecream").dataset.type = data.type;


    clone.querySelector("div.icecream").addEventListener("click", selectIceCream);

    // insert into content
    var content = document.querySelector("#icecreams .content").appendChild( clone );
}



function selectIceCream( event ) {
    var element = event.currentTarget;

    var id = element.dataset.id;

    // create a clone of just the image
    var clone = element.querySelector(".data_image").cloneNode(true);
    animate.element = element.querySelector(".data_image").cloneNode(true);

    var container = document.querySelector("#result .image");

    // add the clone to the result
    container.appendChild(clone);

    // find position to add the clone at
    clone.style.top = container.clientHeight / 2 - clone.clientHeight/3 * result.scoops.length + "px";
    clone.style.left = clone.clientWidth/4 + clone.clientWidth/2 * (result.scoops.length % 2) + "px";

    // find absolute position
    var endposition = clone.getBoundingClientRect();

    // make the clone invisible
    clone.style.display = "none";

    animate.result = clone;

    // now add the animated element
    document.querySelector("#animationlayer").appendChild( animate.element );



    // create animated object
    animate.element.classList.add("animationobject");

    animate.id = id;

    animate.startx = element.offsetLeft + 7;
    animate.starty = element.offsetTop;

    animate.curx = animate.startx;
    animate.cury = animate.starty;

    animate.endx = endposition.left;
    animate.endy = endposition.top;

    animate.dist = Math.sqrt( (animate.endx - animate.startx)*(animate.endx - animate.startx) + (animate.endy - animate.starty)*(animate.endy - animate.starty));

    animate.cur = 0;

    animate.speed = 300;
    animate.scale = Math.PI / animate.dist;

    animate.speedx = (animate.endx - animate.startx) / animate.dist;
    animate.speedy = (animate.endy - animate.starty) / animate.dist;

    animate.active = true;
}



function addScoop( id, animate ) {
    // find icecream
    var icecream = icecreams.find( ice => ice.id == id );

    animate.result.dataset.index = result.scoops.length;

    result.scoops.push( icecream );

    // show the resulting image
    animate.result.style.display = "block";

    // make it possible to remove the result
    animate.result.addEventListener("click", removeScoop);

    // display new info
    var infoclone = document.querySelector("#result_icecream_template").content.cloneNode(true);
    infoclone.querySelector(".data_name").textContent = icecream.name;
    document.querySelector("#result ul.icecreams").appendChild(infoclone);

    // calculate total
    result.totalPrice = result.scoops.reduce( (acc, ics)=> acc+= ics.price, 0 );

    // and display the price
    document.querySelector("#result .totalprice .price").textContent = result.totalPrice;
}


function removeScoop( event ) {
    // TODO: Fix - doesn't actually work ...
    var element = event.target;
    var index = parseInt(element.dataset.index);
    var icecream = result.scoops[ index ];

    console.log("index: " + index);

    // remove icecream from result.scoops
    result.scoops.splice(index,1);

    // remove li from ul.icecreams
    var li = document.querySelectorAll("#result ul.icecreams li")[index];
    li.parentNode.removeChild(li);

    // TODO: Create an animation clone

    // remove the ice-cream itself from the visual icecream
    element.parentNode.removeChild(element);

    // recalculate the price
    result.totalPrice = result.scoops.reduce( (acc, ics)=> acc+= ics.price, 0 );

    // and display the price
    document.querySelector("#result .totalprice .price").textContent = result.totalPrice;
}


// an object used for animating an icecream scoop
var animate = {
    active: false,
    element: null,
    startx: 0,
    starty: 0,
    curx: 0,
    cury: 0,
    endx: 0,
    endy: 0
}


var lasttime;

function runAnimations() {
    window.requestAnimationFrame( runAnimations );

    // calculate deltaTime
    var now = Date.now();
    var deltaTime = (now - (lasttime || now))/1000;
    lasttime = now;

    // check if there is an existing animation
    if( animate.active ) {

        animate.cur += animate.speed * deltaTime;

        // cur is where on the line
        animate.curx = animate.cur * animate.speedx;
        // calculate x and y from the line
        animate.cury = animate.cur * animate.speedy;

        var modifyY = Math.sin( animate.cur * animate.scale )*Math.abs(160);
        animate.cury -= modifyY;

        animate.element.style.left = animate.startx + animate.curx + "px";
        animate.element.style.top = animate.starty + animate.cury + "px";

        if( animate.cur >= animate.dist ) {
            animate.active = false;

            // when animation is done - add the ice-cream to the list
            addScoop( animate.id, animate );

            // and remove the animation-element
            animate.element.parentNode.removeChild( animate.element );

        }
    }
}


function loadJSON(url, func) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var data = JSON.parse(request.responseText);

            func(data);

        } else {
            // We reached our target server, but it returned an error
            console.error("Couldn't fetch JSON")
        }
    };

    request.onerror = function () {
        // There was a connection error of some sort
    };

    request.send();
}
