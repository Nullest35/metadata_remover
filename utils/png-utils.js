
function getChunkType(byteArray, pointer) {
  return(String.fromCharCode(byteArray[pointer + 4], byteArray[pointer + 5], byteArray[pointer + 6], byteArray[pointer + 7]));
}

function getChunkSize(byteArray, pointer) {
  return getChunkLength(byteArray, pointer) + 4 * 3;
}

function getChunkLength(byteArray, pointer) {
  return (Math.pow(2, 8 * 3) * byteArray[pointer] + Math.pow(2, 8 * 2) * byteArray[pointer + 1] + Math.pow(2, 8) * byteArray[pointer + 2] + byteArray[pointer + 3]);
}

function nextChunk(byteArray, pointer) {
  return pointer + getChunkSize(byteArray, pointer);
}

function readChunkData(byteArray, pointer) {
  let str = "";
  const length = getChunkLength(byteArray, pointer);
  pointer = pointer + 8;

  for (let i = 0; i < length; i++) {
    // console.log(byteArray[pointer + i]);
    // console.log(String.fromCharCode(byteArray[pointer + i]));
    // str.concat(String.fromCharCode(byteArray[pointer + i]));
    str += String.fromCharCode(byteArray[pointer + i]);
  }
  return str;
}

function removeChunk(byteArray, pointer) {
  const normalArray = Array.from(byteArray);
  normalArray.splice(pointer, getChunkSize(byteArray, pointer));
  return new Uint8Array(normalArray);
}

function editChunk() {

}

function removeField() {

}

function getFields(chunkData) {

}

function editField() {

}



export {getChunkType, getChunkSize, nextChunk, readChunkData, removeChunk}