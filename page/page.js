import { getChunkType, getChunkSize, nextChunk, readChunkData, removeChunk } from "../utils/png-utils.js";
const fileInput = document.getElementById("file-input")
const theFilePreview = document.getElementById("the-file-preview");
const downloadButton = document.getElementById("download-button");
const processButton = document.getElementById("process-button");
const metaDataContainer = document.getElementsByClassName("metadata-container")[0];

const chunksToSkip = ["IHDR", "gAMA", "IDAT", "IEND", "PLTE"];

let arrayBuffer, byteArray, pointer;


fileInput.addEventListener("change", async function() {
  // display image and download button and remove old metadata
  const theFile = this.files[0];
  const fileURL = URL.createObjectURL(theFile);
  theFilePreview.src = fileURL;
  downloadButton.href = fileURL;
  downloadButton.hidden = false;
  processButton.hidden = false;
  metaDataContainer.innerHTML = "";

  // create data stream to read the file
  arrayBuffer = await theFile.arrayBuffer();
  byteArray = new Uint8Array(arrayBuffer);
  console.log(byteArray);
  // skip png header (first 8 bytes)
  pointer = 8;

  // iterate through png, display only unnecessary chunks in text format
  while (pointer < byteArray.length) {
    if (!chunksToSkip.includes(getChunkType(byteArray, pointer))) {
      // console.log(getChunkType(byteArray, pointer));
      // console.log(readChunkData(byteArray, pointer));
      let data = readChunkData(byteArray, pointer);
      addField(data, metaDataContainer);
      // metaDataContainer.textContent = readChunkData(byteArray, pointer);
    }
    pointer = nextChunk(byteArray, pointer);
  }
})

function addField(data, container) {
  
  const field = document.createElement("div");
  const keywordField = document.createElement("textarea");
  const valueField = document.createElement("textarea");
  const removeButton = document.createElement("button");
  const pointerReference = document.createElement("p");
  
  const [keyword, value] = data.split("\0");

  keywordField.textContent = keyword;
  valueField.textContent = value;
  removeButton.textContent = "Remove";
  pointerReference.innerHTML = pointer;
  
  field.classList.add("metadata");
  removeButton.classList.add("remove-button");
  pointerReference.classList.add("pointer-reference");

  field.appendChild(keywordField);
  field.appendChild(valueField);
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
      newByteArray = removeChunk(newByteArray, currentPointer);
    }
    const blob = new Blob([newByteArray], {type: "image/png"});
    const newFileURL = URL.createObjectURL(blob);
    console.log(blob);
    console.log(newFileURL);
    console.log(newByteArray);
    downloadButton.href = newFileURL;
  }
})