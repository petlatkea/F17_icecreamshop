window.addEventListener("load", doneLoading);

var icecreams;

var result;

// the object used for the final resulting product
class Result {
    constructor() {
        this.toppings = [];
        this.scoops = [];
        this.cone = null;

    }

    addIcecream( icecream ) {
        this.scoops.push( icecream );

        // display new info
        var infoclone = document.querySelector("#result_icecream_template").content.cloneNode(true);
        infoclone.querySelector(".data_name").textContent = icecream.name;
        document.querySelector("#result ul.icecreams").appendChild(infoclone);

        // calculate total


        // and display the price
        document.querySelector("#result .totalprice .price").textContent = this.totalPrice;
    }

    removeIcecream( index ) {
        this.scoops.splice(index,1);
    }


    get totalPrice() {
        console.log("Doing total price calculation");
        return this.scoops.reduce( (acc, ics)=> acc+= ics.price, 0 );
    }

}

// an object used for animating an icecream scoop
class Animate {

    constructor( icecream, startelement, endelement ) {
        this.icecream = icecream;

        this.element = startelement.querySelector(".data_image").cloneNode(true);
        this.endelement = endelement;

        // now add the animated element
        document.querySelector("#animationlayer").appendChild( this.element );
        this.element.classList.add("animationobject");

        // calculate start-positions
        this.startx = startelement.offsetLeft + 7;
        this.starty = startelement.offsetTop;

        // calculate end-positions
        var endposition = endelement.getBoundingClientRect();

        this.endx = endposition.left;
        this.endy = endposition.top;

        // calculate distance, scale and speed
        this.dist = Math.sqrt( (this.endx - this.startx)*(this.endx - this.startx) + (this.endy - this.starty)*(this.endy - this.starty));

        this.scale = Math.PI / this.dist;

        this.speedx = (this.endx - this.startx) / this.dist;
        this.speedy = (this.endy - this.starty) / this.dist;

        // make the endelement invisible
        this.endelement.style.display = "none";

        // initialize current
        this.cur = 0;

        this.curx = this.startx;
        this.cury = this.starty;

        this.speed = 300;
    }

    move( deltaTime ) {
        // check if there is an existing animation
        if( this.active ) {

            this.cur += this.speed * deltaTime;

            // cur is where on the line
            this.curx = this.cur * this.speedx;
            // calculate x and y from the line
            this.cury = this.cur * this.speedy;

            var modifyY = Math.sin( this.cur * this.scale )*Math.abs(160);
            this.cury -= modifyY;

            this.element.style.left = this.startx + this.curx + "px";
            this.element.style.top = this.starty + this.cury + "px";

            if( this.cur >= this.dist ) {
                this.active = false;

                // make the endelement visible
                this.endelement.style.display = "block";

                if( this.onComplete ) {
                    this.onComplete();
                }

                // and remove the animation-element
                this.element.parentNode.removeChild( this.element );
            }
        }
    }


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

    // create resulting product
    result = new Result();

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
    var icecream = icecreams.find( ice => ice.id == id );

    // create a clone of just the image
    var clone = element.querySelector(".data_image").cloneNode(true);

    var container = document.querySelector("#result .image");

    // add the clone to the result
    container.appendChild(clone);

    // find position to add the clone at
    clone.style.top = container.clientHeight / 2 - clone.clientHeight/3 * result.scoops.length + "px";
    clone.style.left = clone.clientWidth/4 + clone.clientWidth/2 * (result.scoops.length % 2) + "px";

    // create animate-object
    var animate = new Animate( icecream, element, clone );
    animate.active = true;
    animate.onComplete = function() {
        result.addIcecream( icecream );
    }

    animations.push( animate );
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




var animations = [];

var lasttime;

function runAnimations() {
    window.requestAnimationFrame( runAnimations );

    // calculate deltaTime
    var now = Date.now();
    var deltaTime = (now - (lasttime || now))/1000;
    lasttime = now;

    animations.forEach( animate => animate.move(deltaTime) );

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
