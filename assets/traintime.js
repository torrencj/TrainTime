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

// database.ref().on("child_removed", function(snap) {
//
// });

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

  var waitTime = findMinutesAway(start, freq);
  var newRow = $("<tr>").attr("id",key)
    .append( $("<td>").attr("contenteditable","true").attr("id", "name").text(name).data({"name":name}) )
    .append( $("<td>").attr("contenteditable","true").attr("id", "dest").text(dest).data({"dest":dest}) )
    .append( $("<td>").attr("contenteditable","true").attr("id", "start").text(start).data({"start":start}) )
    .append( $("<td>").text(moment().add(waitTime, 'minutes').format("LT")) )
    .append( $("<td>").attr("contenteditable","true").attr("id", "freq").text(freq).data({"freq":freq}) )
    .append( $("<td>").text(waitTime).attr("id","wait-time-live") )
    .append( $("<button type='button' id ='remove-train' class='close' aria-label='Close'>")
      .html("<span id= 'remove-train' aria-hidden='true'>&times;</span>")
);

  $("tbody").append(newRow);
};

//I stole this wholesale from http://jsbin.com/satutawipo/edit TODO steal less wholesale.
$("tbody").on("keydown", function(event) {
  var elem = $(event.target);
  if ($(event.target).attr("contenteditable") == "true") {
    // console.log("true");

    var esc = event.which == 27,
        newline = event.which == 13,
        input = elem.nodeName != 'INPUT' && elem.nodeName != 'TEXTAREA';
    var currentCell = elem.attr("id");
    var currentData = elem.data();

    if (input) {
      if (esc) {
        // restore state
        elem.text(currentData[currentCell]);
        elem.blur();
      } else if (newline) {
        // save
        userEditData[currentCell] = elem.text();

        console.log("User edit: ");
        console.log(userEditData);

        database.ref(elem.parent().attr("id")).update(userEditData);

        elem.blur();
        event.preventDefault();
      }
    }
  }
});

$("#save-edits").on("click", function(){
  $("#save-edits").css("display","none");
//TODO Not using this. Updates are immediate.
})

$(document, "#remove-train").on("click", function(event){
  if ($(event.target).attr("id") == "remove-train") {
    // $(event.target).
    // console.log($(event.target).parents("tr").attr("id"));
    //figure out which row we're in and get the database key for it from the ID.
    var currentTrain = $(event.target).parents("tr").attr("id");
    database.ref(currentTrain).remove();
    $(event.target).parents("tr").css("display", "none")
  }
});



 // submit button to push the data up to the train table
$("#submit-button").on("click", function(event){
  console.log("SUBMITTING");
	event.preventDefault();

	var name = $("#name-input").val().trim();
	var dest = $("#dest-input").val().trim();
	var start = $("#start-input").val().trim();
	var freq = $("#freq-input").val();
  console.log(name + dest + start + freq);
  if (name && dest && start && freq) {


    // console.log(name);
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
}

});
