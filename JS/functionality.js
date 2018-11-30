$(document).ready(function () {

    var userid;
    var numOfItems;
    var rootRef = firebase.database().ref();
    var passwordAr = [];
    var uniquePwdAr = [];
    var freqAr = [];
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            userid = user.uid;
        }
    });

    
    //reading values from database every time website loads
    rootRef.once("value").then(function (snapshot) {
        
        if (snapshot.child("users/" + userid).hasChild("numsites")) {
            numOfItems = snapshot.child("users/" + userid + "/numsites").val();
        } else {
            firebase.database().ref('users/' + userid).update({
                "numsites": 0
            });
            numOfItems = 0;
        }
        
        //builds table off of database
        if (snapshot.child("users/" + userid).hasChild("websites")) {
            
            var query = firebase.database().ref("users/" + userid + "/websites").orderByKey();
            query.once("value").then(function(snapshot) {
                
                snapshot.forEach(function(childSnapshot) {
                    var address = childSnapshot.child("address").val();
                    var rowID = childSnapshot.key;
                    var password = childSnapshot.child("password").val();
                    appendRow(address, rowID, password);
                    passwordAr.push(password);
                });
                passwordAr.sort();
                let prev;
                for( let i = 0; i < passwordAr.length; i++){
                    if (passwordAr[i] !== prev) {
                        uniquePwdAr.push(passwordAr[i]);
                        freqAr.push(1);
                    } else {
                        freqAr[freqAr.length-1]++;
                    }
                    prev = passwordAr[i];
                }
                constructDetails();
                
            });
        }
    });
    

    //IF NO STORED PASSWORDS, DISPLAY MESSAGE
    checkItems();

    function checkItems() {
        if (!document.getElementById("tbody").hasChildNodes()) {
            $("#storedWebsites").css("display", "none");
            $("#noItems").css("display", "block");
        }
    }

    //ADD NEW PASSWORD POP-UP
    $("#addNewIcon").click(function () {
        $("#addNewItemModal").css("display", "block");
        $("#addNewAddress").focus(); //focuses on first input field
    });

    //triggers submit button when Enter key is pressed inside any input fields
    $("#addNewItemForm input").keyup(function (event) {
        if (event.which === 13) {
            document.getElementById("submitBtn").click();
        }
        //close pop-up if esc pressed
        if (event.which === 27) {
            $("#addNewItemModal").css("display", "none");
        }
    });

    //CLOSE ADD MENU
    $("#closeBtn").click(function () {
        $("#addNewItemModal").css("display", "none");
    });

    //SUBMIT BUTTON ON ADD MENU
    //to add lots of table rows fast, comment out line 76 to 80, and line 114
    $("#submitBtn").click(function (event) {
        event.preventDefault();
        if ($("#addNewAddress").val().length == 0) {
            $("#validation > p").text("Website address should be longer.")
        } else if ($("#addNewPwd").val() == "" || $("#addNewPwd").val() != $("#addNewConfirm").val()) {
            $("#validation > p").text("Passwords must match.")
        } else {    //validation approved
            
            $("#addNewItemModal").css("display", "none"); //close pop-up
            
            rootRef.once("value").then(function (snapshot) {
                numOfItems = snapshot.child("users/" + userid + "/numsites").val();
            });
            
            let addedAddress = $("#addNewAddress").val(); //get added address
            let userName = $("#addNewUsername").val();
            let password = $("#addNewPwd").val();
            
            let websiteNum = "website" + numOfItems;
            let NewNumOfItems = numOfItems + 1;
            
            firebase.database().ref('users/' + userid + '/websites/' + websiteNum).set({
                "address": addedAddress,
                "userName": userName,
                "password": password
                
            });
            
            firebase.database().ref('users/' + userid).update({
                "numsites": NewNumOfItems
            });

            location.reload();
            /*
            this is now unnecessary since page reloads once you've pressed submit
            //clear fields
            $("#addNewAddress").val("");
            $("#addNewUsername").val("");
            $("#addNewPwd").val("");
            $("#addNewConfirm").val("");
            $("#validation > p").text("");
            
            //append row to table
            appendRow(addedAddress, websiteNum, password);
            */
        }
    });

    //EXPAND AND COLLAPSE DETAILS
    $("#detailsBar").click(function () {
        if ($("#detailsBar").css("bottom") == "-2px") {
            $("#detailsBar").animate({
                bottom: "298px"
            }, 300);
            $("#detailsPanel").slideDown(300, function () {
                $("#detailsBar i").attr("class", "fas fa-angle-down");
            });
        } else if ($("#detailsBar").css("bottom") == "298px") {
            $("#detailsBar").animate({
                bottom: "-2px"
            }, 300);
            $("#detailsPanel").slideUp(300, function () {
                $("#detailsBar i").attr("class", "fas fa-angle-up");
            });
        }
    });

    //LOG OUT
    $("#logOut").click(function () {
        firebase.auth().signOut().then(function() {
            window.location.href = "./safestoreV2.html";
          }).catch(function(error) {
            // An error happened.
          });
    });
    
    
    
    //appending new table row
    function appendRow (str1, str2, str3) {
        $("#noItems").css("display", "none"); //don't show no item message
        $("#storedWebsites").css("display", "table"); //show table
        let address = str1;
        let rowID = str2;
        let password = str3;
        let path = "";
        let strengthString = "";
        
        let tr = $("<tr></tr>");
        tr.attr("id", rowID);
        $("tbody").append(tr);

        //first td: website address
        let td1 = $("<td></td>");
        td1.addClass("address");
        td1.text(address);

        //second td: strength bar
        let td2 = $("<td></td>");
        td2.addClass("strength");
        td2.text("Strength: ");
        let barImage = $("<img>");
        if (password.length < 8) {
            path = "./Images/Red.png"
        } else if (password.length == 8) {
            path = "./Images/Yellow.png"
        } else {
            path = "./Images/Green.jpg"
        }
        barImage.attr("src", path);
        td2.append(barImage);

        //third td: strength in words
        let td3 = $("<td></td>");
        td3.addClass("strengthString");
        if (password.length < 8) {
            strengthString = "Weak"
        } else if (password.length == 8) {
            strengthString = "Moderate"
        } else {
            strengthString = "Strong"
        }
        td3.text(strengthString);
        
        //fourth td: remove icon
        let td4 = $("<td></td>");
        td4.addClass("removeIcon");
        let removeIcon = $("<i></i>");
        removeIcon.addClass("fas fa-trash-alt");
        td4.append(removeIcon);

        tr.append(td1, td2, td3, td4);

        //add event listener on remove icon
        removeIcon.click(function () {
            let item = $(this).parent().parent().children("td.address").text();
            if (confirm("Would you like to remove the stored password for \"" + item + "\"?")) {
                
                //remove from database
                firebase.database().ref("users/" + userid + "/websites/" + rowID).remove();
                
                location.reload();
                /* 
                this is now unnecessary since page reloads when you remove something
                $(this).parent().parent().remove();
                checkItems(); //check if all removed
                */
            }
        });
    }
    var detailsText = "";
    function constructDetails() {
        freqAr.forEach(checkPwdFreq);
        if (detailsText == "") {
            detailsText = "<p>All passwords are unique. Good job!</p>"
        }
        let text = $("<div></div>");
        text.html(detailsText);
        $("#detailsPanel").append(text);
    }
    //check passwords
    function checkPwdFreq(value, index, array) {
        let frequency = value;
        if (frequency > 1) {
            detailsText += "<p>Password \"" + uniquePwdAr[index] + "\" is used for " + value + " different websites.</p>"
        }
    }
});