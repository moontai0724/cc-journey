var map, vueImpl, markerCluster;
const AREAS = ["taipei", "keelung", "taoyuan", "hsinchu", "miaoli", "taichung", "nantou", "changhua", "yunlin", "chiayi", "tainan", "kaohsiung", "pingtung", "yilan", "hualien", "taitung", "penghu", "lienchiang"];

// jQuery(document).ready(init);

async function init() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 23.8, lng: 121 },
        zoom: 8
    });

    vueImpl = new Vue({
        el: "#vue-content",
        data: {
            display: {
                left_panel: false
            },
            display_modal: false,
            modal: {
                point: {
                    id: null,
                    name: null,
                    latitude: null,
                    longitude: null,
                    isGoodForWorking: false
                }
            },
            search_input: "",
            mapPoints: []
        },
        watch: {
            display_modal: function (value) {
                if (value)
                    jQuery(".modal").show();
                else
                    jQuery(".modal").hide();
            }
        },
        methods: {
            initializeData: function () {
                return new Promise((resolve, reject) => {
                    Promise.all(AREAS.map(area => {
                        return new Promise((resolve, reject) => {
                            // window.open(`https://cafenomad.tw/json/cafes/${area}`, "_blank");
                            fetch(`data/${area}.json`).then(response => {
                                return response.json();
                            }).then(response => {
                                response.cafes.forEach(point => vueImpl.mapPoints.push(point));
                                resolve();
                            });
                        });
                    })).then(this.renderMarkers);
                });
            },
            renderMarkers: function () {
                vueImpl.mapPoints = vueImpl.mapPoints.map(function (point, index) {
                    point.display = true;
                    point.marker = new google.maps.Marker({
                        position: new google.maps.LatLng(point.latitude, point.longitude),
                        map: map,
                        title: point.name
                    });
                    point.marker.addListener('click', event => vueImpl.openPoint(index));
                    return point;
                });

                markerCluster = new MarkerClusterer(map, vueImpl.mapPoints.map(point => point.marker), {
                    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
                });
            },
            start_search: function () {
                console.log("Search", this.search_input);
                markerCluster.clearMarkers();
                vueImpl.mapPoints.forEach(point => {
                    if (this.search_input === "" || point.name.includes(this.search_input) === true) {
                        point.marker.setMap(map);
                        markerCluster.addMarker(point.marker);
                        point.display = true;
                    } else {
                        point.marker.setMap(null);
                        point.display = false;
                    }
                })
            },
            toggle_menu: function () {
                console.log("Menu toggled.");
                this.display.left_panel = !this.display.left_panel;
            },
            panTo: function (index) {
                let point = vueImpl.mapPoints[index];
                map.panTo(new google.maps.LatLng(point.latitude, point.longitude));
                map.setZoom(18);
            },
            openPoint: function (index) {
                let point = vueImpl.mapPoints[index];
                this.modal.point = point;
                this.display_modal = true;
            },
            openSource: function (index) {
                let point = vueImpl.mapPoints[index];
                console.log("opne point: ", index, point);
                window.open(`https://cafenomad.tw/shop/${point.id}`, "_blank");
            },
            navigatePoint: function (index) {
                let point = vueImpl.mapPoints[index];
                console.log("navigate point: ", index, point);
                window.open(`https://www.google.com/maps/search/?api=1&query=${point.name}+${point.latitude},${point.longitude}`, "_blank");
            }
        },
        mounted: function () {
            this.initializeData();
        }
    });
}

function getRandomNumber(min, max) {
    let number = Math.random() * (max - min) + min;
    // console.log(number);
    return number;
};