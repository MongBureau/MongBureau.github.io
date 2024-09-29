document.querySelectorAll(".post").forEach(post => {
    const recordId = 'recnbYjhMTeR18RB0'; // Your Airtable record ID
    const ratings = post.querySelectorAll(".post-rating");
    const likeRating = ratings[0]; // Assuming the first rating is 'like'

    ratings.forEach(rating => {
        const button = rating.querySelector(".post-rating-button");
        const count = rating.querySelector(".post-rating-count");

        button.addEventListener("click", async () => {
            if (rating.classList.contains("post-rating-selected")) {
                return; // Prevent further clicks if already selected
            }

            // Increment the count for the selected rating
            count.textContent = Number(count.textContent) + 1;

            // Deselect other ratings and update their counts
            ratings.forEach(rating => {
                if (rating.classList.contains("post-rating-selected")) {
                    const otherCount = rating.querySelector(".post-rating-count");
                    otherCount.textContent = Math.max(0, Number(otherCount.textContent) - 1);
                    rating.classList.remove("post-rating-selected");
                }
            });

            // Mark this rating as selected
            rating.classList.add("post-rating-selected");

            const likeOrDislike = likeRating === rating ? "Likes" : "Dislikes"; // Determine if it's a like or dislike

            // Airtable API configuration
            const apiKey = 'patF168MAz3MesHoR.516feaa589f87ba8582af184a19fe1f7899148caf48f2d0c7fa8ead6173093d5'; // Airtable personal access token
            const baseId = 'appB5rcjMWKBR3VEx'; // Your Airtable base ID
            const tableId = 'tblpW7s9SsqKPtgtE'; // Your Airtable table ID
            const airtableEndpoint = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`; // Construct the Airtable endpoint

            try {
                // Fetch the current like/dislike count from Airtable
                const fetchResponse = await fetch(airtableEndpoint, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${apiKey}`
                    }
                });

                const record = await fetchResponse.json();
                const currentLikes = record.fields.Likes || 0;
                const currentDislikes = record.fields.Dislikes || 0;

                // Prepare the data to update either 'Likes' or 'Dislikes' field
                const updateData = {
                    fields: {
                        [likeOrDislike]: likeOrDislike === "Likes" ? currentLikes + 1 : currentDislikes + 1
                    }
                };

                // Update the record in Airtable
                const updateResponse = await fetch(airtableEndpoint, {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updateData)
                });

                if (!updateResponse.ok) {
                    throw new Error(`Error updating record: ${updateResponse.statusText}`);
                }

                const updatedRecord = await updateResponse.json();
                console.log(`Record updated: `, updatedRecord);
            } catch (error) {
                console.error("Error updating like count:", error);
            }
        });
    });
});