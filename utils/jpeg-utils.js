function getChunkType(byteArray, pointer) {
  return((byteArray[pointer] << 8) | byteArray[pointer + 1]);
}

function getChunkSize(byteArray, pointer) {
  return getChunkLength(byteArray, pointer) + 2;
}

function getChunkLength(byteArray, pointer) {
  const zeroLengthChunks = [0xFFD8, 0xFFD9, 0xFF01, 0xFFD0, 0xFFD1, 0xFFD2, 0xFFD3, 0xFFD4, 0xFFD5, 0xFFD6, 0xFFD7];
  
  if (zeroLengthChunks.includes(getChunkType(byteArray, pointer))) {
    return 0;
  }
  else {
    return ((byteArray[pointer + 2] << 8) | byteArray[pointer + 3]);
  }
}

function nextChunk(byteArray, pointer) {
  return pointer + getChunkSize(byteArray, pointer);
}

function readChunkData(byteArray, pointer) {
  let str = "";
  // chunk length (actual data) starts 2 bytes after the chunk pointer
  const length = getChunkLength(byteArray, pointer);
  pointer = pointer + 2;
  
  for (let i = 0; i < length; i++) {
    let byte = byteArray[pointer + i];
    if (!(byte >= 32 && byte <= 126)) {
      byte += 48;
    }
    str += String.fromCharCode(byte);
  }
  return str;
}

function removeChunk(byteArray, pointer) {
  const normalArray = Array.from(byteArray);
  normalArray.splice(pointer, getChunkSize(byteArray, pointer));
  return new Uint8Array(normalArray);
}


export {getChunkType, getChunkSize, nextChunk, readChunkData, removeChunk}