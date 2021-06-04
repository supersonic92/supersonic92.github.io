const comenzar = document.querySelector("#button--comenzar");
const grabar = document.querySelector("#button--grabar");
const finalizar = document.querySelector("#button--finalizar");
const subir = document.querySelector("#button--subirGifo");
const repetir = document.querySelector("#repeatShot");
let recording = false;

const uploadEndpoint =
  "http://upload.giphy.com/v1/gifs?api_key=wUIs2kykDiUjqc9ljNRoH97ddpN05IwD";

//show recorded gif
function mostrarPreview({ id }) {
  const containerVideo = document.querySelector(
    ".crearGif__recordingZone__content"
  );
  containerVideo.innerHTML = `<img class='preview' data-id='${id}'  src='https://i.giphy.com/${id}.gif' />`;
}

//upload gif
subir.addEventListener("click", function (ev) {
  const actualPreviewId = document
    .querySelector(".preview")
    .getAttribute("data-id");
  const misGifos = JSON.parse(localStorage.getItem("misGifos")) || [];
  misGifos.push({
    id: actualPreviewId,
    url: `https://i.giphy.com/${actualPreviewId}.gif`,
    title: actualPreviewId,
    username: actualPreviewId,
  });
  localStorage.setItem("misGifos", JSON.stringify(misGifos));
});

// fetch upload endpoint
async function uploadGif(formData) {
  const response = await fetch(uploadEndpoint, {
    method: "POST",
    body: formData,
  });

  return response.json();
}

const startVideo = () => {
  const containerVideo = document.querySelector(
    ".crearGif__recordingZone__content"
  );
  containerVideo.innerHTML = "<video>";
  comenzar.style.display = "none";
  grabar.style.display = "block";
  document.querySelector("#step-1").style.background = "#572EE5";
  document.querySelector("#step-1").style.color = "#FFFFFF";
};

function stopStreamedVideo(videoElem) {
  const stream = videoElem.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach(function (track) {
    track.stop();
  });
  videoElem.srcObject = null;
}

function getStreamAndRecord() {
  startVideo();
  const video = document.querySelector("video");
  video.style.height = "250px";
  video.style.width = "350px";
  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: {
        height: { max: 240 },
      },
    })
    .then(function (stream) {
      video.srcObject = stream;
      video.play();

      const recorder = RecordRTC(stream, {
        type: "gif", // audio or video or gif or canvas
        frameRate: 0.5,
        quality: 10,
        width: 360,
        hidden: 240,
        onGifRecordingStarted: function () {
          console.log("started");
        },
      });

      grabar.addEventListener("click", function () {
        alert(
          "¿Nos das acceso a tu cámara? - El acceso a tu camara será válido sólo por el tiempo en el que estés creando el GIFO"
        );
        grabar.style.display = "none";
        finalizar.style.display = "block";
        document.querySelector("#step-1").style.background = "#FFFFFF";
        document.querySelector("#step-1").style.color = "#572EE5";
        document.querySelector("#step-2").style.background = "#572EE5";
        document.querySelector("#step-2").style.color = "#FFFFFF";
        recording = true;
        timeRecord();
        recorder.startRecording();
      });
      finalizar.addEventListener("click", function stopRecording() {
        recorder.stopRecording(async function () {
          const blob = this.blob;
          console.log("end");
          let form = new FormData();
          form.append("file", recorder.getBlob(), "myGif.gif");
          finalizar.style.display = "none";
          const { data: gifData } = await uploadGif(form);
          subir.style.display = "block";
          repetir.style.display = "flex";
          repetir.innerHTML = "REPETIR CAPTURA";
          document.querySelector("#step-2").style.background = "#FFFFFF";
          document.querySelector("#step-2").style.color = "#572EE5";
          document.querySelector("#step-3").style.background = "#572EE5";
          document.querySelector("#step-3").style.color = "#FFFFFF";
          recording = false;
          mostrarPreview(gifData);
          stopStreamedVideo(video);
        });
      });
    });
}

function timeRecord() {
  let seconds = 0;
  let minute = 0;
  let timer = setInterval(() => {
    if (recording === true) {
      if (seconds < 60) {
        if (seconds <= 9) {
          seconds = "0" + seconds;
        }
        repetir.style.display = "flex";
        repetir.innerHTML = `00:00:0${minute}:${seconds}`;
        seconds++;
      } else {
        minute++;
        seconds = 0;
      }
    } else {
      clearInterval(timer);
    }
  }, 1000);
}

comenzar.addEventListener("click", getStreamAndRecord);
repetir.addEventListener("click", (ev) => {
  location.reload();
  startVideo();
});
