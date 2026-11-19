
/* 
   API CONFIGURATION
 */

// gonna replace this with permitted endpoint
// n approved API key for implementation.

const API_KEY = "YOUR_APPROVED_API_KEY";

const API_BASE_URL =
    "YOUR_API_ENDPOINT";


/*
    DISPLAY API CHARACTERS
*/

function displayCharacters(characters) {

    const searchResults =
        document.getElementById("search-results");

    searchResults.innerHTML = "";

    characters.forEach(character => {

        // CREATE CARD

        const card =
            document.createElement("article");

        card.className = "character-card";


        // CREATE IMAGE

        const image =
            document.createElement("img");

        image.src =
            character.image?.medium_url || "";

        image.alt =
            `Artwork of ${character.name}`;

        image.onerror = function() {

            this.style.display = "none";

        };


        // CREATE NAME

        const title =
            document.createElement("h3");

        title.textContent =
            character.name || "UNKNOWN CHARACTER";


        // CREATE DESCRIPTION

        const description =
            document.createElement("p");

        description.textContent =
            character.description
                ? character.description
                : "No description available.";


        // CREATE STATUS

        const status =
            document.createElement("span");

        status.className = "case-status";

        status.textContent =
            "CASE FILE IN PROGRESS";


        // ADD ELEMENTS TO CARD

        card.append(
            image,
            title,
            description,
            status
        );


        // ADD CARD TO SEARCH RESULTS

        searchResults.appendChild(card);


        // GSAP CARD ANIMATION

        if (typeof gsap !== "undefined") {

            gsap.from(card, {

                opacity: 0,

                y: 25,

                duration: 0.5,

                ease: "power2.out"

            });

        }

    });

}


/* 
   DISPLAY CHARACTERS
 */

function displayCharacters(characters) {

    const searchResults =
        document.getElementById("search-results");

    searchResults.innerHTML = "";

    characters.forEach(character => {

        const card =
            document.createElement("article");

        card.className = "character-card";

        card.innerHTML = `
            <h3>${character.name}</h3>

            <p>
                ${character.description || "No description available."}
            </p>
        `;

        searchResults.appendChild(card);

    });

}
