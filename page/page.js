import * as PNG from "../utils/png-utils.js";
import * as JPEG from "../utils/jpeg-utils.js";

const fileInput = document.getElementById("file-input")
const theFilePreview = document.getElementById("the-file-preview");
const downloadButton = document.getElementById("download-button");
const processButton = document.getElementById("process-button");
const metaDataContainer = document.getElementsByClassName("metadata-container")[0];

const pngChunksToHide = ["IHDR", "gAMA", "IDAT", "IEND", "PLTE"];
const jpegChunksToHide = [0xFFD8, 0xFFD9, 0xFF01, 0xFFDA,
                          0xFFD0, 0xFFD1, 0xFFD2, 0xFFD3, 0xFFD4, 0xFFD5, 0xFFD6, 0xFFD7,
                          0xFFC0, 0xFFC1, 0xFFC2, 0xFFC3, 0xFFC5, 0xFFC6, 0xFFC7, 0xFFC9,
                          0xFFCA, 0xFFCB, 0xFFCD, 0xFFCE, 0xFFCF,
                          0xFFC4, 0xFFDB, 0xFFDD, 0xFFCC, 0xFFDE, 0xFFDF];

let theFile, fileURL, arrayBuffer, byteArray, pointer, fileType;


fileInput.addEventListener("change", async function() {

  // display image and download button and remove old metadata
  theFile = this.files[0];
  fileURL = URL.createObjectURL(theFile);
  theFilePreview.src = fileURL;
  downloadButton.href = fileURL;
  downloadButton.hidden = false;
  processButton.hidden = false;
  metaDataContainer.innerHTML = "";

  // create data stream to read the file
  arrayBuffer = await theFile.arrayBuffer();
  byteArray = new Uint8Array(arrayBuffer);
  console.log(byteArray);

  prepareFile();

  displayFields();
})

function addField(data, container) {
  
  const field = document.createElement("div");
  const fieldData = document.createElement("textarea");
  // const keywordField = document.createElement("textarea");
  // const valueField = document.createElement("textarea");
  const removeButton = document.createElement("button");
  const pointerReference = document.createElement("p");
  
  // const [keyword, value] = data.split("\0");

  // keywordField.textContent = keyword;
  // valueField.textContent = value;
  removeButton.textContent = "Remove";
  pointerReference.innerHTML = pointer;

  fieldData.textContent = data;
  
  field.classList.add("metadata");
  removeButton.classList.add("remove-button");
  pointerReference.classList.add("pointer-reference");
  // pointerReference.hidden = true;

  field.appendChild(fieldData);
  // field.appendChild(keywordField);
  // field.appendChild(valueField);
  field.appendChild(removeButton);
  field.appendChild(pointerReference);

  container.appendChild(field);
}

// remove button clicked -> mark chunk to be removed
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("remove-button")) {
    const parent = e.target.parentElement;
    parent.classList.add("to-be-removed");
  }
})

processButton.addEventListener("click", function () {
  const toBeRemoved = document.getElementsByClassName("to-be-removed");
  if (toBeRemoved.length) {
    let newByteArray = byteArray;
    for (let i = toBeRemoved.length - 1; i >= 0; i--) {
      let currentPointer = parseInt(toBeRemoved[i].lastChild.textContent);
      if (fileType == "png") {
        newByteArray = PNG.removeChunk(newByteArray, currentPointer);
      }
      else if (fileType == "jpeg") {
        newByteArray = JPEG.removeChunk(newByteArray, currentPointer);
      }
    }
    const blob = new Blob([newByteArray], {type: `image/${fileType}`});
    const newFileURL = URL.createObjectURL(blob);
    console.log(blob);
    console.log(newFileURL);
    console.log(newByteArray);
    downloadButton.href = newFileURL;
  }
})

function prepareFile() {
  // stronger type check should be performed (MIME type / extension is not enough, at least add signature)
  if (theFile.type == "image/png") {
    fileType = "png";
    pointer = 8;
  }
  else if (theFile.type == "image/jpeg") {
    fileType = "jpeg";
    pointer = 2;
  }
}

function displayFields() {
  if (fileType == "png") {
    while (pointer < byteArray.length) {
      if (!pngChunksToHide.includes(PNG.getChunkType(byteArray, pointer))) {
        let data = PNG.readChunkData(byteArray, pointer);
        addField(data, metaDataContainer);
      }
      pointer = PNG.nextChunk(byteArray, pointer);
    }
  }
  else if (fileType == "jpeg") {
    while (pointer < byteArray.length) {
      if (!jpegChunksToHide.includes(JPEG.getChunkType(byteArray, pointer))) {
        console.log(JPEG.getChunkType(byteArray, pointer));
        let data = JPEG.readChunkData(byteArray, pointer);
        addField(data, metaDataContainer);
      }
      // if it is Start of Scan segment, break because no metadata can be found after it (and dealing with actual pixel data is another hassle)
      else if (JPEG.getChunkType(byteArray, pointer) == 0xFFDA) {
        break;
      }
      pointer = JPEG.nextChunk(byteArray, pointer);
    }
  }
}