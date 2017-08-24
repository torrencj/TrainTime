//TODO Rejigger this whole thing.
//Set up firebase to deliver the data we need to a local object and then work with it from there.
//Save our changes to the local object to firebase in a way that makes sense.

// Initialize Firebase
var config = {
  apiKey: "AIzaSyAGdf64xfL75q6PnezLLb3aZszYIqdhHyc",
  authDomain: "traintime-65569.firebaseapp.com",
  databaseURL: "https://traintime-65569.firebaseio.com",
  projectId: "traintime-65569",
  storageBucket: "",
  messagingSenderId: "10275659791"
};
firebase.initializeApp(config);

//count down the minutes until the train is due.
$(document).ready(function() {
  setInterval(update, 60000);
  // $("#save-edits").css("display","none");
})

//creating a variable to reference the database
var database = firebase.database();
var userEditData = {};

// This is triggered for each item in the database on load.
database.ref().on("child_added", function(snap) {

console.log(snap.key);
  addRow(snap.val().name,
         snap.val().dest,
         snap.val().start,
         snap.val().freq,
         snap.key);
});

function update() {
  //make all the numbers in the wait time row count down.
  //if we're boarding, change the wait time text to the frequency and start over.
  $("td#wait-time-live").each( function() {
    var temp = +$(this).text(); //NaN if this is a string...
    if (!temp) {
      $(this).text($(this).prev().text())
    } else {
      if (temp > 1) {
        $(this).text(+$(this).text() - 1);
      } else {
        $(this).text("Boarding")
      }
    }
  });
}


//Returns the difference of two dates in months, uses MomentJS
function findMinutesAway(start, freq) {
  var diff = moment().diff(moment(start, "HH:mm A"), 'minutes'); //always pos

  if (diff > 0) {
    return (diff % freq);
  } else {
    return -diff;
  }
}

// function to create the new row
function addRow(name, dest, start, freq, key) {
  // console.log("name: "+name+"dest: "+ dest+" start: "+ start+" freq: "+ freq);

  var waitTime = findMinutesAway(start, freq);

  var newRow = $("<tr>").attr("dbkey",key)
    .append( $("<td>").attr("contenteditable","true").text(name) )
    .append( $("<td>").attr("contenteditable","true").text(dest) )
    .append( $("<td>").attr("contenteditable","true").text(moment().add(waitTime, 'minutes').format("LT")) )
    .append( $("<td>").attr("contenteditable","true").text(freq) )
    .append( $("<td>").attr("contenteditable","true").text(waitTime).attr("id","wait-time-live") )
    .append( $("<button type='button' id ='remove-train' class='close' aria-label='Close'>")
      .html("<span aria-hidden='true'>&times;</span>")
);

  $("tbody").append(newRow);
};


//I stole this wholesale from http://jsbin.com/satutawipo/edit TODO steal less wholesale.
$("tbody").on("keydown", function(event) {
  // console.log("hello there!");
  var esc = event.which == 27,
      newline = event.which == 13,
      elem = event.target,
      input = elem.nodeName != 'INPUT' && elem.nodeName != 'TEXTAREA';
      // console.log(elem);


  if (input) {
    if (esc) {
      // restore state
      document.execCommand('undo'); //TODO This isn't exactly what I want. Not sure how to solve this.
      elem.blur();
    } else if (newline) {
      // save
      $("#save-edits").css("display","block");
      // userEditData[$(this).] = el.innerHTML;
      elem.blur();
      event.preventDefault();
    }
  }
});

$("#save-edits").on("click", function(){
  //TODO firebase edit
  //TODO get the <td>'s parent key attribute and then use that to edit things on firebase.
})

 // submit button to push the data up to the train table
$("#submit-button").on("click", function(event){
	event.preventDefault();

	var name = $("#name").val().trim();
	var dest = $("#dest").val().trim();
	var start = $("#start").val().trim();
	var freq = $("#freq").val();
  console.log("line 71 freq:" + freq);

  // console.log(start);
  var initialTime = moment(start, "H");

  // clear the fields
  $("#name").val('');
	$("#dest").val('');
	$("#start").val('');
	$("#freq").val('');

  // var newKey = database.ref().push().key;
  // console.log(newKey);
  var trainData = {
    "name": name,
    "dest" : dest,
    "start": start,
    "freq": freq
  };
  var newKey = database.ref().push(trainData).key;
  console.log(newKey);

});
