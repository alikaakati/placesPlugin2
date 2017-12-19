import {filter, find} from 'lodash';
import Handlebars from "./lib/handlebars";

window.filterControl = {
    originalPlaces: null,
    updatedPlaces: null,
    openFilter: () => {
        window.filterControl.originalPlaces = app.state.filteredPlaces;

        let sideNav = document.getElementById("sideNav");
        let categoriesDiv = sideNav.querySelector('#categories');

        categoriesDiv.innerHTML = '';

        if(app.state.categories){
            let context = {
                categories: app.state.categories
            };

            fetch('./templates/categories.hbs')
                .then(response => {
                    return response.text();
                })
                .then(response => {
                    // Compile the template
                    let theTemplate = Handlebars.compile(response);

                    // Pass our data to the template
                    let theCompiledHtml = theTemplate(context);

                    // Add the compiled html to the page
                    document.getElementById('categories').innerHTML = theCompiledHtml;
                });
        }

        sideNav.style.height = "100%";
    },
    filterCategory: (categoryName) => {
        let categoryIndex = app.state.categories.findIndex(category => category.name === categoryName);
        //Switch the category's state
        app.state.categories[categoryIndex].isActive = (!app.state.categories[categoryIndex].isActive);

        let activeCategories = app.state.categories.filter(category => category.isActive).map(c => c.name);

        app.state.filteredPlaces = app.state.places.filter(place => {
            //If a location has no categories, we always show it
            if(typeof place.categories === 'undefined' || place.categories.length === 0){
                return true;
            }

            //Does the place include any of the active categories
            let isMatch = place.categories.some(placeCategory => {
                return activeCategories.includes(placeCategory);
            });

            return isMatch;
        });

        filterControl.updatedPlaces = app.state.filteredPlaces;
    },
    closeNav: () => {
        if(filterControl.originalPlaces != filterControl.updatedPlaces){
            let originalPlaces = filterControl.originalPlaces,
                updatedPlaces = filterControl.updatedPlaces;

            let placesToHide = filter(originalPlaces, (preFilteredPlace) => { return !find(updatedPlaces, preFilteredPlace)});
            let placesToShow = filter(updatedPlaces, (postFilteredPlace) => { return !find(originalPlaces, postFilteredPlace)});

            //Update view to reflect changes
            const wasMapInitiated = (document.getElementById("mapView").innerHTML != '');

            if(wasMapInitiated){
                window.mapView.filter(placesToHide, placesToShow);
            }
            else{
                window.app.state.pendingMapFilter = {placesToHide, placesToShow};
            }

            window.listView.filter(placesToHide, placesToShow);
        }

        document.getElementById("sideNav").style.height = "0";
    },
    changeView: () => {
        app.state.mode = (app.state.mode == app.settings.viewStates.list) ? app.settings.viewStates.map : app.settings.viewStates.list;

        let switchViewButton = document.getElementsByClassName("changeView");
        Array.prototype.map.call(switchViewButton, (image)=> {
            image.src = (image.src.includes('map')) ? image.src.replace('map', 'list') : image.src.replace('list', 'map');
        });

        router.navigate(`/${app.state.mode}`);
    },
    createControl: (controlDiv, buttons) => {
        let container = document.createElement('div');
        container.className = 'buttonContainer';

        controlDiv.appendChild(container);

        buttons.forEach((button) =>{
            let controlButton = document.createElement('div');
            let imageName = (button.name) ? button.name : app.state.mode;
            let changeViewClass = (imageName === 'changeView') ? 'class="changeView"' : '';

            if(imageName === 'changeView'){
                imageName = (app.state.mode === app.settings.viewStates.list) ? app.settings.viewStates.map : app.settings.viewStates.list;
            }

            controlButton.style.display = 'inline-block';
            controlButton.style.padding = button.padding;
            controlButton.innerHTML = `<img ${changeViewClass} src="./images/${imageName}.svg"></img>`;
            if(button.action)
                controlButton.onclick = button.action;
            container.appendChild(controlButton);
        });

        return container;
    }
};

window.CenterControl = function(controlDiv) {
    filterControl.createControl(controlDiv, [
        { name:'center', action: mapView.centerMap, padding: '10px' }
    ]);
}

window.FilterControl = function (controlDiv){
    filterControl.createControl(controlDiv, [
        { name:'changeView', action: filterControl.changeView, padding: '14px 16px 8px 8px' },
        { name:'filter', action: filterControl.openFilter, padding: '14px 8px 8px 16px' }
    ]);
}
