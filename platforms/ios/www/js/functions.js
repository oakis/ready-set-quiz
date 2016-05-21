// Dev variables

//var serverUrl = 'http://localhost'; // dev
var serverUrl = 'http://37.139.10.122'; // live

// Functions

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function error (err) {
  console.log('Error: '+err.data);
}