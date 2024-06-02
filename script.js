document.addEventListener("DOMContentLoaded", function() {
    let data = [];

    document.getElementById("search-button").addEventListener("click", function(event) {
        event.preventDefault();
        
        const location = document.getElementById("place-select").value;
        const fileName = `all/rawdata_${location}.csv`;
    
        
        Papa.parse(fileName, {
            encoding: "UTF-8",
            download: true,
            header: true,
            complete: function(results) {
                data = results.data;
                data = filter_Data(data);
                renderHotels(data);
                filterData();
    
                // Display the number of results with specific formatting
                const resultCount = data.length;
                const resultText = `<span class="result-count">(${resultCount} results)</span>`;
                document.getElementById('selected-location').innerHTML = `${location} ${resultText}`;
            },
            error: function(error) {
                console.error("Error parsing CSV:", error);
            }
        });
    });
    
    
    function filter_Data(data) {
        const minPrice = parseFloat(document.querySelector(".min-input").value);
        const maxPrice = parseFloat(document.querySelector(".max-input").value);
        const selectedFacilities = Array.from(document.querySelectorAll('input[name="facilities"]:checked')).map(input => input.value);
   
    
        data = data.filter(hotel => {
            const price = parseFloat(hotel.Price);
            
            // Exclude rows where the price is "Not Found"
            if (isNaN(price)) {
                return false;
            }
        
            // Check if Facilities is defined and not null
            const facilities = hotel.Facilities ? hotel.Facilities.toLowerCase() : '';
            console.log("facilities",facilities)
            // Check if the hotel price is within the price range
            if (price < minPrice || price > maxPrice) {
                return false;
            }
        
           // Check if the hotel facilities include selected facilities
            for (const facility of selectedFacilities) {
                // Convert both facility and facilities to lowercase for case-insensitive comparison
                const lowerCaseFacility = facility.toLowerCase();
                console.log("lowerCaseFacility", lowerCaseFacility);
                
                // Split the facilities string into individual facilities
                const individualFacilities = facilities.split(',');
                
                // Check if any part of the lowercased facilities string includes the lowercased selected facility
                let facilityFound = false;
                for (const hotelFacility of individualFacilities) {
                    if (hotelFacility.toLowerCase().includes(lowerCaseFacility)) {
                        facilityFound = true;
                        break;
                    }
                }
        
                // If the selected facility is not found in any part of the hotel facilities, return false
                if (!facilityFound) {
                    return false;
                }
            }

        
            return true;
        });
        
        console.log(data);
        return data
    }
    

    function renderHotels(data) {
        const container = document.getElementById('hotels-list');
        container.innerHTML = '';

        data.forEach(hotel => {
            if (!hotel || Object.keys(hotel).length === 0 || !hotel['Hotel Name']) {
                return;
            }

            const hotelContainer = document.createElement('div');
            hotelContainer.classList.add('hotel-container');

            const leftColumn = document.createElement('div');
            leftColumn.classList.add('left-column');
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('img-container');
            const img = document.createElement('img');
            img.src = hotel['img'] || 'default-image.jpg';
            img.alt = hotel['Hotel Name'];
            imgContainer.appendChild(img);
            leftColumn.appendChild(imgContainer);

            const middleColumn = document.createElement('div');
            middleColumn.classList.add('middle-column');
            middleColumn.innerHTML = `
                <h3 style="margin-top: 0;">${hotel['Hotel Name']} ${generateStarRating(hotel['Star Rating'])}</h3> 
                <p style="margin: 0;"><i>${hotel['Location']}</i></p>
                <p style="margin-bottom: 0;"><strong>The Property offers:</strong></p>
                <p style="margin: 0;">${parseFacilities(hotel['Facilities'])}</p>
            `;

            const rightColumn = document.createElement('div');
            rightColumn.classList.add('right-column');
            rightColumn.innerHTML = `
                <p style="margin-bottom: 0; margin-left:2px; font-size: 1.01em; margin-top:5px;"><strong>${hotel['Review']}</strong></p>
                <p style="margin-top: 0;margin-left:2px;">(${hotel['Review Number']} reviews)</p>
                <p class="price_section">NT$<span class="price"><strong>${hotel['Price']}</strong></span></p>
            `;

            hotelContainer.appendChild(leftColumn);
            hotelContainer.appendChild(middleColumn);
            hotelContainer.appendChild(rightColumn);

            hotelContainer.addEventListener('click', function() {
                window.open(hotel['hyperlink'], '_blank');
            });

            container.appendChild(hotelContainer);
        });
    }


    // Helper function to create a hotel container
    function createHotelContainer(hotelData) {
        const hotelContainer = document.createElement('div');
        hotelContainer.classList.add('hotel-container');

        const leftColumn = document.createElement('div');
        leftColumn.classList.add('left-column');
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('img-container');
        const img = document.createElement('img');
        img.src = hotelData['img'] || 'default-image.jpg';
        img.alt = hotelData['Hotel Name'];
        imgContainer.appendChild(img);
        leftColumn.appendChild(imgContainer);

        const middleColumn = document.createElement('div');
        middleColumn.classList.add('middle-column');
        middleColumn.innerHTML = `
            <h3 style="margin-top: 0;">${hotelData['Hotel Name']} ${generateStarRating(hotelData['Star Rating'])}</h3> 
            <p style="margin: 0;"><i>${hotelData['Location']}</i></p>
            <p style="margin-bottom: 0;"><strong>The Property offers:</strong></p>
            <p style="margin: 0;">${parseFacilities(hotelData['Facilities'])}</p>
        `;

        const rightColumn = document.createElement('div');
        rightColumn.classList.add('right-column');
        rightColumn.innerHTML = `
            <p style="margin-bottom: 0; margin-left:2px; font-size: 1.1em; margin-top:5px;"><strong>${hotelData['Review']}</strong></p>
            <p style="margin-top: 0;margin-left:2px;">(${hotelData['Review Number']} reviews)</p>
            <p class="price_section">NT$<span class="price"><strong>${hotelData['Price']}</strong></span></p>
        `;

        hotelContainer.appendChild(leftColumn);
        hotelContainer.appendChild(middleColumn);
        hotelContainer.appendChild(rightColumn);

        hotelContainer.addEventListener('click', function() {
            window.open(hotelData['hyperlink'], '_blank');
        });

        return hotelContainer;
    }

    function generateStarRating(rating) {
        try {
            if (!rating || rating.toLowerCase() === 'not available') {
                return '';
            }

            rating = parseFloat(rating);
            if (rating >= 1 && rating <= 5) {
                let stars = '★'.repeat(Math.floor(rating));
                if (rating % 1 !== 0) {
                    stars += '½';
                }
                return `<span style="font-size: 0.6em;">(${stars})</span>`;
            } else {
                return '';
            }
        } catch (error) {
            return '';
        }
    }

    function parseFacilities(facilitiesList) {
        try {
            if (!facilitiesList) {
                return '';
            }
            const facilities = facilitiesList.split(',');
            const facilitiesWithBorder = facilities.map(facility => {
                return `<span class="facility" style="border: 1px solid #ccc; padding: 2px 4px; margin: 2px; display: inline-block;">${facility.trim()}</span>`;
            });
            return facilitiesWithBorder.join(' ');
        } catch (error) {
            return '';
        }
    }

    const rangeInputs = document.querySelectorAll(".slider-container input");
    const priceInputs = document.querySelectorAll(".price-input input");
    const priceGap = 500;

    rangeInputs.forEach(input => {
        input.addEventListener("input", e => {
            let minVal = parseInt(rangeInputs[0].value);
            let maxVal = parseInt(rangeInputs[1].value);
            if ((maxVal - minVal) < priceGap) {
                if (e.target.className === "min-range") {
                    rangeInputs[0].value= maxVal - priceGap;
                } else {
                rangeInputs[1].value = minVal + priceGap;
                }
                } else {
                priceInputs[0].value = minVal;
                priceInputs[1].value = maxVal;
                }
                filterData();
                });
                });
                priceInputs.forEach(input => {
                    input.addEventListener("input", e => {
                        let minPrice = parseInt(priceInputs[0].value);
                        let maxPrice = parseInt(priceInputs[1].value);
                        if ((maxPrice - minPrice >= priceGap) && maxPrice <= 10000) {
                            if (e.target.className === "min-input") {
                                rangeInputs[0].value = minPrice;
                            } else {
                                rangeInputs[1].value = maxPrice;
                            }
                            filterData();
                        }
                    });
                });
                
                function filterData() {
                    const selectedCity = document.getElementById('place-select').value;
                    const minPrice = parseFloat(priceInputs[0].value);
                    const maxPrice = parseFloat(priceInputs[1].value);
                
                    // No need to filter the data, pass the entire data array to createChart
                    createChart(data);
                }
                
                function createChart(filteredData) {
                    const prices = [];
                    const scores = [];
                    const reviews = [];
                    const hotels = [];
                    const hyperlinks = [];
                
                    filteredData.forEach(item => {
                        prices.push(parseFloat(item.Price));
                        scores.push(parseFloat(item.Review));
                        reviews.push(parseInt(item['Review Number']));
                        hotels.push(item['Hotel Name']);
                        hyperlinks.push(item.hyperlink);
                    });
                
                    const trace = {
                        x: prices,
                        y: scores,
                        text: hotels,
                        mode: 'markers',
                        marker: {
                            size: reviews.map(review => Math.sqrt(review)),
                            color: reviews,
                            colorscale: 'Viridis',
                            showscale: true
                        }
                    };
                
                    const chartData = [trace];
                
                    const layout = {
                        title: 'Bubble Chart: Price vs. Review Score (Color-coded by Number of Reviews)',
                        xaxis: {title: 'Price (TWD)'},
                        yaxis: {title: 'Review Score'},
                        showlegend: false
                    };
                
                    Plotly.newPlot('bubble-chart', chartData, layout);
                
                    document.getElementById('bubble-chart').on('plotly_click', function(data){
                        const pointIndex = data.points[0].pointIndex;
                        const hotelData = filteredData[pointIndex];
                        const hotelContainer = createHotelContainer(hotelData); // Create hotel container
                        const hotelsList = document.getElementById('hotels-list');
                        hotelsList.innerHTML = ''; // Clear previous content
                        hotelsList.appendChild(hotelContainer); // Append
                    });
                }
                
});
    // Price slider functionality
    const rangeValue = document.querySelector(".slider-container .price-slider");
    const rangeInputValue = document.querySelectorAll(".range-input input");

    let priceGap = 500;

    const priceInputValue = document.querySelectorAll(".price-input input");
    for (let i = 0; i < priceInputValue.length; i++) {
        priceInputValue[i].addEventListener("input", e => {
            let minp = parseInt(priceInputValue[0].value);
            let maxp = parseInt(priceInputValue[1].value);
            let diff = maxp - minp;

            if (minp < 0) {
                alert("Minimum price cannot be less than 0");
                priceInputValue[0].value = 0;
                minp = 0;
            }

            if (maxp > 10000) {
                alert("Maximum price cannot be greater than 10000");
                priceInputValue[1].value = 10000;
                maxp = 10000;
            }

            if (minp > maxp - priceGap) {
                priceInputValue[0].value = maxp - priceGap;
                minp = maxp - priceGap;

                if (minp < 0) {
                    priceInputValue[0].value = 0;
                    minp = 0;
                }
            }

            if (diff >= priceGap && maxp <= rangeInputValue[1].max) {
                if (e.target.className === "min-input") {
                    rangeInputValue[0].value = minp;
                    let value1 = rangeInputValue[0].max;
                    rangeValue.style.left = `${(minp / value1) * 100}%`;
                } else {
                    rangeInputValue[1].value = maxp;
                    let value2 = rangeInputValue[1].max;
                    rangeValue.style.right = `${100 - (maxp / value2) * 100}%`;
                }
            }
        });
    }

    for (let i = 0; i < rangeInputValue.length; i++) {
        rangeInputValue[i].addEventListener("input", e => {
            let minVal = parseInt(rangeInputValue[0].value);
            let maxVal = parseInt(rangeInputValue[1].value);
            let diff = maxVal - minVal;

            if (diff < priceGap) {
                if (e.target.className === "min-range") {
                    rangeInputValue[0].value = maxVal - priceGap;
                } else {
                    rangeInputValue[1].value = minVal + priceGap;
                }
            } else {
                priceInputValue[0].value = minVal;
                priceInputValue[1].value = maxVal;
                rangeValue.style.left = `${(minVal / rangeInputValue[0].max) * 100}%`;
                rangeValue.style.right = `${100 - (maxVal / rangeInputValue[1].max) * 100}%`;
            }
        });
    }
    
        

