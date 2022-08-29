const mediaSelector = document.getElementById("media");
let selectedMedia = "audio";
let chunks = [];

const audioMediaConstraints = {
    audio: true,
};

function startRecording() {
    document.getElementById('stopRecord').style.display = "block"
    document.getElementById(`modalBody`).innerHTML = "Enregistrement en cours..."
    document.getElementById(`containerForm`).innerHTML = ""
    navigator.mediaDevices.getUserMedia(audioMediaConstraints)
        .then((mediaStream) => {
            const mediaRecorder = new MediaRecorder(mediaStream);
            window.mediaStream = mediaStream;
            window.mediaRecorder = mediaRecorder;
            mediaRecorder.start();
            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(
                    chunks, {
                    type: "audio/mp3"
                });
                chunks = [];
                initFormModal(blob)

            };
        });
}

function initFormModal(media){
    document.getElementById('stopRecord').style.display = "none"
    document.getElementById(`modalBody`).innerHTML = ""
    const recordedMedia = document.createElement("audio");
    recordedMedia.controls = true;
    const recordedMediaURL = URL.createObjectURL(media);
    recordedMedia.src = recordedMediaURL;
    document.getElementById(`modalBody`).append(recordedMedia);
    let form = document.createElement("form")
    form.enctype = "multipart/form-data"
    form.method = 'POST'
    form.action = "/sendsoundapi"
    let labelName = document.createElement('label')
    labelName.for = "inputName"
    labelName.innerText = "Veuillez entrer un nom pour votre fichier"
    let inputName = document.createElement('input')
    inputName.type = "text"
    inputName.id = 'inputName'
    inputName.name = "user_reference"
    inputName.required = "required"
    let inputFile = document.createElement('input')
    inputFile.style.display = 'none'
    inputFile.type = 'file'
    inputFile.name = "file"
    let file = new File([media], Date.now() + ".mp3",{type:"audio/mp3", lastModified:new Date().getTime()});
    let container = new DataTransfer();
    container.items.add(file);
    inputFile.files = container.files;
    let submit = document.createElement('button')
    submit.type = 'submit'
    submit.classList.add('btn', 'btn-primary')
    submit.innerText = "Importer l'enregistrement"
    form.append(labelName, inputName, inputFile, submit)
    document.getElementById(`containerForm`).append(form)
}

function stopRecording() {
    window.mediaRecorder.stop();
    window.mediaStream.getTracks()
        .forEach((track) => {
            track.stop();
        });
    document.getElementById(`modalBody`).innerHTML = "";
}
document.querySelector('#soundModal').addEventListener('hide.bs.modal', function ( ) {
    stopRecording()
    document.getElementById(`modalBody`).innerHTML = "";
})