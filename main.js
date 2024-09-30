// Replace these with your actual values
const API_KEY = 'AIzaSyDMVb1SeIfvj-50wyPEH9ZpW0ZvNpKxGBE';
const SPREADSHEET_ID = '1T6ZPoh_KJbnlRUj74WT_Kzpa2ZXymM8XUBO6qWTmhoY';
const RANGE = 'Sheet1!A:C'; // Assuming columns A, B, C for post ID, likes, dislikes

let gapi = window.gapi;
const postId = document.getElementById('voting-widget').dataset.postId;

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    }).then(() => {
        loadVoteCounts();
    });
}

function loadVoteCounts() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
    }).then((response) => {
        const rows = response.result.values || [];
        const postRow = rows.find(row => row[0] === postId);
        if (postRow) {
            updateUI(parseInt(postRow[1]), parseInt(postRow[2]));
        } else {
            createNewRow();
        }
    });
}

function createNewRow() {
    gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: [[postId, 0, 0]]
        }
    }).then(() => {
        updateUI(0, 0);
    });
}

function vote(type) {
    const currentVote = localStorage.getItem(`vote_${postId}`);
    let newLikes = parseInt(document.getElementById('like-count').textContent);
    let newDislikes = parseInt(document.getElementById('dislike-count').textContent);

    if (currentVote === type) {
        // Undo vote
        if (type === 'like') newLikes--;
        else newDislikes--;
        localStorage.removeItem(`vote_${postId}`);
    } else {
        // Change vote
        if (currentVote === 'like') newLikes--;
        if (currentVote === 'dislike') newDislikes--;
        if (type === 'like') newLikes++;
        else newDislikes++;
        localStorage.setItem(`vote_${postId}`, type);
    }

    updateUI(newLikes, newDislikes);

    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${RANGE}`,
        valueInputOption: 'RAW',
        resource: {
            values: [[postId, newLikes, newDislikes]]
        }
    }).then(() => {
        console.log('Vote recorded successfully');
    });
}

function updateUI(likes, dislikes) {
    document.getElementById('like-count').textContent = likes;
    document.getElementById('dislike-count').textContent = dislikes;

    const currentVote = localStorage.getItem(`vote_${postId}`);
    document.getElementById('like-button').classList.toggle('active', currentVote === 'like');
    document.getElementById('dislike-button').classList.toggle('active', currentVote === 'dislike');
}

document.getElementById('like-button').addEventListener('click', () => vote('like'));
document.getElementById('dislike-button').addEventListener('click', () => vote('dislike'));

gapi.load('client', initClient);