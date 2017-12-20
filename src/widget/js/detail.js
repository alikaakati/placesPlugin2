import { components } from 'buildfire';
import Handlebars from './lib/handlebars';

window.detailView = {
    init: (place) => {
        //Add filter control
        let view = document.getElementById('detailView');
        let screenWidth = window.innerWidth;
        const title = place.title;

        let context = {
            width: screenWidth,
            image: place.image,
            title: title,
            description: place.description,
            distance: place.distance,
            address: place.address.name
        };

        fetch('./templates/detail.hbs')
            .then(response => {
                return response.text();
            })
            .then(response => {
                // Compile the template
                let theTemplate = Handlebars.compile(response);

                // Pass our data to the template
                let theCompiledHtml = theTemplate(context);

                // Add the compiled html to the page
                view.innerHTML = theCompiledHtml;

                //TODO: Move to common location
                let mapTypeId = window.google.maps.MapTypeId.ROADMAP,
                    zoomTo = 14, //city
                    centerOn = {lat: place.address.lat, lng: place.address.lng};

                let options = {
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    zoom: zoomTo,
                    center: centerOn,
                    mapTypeId: mapTypeId,
                    disableDefaultUI: true
                };

                /**
                 * Carousel
                 */
                if (place.carousel && place.carousel.length) {
                    let targetNode = document.getElementById('carouselView');
                    // Set carousel's height to a 16:9 aspect ratio
                    targetNode.style.height = `${window.innerWidth / 16 * 9}px`;
                    new components.carousel.view({
                        selector: targetNode,
                        items: place.carousel
                    });
                }

                /**
                 * Google Maps
                 */

                let map = new window.google.maps.Map(document.getElementById('smallMap'), options);

                const iconBaseUrl = 'https://app.buildfire.com/app/media/',
                    icon = {
                        url: iconBaseUrl + 'google_marker_green_icon.png',
                        // This marker is 20 pixels wide by 20 pixels high.
                        scaledSize: new window.google.maps.Size(20, 20),
                        // The origin for this image is (0, 0).
                        origin: new window.google.maps.Point(0, 0),
                        // The anchor for this image is at the center of the circle
                        anchor: new window.google.maps.Point(10, 10)
                    };

                new window.google.maps.Marker({
                    position: place.address,
                    map,
                    icon
                });
        });
    },

};
