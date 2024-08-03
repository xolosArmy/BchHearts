const backendURL = bch-hearts-k5wq722xi-xolosarmy-networks-projects.vercel.app; // Update with your backend server URL

// Function to upload a photo
function uploadPhoto(file) {
    const formData = new FormData();
    formData.append('photo', file);

    fetch(`${backendURL}/upload`, {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log('Photo uploaded successfully:', data);
        // Handle the uploaded photo URL (e.g., display it on the page)
    })
    .catch(error => {
        console.error('Error uploading photo:', error);
    });
}

// Function to send BCH
function sendBCH(address, amount) {
    fetch(`${backendURL}/sendBCH`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address, amount }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('BCH sent successfully:', data);
        // Handle the transaction response (e.g., display a success message)
    })
    .catch(error => {
        console.error('Error sending BCH:', error);
    });
}

// Example function to handle file input change event
function handleFileInputChange(event) {
    const file = event.target.files[0];
    if (file) {
        uploadPhoto(file);
    }
}

// Example function to handle send BCH button click event
function handleSendBCHClick() {
    const address = document.getElementById('bchAddress').value;
    const amount = parseFloat(document.getElementById('bchAmount').value);
    if (address && amount > 0) {
        sendBCH(address, amount);
    } else {
        alert('Please enter a valid BCH address and amount.');
    }
}

// Add event listeners (assuming you have file input and button elements with the specified IDs)
document.getElementById('fileInput').addEventListener('change', handleFileInputChange);
document.getElementById('sendBCHButton').addEventListener('click', handleSendBCHClick);
