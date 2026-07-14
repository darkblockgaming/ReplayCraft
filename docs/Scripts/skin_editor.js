// Inputs
const skinFilesInput = document.getElementById('skinFiles');
const capeFilesInput = document.getElementById('capeFiles');

const generateSkinPackButton = document.getElementById('generateSkinPackButton');
const loadingElement = document.getElementById('loading');

const skinsPreview = document.getElementById('skinsPreview');
const capesPreview = document.getElementById('capesPreview');

// --- FILE STORAGE ---
let skinFilesList = [];
let capeFilesList = [];


// --- USER ID MANAGEMENT ---
let userId = localStorage.getItem('userId');

if (!userId) {
    userId = uuid.v4();
    localStorage.setItem('userId', userId);
}


// --- SKIN FILE PICKER ---
skinFilesInput.addEventListener('change', (e) => {

    Array.from(e.target.files).forEach(file => {

        if (!skinFilesList.some(f => f.name === file.name)) {
            skinFilesList.push(file);
        }

    });

    updatePreview(
        skinsPreview,
        skinFilesList,
        "skin"
    );

    // Allow selecting more files again
    e.target.value = "";
});


// --- CAPE FILE PICKER ---
capeFilesInput.addEventListener('change', (e) => {

    Array.from(e.target.files).forEach(file => {

        if (!capeFilesList.some(f => f.name === file.name)) {
            capeFilesList.push(file);
        }

    });

    updatePreview(
        capesPreview,
        capeFilesList,
        "cape"
    );

    e.target.value = "";
});


// --- CREATE PREVIEW LIST ---
function updatePreview(container, files, type) {

    container.innerHTML = "";

    files.forEach((file, index) => {

        const li = document.createElement("li");

        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.gap = "10px";
        li.style.marginBottom = "10px";


        // Thumbnail
        const img = document.createElement("img");

        img.src = URL.createObjectURL(file);

        img.width = 64;
        img.height = 64;

        img.style.objectFit = "contain";
        img.style.border = "1px solid #555";
        img.style.borderRadius = "5px";


        // Filename
        const name = document.createElement("span");
        name.textContent = file.name;


        // Remove button
        const remove = document.createElement("button");

        remove.textContent = "Remove";

        remove.onclick = () => {

            files.splice(index, 1);

            updatePreview(
                container,
                files,
                type
            );

        };


        li.appendChild(img);
        li.appendChild(name);
        li.appendChild(remove);

        container.appendChild(li);

    });

}



// --- GENERATE PACK ---
generateSkinPackButton.addEventListener('click', async () => {

    console.log("Generating Skin & Cape Pack...");


    const skinFormData = new FormData();

    skinFilesList.forEach(file => {
        skinFormData.append(
            'skinFiles',
            file
        );
    });


    const capeFormData = new FormData();

    capeFilesList.forEach(file => {
        capeFormData.append(
            'capeFiles',
            file
        );
    });



    try {

        loadingElement.style.display = 'block';


        // Upload skins
        if (skinFilesList.length > 0) {

            await fetch(
                `https://osh01.oshosting.co.uk:4000/upload_skins/${userId}`,
                {
                    method: 'POST',
                    body: skinFormData
                }
            );

        }


        // Upload capes
        if (capeFilesList.length > 0) {

            await fetch(
                `https://osh01.oshosting.co.uk:4000/upload_capes/${userId}`,
                {
                    method: 'POST',
                    body: capeFormData
                }
            );

        }



        // Create pack

        const archiveResponse = await fetch(
            `https://osh01.oshosting.co.uk:4000/create_skin_pack/${userId}`
        );


        const blob = await archiveResponse.blob();


        // Download

        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = url;

        link.download =
            "ReplayCraft_SkinPack.mcpack";


        document.body.appendChild(link);

        link.click();

        link.remove();


        // Cleanup

        await fetch(
            `https://osh01.oshosting.co.uk:4000/cleanup/${userId}`
        );


    }
    catch(error) {

        console.error(error);

        alert(
            `Error: ${error.message}`
        );

    }
    finally {

        loadingElement.style.display = 'none';

    }

});
