$(document).ready(function () {
    
    //IF NO STORED PASSWORDS, DISPLAY MESSAGE
    checkItems();

    function checkItems() {
        if (!document.getElementById("tbody").hasChildNodes()) {
            $("#storedWebsites").css("display", "none");
            $("#noItems").css("display", "block");
        }
    }
    
    //SEARCH BAR
    $("#searchBar").click(function () {
        alert("Not ready yet.");
    });
    
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
    
});