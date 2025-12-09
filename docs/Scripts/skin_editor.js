// Inputs
const skinFilesInput = document.getElementById('skinFiles');
const capeFilesInput = document.getElementById('capeFiles');

const createArchiveButton = document.getElementById('createArchiveButton');
const generateSkinPackButton = document.getElementById('generateSkinPackButton');
const loadingElement = document.getElementById('loading');

// --- USER ID MANAGEMENT ---
let userId = localStorage.getItem('userId');
if (!userId) {
    userId = uuid.v4();
    localStorage.setItem('userId', userId);
}

// --- GENERATE SKIN + CAPE PACK ---
generateSkinPackButton.addEventListener('click', async () => {
    console.log("Generating Skin & Cape Pack...");

    // -------------------------
    // Upload SKINS
    // -------------------------
    const skinFormData = new FormData();
    Array.from(skinFilesInput.files).forEach(file => skinFormData.append('skinFiles', file));

    // -------------------------
    // Upload CAPES
    // -------------------------
    const capeFormData = new FormData();
    Array.from(capeFilesInput.files).forEach(file => capeFormData.append('capeFiles', file));

    try {
        loadingElement.style.display = 'block';

        // Upload skins
        if (skinFilesInput.files.length > 0) {
            await fetch(`https://osh01.oshosting.co.uk:4000/upload_skins/${userId}`, {
                method: 'POST',
                body: skinFormData,
            });
        }

        // Upload capes
        if (capeFilesInput.files.length > 0) {
            await fetch(`https://osh01.oshosting.co.uk:4000/upload_capes/${userId}`, {
                method: 'POST',
                body: capeFormData,
            });
        }

        // Create combined pack
        const archiveResponse = await fetch(`https://osh01.oshosting.co.uk:4000/create_skin_pack/${userId}`);
        const blob = await archiveResponse.blob();

        // Download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'ReplayCraft_RP.mcpack');
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Cleanup
        await fetch(`https://osh01.oshosting.co.uk:4000/cleanup/${userId}`);

    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        loadingElement.style.display = 'none';
    }
});
