const skinFilesInput = document.getElementById('skinFiles');
const createArchiveButton = document.getElementById('createArchiveButton');
const generateSkinPackButton = document.getElementById('generateSkinPackButton');
const loadingElement = document.getElementById('loading');

// Check if userId exists in localStorage, otherwise generate a new one
let userId = localStorage.getItem('userId');
if (!userId) {
  userId = uuid.v4(); // Generate a random, unique UUID for each user
  localStorage.setItem('userId', userId);
}

// Function to generate the skin pack
generateSkinPackButton.addEventListener('click', async () => {
    console.log('Generating Skin Pack...');
    const formData = new FormData();
    Array.from(skinFilesInput.files).forEach(file => formData.append('skinFiles', file));

    try {
        loadingElement.style.display = 'block'; // Show loading animation

        await fetch(`https://osh01.oshosting.co.uk:4000/upload_skins/${userId}`, {
            method: 'POST',
            body: formData,
        });

        const archiveResponse = await fetch(`https://osh01.oshosting.co.uk:4000/create_skin_pack/${userId}`);
        const blob = await archiveResponse.blob();
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'ReplayCraft_RP.mcpack');
        document.body.appendChild(link);
        link.click();
        link.remove();

        await fetch(`https://osh01.oshosting.co.uk:4000/cleanup/${userId}`);
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        loadingElement.style.display = 'none'; // Hide loading animation
    }
});
