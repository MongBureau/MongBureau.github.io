document.querySelectorAll(".post").forEach(post => {
    const recordId = 'recnbYjhMTeR18RB0'; // Your Airtable record ID
    const ratings = post.querySelectorAll(".post-rating");
    const likeRating = ratings[0];

    ratings.forEach(rating => {
        const button = rating.querySelector(".post-rating-button");
        const count = rating.querySelector(".post-rating-count");

        button.addEventListener("click", async () => {
            if (rating.classList.contains("post-rating-selected")) {
                return; // Already selected, no action needed
            }

            // Increment the clicked rating's count
            count.textContent = Number(count.textContent) + 1;

            // Deselect any previously selected rating and decrement its count
            ratings.forEach(rating => {
                if (rating.classList.contains("post-rating-selected")) {
                    const count = rating.querySelector(".post-rating-count");
                    count.textContent = Math.max(0, Number(count.textContent) - 1);
                    rating.classList.remove("post-rating-selected");
                }
            });

            // Mark the new rating as selected
            rating.classList.add("post-rating-selected");

            const likeOrDislike = likeRating === rating ? "like" : "dislike";

            // Airtable API configuration
            const apiKey = 'patF168MAz3MesHoR.516feaa589f87ba8582af184a19fe1f7899148caf48f2d0c7fa8ead6173093d5'; // Your Airtable personal access token
            const baseId = 'appB5rcjMWKBR3VEx'; // Your Airtable base ID
            const tableId = 'tblpW7s9SsqKPtgtE'; // Your Airtable table ID
            const airtableEndpoint = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`; // Construct Airtable endpoint

            try {
                // Fetch the current like/dislike count for the post
                const response = await fetch(airtableEndpoint, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    }
                });
                const record = await response.json();

                const currentLikes = record.fields.Likes || 0;
                const currentDislikes = record.fields.Dislikes || 0;

                // Update Airtable based on the interaction
                const updatedFields = {
                    Likes: likeOrDislike === "like" ? currentLikes + 1 : currentLikes,
                    Dislikes: likeOrDislike === "dislike" ? currentDislikes + 1 : currentDislikes
                };

                await fetch(airtableEndpoint, {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ fields: updatedFields })
                });

            } catch (error) {
                console.error("Error updating like/dislike count:", error);
            }
        });
    });
});