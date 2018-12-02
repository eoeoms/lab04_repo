$(document).ready(function () {

    //USER's ID
    var userid;

    //NUMBER OF WEBSITES
    var numOfItems;

    //REFERENCE TO FIREBASE DATABASE
    var rootRef = firebase.database().ref();
    
    //ARRAY OF PASSWORDS
    var passwordAr = [];
    
    //ARRAY OF UNIQUE PASSWORDS
    var uniquePwdAr = [];
    
    //ARRAY OF THE FREQUENCY OF UNIQUE PASSWORDS
    var freqAr = [];

    //TAKES USER ID FROM FIREBASE AUTHENTICATION
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            userid = user.uid;
        }
    });


    //READS VALUES FROM FIREBASE EVERYTIME PAGE LOADS
    rootRef.once("value").then(function (snapshot) {

        if (snapshot.child("users/" + userid).hasChild("numsites")) {
            numOfItems = snapshot.child("users/" + userid + "/numsites").val();
        } else {
            firebase.database().ref('users/' + userid).update({
                "numsites": 0
            });
            numOfItems = 0;
        }

        //BUILDS TABLE/WEBSITE LIST OFF OF FIREBASE INFORMATION
        if (snapshot.child("users/" + userid).hasChild("websites")) {

            //REFERENCE TO NODE
            var query = firebase.database().ref("users/" + userid + "/websites").orderByKey();
            query.once("value").then(function (snapshot) {

                snapshot.forEach(function (childSnapshot) {
                    var address = childSnapshot.child("address").val();
                    var rowID = childSnapshot.key;
                    var password = childSnapshot.child("password").val();
                    appendRow(address, rowID, password);
                    passwordAr.push(password);
                });
                passwordAr.sort();
                let prev;
                for (let i = 0; i < passwordAr.length; i++) {
                    if (passwordAr[i] !== prev) {
                        uniquePwdAr.push(passwordAr[i]);
                        freqAr.push(1);
                    } else {
                        freqAr[freqAr.length - 1]++;
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

    //SUBMIT BUTTON WORKS WITH ENTER KEY
    $("#addNewItemForm input").keyup(function (event) {
        if (event.which === 13) {
            document.getElementById("submitBtn").click();
        }
        //CLOSE POP UP IF ESC IS PRESSED
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
        } else { //validation approved

            //CLOSE POP UP
            $("#addNewItemModal").css("display", "none");

            rootRef.once("value").then(function (snapshot) {
                numOfItems = snapshot.child("users/" + userid + "/numsites").val();
            });

            //GETS ADDED ADDRESS
            let addedAddress = $("#addNewAddress").val();
            //GETS ADDED USER NAME
            let userName = $("#addNewUsername").val();
            //GETS ADDED PASSWORD
            let password = $("#addNewPwd").val();

            //LABELS THE INDEX OF THE WEBSITE
            let websiteNum = "website" + numOfItems;
            //NUMBER OF ITEMS
            let NewNumOfItems = numOfItems + 1;

            //BUILDS DATABASE NODES
            firebase.database().ref('users/' + userid + '/websites/' + websiteNum).set({
                "address": addedAddress,
                "userName": userName,
                "password": password

            });

            //UPDATES NUMBER OF SITES NODE
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
        firebase.auth().signOut().then(function () {
            window.location.href = "./safestoreV2.html";
        }).catch(function (error) {
            // An error happened.
        });
    });



    //APPENDS NEW TABLE ROW
    function appendRow(str1, str2, str3) {

        //SHOWS NO ITEMS AVAILABLE MESSAGE
        $("#noItems").css("display", "none"); 
        //SHOWS TABLE
        $("#storedWebsites").css("display", "table");
        let address = str1;
        let rowID = str2;
        let password = str3;
        let path = "";
        let strengthString = "";

        let tr = $("<tr></tr>");
        tr.attr("id", rowID);
        $("tbody").append(tr);

        //FIRST TD: WEBSITE ADDRESS
        let td1 = $("<td></td>");
        td1.addClass("address");
        td1.text(address);

        //SECOND TD: STRENGTH BAR (ICON)
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

        //THIRD TD: STRENGTH INDICATOR (STRING)
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

        //FOURTH TD: REMOVE WEBSITE ICON
        let td4 = $("<td></td>");
        td4.addClass("removeIcon");
        let removeIcon = $("<i></i>");
        removeIcon.addClass("fas fa-trash-alt");
        td4.append(removeIcon);

        tr.append(td1, td2, td3, td4);

        //REMOVE ICON EVENT LISTENER
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

    //TELLS THEM DETAILS OF PASSWORDS
    function constructDetails() {
        freqAr.forEach(checkPwdFreq);
        if (detailsText == "") {
            detailsText = "<p>All passwords are unique. Good job!</p>"
        }
        let text = $("<div></div>");
        text.html(detailsText);
        $("#detailsPanel").append(text);
    }

    //CHECKS PASSWORDS
    function checkPwdFreq(value, index, array) {
        let frequency = value;
        if (frequency > 1) {
            detailsText += "<p>Password \"" + uniquePwdAr[index] + "\" is used for " + value + " different websites.</p>"
        }
    }
});