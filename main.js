document.querySelectorAll(".post").forEach(post => {
    const recordId = post.dataset.recordId; // Get the Airtable record ID
    const ratings = post.querySelectorAll(".post-rating");
    const likeRating = ratings[0];

    ratings.forEach(rating => {
        const button = rating.querySelector(".post-rating-button");
        const count = rating.querySelector(".post-rating-count");

        button.addEventListener("click", async () => {
            if (rating.classList.contains("post-rating-selected")) {
                return; // Already selected, do nothing
            }

            // Increment count for the selected rating
            count.textContent = Number(count.textContent) + 1;

            // Remove selection from previously selected rating
            ratings.forEach(rating => {
                if (rating.classList.contains("post-rating-selected")) {
                    const count = rating.querySelector(".post-rating-count");

                    // Decrement the previous rating count
                    count.textContent = Math.max(0, Number(count.textContent) - 1);
                    rating.classList.remove("post-rating-selected");
                }
            });

            // Mark the new rating as selected
            rating.classList.add("post-rating-selected");

            const likeOrDislike = likeRating === rating ? "like" : "dislike";

            try {
                // Fetch the current like/dislike count from Airtable
                const response = await fetch(`https://api.airtable.com/v0/appB5rcjMWKBR3VEx/tblpW7s9SsqKPtgtE/${recordId}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer patF168MAz3MesHoR.516feaa589f87ba8582af184a19fe1f7899148caf48f2d0c7fa8ead6173093d5`,
                        "Content-Type": "application/json"
                    }
                });
                const record = await response.json();

                // Get the current like/dislike count from the Airtable record
                const currentLikes = record.fields.Likes || 0;
                const currentDislikes = record.fields.Dislikes || 0;

                // Update Airtable based on user interaction
                const updatedFields = {
                    Likes: likeOrDislike === "like" ? currentLikes + 1 : currentLikes,
                    Dislikes: likeOrDislike === "dislike" ? currentDislikes + 1 : currentDislikes
                };

                await fetch(`https://api.airtable.com/v0/appB5rcjMWKBR3VEx/tblpW7s9SsqKPtgtE/${recordId}`, {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer patF168MAz3MesHoR.516feaa589f87ba8582af184a19fe1f7899148caf48f2d0c7fa8ead6173093d5`,
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